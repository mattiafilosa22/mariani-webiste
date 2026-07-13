"use client";

import { useId, useState } from "react";
import { useDebouncedCallback } from "../lib/useDebouncedCallback";

type RangeFilterProps = {
  legend: string;
  min: number;
  max: number;
  step: number;
  valueMin: number | null;
  valueMax: number | null;
  labelMin: string;
  labelMax: string;
  note?: string;
  format: (value: number) => string;
  onCommit: (min: number | null, max: number | null) => void;
};

/**
 * Doppio slider accessibile (min/max) per prezzo, anno, km, potenza.
 * Ogni cursore è un `input[type=range]` nativo: espone `aria-valuemin/max/now`,
 * è pilotabile da tastiera e annuncia il valore formattato via `aria-valuetext`.
 * Il commit verso l'URL è "debounced"; ai valori limite emette `null` (URL pulito).
 */
export function RangeFilter({
  legend,
  min,
  max,
  step,
  valueMin,
  valueMax,
  labelMin,
  labelMax,
  note,
  format,
  onCommit,
}: RangeFilterProps) {
  const [lo, setLo] = useState(valueMin ?? min);
  const [hi, setHi] = useState(valueMax ?? max);
  // Traccia i valori esterni per risincronizzare in fase di render (pattern
  // ufficiale React) quando cambiano dall'esterno: "Azzera" o navigazione back.
  const [syncMin, setSyncMin] = useState(valueMin);
  const [syncMax, setSyncMax] = useState(valueMax);
  const noteId = useId();

  if (syncMin !== valueMin) {
    setSyncMin(valueMin);
    setLo(valueMin ?? min);
  }
  if (syncMax !== valueMax) {
    setSyncMax(valueMax);
    setHi(valueMax ?? max);
  }

  const commit = useDebouncedCallback(onCommit, 300);

  const emit = (nextLo: number, nextHi: number) => {
    commit(nextLo <= min ? null : nextLo, nextHi >= max ? null : nextHi);
  };

  const handleLo = (raw: number) => {
    const next = Math.min(raw, hi);
    setLo(next);
    emit(next, hi);
  };
  const handleHi = (raw: number) => {
    const next = Math.max(raw, lo);
    setHi(next);
    emit(lo, next);
  };

  const describedBy = note ? noteId : undefined;

  return (
    <div className="frange" role="group" aria-label={legend}>
      {note ? (
        <p className="fgroup__note" id={noteId}>
          {note}
        </p>
      ) : null}
      <div className="frange__values" aria-hidden="true">
        <span>
          {labelMin} <b>{format(lo)}</b>
        </span>
        <span>
          {labelMax} <b>{format(hi)}</b>
        </span>
      </div>
      <div className="frange__inputs">
        <label>
          <span>{labelMin}</span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={lo}
            aria-label={labelMin}
            aria-valuetext={format(lo)}
            aria-describedby={describedBy}
            onChange={(event) => handleLo(Number(event.target.value))}
          />
        </label>
        <label>
          <span>{labelMax}</span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={hi}
            aria-label={labelMax}
            aria-valuetext={format(hi)}
            aria-describedby={describedBy}
            onChange={(event) => handleHi(Number(event.target.value))}
          />
        </label>
      </div>
    </div>
  );
}
