# Media, Compliance, and Release Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendere la preview completa nelle immagini, corretta nei dati aziendali e tecnicamente pronta al rilascio per privacy, responsive design, accessibilità, SEO e ricerca AI, senza attivare il dominio pubblico.

**Architecture:** WordPress resta la sorgente editoriale: due campi media alimentano DTO Zod consumati dall'export Next.js. Privacy e retention riflettono il flusso reale senza tracker; OpenStreetMap viene montata solo dopo un'azione dell'utente. Vitest, PHPCS, Playwright e axe verificano il risultato prima del deploy mirato su CMS e preview.

**Tech Stack:** WordPress mu-plugin PHP 8.1+, Meta Box, WP-Cron, Fluent Forms, Next.js 16 static export, React 19, TypeScript, Zod, next-intl, Vitest, Playwright, axe-core.

**Spec:** `docs/superpowers/specs/2026-09-14-rilascio-media-compliance-design.md`

## Global Constraints

- Nessun Google Analytics, GA4, Meta Pixel o altro tracker statistico/pubblicitario.
- Nessun banner cookie finché esistono soltanto meccanismi tecnici.
- Lead cancellati dopo esattamente 12 mesi sia dal CPT privato sia da Fluent Forms.
- Partita IVA ufficiale `01300000492`; `01234567890` non deve apparire nell'export.
- Immagini homepage gestibili dal CMS e comprese nel seed locale.
- `mariani-auto.it` resta “coming soon”; si aggiorna solo `preview.mariani-auto.it`.
- Non cancellare veicoli o media; non eseguire `wp mariani seed` sul CMS live perché reintrodurrebbe il catalogo demo.
- Target WCAG 2.2 AA sui flussi principali.
- Build release con `WP_API_STRICT=1` e zero fallback ai mock.

## File map

- Nuovi media: `cms/seed/media/home/catalogo-showroom.jpg`, `cms/seed/media/home/officina-service.jpg`.
- Contratto media: `PageFields.php`, `PagePresenter.php`, `Rest.php`, `MediaSeeder.php`, `Catalog.php`, `web/src/domain/page.ts`.
- UI media: `Bento.tsx`, `Service.tsx`, `web/src/styles/home.css`.
- Identità: `Header.tsx`, `Footer.tsx`, `components.css`, mock settings e fixture SEO.
- Privacy: i due form React, messaggi IT/EN, controller/bridge/provisioner lead, contenuti legali seed/mock.
- Retention: nuovo `privacy/LeadRetention.php`, autoload/composition root e gateway Fluent Forms.
- Mappa: nuovo `DeferredMap.tsx`, `SiteMap.tsx`, `LeafletMount.tsx`, copy e CSS.
- SEO: `site.ts`, `structured.ts`, `robots.ts`, `llms.txt`, `llms-full.txt`.
- QA: `web/playwright.config.ts`, `web/e2e/release-readiness.spec.ts`, package e workflow CI.

---

### Task 1: Generare le fotografie editoriali

**Files:**
- Create: `cms/seed/media/home/catalogo-showroom.jpg`
- Create: `cms/seed/media/home/officina-service.jpg`

**Interfaces:**
- Produces: JPEG sRGB almeno 1600×1200, senza testo/loghi/targhe, riferiti da `MediaRef('home-catalogo')` e `MediaRef('home-officina')`.

- [ ] **Step 1: Generare l'immagine catalogo con imagegen**

Prompt esatto:

```text
Fotografia editoriale fotorealistica per il sito di una concessionaria italiana contemporanea. Interno showroom luminoso e ordinato, una consulente adulta e una cliente adulta viste in modo naturale mentre sfogliano insieme un catalogo automobilistico cartaceo aperto su un tavolo. Inquadratura orizzontale 4:3, soggetti nella metà alta e centro-sinistra, spazio pulito in basso per una sovrimpressione scura. Palette neutra con discreti accenti blu, luce diurna morbida, atmosfera professionale e accogliente. Nessun testo leggibile, logo, marchio automobilistico, targa o filigrana.
```

