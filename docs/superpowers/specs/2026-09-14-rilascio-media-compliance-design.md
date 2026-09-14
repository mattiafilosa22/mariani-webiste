# Media homepage e preparazione al rilascio

Data: 14 settembre 2026

## Obiettivo

Preparare la preview di Mariani Auto a un rilascio pubblico tecnicamente solido, senza attivare il dominio pubblico. La lavorazione completa le immagini della homepage e del catalogo, corregge identità e testi, allinea il trattamento dei dati all'assenza di sistemi di tracciamento, e verifica responsive design, accessibilità, SEO e reperibilità tramite motori di ricerca e assistenti AI.

La pubblicazione finale di `mariani-auto.it` resta esclusa: il dominio pubblico continuerà a mostrare la pagina “coming soon” e la preview resterà protetta fino a un ordine esplicito di go-live.

## Decisioni approvate

- Nessuna integrazione di Google Analytics, GA4, Meta Pixel o altro sistema pubblicitario o statistico.
- Nessun banner cookie finché il sito usa soltanto cookie o meccanismi strettamente tecnici.
- Conservazione dei lead ricevuti dai moduli per 12 mesi, seguita da cancellazione automatica.
- Partita IVA ufficiale: `01300000492`.
- Le immagini editoriali della homepage saranno gestibili dal CMS.
- Le auto prive di una fotografia compatibile mostreranno la dicitura “Foto disponibile su richiesta”; non saranno usate immagini di modelli o allestimenti diversi.
- Il sottotitolo “Ford Blubay · Concessionaria” sarà rimosso dagli elementi di brand visibili nell'header e nel footer.

## 1. Immagini editoriali della homepage

Saranno prodotte due immagini fotografiche originali, coerenti per luce, colore e taglio con l'identità visiva del sito:

1. una scena in concessionaria con una persona che consulta un catalogo automobilistico, destinata al riquadro “Una concessionaria, ogni servizio”;
2. un'officina automobilistica ordinata e professionale, con tecnici al lavoro e senza loghi di terzi, destinata alla sezione Service.

Le immagini non conterranno testo incorporato, marchi inventati, targhe leggibili o dettagli fuorvianti. Saranno ottimizzate in formato web, con dimensioni adeguate agli slot e una variante sorgente sufficientemente ampia per schermi ad alta densità.

Il CMS riceverà due campi immagine dedicati nelle pagine Home italiana e inglese. L'API esporrà URL, dimensioni e testo alternativo attraverso lo stesso trasformatore media già usato dal progetto. Il frontend userà immagini responsive, dimensioni dichiarate e caricamento differito quando non sono nel primo viewport. Se un campo non è valorizzato, il layout resterà stabile e mostrerà il fallback grafico esistente.

I file saranno inclusi anche nei seed del CMS, così un ripristino dell'ambiente non perderà le associazioni. I testi alternativi saranno descrittivi e localizzati, senza formule come “immagine di”.

## 2. Catalogo e veicoli in evidenza

Le associazioni già recuperate dalla libreria media saranno mantenute solo quando marca, modello e generazione risultano compatibili. Le otto vetture senza un'immagine attendibile continueranno a usare “Foto disponibile su richiesta”.

La homepage mostrerà otto vetture reali in evidenza, tutte dotate di foto. Il criterio di selezione resterà salvato nel CMS, non hardcoded nel frontend.

Per i veicoli nuovi, chilometraggio e anno di immatricolazione non saranno mostrati quando rappresentano dati non applicabili o sconosciuti. La stessa regola sarà applicata ai dati strutturati: valori sentinella come anno `0` e chilometraggio `0` non dovranno essere pubblicati come fatti reali.

## 3. Identità aziendale e dati legali

Il sottotitolo “Ford Blubay · Concessionaria” sarà rimosso dall'header e dal blocco brand del footer, compresa la sua occupazione di spazio nel layout. Eventuali riferimenti descrittivi a Ford nei contenuti di servizio o nelle pagine che spiegano davvero l'attività resteranno invariati, salvo incongruenze rilevate durante il collaudo.

La Partita IVA pubblicata nel footer, nei dati del CMS e dove opportuno nei dati strutturati sarà `01300000492`. Il valore segnaposto `01234567890` dovrà scomparire dall'export e dalla preview.

## 4. Privacy, moduli e cookie

### Cookie e risorse esterne

In assenza di tracciamento non sarà mostrato un banner con scelte fittizie. La cookie policy descriverà soltanto i meccanismi tecnici realmente presenti, con finalità e durata verificabili. Il link nel footer porterà direttamente alla policy; una voce “Preferenze cookie” non aprirà un centro preferenze inesistente.

La mappa OpenStreetMap non caricherà tile o richieste di terzi all'apertura della pagina. Sarà sostituita da un'anteprima neutra o da un comando “Carica la mappa”: il collegamento esterno verrà inizializzato soltanto dopo un'azione consapevole dell'utente. Indirizzo, telefono e indicazioni resteranno disponibili anche senza caricare la mappa.

Prima del rilascio verrà eseguito un controllo tecnico delle richieste di rete per confermare l'assenza di tracker e di risorse terze non dichiarate. Se emergerà un servizio non tecnico, non verrà silenziosamente consentito: sarà rimosso o subordinato a consenso esplicito.

### Moduli e lead

La casella obbligatoria dei moduli non sarà presentata come consenso al trattamento quando la finalità è rispondere a una richiesta precontrattuale. Il testo diventerà una presa visione dell'informativa privacy, con link funzionante e markup valido. La casella marketing e il relativo dato saranno rimossi perché non esiste una finalità marketing attiva.

