import { z } from "zod";
import { autoImageSchema } from "./auto";

/**
 * Impostazioni del sito editabili in WordPress
 * (`wp-json/mariani/v1/settings`). Contatti, orari, social, dati legali.
 */

export const orarioSchema = z.object({
  giorni: z.string().min(1),
  apertura: z.string(),
});
export type Orario = z.infer<typeof orarioSchema>;

export const socialSchema = z.object({
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(),
});
export type Social = z.infer<typeof socialSchema>;

/** Coordinate geografiche della sede (marker mappa Leaflet). */
export const geoPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});
export type GeoPoint = z.infer<typeof geoPointSchema>;

export const siteSettingsSchema = z.object({
  nomeAzienda: z.string().min(1),
  ragioneSociale: z.string().min(1),
  partitaIva: z.string().min(1),
  indirizzo: z.string().min(1),
  telefono: z.string().min(1),
  telefonoAssistenza: z.string().optional(),
  whatsapp: z.string().min(1),
  email: z.email(),
  mapsUrl: z.string().optional(),
  mappa: geoPointSchema.optional(),
  orari: z.array(orarioSchema).default([]),
  orariOfficina: z.array(orarioSchema).default([]),
  social: socialSchema.default({}),
  /** Immagine hero della home (stessa forma di AutoImage); null/assente ⇒ fallback all'asset locale. */
  heroImage: autoImageSchema.nullish(),
  /** Credito foto mostrato in hero e footer; assente ⇒ fallback alla label i18n. */
  fotoCredit: z.string().optional(),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
