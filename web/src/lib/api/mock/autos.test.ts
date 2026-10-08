import { describe, expect, it } from "vitest";
import { autoSchema } from "@/domain";
import { autoToSummary } from "@/lib/mappers/auto";
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

describe("mockAutos — stock disponibile a Piombino", () => {
  it("ogni auto supera lo schema zod del dominio", () => {
    for (const auto of mockAutos) {
      expect(() => autoSchema.parse(auto)).not.toThrow();
    }
  });

  it("lo stock contiene 14 auto con id univoci", () => {
    expect(mockAutos).toHaveLength(14);
    expect(new Set(mockAutos.map((a) => a.id)).size).toBe(14);
  });

  it("lo stock usato è solo la Ford Kuga di Piombino", () => {
    expect(mockAutos.filter((a) => a.tipo === "usata").map((a) => a.slug)).toEqual([
      "ford-kuga-active-phev",
    ]);
  });

  it.each([
    "ford-focus-grigia-chiaro",
    "ford-focus-grigia-scuro",
    "ford-focus-rossa",
    "ford-kuga-phev",
  ])("%s (segnaposto) non è più in stock", (slug) => {
    expect(mockAutos.some((a) => a.slug === slug)).toBe(false);
  });

  it("la Ford Kuga Active PHEV usata ha i dati dello stock", () => {
    const kuga = bySlug("ford-kuga-active-phev");
    expect(kuga.tipo).toBe("usata");
    expect(kuga.categoria).toBe("auto");
    expect(kuga.marca).toBe("Ford");
    expect(kuga.modello).toBe("Kuga");
    expect(kuga.versione).toBe("Active PHEV");
    expect(kuga.alimentazione).toBe("ibrido");
    expect(kuga.cambio).toBe("automatico");
    expect(kuga.carrozzeria).toBe("SUV");
    expect(kuga.colore).toBe("bianco");
    expect(kuga.anno).toBe(2024);
    expect(kuga.km).toBe(49963);
    expect(kuga.potenzaCv).toBe(242);
    expect(kuga.prezzoListino).toBe(29900);
    expect(kuga.prezzoFinale).toBe(29900);
    expect(kuga.sconto).toBeUndefined();
    expect(kuga.badge).toEqual(["ibrido", "neopatentati"]);
    expect(kuga.inEvidenza).toBe(false);
    expect(kuga.specifiche).toEqual({ Cilindrata: "2500 cm³", "Emissioni CO₂": "22 g/km" });
  });

  it("la Kuga senza foto ha copertina null (segnaposto UI)", () => {
    const kuga = bySlug("ford-kuga-active-phev");
    expect(kuga.galleria).toEqual([]);
    expect(autoToSummary(kuga).copertina).toBeNull();
  });

  it("la Ford Capri Km 0 non è duplicata e ha colore, anno e km", () => {
    const capri = mockAutos.filter((a) => a.modello === "Capri");
    expect(capri).toHaveLength(1);
    expect(capri[0]?.colore).toBe("bianco");
    expect(capri[0]?.anno).toBe(2025);
    expect(capri[0]?.km).toBe(0);
    expect(capri[0]?.potenzaCv).toBe(286);
    expect(capri[0]?.cambio).toBe("automatico");
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

  it("Ranger, Capri e Kuga non inventano cambio, trazione o colore non comunicati", () => {
    const ranger = bySlug("ford-ranger");
    expect(ranger.cambio).toBeNull();
    expect(ranger.trazione).toBeNull();
    expect(ranger.colore).toBeNull();

    expect(bySlug("ford-capri-km0").trazione).toBeNull();
    expect(bySlug("ford-kuga-active-phev").trazione).toBeNull();
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
