"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/** Lato server (e primo render client) assumiamo movimento consentito. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Restituisce `true` se l'utente preferisce ridurre le animazioni.
 * Basato su `useSyncExternalStore`: niente `setState` in effect, e reagisce
 * ai cambi della preferenza a runtime senza mismatch di idratazione.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
