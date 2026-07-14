import type { Alimentazione, Auto, AutoImage, Cambio, Colore } from "@/domain";

/**
 * Dataset demo usato quando WordPress non è disponibile (build senza CMS).
 * Rispecchia le 11 auto reali del concessionario: i dati numerici non ancora
 * confermati (km, anno, prezzi, potenza) sono a 0 e la UI li rende come "n.d."
 * o "Prezzo su richiesta". I dati rispettano gli schemi zod del dominio.
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
  modello: string;
  versione: string;
  alimentazione: Alimentazione;
  cambio: Cambio;
  carrozzeria: string;
  colore: Colore;
  badge: Auto["badge"];
  inEvidenza: boolean;
};

/** Dati confermati delle 11 auto reali (il resto è 0/placeholder). */
const realCars: RealCar[] = [
  { id: "1", slug: "ford-explorer", tipo: "nuova", categoria: "auto", modello: "Explorer", versione: "", alimentazione: "elettrico", cambio: "automatico", carrozzeria: "SUV", colore: "blu", badge: ["elettrico"], inEvidenza: true },
  { id: "2", slug: "ford-mustang-mach-e", tipo: "nuova", categoria: "auto", modello: "Mustang Mach-E", versione: "", alimentazione: "elettrico", cambio: "automatico", carrozzeria: "SUV", colore: "nero", badge: ["elettrico"], inEvidenza: true },
  { id: "3", slug: "ford-puma-st-line-x", tipo: "nuova", categoria: "auto", modello: "Puma", versione: "ST-Line X", alimentazione: "benzina", cambio: "manuale", carrozzeria: "SUV compatto", colore: "grigio", badge: [], inEvidenza: true },
  { id: "4", slug: "ford-puma-e", tipo: "nuova", categoria: "auto", modello: "Puma Gen-E", versione: "", alimentazione: "elettrico", cambio: "automatico", carrozzeria: "SUV compatto", colore: "nero", badge: ["elettrico"], inEvidenza: true },
  { id: "5", slug: "ford-focus-grigia-chiaro", tipo: "usata", categoria: "auto", modello: "Focus", versione: "", alimentazione: "benzina", cambio: "manuale", carrozzeria: "Berlina", colore: "grigio", badge: [], inEvidenza: false },
  { id: "6", slug: "ford-focus-grigia-scuro", tipo: "usata", categoria: "auto", modello: "Focus", versione: "", alimentazione: "benzina", cambio: "manuale", carrozzeria: "Berlina", colore: "grigio", badge: [], inEvidenza: false },
  { id: "7", slug: "ford-focus-rossa", tipo: "usata", categoria: "auto", modello: "Focus", versione: "", alimentazione: "benzina", cambio: "manuale", carrozzeria: "Berlina", colore: "rosso", badge: [], inEvidenza: false },
  { id: "8", slug: "ford-kuga-phev", tipo: "usata", categoria: "auto", modello: "Kuga", versione: "PHEV", alimentazione: "ibrido", cambio: "automatico", carrozzeria: "SUV", colore: "nero", badge: ["ibrido"], inEvidenza: true },
  { id: "9", slug: "ford-puma-bianca-km0", tipo: "km0", categoria: "auto", modello: "Puma", versione: "", alimentazione: "benzina", cambio: "manuale", carrozzeria: "SUV compatto", colore: "bianco", badge: ["km0"], inEvidenza: false },
  { id: "10", slug: "ford-tourneo", tipo: "nuova", categoria: "commerciale", modello: "Tourneo", versione: "", alimentazione: "diesel", cambio: "manuale", carrozzeria: "Monovolume", colore: "bianco", badge: [], inEvidenza: false },
  { id: "11", slug: "ford-tourneo-custom", tipo: "nuova", categoria: "commerciale", modello: "Tourneo Custom", versione: "", alimentazione: "diesel", cambio: "manuale", carrozzeria: "Furgone", colore: "nero", badge: [], inEvidenza: false },
];

/** Espande i dati confermati in DTO completi con i campi numerici a 0. */
function toMockAuto(car: RealCar): Auto {
  const title = `Ford ${car.modello}${car.versione ? ` ${car.versione}` : ""}`;
  return {
    id: car.id,
    slug: car.slug,
    tipo: car.tipo,
    categoria: car.categoria,
    marca: "Ford",
    modello: car.modello,
    versione: car.versione,
    anno: 0,
    km: 0,
    prezzoListino: 0,
    prezzoFinale: 0,
    alimentazione: car.alimentazione,
    cambio: car.cambio,
    trazione: "anteriore",
    carrozzeria: car.carrozzeria,
    potenzaCv: 0,
    colore: car.colore,
    badge: car.badge,
    inEvidenza: car.inEvidenza,
    galleria: [cover(`${title} — Mariani Concessionaria, Piombino`)],
    dotazioni: [],
    optional: [],
    specifiche: {},
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
