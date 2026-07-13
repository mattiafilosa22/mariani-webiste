"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { AutoSummary } from "@/domain";
import { availableModelli, buildFacets } from "../lib/facets";
import { runCatalog, paginationModel } from "../lib/filter";
import {
  countActiveFilters,
  parseFilters,
  serializeFilters,
} from "../lib/params";
import {
  EMPTY_FILTERS,
  SORT_KEYS,
  scopeShowsKm,
  type CatalogFilters,
  type CatalogScope,
  type SortKey,
} from "../lib/types";
import { FilterPanel } from "./FilterPanel";

type CatalogViewProps = {
  items: AutoSummary[];
  /** Card già renderizzate lato server (RSC) e indicizzate per slug: DRY con `CarCard`. */
  cards: Record<string, ReactNode>;
  scope: CatalogScope;
};

/**
 * Contenitore interattivo del catalogo (unico `use client`).
 * L'URL è la sorgente di verità: legge i filtri da `useSearchParams`, applica la
 * logica pura (`runCatalog`) sul dataset statico pre-caricato e riflette ogni
 * cambiamento nella query string (condivisibile). Le card restano server-rendered.
 */
export function CatalogView({ items, cards, scope }: CatalogViewProps) {
  const t = useTranslations("Catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseFilters(searchParams),
    [searchParams]
  );

  const facets = useMemo(() => buildFacets(items), [items]);
  const modelli = useMemo(
    () => availableModelli(items, filters.marca),
    [items, filters.marca]
  );
  const result = useMemo(() => runCatalog(items, filters), [items, filters]);
  const activeCount = countActiveFilters(filters);
  const showKm = scopeShowsKm(scope);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const filtersBtnRef = useRef<HTMLButtonElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const commit = useCallback(
    (next: CatalogFilters) => {
      const qs = serializeFilters(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  // Applica una modifica ai filtri: azzera la pagina e pota i modelli non più
  // disponibili quando cambia la marca (dipendenza modello↔marca).
  const applyPatch = useCallback(
    (patch: Partial<CatalogFilters>) => {
      const next: CatalogFilters = { ...filters, ...patch, page: 1 };
      if ("marca" in patch) {
        const available = availableModelli(items, next.marca).map((m) =>
          m.value.toLowerCase()
        );
        next.modello = next.modello.filter((m) =>
          available.includes(m.toLowerCase())
        );
      }
      commit(next);
    },
    [commit, filters, items]
  );

  const setSort = useCallback(
    (sort: SortKey) => commit({ ...filters, sort, page: 1 }),
    [commit, filters]
  );

  const setPage = useCallback(
    (page: number) => {
      commit({ ...filters, page });
      resultsRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    },
    [commit, filters]
  );

  const reset = useCallback(() => {
    commit({ ...EMPTY_FILTERS });
  }, [commit]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Drawer mobile: blocca lo scroll del body e gestisce focus-trap + Esc.
  useEffect(() => {
    document.body.classList.toggle("filters-open", drawerOpen);
    return () => document.body.classList.remove("filters-open");
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("button, input, select, a")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDrawer();
        filtersBtnRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled]), select, a[href]"
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen, closeDrawer]);

  const pager = paginationModel(result.page, result.pageCount);

  return (
    <div className="catalog-layout">
      <FilterPanel
        facets={facets}
        modelli={modelli}
        filters={filters}
        showKm={showKm}
        activeCount={activeCount}
        panelRef={panelRef}
        onChange={applyPatch}
        onReset={reset}
        onApply={closeDrawer}
        onClose={closeDrawer}
      />

      <section className="results" aria-label={t("results.aria")}>
        <div className="toolbar">
          <p
            className="toolbar__count"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {t("results.count", { count: result.total })}
          </p>
          <div className="toolbar__right">
            <button
              ref={filtersBtnRef}
              type="button"
              className="btn-filters"
              aria-expanded={drawerOpen}
              aria-controls={panelId}
              onClick={() => setDrawerOpen(true)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              {t("filters.open")}
              {activeCount > 0 ? (
                <span className="btn-filters__count">{activeCount}</span>
              ) : null}
            </button>
            <div className="toolbar__sort">
              <label htmlFor="catalog-sort">{t("sort.label")}</label>
              <select
                className="select"
                id="catalog-sort"
                value={filters.sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
              >
                {SORT_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {t(`sort.options.${key}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div ref={resultsRef} id={panelId} className="results__region">
          {result.total === 0 ? (
            <div className="results-empty" role="status">
              <h2>{t("results.emptyTitle")}</h2>
              <p>{t("results.emptyHint")}</p>
              <button
                type="button"
                className="btn btn--outline"
                onClick={reset}
              >
                {t("filters.reset")}
              </button>
            </div>
          ) : (
            <>
              <div className="results-grid">
                {result.items.map((auto) => (
                  <div key={auto.slug}>{cards[auto.slug]}</div>
                ))}
              </div>

              {result.pageCount > 1 ? (
                <nav className="pager" aria-label={t("pager.aria")}>
                  <ul>
                    <li>
                      <button
                        type="button"
                        className="pager__arrow"
                        aria-label={t("pager.prev")}
                        disabled={result.page <= 1}
                        onClick={() => setPage(result.page - 1)}
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          aria-hidden="true"
                        >
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                    </li>
                    {pager.map((token, index) =>
                      token === "ellipsis" ? (
                        <li key={`e-${index}`}>
                          <span className="ellipsis" aria-hidden="true">
                            …
                          </span>
                        </li>
                      ) : (
                        <li key={token}>
                          <button
                            type="button"
                            aria-label={t("pager.page", { page: token })}
                            aria-current={
                              token === result.page ? "page" : undefined
                            }
                            onClick={() => setPage(token)}
                          >
                            {token}
                          </button>
                        </li>
                      )
                    )}
                    <li>
                      <button
                        type="button"
                        className="pager__arrow"
                        aria-label={t("pager.next")}
                        disabled={result.page >= result.pageCount}
                        onClick={() => setPage(result.page + 1)}
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          aria-hidden="true"
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </li>
                  </ul>
                </nav>
              ) : null}
            </>
          )}
        </div>
      </section>

      <div
        className="filters-backdrop"
        aria-hidden="true"
        onClick={closeDrawer}
      />
    </div>
  );
}
