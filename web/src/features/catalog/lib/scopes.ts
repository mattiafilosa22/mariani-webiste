import type { AutoSummary } from "@/domain";
import type { CatalogScope, ScopeKey } from "./types";

/**
 * Registro degli scope: una definizione riusata da tutte le route del catalogo
 * (template unico parametrizzato). Ogni route importa lo scope che le compete.
 */
export const CATALOG_SCOPES: Record<ScopeKey, CatalogScope> = {
  auto: { key: "auto", categoria: "auto", segments: ["auto"] },
  nuove: { key: "nuove", categoria: "auto", lockedTipo: "nuova", segments: ["auto", "nuove"] },
  usate: { key: "usate", categoria: "auto", lockedTipo: "usata", segments: ["auto", "usate"] },
  km0: { key: "km0", categoria: "auto", lockedTipo: "km0", segments: ["auto", "km0"] },
  "comm-nuovi": {
    key: "comm-nuovi",
    categoria: "commerciale",
    lockedTipo: "nuova",
    segments: ["veicoli-commerciali", "nuovi"],
  },
  "comm-usati": {
    key: "comm-usati",
    categoria: "commerciale",
    lockedTipo: "usata",
    segments: ["veicoli-commerciali", "usati"],
  },
};

/**
 * Restringe il dataset allo scope della route (categoria + eventuale tipo).
 * Funzione pura: il template la usa a build time sul dataset statico.
 */
export function scopeAutos(
  autos: readonly AutoSummary[],
  scope: CatalogScope
): AutoSummary[] {
  return autos.filter(
    (auto) =>
      auto.categoria === scope.categoria &&
      (scope.lockedTipo === undefined || auto.tipo === scope.lockedTipo)
  );
}
