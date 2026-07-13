"use client";

import { Fragment, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { usePrefersReducedMotion } from "../lib/usePrefersReducedMotion";
import { CarIllustration } from "./CarIllustration";

const STREAKS = [
  { top: "32%", duration: "6.5s", delay: ".2s" },
  { top: "50%", duration: "8s", delay: "1.7s" },
  { top: "67%", duration: "5.6s", delay: ".9s" },
];

/**
 * Sfondo cinematografico dell'hero: un'auto che entra in scena con "scie
 * luminose", realizzato in sola CSS (transform/opacity) per restare performante.
 * L'animazione è decorativa (`aria-hidden`) e può essere messa in pausa con un
 * pulsante accessibile. Con `prefers-reduced-motion` parte già in pausa (stato
 * statico), coerentemente con le regole CSS che azzerano le animazioni.
 */
export function HeroMedia() {
  const t = useTranslations("Hero");
  const reduceMotion = usePrefersReducedMotion();
  // `null` = nessuna scelta esplicita: segue la preferenza di sistema
  // (in pausa se l'utente riduce le animazioni).
  const [override, setOverride] = useState<boolean | null>(null);
  const paused = override ?? reduceMotion;

  return (
    <Fragment>
      <div
        className={`hero__media${paused ? " is-paused" : ""}`}
        aria-hidden="true"
      >
        <div className="hero__anim">
        {STREAKS.map((streak) => (
          <span
            key={streak.top}
            className="hero__streak"
            style={
              {
                "--t": streak.top,
                "--sd": streak.duration,
                "--sdl": streak.delay,
              } as CSSProperties
            }
          />
        ))}
        <span className="hero__sweep" />
        <div className="hero__stage">
          <div className="hero__car">
            <CarIllustration />
          </div>
        </div>
        </div>
      </div>

      <button
        type="button"
        className="hero__videobtn"
        aria-pressed={paused}
        onClick={() => setOverride(!paused)}
      >
        {paused ? (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <polygon points="6 4 20 12 6 20 6 4" />
          </svg>
        ) : (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        )}
        <span className="sr-only">{paused ? t("play") : t("pause")}</span>
      </button>
    </Fragment>
  );
}
