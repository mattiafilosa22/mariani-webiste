# Mariani Concessionaria Ford — Sito web

Sito ufficiale di Mariani Concessionaria (Ford Blubay, Piombino LI). Vetrina auto nuove/usate/Km0, veicoli commerciali, noleggio lungo termine, officina. Target 50-60 anni: accessibilità e chiarezza prima di tutto.

## Architettura
- **WordPress headless** (PHP 8.x, MySQL) su subdominio `cms.<dominio>` = SOLO back-office/API. Hosting VHosting Cloud Low Cost 01 (PHP-only, niente Node in produzione).
- **Frontend Next.js (App Router, TypeScript) in Static Export** (`output:'export'`) servito come file statici dal dominio principale, con Cloudflare CDN davanti.
- Dati via **REST custom** `wp-json/mariani/v1/*` (DTO formati da Presenter PHP). Nessun testo di contenuto hardcoded: tutto editabile in WP.
- Deploy: GitHub Actions builda l'export e fa rsync via SSH su VHosting; webhook WP su publish → `repository_dispatch` → rebuild (~1-2 min).

## Stack
Next.js · React · TypeScript strict · next-intl (IT/EN) · Tailwind (temi light/dark) · Leaflet/OSM (mappa) · zod · Vitest/Playwright/axe.
WordPress + Meta Box (free, campi/gallerie) · Polylang (free, multilingua completo) · Fluent Forms (free, form/lead) · Complianz (free, testi policy) · ShortPixel/Imagify (free, immagini).
Regola versioni: ultima stabile; penultima se l'ultima ha bug bloccanti. Solo plugin gratuiti.

## Struttura
- `web/` frontend (`src/app/[locale]`, `components`, `features`, `lib`, `domain`, `i18n`, `styles`).
- `cms/mu-plugins/mariani-core/` codice WP (CPT, fields, rest, security, webhook, mail); `cms/seed/` seeder; `cms/config/` wp-config/.htaccess.
- `.claude/agents/` implementer + reviewer. Piano completo: `~/.claude/plans/ticklish-tickling-forest.md`.

## Regole di sviluppo
- SOLID, Clean Architecture, Clean Code. Niente spaghetti/duplicazione. Componenti piccoli, nomi espliciti.
- TS strict, no `any`, zod al confine dati. Server Components di default; `use client` solo se necessario. Compatibile export statico.
- PHP: WordPress Coding Standards + PSR-12, escaping/sanitizzazione sempre, REST con permission_callback, Repository/Presenter per i DTO.
- Accessibilità WCAG 2.1 AA e Core Web Vitals sono "definition of done" per ogni task UI.
- Contenuti in italiano/inglese da WP; solo le label UI stanno in `i18n`.
- Sicurezza WP: auto-update disattivati; il ruolo cliente "Redattore Mariani" non può aggiornare/installare core o plugin.

## Comandi
- Ambiente locale Docker (WordPress + **MariaDB container** + phpMyAdmin): `npm run dev:up` poi `npm run dev:setup`. WP admin http://localhost:8890/wp-admin (admin/admin), API http://localhost:8890/wp-json/mariani/v1, phpMyAdmin http://localhost:8891. wp-cli: `npm run dev:cli -- <args>`; seeder `npm run dev:seed`. Config in `docker-compose.yml` + `.env.example`.
- Frontend: `cd web && npm run dev | build | lint | test`; `npm run typecheck` (`tsc --noEmit`). Ha mock di fallback: builda anche senza WP.
- Qualità PHP: in `cms/` → `composer phpcs` / `composer phpcbf`.
- Alternativa: `npm run wp:start` (wp-env, porta 8888). Usare UN solo ambiente per volta.

## Workflow agenti
Ogni task: **implementer** implementa + si auto-valuta 1-10 e itera fino a 10/10; poi **reviewer** verifica in modo indipendente (build/test/lint/axe) e assegna 1-10; se <10 feedback → l'implementer ri-lavora. Task chiuso solo con reviewer 10/10 e verifiche verdi. Max 4 iterazioni poi escalation umana.
