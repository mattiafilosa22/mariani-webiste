"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { usePrefersReducedMotion } from "@/features/home/lib/usePrefersReducedMotion";
import { computeCountdown, formatCountdown } from "../lib/countdown";

type CountdownProps = {
  /** Scadenza offerta in formato ISO (dal CMS). */
  deadlineIso: string;
  /** Data statica già formattata, mostrata senza JS / con reduced-motion. */
  staticDate: string;
};

const TICK_MS = 60_000;

/**
 * Countdown accessibile dell'offerta.
 * - SSR e primo render: data statica (degrada senza JS).
 * - Client con movimento consentito: aggiornamento al minuto, `aria-live`
 *   cortese così lo screen reader non viene interrotto ad ogni tick.
 * - `prefers-reduced-motion`: resta sulla data statica.
 */
export function Countdown({ deadlineIso, staticDate }: CountdownProps) {
  const t = useTranslations("Scheda.price");
  const reduceMotion = usePrefersReducedMotion();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    if (reduceMotion) return;
    // rAF evita il setState sincrono nel corpo dell'effect (cascading render).
    const raf = requestAnimationFrame(() => setNow(new Date()));
    const id = window.setInterval(() => setNow(new Date()), TICK_MS);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(id);
    };
  }, [reduceMotion]);

  const cd = now ? computeCountdown(deadlineIso, now) : null;

  let content: ReactNode;
  if (cd && !cd.expired) {
    const remaining = formatCountdown(cd, {
      days: t("unitDays"),
      hours: t("unitHours"),
      minutes: t("unitMinutes"),
    });
    content = (
      <span>
        {t("offerEndsIn")} <time dateTime={deadlineIso}>{remaining}</time>
      </span>
    );
  } else if (cd?.expired) {
    content = <span>{t("offerExpired")}</span>;
  } else {
    content = (
      <span>
        <time dateTime={deadlineIso}>{t("offerUntil", { date: staticDate })}</time>
      </span>
    );
  }

  return (
    <p className="countdown" aria-live="polite">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden="true"
      >
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2 2M9 2h6" />
      </svg>
      {content}
    </p>
  );
}
