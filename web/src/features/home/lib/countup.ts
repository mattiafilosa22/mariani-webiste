/**
 * Analisi di una stringa "contatore" editoriale (es. "10.000+", "30+",
 * "1 giorno") nelle sue parti animabili. La logica è pura e senza dipendenze
 * dal DOM così da essere testabile e riusabile dal componente `CountUp`.
 */

export type Countup = {
  /** Testo non numerico che precede la cifra (raro, es. "€"). */
  prefix: string;
  /** Testo che segue la cifra (es. "+", " giorno"). */
  suffix: string;
  /** Valore intero verso cui animare. */
  target: number;
  /** Separatore delle migliaia rilevato nell'originale ("" se assente). */
  separator: string;
};

const DIGIT = /\d/;

/** Estrae prefisso, suffisso, target e separatore da una stringa contatore. */
export function parseCountup(display: string): Countup {
  const first = display.search(DIGIT);
  if (first === -1) {
    return { prefix: display, suffix: "", target: 0, separator: "" };
  }

  let last = display.length - 1;
  while (last >= 0 && !DIGIT.test(display[last])) last -= 1;

  const prefix = display.slice(0, first);
  const suffix = display.slice(last + 1);
  const core = display.slice(first, last + 1);

  const separatorMatch = core.match(/[.,\s](?=\d{3}(?:\D|$))/);
  const separator = separatorMatch ? separatorMatch[0] : "";
  const target = Number.parseInt(core.replace(/\D/g, ""), 10) || 0;

  return { prefix, suffix, target, separator };
}

/** Ricompone la stringa contatore per un valore intermedio dell'animazione. */
export function formatCountup(value: number, parts: Countup): string {
  const digits = parts.separator
    ? String(value).replace(/\B(?=(\d{3})+(?!\d))/g, parts.separator)
    : String(value);
  return `${parts.prefix}${digits}${parts.suffix}`;
}
