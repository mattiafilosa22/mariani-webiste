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
  /** true quando il prezzo non è definito (≤ 0) → mostrato come "Prezzo su richiesta". */
  onRequest: boolean;
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
 * Etichette per i valori non ancora definiti (0): il dominio usa 0 come
 * "sconosciuto", la UI lo rende in modo grazioso invece di "€ 0" / "0 km".
 */
export type PlaceholderLabels = { priceOnRequest: string; nd: string };

/** Prezzo formattato, oppure "Prezzo su richiesta" se non definito (≤ 0). */
export function formatPriceOrRequest(
  value: number,
  locale: Locale,
  onRequest: string
): string {
  return value > 0 ? formatPrice(value, locale) : onRequest;
}

/** Anno come stringa, oppure "n.d." se non definito (≤ 0). */
export function formatYear(anno: number, nd: string): string {
  return anno > 0 ? String(anno) : nd;
}

/** Chilometri con unità, oppure "n.d." se non definiti (≤ 0). */
export function formatKmLabel(
  km: number,
  locale: Locale,
  unit: string,
  nd: string
): string {
  return km > 0 ? `${formatKm(km, locale)} ${unit}` : nd;
}

/** Potenza con unità, oppure "n.d." se non definita (≤ 0). */
export function formatPower(cv: number, unit: string, nd: string): string {
  return cv > 0 ? `${cv} ${unit}` : nd;
}

/**
 * Costruisce il ViewModel della card auto.
 * `alimentazioneLabel`/`kmLabel` sono passati già tradotti dal chiamante
 * (le label UI vivono in next-intl, non nel mapper).
 */
export function toCarCardVm(
  summary: AutoSummary,
  locale: Locale,
  labels: {
    km: string;
    alimentazione: string;
    cambio: string;
  } & PlaceholderLabels
): CarCardVm {
  const hasDiscount =
    summary.prezzoFinale < summary.prezzoListino && summary.prezzoFinale > 0;

  return {
    slug: summary.slug,
    brand: summary.marca,
    model: summary.modello,
    version: summary.versione,
    specs: [
      formatYear(summary.anno, labels.nd),
      formatKmLabel(summary.km, locale, labels.km, labels.nd),
      labels.alimentazione,
      labels.cambio,
    ],
    price: {
      now: formatPriceOrRequest(summary.prezzoFinale, locale, labels.priceOnRequest),
      old: hasDiscount ? formatPrice(summary.prezzoListino, locale) : null,
      isPromo: hasDiscount,
      onRequest: summary.prezzoFinale <= 0,
    },
    badges: summary.badge.map((key) => ({ key, variant: badgeVariant[key] })),
    image: summary.copertina,
  };
}
