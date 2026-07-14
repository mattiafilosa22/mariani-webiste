import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getPage, getSettings } from "@/lib/api";
import { SiteMap } from "@/components/ui/SiteMap";
import {
  Breadcrumb,
  ContactInfo,
  PageHero,
  RequestForm,
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
  return editorialPageMetadata(locale as Locale, "contatti");
}

export default async function ContattiPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const [page, settings] = await Promise.all([
    getPage({ locale, key: "contatti" }),
    getSettings({ locale }),
  ]);
  if (!page?.pageHero) notFound();

  const { pageHero } = page;
  const t = await getTranslations("Pages.contatti");
  const tNav = await getTranslations("Nav");
  const tCommon = await getTranslations("Common");
  const base = `/${locale}`;

  const crumbs: Crumb[] = [
    { label: tCommon("home"), href: base },
    { label: tNav("contatti") },
  ];

  return (
    <>
      <Breadcrumb items={crumbs} ariaLabel={tNav("ariaLabel")} />
      <PageHero hero={pageHero} />

      <section className="section" aria-labelledby="ct-form">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">{t("formEyebrow")}</p>
            <h2 id="ct-form">{t("formTitle")}</h2>
          </div>
          <div className="location-grid">
            <RequestForm variant="contatti" privacyHref={`${base}/privacy-policy`} />
            <aside className="contact-aside">
              <ContactInfo settings={settings} title={t("infoTitle")} />
              {settings.mappa ? (
                <SiteMap
                  lat={settings.mappa.lat}
                  lng={settings.mappa.lng}
                  label={settings.indirizzo}
                  mapsUrl={settings.mapsUrl}
                />
              ) : null}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
