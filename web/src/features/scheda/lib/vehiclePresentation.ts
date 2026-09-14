import type { AutoTipo } from "@/domain";

/** Registration year and mileage are meaningful only for already registered cars. */
export function shouldShowRegistrationData(tipo: AutoTipo): boolean {
  return tipo !== "nuova";
}
