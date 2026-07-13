import type {
  Alimentazione,
  AutoSummary,
  Cambio,
  Colore,
  Trazione,
} from "@/domain";

/**
 * Derivazione dei facet dal dataset: espone SOLO i valori realmente presenti,
 * con il relativo conteggio. Puro e testabile; nessuna label localizzata qui.
 */

export type FacetOption<T extends string> = { value: T; count: number };
export type Bounds = { min: number; max: number };

export type Facets = {
  marche: FacetOption<string>[];
  alimentazioni: FacetOption<Alimentazione>[];
  carrozzerie: FacetOption<string>[];
  cambi: FacetOption<Cambio>[];
  trazioni: FacetOption<Trazione>[];
  colori: FacetOption<Colore>[];
  prezzo: Bounds | null;
  anno: Bounds | null;
  km: Bounds | null;
  cv: Bounds | null;
};

/** Conta le occorrenze e ordina per frequenza discendente, poi alfabetico. */
function countBy<T extends string>(values: readonly T[]): FacetOption<T>[] {
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function bounds(values: readonly number[]): Bounds | null {
  if (values.length === 0) return null;
  return { min: Math.min(...values), max: Math.max(...values) };
}

export function buildFacets(autos: readonly AutoSummary[]): Facets {
  return {
    marche: countBy(autos.map((a) => a.marca)),
    alimentazioni: countBy(autos.map((a) => a.alimentazione)),
    carrozzerie: countBy(autos.map((a) => a.carrozzeria)),
    cambi: countBy(autos.map((a) => a.cambio)),
    trazioni: countBy(autos.map((a) => a.trazione)),
    colori: countBy(autos.map((a) => a.colore)),
    prezzo: bounds(autos.map((a) => a.prezzoFinale)),
    anno: bounds(autos.map((a) => a.anno)),
    km: bounds(autos.map((a) => a.km)),
    cv: bounds(autos.map((a) => a.potenzaCv)),
  };
}

/**
 * Modelli disponibili in funzione delle marche selezionate (dipendenza
 * modello↔marca). Senza marche selezionate, mostra i modelli dell'intero scope.
 */
export function availableModelli(
  autos: readonly AutoSummary[],
  selectedMarche: readonly string[]
): FacetOption<string>[] {
  const selected = selectedMarche.map((m) => m.toLowerCase());
  const pool =
    selected.length === 0
      ? autos
      : autos.filter((a) => selected.includes(a.marca.toLowerCase()));
  return countBy(pool.map((a) => a.modello));
}
