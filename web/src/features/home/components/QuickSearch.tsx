"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";

type QuickSearchProps = {
  locale: Locale;
};

/**
 * Ricerca rapida "Trova la tua auto".
 * Form accessibile (ogni campo ha una label associata). Con JavaScript, la
 * submit costruisce una query string pulita (senza parametri vuoti) e naviga a
 * `/{locale}/auto`; senza JavaScript, l'attributo `action` GET garantisce lo
 * stesso comportamento. Il link non rompe il build/export: la pagina catalogo
 * viene risolta a runtime.
 */
export function QuickSearch({ locale }: QuickSearchProps) {
  const t = useTranslations();
  const router = useRouter();
  const target = `/${locale}/auto`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, raw] of data.entries()) {
      const value = String(raw).trim();
      if (value) params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `${target}?${query}` : target);
  }

  return (
    <section className="quicksearch" aria-labelledby="quicksearch-title">
      <div className="container">
        <form
          className="quicksearch__box"
          role="search"
          action={target}
          onSubmit={handleSubmit}
        >
          <h2 className="quicksearch__title" id="quicksearch-title">
            {t("QuickSearch.title")}
          </h2>
          <div className="quicksearch__grid">
            <div className="field">
              <label htmlFor="qs-cat">{t("QuickSearch.category")}</label>
              <select className="select" id="qs-cat" name="categoria" defaultValue="">
                <option value="">{t("QuickSearch.allCategories")}</option>
                <option value="auto">{t("Nav.auto")}</option>
                <option value="commerciale">{t("Nav.commerciali")}</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="qs-tipo">{t("QuickSearch.type")}</label>
              <select className="select" id="qs-tipo" name="tipo" defaultValue="">
                <option value="">{t("QuickSearch.allTypes")}</option>
                <option value="nuova">{t("CarCard.new")}</option>
                <option value="usata">{t("CarCard.used")}</option>
                <option value="km0">{t("CarCard.km0")}</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="qs-marca">{t("QuickSearch.brand")}</label>
              <select className="select" id="qs-marca" name="marca" defaultValue="">
                <option value="">{t("QuickSearch.allBrands")}</option>
                <option value="ford">Ford</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="qs-prezzo">{t("QuickSearch.maxPrice")}</label>
              <select
                className="select"
                id="qs-prezzo"
                name="prezzoMax"
                defaultValue=""
              >
                <option value="">{t("QuickSearch.noLimit")}</option>
                <option value="15000">15.000 €</option>
                <option value="25000">25.000 €</option>
                <option value="35000">35.000 €</option>
                <option value="50000">50.000 €</option>
              </select>
            </div>
            <div className="field quicksearch__submit">
              <button className="btn btn--primary btn--block btn--lg" type="submit">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4-4" />
                </svg>
                {t("Actions.cerca")}
              </button>
            </div>
          </div>
          <a className="link-arrow quicksearch__adv" href={target}>
            {t("Actions.ricercaAvanzata")}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </form>
      </div>
    </section>
  );
}
