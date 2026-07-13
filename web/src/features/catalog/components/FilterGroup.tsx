"use client";

import { useId, useState, type ReactNode } from "react";

type FilterGroupProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

const chevron = (
  <svg
    className="chev"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/**
 * Gruppo di filtro a fisarmonica. Il pulsante controlla la visibilità del
 * pannello via `aria-expanded`/`aria-controls`; il pannello usa `hidden` così
 * il contenuto collassato esce dal tab order e dagli screen reader.
 */
export function FilterGroup({
  title,
  defaultOpen = false,
  children,
}: FilterGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="fgroup">
      <button
        type="button"
        className="fgroup__btn"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {title}
        {chevron}
      </button>
      <div className="fgroup__panel" id={panelId} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
