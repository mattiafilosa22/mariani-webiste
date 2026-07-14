"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";

type NavChild = { label: string; href: string };
type NavGroup = { label: string; href: string; children?: NavChild[] };

const chevron = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

function useNavGroups(locale: Locale): NavGroup[] {
  const t = useTranslations("Nav");
  const base = `/${locale}`;
  return [
    {
      label: t("auto"),
      href: `${base}/auto`,
      children: [
        { label: t("autoNuove"), href: `${base}/auto/nuove` },
        { label: t("autoUsate"), href: `${base}/auto/usate` },
        { label: t("km0"), href: `${base}/auto/km0` },
        { label: t("offerte"), href: `${base}/auto?promo=1` },
      ],
    },
    {
      label: t("commerciali"),
      href: `${base}/veicoli-commerciali/nuovi`,
      children: [
        { label: t("commercialiNuovi"), href: `${base}/veicoli-commerciali/nuovi` },
        { label: t("commercialiUsati"), href: `${base}/veicoli-commerciali/usati` },
        { label: t("allestimenti"), href: `${base}/veicoli-commerciali/nuovi` },
      ],
    },
    {
      label: t("usato"),
      href: `${base}/auto/usate`,
      children: [
        { label: t("tuttoUsato"), href: `${base}/auto/usate` },
        { label: t("usatoGarantito"), href: `${base}/auto/usate` },
        { label: t("permuta"), href: `${base}/auto/usate` },
      ],
    },
    {
      label: t("noleggio"),
      href: `${base}/noleggio`,
      children: [
        { label: t("noleggioLungo"), href: `${base}/noleggio` },
        { label: t("noleggioPrivati"), href: `${base}/noleggio` },
        { label: t("noleggioAziende"), href: `${base}/noleggio` },
      ],
    },
    {
      label: t("assistenza"),
      href: `${base}/officina`,
      children: [
        { label: t("officina"), href: `${base}/officina` },
        { label: t("prenotaIntervento"), href: `${base}/officina` },
        { label: t("ricambi"), href: `${base}/officina` },
        { label: t("carrozzeria"), href: `${base}/officina` },
      ],
    },
    {
      label: t("chiSiamo"),
      href: `${base}/chi-siamo`,
      children: [
        { label: t("storia"), href: `${base}/chi-siamo` },
        { label: t("doveSiamo"), href: `${base}/chi-siamo` },
        { label: t("orariContatti"), href: `${base}/chi-siamo` },
        { label: t("lavoraConNoi"), href: `${base}/chi-siamo` },
      ],
    },
    { label: t("contatti"), href: `${base}/contatti` },
  ];
}

/**
 * Nav principale + cluster CTA dell'header.
 * Sul desktop la nav è orizzontale con dropdown; sotto i 1200px diventa un
 * drawer accessibile (focus trap, Esc, backdrop, aria-expanded).
 * Nav ed hamburger condividono lo stato di apertura, ma restano nella
 * posizione flex corretta (nav al centro, hamburger nel cluster CTA).
 */
export function MainNav() {
  const locale = useLocale() as Locale;
  const t = useTranslations("Nav");
  const tActions = useTranslations("Actions");
  const groups = useNavGroups(locale);

  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navId = useId();

  const close = useCallback(() => setOpen(false), []);

  // Chiude sia il drawer mobile sia il dropdown desktop: oltre a resettare lo
  // stato, toglie il focus dall'elemento cliccato così `:focus-within` non tiene
  // più aperto il menu a tendina dopo la selezione di una voce.
  const dismiss = useCallback(() => {
    close();
    if (typeof document !== "undefined") {
      (document.activeElement as HTMLElement | null)?.blur();
    }
  }, [close]);

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  // In viewport mobile (<=1200px) il drawer è visivamente fuori schermo quando
  // chiuso: rendiamolo `inert` + `aria-hidden` così link e sottomenu escono dal
  // tab order e non sono annunciati dagli screen reader. In desktop la nav resta
  // sempre pienamente accessibile (dropdown incluso).
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const mql = window.matchMedia("(max-width: 1200px)");
    const applyHidden = () => {
      const hidden = mql.matches && !open;
      nav.inert = hidden;
      if (hidden) {
        nav.setAttribute("aria-hidden", "true");
      } else {
        nav.removeAttribute("aria-hidden");
      }
    };
    applyHidden();
    mql.addEventListener("change", applyHidden);
    return () => mql.removeEventListener("change", applyHidden);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const nav = navRef.current;
    nav?.querySelector<HTMLElement>("a, button")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !nav) return;
      const focusables = nav.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])"
      );
      if (focusables.length === 0) return;
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  return (
    <>
      <nav ref={navRef} id={navId} className="nav" aria-label={t("ariaLabel")}>
        <button
          type="button"
          className="mnav-close"
          onClick={close}
          aria-label={t("closeMenu")}
        >
          ×
        </button>
        {groups.map((group) => (
          <div className="nav__item" key={group.label}>
            <Link className="nav__link" href={group.href} onClick={dismiss}>
              {group.label}
              {group.children ? chevron : null}
            </Link>
            {group.children ? (
              <div className="nav__menu">
                {group.children.map((child) => (
                  <Link key={child.label} href={child.href} onClick={dismiss}>
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </nav>

      <div className="header-cta">
        <LocaleSwitcher />
        <ThemeToggle />
        <Link className="btn btn--green" href={`/${locale}/contatti`}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="cta-txt">{tActions("contattaci")}</span>
        </Link>
        <button
          ref={toggleRef}
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls={navId}
          aria-label={open ? t("closeMenu") : t("openMenu")}
          onClick={() => setOpen((value) => !value)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      <div className="mnav-backdrop" aria-hidden="true" onClick={close} />
    </>
  );
}
