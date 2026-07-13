import { describe, expect, it } from "vitest";
import type { AutoSummary } from "@/domain";
import { selectSimilar } from "./similar";
import { computeCountdown, formatCountdown } from "./countdown";
import {
  buildVehicleTitle,
  buildWhatsappText,
  fillTemplate,
  messengerHandle,
  messengerHref,
  toWaNumber,
  whatsappHref,
} from "./messages";
import { buildSpecTabs, isConsumoKey, partitionSpecifiche } from "./specTabs";

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

describe("selectSimilar", () => {
  const current = summary({ slug: "current", categoria: "auto", tipo: "usata", marca: "Ford" });

  it("excludes the current vehicle", () => {
    const result = selectSimilar([current, summary({ slug: "a" })], current);
    expect(result.map((a) => a.slug)).not.toContain("current");
  });

  it("ranks same categoria+tipo above brand-only matches", () => {
    const catType = summary({ slug: "cattype", categoria: "auto", tipo: "usata", marca: "Kia" });
    const brandOnly = summary({ slug: "brand", categoria: "commerciale", tipo: "nuova", marca: "Ford" });
    const result = selectSimilar([brandOnly, catType], current, 2);
    expect(result[0].slug).toBe("cattype");
  });

  it("drops vehicles with no affinity at all", () => {
    const unrelated = summary({ slug: "u", categoria: "commerciale", tipo: "nuova", marca: "Kia" });
    expect(selectSimilar([unrelated], current)).toHaveLength(0);
  });

  it("caps the result at the given limit", () => {
    const autos = Array.from({ length: 6 }, (_, i) =>
      summary({ slug: `s${i}`, marca: "Ford" })
    );
    expect(selectSimilar(autos, current, 3)).toHaveLength(3);
  });
});

describe("computeCountdown", () => {
  const now = new Date("2026-07-13T00:00:00Z");

  it("returns null for an invalid date", () => {
    expect(computeCountdown("not-a-date", now)).toBeNull();
  });

  it("flags an elapsed deadline as expired", () => {
    const cd = computeCountdown("2026-07-12T00:00:00Z", now);
    expect(cd?.expired).toBe(true);
  });

  it("breaks the remaining time into days/hours/minutes", () => {
    const cd = computeCountdown("2026-07-17T12:38:00Z", now);
    expect(cd).toEqual({
      expired: false,
      days: 4,
      hours: 12,
      minutes: 38,
      totalMs: cd?.totalMs,
    });
  });
});

describe("formatCountdown", () => {
  it("zero-pads and appends localized units", () => {
    const cd = { expired: false, days: 4, hours: 12, minutes: 38, totalMs: 1 };
    expect(formatCountdown(cd, { days: "g", hours: "h", minutes: "m" })).toBe(
      "04g 12h 38m"
    );
  });
});

describe("message helpers", () => {
  it("builds a vehicle title skipping empty parts", () => {
    expect(
      buildVehicleTitle({ marca: "Ford", modello: "Puma", versione: "" })
    ).toBe("Ford Puma");
    expect(
      buildVehicleTitle({ marca: "Ford", modello: "Puma", versione: "Titanium" })
    ).toBe("Ford Puma Titanium");
  });

  it("fills template placeholders", () => {
    expect(
      fillTemplate("Preventivo per {vehicle} rif. {slug}.", {
        vehicle: "Ford Puma",
        slug: "ford-puma",
      })
    ).toBe("Preventivo per Ford Puma rif. ford-puma.");
  });

  it("normalizes phone numbers to digits only", () => {
    expect(toWaNumber("0565 276520")).toBe("0565276520");
    expect(toWaNumber("+39 0565-276520")).toBe("390565276520");
  });

  it("builds an encoded WhatsApp href", () => {
    const text = buildWhatsappText(
      "Ciao! Sono interessato a questa auto: ",
      "Ford Puma Titanium",
      "https://www.marianiford.it/it/auto/ford-puma/"
    );
    const href = whatsappHref("390565276520", text);
    expect(href).toContain("https://wa.me/390565276520?text=");
    expect(decodeURIComponent(href.split("text=")[1])).toBe(text);
    expect(href).not.toContain(" ");
  });

  it("derives a messenger handle from a facebook url", () => {
    expect(messengerHandle("https://www.facebook.com/marianiford")).toBe(
      "marianiford"
    );
    expect(messengerHandle("#")).toBeNull();
    expect(messengerHandle(undefined)).toBeNull();
    expect(messengerHref("marianiford")).toBe("https://m.me/marianiford");
  });
});

describe("spec tabs", () => {
  it("classifies consumption/emission keys", () => {
    expect(isConsumoKey("Consumo WLTP")).toBe(true);
    expect(isConsumoKey("Emissioni CO₂")).toBe(true);
    expect(isConsumoKey("Potenza")).toBe(false);
  });

  it("partitions specifiche preserving order", () => {
    const { tecniche, consumi } = partitionSpecifiche({
      Potenza: "136 CV",
      "Consumo WLTP": "6.9 l/100km",
      Cambio: "manuale",
      "Emissioni CO₂": "181 g/km",
    });
    expect(tecniche.map((r) => r.label)).toEqual(["Potenza", "Cambio"]);
    expect(consumi.map((r) => r.label)).toEqual(["Consumo WLTP", "Emissioni CO₂"]);
  });

  it("includes only tabs with content", () => {
    const tabs = buildSpecTabs(
      {
        datiRows: [{ label: "Marca", value: "Ford" }],
        specifiche: { Potenza: "136 CV" },
        dotazioni: [],
        optional: ["Navigatore"],
      },
      {
        dati: "Dati",
        tecniche: "Tecniche",
        consumi: "Consumi",
        dotazioni: "Dotazioni",
        optional: "Optional",
        optionalNote: "nota",
      }
    );
    expect(tabs.map((t) => t.id)).toEqual(["dati", "tecniche", "optional"]);
  });
});
