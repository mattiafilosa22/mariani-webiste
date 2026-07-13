import type { AutoSummary } from "@/domain";

/** Sottoinsieme dei campi necessari a calcolare l'affinità tra due veicoli. */
export type SimilarCriteria = Pick<
  AutoSummary,
  "slug" | "categoria" | "tipo" | "marca"
>;

/**
 * Seleziona i veicoli "simili" a quello corrente.
 * Logica pura e deterministica (testabile): esclude il veicolo stesso, assegna
 * un punteggio di affinità (stessa categoria/tipo pesano di più della sola
 * marca) e restituisce i migliori `limit`. Il `sort` stabile preserva l'ordine
 * di provenienza a parità di punteggio.
 */
export function selectSimilar<T extends SimilarCriteria>(
  all: readonly T[],
  current: SimilarCriteria,
  limit = 3
): T[] {
  return all
    .filter((auto) => auto.slug !== current.slug)
    .map((auto) => ({ auto, score: affinity(auto, current) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(0, limit))
    .map((entry) => entry.auto);
}

function affinity(auto: SimilarCriteria, current: SimilarCriteria): number {
  return (
    (auto.categoria === current.categoria ? 2 : 0) +
    (auto.tipo === current.tipo ? 2 : 0) +
    (auto.marca === current.marca ? 1 : 0)
  );
}
