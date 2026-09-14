import type { Auto } from "@/domain";
import type { Locale } from "@/i18n/routing";
import { formatKm, formatPrice } from "@/lib/mappers/auto";

type VehicleDescriptionInput = {
  auto: Auto;
  locale: Locale;
  title: string;
  fuel: string;
  transmission: string;
};

/** Compone la descrizione SEO evitando valori non applicabili o sentinella. */
export function buildVehicleDescription({
  auto,
  locale,
  title,
  fuel,
  transmission,
}: VehicleDescriptionInput): string {
  const isRegistered = auto.tipo !== "nuova";

  return [
    title,
    isRegistered && auto.anno > 1900 ? String(auto.anno) : null,
    isRegistered && auto.km > 0 ? `${formatKm(auto.km, locale)} km` : null,
    fuel,
    transmission,
    formatPrice(auto.prezzoFinale, locale),
  ]
    .filter((value): value is string => Boolean(value))
    .join(" · ");
}
