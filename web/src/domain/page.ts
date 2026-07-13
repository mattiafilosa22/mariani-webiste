import { z } from "zod";

/**
 * Contenuto editoriale di una pagina, gestito in WordPress
 * (`wp-json/mariani/v1/pages/{key}`). I testi NON sono mai hardcoded nel
 * frontend: arrivano da qui (o dal mock in assenza di WP).
 */

export const heroStatSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});
export type HeroStat = z.infer<typeof heroStatSchema>;

export const heroContentSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  titleAccent: z.string().optional(),
  subtitle: z.string(),
  stats: z.array(heroStatSchema).default([]),
});
export type HeroContent = z.infer<typeof heroContentSchema>;

/** Blocco editoriale (titolo + testo) riusato nelle celle bento. */
export const contentBlockSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
});
export type ContentBlock = z.infer<typeof contentBlockSchema>;

/** Statistica sintetica (valore + etichetta) mostrata nel bento. */
export const bentoStatSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});
export type BentoStat = z.infer<typeof bentoStatSchema>;

/** Sezione bento "Una concessionaria, ogni servizio" della home. */
export const homeBentoSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  feature: contentBlockSchema,
  highlight: contentBlockSchema,
  stats: z.array(bentoStatSchema).default([]),
});
export type HomeBento = z.infer<typeof homeBentoSchema>;

/** Sezione officina/assistenza della home (split immagine + testo). */
export const homeServiceSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  lead: z.string().min(1),
  checklist: z.array(z.string().min(1)).default([]),
});
export type HomeService = z.infer<typeof homeServiceSchema>;

/**
 * Hero interno delle pagine editoriali (noleggio, officina, chi-siamo,
 * contatti, legali): occhiello + titolo + sottotitolo, senza statistiche.
 */
export const pageHeroSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().min(1),
});
export type PageHero = z.infer<typeof pageHeroSchema>;

/** Card iconografica (titolo + testo) per vantaggi/servizi. */
export const iconCardSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
});
export type IconCard = z.infer<typeof iconCardSchema>;

/** Passo numerato di un percorso "come funziona". */
export const stepSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
});
export type Step = z.infer<typeof stepSchema>;

/** Contenuti della pagina Noleggio a lungo termine. */
export const noleggioContentSchema = z.object({
  vantaggi: z.array(iconCardSchema).default([]),
  serviziInclusi: z.array(z.string().min(1)).default([]),
  steps: z.array(stepSchema).default([]),
  durataMin: z.number().int().positive(),
  durataMax: z.number().int().positive(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
});
export type NoleggioContent = z.infer<typeof noleggioContentSchema>;

/** Contenuti della pagina Officina / Assistenza. */
export const officinaContentSchema = z.object({
  servizi: z.array(iconCardSchema).default([]),
  steps: z.array(stepSchema).default([]),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
});
export type OfficinaContent = z.infer<typeof officinaContentSchema>;

/** Contenuti della pagina Chi Siamo / Dove Siamo. */
export const chiSiamoContentSchema = z.object({
  storia: z.string().min(1),
  comeRaggiungerci: z.string().optional(),
  stats: z.array(bentoStatSchema).default([]),
});
export type ChiSiamoContent = z.infer<typeof chiSiamoContentSchema>;

/** Contenuti legali (privacy/cookie): corpo HTML sanificato lato WP. */
export const legalContentSchema = z.object({
  body: z.string().min(1),
  updatedAt: z.string().optional(),
});
export type LegalContent = z.infer<typeof legalContentSchema>;

export const pageContentSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  hero: heroContentSchema.optional(),
  pageHero: pageHeroSchema.optional(),
  bento: homeBentoSchema.optional(),
  service: homeServiceSchema.optional(),
  noleggio: noleggioContentSchema.optional(),
  officina: officinaContentSchema.optional(),
  chiSiamo: chiSiamoContentSchema.optional(),
  legal: legalContentSchema.optional(),
  body: z.string().optional(),
});
export type PageContent = z.infer<typeof pageContentSchema>;
