import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { getAuto, getAutos, getSettings } from "@/lib/api";
import { formatKm, formatPrice } from "@/lib/mappers/auto";
import {
  absoluteUrl,
  autoPath,
  autoTranslationKey,
  buildMetadata,
} from "@/lib/seo";
import type { Auto } from "@/domain";
import { SchedaView, buildVehicleTitle } from "@/features/scheda";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

/**
 * Pre-genera una scheda per ogni (locale, slug). Gli slug differiscono per
 * locale (Polylang): per ciascun locale si usano gli slug restituiti da
 * `getAutos({locale})` di quel locale. Compatibile con `output: 'export'`.
 */
export async function generateStaticParams() {
  const params: Array<{ locale: string; slug: string }> = [];
  for (const locale of routing.locales) {
    const autos = await getAutos({ locale });
    for (const auto of autos) {
      params.push({ locale, slug: auto.slug });
    }
  }
  return params;
}

/**
 * Risolve il path della scheda in ogni locale. Preferisce il legame di
 * traduzione ESATTO esposto dall'API (`traduzioni`, mappa locale→slug di
 * Polylang); ricade sulla riconciliazione per chiave-contenuto solo se l'API
 * non lo espone. Se una controparte non esiste, la lingua viene omessa dagli
 * hreflang: meglio nessun alternate che un alternate errato.
 */
async function localizedAutoPaths(
  locale: Locale,
  current: Auto
): Promise<Partial<Record<Locale, string>>> {
  const paths: Partial<Record<Locale, string>> = {
    [locale]: autoPath(locale, current.slug),
  };

  if (current.traduzioni) {
    for (const other of routing.locales) {
      if (other === locale) continue;
      const slug = current.traduzioni[other];
      if (slug) paths[other] = autoPath(other, slug);
    }
    return paths;
  }

  // Fallback: l'API non espone il legame Polylang → euristica sul contenuto.
  const key = autoTranslationKey(current);
  for (const other of routing.locales) {
    if (other === locale) continue;
    const autos = await getAutos({ locale: other });
    const match = autos.find((auto) => autoTranslationKey(auto) === key);
    if (match) paths[other] = autoPath(other, match.slug);
  }
  return paths;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  const auto = await getAuto({ locale, slug });
  if (!auto) return {};

  const t = await getTranslations({ locale, namespace: "SEO" });
  const tSpec = await getTranslations({ locale, namespace: "Spec" });
  const title = buildVehicleTitle(auto);
  const cover = auto.galleria[0];

  const description = [
    title,
    String(auto.anno),
    `${formatKm(auto.km, locale)} km`,
    tSpec(`fuel.${auto.alimentazione}`),
    tSpec(`transmission.${auto.cambio}`),
    formatPrice(auto.prezzoFinale, locale),
  ].join(" · ");

  return buildMetadata({
    locale,
    paths: await localizedAutoPaths(locale, auto),
    siteName: t("siteName"),
    heading: title,
    description,
    ogType: "article",
    image: cover
      ? {
          url: absoluteUrl(cover.src),
          width: cover.width,
          height: cover.height,
          alt: cover.alt,
        }
      : undefined,
  });
}

export default async function AutoDetailPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const [auto, all, settings] = await Promise.all([
    getAuto({ locale, slug }),
    getAutos({ locale }),
    getSettings({ locale }),
  ]);

  if (!auto) notFound();

  return <SchedaView auto={auto} all={all} locale={locale} settings={settings} />;
}
