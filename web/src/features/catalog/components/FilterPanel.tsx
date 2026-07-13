"use client";

import type { RefObject } from "react";
import { useLocale, useTranslations } from "next-intl";
import type {
  Alimentazione,
  Cambio,
  Colore,
  Trazione,
} from "@/domain";
import type { Locale } from "@/i18n/routing";
import { formatKm, formatPrice } from "@/lib/mappers/auto";
import type { CatalogFilters } from "../lib/types";
import type { Facets, FacetOption } from "../lib/facets";
import { COLORE_SWATCH } from "../lib/colors";
import { FilterGroup } from "./FilterGroup";
import { RangeFilter } from "./RangeFilter";

type FilterPanelProps = {
  facets: Facets;
  modelli: FacetOption<string>[];
  filters: CatalogFilters;
  showKm: boolean;
  activeCount: number;
  panelRef: RefObject<HTMLElement | null>;
  onChange: (patch: Partial<CatalogFilters>) => void;
  onReset: () => void;
  onApply: () => void;
  onClose: () => void;
};

function toggle<T>(list: readonly T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

/** Lista di checkbox per un facet, con conteggi e label risolta dal chiamante. */
function CheckList<T extends string>({
  groupLabel,
  options,
  selected,
  labelFor,
  onToggle,
}: {
  groupLabel: string;
  options: FacetOption<T>[];
  selected: readonly T[];
  labelFor: (value: T) => string;
  onToggle: (value: T) => void;
}) {
  return (
    <div className="fcheck" role="group" aria-label={groupLabel}>
      {options.map((option) => (
        <div className="check" key={option.value}>
          <input
            type="checkbox"
            id={`f-${option.value}`}
            checked={selected.includes(option.value)}
            onChange={() => onToggle(option.value)}
          />
          <label htmlFor={`f-${option.value}`}>
            {labelFor(option.value)} <span className="count">{option.count}</span>
          </label>
        </div>
      ))}
    </div>
  );
}

/**
 * Pannello filtri accessibile: sticky sul desktop, drawer con focus-trap su
 * mobile. Ogni gruppo è un fieldset a fisarmonica; espone solo i valori presenti
 * nel dataset. Emette `patch` parziali; la normalizzazione (pagina, modelli)
 * avviene nel contenitore.
 */
export function FilterPanel({
  facets,
  modelli,
  filters,
  showKm,
  activeCount,
  panelRef,
  onChange,
  onReset,
  onApply,
  onClose,
}: FilterPanelProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("Catalog");
  const tFuel = useTranslations("Spec.fuel");
  const tGear = useTranslations("Spec.transmission");
  const tColor = useTranslations("Spec.color");
  const tDrive = useTranslations("Catalog.drive");

  const price = (value: number) => formatPrice(value, locale);
  const km = (value: number) => `${formatKm(value, locale)} ${t("unit.km")}`;
  const year = (value: number) => String(value);
  const cv = (value: number) => `${value} ${t("unit.cv")}`;

  return (
    <aside
      ref={panelRef}
      className="filters"
      aria-label={t("filters.aria")}
      data-filters-panel
    >
      <div className="filters__head">
        <h2>{t("filters.title")}</h2>
        <button
          type="button"
          className="filters__close"
          onClick={onClose}
          aria-label={t("filters.close")}
        >
          ×
        </button>
      </div>

      <form
        className="filters__scroll"
        onSubmit={(event) => {
          event.preventDefault();
          onApply();
        }}
      >
        <FilterGroup title={t("groups.marca")} defaultOpen>
          <CheckList
            groupLabel={t("groups.marca")}
            options={facets.marche}
            selected={filters.marca}
            labelFor={(value) => value}
            onToggle={(value) => onChange({ marca: toggle(filters.marca, value) })}
          />
        </FilterGroup>

        <FilterGroup title={t("groups.modello")}>
          <p className="fgroup__note">{t("notes.modello")}</p>
          {modelli.length > 0 ? (
            <CheckList
              groupLabel={t("groups.modello")}
              options={modelli}
              selected={filters.modello}
              labelFor={(value) => value}
              onToggle={(value) =>
                onChange({ modello: toggle(filters.modello, value) })
              }
            />
          ) : (
            <p className="fgroup__empty">{t("notes.modelloEmpty")}</p>
          )}
        </FilterGroup>

        <FilterGroup title={t("groups.alimentazione")}>
          <CheckList
            groupLabel={t("groups.alimentazione")}
            options={facets.alimentazioni}
            selected={filters.alimentazione}
            labelFor={(value: Alimentazione) => tFuel(value)}
            onToggle={(value) =>
              onChange({ alimentazione: toggle(filters.alimentazione, value) })
            }
          />
        </FilterGroup>

        <FilterGroup title={t("groups.carrozzeria")}>
          <CheckList
            groupLabel={t("groups.carrozzeria")}
            options={facets.carrozzerie}
            selected={filters.carrozzeria}
            labelFor={(value) => value}
            onToggle={(value) =>
              onChange({ carrozzeria: toggle(filters.carrozzeria, value) })
            }
          />
        </FilterGroup>

        {facets.prezzo ? (
          <FilterGroup title={t("groups.prezzo")} defaultOpen>
            <RangeFilter
              legend={t("groups.prezzo")}
              min={facets.prezzo.min}
              max={facets.prezzo.max}
              step={500}
              valueMin={filters.prezzoMin}
              valueMax={filters.prezzoMax}
              labelMin={t("range.from")}
              labelMax={t("range.to")}
              format={price}
              onCommit={(min, max) =>
                onChange({ prezzoMin: min, prezzoMax: max })
              }
            />
          </FilterGroup>
        ) : null}

        {facets.anno ? (
          <FilterGroup title={t("groups.anno")}>
            <RangeFilter
              legend={t("groups.anno")}
              min={facets.anno.min}
              max={facets.anno.max}
              step={1}
              valueMin={filters.annoMin}
              valueMax={filters.annoMax}
              labelMin={t("range.from")}
              labelMax={t("range.to")}
              format={year}
              onCommit={(min, max) => onChange({ annoMin: min, annoMax: max })}
            />
          </FilterGroup>
        ) : null}

        {showKm && facets.km ? (
          <FilterGroup title={t("groups.km")}>
            <RangeFilter
              legend={t("groups.km")}
              min={facets.km.min}
              max={facets.km.max}
              step={1000}
              valueMin={filters.kmMin}
              valueMax={filters.kmMax}
              labelMin={t("range.from")}
              labelMax={t("range.to")}
              note={t("notes.km")}
              format={km}
              onCommit={(min, max) => onChange({ kmMin: min, kmMax: max })}
            />
          </FilterGroup>
        ) : null}

        {facets.cv ? (
          <FilterGroup title={t("groups.potenza")}>
            <RangeFilter
              legend={t("groups.potenza")}
              min={facets.cv.min}
              max={facets.cv.max}
              step={5}
              valueMin={filters.cvMin}
              valueMax={filters.cvMax}
              labelMin={t("range.from")}
              labelMax={t("range.to")}
              format={cv}
              onCommit={(min, max) => onChange({ cvMin: min, cvMax: max })}
            />
          </FilterGroup>
        ) : null}

        <FilterGroup title={t("groups.cambio")}>
          <CheckList
            groupLabel={t("groups.cambio")}
            options={facets.cambi}
            selected={filters.cambio}
            labelFor={(value: Cambio) => tGear(value)}
            onToggle={(value) => onChange({ cambio: toggle(filters.cambio, value) })}
          />
        </FilterGroup>

        <FilterGroup title={t("groups.trazione")}>
          <CheckList
            groupLabel={t("groups.trazione")}
            options={facets.trazioni}
            selected={filters.trazione}
            labelFor={(value: Trazione) => tDrive(value)}
            onToggle={(value) =>
              onChange({ trazione: toggle(filters.trazione, value) })
            }
          />
        </FilterGroup>

        {facets.colori.length > 0 ? (
          <FilterGroup title={t("groups.colore")}>
            <div className="fcolors" role="group" aria-label={t("groups.colore")}>
              {facets.colori.map((option) => {
                const swatch = COLORE_SWATCH[option.value as Colore];
                const pressed = filters.colore.includes(option.value as Colore);
                return (
                  <button
                    key={option.value}
                    type="button"
                    className="fcolor"
                    aria-pressed={pressed}
                    aria-label={`${tColor(option.value)} (${option.count})`}
                    onClick={() =>
                      onChange({
                        colore: toggle(filters.colore, option.value as Colore),
                      })
                    }
                  >
                    <span
                      className="swatch"
                      style={{
                        background: swatch.hex,
                        borderColor: swatch.border
                          ? "var(--line-strong)"
                          : "transparent",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </FilterGroup>
        ) : null}

        <FilterGroup title={t("groups.opzioni")} defaultOpen>
          <div className="ftoggles">
            <label className="ftoggle">
              <span>{t("toggles.promo")}</span>
              <input
                type="checkbox"
                checked={filters.soloPromo}
                onChange={() => onChange({ soloPromo: !filters.soloPromo })}
              />
              <span className="switch" aria-hidden="true" />
            </label>
            <label className="ftoggle">
              <span>{t("toggles.pronta")}</span>
              <input
                type="checkbox"
                checked={filters.soloPronta}
                onChange={() => onChange({ soloPronta: !filters.soloPronta })}
              />
              <span className="switch" aria-hidden="true" />
            </label>
            <label className="ftoggle">
              <span>{t("toggles.neopatentati")}</span>
              <input
                type="checkbox"
                checked={filters.soloNeopatentati}
                onChange={() =>
                  onChange({ soloNeopatentati: !filters.soloNeopatentati })
                }
              />
              <span className="switch" aria-hidden="true" />
            </label>
          </div>
        </FilterGroup>
      </form>

      <div className="filters__foot">
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={onApply}
        >
          {t("filters.apply")}
        </button>
        <button
          type="button"
          className="btn btn--outline btn--block"
          onClick={onReset}
          disabled={activeCount === 0}
        >
          {t("filters.reset")}
        </button>
      </div>
    </aside>
  );
}
