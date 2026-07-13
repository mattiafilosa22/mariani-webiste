import type { MetadataRoute } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { getAutos } from "@/lib/api";
import {
  absoluteUrl,
  autoPath,
  autoVehicleKey,
  buildLanguageAlternates,
  localePathsFor,
} from "@/lib/seo";

/** Richiesto da `output: 'export'`: emette `out/sitemap.xml` staticamente. */
export const dynamic = "force-static";

/**
 * Sitemap statica generata all'export (`output: 'export'` → `out/sitemap.xml`).
 * Include TUTTE le route in ENTRAMBE le locali con hreflang reciproci, più una
 * voce per ciascuna scheda auto (slug reali, riconciliati per id tra IT/EN).
 * URL assoluti dalla base configurabile (`NEXT_PUBLIC_SITE_URL`).
 */

/** Segmenti (dopo il locale) delle route statiche, identici in IT/EN. */
const STATIC_ROUTES: string[][] = [
  [],
  ["auto"],
  ["auto", "nuove"],
  ["auto", "usate"],
  ["auto", "km0"],
  ["veicoli-commerciali", "nuovi"],
  ["veicoli-commerciali", "usati"],
  ["noleggio"],
  ["officina"],
  ["chi-siamo"],
  ["contatti"],
  ["privacy-policy"],
  ["cookie-policy"],
];

type SitemapEntry = MetadataRoute.Sitemap[number];

function entry(
  paths: Record<Locale, string>,
  priority: number,
  changeFrequency: SitemapEntry["changeFrequency"]
): SitemapEntry {
  return {
    url: absoluteUrl(paths[routing.defaultLocale]),
    changeFrequency,
    priority,
    alternates: { languages: buildLanguageAlternates(paths) },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = STATIC_ROUTES.map((segments) => {
    const isHome = segments.length === 0;
    return entry(
      localePathsFor(...segments),
      isHome ? 1 : 0.7,
      isHome ? "daily" : "weekly"
    );
  });

  // Slug per locale, raggruppati per veicolo: si preferisce il legame Polylang
  // esatto (`traduzioni`) esposto dall'API, con fallback alla chiave-contenuto.
  const byVehicle = new Map<string, Partial<Record<Locale, string>>>();
  for (const locale of routing.locales) {
    const autos = await getAutos({ locale });
    for (const auto of autos) {
      const key = autoVehicleKey(auto);
      const group = byVehicle.get(key) ?? {};
      group[locale] = auto.slug;
      byVehicle.set(key, group);
    }
  }

  // Una voce per veicolo, con gli alternates delle sole locali effettivamente
  // presenti (una traduzione può mancare).
  const autoEntries: MetadataRoute.Sitemap = [];
  for (const slugs of byVehicle.values()) {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      const slug = slugs[locale];
      if (slug) languages[locale] = absoluteUrl(autoPath(locale, slug));
    }
    const primary = languages[routing.defaultLocale] ?? Object.values(languages)[0];
    if (!primary) continue;
    languages["x-default"] = languages[routing.defaultLocale] ?? primary;
    autoEntries.push({
      url: primary,
      changeFrequency: "daily",
      priority: 0.8,
      alternates: { languages },
    });
  }

  return [...staticEntries, ...autoEntries];
}