- [ ] **Step 2: Generare l'immagine officina con imagegen**

Prompt esatto:

```text
Fotografia editoriale fotorealistica di una moderna officina automobilistica italiana, pulita e realmente operativa. Un tecnico adulto con abbigliamento neutro controlla un'auto su ponte sollevatore, utensili ordinati e luce naturale laterale. Inquadratura orizzontale 4:3 leggibile anche su smartphone, colori neutri con piccoli accenti blu e verdi, sensazione di competenza e trasparenza. Nessun testo leggibile, logo, marchio automobilistico, targa o filigrana.
```

- [ ] **Step 3: Ottimizzare e ispezionare**

```bash
magick cms/seed/media/home/catalogo-showroom.jpg -auto-orient -strip -colorspace sRGB -resize '2000x2000>' -quality 84 cms/seed/media/home/catalogo-showroom.jpg
magick cms/seed/media/home/officina-service.jpg -auto-orient -strip -colorspace sRGB -resize '2000x2000>' -quality 84 cms/seed/media/home/officina-service.jpg
identify -format '%f %wx%h %[colorspace]\n' cms/seed/media/home/*.jpg
```

Expected: lato corto almeno 1200 px, sRGB, ciascun file sotto 1,5 MB. Ispezionare entrambi a risoluzione originale per anatomia, crop, testo, targhe e loghi.

- [ ] **Step 4: Commit**

```bash
git add cms/seed/media/home
git commit -m "feat(home): aggiunge fotografie editoriali"
```

### Task 2: Collegare media CMS e frontend

**Files:**
- Modify: `cms/mu-plugins/mariani-core/fields/PageFields.php`
- Modify: `cms/mu-plugins/mariani-core/rest/Rest.php`
- Modify: `cms/mu-plugins/mariani-core/rest/Presenters/PagePresenter.php`
- Modify: `cms/mu-plugins/mariani-core/seed/MediaSeeder.php`
- Modify: `cms/mu-plugins/mariani-core/seed/Data/Catalog.php`
- Modify: `web/src/domain/page.ts`
- Create: `web/src/domain/page.test.ts`
- Modify: `web/src/lib/api/mock/pages.ts`
- Modify: `web/src/features/home/components/Bento.tsx`
- Modify: `web/src/features/home/components/Service.tsx`
- Modify: `web/src/styles/home.css`
- Modify: `docs/api-contract.md`

**Interfaces:**
- Consumes: `ImageTransformer::to_front(int): ?array`.
- Produces: `HomeBento.image` e `HomeService.image` come `AutoImage | null | undefined`; meta `mariani_home_bento_feature_img` e `mariani_home_service_img`.

- [ ] **Step 1: Scrivere il test Zod fallente**

Creare `web/src/domain/page.test.ts` con un oggetto immagine `{src,srcset,width,height,alt}` e verificare che `homeBentoSchema.parse(...).image` e `homeServiceSchema.parse(...).image` lo conservino; verificare anche che il campo assente resti valido.

- [ ] **Step 2: Confermare il fallimento**

Run: `npm --prefix web test -- src/domain/page.test.ts`

Expected: FAIL perché gli schemi correnti scartano `image`.

- [ ] **Step 3: Implementare contratto e API**

Importare `autoImageSchema` in `page.ts` e aggiungere `image: autoImageSchema.nullish()` ai due schemi. Aggiungere in `PageFields::home_box()`:

```php
$this->image( 'mariani_home_bento_feature_img', __( 'Bento — Cella principale: immagine', 'mariani-core' ) ),
$this->image( 'mariani_home_service_img', __( 'Service — Immagine', 'mariani-core' ) ),
```

Iniettare `ImageTransformer` nel costruttore di `PagePresenter`, passarlo da `Rest`, chiamare `to_front()` sugli ID meta e includere `image` solo quando non null.

- [ ] **Step 4: Seedare i media editoriali**

Generalizzare il seed dell'hero usando la mappa:

