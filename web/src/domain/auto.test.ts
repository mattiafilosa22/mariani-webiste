import { describe, expect, it } from "vitest";
import { autoSchema, autoSummarySchema } from "./auto";

/**
 * Validazione degli schemi zod al confine REST, a partire da un JSON
 * *grezzo* (non tipizzato) come quello restituito da `wp-json/mariani/v1/*`.
 * A differenza dei test in `src/lib/mappers/auto.test.ts` (che costruiscono
 * oggetti già tipizzati `Auto`/`AutoSummary` e quindi bypassano il parsing),
 * qui si esercita davvero `.safeParse`: è questo il confine che, prima del
 * fix, faceva fallire la validazione dell'intera lista per le 29 auto del
 * listino Ford senza foto e faceva ripiegare il build sui dati mock.
 */

/** JSON grezzo minimo ma completo di un riepilogo (card) valido. */
const validAutoSummaryJson = {
  id: "1",
  slug: "ford-puma",
  tipo: "nuova",
  categoria: "auto",
  marca: "Ford",
  modello: "Puma",
  versione: "1.0 EcoBoost Hybrid",
  anno: 2024,
  km: 12400,
  prezzoListino: 28500,
  prezzoFinale: 24900,
  alimentazione: "ibrido",
  cambio: "automatico",
  trazione: "anteriore",
  carrozzeria: "SUV compatto",
  potenzaCv: 125,
  colore: "blu",
  badge: [],
  inEvidenza: false,
  copertina: {
    src: "/img/p.jpg",
    width: 640,
    height: 360,
    alt: "Ford Puma",
  },
};

/** JSON grezzo minimo ma completo di una scheda completa valida. */
const validAutoJson = {
  ...validAutoSummaryJson,
  galleria: [validAutoSummaryJson.copertina],
  dotazioni: [],
  optional: [],
  specifiche: {},
};

describe("autoSummarySchema — confine REST", () => {
  it("accetta un riepilogo con copertina valorizzata", () => {
    const result = autoSummarySchema.safeParse(validAutoSummaryJson);
    expect(result.success).toBe(true);
  });

  it("accetta un riepilogo con copertina null (veicolo senza foto in WP)", () => {
    const result = autoSummarySchema.safeParse({
      ...validAutoSummaryJson,
      copertina: null,
    });
    expect(result.success).toBe(true);
  });

  it("rifiuta un riepilogo con copertina assente (undefined)", () => {
    const withoutCopertina: Record<string, unknown> = { ...validAutoSummaryJson };
    delete withoutCopertina.copertina;
    const result = autoSummarySchema.safeParse(withoutCopertina);
    expect(result.success).toBe(false);
  });
});

describe("autoSchema — confine REST", () => {
  it("accetta una scheda con galleria valorizzata", () => {
    const result = autoSchema.safeParse(validAutoJson);
    expect(result.success).toBe(true);
  });

  it("accetta una scheda con galleria vuota (veicolo senza foto in WP)", () => {
    const result = autoSchema.safeParse({ ...validAutoJson, galleria: [] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.galleria).toEqual([]);
    }
  });

  it("rifiuta una scheda con un'immagine di galleria malformata", () => {
    const result = autoSchema.safeParse({
      ...validAutoJson,
      galleria: [{ src: "", width: -1, height: 0, alt: "x" }],
    });
    expect(result.success).toBe(false);
  });
});
