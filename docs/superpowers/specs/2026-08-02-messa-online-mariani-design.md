# Messa online sito Mariani — design

Data: 2026-08-02
Stato: approvato (design), da eseguire

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
                       rsync SSH → document root di preview.mariani-auto.it (Plesk)
                                        │
                                 purge cache Cloudflare
```

Riuso di `.github/workflows/deploy.yml`. Modifiche necessarie:
- secret `VHOSTING_*` valorizzati con host/utente/chiave/percorso del Plesk;
- `--exclude` per i file di protezione directory (`.htaccess`, `.htpasswd`), altrimenti
  `--delete` li rimuove a ogni deploy;
- purge Cloudflare attivo (zone id + token con permesso *Cache Purge*).

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

## Fuori scope

- Migrazione della posta dal vecchio server.
- Introduzione di SPF sul dominio (richiede censimento dei mittenti reali).
- Dismissione del vecchio hosting.