```php
$assets = array(
	'hero-mache'    => array( 'hero-mache.jpg', 'Ford Mustang Mach-E nello showroom Mariani' ),
	'home-catalogo' => array( 'home/catalogo-showroom.jpg', 'Cliente che consulta il catalogo nello showroom Mariani' ),
	'home-officina' => array( 'home/officina-service.jpg', 'Tecnico al lavoro nell’officina Mariani' ),
);
```

In `Catalog::page_home()` assegnare i due nuovi meta a `new MediaRef('home-catalogo')` e `new MediaRef('home-officina')`.

- [ ] **Step 5: Renderizzare con fallback stabile**

Nei componenti, quando `image` esiste, usare:

```tsx
<img className="home-editorial-image" src={image.src} srcSet={image.srcset || undefined}
  sizes="(max-width: 860px) 100vw, 50vw" width={image.width} height={image.height}
  alt={image.alt} loading="lazy" decoding="async" />
```

Mantenere `.ph` solo senza immagine. CSS: `display:block;width:100%;height:100%;object-fit:cover`; immagine Bento assoluta `inset:0`, Service nello slot 4:3.

- [ ] **Step 6: Verificare e documentare**

```bash
npm --prefix web test -- src/domain/page.test.ts
npm --prefix web run typecheck
composer --working-dir=cms phpcs
```

Aggiornare `docs/api-contract.md` con la forma immagine opzionale, poi commit:

```bash
git add cms/mu-plugins/mariani-core web/src/domain web/src/lib/api/mock/pages.ts web/src/features/home web/src/styles/home.css docs/api-contract.md
git commit -m "feat(home): gestisce immagini editoriali dal CMS"
```

### Task 3: Correggere identità, P.IVA e dati strutturati veicolo

**Files:**
- Modify: `cms/mu-plugins/mariani-core/seed/Data/Catalog.php`
- Modify: `web/src/components/layout/Header.tsx`
- Modify: `web/src/components/layout/Footer.tsx`
- Modify: `web/src/styles/components.css`
- Modify: `web/src/lib/api/mock/settings.ts`
- Modify: `web/src/lib/api/mock/pages.ts`
- Modify: `web/src/lib/seo/structured.ts`
- Modify: `web/src/lib/seo/seo.test.ts`

**Interfaces:**
- Produces: footer/JSON-LD con `01300000492`, brand senza sottotitolo, JSON-LD auto nuove senza anno/km sentinella.

- [ ] **Step 1: Scrivere aspettative fallenti**

In `seo.test.ts`, usare P.IVA `01300000492`, aspettarsi `vatID` uguale e creare un'auto `{tipo:'nuova', anno:0, km:0}` aspettandosi assenza di `vehicleModelDate`, `productionDate` e `mileageFromOdometer`.

Run: `npm --prefix web test -- src/lib/seo/seo.test.ts`

Expected: FAIL sui valori sentinella.

- [ ] **Step 2: Applicare correzioni**

Aggiornare seed/mock P.IVA e allineare anche il mock hero a “La tua prossima auto” / “Your next car”. Rimuovere `brand__txt`/`brand__sub` da Header/Footer, la frase “Concessionaria Ford Blubay” dalla riga legale e il relativo CSS. In `buildVehicleJsonLd` usare:

```ts
const knownYear = auto.anno > 1900 ? String(auto.anno) : undefined;
const knownMileage = auto.tipo !== "nuova" && auto.km > 0
  ? { "@type": "QuantitativeValue", value: auto.km, unitCode: "KMT" }
  : undefined;
```

- [ ] **Step 3: Verificare e commit**

```bash
! rg -n "01234567890|Ford Blubay · Concessionaria|Concessionaria Ford Blubay|La tua prossima Ford" web/src/components web/src/lib/api/mock cms/mu-plugins/mariani-core/seed/Data/Catalog.php
npm --prefix web test -- src/lib/seo/seo.test.ts
npm --prefix web run lint
git add cms/mu-plugins/mariani-core/seed/Data/Catalog.php web/src/components/layout web/src/styles/components.css web/src/lib/api/mock/settings.ts web/src/lib/seo
git commit -m "fix(brand): corregge identità e partita IVA"
```

