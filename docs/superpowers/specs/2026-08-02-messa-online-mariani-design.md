# Messa online sito Mariani — design

Data: 2026-08-02 (aggiornato il 2026-08-03)
Stato: eseguito — restano SMTP e utente redattore

## Obiettivo

Portare online l'architettura WordPress headless + Next.js static export su hosting
VHosting/Plesk, con Cloudflare come DNS autoritativo e CDN, **senza mai interrompere
la posta**, pubblicando subito una coming soon sul dominio e il sito vero al go-live.

## Situazione di partenza (rilevata il 2026-08-02)

| Elemento | Valore |
|---|---|
| Nameserver autoritativi | `dns1..dns5.vhosting-it.com` (registrar/area clienti VHosting) |
| `mariani-auto.it` / `www` | `185.116.60.222` — **solo pagina di parcheggio** VHosting ("Dominio registrato"); porta 443 chiusa, quindi in https il dominio non risponde affatto |
| `mail.mariani-auto.it` | `185.116.60.222` — **posta sul vecchio server** |
| `MX` | `0 mail.mariani-auto.it.` |
| `TXT` apex | assente (nessun SPF) |
| `_dmarc` | `v=DMARC1; p=none;` |
| `CAA` | issue/issuewild: `letsencrypt.org`, `comodoca.com`, `digicert.com` |
| `cms.mariani-auto.it` | **non esiste** |
| Server Plesk | `web.saturno.vhosting-it.com` → `37.156.244.12` (da riconfermare in Plesk) |
| Zona DNS dentro Plesk | usa `sdns1..sdns4` → **non autoritativa, ignorarla** |

Vincoli:
- Nessun Node in produzione: il Plesk serve solo file statici + PHP.
- **La posta** (`mail`, `MX` → `185.116.60.222`) deve restare operativa: e l'unico
  servizio vivo sul vecchio host e non viene mai spostato.
- Solo plugin WordPress gratuiti; auto-update disattivati.

Decisione conseguente: non esistendo un sito indicizzato da preservare, il dominio
principale viene spostato sul Plesk **subito**, servendo una pagina coming soon
(`coming-soon/`), senza attendere il completamento del frontend. Cadono di
conseguenza i redirect 301 legacy previsti al go-live.

## Topologia target

| Cosa | Host | Note |
|---|---|---|
| Frontend statico (export Next) | `mariani-auto.it` (+ `www`) | webroot del dominio su Plesk |
| Anteprima pre-go-live | `preview.mariani-auto.it` | document root propria, protetta da htpasswd — e il target della CI |
| WordPress headless | `cms.mariani-auto.it` | back-office + REST `wp-json/mariani/v1/*` |
| Database | MySQL/MariaDB locale Plesk | utente dedicato, host `localhost`, no accesso remoto |
| Posta | resta su `185.116.60.222` | fuori scope di questo intervento |

**Decisione chiave**: document root separate. Il dominio principale serve la coming
soon (pubblica), `preview` ospita il sito vero dietro htpasswd ed è l'unico target
della CI. Al go-live non si sposta un file: si cambia la *Root del documento* del
dominio principale facendola puntare alla cartella di `preview` e si toglie la
protezione. Un campo, reversibile.

La build usa `NEXT_PUBLIC_SITE_URL=https://mariani-auto.it` fin da subito, così
canonical, sitemap, hreflang e OG sono definitivi. L'anteprima non viene indicizzata
perché è dietro htpasswd.

## Cloudflare

Cloudflare diventa DNS autoritativo (cambio NS presso il registrar) **prima** del
go-live, mentre tutto punta ancora al vecchio server: la zona viene replicata
identica, quindi il cambio è a impatto zero e osservabile.

Vantaggi attesi: TTL basso (cutover e rollback in minuti anziché fino a 24h), CDN edge
sull'export statico (TTFB/LCP), rate limiting davanti a login WP e endpoint `/lead`,
redirect gestiti all'edge senza toccare il server, analytics senza cookie.

Regole di proxy:
- `cms` → **DNS only (grigio)**, almeno in fase iniziale: evita risposte API cachate a
  build time e semplifica Let's Encrypt.
- `mariani-auto.it` / `www` / `preview` → grigio finché non è emesso il certificato
  Let's Encrypt sul Plesk (HTTP-01 non passa dal proxy), poi arancione.
- Record dedicato **non proxato** per l'SSH del deploy (o IP diretto nei GitHub Secrets):
  il proxy Cloudflare non instrada SSH.
- Prima di attivare Universal SSL: estendere il CAA con `pki.goog` e `ssl.com`, altrimenti
  l'emissione del certificato Cloudflare può fallire.

Record da preservare **identici** nella migrazione (verifica riga per riga, MX in testa):
`@`, `www`, `mail`, `MX`, `_dmarc`, `CAA`.

## Pipeline di deploy

```
WP (cliente pubblica) ──webhook──> GitHub repository_dispatch (wp-content-updated)
                                        │
                       GitHub Actions: npm ci → build export statico
                       (legge https://cms.mariani-auto.it/wp-json/mariani/v1)
                                        │
                       pubblica site.tar.gz nella release "site-latest"
                                        │
                    il server scarica (cron 5 min, scripts/pull-deploy.sh)
                    verifica sha256 → rsync nella document root di preview
                                        │
                                 purge cache Cloudflare
```

**Il deploy è in pull, non in push** (deviazione rispetto al piano iniziale). Il
firewall di VHosting scarta a intermittenza le connessioni SSH in ingresso dai runner
GitHub: `rsync` falliva a giorni alterni con "Operation timed out", mentre la stessa
chiave funzionava da altre reti. Invertendo il verso non c'è più nulla da far entrare
nel server, e i secret `VHOSTING_SSH_*` non servono più alla pipeline.

