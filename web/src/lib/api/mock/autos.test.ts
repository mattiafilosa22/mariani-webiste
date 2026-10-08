import { describe, expect, it } from "vitest";
import { autoSchema } from "@/domain";
import { mockAutos } from "./autos";

/**
 * Verifica lo stock demo: coerenza con lo schema zod e dati comunicati dal
 * concessionario (nessun prezzo inventato oltre a quelli forniti).
 */

function bySlug(slug: string) {
  const auto = mockAutos.find((a) => a.slug === slug);
  if (!auto) throw new Error(`Auto mock mancante: ${slug}`);
  return auto;
}

describe("mockAutos — stock nuovo disponibile", () => {
  it("ogni auto supera lo schema zod del dominio", () => {
    for (const auto of mockAutos) {
      expect(() => autoSchema.parse(auto)).not.toThrow();
    }
  });

  it("la Ford Capri Km 0 costa 43.900 €", () => {
    const capri = bySlug("ford-capri-km0");
    expect(capri.tipo).toBe("km0");
    expect(capri.prezzoListino).toBe(43900);
    expect(capri.prezzoFinale).toBe(43900);
  });

  it("il Ford Ranger è un veicolo commerciale diesel", () => {
    const ranger = bySlug("ford-ranger");
    expect(ranger.categoria).toBe("commerciale");
    expect(ranger.alimentazione).toBe("diesel");
  });

  it.each(["omoda-5", "omoda-7", "jaecoo-7", "jaecoo-8", "ford-puma-st-line-x", "ford-explorer"])(
    "%s resta a prezzo su richiesta",
    (slug) => {
      expect(bySlug(slug).prezzoFinale).toBe(0);
    },
  );

  it.each([
    ["omoda-5", "SHS FHEV"],
    ["jaecoo-7", "SHS PHEV"],
    ["omoda-7", "SHS PHEV"],
    ["jaecoo-8", "PHEV"],
    ["ford-puma-st-line-x", "ST-Line X MHEV"],
  ])("%s ha versione %s", (slug, versione) => {
    expect(bySlug(slug).versione).toBe(versione);
  });
});
