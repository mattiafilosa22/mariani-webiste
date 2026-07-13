# Contratto API `wp-json/mariani/v1/*`

Il contratto **canonico** è definito dagli schemi zod del frontend in
`web/src/domain/*.ts`. Il layer PHP (Repository → Presenter → Controller) deve
emettere **esattamente** quella forma. Gli schemi zod validano ogni risposta al
confine (`web/src/lib/api/client.ts`): un DTO non conforme viene rifiutato.

Fonte di verità degli schemi:

- Auto → `web/src/domain/auto.ts`
- Pagine → `web/src/domain/page.ts`
- Impostazioni → `web/src/domain/settings.ts`
- Lead → `web/src/domain/lead.ts`

I Presenter PHP che producono questi DTO:

- `cms/mu-plugins/mariani-core/rest/Presenters/AutoPresenter.php`
- `cms/mu-plugins/mariani-core/rest/Presenters/PagePresenter.php`
- `cms/mu-plugins/mariani-core/rest/Presenters/SettingsPresenter.php`

> Nota: zod di default **scarta le chiavi sconosciute**. Il Presenter può
> includere campi extra (verranno ignorati), ma i campi richiesti devono essere
> presenti e del tipo corretto.

---

## GET `/autos` → `AutoSummary[]`

Parametri: `lang` (`it|en`), `type` (`nuova|usata|km0`, opzionale).

Ogni elemento:

| Campo | Tipo | Origine CMS / normalizzazione |
|---|---|---|
| `id` | string | `post->ID` come stringa |
| `slug` | string | `post_name` |
| `tipo` | `nuova\|usata\|km0` | meta `tipo_veicolo` |
| `categoria` | `auto\|commerciale` | meta `categoria` |
| `marca` | string | **nome** del termine primario (tax `marca`) |
| `modello` | string | nome del termine primario (tax `modello`) |
| `versione` | string | meta `versione` |
| `anno` | int | anno estratto dalla data `anno_immatricolazione` |
| `km` | int ≥ 0 | meta `km` |
| `prezzoListino` | number | meta `prezzo_listino` |
| `sconto` | number (opzionale) | meta `sconto`, incluso solo se > 0 |
| `prezzoFinale` | number | `promo` se valorizzata, altrimenti `listino − sconto` |
| `alimentazione` | `benzina\|diesel\|ibrido\|elettrico\|gpl\|metano` | slug termine primario (tax `alimentazione`) |
| `cambio` | `manuale\|automatico` | meta `cambio` (`cvt` → `automatico`) |
| `trazione` | `anteriore\|posteriore\|integrale` | meta `trazione` (`4x4` → `integrale`) |
| `carrozzeria` | string | nome termine primario (tax `carrozzeria`) |
| `potenzaCv` | int > 0 | meta `potenza_cv` |
| `colore` | `bianco\|nero\|grigio\|argento\|blu\|rosso\|verde` | normalizzazione del testo libero `colore_esterno` (IT+EN) |
| `badge` | `(pronta\|promo\|ibrido\|elettrico\|km0\|neopatentati)[]` | derivati dai flag/dati (vedi sotto) |
| `inEvidenza` | bool | meta `in_evidenza` |
| `scadenzaOfferta` | string (opzionale) | meta `data_scadenza_offerta`, incluso se non vuoto |
| `copertina` | `AutoImage` | prima immagine galleria/thumbnail |

**Derivazione badge**: `pronta` ⟸ `pronta_consegna`; `promo` ⟸ `prezzoFinale < prezzoListino`;
`km0` ⟸ `tipo === km0`; `ibrido`/`elettrico` ⟸ alimentazione; `neopatentati` ⟸ omonimo flag.

**`AutoImage`**: `{ src, srcset?, width>0, height>0, alt }`. `src` è la size
`large` (fallback `medium`/`full`/`thumbnail`); `srcset` è costruito da tutte le
size disponibili (`url width w`).

## GET `/autos/{slug}` → `Auto`

Tutti i campi di `AutoSummary` (senza `copertina`) più:

| Campo | Tipo | Origine |
|---|---|---|
| `galleria` | `AutoImage[]` (min 1) | meta `galleria` (fallback: copertina) |
| `dotazioni` | string[] | meta `dotazioni_serie` |
| `optional` | string[] | meta `optional` |
| `specifiche` | Record<string,string> | scheda tecnica sintetica (label → valore) |

## GET `/pages/{key}` → `PageContent`

Parametri: `lang`. `key` ∈ `home|officina|noleggio|chi-siamo|contatti`.

Sempre: `key`, `title`. Per `home`: blocchi `hero`, `bento`, `service`
(campi opzionali `eyebrow`/`titleAccent`/`subtitle` inclusi solo se valorizzati;
`stats` derivati dai campi ripetibili nel formato `valore|etichetta`). Per le
altre pagine: `body` (testo principale) se presente.

## GET `/settings` → `SiteSettings`

`nomeAzienda`, `ragioneSociale`, `partitaIva`, `indirizzo`, `telefono`,
`whatsapp`, `email` (stringhe non vuote), `orari` (`{giorni, apertura}[]`,
parsati dal testo `Giorni: Apertura` una fascia per riga) e `social`
(`facebook`/`instagram`/`whatsapp`, inclusi solo se valorizzati; `whatsapp` è un
link `https://wa.me/<numero>`).

---

## Modalità STRICT del data layer

`web/src/lib/api` di default prova la REST WordPress e, in caso di errore di
fetch o di validazione zod, **ricade sul dataset mock** (`mock/*`), così
`npm run build` funziona anche senza CMS.

Impostando la variabile d'ambiente **`WP_API_STRICT=1`** il fallback è
disattivato: ogni errore di fetch/validazione (o una risorsa attesa ma assente)
viene **propagato**, facendo fallire il build statico. È lo strumento per
verificare che il frontend live consumi i dati reali senza mascherare i
disallineamenti col CMS.

```bash
# Prova end-to-end contro il WP locale (deve completare senza fallback)
cd web
WP_API_STRICT=1 WP_API_URL=http://localhost:8890/wp-json/mariani/v1 npm run build
```

Default (variabile assente) = comportamento storico con fallback al mock.
Implementazione: `isStrict()` in `web/src/lib/api/client.ts`; `withFallback` /
`withNullableFallback` in `web/src/lib/api/index.ts`.