Il purge Cloudflare è passato dalla CI al server: in pull, al termine della build il
sito online è ancora quello vecchio, quindi svuotare la cache lì la riempirebbe di
nuovo con i file superati.

`deploy-pantheon.yml` e `scripts/deploy-pantheon.sh` sono stati rimossi: l'ambiente
di test Pantheon non fa più parte dell'architettura.

## Ordine di esecuzione

1. **Cloudflare**: creazione zona, import e verifica record, cambio NS presso il
   registrar, attesa attivazione. Verifica: risoluzione invariata per `@`, `www`, `mail`, `MX`.
2. **DNS nuovi record**: `cms` e `preview` → IP Plesk (grigi).
3. **Plesk**: sottodominio `cms`, dominio `mariani-auto.it`, `preview` con document root
   propria; coming soon caricata nella document root del dominio; htpasswd su `preview`.
   Poi switch degli A record `@`/`www` sul Plesk e, subito dopo, Let's Encrypt su tutti
   e tre gli host + redirect HTTP→HTTPS.
4. **WordPress** su `cms` via WP Toolkit: lingua IT, titolo corretto, nessun set plugin,
   prefisso tabelle non standard, auto-update disattivati, admin tecnico con email controllata.
5. **Contenuti/codice CMS**: mu-plugin `mariani-core`, plugin (Meta Box, Polylang,
   Fluent Forms, Complianz, ShortPixel), costanti in `wp-config.php` (webhook GitHub, SMTP),
   seed dei contenuti, utente cliente "Redattore Mariani".
6. **CI**: chiave SSH dedicata, GitHub Secrets, primo deploy manuale (`workflow_dispatch`),
   verifica dell'export su `preview`.
7. **Webhook**: test del ciclo pubblicazione → rebuild automatico.
8. **Go-live**: puntare la *Root del documento* del dominio principale alla cartella di
   `preview`, togliere htpasswd, attivare il proxy Cloudflare (arancione) su `@` e `www`.
   Nessuna modifica DNS, quindi nessun rischio per la posta.

## Rischi e mitigazioni

| Rischio | Mitigazione |
|---|---|
| Posta interrotta dalla migrazione DNS | `mail` e `MX` replicati identici e verificati con `dig` prima e dopo il cambio NS; `mail` non viene mai spostato |
| Certificato non emesso sul dominio principale | Emissione con record in DNS-only, proxy acceso solo dopo; CAA esteso a `pki.goog`/`ssl.com` |
| Anteprima indicizzata da Google | htpasswd sulla document root di `preview`, non solo `noindex` |
| Protezione directory cancellata dal deploy | `--exclude` esplicito nel comando rsync |
| API cachata a build time | `cms` in DNS-only; se proxato, bypass cache su `/wp-admin` e `/wp-json` |
| Rollback go-live | TTL 300 su Cloudflare: ripristino dell'A record precedente in pochi minuti |
| Deploy CI che pubblica il sito incompleto | La CI scrive solo nella document root di `preview`, mai in quella del dominio |

## Esito (2026-08-03)

Realizzato:

- DNS su Cloudflare, TTL 300, posta mai interrotta. VHosting ha poi allineato anche la
  propria zona: **due zone autoritative coesistono** e oggi concordano — prima di
  qualunque futura modifica DNS va chiesta la rimozione di quella VHosting.
- `mariani-auto.it` serve la coming soon (`coming-soon/`), HTTPS attivo.
- `cms.mariani-auto.it`: WordPress 7.0.2 IT, prefisso `mar_`, mu-plugin `mariani-core`,
  plugin del piano, contenuti seed (15 auto, 8 pagine, 27 termini, IT/EN).
- `preview.mariani-auto.it`: sito completo dietro password, aggiornato dalla pipeline.
- Ciclo completo verificato: modifica in WP → webhook → build → release → pull del
  server → purge cache. Latenza osservata 5-8 minuti.

Aggiunte non previste dal piano, emerse durante l'esecuzione:

- `security/HeadlessGuard.php` — il CMS non ha frontend navigabile; serviva anche
  `allowed_redirect_hosts`, altrimenti `wp_safe_redirect()` ripiegava su `wp-admin`.
- `rest/Support/Cors.php` — senza whitelist il POST `/lead` cross-origin veniva
  bloccato dal browser.
- `security/CommentsDisabled.php` — commenti e pingback chiusi ovunque.
- `DISALLOW_FILE_MODS` — nessun aggiornamento o installazione dalla dashboard, per
  chiunque. Procedura di manutenzione manuale in `docs/deploy-setup.md`.
- Registrazione dell'esito del webhook con avviso in bacheca: la chiamata era
  fire-and-forget e un token senza permessi produceva un guasto silenzioso.

Vincolo di configurazione da ricordare: su `preview` è stata **disattivata
l'"elaborazione intelligente dei file statici"** di nginx. Con quella attiva e la
directory protetta da password, il vhost restituiva 404 su ogni file di almeno 1024
byte — pagine incluse — servendo invece i file più piccoli. Se al go-live la document
root del dominio verrà puntata alla cartella di `preview`, verificare il comportamento
sul vhost del dominio.

Da completare: SMTP per le notifiche dei lead (le caselle sono sul vecchio host, la
sezione Posta non è disponibile in questo Plesk) e utente "Redattore Mariani".

## Fuori scope

- Migrazione della posta dal vecchio server.
- Introduzione di SPF sul dominio (richiede censimento dei mittenti reali).
- Dismissione del vecchio hosting.
