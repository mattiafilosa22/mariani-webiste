import { useCallback, useEffect, useRef } from "react";

/**
 * Restituisce una versione "debounced" del callback: utile per gli input
 * continui (slider prezzo/km/CV) così l'URL non viene riscritto a ogni tick.
 * Il timer viene azzerato allo smontaggio per evitare aggiornamenti tardivi.
 */
export function useDebouncedCallback<A extends unknown[]>(
  callback: (...args: A) => void,
  delay: number
): (...args: A) => void {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return useCallback(
    (...args: A) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
    },
    [delay]
  );
}
