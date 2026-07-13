import { describe, expect, it } from "vitest";
import type { AutoSummary } from "@/domain";
import { selectFeatured } from "./featured";
import { formatCountup, parseCountup } from "./countup";

function summary(overrides: Partial<AutoSummary>): AutoSummary {
  return {
    id: "x",
    slug: "x",
    tipo: "usata",
    categoria: "auto",
    marca: "Ford",
    modello: "Focus",
    versione: "",
    anno: 2023,
    km: 0,
    prezzoListino: 20000,
    prezzoFinale: 20000,
    alimentazione: "benzina",
    cambio: "manuale",
    trazione: "anteriore",
    carrozzeria: "Berlina",
    potenzaCv: 125,
    colore: "grigio",
    badge: [],
    inEvidenza: false,
    copertina: { src: "/p.svg", width: 640, height: 360, alt: "auto" },
    ...overrides,
  };
}

describe("selectFeatured", () => {
  it("keeps only cars flagged inEvidenza, preserving order", () => {
    const autos = [
      summary({ id: "1", slug: "a", inEvidenza: true }),
      summary({ id: "2", slug: "b", inEvidenza: false }),
      summary({ id: "3", slug: "c", inEvidenza: true }),
    ];
    expect(selectFeatured(autos).map((a) => a.slug)).toEqual(["a", "c"]);
  });

  it("caps the result at the given limit", () => {
    const autos = Array.from({ length: 12 }, (_, i) =>
      summary({ id: String(i), slug: `s${i}`, inEvidenza: true })
    );
    expect(selectFeatured(autos, 3)).toHaveLength(3);
  });

  it("returns an empty array when nothing is featured", () => {
    expect(selectFeatured([summary({ inEvidenza: false })])).toEqual([]);
  });
});

describe("parseCountup", () => {
  it("parses a plain number with a trailing suffix", () => {
    expect(parseCountup("30+")).toEqual({
      prefix: "",
      suffix: "+",
      target: 30,
      separator: "",
    });
  });

  it("detects the thousands separator (it)", () => {
    expect(parseCountup("10.000+")).toEqual({
      prefix: "",
      suffix: "+",
      target: 10000,
      separator: ".",
    });
  });

  it("detects the thousands separator (en)", () => {
    expect(parseCountup("10,000+")).toEqual({
      prefix: "",
      suffix: "+",
      target: 10000,
      separator: ",",
    });
  });

  it("keeps a textual suffix as-is", () => {
    expect(parseCountup("1 giorno")).toEqual({
      prefix: "",
      suffix: " giorno",
      target: 1,
      separator: "",
    });
  });

  it("handles strings without digits", () => {
    expect(parseCountup("N/D")).toEqual({
      prefix: "N/D",
      suffix: "",
      target: 0,
      separator: "",
    });
  });
});

describe("formatCountup", () => {
  it("re-inserts the detected separator during the animation", () => {
    const parts = parseCountup("10.000+");
    expect(formatCountup(0, parts)).toBe("0+");
    expect(formatCountup(1234, parts)).toBe("1.234+");
    expect(formatCountup(10000, parts)).toBe("10.000+");
  });

  it("round-trips the original display at the target value", () => {
    for (const value of ["30+", "400+", "10.000+", "10,000+", "1 giorno"]) {
      const parts = parseCountup(value);
      expect(formatCountup(parts.target, parts)).toBe(value);
    }
  });
});
