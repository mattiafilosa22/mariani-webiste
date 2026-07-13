import type { Colore } from "@/domain";

/**
 * Swatch dei colori canonici. La label localizzata vive in i18n (`Spec.color.*`);
 * qui solo la resa cromatica, così il componente resta dichiarativo.
 * `border` segnala i colori chiari che richiedono un contorno sul fondo scuro.
 */
export const COLORE_SWATCH: Record<Colore, { hex: string; border: boolean }> = {
  bianco: { hex: "#ffffff", border: true },
  nero: { hex: "#16191f", border: false },
  grigio: { hex: "#8a8f99", border: false },
  argento: { hex: "#c7ccd4", border: true },
  blu: { hex: "#003399", border: false },
  rosso: { hex: "#c8102e", border: false },
  verde: { hex: "#1f7a4d", border: false },
};
