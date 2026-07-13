import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getAutos, getPage, getSettings } from "@/lib/api";
import {
  JsonLd,
  absoluteUrl,
  autoPriceRange,
  buildDealerJsonLd,
  localePath,
} from "@/lib/seo";
import { SiteMap } from "@/components/ui/SiteMap";
import {
  Breadcrumb,
  ContactInfo,
  HoursTable,
  PageHero,
  RichText,
  Stats,
  editorialPageMetadata,
  type Crumb,
} from "@/features/pages";

type PageProps = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return editorialPageMetadata(locale as Locale, "chi-siamo");
}

const shopIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 9l1-5h16l1 5M5 9h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z" />
    <circle cx="8" cy="14" r="1.5" />
    <circle cx="16" cy="14" r="1.5" />
  </svg>
);
const wrenchIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M14.7 6.3a4 4 0 0 1-5 5L4 17v3h3l5.7-5.7a4 4 0 0 0 5-5l-2.3 2.3-2-2 2.3-2.3z" />
  </svg>
);

export default async function ChiSiamoPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const [page, settings, autos] = await Promise.all([
    getPage({ locale, key: "chi-siamo" }),
    getSettings({ locale }),
    getAutos({ locale }),
  ]);
  if (!page?.pageHero || !page.chiSiamo) notFound();

  const { pageHero, chiSiamo } = page;
  const t = await getTranslations("Pages.chiSiamo");
  const tNav = await getTranslations("Nav");
  const tCommon = await getTranslations("Common");
  const base = `/${locale}`;

  const localBusinessJsonLd = buildDealerJsonLd({
    settings,
    url: absoluteUrl(localePath(locale, "chi-siamo")),
    logoUrl: absoluteUrl("/logo-mariani.png"),
    type: "LocalBusiness",
    withPlaceData: true,
    priceRange: autoPriceRange(autos, locale),
  });

  const crumbs: Crumb[] = [
    { label: tCommon("home"), href: base },
    { label: tNav("chiSiamo") },
  ];

  return (
    <>
      <JsonLd data={localBusinessJsonLd} />
      <Breadcrumb items={crumbs} ariaLabel={tNav("ariaLabel")} />
      <PageHero hero={pageHero} />

      {/* La sezione è etichettata dall'occhiello (nome landmark distinto): l'h2
          ripete il titolo dell'hero e due region con lo stesso nome violerebbero
          landmark-unique (axe). */}
      <section className="section story" aria-labelledby="cs-storia-eyebrow">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow" id="cs-storia-eyebrow">
              {t("storiaEyebrow")}
            </p>
            <h2 id="cs-storia">{pageHero.title}</h2>
          </div>
          <div className="split">
            <RichText html={chiSiamo.storia} />
            {chiSiamo.stats.length > 0 ? <Stats items={chiSiamo.stats} /> : null}
          </div>
        </div>
      </section>

      <section
        className="section section--grey"
        id="dove-siamo"
        aria-labelledby="cs-dove"
      >
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">{t("doveEyebrow")}</p>
            <h2 id="cs-dove">{t("doveTitle")}</h2>
            {chiSiamo.comeRaggiungerci ? <p>{chiSiamo.comeRaggiungerci}</p> : null}
          </div>
          <div className="location-grid">
            {settings.mappa ? (
              <SiteMap
                lat={settings.mappa.lat}
                lng={settings.mappa.lng}
                label={settings.indirizzo}
                mapsUrl={settings.mapsUrl}
              />
            ) : null}
            <ContactInfo settings={settings} title={t("infoTitle")} />
          </div>
        </div>
      </section>

      {settings.orari.length > 0 || settings.orariOfficina.length > 0 ? (
        <section className="section" id="orari" aria-labelledby="cs-orari">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">{t("orariEyebrow")}</p>
              <h2 id="cs-orari">{t("orariTitle")}</h2>
            </div>
            <div className="hours-groups">
              {settings.orari.length > 0 ? (
                <HoursTable caption={t("vendita")} rows={settings.orari} icon={shopIcon} />
              ) : null}
              {settings.orariOfficina.length > 0 ? (
                <HoursTable caption={t("officina")} rows={settings.orariOfficina} icon={wrenchIcon} />
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section section--grey" aria-labelledby="cs-visit">
        <div className="container">
          <div className="visit-cta">
            <h2 id="cs-visit">{t("visitTitle")}</h2>
            <p>{t("visitText")}</p>
            <div className="visit-cta__actions">
              <Link className="btn btn--primary btn--lg" href={`${base}/contatti`}>
                {t("visitCta")}
              </Link>
              <Link className="btn btn--outline btn--lg" href={`${base}/auto`}>
                {t("visitCatalog")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