### Task 4: Allineare moduli e informative privacy

**Files:**
- Modify: `web/src/features/pages/components/RequestForm.tsx`
- Modify: `web/src/features/scheda/components/LeadForm.tsx`
- Modify: `web/src/i18n/messages/it.json`
- Modify: `web/src/i18n/messages/en.json`
- Modify: `web/src/i18n/messages/richMessages.test.tsx`
- Modify: `web/src/lib/api/mock/pages.ts`
- Modify: `cms/mu-plugins/mariani-core/rest/Controllers/LeadController.php`
- Modify: `cms/mu-plugins/mariani-core/forms/LeadFormBridge.php`
- Modify: `cms/mu-plugins/mariani-core/forms/LeadFormProvisioner.php`
- Modify: `cms/mu-plugins/mariani-core/seed/Data/Catalog.php`

**Interfaces:**
- Keeps: payload booleano `privacy: true` mappato a `consenso` per compatibilità.
- Produces: presa visione obbligatoria, nessun campo marketing, policy IT/EN aggiornate al `2026-09-14`.

- [ ] **Step 1: Aggiornare i test prima del copy**

In `richMessages.test.tsx` aspettarsi “Ho letto l’informativa sulla privacy” / “I have read the privacy notice” e assenza di “acconsento” / “consent to the processing”.

Run: `npm --prefix web test -- src/i18n/messages/richMessages.test.tsx`

Expected: FAIL con il copy corrente.

- [ ] **Step 2: Correggere form e backend**

Copy IT: `Ho letto l’<a>informativa sulla privacy</a>.` e `Conferma di aver letto l’informativa.` Copy EN equivalente. Rimuovere il checkbox marketing da `RequestForm`; rimuovere `marketing` da `LeadController::sanitize()`. Rinominare commenti ed etichette amministrative in “Presa visione informativa privacy”, mantenendo la chiave storica `consenso`. Nel footer eliminare il duplicato “Preferenze cookie”/`cookiePrefs`: il link “Cookie policy” nella colonna legale resta l'unico accesso, perché non esiste un centro preferenze.

- [ ] **Step 3: Sostituire i testi legali seed/mock**

La privacy IT/EN deve riportare: Mariani S.r.l., Via Adige 3, P.IVA 01300000492, email; dati raccolti; richieste/preventivi/test drive/appuntamenti; base art. 6(1)(b) GDPR; conferimento necessario; fornitori tecnici/destinatari; trasferimenti; niente marketing/decisioni automatizzate; retention 12 mesi; diritti artt. 15–22 e reclamo al Garante. La cookie policy deve dichiarare assenza di cookie statistici/profilazione e tile OSM solo dopo “Carica la mappa”. Data `2026-09-14`.

- [ ] **Step 4: Verificare e commit**

```bash
npm --prefix web test -- src/i18n/messages/richMessages.test.tsx src/lib/forms/submitLead.test.ts
! rg -n 'name="marketing"|t\("marketing"\)|profilazione.*consenso' web/src/features web/src/lib/api/mock cms/mu-plugins/mariani-core/seed/Data/Catalog.php
composer --working-dir=cms phpcs
git add web/src/features web/src/i18n web/src/lib/api/mock/pages.ts cms/mu-plugins/mariani-core
git commit -m "fix(privacy): allinea moduli e informative"
```

### Task 5: Implementare retention di 12 mesi

**Files:**
- Create: `cms/mu-plugins/mariani-core/privacy/LeadRetention.php`
- Modify: `cms/mu-plugins/mariani-core/autoload.php`
- Modify: `cms/mu-plugins/mariani-core/src/Plugin.php`
- Modify: `cms/mu-plugins/mariani-core/forms/FluentFormsGateway.php`

