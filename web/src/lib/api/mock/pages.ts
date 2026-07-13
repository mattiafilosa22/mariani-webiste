import type { PageContent } from "@/domain";
import type { Locale } from "@/i18n/routing";

/**
 * Contenuti editoriali demo per locale. In produzione arrivano da
 * `wp-json/mariani/v1/pages/{key}` (Polylang gestisce le traduzioni).
 */
export const mockPages: Record<Locale, Record<string, PageContent>> = {
  it: {
    home: {
      key: "home",
      title: "Mariani · Concessionaria Ford Blubay",
      subtitle:
        "Auto nuove, usate, Km0, veicoli commerciali, noleggio e officina.",
      hero: {
        eyebrow: "Concessionaria Ford ufficiale · Sede unica",
        title: "La tua prossima Ford,",
        titleAccent: "senza compromessi.",
        subtitle:
          "Nuovo, usato garantito, Km 0 e veicoli commerciali. Più officina autorizzata e noleggio a lungo termine, in un'unica sede di fiducia.",
        stats: [
          { value: "30+", label: "anni di attività" },
          { value: "400+", label: "veicoli disponibili" },
          { value: "10.000+", label: "clienti soddisfatti" },
        ],
      },
      bento: {
        eyebrow: "Perché Mariani",
        title: "Una concessionaria, ogni servizio",
        subtitle:
          "Dalla scelta dell'auto alla consegna, fino all'officina: un unico punto di riferimento di cui fidarti.",
        feature: {
          title: "Vieni a vedere lo showroom",
          text: "Oltre 400 veicoli tra nuovo, usato garantito, Km 0 e commerciali, pronti in un'unica sede.",
        },
        highlight: {
          title: "Finanziamento e leasing su misura",
          text: "Soluzioni personalizzate per privati, aziende e P.IVA, con preventivo trasparente anche online.",
        },
        stats: [
          { value: "24", label: "mesi di garanzia sull'usato" },
          { value: "1 giorno", label: "valutazione permuta" },
        ],
      },
      service: {
        eyebrow: "Service Ford autorizzato",
        title: "Officina, tagliandi e ricambi originali",
        lead: "La tua Ford in mani esperte. Tecnici certificati, diagnosi computerizzata e solo ricambi originali Ford, con preventivo chiaro prima di ogni intervento.",
        checklist: [
          "Tagliandi e manutenzione programmata",
          "Diagnosi elettronica e revisioni",
          "Auto di cortesia su richiesta",
        ],
      },
    },
    noleggio: {
      key: "noleggio",
      title: "Noleggio a lungo termine",
      pageHero: {
        eyebrow: "Noleggio a lungo termine",
        title: "Guida una Ford nuova, pensiamo a tutto noi",
        subtitle:
          "Un canone fisso mensile, durata flessibile e zero pensieri: manutenzione, assicurazione e assistenza sono già incluse.",
      },
      noleggio: {
        vantaggi: [
          { title: "Canone fisso mensile", text: "Una rata costante e prevedibile, per gestire il budget senza imprevisti." },
          { title: "Manutenzione inclusa", text: "Tagliandi e interventi nella nostra officina Ford autorizzata, sempre compresi." },
          { title: "Assicurazione completa", text: "RCA, furto, incendio e Kasko già attive fin dal primo giorno." },
          { title: "Nessuna spesa imprevista", text: "Bollo, assistenza stradale e gestione sinistri sono già nel canone." },
        ],
        serviziInclusi: [
          "Manutenzione ordinaria",
          "Manutenzione straordinaria",
          "Assistenza stradale H24",
          "Assicurazione RCA",
          "Incendio e furto",
          "Danni (Kasko)",
          "Gestione sinistri",
        ],
        steps: [
          { title: "Scegli il veicolo", text: "Seleziona la Ford che fa per te tra la nostra gamma di auto e veicoli commerciali." },
          { title: "Definisci durata e km", text: "Imposta la durata del contratto e la percorrenza annua più adatta a te." },
          { title: "Scegli i servizi", text: "Aggiungi i servizi che desideri: dalla copertura Kasko all'auto sostitutiva." },
          { title: "Parti", text: "Ritiri la tua Ford pronta all'uso in sede e inizi subito a guidare." },
        ],
        durataMin: 12,
        durataMax: 72,
        ctaLabel: "Richiedi un preventivo",
        ctaUrl: "#richiesta",
      },
    },
    officina: {
      key: "officina",
      title: "Officina",
      pageHero: {
        eyebrow: "Service Ford autorizzato · Sede unica",
        title: "La tua Ford in mani esperte",
        subtitle:
          "Tagliando, revisione e interventi di officina nella nostra sede autorizzata, con solo ricambi originali Ford.",
      },
      officina: {
        servizi: [
          { title: "Tagliando", text: "Manutenzione programmata secondo il piano Ford, con check-up completo e ricambi originali." },
          { title: "Revisione", text: "Revisione periodica del veicolo gestita direttamente in sede, senza code." },
          { title: "Officina", text: "Riparazioni meccaniche, diagnosi elettronica e interventi da tecnici certificati Ford." },
        ],
        steps: [
          { title: "Lasciaci i dati", text: "Nome, targa e un recapito: bastano pochi secondi." },
          { title: "Ti confermiamo", text: "Ti ricontattiamo per fissare l'appuntamento." },
          { title: "Pensiamo a tutto noi", text: "Ti avvisiamo appena la tua Ford è pronta." },
        ],
        ctaLabel: "Prenota un intervento",
        ctaUrl: "#prenota",
      },
    },
    "chi-siamo": {
      key: "chi-siamo",
      title: "Chi siamo",
      pageHero: {
        eyebrow: "La nostra storia",
        title: "Da oltre 30 anni, la tua Ford di fiducia",
        subtitle:
          "Una sola sede, un unico punto di riferimento: dalla scelta dell'auto al service, ti accompagniamo con la cura di sempre.",
      },
      chiSiamo: {
        storia:
          "<p>La concessionaria Mariani nasce nei primi anni '90 dalla passione di una famiglia per il marchio Ford. Da una piccola officina di quartiere siamo cresciuti fino a diventare un punto di riferimento del territorio, senza mai cambiare il nostro modo di lavorare: trasparenza, rapporto diretto e tempo dedicato a ogni cliente.</p><p>Come concessionaria e officina autorizzata Ford Blubay lavoriamo a stretto contatto con la casa madre: formazione continua, strumenti diagnostici originali e ricambi certificati.</p>",
        comeRaggiungerci:
          "Siamo in Via Adige 3 a Piombino, a pochi minuti dal centro e dal porto. Ampio parcheggio clienti disponibile.",
        stats: [
          { value: "30+", label: "Anni di attività al servizio dei clienti" },
          { value: "10.000+", label: "Clienti che ci hanno scelto nel tempo" },
        ],
      },
    },
    contatti: {
      key: "contatti",
      title: "Contatti",
      pageHero: {
        eyebrow: "Parla con Mariani",
        title: "Vieni a trovarci",
        subtitle:
          "Siamo a Piombino, in Via Adige 3. Chiamaci, scrivici o passa in concessionaria: siamo a tua disposizione.",
      },
    },
    "privacy-policy": {
      key: "privacy-policy",
      title: "Privacy Policy",
      legal: {
        body:
          "<p>La presente informativa descrive le modalità di trattamento dei dati personali degli utenti che consultano il sito e utilizzano i moduli di contatto, ai sensi del Regolamento UE 2016/679 (GDPR).</p><h2>Titolare del trattamento</h2><p>Titolare del trattamento è Mariani S.r.l., Via Adige 3, 57025 Piombino (LI).</p><h2>Finalità e base giuridica</h2><p>I dati forniti tramite i moduli sono trattati per rispondere alle richieste di informazioni, preventivo o appuntamento. Il conferimento è facoltativo ma necessario per dare seguito alla richiesta.</p><h2>Diritti dell'interessato</h2><p>In ogni momento è possibile esercitare i diritti di accesso, rettifica, cancellazione e opposizione scrivendo a info@marianiford.it.</p>",
        updatedAt: "2026-01-01",
      },
    },
    "cookie-policy": {
      key: "cookie-policy",
      title: "Cookie Policy",
      legal: {
        body:
          "<p>Questo sito utilizza cookie tecnici necessari al funzionamento e, previo consenso, cookie di terze parti per finalità statistiche e di profilazione.</p><h2>Cookie tecnici</h2><p>Sono indispensabili per la corretta navigazione e non richiedono consenso.</p><h2>Mappa OpenStreetMap</h2><p>Le mappe sono servite tramite tile OpenStreetMap senza cookie di profilazione.</p><h2>Gestione delle preferenze</h2><p>È possibile gestire o revocare il consenso in qualsiasi momento dalle impostazioni del browser.</p>",
        updatedAt: "2026-01-01",
      },
    },
  },
  en: {
    home: {
      key: "home",
      title: "Mariani · Ford Blubay Dealership",
      subtitle:
        "New, used and zero-km cars, commercial vehicles, rental and workshop.",
      hero: {
        eyebrow: "Official Ford dealership · Single location",
        title: "Your next Ford,",
        titleAccent: "no compromises.",
        subtitle:
          "New, certified used, zero-km and commercial vehicles. Plus an authorised workshop and long-term rental, all under one trusted roof.",
        stats: [
          { value: "30+", label: "years in business" },
          { value: "400+", label: "vehicles available" },
          { value: "10,000+", label: "happy customers" },
        ],
      },
      bento: {
        eyebrow: "Why Mariani",
        title: "One dealership, every service",
        subtitle:
          "From choosing your car to delivery and servicing: a single point of reference you can trust.",
        feature: {
          title: "Come and see the showroom",
          text: "Over 400 vehicles across new, certified used, zero-km and commercial, all ready in one location.",
        },
        highlight: {
          title: "Tailored financing and leasing",
          text: "Custom solutions for individuals, businesses and VAT holders, with a transparent quote online too.",
        },
        stats: [
          { value: "24", label: "months warranty on used cars" },
          { value: "1 day", label: "trade-in valuation" },
        ],
      },
      service: {
        eyebrow: "Authorised Ford service",
        title: "Workshop, servicing and genuine parts",
        lead: "Your Ford in expert hands. Certified technicians, computerised diagnostics and only genuine Ford parts, with a clear quote before every job.",
        checklist: [
          "Scheduled servicing and maintenance",
          "Electronic diagnostics and inspections",
          "Courtesy car on request",
        ],
      },
    },
    noleggio: {
      key: "noleggio",
      title: "Long-term rental",
      pageHero: {
        eyebrow: "Long-term rental",
        title: "Drive a brand-new Ford, we take care of everything",
        subtitle:
          "A fixed monthly fee, flexible duration and no worries: maintenance, insurance and assistance are all included.",
      },
      noleggio: {
        vantaggi: [
          { title: "Fixed monthly fee", text: "A constant, predictable instalment to manage your budget without surprises." },
          { title: "Maintenance included", text: "Servicing and repairs at our authorised Ford workshop, always included." },
          { title: "Full insurance", text: "Third-party, theft, fire and collision cover active from day one." },
          { title: "No unexpected costs", text: "Road tax, roadside assistance and claims handling are already in the fee." },
        ],
        serviziInclusi: [
          "Routine maintenance",
          "Major maintenance",
          "24/7 roadside assistance",
          "Third-party insurance",
          "Fire and theft",
          "Collision (Kasko)",
          "Claims handling",
        ],
        steps: [
          { title: "Choose the vehicle", text: "Select the Ford that suits you from our range of cars and commercial vehicles." },
          { title: "Set duration and mileage", text: "Choose the contract length and annual mileage that best fit your needs." },
          { title: "Choose the services", text: "Add the services you want, from collision cover to a replacement car." },
          { title: "Get going", text: "Collect your ready-to-drive Ford at our site and start driving straight away." },
        ],
        durataMin: 12,
        durataMax: 72,
        ctaLabel: "Request a quote",
        ctaUrl: "#richiesta",
      },
    },
    officina: {
      key: "officina",
      title: "Workshop",
      pageHero: {
        eyebrow: "Authorised Ford service · Single location",
        title: "Your Ford in expert hands",
        subtitle:
          "Servicing, inspection and workshop jobs at our authorised site, with only genuine Ford parts.",
      },
      officina: {
        servizi: [
          { title: "Service", text: "Scheduled maintenance to the Ford plan, with a full vehicle check-up and genuine parts." },
          { title: "Inspection", text: "Periodic vehicle inspection handled directly on site, without queues." },
          { title: "Workshop", text: "Mechanical repairs, electronic diagnostics and work by certified Ford technicians." },
        ],
        steps: [
          { title: "Leave us your details", text: "Name, plate and a contact: it only takes a few seconds." },
          { title: "We confirm", text: "We get back to you to arrange the appointment." },
          { title: "We handle everything", text: "We let you know as soon as your Ford is ready." },
        ],
        ctaLabel: "Book a service",
        ctaUrl: "#prenota",
      },
    },
    "chi-siamo": {
      key: "chi-siamo",
      title: "About us",
      pageHero: {
        eyebrow: "Our story",
        title: "For over 30 years, your trusted Ford",
        subtitle:
          "One location, one point of reference: from choosing your car to servicing, we support you with the same care as always.",
      },
      chiSiamo: {
        storia:
          "<p>The Mariani dealership was founded in the early '90s from a family's passion for the Ford brand. From a small neighbourhood workshop we have grown into a local landmark, without ever changing the way we work: transparency, a direct relationship and time dedicated to every customer.</p><p>As an authorised Ford Blubay dealership and workshop we work closely with the manufacturer: ongoing training, original diagnostic tools and certified parts.</p>",
        comeRaggiungerci:
          "We are at Via Adige 3 in Piombino, a few minutes from the town centre and the harbour. Large customer car park available.",
        stats: [
          { value: "30+", label: "Years serving our customers" },
          { value: "10,000+", label: "Customers who have chosen us over time" },
        ],
      },
    },
    contatti: {
      key: "contatti",
      title: "Contact",
      pageHero: {
        eyebrow: "Talk to Mariani",
        title: "Come and visit us",
        subtitle:
          "We are in Piombino, at Via Adige 3. Call us, write to us or drop by the dealership: we are at your service.",
      },
    },
    "privacy-policy": {
      key: "privacy-policy",
      title: "Privacy Policy",
      legal: {
        body:
          "<p>This notice describes how the personal data of users who browse the site and use the contact forms is processed, pursuant to EU Regulation 2016/679 (GDPR).</p><h2>Data controller</h2><p>The data controller is Mariani S.r.l., Via Adige 3, 57025 Piombino (LI), Italy.</p><h2>Purposes and legal basis</h2><p>Data provided through the forms is processed to respond to requests for information, quotes or appointments. Providing it is optional but required to follow up on the request.</p><h2>Rights of the data subject</h2><p>You may exercise your rights of access, rectification, erasure and objection at any time by writing to info@marianiford.it.</p>",
        updatedAt: "2026-01-01",
      },
    },
    "cookie-policy": {
      key: "cookie-policy",
      title: "Cookie Policy",
      legal: {
        body:
          "<p>This site uses technical cookies necessary for its operation and, subject to consent, third-party cookies for statistical and profiling purposes.</p><h2>Technical cookies</h2><p>They are essential for correct browsing and do not require consent.</p><h2>OpenStreetMap map</h2><p>Maps are served through OpenStreetMap tiles without profiling cookies.</p><h2>Managing preferences</h2><p>You can manage or withdraw consent at any time from your browser settings.</p>",
        updatedAt: "2026-01-01",
      },
    },
  },
};
