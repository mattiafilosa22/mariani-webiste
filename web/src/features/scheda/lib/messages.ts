import type { Auto } from "@/domain";

/**
 * Costruzione dei messaggi pre-compilati (preventivo, WhatsApp, Messenger).
 * Funzioni pure e testabili: nessuna dipendenza da React o dal DOM.
 */

/** Titolo leggibile del veicolo: "Ford Puma 1.0 EcoBoost Hybrid Titanium". */
export function buildVehicleTitle(
  auto: Pick<Auto, "marca" | "modello" | "versione">
): string {
  return [auto.marca, auto.modello, auto.versione]
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(" ");
}

/** Sostituisce i segnaposto `{chiave}` in un template con i valori forniti. */
export function fillTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) =>
    key in vars ? vars[key] : ""
  );
}

/** Testo del deep-link WhatsApp: "<prefisso><titolo> <url>". */
export function buildWhatsappText(
  prefix: string,
  title: string,
  url: string
): string {
  return `${prefix}${title} ${url}`.trim();
}

/** Solo cifre: normalizza un numero di telefono per l'URL wa.me. */
export function toWaNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** URL WhatsApp con testo pre-compilato ed encodato. */
export function whatsappHref(number: string, text: string): string {
  return `https://wa.me/${toWaNumber(number)}?text=${encodeURIComponent(text)}`;
}

/**
 * Ricava lo handle Messenger dall'URL della pagina Facebook nei settings
 * (es. "https://www.facebook.com/marianiford" → "marianiford").
 * Restituisce `null` se non ricavabile, così la UI può nascondere il pulsante.
 */
export function messengerHandle(facebookUrl?: string): string | null {
  if (!facebookUrl) return null;
  const trimmed = facebookUrl.trim();
  if (trimmed.length === 0 || trimmed === "#") return null;

  const match = trimmed.match(
    /facebook\.com\/(?:profile\.php\?id=)?([A-Za-z0-9._-]+)/i
  );
  const handle = match?.[1];
  return handle && handle.length > 0 ? handle : null;
}

/** URL Messenger a partire dallo handle di pagina. */
export function messengerHref(handle: string): string {
  return `https://m.me/${handle}`;
}
