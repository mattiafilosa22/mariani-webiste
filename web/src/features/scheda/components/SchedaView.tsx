import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Auto, AutoSummary, SiteSettings } from "@/domain";
import type { Locale } from "@/i18n/routing";
import {
  JsonLd,
  absoluteUrl,
  autoPath,
  buildBreadcrumbJsonLd,
  buildVehicleJsonLd,
  localePath,
} from "@/lib/seo";
import { buildVehicleTitle } from "../lib/messages";
import { Gallery } from "./Gallery";
import { BuyBox } from "./BuyBox";
import { SpecTabs } from "./SpecTabs";
import { ContactForm } from "./ContactForm";
import { SimilarCars } from "./SimilarCars";
import { FloatingContact } from "./FloatingContact";

type SchedaViewProps = {
  auto: Auto;
  all: AutoSummary[];
  locale: Locale;
  settings: SiteSettings;
};

const chevron = (
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

/**
 * Guscio (RSC) della scheda dettaglio: compone le sezioni. `use client` è
 * confinato a galleria/lightbox, countdown, tab e form; il resto è statico.
 */
export async function SchedaView({ auto, all, locale, settings }: SchedaViewProps) {
  const t = await getTranslations("Scheda");
  const tSpec = await getTranslations("Spec");
  const vehicleTitle = buildVehicleTitle(auto);
  const pageUrl = absoluteUrl(autoPath(locale, auto.slug));
  const base = `/${locale}`;

  const vehicleJsonLd = buildVehicleJsonLd({
    auto,
    name: vehicleTitle,
    url: pageUrl,
    images: auto.galleria.map((image) => absoluteUrl(image.src)),
    colorLabel: tSpec(`color.${auto.colore}`),
    sellerName: settings.nomeAzienda,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: t("crumb.home"), url: absoluteUrl(localePath(locale)) },
    { name: t("crumb.catalogo"), url: absoluteUrl(localePath(locale, "auto")) },
    { name: vehicleTitle, url: pageUrl },
  ]);

  return (
    <>
      <JsonLd data={vehicleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <nav className="breadcrumb" aria-label={t("crumb.aria")}>
        <div className="container">
          <ol>
            <li>
              <Link href={base}>{t("crumb.home")}</Link>
            </li>
            <li aria-hidden="true">{chevron}</li>
            <li>
              <Link href={`${base}/auto`}>{t("crumb.catalogo")}</Link>
            </li>
            <li aria-hidden="true">{chevron}</li>
            <li>
              <Link href={`${base}/auto`}>{auto.marca}</Link>
            </li>
            <li aria-hidden="true">{chevron}</li>
            <li aria-current="page">
              {auto.modello}
              {auto.versione ? ` ${auto.versione}` : ""}
            </li>
          </ol>
        </div>
      </nav>

      <section className="detail" aria-label={vehicleTitle}>
        <div className="container detail__grid">
          <Gallery images={auto.galleria} />
          <BuyBox
            auto={auto}
            locale={locale}
            settings={settings}
            vehicleTitle={vehicleTitle}
            pageUrl={pageUrl}
          />
        </div>
      </section>

      <SpecTabs auto={auto} locale={locale} />

      <ContactForm vehicleTitle={vehicleTitle} slug={auto.slug} />

      <SimilarCars all={all} current={auto} locale={locale} />

      <FloatingContact
        settings={settings}
        vehicleTitle={vehicleTitle}
        pageUrl={pageUrl}
      />
    </>
  );
}
