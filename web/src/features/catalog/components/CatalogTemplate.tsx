import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getAutos } from "@/lib/api";
import { toCarCardVm } from "@/lib/mappers/auto";
import {
  JsonLd,
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildMetadata,
  localePath,
  localePathsFor,
  type Crumb as JsonLdCrumb,
} from "@/lib/seo";
import { CarCard } from "@/components/ui/CarCard";
import { scopeAutos } from "../lib/scopes";
import { scopeShowsTypeTabs, type CatalogScope, type ScopeKey } from "../lib/types";
import { CatalogView } from "./CatalogView";
import { CatalogFallback } from "./CatalogFallback";

type CatalogTemplateProps = {
  params: Promise<{ locale: string }>;
  scope: CatalogScope;
};

/** Metadata SEO per una route del catalogo (titolo/descrizione localizzati). */
export async function catalogMetadata(
  params: Promise<{ locale: string }>,
  scope: CatalogScope
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "Catalog",
  });
  const tSeo = await getTranslations({
    locale: locale as Locale,
    namespace: "SEO",
  });
  return buildMetadata({
    locale: locale as Locale,
    paths: localePathsFor(...scope.segments),
    siteName: tSeo("siteName"),
    heading: t(`intro.${scope.key}.title`),
    description: t(`intro.${scope.key}.description`),
  });
}

const chevronSep = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
);

type TypeTab = { key: ScopeKey; href: string; labelKey: string };

/** Tab di categoria (link a route reali), differenziate per categoria auto/commerciale. */
function typeTabsFor(scope: CatalogScope, base: string): TypeTab[] {
  if (scope.categoria === "commerciale") {
    return [
      { key: "comm-nuovi", href: `${base}/veicoli-commerciali/nuovi`, labelKey: "tabs.nuove" },
      { key: "comm-usati", href: `${base}/veicoli-commerciali/usati`, labelKey: "tabs.usate" },
    ];
  }
  return [
    { key: "auto", href: `${base}/auto`, labelKey: "tabs.tutte" },
    { key: "nuove", href: `${base}/auto/nuove`, labelKey: "tabs.nuove" },
    { key: "usate", href: `${base}/auto/usate`, labelKey: "tabs.usate" },
    { key: "km0", href: `${base}/auto/km0`, labelKey: "tabs.km0" },
  ];
}

/**
 * Template unico del catalogo, riusato da tutte le route (parametrizzato via
 * `scope`). Guscio statico (RSC): carica i dati a build time, li restringe allo
 * scope, pre-renderizza le `CarCard` e delega filtro/ordinamento/paginazione al
 * contenitore client `CatalogView`. Compatibile con `output: 'export'`.
 */
export async function CatalogTemplate({ params, scope }: CatalogTemplateProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const all = await getAutos({ locale });
  const items = scopeAutos(all, scope);

  const t = await getTranslations("Catalog");
  const tCard = await getTranslations();
  const base = `/${locale}`;

  const cards: Record<string, ReactNode> = {};
  for (const summary of items) {
    const vm = toCarCardVm(summary, locale, {
      km: tCard("CarCard.km"),
      alimentazione: tCard(`Spec.fuel.${summary.alimentazione}`),
      cambio: tCard(`Spec.transmission.${summary.cambio}`),
    });
    cards[summary.slug] = <CarCard vm={vm} locale={locale} />;
  }

  const categoryLabel =
    scope.categoria === "commerciale" ? t("crumb.commerciali") : t("crumb.auto");
  const categoryHref =
    scope.categoria === "commerciale"
      ? `${base}/veicoli-commerciali/nuovi`
      : `${base}/auto`;
  const isRoot = scope.key === "auto";

  const categorySegments =
    scope.categoria === "commerciale"
      ? ["veicoli-commerciali", "nuovi"]
      : ["auto"];
  const crumbItems: JsonLdCrumb[] = [
    { name: t("crumb.home"), url: absoluteUrl(localePath(locale)) },
    { name: categoryLabel, url: absoluteUrl(localePath(locale, ...categorySegments)) },
  ];
  if (!isRoot) {
    crumbItems.push({
      name: t(`intro.${scope.key}.title`),
      url: absoluteUrl(localePath(locale, ...scope.segments)),
    });
  }
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(crumbItems);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <nav className="breadcrumb" aria-label={t("crumb.aria")}>
        <div className="container">
          <ol>
            <li>
              <Link href={base}>{t("crumb.home")}</Link>
            </li>
            <li aria-hidden="true">{chevronSep}</li>
            {isRoot ? (
              <li aria-current="page">{categoryLabel}</li>
            ) : (
              <>
                <li>
                  <Link href={categoryHref}>{categoryLabel}</Link>
                </li>
                <li aria-hidden="true">{chevronSep}</li>
                <li aria-current="page">{t(`intro.${scope.key}.title`)}</li>
              </>
            )}
          </ol>
        </div>
      </nav>

      <div className="container catalog-intro">
        <p className="eyebrow">{t("intro.eyebrow")}</p>
        <h1>{t(`intro.${scope.key}.title`)}</h1>
        <p>{t(`intro.${scope.key}.description`)}</p>
      </div>

      <div className="container">
        {scopeShowsTypeTabs(scope) ? (
          <nav className="catalog-tabs" aria-label={t("tabs.aria")}>
            <ul className="tabs__list">
              {typeTabsFor(scope, base).map((tab) => (
                <li key={tab.key}>
                  <Link
                    className="tabs__btn"
                    href={tab.href}
                    aria-current={tab.key === scope.key ? "page" : undefined}
                  >
                    {t(tab.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <Suspense fallback={<CatalogFallback items={items} cards={cards} />}>
          <CatalogView items={items} cards={cards} scope={scope} />
        </Suspense>
      </div>
    </>
  );
}
