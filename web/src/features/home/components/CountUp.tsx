"use client";

import { useEffect, useRef } from "react";
import { formatCountup, parseCountup } from "../lib/countup";

type CountUpProps = {
  /** Valore finale già formattato dal CMS (es. "10.000+"). */
  value: string;
  className?: string;
};

const DURATION_MS = 1900;

/**
 * Contatore animato che parte quando entra nel viewport.
 * Renderizza il valore reale lato server (nessun flash con JS disattivato) e,
 * se il movimento è consentito, anima da 0 al target scrivendo direttamente il
 * nodo di testo (nessun re-render per frame). Con `prefers-reduced-motion`
 * resta il valore statico.
 */
export function CountUp({ value, className }: CountUpProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const parts = parseCountup(value);
    if (parts.target <= 0) return;

    let raf = 0;
    const animate = () => {
      let start: number | null = null;
      const tick = (ts: number) => {
        if (start === null) start = ts;
        const progress = Math.min((ts - start) / DURATION_MS, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent =
          progress < 1
            ? formatCountup(Math.round(parts.target * eased), parts)
            : value;
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    el.textContent = formatCountup(0, parts);

    if (!("IntersectionObserver" in window)) {
      animate();
      return () => cancelAnimationFrame(raf);
    }

    let done = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !done) {
            done = true;
            animate();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.3, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <b ref={ref} className={className}>
      {value}
    </b>
  );
}
