import {
  alimentazioneSchema,
  autoTipoSchema,
  cambioSchema,
  coloreSchema,
  trazioneSchema,
} from "@/domain";
import type { z } from "zod";
import {
  DEFAULT_SORT,
  EMPTY_FILTERS,
  SORT_KEYS,
  type CatalogFilters,
  type SortKey,
} from "./types";

/**
 * Ponte bidirezionale filtri ⇄ query string.
 * Serializzazione stabile (chiavi ordinate, default omessi) e parsing tollerante
 * (valori non validi scartati) così gli URL restano puliti e condivisibili.
 */

/** Sottoinsieme comune a `URLSearchParams` e `ReadonlyURLSearchParams`. */
export type ReadableParams = { get(name: string): string | null };

function splitList(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

/** Lista di stringhe libere (marca/modello/carrozzeria): deduplicata. */
function parseStringList(raw: string | null): string[] {
  return [...new Set(splitList(raw))];
}

/** Lista validata contro uno schema zod enum: scarta i token sconosciuti. */
function parseEnumList<S extends z.ZodType>(
  raw: string | null,
  schema: S
): z.infer<S>[] {
  const seen = new Set<string>();
  const out: z.infer<S>[] = [];
  for (const token of splitList(raw)) {
    const parsed = schema.safeParse(token);
    if (parsed.success && !seen.has(token)) {
      seen.add(token);
      out.push(parsed.data);
    }
  }
  return out;
}

function parseInteger(raw: string | null): number | null {
  if (raw === null) return null;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

function parseSort(raw: string | null): SortKey {
  return (SORT_KEYS as readonly string[]).includes(raw ?? "")
    ? (raw as SortKey)
    : DEFAULT_SORT;
}

function parsePage(raw: string | null): number {
  const value = parseInteger(raw);
  return value !== null && value >= 1 ? value : 1;
}

/**
 * Costruisce i filtri dalla query string.
 * Accetta gli alias della "ricerca rapida" della home: `prezzoMax` (in aggiunta
 * a `prezzoMin`/`prezzoMax`) e `marca`/`tipo` come valori singoli o CSV.
 */
export function parseFilters(params: ReadableParams): CatalogFilters {
  return {
    marca: parseStringList(params.get("marca")),
    modello: parseStringList(params.get("modello")),
    alimentazione: parseEnumList(params.get("alimentazione"), alimentazioneSchema),
    carrozzeria: parseStringList(params.get("carrozzeria")),
    cambio: parseEnumList(params.get("cambio"), cambioSchema),
    trazione: parseEnumList(params.get("trazione"), trazioneSchema),
    colore: parseEnumList(params.get("colore"), coloreSchema),
    tipo: parseEnumList(params.get("tipo"), autoTipoSchema),
    prezzoMin: parseInteger(params.get("prezzoMin")),
    prezzoMax: parseInteger(params.get("prezzoMax")),
    annoMin: parseInteger(params.get("annoMin")),
    annoMax: parseInteger(params.get("annoMax")),
    kmMin: parseInteger(params.get("kmMin")),
    kmMax: parseInteger(params.get("kmMax")),
    cvMin: parseInteger(params.get("cvMin")),
    cvMax: parseInteger(params.get("cvMax")),
    soloPromo: params.get("promo") === "1",
    soloPronta: params.get("pronta") === "1",
    soloNeopatentati: params.get("neo") === "1",
    sort: parseSort(params.get("sort")),
    page: parsePage(params.get("page")),
  };
}

/** Serializza i filtri omettendo default ed elenchi vuoti (URL minimale). */
export function serializeFilters(filters: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams();
  const setList = (key: string, values: readonly string[]) => {
    if (values.length > 0) params.set(key, values.join(","));
  };
  const setNumber = (key: string, value: number | null) => {
    if (value !== null) params.set(key, String(value));
  };

  setList("marca", filters.marca);
  setList("modello", filters.modello);
  setList("alimentazione", filters.alimentazione);
  setList("carrozzeria", filters.carrozzeria);
  setList("cambio", filters.cambio);
  setList("trazione", filters.trazione);
  setList("colore", filters.colore);
  setList("tipo", filters.tipo);
  setNumber("prezzoMin", filters.prezzoMin);
  setNumber("prezzoMax", filters.prezzoMax);
  setNumber("annoMin", filters.annoMin);
  setNumber("annoMax", filters.annoMax);
  setNumber("kmMin", filters.kmMin);
  setNumber("kmMax", filters.kmMax);
  setNumber("cvMin", filters.cvMin);
  setNumber("cvMax", filters.cvMax);
  if (filters.soloPromo) params.set("promo", "1");
  if (filters.soloPronta) params.set("pronta", "1");
  if (filters.soloNeopatentati) params.set("neo", "1");
  if (filters.sort !== DEFAULT_SORT) params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

/** Quanti vincoli sono attivi (badge "N filtri"), esclusi ordinamento e pagina. */
export function countActiveFilters(filters: CatalogFilters): number {
  const listKeys: (keyof CatalogFilters)[] = [
    "marca",
    "modello",
    "alimentazione",
    "carrozzeria",
    "cambio",
    "trazione",
    "colore",
    "tipo",
  ];
  const rangeKeys: (keyof CatalogFilters)[] = [
    "prezzoMin",
    "prezzoMax",
    "annoMin",
    "annoMax",
    "kmMin",
    "kmMax",
    "cvMin",
    "cvMax",
  ];
  let count = 0;
  for (const key of listKeys) count += (filters[key] as unknown[]).length;
  for (const key of rangeKeys) if (filters[key] !== null) count += 1;
  if (filters.soloPromo) count += 1;
  if (filters.soloPronta) count += 1;
  if (filters.soloNeopatentati) count += 1;
  return count;
}

/** True se lo stato coincide con l'assenza di filtri (utile per il pulsante "Azzera"). */
export function isDefaultFilters(filters: CatalogFilters): boolean {
  return serializeFilters(filters).toString() === "";
}

export { EMPTY_FILTERS };
