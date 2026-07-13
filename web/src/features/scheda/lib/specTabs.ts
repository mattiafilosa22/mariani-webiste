/**
 * Modello dei tab "Specifiche" della scheda: logica pura che partiziona il
 * record `specifiche` (piatto, dal CMS) nelle sezioni della UI e assembla la
 * lista dei tab, includendo solo quelli con contenuto.
 */

export type SpecRow = { label: string; value: string };

export type SpecTab =
  | { kind: "table"; id: string; label: string; rows: SpecRow[] }
  | { kind: "list"; id: string; label: string; items: string[]; note?: string };

/** Chiavi delle specifiche riconducibili a consumi/emissioni (tab WLTP). */
const CONSUMO_PATTERN =
  /consumo|emission|emiss|co₂|co2|wltp|autonomia|classe\s*emiss/i;

export function isConsumoKey(key: string): boolean {
  return CONSUMO_PATTERN.test(key);
}

/** Separa le specifiche tecniche dai consumi/emissioni, preservando l'ordine. */
export function partitionSpecifiche(specifiche: Record<string, string>): {
  tecniche: SpecRow[];
  consumi: SpecRow[];
} {
  const tecniche: SpecRow[] = [];
  const consumi: SpecRow[] = [];
  for (const [label, value] of Object.entries(specifiche)) {
    (isConsumoKey(label) ? consumi : tecniche).push({ label, value });
  }
  return { tecniche, consumi };
}

export type SpecTabLabels = {
  dati: string;
  tecniche: string;
  consumi: string;
  dotazioni: string;
  optional: string;
  optionalNote: string;
};

/**
 * Costruisce i tab a partire dai dati già formattati:
 * - `datiRows`: campi strutturati del veicolo (assemblati con label i18n);
 * - `specifiche`: record piatto dal CMS, partizionato in tecniche/consumi;
 * - `dotazioni` / `optional`: liste testuali.
 * Vengono inclusi solo i tab con almeno una riga/voce.
 */
export function buildSpecTabs(
  input: {
    datiRows: SpecRow[];
    specifiche: Record<string, string>;
    dotazioni: string[];
    optional: string[];
  },
  labels: SpecTabLabels
): SpecTab[] {
  const { tecniche, consumi } = partitionSpecifiche(input.specifiche);
  const tabs: SpecTab[] = [];

  if (input.datiRows.length > 0) {
    tabs.push({ kind: "table", id: "dati", label: labels.dati, rows: input.datiRows });
  }
  if (tecniche.length > 0) {
    tabs.push({ kind: "table", id: "tecniche", label: labels.tecniche, rows: tecniche });
  }
  if (consumi.length > 0) {
    tabs.push({ kind: "table", id: "consumi", label: labels.consumi, rows: consumi });
  }
  if (input.dotazioni.length > 0) {
    tabs.push({
      kind: "list",
      id: "dotazioni",
      label: labels.dotazioni,
      items: input.dotazioni,
    });
  }
  if (input.optional.length > 0) {
    tabs.push({
      kind: "list",
      id: "optional",
      label: labels.optional,
      items: input.optional,
      note: labels.optionalNote,
    });
  }

  return tabs;
}
