import type { Auto, AutoSummary, Badge } from "@/domain";
import type { Locale } from "@/i18n/routing";

/**
 * Mapper dominio → ViewModel. Isolano la formattazione (prezzi, spec, badge)
 * dai componenti di presentazione, così la UI resta dichiarativa e testabile.
 */

/** Deriva il riepilogo (card) dalla scheda completa. */
export function autoToSummary(auto: Auto): AutoSummary {
  return {
    id: auto.id,
    slug: auto.slug,
    tipo: auto.tipo,
    categoria: auto.categoria,
    marca: auto.marca,
    modello: auto.modello,
    versione: auto.versione,
    anno: auto.anno,
    km: auto.km,
    prezzoListino: auto.prezzoListino,
    sconto: auto.sconto,
    prezzoFinale: auto.prezzoFinale,
    alimentazione: auto.alimentazione,
    cambio: auto.cambio,
    trazione: auto.trazione,
    carrozzeria: auto.carrozzeria,
    potenzaCv: auto.potenzaCv,
    colore: auto.colore,
    badge: auto.badge,
    inEvidenza: auto.inEvidenza,
    scadenzaOfferta: auto.scadenzaOfferta,
    copertina: auto.galleria[0],
  };
}

export type PriceVm = {
  now: string;
  old: string | null;
  isPromo: boolean;
};

export type BadgeVm = {
  key: Badge;
  variant: "promo" | "pronta" | "ibrido" | "elettrico" | "km0" | "neutral";
};

export type CarCardVm = {
  slug: string;
  brand: string;
  model: string;
  version: string;
  specs: string[];
  price: PriceVm;
  badges: BadgeVm[];
  image: AutoSummary["copertina"];
};

const localeTag: Record<Locale, string> = { it: "it-IT", en: "en-GB" };

const badgeVariant: Record<Badge, BadgeVm["variant"]> = {
  promo: "promo",
  pronta: "pronta",
  ibrido: "ibrido",
  elettrico: "elettrico",
  km0: "km0",
  neopatentati: "neutral",
};

/** Formatta un importo in euro senza decimali, secondo la locale. */
export function formatPrice(value: number, locale: Locale): string {
  return new Intl.NumberFormat(localeTag[locale], {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Formatta i chilometri con separatore migliaia della locale. */
export function formatKm(km: number, locale: Locale): string {
  return new Intl.NumberFormat(localeTag[locale]).format(km);
}

/**
 * Costruisce il ViewModel della card auto.
 * `alimentazioneLabel`/`kmLabel` sono passati già tradotti dal chiamante
 * (le label UI vivono in next-intl, non nel mapper).
 */
export function toCarCardVm(
  summary: AutoSummary,
  locale: Locale,
  labels: { km: string; alimentazione: string; cambio: string }
): CarCardVm {
  const hasDiscount =
    summary.prezzoFinale < summary.prezzoListino && summary.prezzoFinale > 0;

  return {
    slug: summary.slug,
    brand: summary.marca,
    model: summary.modello,
    version: summary.versione,
    specs: [
      String(summary.anno),
      `${formatKm(summary.km, locale)} ${labels.km}`,
      labels.alimentazione,
      labels.cambio,
    ],
    price: {
      now: formatPrice(summary.prezzoFinale, locale),
      old: hasDiscount ? formatPrice(summary.prezzoListino, locale) : null,
      isPromo: hasDiscount,
    },
    badges: summary.badge.map((key) => ({ key, variant: badgeVariant[key] })),
    image: summary.copertina,
  };
}
