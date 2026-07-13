import type { AutoSummary } from "@/domain";
import type { Locale } from "@/i18n/routing";
import { formatPrice } from "@/lib/mappers/auto";

/**
 * `priceRange` schema.org derivato dai prezzi REALI del catalogo
 * (min–max prezzo finale). Restituisce `undefined` se non ci sono auto,
 * così il campo viene omesso invece di inventare un valore.
 */
export function autoPriceRange(
  autos: readonly AutoSummary[],
  locale: Locale
): string | undefined {
  const prices = autos
    .map((auto) => auto.prezzoFinale)
    .filter((price) => price > 0);
  if (prices.length === 0) return undefined;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max
    ? formatPrice(min, locale)
    : `${formatPrice(min, locale)}–${formatPrice(max, locale)}`;
}
