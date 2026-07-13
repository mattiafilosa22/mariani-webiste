import {
  autoSchema,
  autoSummaryListSchema,
  pageContentSchema,
  siteSettingsSchema,
  type Auto,
  type AutoSummary,
  type AutoTipo,
  type PageContent,
  type SiteSettings,
} from "@/domain";
import type { Locale } from "@/i18n/routing";
import { autoToSummary } from "@/lib/mappers/auto";
import { ApiError, fetchValidated, isApiConfigured, isStrict } from "./client";
import { mockAutos } from "./mock/autos";
import { mockSettings } from "./mock/settings";
import { mockPages } from "./mock/pages";

/**
 * Data layer pubblico (build-time). Ogni funzione prova la REST di WordPress
 * e, se `WP_API_URL` manca o la chiamata/validazione fallisce, ricade sul
 * dataset mock — così `npm run build` funziona anche senza CMS attivo.
 *
 * In modalità STRICT (`WP_API_STRICT=1`) il fallback è disattivato: gli errori
 * vengono propagati per far fallire il build a fronte di disallineamenti col CMS.
 */

const STRICT_NO_URL =
  "WP_API_URL non configurata: modalità strict richiede il CMS live";

/** Variante per risorse non nullable (liste, settings): il null è un errore. */
async function withFallback<T>(
  attempt: () => Promise<T | null>,
  fallback: () => T
): Promise<T> {
  if (!isApiConfigured()) {
    if (isStrict()) throw new ApiError(STRICT_NO_URL);
    return fallback();
  }
  if (isStrict()) {
    const result = await attempt();
    if (result === null) {
      throw new ApiError("Risorsa attesa assente (modalità strict)");
    }
    return result;
  }
  try {
    const result = await attempt();
    return result ?? fallback();
  } catch (error) {
    console.warn("[api] fallback al mock:", (error as Error).message);
    return fallback();
  }
}

/** Variante per risorse nullable (dettaglio, pagina): il null è "non trovato". */
async function withNullableFallback<T>(
  attempt: () => Promise<T | null>,
  fallback: () => T | null
): Promise<T | null> {
  if (!isApiConfigured()) {
    if (isStrict()) throw new ApiError(STRICT_NO_URL);
    return fallback();
  }
  if (isStrict()) return attempt();
  try {
    const result = await attempt();
    return result ?? fallback();
  } catch (error) {
    console.warn("[api] fallback al mock:", (error as Error).message);
    return fallback();
  }
}

export async function getAutos(args: {
  locale: Locale;
  type?: AutoTipo;
}): Promise<AutoSummary[]> {
  const { locale, type } = args;
  return withFallback(
    () =>
      fetchValidated("autos", autoSummaryListSchema, {
        lang: locale,
        type,
      }),
    () => {
      const summaries = mockAutos.map(autoToSummary);
      const filtered = type
        ? summaries.filter((auto) => auto.tipo === type)
        : summaries;
      return autoSummaryListSchema.parse(filtered);
    }
  );
}

export async function getAuto(args: {
  locale: Locale;
  slug: string;
}): Promise<Auto | null> {
  const { locale, slug } = args;
  return withNullableFallback(
    () => fetchValidated(`autos/${slug}`, autoSchema, { lang: locale }),
    () => mockAutos.find((auto) => auto.slug === slug) ?? null
  );
}

export async function getPage(args: {
  locale: Locale;
  key: string;
}): Promise<PageContent | null> {
  const { locale, key } = args;
  return withNullableFallback(
    () => fetchValidated(`pages/${key}`, pageContentSchema, { lang: locale }),
    () => mockPages[locale]?.[key] ?? null
  );
}

export async function getSettings(args: {
  locale: Locale;
}): Promise<SiteSettings> {
  return withFallback(
    () =>
      fetchValidated("settings", siteSettingsSchema, { lang: args.locale }),
    () => siteSettingsSchema.parse(mockSettings)
  );
}
