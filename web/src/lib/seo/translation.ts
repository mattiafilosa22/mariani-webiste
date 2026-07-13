import type { AutoSummary } from "@/domain";

/**
 * Chiave naturale che identifica lo STESSO veicolo fisico tra le lingue.
 * Con Polylang id e slug differiscono per traduzione e l'API non espone il
 * legame; marca/modello/versione/anno/km/prezzo sono invece indipendenti dalla
 * lingua (nomi propri + numeri) e combaciano. È l'unico modo affidabile per
 * costruire hreflang reciproci corretti sulle schede senza dati inventati.
 */
export function autoTranslationKey(
  auto: Pick<
    AutoSummary,
    "marca" | "modello" | "versione" | "anno" | "km" | "prezzoFinale"
  >
): string {
  return [
    auto.marca,
    auto.modello,
    auto.versione,
    auto.anno,
    auto.km,
    auto.prezzoFinale,
  ]
    .map((part) => String(part).trim().toLowerCase())
    .join("|");
}

/**
 * Chiave di raggruppamento delle traduzioni di un veicolo tra le lingue.
 * Preferisce il legame Polylang ESATTO esposto dall'API (`traduzioni`, mappa
 * locale→slug): entrambe le schede IT/EN condividono la stessa mappa, quindi la
 * chiave combacia. Ricade sull'euristica basata sul contenuto (`autoTranslationKey`)
 * solo quando l'API non espone il legame (es. Polylang non attivo).
 */
export function autoVehicleKey(
  auto: Pick<
    AutoSummary,
    | "marca"
    | "modello"
    | "versione"
    | "anno"
    | "km"
    | "prezzoFinale"
    | "traduzioni"
  >
): string {
  const { traduzioni } = auto;
  if (traduzioni) {
    const slugs = Object.keys(traduzioni)
      .sort()
      .map((locale) => `${locale}:${traduzioni[locale]}`);
    if (slugs.length > 0) return slugs.join("|");
  }
  return autoTranslationKey(auto);
}
