import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { getAutos, getPage, getSettings } from "@/lib/api";
import { toCarCardVm } from "@/lib/mappers/auto";
import type { CarCardVm } from "@/lib/mappers/auto";
import {
  JsonLd,
  absoluteUrl,
  buildDealerJsonLd,
  buildMetadata,
  localePath,
  localePathsFor,
} from "@/lib/seo";
import { Bento, Hero, Offers, QuickSearch, Service, selectFeatured } from "@/features/home";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "SEO" });
  return buildMetadata({
    locale: locale as Locale,
    paths: localePathsFor(),
    siteName: t("siteName"),
    heading: t("homeHeading"),
    description: t("homeDescription"),
  });
}

export default async function HomePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const [page, autos, settings] = await Promise.all([
    getPage({ locale, key: "home" }),
    getAutos({ locale }),
    getSettings({ locale }),
  ]);

  const t = await getTranslations();
  const cards: CarCardVm[] = selectFeatured(autos).map((summary) =>
    toCarCardVm(summary, locale, {
      km: t("CarCard.km"),
      alimentazione: t(`Spec.fuel.${summary.alimentazione}`),
      cambio: t(`Spec.transmission.${summary.cambio}`),
    })
  );

  const dealerJsonLd = buildDealerJsonLd({
    settings,
    url: absoluteUrl(localePath(locale)),
    logoUrl: absoluteUrl("/logo-mariani.png"),
  });

  return (
    <>
      <JsonLd data={dealerJsonLd} />
      {page?.hero ? <Hero hero={page.hero} locale={locale} /> : null}
      <QuickSearch locale={locale} />
      <Offers locale={locale} cards={cards} />
      {page?.bento ? <Bento bento={page.bento} locale={locale} /> : null}
      {page?.service ? <Service service={page.service} locale={locale} /> : null}
    </>
  );
}