**Interfaces:**
- Produces: hook giornaliero `mariani_purge_expired_leads`; `LeadRetention::purge(): array{posts:int,submissions:int}`; batch massimo 200.

- [ ] **Step 1: Prova d'integrazione fallente**

```bash
npm run dev:up
npm run dev:cli -- eval 'var_export(has_action("mariani_purge_expired_leads"));'
```

Expected: `false`.

- [ ] **Step 2: Implementare scheduler e purge**

`LeadRetention` implementa `Module`, registra su `init` un evento daily se assente e sul proprio hook `purge`. Il cutoff è `gmdate('Y-m-d H:i:s', strtotime('-12 months', time()))`. Usare `WP_Query` su CPT lead privati, `post_date_gmt` prima del cutoff, `fields => ids`, `posts_per_page => 200`, `orderby => ID`, poi `wp_delete_post($id, true)`.

In `FluentFormsGateway` aggiungere `delete_submissions_before(int $formId, string $cutoff): int`: se il modello `\FluentForm\App\Models\Submission` non esiste restituisce 0; altrimenti seleziona al massimo 200 submission del form configurato con `created_at < cutoff`, chiama `delete()` sul modello e cattura `Throwable` senza loggare dati personali.

- [ ] **Step 3: Registrare autoload e modulo**

Aggiungere `'Mariani\\Core\\Privacy\\' => 'privacy/'` prima del prefisso generico e `new LeadRetention(new FluentFormsGateway())` al composition root.

- [ ] **Step 4: Provare il cutoff localmente**

Creare via WP-CLI un lead privato datato `2025-08-01` e uno `2026-09-01`, eseguire `wp cron event run mariani_purge_expired_leads`, verificare che resti solo il recente, poi eliminare il record sintetico recente usando il suo ID esplicito.

- [ ] **Step 5: Verificare e commit**

```bash
composer --working-dir=cms phpcs
npm run dev:cli -- cron event list --fields=hook,next_run_relative
git add cms/mu-plugins/mariani-core
git commit -m "feat(privacy): elimina i lead dopo dodici mesi"
```

### Task 6: Caricare OpenStreetMap soltanto dopo il click

**Files:**
- Create: `web/src/components/ui/DeferredMap.tsx`
- Create: `web/src/components/ui/DeferredMap.test.tsx`
- Modify: `web/src/components/ui/SiteMap.tsx`
- Modify: `web/src/styles/pages.css`
- Modify: `web/src/i18n/messages/it.json`
- Modify: `web/src/i18n/messages/en.json`

**Interfaces:**
- Produces: client component che non monta `LeafletMount` prima del pulsante “Carica la mappa”; link esterno sempre disponibile.

- [ ] **Step 1: Scrivere test fallente**

Mockare `LeafletMount`, renderizzare `DeferredMap`, aspettarsi assenza di `data-testid="leaflet-mount"`, cliccare il bottone e aspettarsi presenza. Installare `@testing-library/user-event`.

- [ ] **Step 2: Implementare il gate**

`DeferredMap` usa `useState(false)`. Prima del click mostra pulsante e testo: “Attivando la mappa verranno richieste le immagini cartografiche a OpenStreetMap.” Dopo il click monta `LeafletMount`. `SiteMap` mantiene fuori dal gate “Apri in mappe”. Target pulsante minimo 44×44 px e focus visibile.

- [ ] **Step 3: Verificare e commit**

```bash
npm --prefix web test -- src/components/ui/DeferredMap.test.tsx
npm --prefix web run typecheck
npm --prefix web run lint
git add web/package.json web/package-lock.json web/src/components/ui web/src/styles/pages.css web/src/i18n/messages
git commit -m "fix(privacy): carica la mappa solo su richiesta"
```

### Task 7: Correggere dominio, crawler e contenuti AI

**Files:**
- Modify: `web/src/lib/seo/site.ts`
- Modify: `web/src/lib/seo/seo.test.ts`
- Modify: `web/src/app/robots.ts`
- Modify: `web/public/llms.txt`
- Modify: `web/public/llms-full.txt`
- Modify: `docs/deploy-setup.md`

