import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getPage, getSettings } from "@/lib/api";
import {
  Breadcrumb,
  ContactInfo,
  FeatureCards,
  HoursTable,
  PageHero,
  RequestForm,
  SvcSteps,
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
  return editorialPageMetadata(locale as Locale, "officina");
}

const wrenchIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M14.7 6.3a4 4 0 0 1-5 5L4 17v3h3l5.7-5.7a4 4 0 0 0 5-5l-2.3 2.3-2-2 2.3-2.3z" />
  </svg>
);

export default async function OfficinaPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const [page, settings] = await Promise.all([
    getPage({ locale, key: "officina" }),
    getSettings({ locale }),
  ]);
  if (!page?.pageHero || !page.officina) notFound();

  const { pageHero, officina } = page;
  const t = await getTranslations("Pages.officina");
  const tNav = await getTranslations("Nav");
  const tCommon = await getTranslations("Common");
  const base = `/${locale}`;
  const phoneHref = `tel:${settings.telefono.replace(/\s/g, "")}`;

  const crumbs: Crumb[] = [
    { label: tCommon("home"), href: base },
    { label: tNav("assistenza") },
  ];

  return (
    <>
      <Breadcrumb items={crumbs} ariaLabel={tNav("ariaLabel")} />
      <PageHero
        hero={pageHero}
        actions={
          <>
            <a className="btn btn--green btn--lg" href={officina.ctaUrl ?? "#prenota"}>
              {officina.ctaLabel ?? t("bookTitle")}
            </a>
            <a className="btn btn--ghost-light btn--lg" href={phoneHref}>
              {t("call")}
            </a>
          </>
        }
      />

      {officina.servizi.length > 0 ? (
        <section className="section" aria-labelledby="off-servizi">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">{t("serviziEyebrow")}</p>
              <h2 id="off-servizi">{t("serviziTitle")}</h2>
            </div>
            <FeatureCards items={officina.servizi} />
          </div>
        </section>
      ) : null}

      <section
        className="section section--grey"
        id="prenota"
        aria-labelledby="off-prenota"
      >
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">{t("bookEyebrow")}</p>
            <h2 id="off-prenota">{t("bookTitle")}</h2>
          </div>

          {officina.steps.length > 0 ? <SvcSteps items={officina.steps} /> : null}

          <div className="booking">
            <RequestForm variant="officina" privacyHref={`${base}/privacy-policy`} />
            <aside className="booking__aside">
              <ContactInfo settings={settings} title={t("assistTitle")} />
              {settings.orariOfficina.length > 0 ? (
                <div className="aside-block hours">
                  <HoursTable
                    caption={t("hoursTitle")}
                    rows={settings.orariOfficina}
                    icon={wrenchIcon}
                  />
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
