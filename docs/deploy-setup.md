# Deploy — configurazione (VHosting + GitHub Actions + webhook WP)

Pipeline: modifica in WordPress → webhook `repository_dispatch` → GitHub Actions builda l'export statico → `rsync` SSH su VHosting → (opzionale) purge Cloudflare.

## 1. GitHub Secrets (repo Settings → Secrets and variables → Actions)
| Secret | Esempio / Note |
|---|---|
| `WP_API_URL` | `https://cms.marianiford.it/wp-json/mariani/v1` — API headless usata a build time **e** esposta al browser (`NEXT_PUBLIC_WP_API_URL`) per il POST `/lead` del form contatti. **Obbligatorio**: senza, il form in export statico posta sul dominio principale e non raggiunge il WP |
| `SITE_URL` | `https://marianiford.it` — usato per canonical/sitemap/hreflang/OG |
| `VHOSTING_SSH_HOST` | host SSH VHosting |
| `VHOSTING_SSH_PORT` | tipicamente `22` |
| `VHOSTING_SSH_USER` | utente SSH VHosting |
| `VHOSTING_SSH_KEY` | **chiave privata SSH** (genera una coppia dedicata; la pubblica va su VHosting) |
| `VHOSTING_REMOTE_PATH` | es. `/home/utente/public_html/` — document root del dominio principale |
| `CLOUDFLARE_ZONE_ID` | (opzionale) per il purge cache |
| `CLOUDFLARE_API_TOKEN` | (opzionale) token con permesso *Cache Purge* |

> I segreti stanno SOLO nei GitHub Secrets. Mai nel repo, mai in `wp-config` versionato.

## 2. Costanti WordPress (in `wp-config.php`, NON versionato)
Vedi `cms/config/wp-config-snippet.php`. Necessarie per il webhook di rebuild:
```php
define( 'MARIANI_GH_REPO',  'mattiafilosa22/mariani-webiste' );
define( 'MARIANI_GH_TOKEN', '***PAT con scope repo/dispatch***' ); // GitHub Personal Access Token
```
Il webhook (mu-plugin `mariani-core/webhook`) invia un `repository_dispatch` con event type `wp-content-updated`, con debounce di 120s.

## 3. SSH VHosting
1. Genera coppia dedicata: `ssh-keygen -t ed25519 -f deploy_mariani -C "gh-actions-deploy"`.
2. Aggiungi la **pubblica** (`deploy_mariani.pub`) alle authorized_keys dell'utente SSH VHosting.
3. Metti la **privata** in `VHOSTING_SSH_KEY`.

## 4. DNS / Cloudflare
- Dominio principale → document root VHosting (dove rsync carica `out/`), proxied da Cloudflare (arancione) per CDN/SSL.
- Subdominio `cms.` → WordPress su VHosting (PHP), SSL Let's Encrypt.
