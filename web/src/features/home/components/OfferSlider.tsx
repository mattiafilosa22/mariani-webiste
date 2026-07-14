"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { usePrefersReducedMotion } from "../lib/usePrefersReducedMotion";

type OfferSliderProps = {
  /** Slide già renderizzate lato server (es. `CarCard`). */
  slides: ReactNode[];
  /** Intestazione della sezione (eyebrow/titolo), resa dal server. */
  heading: ReactNode;
};

const AUTOPLAY_MS = 4800;

/**
 * Slider accessibile delle "Auto in offerta".
 * - Semantica: region con `aria-roledescription="carousel"`, ogni slide è un
 *   gruppo etichettato ("Offerta i di n").
 * - Comandi: frecce prev/next, dot con `aria-current`, pulsante pausa/riprendi.
 * - Tastiera: ArrowLeft/ArrowRight spostano lo slider.
 * - Autoplay: pausa su hover/focus e su richiesta; disattivato del tutto con
 *   `prefers-reduced-motion` (scroll comunque disponibile via comandi).
 */
export function OfferSlider({ slides, heading }: OfferSliderProps) {
  const t = useTranslations("Slider");
  const total = slides.length;

  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  const setActiveIndex = useCallback((index: number) => {
    activeRef.current = index;
    setActive(index);
  }, []);

  const goTo = useCallback(
    (index: number, smooth = true) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(index, total - 1));
      const card = track.children[clamped] as HTMLElement | undefined;
      if (!card) return;
      track.scrollTo({
        left: card.offsetLeft - track.offsetLeft,
        behavior: smooth && !reduceMotion ? "smooth" : "auto",
      });
      setActiveIndex(clamped);
    },
    [total, reduceMotion, setActiveIndex]
  );

  // Sincronizza il dot attivo con la posizione di scroll.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const items = Array.from(track.children) as HTMLElement[];
        const center = track.scrollLeft + track.clientWidth / 2;
        let nearest = 0;
        let best = Number.POSITIVE_INFINITY;
        items.forEach((item, index) => {
          const itemCenter =
            item.offsetLeft - track.offsetLeft + item.clientWidth / 2;
          const distance = Math.abs(itemCenter - center);
          if (distance < best) {
            best = distance;
            nearest = index;
          }
        });
        if (nearest !== activeRef.current) setActiveIndex(nearest);
      });
    };
    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, [setActiveIndex]);

  // Autoplay: attivo solo se consentito e non in pausa/interazione.
  useEffect(() => {
    if (reduceMotion || userPaused || interacting || total <= 1) return;
    const id = window.setInterval(() => {
      goTo((activeRef.current + 1) % total);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, userPaused, interacting, total, goTo]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(activeRef.current + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(activeRef.current - 1);
    }
  }

  // Drag-to-scroll con il puntatore (mouse/penna): si scorre "spostando" le
  // card. Il touch usa lo scroll nativo. La classe `is-dragging` disattiva lo
  // snap durante il trascinamento e blocca i click involontari su link/immagini.
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });

  const onPointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const track = trackRef.current;
    if (!track) return;
    drag.current = {
      active: true,
      startX: event.clientX,
      startLeft: track.scrollLeft,
      moved: false,
    };
  }, []);

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !drag.current.active) return;
    const delta = event.clientX - drag.current.startX;
    if (!drag.current.moved && Math.abs(delta) < 6) return;
    if (!drag.current.moved) {
      drag.current.moved = true;
      track.classList.add("is-dragging");
      track.setPointerCapture(event.pointerId);
    }
    track.scrollLeft = drag.current.startLeft - delta;
  }, []);

  const endDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !drag.current.active) return;
    drag.current.active = false;
    if (drag.current.moved) {
      track.classList.remove("is-dragging");
      if (track.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId);
      }
      goTo(activeRef.current, false);
    }
  }, [goTo]);

  const autoplayOn = !reduceMotion && !userPaused && total > 1;

  return (
    <div
      className="offer-slider"
      role="region"
      aria-roledescription="carousel"
      aria-label={t("region")}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={() => setInteracting(false)}
    >
      <div className="offers-head">
        {heading}
        <div className="slider-nav">
          {total > 1 && !reduceMotion ? (
            <button
              type="button"
              className="slider-btn"
              aria-pressed={userPaused}
              onClick={() => setUserPaused((prev) => !prev)}
            >
              {autoplayOn ? (
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
              ) : (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <polygon points="6 4 20 12 6 20 6 4" />
                </svg>
              )}
              <span className="sr-only">
                {autoplayOn ? t("pause") : t("play")}
              </span>
            </button>
          ) : null}
          <button
            type="button"
            className="slider-btn"
            aria-label={t("prev")}
            onClick={() => goTo(activeRef.current - 1)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            className="slider-btn"
            aria-label={t("next")}
            onClick={() => goTo(activeRef.current + 1)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="slider">
        {/* Div (non ul/li) perché ogni slide usa role="group": la semantica di
            lista e quella di carosello confliggono (violazioni axe list /
            aria-allowed-role). Il pattern APG carousel usa gruppi, non liste. */}
        <div
          className="slider__track"
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              role="group"
              aria-roledescription="slide"
              aria-label={t("slide", { index: index + 1, total })}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {total > 1 ? (
        <div className="slider-dots" role="group" aria-label={t("dotsLabel")}>
          {slides.map((_, index) => (
            <button
              type="button"
              key={index}
              className={`dot${index === active ? " is-active" : ""}`}
              aria-label={t("goToSlide", { index: index + 1 })}
              aria-current={index === active}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
