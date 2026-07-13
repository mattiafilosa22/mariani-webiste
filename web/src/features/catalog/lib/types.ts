import type {
  Alimentazione,
  AutoCategoria,
  AutoTipo,
  Cambio,
  Colore,
  Trazione,
} from "@/domain";

/**
 * Tipi e costanti del dominio "catalogo".
 * Nessuna dipendenza da React o da Next: logica pura e testabile.
 */

export const SORT_KEYS = [
  "recenti",
  "prezzo-asc",
  "prezzo-desc",
  "km-asc",
] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const DEFAULT_SORT: SortKey = "recenti";

/** Numero di veicoli per pagina: coincide con la griglia 3×3 desktop. */
export const PAGE_SIZE = 9;

/**
 * Stato completo di filtro/ordinamento/paginazione.
 * È l'unica sorgente di verità: viene serializzato nella query string così
 * ogni ricerca è condivisibile e ricostruibile via `useSearchParams`.
 */
export type CatalogFilters = {
  marca: string[];
  modello: string[];
  alimentazione: Alimentazione[];
  carrozzeria: string[];
  cambio: Cambio[];
  trazione: Trazione[];
  colore: Colore[];
  /** Tipo (nuova/usata/km0): usato solo sulla route "tutte le auto". */
  tipo: AutoTipo[];
  prezzoMin: number | null;
  prezzoMax: number | null;
  annoMin: number | null;
  annoMax: number | null;
  kmMin: number | null;
  kmMax: number | null;
  cvMin: number | null;
  cvMax: number | null;
  soloPromo: boolean;
  soloPronta: boolean;
  soloNeopatentati: boolean;
  sort: SortKey;
  page: number;
};

/** Filtri "vuoti": nessun vincolo, ordinamento e pagina di default. */
export const EMPTY_FILTERS: CatalogFilters = {
  marca: [],
  modello: [],
  alimentazione: [],
  carrozzeria: [],
  cambio: [],
  trazione: [],
  colore: [],
  tipo: [],
  prezzoMin: null,
  prezzoMax: null,
  annoMin: null,
  annoMax: null,
  kmMin: null,
  kmMax: null,
  cvMin: null,
  cvMax: null,
  soloPromo: false,
  soloPronta: false,
  soloNeopatentati: false,
  sort: DEFAULT_SORT,
  page: 1,
};

/** Chiave della route/scope corrente (una per template istanziato). */
export type ScopeKey =
  | "auto"
  | "nuove"
  | "usate"
  | "km0"
  | "comm-nuovi"
  | "comm-usati";

/**
 * Definisce cosa mostra un'istanza del template:
 * la categoria e (facoltativo) il tipo bloccato dalla route.
 */
export type CatalogScope = {
  key: ScopeKey;
  categoria: AutoCategoria;
  /** Se presente, il dataset è già ristretto a questo tipo (route pre-filtrata). */
  lockedTipo?: AutoTipo;
  /** Segmenti path della route (dopo il locale): per canonical/hreflang/breadcrumb. */
  segments: string[];
};

/** Il filtro Km ha senso solo dove sono ammessi veicoli usati. */
export function scopeShowsKm(scope: CatalogScope): boolean {
  return scope.lockedTipo !== "nuova";
}

/** Le tab "Tutte/Nuove/Usate/Km0" compaiono solo nella categoria auto. */
export function scopeShowsTypeTabs(scope: CatalogScope): boolean {
  return scope.categoria === "auto";
}