La privacy policy indicherà titolare, contatti, finalità, basi giuridiche, categorie di dati, destinatari, eventuali trasferimenti, periodo di conservazione, diritti dell'interessato e modalità di reclamo. I testi italiano e inglese resteranno coerenti.

I lead saranno eliminati automaticamente dopo 12 mesi tramite un processo periodico idempotente nel CMS. La scadenza userà la data di ricezione originale; gli errori saranno registrati senza cancellare elementi più recenti. Sarà possibile verificare il processo in ambiente di test senza attendere il cron reale.

Questa attività costituisce un adeguamento tecnico e contenutistico, non una certificazione legale. Prima del go-live il titolare potrà far validare le informative definitive dal proprio consulente privacy.

## 5. Responsive design e accessibilità

Il collaudo coprirà almeno viewport da 320, 375, 768, 1024 e 1440 pixel, in italiano e inglese. Verranno controllati header, navigazione mobile, hero, bento, Service, card veicolo, scheda veicolo, moduli, footer e pagine legali. Non dovranno esserci overflow orizzontali, sovrapposizioni, testo tagliato o controlli fuori viewport.

L'obiettivo tecnico è WCAG 2.2 livello AA per i template coinvolti. La verifica comprenderà:

- struttura dei titoli, landmark e link di salto;
- navigazione completa da tastiera, ordine del focus e focus visibile;
- nomi accessibili, messaggi di errore e associazione label-controllo nei moduli;
- contrasto di testo, pulsanti e stati interattivi;
- testi alternativi e trattamento corretto delle immagini decorative;
- rispetto di `prefers-reduced-motion`;
- zoom e reflow senza perdita di contenuto.

I controlli automatici saranno affiancati da prove manuali da tastiera e ispezione visiva. Le violazioni bloccanti o serie introdotte o presenti nei flussi principali dovranno essere corrette prima di considerare la preview pronta.

## 6. SEO e indicizzazione per ricerca e AI

Saranno verificati e, dove necessario, corretti:

- title e description univoci e localizzati;
- canonical e alternati `hreflang` italiano/inglese;
- sitemap con sole URL pubblicabili e riferimenti al dominio `https://mariani-auto.it`;
- `robots.txt` coerente con il futuro sito pubblico e con la protezione attuale della preview;
- Open Graph e Twitter card;
- dati strutturati Organization/LocalBusiness, WebSite, Breadcrumb e Vehicle senza proprietà inventate o valori sentinella;
- codici di stato, redirect, pagine 404 e link interni;
- contenuto HTML server-rendered sufficiente anche senza JavaScript.

I file `llms.txt` e `llms-full.txt` saranno corretti per usare `mariani-auto.it` al posto di `marianiford.it` e conterranno soltanto indicazioni e URL reali. `robots.txt` dichiarerà esplicitamente i crawler di ricerca AI conosciuti, senza bloccare i normali crawler; ciò non equivale a garantire l'inclusione nei risultati.

Non saranno aggiunti markup “AI SEO” non standard né contenuti duplicati per i bot. La reperibilità tramite sistemi AI sarà sostenuta dagli stessi segnali verificabili della ricerca organica: accessibilità al crawler, contenuto utile e leggibile, metadati coerenti, entità aziendale chiara e dati strutturati validi.

Finché la preview richiede autenticazione e il dominio pubblico mostra “coming soon”, l'indicizzazione reale non può essere validata. Il collaudo garantirà che gli artefatti di build siano pronti; la scansione pubblica andrà ricontrollata dopo il go-live.

## 7. Flusso di rilascio e sicurezza dei dati

Le modifiche saranno sviluppate seguendo i pattern esistenti e coperte da test prima dell'implementazione. Prima di aggiornare contenuti o metadati del CMS live sarà creato un backup del database. Non saranno rimossi media originali né contenuti del catalogo durante questa lavorazione.

La pipeline dovrà completare lint, typecheck, test e build usando il catalogo reale, senza fallback ai mock. Dopo il deploy in preview saranno controllati:

- presenza e resa delle due immagini CMS;
- otto auto in evidenza e fallback delle auto senza foto;
- assenza di anno/km non applicabili sulle auto nuove;
- correttezza della Partita IVA e rimozione del sottotitolo;
- funzionamento dei moduli e dei link privacy;
- assenza di tracker e caricamento differito della mappa;
- navigazione responsive e da tastiera;
- meta tag, sitemap, robots, file per AI e dati strutturati;
- link interni e asset senza errori.

Il deploy della preview non autorizza lo switch del dominio pubblico. Ogni modifica che abiliti l'indicizzazione o sostituisca la pagina “coming soon” richiederà una successiva conferma esplicita.

## Criteri di accettazione

La lavorazione è completata quando:

1. le due aree fotografiche della homepage mostrano immagini appropriate, configurabili dal CMS e responsive;
2. il catalogo usa soltanto foto compatibili oppure “Foto disponibile su richiesta”, e la homepage mostra otto vetture reali in evidenza;
3. il sottotitolo Ford Blubay non compare nei blocchi brand e la Partita IVA è `01300000492`;
4. non sono presenti GA4, Meta Pixel o altri tracker, non compare un banner cookie inutile e la policy descrive il comportamento reale;
5. la mappa non effettua richieste a terzi prima dell'interazione;
6. i moduli usano la presa visione privacy, non raccolgono consenso marketing e i lead scadono dopo 12 mesi;
7. i flussi principali superano i controlli responsive, tastiera e accessibilità automatizzata senza problemi bloccanti o seri;
8. SEO tecnico, dati strutturati, sitemap, robots e file `llms` sono coerenti con `mariani-auto.it`;
9. test, lint, typecheck e build passano con dati reali e la preview è navigabile end-to-end;
10. il dominio pubblico resta invariato fino all'autorizzazione al go-live.
