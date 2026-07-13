import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getPage } from "@/lib/api";
import { buildMetadata, localePathsFor } from "@/lib/seo";

/**
 * Metadata SEO di una pagina editoriale (titolo/descrizione da WP + canonical,
 * hreflang, Open Graph). La `key` WP coincide col segmento di route, quindi il
 * canonical è `/{locale}/{key}/`. Descrizione derivata dai dati, mai inventata.
 */
export async function editorialPageMetadata(
  locale: Locale,
  key: string
): Promise<Metadata> {
  const [page, t] = await Promise.all([
    getPage({ locale, key }),
    getTranslations({ locale, namespace: "SEO" }),
  ]);
  return buildMetadata({
    locale,
    paths: localePathsFor(key),
    siteName: t("siteName"),
    heading: page?.title,
    description:
      page?.subtitle ?? page?.pageHero?.subtitle ?? t("defaultDescription"),
  });
}
