import type { AutoSummary } from "@/domain";

/**
 * Seleziona le auto da mostrare nello slider "Auto in offerta":
 * solo quelle marcate `inEvidenza`, mantenendo l'ordine di provenienza
 * (già ordinato dal CMS) e limitando il numero di slide.
 */
export function selectFeatured(
  autos: readonly AutoSummary[],
  limit = 8
): AutoSummary[] {
  return autos.filter((auto) => auto.inEvidenza).slice(0, Math.max(0, limit));
}
