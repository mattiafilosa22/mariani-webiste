/**
 * Countdown offerta: logica pura, indipendente dal tempo reale (accetta `now`),
 * così è testabile e riusabile lato server (data statica) e client (live).
 */

export type Countdown = {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  totalMs: number;
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Calcola il tempo residuo fino a `deadlineIso`.
 * Restituisce `null` se la data non è valida; `expired: true` se già passata.
 */
export function computeCountdown(deadlineIso: string, now: Date): Countdown | null {
  const end = new Date(deadlineIso).getTime();
  if (Number.isNaN(end)) return null;

  const diff = end - now.getTime();
  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, totalMs: 0 };
  }

  return {
    expired: false,
    days: Math.floor(diff / DAY),
    hours: Math.floor((diff % DAY) / HOUR),
    minutes: Math.floor((diff % HOUR) / MINUTE),
    totalMs: diff,
  };
}

export type CountdownUnits = { days: string; hours: string; minutes: string };

/** Formatta il residuo come "04g 12h 38m" con le unità localizzate. */
export function formatCountdown(cd: Countdown, units: CountdownUnits): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(cd.days)}${units.days} ${pad(cd.hours)}${units.hours} ${pad(
    cd.minutes
  )}${units.minutes}`;
}
