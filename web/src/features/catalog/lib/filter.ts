import type { AutoSummary } from "@/domain";
import { PAGE_SIZE, type CatalogFilters, type SortKey } from "./types";

/**
 * Logica pura di filtro, ordinamento e paginazione del catalogo.
 * Nessuno stato, nessun side-effect: input → output deterministico e testabile.
 */

/** Confronto case-insensitive per i facet testuali liberi (marca/modello/carrozzeria). */
function includesCi(values: readonly string[], candidate: string): boolean {
  const needle = candidate.toLowerCase();
  return values.some((value) => value.toLowerCase() === needle);
}

function inRange(
  value: number,
  min: number | null,
  max: number | null
): boolean {
  if (min !== null && value < min) return false;
  if (max !== null && value > max) return false;
  return true;
}

/** Vero se il veicolo soddisfa tutti i vincoli attivi. */
export function matchesFilters(
  auto: AutoSummary,
  filters: CatalogFilters
): boolean {
  if (filters.marca.length > 0 && !includesCi(filters.marca, auto.marca)) {
    return false;
  }
  if (filters.modello.length > 0 && !includesCi(filters.modello, auto.modello)) {
    return false;
  }
  if (
    filters.carrozzeria.length > 0 &&
    !includesCi(filters.carrozzeria, auto.carrozzeria)
  ) {
    return false;
  }
  if (
    filters.alimentazione.length > 0 &&
    !filters.alimentazione.includes(auto.alimentazione)
  ) {
    return false;
  }
  if (filters.cambio.length > 0 && !filters.cambio.includes(auto.cambio)) {
    return false;
  }
  if (filters.trazione.length > 0 && !filters.trazione.includes(auto.trazione)) {
    return false;
  }
  if (filters.colore.length > 0 && !filters.colore.includes(auto.colore)) {
    return false;
  }
  if (filters.tipo.length > 0 && !filters.tipo.includes(auto.tipo)) {
    return false;
  }
  if (!inRange(auto.prezzoFinale, filters.prezzoMin, filters.prezzoMax)) {
    return false;
  }
  if (!inRange(auto.anno, filters.annoMin, filters.annoMax)) return false;
  if (!inRange(auto.km, filters.kmMin, filters.kmMax)) return false;
  if (!inRange(auto.potenzaCv, filters.cvMin, filters.cvMax)) return false;
  if (filters.soloPromo && !auto.badge.includes("promo")) return false;
  if (filters.soloPronta && !auto.badge.includes("pronta")) return false;
  if (filters.soloNeopatentati && !auto.badge.includes("neopatentati")) {
    return false;
  }
  return true;
}

export function filterAutos(
  autos: readonly AutoSummary[],
  filters: CatalogFilters
): AutoSummary[] {
  return autos.filter((auto) => matchesFilters(auto, filters));
}

const comparators: Record<
  SortKey,
  (a: AutoSummary, b: AutoSummary) => number
> = {
  recenti: (a, b) => b.anno - a.anno,
  "prezzo-asc": (a, b) => a.prezzoFinale - b.prezzoFinale,
  "prezzo-desc": (a, b) => b.prezzoFinale - a.prezzoFinale,
  "km-asc": (a, b) => a.km - b.km,
};

/** Ordina senza mutare l'input (Array.sort è stabile: i pari mantengono l'ordine). */
export function sortAutos(
  autos: readonly AutoSummary[],
  sort: SortKey
): AutoSummary[] {
  return [...autos].sort(comparators[sort]);
}

export type PageResult<T> = {
  items: T[];
  page: number;
  pageCount: number;
  total: number;
};

/** Estrae la pagina richiesta, riportando `page` entro i limiti validi. */
export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize: number = PAGE_SIZE
): PageResult<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, Math.trunc(page)), pageCount);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageCount,
    total,
  };
}

export type PagerToken = number | "ellipsis";

/**
 * Modello del paginatore con ellissi: mostra sempre prima/ultima pagina e un
 * intorno della corrente. Puro, così la resa React resta dichiarativa.
 */
export function paginationModel(
  current: number,
  pageCount: number,
  siblings = 1
): PagerToken[] {
  if (pageCount <= 1) return [1];
  const first = 1;
  const last = pageCount;
  const start = Math.max(first + 1, current - siblings);
  const end = Math.min(last - 1, current + siblings);

  const tokens: PagerToken[] = [first];
  if (start > first + 1) tokens.push("ellipsis");
  for (let page = start; page <= end; page += 1) tokens.push(page);
  if (end < last - 1) tokens.push("ellipsis");
  if (last !== first) tokens.push(last);
  return tokens;
}

/** Applica in sequenza filtro → ordinamento → paginazione. */
export function runCatalog(
  autos: readonly AutoSummary[],
  filters: CatalogFilters
): PageResult<AutoSummary> {
  const filtered = filterAutos(autos, filters);
  const sorted = sortAutos(filtered, filters.sort);
  return paginate(sorted, filters.page);
}