**Interfaces:**
- Produces: URL predefinite `https://mariani-auto.it`, robots e llms coerenti.

- [ ] **Step 1: Rendere fallente il test dominio**

Aspettarsi `absoluteUrl('/it/auto/') === 'https://mariani-auto.it/it/auto/'`.

Run: `npm --prefix web test -- src/lib/seo/seo.test.ts`

Expected: FAIL sul fallback `marianiford.it`.

- [ ] **Step 2: Correggere SEO tecnico**

Impostare il fallback `SITE_URL` a `https://mariani-auto.it`. In `robots.ts` mantenere wildcard allow e aggiungere allow per `OAI-SearchBot`, `ChatGPT-User`, `GPTBot`, `ClaudeBot`, `PerplexityBot`; sitemap/host derivano da `SITE_URL`. Non aggiungere noindex all'artefatto condiviso: la preview resta protetta da Basic Auth.

- [ ] **Step 3: Correggere llms e checklist go-live**

Sostituire gli host vecchi nei due file, rimuovere URL inesistenti e descrivere solo catalogo, officina, noleggio, contatti e policy reali. Documentare per il post-go-live: robots/sitemap HTTP 200, Search Console e prova crawl pubblica; non promettere inclusione AI.

- [ ] **Step 4: Verificare e commit**

```bash
npm --prefix web test -- src/lib/seo/seo.test.ts
npm --prefix web run build
! rg -n "marianiford\.it|vehicleModelDate\":\"0|productionDate\":\"0" web/out web/public/llms*.txt
rg -n "OAI-SearchBot|ClaudeBot|PerplexityBot|Sitemap: https://mariani-auto.it/sitemap.xml" web/out/robots.txt
git add web/src/lib/seo web/src/app/robots.ts web/public/llms*.txt docs/deploy-setup.md
git commit -m "fix(seo): prepara dominio e crawler per il rilascio"
```

### Task 8: Automatizzare responsive, accessibilità e privacy network

**Files:**
- Modify: `web/package.json`
- Modify: `web/package-lock.json`
- Create: `web/playwright.config.ts`
- Create: `web/e2e/release-readiness.spec.ts`
- Modify: `.github/workflows/deploy.yml`
- Modify: componenti/CSS soltanto per difetti riprodotti dalla suite.

**Interfaces:**
- Produces: `npm run test:e2e` su export statico, Chromium, axe e cinque viewport.

- [ ] **Step 1: Installare e configurare**

```bash
npm --prefix web install --save-dev @playwright/test @axe-core/playwright
npm --prefix web exec playwright install chromium
```

Config: `testDir: './e2e'`, `baseURL: 'http://127.0.0.1:4173'`, Chromium, screenshot `only-on-failure`, trace `retain-on-failure`, webServer `python3 -m http.server 4173 -d out`. Aggiungere lo script JSON `"test:e2e": "playwright test"`.

- [ ] **Step 2: Scrivere la suite**

Per `/it/` e `/en/` a 320, 375, 768, 1024, 1440 px verificare header/footer e `document.documentElement.scrollWidth <= window.innerWidth`. Su home, catalogo, prima scheda, officina, contatti, privacy e cookie eseguire AxeBuilder con tag WCAG 2 A/AA, 2.1 A/AA e 2.2 AA, fallendo su impatti critical/serious.

Intercettare `google-analytics.com`, `googletagmanager.com`, `connect.facebook.net`, `tile.openstreetmap.org`: prima del click lista vuota; dopo “Carica la mappa” solo OSM. Testare menu mobile, link privacy, assenza di banner/centro preferenze, otto card in evidenza, P.IVA e assenza sottotitolo. Per ogni pagina verificare `title`, description, canonical e alternati hreflang non vuoti; attraversare tutti i link interni dell'export e richiedere le destinazioni, accettando solo HTTP 200 o redirect interno intenzionale. Verificare inoltre la 404 statica con una URL inesistente.

