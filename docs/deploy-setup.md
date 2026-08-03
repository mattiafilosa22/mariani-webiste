# Deploy — configurazione (Plesk + Cloudflare + GitHub Actions + webhook WP)

Pipeline: modifica in WordPress → webhook `repository_dispatch` → GitHub Actions builda
l'export statico e lo pubblica come release → il server lo scarica da solo
(`scripts/pull-deploy.sh`, ogni 5 minuti) → purge cache Cloudflare.

**Il deploy è in pull, non in push.** Il firewall di VHosting blocca a intermittenza
le connessioni SSH in ingresso dai runner GitHub — `rsync` falliva a giorni alterni,
con "Operation timed out" mentre la stessa chiave funzionava da altre reti. Invertendo
il verso, è il server a uscire verso GitHub: nessuna connessione entrante da
autorizzare, nessun ban da rincorrere.

Finché il sito non è approvato, la CI pubblica **solo** su `preview.mariani-auto.it`
(protetto da password). Il dominio serve la coming soon. Al go-live si sposta la
document root del dominio sulla cartella di `preview`: nessun file da copiare.

## 1. Host e cartelle

| Host | Document root (Plesk) | Contenuto |
|---|---|---|
| `mariani-auto.it` + `www` | `httpdocs` | coming soon (`coming-soon/` del repo), pubblica |
| `preview.mariani-auto.it` | `preview.mariani-auto.it` | export Next, protetto da password — installato da `pull-deploy.sh` |
| `cms.mariani-auto.it` | `cms.mariani-auto.it` | WordPress headless |

Server Plesk: `37.156.244.12` (`web.saturno.vhosting-it.com`).

## 2. GitHub Secrets (Settings → Secrets and variables → Actions)

| Secret | Valore |
|---|---|
| `WP_API_URL` | `https://cms.mariani-auto.it/wp-json/mariani/v1` — usato a build time **e** esposto al browser (`NEXT_PUBLIC_WP_API_URL`) per il POST `/lead` |
| `SITE_URL` | `https://mariani-auto.it` — canonical, sitemap, hreflang, OG. Resta il dominio finale anche mentre si pubblica su `preview` |
| ~~`VHOSTING_SSH_*`~~ | non più usati: il deploy non entra più via SSH |

Le credenziali Cloudflare per il purge stanno ora sul server, in `~/.mariani-deploy.conf`.

I segreti stanno SOLO nei GitHub Secrets. Mai nel repo, mai in `wp-config` versionato.

## 3. Deploy in pull (server → GitHub)

La CI pubblica `site.tar.gz` + `site.tar.gz.sha256` nella release **`site-latest`**,
un tag mobile sempre sovrascritto: l'URL di download è quindi stabile.

Sul server, `~/pull-deploy.sh` (copia di `scripts/pull-deploy.sh`) gira ogni 5 minuti:

1. scarica solo l'impronta sha256 — poche decine di byte, quindi il controllo può
   essere frequente senza scaricare l'intero pacchetto;
2. se coincide con quella installata, esce senza fare nulla (~0,2 s);
3. altrimenti scarica il pacchetto, **verifica lo sha256 e la presenza di
   `it/index.html` e `en/index.html` prima di toccare la document root**;
4. installa con `rsync --delete`, escludendo `.well-known`, `.htaccess`, `.htpasswd`;
5. svuota la cache Cloudflare, se configurata.

Un `flock` impedisce esecuzioni sovrapposte. Il log sta in
`~/.mariani-deploy/pull-deploy.log`, troncato a 500 righe.

Installazione:

```bash
scp scripts/pull-deploy.sh mariani5@37.156.244.12:~/pull-deploy.sh
ssh mariani5@37.156.244.12 'chmod 700 ~/pull-deploy.sh && bash ~/pull-deploy.sh'
ssh mariani5@37.156.244.12 'crontab -l'   # */5 * * * * /bin/bash $HOME/pull-deploy.sh
```

Configurazione opzionale in `~/.mariani-deploy.conf` (permessi 600, non versionato):

```bash
GITHUB_TOKEN=...    # solo se il repository diventa privato
CF_ZONE_ID=...
CF_API_TOKEN=...
```

Per forzare un aggiornamento immediato senza aspettare il cron:
`ssh mariani5@37.156.244.12 'bash ~/pull-deploy.sh'`.

## 4. Chiave SSH (manutenzione manuale)

Non serve più alla pipeline, ma resta il canale di amministrazione: wp-cli,
ispezione dei log, deploy forzato.

```bash
ssh-keygen -t ed25519 -f deploy_mariani -C "gh-actions-deploy"
```

1. In Plesk: `Siti Web e Domini` → *Accesso SSH* → abilita la shell per l'utente di sistema.
2. Aggiungi `deploy_mariani.pub` alle `authorized_keys` di quell'utente (`~/.ssh/authorized_keys`, permessi `700` sulla cartella e `600` sul file).
3. Conserva la chiave privata solo in locale (`~/.ssh/deploy_mariani`).

Verifica:

```bash
ssh -i deploy_mariani -p 22 <utente>@37.156.244.12 'ls -la'
```

## 5. Costanti WordPress (in `wp-config.php` sul server, NON versionato)

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

## 6. DNS / Cloudflare

Zona su Cloudflare (NS `anita`/`yoxall.ns.cloudflare.com`), TTL 300.

| Record | Valore | Proxy |
|---|---|---|
| `mariani-auto.it` A | `37.156.244.12` | grigio (arancione dopo il go-live) |
| `www` CNAME | `mariani-auto.it` | segue l'apex |
| `cms` A | `37.156.244.12` | **grigio sempre**: evita che l'API venga cachata a build time |
| `preview` A | `37.156.244.12` | grigio |
| `mail` A / `MX` | `185.116.60.222` | **da non toccare mai**: la posta vive sul vecchio host |

Il proxy Cloudflare non instrada SSH: per l'amministrazione usare l'IP diretto.

## 7. Certificati

Let's Encrypt da Plesk su `mariani-auto.it` (+`www`), `cms` e `preview`, poi
*Reindirizza da HTTP a HTTPS* nelle impostazioni di hosting dei tre host.
La validazione HTTP-01 richiede record **grigi**: emettere prima di accendere il proxy.

## 8. Manutenzione di WordPress (aggiornamenti)

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

## 9. Go-live

1. Plesk: *Root del documento* di `mariani-auto.it` → cartella di `preview`.
2. Rimuovere la protezione directory.
3. Cloudflare: proxy arancione su `@` e `www`.

Nessuna modifica DNS, quindi nessun rischio per la posta. Reversibile in un minuto.
