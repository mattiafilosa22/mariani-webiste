/**
 * Logica pura, testabile, delle pagine editoriali.
 */

/** Passi di durata (mesi) da min a max con step di 12 (fallback [min,max]). */
export function durataOptions(min: number, max: number, step = 12): number[] {
  if (min <= 0 || max < min || step <= 0) return [];
  const options: number[] = [];
  for (let m = min; m <= max; m += step) options.push(m);
  return options.length > 0 ? options : [min, max];
}

/** Riconosce una fascia oraria "chiusa" (IT/EN), robusta a spazi/maiuscole. */
export function isClosed(apertura: string): boolean {
  return /^(chiuso|closed)$/i.test(apertura.trim());
}