- [ ] **Step 3: Correggere i difetti riprodotti**

```bash
npm --prefix web run build
npm --prefix web run test:e2e
```

Applicare solo correzioni minime coperte da regressione, finché non restano overflow o violazioni critical/serious.

- [ ] **Step 4: Inserire QA in CI e commit**

Prima del packaging, workflow: `npm run lint`, `npm run typecheck`, `npm test`, install Chromium `npx playwright install --with-deps chromium`, `npm run test:e2e`.

```bash
git add web/package.json web/package-lock.json web/playwright.config.ts web/e2e web/src .github/workflows/deploy.yml
git commit -m "test(release): copre responsive accessibilità e privacy"
```

### Task 9: Aggiornare CMS live e distribuire la preview

**Files:**
- No changes to: `coming-soon/`, public document root, DNS, Basic Auth.

**Interfaces:**
- Produces: backup live, CMS aggiornato in modo mirato, export strict installato sulla preview e report finale.

- [ ] **Step 1: Verifica locale completa**

```bash
npm run lint
npm run typecheck
npm test
composer --working-dir=cms phpcs
npm run build
npm --prefix web run test:e2e
git diff --check
```

Expected: tutti exit 0.

- [ ] **Step 2: Backup CMS live**

Creare via SSH `~/backup-before-release-readiness-2026-09-14.sql` con WP-CLI e verificare che sia non vuoto senza stamparne il contenuto.

- [ ] **Step 3: Distribuire codice/media CMS senza seeder completo**

Usare `rsync -aR` per i soli file mu-plugin modificati e i due JPEG. Importare i due attachment idempotentemente, assegnare alt IT/EN, aggiornare soltanto i meta Home delle immagini, `mariani_set_piva`, privacy/cookie body e date. Prima leggere i valori correnti; dopo stampare solo ID, chiave e checksum/lunghezza. Non leggere o mostrare dati personali dei lead.

- [ ] **Step 4: Provare retention in sicurezza**

Contare senza dati personali lead prima/dopo il cutoff, verificare il cron, eseguire `LeadRetention::purge()` e confermare che il conteggio recente sia invariato. Output ammesso: soli conteggi.

- [ ] **Step 5: Verificare API live**

Con `curl` e `jq`, verificare settings e Home IT/EN: P.IVA, URL/alt/dimensioni delle due immagini, testi non vuoti. Non stampare header di autorizzazione.

- [ ] **Step 6: Push, CI e installazione preview**

```bash
git push origin main
gh run watch --exit-status
ssh mariani5@37.156.244.12 'bash ~/pull-deploy.sh'
```

Expected: workflow verde, release riferita al nuovo SHA, checksum installato e purge Cloudflare HTTP 200.

- [ ] **Step 7: Collaudo preview e dominio pubblico**

Ripetere Playwright sulla preview protetta. Verificare IT/EN, due immagini, 8 evidenze, fallback foto, assenza anno/km nuove, P.IVA, form, mappa, tracker, tastiera, skip link, ordine focus, zoom 200%, reflow e meta. Infine:

```bash
curl -fsS https://mariani-auto.it/ | rg -i "coming soon|prossimamente"
```

Expected: dominio pubblico ancora coming soon.

## Definition of Done

- Due fotografie responsive e modificabili dal CMS; otto auto reali in evidenza.
- P.IVA `01300000492`, nessun sottotitolo Ford Blubay nei blocchi brand.
- Nessun tracker/banner inutile; OSM soltanto dopo click.
- Moduli con presa visione, nessun marketing, policy coerenti e retention 12 mesi su entrambe le copie dei lead.
- Zero overflow alle cinque larghezze e zero violazioni axe critical/serious.
- Canonical, hreflang, sitemap, robots, JSON-LD e llms coerenti con `mariani-auto.it` e senza valori sentinella.
- Lint, typecheck, Vitest, PHPCS, build strict e Playwright verdi.
- Preview navigabile; pubblico invariato fino a conferma go-live.
