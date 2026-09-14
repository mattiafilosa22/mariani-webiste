"use client";

import { useState } from "react";
import { LeafletMount } from "./LeafletMount";

type DeferredMapProps = {
  lat: number;
  lng: number;
  label: string;
  ariaLabel: string;
  zoom: number;
  loadLabel: string;
  loadHint: string;
};

/** Monta Leaflet e le tile esterne soltanto dopo una scelta esplicita. */
export function DeferredMap({ loadLabel, loadHint, ...map }: DeferredMapProps) {
  const [enabled, setEnabled] = useState(false);

  if (enabled) return <LeafletMount {...map} />;

  return (
    <div className="map__placeholder">
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <p>{loadHint}</p>
      <button
        className="btn btn--outline"
        type="button"
        onClick={() => setEnabled(true)}
      >
        {loadLabel}
      </button>
    </div>
  );
}
