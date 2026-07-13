"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useTranslations } from "next-intl";
import type { AutoImage } from "@/domain";

type GalleryProps = {
  images: AutoImage[];
};

/**
 * Galleria della scheda: immagine principale + strip di miniature (slider
 * orizzontale) e lightbox modale accessibile.
 * Immagini WordPress: `<img srcset>` (l'ottimizzatore server non è disponibile
 * in export statico). Le miniature sono `button` con `aria-current`.
 */
export function Gallery({ images }: GalleryProps) {
  const t = useTranslations("Scheda.gallery");
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const total = images.length;

  const current = images[active];

  const openLightbox = useCallback(() => setLightboxOpen(true), []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const go = useCallback(
    (delta: number) => setActive((prev) => (prev + delta + total) % total),
    [total]
  );

  return (
    <div className="gallery">
      <button
        type="button"
        className="gallery__main"
        onClick={openLightbox}
        aria-label={t("openLightbox")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- export statico: immagini WP già dimensionate */}
        <img
          src={current.src}
          srcSet={current.srcset}
          width={current.width}
          height={current.height}
          alt={current.alt}
          decoding="async"
        />
        <span className="gallery__counter" aria-hidden="true">
          {active + 1} / {total}
        </span>
        <span className="gallery__zoom" aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4-4M11 8v6M8 11h6" />
          </svg>
          {t("zoom")}
        </span>
      </button>

      {total > 1 ? (
        <div
          className="gallery__strip"
          role="group"
          aria-label={t("thumbs")}
        >
          {images.map((image, index) => (
            <button
              key={image.src + index}
              type="button"
              className="gallery-thumb"
              aria-current={index === active}
              aria-label={t("showPhoto", { index: index + 1 })}
              onClick={() => setActive(index)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- export statico */}
              <img
                src={image.src}
                srcSet={image.srcset}
                width={image.width}
                height={image.height}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      ) : null}

      {lightboxOpen ? (
        <Lightbox
          images={images}
          index={active}
          onClose={closeLightbox}
          onNavigate={go}
        />
      ) : null}
    </div>
  );
}

type LightboxProps = {
  images: AutoImage[];
  index: number;
  onClose: () => void;
  onNavigate: (delta: number) => void;
};

/** Dialog modale con focus-trap, Esc e frecce per navigare le foto. */
function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const t = useTranslations("Scheda.gallery");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const total = images.length;
  const image = images[index];

  // Blocca lo scroll di fondo, sposta il focus nel dialog e lo ripristina.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      onNavigate(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      onNavigate(-1);
    } else if (event.key === "Tab") {
      trapFocus(event, dialogRef.current);
    }
  }

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={t("lightbox")}
      ref={dialogRef}
      onKeyDown={onKeyDown}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        ref={closeRef}
        type="button"
        className="lightbox__close"
        aria-label={t("close")}
        onClick={onClose}
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
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div className="lightbox__stage">
        {total > 1 ? (
          <button
            type="button"
            className="lightbox__nav lightbox__nav--prev"
            aria-label={t("prev")}
            onClick={() => onNavigate(-1)}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : null}

        {/* eslint-disable-next-line @next/next/no-img-element -- export statico */}
        <img
          className="lightbox__img"
          src={image.src}
          srcSet={image.srcset}
          width={image.width}
          height={image.height}
          alt={image.alt}
          decoding="async"
        />

        {total > 1 ? (
          <button
            type="button"
            className="lightbox__nav lightbox__nav--next"
            aria-label={t("next")}
            onClick={() => onNavigate(1)}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ) : null}
      </div>

      <p className="lightbox__counter" aria-live="polite">
        {t("counter", { index: index + 1, total })}
      </p>
    </div>
  );
}

/** Mantiene il focus all'interno del dialog durante la navigazione con Tab. */
function trapFocus(event: KeyboardEvent<HTMLDivElement>, container: HTMLElement | null) {
  if (!container) return;
  const focusable = container.querySelectorAll<HTMLElement>(
    'button, [href], input, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const activeEl = document.activeElement;

  if (event.shiftKey && activeEl === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && activeEl === last) {
    event.preventDefault();
    first.focus();
  }
}
