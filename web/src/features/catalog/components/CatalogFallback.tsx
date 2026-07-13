import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import type { AutoSummary } from "@/domain";
import { runCatalog } from "../lib/filter";
import { EMPTY_FILTERS } from "../lib/types";

type CatalogFallbackProps = {
  items: AutoSummary[];
  cards: Record<string, ReactNode>;
};

/**
 * Vista statica di default del catalogo (nessun filtro, prima pagina).
 * È il fallback del boundary Suspense: con `output: 'export'` la parte che legge
 * la query string è resa lato client, quindi questo guscio garantisce contenuto
 * indicizzabile e utilizzabile anche senza JavaScript. Riusa la logica pura e le
 * `CarCard` già renderizzate. Il `CatalogView` client lo sostituisce all'hydration.
 */
export async function CatalogFallback({ items, cards }: CatalogFallbackProps) {
  const t = await getTranslations("Catalog");
  const result = runCatalog(items, EMPTY_FILTERS);

  return (
    <div className="catalog-layout catalog-layout--static">
      <section
        className="results catalog-fallback"
        aria-label={t("results.aria")}
        aria-busy="true"
      >
        <div className="toolbar">
          <p className="toolbar__count" role="status" aria-live="polite">
            {t("results.count", { count: result.total })}
          </p>
        </div>
        {result.total === 0 ? (
          <div className="results-empty" role="status">
            <h2>{t("results.emptyTitle")}</h2>
            <p>{t("results.emptyHint")}</p>
          </div>
        ) : (
          <div className="results-grid">
            {result.items.map((auto) => (
              <div key={auto.slug}>{cards[auto.slug]}</div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
