import type { Alimentazione, Auto, AutoImage, Cambio, Colore, Trazione } from "@/domain";

/**
 * Dataset demo usato quando WordPress non è disponibile (build senza CMS).
 * Rispecchia le 14 auto reali del concessionario: i dati numerici non ancora
 * confermati (km, anno, prezzi, potenza) sono a 0, salvo quelli comunicati
 * (prezzi; anno/km/potenza di Kuga usata e Capri), e la UI li rende come
 * "n.d." o "Prezzo su richiesta". Cambio, trazione e colore non comunicati
 * sono `null` e la UI omette la voce. I dati rispettano gli schemi zod del
 * dominio.
 */

function cover(alt: string): AutoImage {
  return {
    src: "/img/placeholder-car.svg",
    width: 640,
    height: 360,
    alt,
  };
}

type RealCar = {
  id: string;
  slug: string;
  tipo: Auto["tipo"];
  categoria: Auto["categoria"];
  marca: string;
  modello: string;
  versione: string;
  alimentazione: Alimentazione;
  cambio: Cambio | null;
  /** Assente = anteriore (come il seeder); `null` = non comunicata. */
  trazione?: Trazione | null;
  carrozzeria: string;
  colore: Colore | null;
  badge: Auto["badge"];
  inEvidenza: boolean;
  /** Prezzo comunicato dal concessionario; assente = prezzo su richiesta. */
  prezzo?: number;
  /** Anno comunicato; assente = 0 (n.d.). */
  anno?: number;
  /** Km comunicati; assente = 0. */
  km?: number;
  /** Potenza comunicata; assente = 0 (n.d.). */
  potenzaCv?: number;
  /** Voci tecniche come le espone il presenter WP (es. Cilindrata, Emissioni CO₂). */
  specifiche?: Auto["specifiche"];
  /** Nessuna foto: galleria vuota, copertina null, la UI mostra il segnaposto "foto non disponibile". */
  senzaFoto?: true;
};

