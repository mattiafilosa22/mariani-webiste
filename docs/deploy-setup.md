# Deploy — configurazione (Plesk + Cloudflare + GitHub Actions + webhook WP)

Pipeline: modifica in WordPress → webhook `repository_dispatch` → GitHub Actions builda
l'export statico → `rsync` SSH sul Plesk → purge cache Cloudflare.

Finché il sito non è approvato, la CI pubblica **solo** su `preview.mariani-auto.it`
(protetto da password). Il dominio serve la coming soon. Al go-live si sposta la
document root del dominio sulla cartella di `preview`: nessun file da copiare.

## 1. Host e cartelle

| Host | Document root (Plesk) | Contenuto |
|---|---|---|
| `mariani-auto.it` + `www` | `httpdocs` | coming soon (`coming-soon/` del repo), pubblica |
| `preview.mariani-auto.it` | `preview.mariani-auto.it` | export Next, protetto da htpasswd — **target della CI** |
| `cms.mariani-auto.it` | `cms.mariani-auto.it` | WordPress headless |

Server Plesk: `37.156.244.12` (`web.saturno.vhosting-it.com`).

## 2. GitHub Secrets (Settings → Secrets and variables → Actions)

| Secret | Valore |
|---|---|
| `WP_API_URL` | `https://cms.mariani-auto.it/wp-json/mariani/v1` — usato a build time **e** esposto al browser (`NEXT_PUBLIC_WP_API_URL`) per il POST `/lead` |
| `SITE_URL` | `https://mariani-auto.it` — canonical, sitemap, hreflang, OG. Resta il dominio finale anche mentre si pubblica su `preview` |
| `VHOSTING_SSH_HOST` | host SSH del Plesk |
| `VHOSTING_SSH_PORT` | `22` |
| `VHOSTING_SSH_USER` | utente di sistema dell'abbonamento Plesk |
| `VHOSTING_SSH_KEY` | chiave privata SSH dedicata |
| `VHOSTING_REMOTE_PATH` | document root di `preview` (es. `/var/www/vhosts/mariani-auto.it/preview.mariani-auto.it/`) |
| `CLOUDFLARE_ZONE_ID` | zona `mariani-auto.it` |
| `CLOUDFLARE_API_TOKEN` | token con permesso *Cache Purge* |

I segreti stanno SOLO nei GitHub Secrets. Mai nel repo, mai in `wp-config` versionato.

## 3. Chiave SSH per la CI

```bash
ssh-keygen -t ed25519 -f deploy_mariani -C "gh-actions-deploy"
```

1. In Plesk: `Siti Web e Domini` → *Accesso SSH* → abilita la shell per l'utente di sistema.
2. Aggiungi `deploy_mariani.pub` alle `authorized_keys` di quell'utente (`~/.ssh/authorized_keys`, permessi `700` sulla cartella e `600` sul file).
3. Metti la chiave privata in `VHOSTING_SSH_KEY`.

Verifica prima di lanciare la pipeline:

```bash
ssh -i deploy_mariani -p 22 <utente>@37.156.244.12 'ls -la'
```

## 4. Costanti WordPress (in `wp-config.php` sul server, NON versionato)

Vedi `cms/config/wp-config-snippet.php`:

```php
define( 'MARIANI_GH_REPO',  'mattiafilosa22/mariani-webiste' );
define( 'MARIANI_GH_TOKEN', '***PAT con scope repo/dispatch***' );
define( 'MARIANI_SITE_URL', 'https://mariani-auto.it' );
define( 'MARIANI_ALLOWED_ORIGINS', 'https://mariani-auto.it,https://www.mariani-auto.it,https://preview.mariani-auto.it' );
```

- `MARIANI_GH_*`: il webhook (`mariani-core/webhook`) invia `repository_dispatch` con
  event type `wp-content-updated`, debounce 120s.
- `MARIANI_SITE_URL`: il CMS non ha frontend — ogni richiesta di navigazione su `cms.`
  viene deviata qui (`security/HeadlessGuard.php`).
- `MARIANI_ALLOWED_ORIGINS`: whitelist CORS per il POST `/lead`
  (`rest/Support/Cors.php`). Senza, il browser blocca il form contatti.

## 5. DNS / Cloudflare

Zona su Cloudflare (NS `anita`/`yoxall.ns.cloudflare.com`), TTL 300.

| Record | Valore | Proxy |
|---|---|---|
| `mariani-auto.it` A | `37.156.244.12` | grigio (arancione dopo il go-live) |
| `www` CNAME | `mariani-auto.it` | segue l'apex |
| `cms` A | `37.156.244.12` | **grigio sempre**: evita che l'API venga cachata a build time |
| `preview` A | `37.156.244.12` | grigio |
| `mail` A / `MX` | `185.116.60.222` | **da non toccare mai**: la posta vive sul vecchio host |

L'SSH del deploy non passa dal proxy Cloudflare: usare l'IP diretto nei secret.

## 6. Certificati

Let's Encrypt da Plesk su `mariani-auto.it` (+`www`), `cms` e `preview`, poi
*Reindirizza da HTTP a HTTPS* nelle impostazioni di hosting dei tre host.
La validazione HTTP-01 richiede record **grigi**: emettere prima di accendere il proxy.

## 7. Manutenzione di WordPress (aggiornamenti)

Gli aggiornamenti automatici sono disattivati e `DISALLOW_FILE_MODS` blocca
installazioni e aggiornamenti dalla dashboard, **per chiunque**, amministratori
compresi: il back-office non ha più i pulsanti di aggiornamento.

Un aggiornamento rotto non romperebbe solo il CMS — il frontend viene ricostruito
da quelle API, quindi si porterebbe dietro il sito pubblico. Per questo si
aggiorna a mano, con backup e verifica.

Procedura, via SSH:

```bash
WP="/opt/plesk/php/8.4/bin/php /usr/local/bin/wp"
DOC=~/cms.mariani-auto.it

# 1. Backup di database e file (o snapshot da Plesk)
$WP db export ~/backup-$(date +%F).sql --path="$DOC"

# 2. Cosa c'è da aggiornare
$WP core check-update --path="$DOC"
$WP plugin list --fields=name,version,update --path="$DOC"

# 3. Sbloccare temporaneamente le modifiche ai file
$WP config delete DISALLOW_FILE_MODS --path="$DOC"

# 4. Aggiornare
$WP plugin update --all --path="$DOC"
$WP core update --path="$DOC"

# 5. Richiudere SUBITO
$WP config set DISALLOW_FILE_MODS true --raw --type=constant --path="$DOC"

# 6. Verificare che le API rispondano, poi ricostruire il sito
curl -sI https://cms.mariani-auto.it/wp-json/mariani/v1/autos | head -1
gh workflow run deploy.yml
```

Il passo 5 non è opzionale: se resta sbloccato, la protezione esiste solo finché
nessuno apre la dashboard.

## 8. Go-live

1. Plesk: *Root del documento* di `mariani-auto.it` → cartella di `preview`.
2. Rimuovere la protezione directory.
3. Cloudflare: proxy arancione su `@` e `www`.

Nessuna modifica DNS, quindi nessun rischio per la posta. Reversibile in un minuto.
