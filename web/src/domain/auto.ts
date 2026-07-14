import { z } from "zod";

/**
 * Entità di dominio "Auto" e relativi schemi zod.
 * Gli schemi validano i DTO REST (`wp-json/mariani/v1/autos*`) al confine:
 * nessun dato non validato entra nel resto dell'applicazione.
 */

export const autoTipoSchema = z.enum(["nuova", "usata", "km0"]);
export type AutoTipo = z.infer<typeof autoTipoSchema>;

export const autoCategoriaSchema = z.enum(["auto", "commerciale"]);
export type AutoCategoria = z.infer<typeof autoCategoriaSchema>;

export const alimentazioneSchema = z.enum([
  "benzina",
  "diesel",
  "ibrido",
  "elettrico",
  "gpl",
  "metano",
]);
export type Alimentazione = z.infer<typeof alimentazioneSchema>;

export const cambioSchema = z.enum(["manuale", "automatico"]);
export type Cambio = z.infer<typeof cambioSchema>;

export const trazioneSchema = z.enum(["anteriore", "posteriore", "integrale"]);
export type Trazione = z.infer<typeof trazioneSchema>;

/** Colore canonico (token stabile): la label localizzata e lo swatch vivono nella UI. */
export const coloreSchema = z.enum([
  "bianco",
  "nero",
  "grigio",
  "argento",
  "blu",
  "rosso",
  "verde",
]);
export type Colore = z.infer<typeof coloreSchema>;

export const badgeSchema = z.enum([
  "pronta",
  "promo",
  "ibrido",
  "elettrico",
  "km0",
  "neopatentati",
]);
export type Badge = z.infer<typeof badgeSchema>;

/** Immagine con dati sufficienti per un rendering responsive senza layout shift. */
export const autoImageSchema = z.object({
  src: z.string().min(1),
  srcset: z.string().optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string(),
});
export type AutoImage = z.infer<typeof autoImageSchema>;

/** Campi comuni tra scheda completa e riepilogo (card). */
const autoBaseSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  /**
   * Legame di traduzione Polylang esposto dall'API: mappa locale→slug reale
   * (incluso il locale corrente). Consente hreflang e switcher lingua esatti
   * senza euristiche. Opzionale: assente se Polylang non è attivo lato CMS.
   */
  traduzioni: z.record(z.string(), z.string()).optional(),
  tipo: autoTipoSchema,
  categoria: autoCategoriaSchema,
  marca: z.string().min(1),
  modello: z.string().min(1),
  versione: z.string(),
  anno: z.number().int(),
  km: z.number().int().nonnegative(),
  prezzoListino: z.number().nonnegative(),
  sconto: z.number().nonnegative().optional(),
  prezzoFinale: z.number().nonnegative(),
  alimentazione: alimentazioneSchema,
  cambio: cambioSchema,
  trazione: trazioneSchema,
  carrozzeria: z.string().min(1),
  potenzaCv: z.number().int().nonnegative(),
  colore: coloreSchema,
  badge: z.array(badgeSchema).default([]),
  inEvidenza: z.boolean().default(false),
  scadenzaOfferta: z.string().optional(),
});

/** Riepilogo usato nelle griglie/card: immagine di copertina singola. */
export const autoSummarySchema = autoBaseSchema.extend({
  copertina: autoImageSchema,
});
export type AutoSummary = z.infer<typeof autoSummarySchema>;

/** Scheda completa: galleria, dotazioni, specifiche tecniche. */
export const autoSchema = autoBaseSchema.extend({
  galleria: z.array(autoImageSchema).min(1),
  dotazioni: z.array(z.string()).default([]),
  optional: z.array(z.string()).default([]),
  specifiche: z.record(z.string(), z.string()).default({}),
});
export type Auto = z.infer<typeof autoSchema>;

export const autoSummaryListSchema = z.array(autoSummarySchema);