/** Dati confermati delle 14 auto reali (il resto è 0/placeholder). */
const realCars: RealCar[] = [
  { id: "1", slug: "ford-explorer", tipo: "nuova", categoria: "auto", marca: "Ford", modello: "Explorer", versione: "", alimentazione: "elettrico", cambio: "automatico", carrozzeria: "SUV", colore: "blu", badge: ["elettrico"], inEvidenza: true },
  { id: "2", slug: "ford-mustang-mach-e", tipo: "nuova", categoria: "auto", marca: "Ford", modello: "Mustang Mach-E", versione: "", alimentazione: "elettrico", cambio: "automatico", carrozzeria: "SUV", colore: "nero", badge: ["elettrico"], inEvidenza: true },
  { id: "3", slug: "ford-puma-st-line-x", tipo: "nuova", categoria: "auto", marca: "Ford", modello: "Puma", versione: "ST-Line X MHEV", alimentazione: "ibrido", cambio: "manuale", carrozzeria: "SUV compatto", colore: "grigio", badge: ["ibrido"], inEvidenza: true },
  { id: "4", slug: "ford-puma-e", tipo: "nuova", categoria: "auto", marca: "Ford", modello: "Puma Gen-E", versione: "", alimentazione: "elettrico", cambio: "automatico", carrozzeria: "SUV compatto", colore: "nero", badge: ["elettrico"], inEvidenza: true },
  { id: "18", slug: "ford-kuga-active-phev", tipo: "usata", categoria: "auto", marca: "Ford", modello: "Kuga", versione: "Active PHEV", alimentazione: "ibrido", cambio: "automatico", trazione: null, carrozzeria: "SUV", colore: "bianco", badge: ["ibrido", "neopatentati"], inEvidenza: false, prezzo: 29900, anno: 2024, km: 49963, potenzaCv: 242, specifiche: { Cilindrata: "2500 cm³", "Emissioni CO₂": "22 g/km" }, senzaFoto: true },
  { id: "9", slug: "ford-puma-bianca-km0", tipo: "km0", categoria: "auto", marca: "Ford", modello: "Puma", versione: "", alimentazione: "benzina", cambio: "manuale", carrozzeria: "SUV compatto", colore: "bianco", badge: ["km0"], inEvidenza: false },
  { id: "10", slug: "ford-tourneo", tipo: "nuova", categoria: "commerciale", marca: "Ford", modello: "Tourneo", versione: "", alimentazione: "diesel", cambio: "manuale", carrozzeria: "Monovolume", colore: "bianco", badge: [], inEvidenza: false },
  { id: "11", slug: "ford-tourneo-custom", tipo: "nuova", categoria: "commerciale", marca: "Ford", modello: "Tourneo Custom", versione: "", alimentazione: "diesel", cambio: "manuale", carrozzeria: "Furgone", colore: "nero", badge: [], inEvidenza: false },
  { id: "12", slug: "omoda-5", tipo: "nuova", categoria: "auto", marca: "Omoda", modello: "5", versione: "SHS FHEV", alimentazione: "ibrido", cambio: "automatico", carrozzeria: "SUV compatto", colore: "nero", badge: ["ibrido"], inEvidenza: true },
  { id: "13", slug: "omoda-7", tipo: "nuova", categoria: "auto", marca: "Omoda", modello: "7", versione: "SHS PHEV", alimentazione: "ibrido", cambio: "automatico", carrozzeria: "SUV", colore: "nero", badge: ["ibrido"], inEvidenza: true },
  { id: "14", slug: "jaecoo-7", tipo: "nuova", categoria: "auto", marca: "Jaecoo", modello: "7", versione: "SHS PHEV", alimentazione: "ibrido", cambio: "automatico", carrozzeria: "SUV", colore: "nero", badge: ["ibrido"], inEvidenza: true },
  { id: "15", slug: "jaecoo-8", tipo: "nuova", categoria: "auto", marca: "Jaecoo", modello: "8", versione: "PHEV", alimentazione: "ibrido", cambio: "automatico", carrozzeria: "SUV", colore: "bianco", badge: ["ibrido"], inEvidenza: true },
  // Dati non comunicati dal concessionario (null): cambio/trazione/colore del Ranger, trazione di Capri e Kuga.
  { id: "16", slug: "ford-ranger", tipo: "nuova", categoria: "commerciale", marca: "Ford", modello: "Ranger", versione: "", alimentazione: "diesel", cambio: null, trazione: null, carrozzeria: "Pick-up", colore: null, badge: [], inEvidenza: false },
  { id: "17", slug: "ford-capri-km0", tipo: "km0", categoria: "auto", marca: "Ford", modello: "Capri", versione: "", alimentazione: "elettrico", cambio: "automatico", trazione: null, carrozzeria: "SUV", colore: "bianco", badge: ["km0", "elettrico"], inEvidenza: false, prezzo: 43900, anno: 2025, km: 0, potenzaCv: 286 },
];

/** Espande i dati confermati in DTO completi con i campi numerici a 0. */
function toMockAuto(car: RealCar): Auto {
  const title = `${car.marca} ${car.modello}${car.versione ? ` ${car.versione}` : ""}`;
  return {
    id: car.id,
    slug: car.slug,
    tipo: car.tipo,
    categoria: car.categoria,
    marca: car.marca,
    modello: car.modello,
    versione: car.versione,
    anno: car.anno ?? 0,
    km: car.km ?? 0,
    prezzoListino: car.prezzo ?? 0,
    prezzoFinale: car.prezzo ?? 0,
    alimentazione: car.alimentazione,
    cambio: car.cambio,
    trazione: car.trazione === undefined ? "anteriore" : car.trazione,
    carrozzeria: car.carrozzeria,
    potenzaCv: car.potenzaCv ?? 0,
    colore: car.colore,
    badge: car.badge,
    inEvidenza: car.inEvidenza,
    galleria: car.senzaFoto ? [] : [cover(`${title} — Mariani Concessionaria, Piombino`)],
    dotazioni: [],
    optional: [],
    specifiche: car.specifiche ?? {},
  };
}

const mockAutosData: Auto[] = realCars.map(toMockAuto);

/**
 * Il dataset demo è monolingua: senza CMS la stessa scheda viene servita per
 * entrambi i locali con lo stesso slug. Il legame di traduzione (`traduzioni`)
 * riflette questa realtà mappando ogni locale sullo slug del veicolo, così gli
 * hreflang restano reciproci e puntano a URL esistenti anche nel build mock.
 */
export const mockAutos: Auto[] = mockAutosData.map((auto) => ({
  ...auto,
  traduzioni: { it: auto.slug, en: auto.slug },
}));
