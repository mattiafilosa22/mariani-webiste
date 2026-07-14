import { describe, expect, it } from "vitest";
import type { Auto, AutoSummary } from "@/domain";
import { autoToSummary, formatPrice, toCarCardVm } from "./auto";

const baseSummary: AutoSummary = {
  id: "1",
  slug: "ford-puma",
  tipo: "nuova",
  categoria: "auto",
  marca: "Ford",
  modello: "Puma",
  versione: "1.0 EcoBoost Hybrid",
  anno: 2024,
  km: 12400,
  prezzoListino: 28500,
  sconto: 3600,
  prezzoFinale: 24900,
  alimentazione: "ibrido",
  cambio: "automatico",
  trazione: "anteriore",
  carrozzeria: "SUV compatto",
  potenzaCv: 125,
  colore: "blu",
  badge: ["promo", "pronta"],
  inEvidenza: true,
  copertina: { src: "/img/p.svg", width: 640, height: 360, alt: "Ford Puma" },
};

const labels = {
  km: "km",
  alimentazione: "Ibrido",
  cambio: "Automatico",
  priceOnRequest: "Prezzo su richiesta",
  nd: "n.d.",
};

describe("formatPrice", () => {
  it("formats euros without decimals (it-IT)", () => {
    // NBSP tra numero e simbolo: confrontiamo i caratteri significativi
    expect(formatPrice(24900, "it").replace(/\s/g, " ")).toContain("24.900");
    expect(formatPrice(24900, "it")).toContain("€");
  });

  it("uses a locale-specific thousands separator (en-GB)", () => {
    expect(formatPrice(24900, "en")).toContain("24,900");
  });
});

describe("toCarCardVm", () => {
  it("marks a discounted vehicle as promo with old price", () => {
    const vm = toCarCardVm(baseSummary, "it", labels);
    expect(vm.price.isPromo).toBe(true);
    expect(vm.price.old).not.toBeNull();
    expect(vm.brand).toBe("Ford");
    expect(vm.specs).toHaveLength(4);
    expect(vm.specs[0]).toBe("2024");
    expect(vm.specs[1]).toContain("12.400");
    expect(vm.badges.map((b) => b.variant)).toEqual(["promo", "pronta"]);
  });

  it("has no old price when there is no discount", () => {
    const noDiscount: AutoSummary = {
      ...baseSummary,
      sconto: undefined,
      prezzoListino: 19900,
      prezzoFinale: 19900,
      badge: [],
    };
    const vm = toCarCardVm(noDiscount, "it", labels);
    expect(vm.price.isPromo).toBe(false);
    expect(vm.price.old).toBeNull();
    expect(vm.badges).toHaveLength(0);
  });

  it("renders graceful placeholders when km/anno/prezzo are undefined (0)", () => {
    const undefinedData: AutoSummary = {
      ...baseSummary,
      anno: 0,
      km: 0,
      prezzoListino: 0,
      sconto: undefined,
      prezzoFinale: 0,
      badge: [],
    };
    const vm = toCarCardVm(undefinedData, "it", labels);
    expect(vm.specs[0]).toBe("n.d.");
    expect(vm.specs[1]).toBe("n.d.");
    expect(vm.price.now).toBe("Prezzo su richiesta");
    expect(vm.price.old).toBeNull();
    expect(vm.price.isPromo).toBe(false);
  });
});

describe("autoToSummary", () => {
  it("derives the summary using the first gallery image as cover", () => {
    const auto: Auto = {
      ...baseSummary,
      trazione: "anteriore",
      carrozzeria: "SUV compatto",
      galleria: [
        { src: "/img/a.svg", width: 640, height: 360, alt: "cover" },
        { src: "/img/b.svg", width: 640, height: 360, alt: "second" },
      ],
      dotazioni: [],
      optional: [],
      specifiche: {},
    };
    const summary = autoToSummary(auto);
    expect(summary.copertina.alt).toBe("cover");
    expect(summary.slug).toBe("ford-puma");
  });
});
