import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getPage } from "@/lib/api";
import {
  BenefitGrid,
  Breadcrumb,
  PageHero,
  RequestForm,
  ServicesList,
  Steps,
  editorialPageMetadata,
  type Crumb,
} from "@/features/pages";
import { durataOptions } from "@/features/pages/lib/pages";

type PageProps = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return editorialPageMetadata(locale as Locale, "noleggio");
}

export default async function NoleggioPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const page = await getPage({ locale, key: "noleggio" });
  if (!page?.pageHero || !page.noleggio) notFound();

  const { pageHero, noleggio } = page;
  const t = await getTranslations("Pages.noleggio");
  const tNav = await getTranslations("Nav");
  const tCommon = await getTranslations("Common");
  const base = `/${locale}`;

  const crumbs: Crumb[] = [
    { label: tCommon("home"), href: base },
    { label: tNav("noleggio") },
  ];

  const ctaHref = noleggio.ctaUrl ?? "#richiesta";

  return (
    <>
      <Breadcrumb items={crumbs} ariaLabel={tNav("ariaLabel")} />
      <PageHero
        hero={pageHero}
        actions={
          <>
            <a className="btn btn--primary btn--lg" href={ctaHref}>
              {noleggio.ctaLabel ?? t("formTitle")}
            </a>
            <a className="btn btn--ghost-light btn--lg" href="#come-funziona">
              {t("discover")}
            </a>
          </>
        }
      />

      {noleggio.vantaggi.length > 0 ? (
        <section className="section" aria-labelledby="nlt-vantaggi">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">{t("vantaggiEyebrow")}</p>
              <h2 id="nlt-vantaggi">{t("vantaggiTitle")}</h2>
            </div>
            <BenefitGrid items={noleggio.vantaggi} />
          </div>
        </section>
      ) : null}

      {noleggio.steps.length > 0 ? (
        <section
          className="section section--grey"
          id="come-funziona"
          aria-labelledby="nlt-steps"
        >
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">{t("stepsEyebrow")}</p>
              <h2 id="nlt-steps">{t("stepsTitle")}</h2>
              <p>
                {t("durata", {
                  min: noleggio.durataMin,
                  max: noleggio.durataMax,
                })}
              </p>
            </div>
            <Steps items={noleggio.steps} />
          </div>
        </section>
      ) : null}

      {noleggio.serviziInclusi.length > 0 ? (
        <section className="section" aria-labelledby="nlt-servizi">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">{t("serviziEyebrow")}</p>
              <h2 id="nlt-servizi">{t("serviziTitle")}</h2>
            </div>
            <ServicesList items={noleggio.serviziInclusi} />
          </div>
        </section>
      ) : null}

      <section
        className="section section--grey request"
        id="richiesta"
        aria-labelledby="nlt-form"
      >
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">{t("formEyebrow")}</p>
            <h2 id="nlt-form">{t("formTitle")}</h2>
          </div>
          <RequestForm
            variant="noleggio"
            privacyHref={`${base}/privacy-policy`}
            durataOptions={durataOptions(noleggio.durataMin, noleggio.durataMax)}
          />
        </div>
      </section>
    </>
  );
}
