"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type TabItem = {
  id: string;
  label: string;
  panel: ReactNode;
};

type TabsProps = {
  items: TabItem[];
  ariaLabel: string;
};

/**
 * Tablist accessibile secondo il pattern ARIA (tablist/tab/tabpanel):
 * - selezione con click e con tastiera (frecce, Home/End) e roving tabindex;
 * - pannelli non attivi con attributo `hidden`;
 * - riusata dai tab "Specifiche" e dal form contatto multi-richiesta.
 */
export function Tabs({ items, ariaLabel }: TabsProps) {
  const baseId = useId();
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusTab(index: number) {
    const clamped = (index + items.length) % items.length;
    setActive(clamped);
    tabRefs.current[clamped]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusTab(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusTab(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(items.length - 1);
        break;
      default:
        break;
    }
  }

  return (
    <div className="tabs">
      <div className="tabs__list" role="tablist" aria-label={ariaLabel}>
        {items.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              className="tabs__btn"
              id={`${baseId}-tab-${item.id}`}
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item, index) => (
        <div
          key={item.id}
          className="tabs__panel"
          id={`${baseId}-panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${item.id}`}
          tabIndex={0}
          hidden={index !== active}
        >
          {item.panel}
        </div>
      ))}
    </div>
  );
}
