import { describe, expect, it } from "vitest";
import type { Auto, SiteSettings } from "@/domain";
import { pruneJson } from "./jsonLd";
import { buildMetadata } from "./metadata";
import { buildLanguageAlternates } from "./metadata";
import { localePathsFor, autoPath, absoluteUrl } from "./site";
import { autoTranslationKey, autoVehicleKey } from "./translation";
import {
  parseAddress,
  buildOpeningHours,
  socialSameAs,
  buildVehicleJsonLd,
  buildDealerJsonLd,
  buildBreadcrumbJsonLd,
} from "./structured";

const auto: Auto = {
  id: "1",
  slug: "ford-puma-ecoboost-hybrid-titanium",
  tipo: "usata",
  categoria: "auto",
  marca: "Ford",
  modello: "Puma",
  versione: "1.0 EcoBoost Hybrid Titanium",
  anno: 2024,
  km: 15000,
  prezzoListino: 28500,
  sconto: 3600,
  prezzoFinale: 24900,
  alimentazione: "ibrido",
  cambio: "automatico",
  trazione: "anteriore",
  carrozzeria: "SUV compatto",
  potenzaCv: 125,
  colore: "blu",
  badge: ["promo"],
  inEvidenza: true,
  scadenzaOfferta: "2026-08-31",
  traduzioni: {
    it: "ford-puma-ecoboost-hybrid-titanium",
    en: "ford-puma-ecoboost-hybrid-titanium-2",
  },
  galleria: [{ src: "/img/puma.jpg", width: 1200, height: 630, alt: "Puma" }],
  dotazioni: [],
  optional: [],
  specifiche: {},
};

const settings: SiteSettings = {
  nomeAzienda: "Mariani",
  ragioneSociale: "Mariani S.r.l.",
  partitaIva: "01234567890",
  indirizzo: "Via Adige 3, 57025 Piombino (LI)",
  telefono: "0565 276520",
  telefonoAssistenza: "0565 276520",
  whatsapp: "390565276520",
  email: "info@marianiford.it",
  mapsUrl: "https://maps.example/x",
  mappa: { lat: 42.925, lng: 10.5236 },
  orari: [
    { giorni: "Lun–Ven", apertura: "08:30–12:30 / 14:30–18:30" },
    { giorni: "Sab–Dom", apertura: "Chiuso" },
  ],
  orariOfficina: [],
  social: {
    facebook: "#",
    instagram: "https://instagram.com/marianiford",
    whatsapp: "https://wa.me/390565276520",
  },
};

/** Serializza e riparsa per garantire JSON-LD valido e privo di `undefined`. */
function roundtrip(node: unknown): Record<string, unknown> {
  const json = JSON.stringify(node);
  expect(json).not.toContain("undefined");
  return JSON.parse(json) as Record<string, unknown>;
}

describe("absoluteUrl", () => {
  it("prefissa i path relativi con la base del sito", () => {
    expect(absoluteUrl("/it/auto/")).toBe(
      "https://www.marianiford.it/it/auto/"
    );
    expect(absoluteUrl("og.png")).toBe("https://www.marianiford.it/og.png");
  });

  it("lascia invariati gli URL già assoluti (immagini CMS)", () => {
    const cms = "http://cms.example/wp-content/uploads/foto.jpg";
    expect(absoluteUrl(cms)).toBe(cms);
    expect(absoluteUrl("https://x.test/a.png")).toBe("https://x.test/a.png");
  });
});

describe("pruneJson", () => {
  it("rimuove undefined, null, stringhe/array/oggetti vuoti", () => {
    const cleaned = pruneJson({
      a: "ok",
      b: undefined,
      c: null,
      d: "",
      e: [],
      f: {},
      g: { h: undefined, i: 1 },
      j: [undefined, "x", ""],
    });
    expect(cleaned).toEqual({ a: "ok", g: { i: 1 }, j: ["x"] });
  });

  it("collassa a undefined un oggetto interamente vuoto", () => {
    expect(pruneJson({ a: undefined, b: "" })).toBeUndefined();
  });
});

describe("parseAddress", () => {
  it("estrae via, CAP, città e provincia", () => {
    expect(parseAddress("Via Adige 3, 57025 Piombino (LI)")).toEqual({
      streetAddress: "Via Adige 3",
      postalCode: "57025",
      addressLocality: "Piombino",
      addressRegion: "LI",
      addressCountry: "IT",
    });
  });
});

describe("buildOpeningHours", () => {
  it("espande i range di giorni e i due turni; salta i chiusi", () => {
    const specs = buildOpeningHours(settings.orari);
    expect(specs).toHaveLength(2);
    expect(specs[0]).toMatchObject({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:30",
      closes: "12:30",
    });
    expect(specs[1]).toMatchObject({ opens: "14:30", closes: "18:30" });
  });
});

describe("socialSameAs", () => {
  it("tiene solo gli URL http validi, scarta i segnaposto #", () => {
    expect(socialSameAs(settings)).toEqual([
      "https://instagram.com/marianiford",
      "https://wa.me/390565276520",
    ]);
  });
});

describe("buildVehicleJsonLd", () => {
  const node = buildVehicleJsonLd({
    auto,
    name: "Ford Puma 1.0 EcoBoost Hybrid Titanium",
    url: absoluteUrl(autoPath("it", auto.slug)),
    images: [absoluteUrl(auto.galleria[0].src)],
    colorLabel: "Blu",
    sellerName: "Mariani",
  });
  const json = roundtrip(node);

  it("è un Car schema.org valido", () => {
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("Car");
    expect(json.vehicleModelDate).toBe("2024");
    expect(json.fuelType).toBe("Hybrid");
    expect(json.vehicleTransmission).toBe("Automatic");
    expect(json.color).toBe("Blu");
  });

  it("mappa km e offerta in EUR", () => {
    expect(json.mileageFromOdometer).toMatchObject({
      value: 15000,
      unitCode: "KMT",
    });
    expect(json.offers).toMatchObject({
      "@type": "Offer",
      price: 24900,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
    });
  });

  it("omette i campi assenti senza serializzare undefined", () => {
    const bare = buildVehicleJsonLd({
      auto: { ...auto, versione: "", scadenzaOfferta: undefined },
      name: "Ford Puma",
      url: "https://x/y/",
      images: [],
      sellerName: "Mariani",
    });
    const parsed = roundtrip(bare);
    expect(parsed).not.toHaveProperty("vehicleConfiguration");
    expect(parsed).not.toHaveProperty("image");
    expect(parsed).not.toHaveProperty("color");
    const offer = parsed.offers as Record<string, unknown>;
    expect(offer).not.toHaveProperty("priceValidUntil");
  });
});

describe("buildDealerJsonLd", () => {
  it("home: AutoDealer con sameAs e areaServed", () => {
    const node = buildDealerJsonLd({
      settings,
      url: absoluteUrl("/it/"),
      logoUrl: absoluteUrl("/logo-mariani.png"),
    });
    const json = roundtrip(node);
    expect(json["@type"]).toBe("AutoDealer");
    expect(json.areaServed).toBe("Piombino");
    expect(json.telephone).toBe("0565 276520");
    expect(json.sameAs).toEqual([
      "https://instagram.com/marianiford",
      "https://wa.me/390565276520",
    ]);
    expect(json).not.toHaveProperty("geo");
  });

  it("chi-siamo: LocalBusiness con geo, orari e priceRange", () => {
    const node = buildDealerJsonLd({
      settings,
      url: absoluteUrl("/it/chi-siamo/"),
      logoUrl: absoluteUrl("/logo-mariani.png"),
      type: "LocalBusiness",
      withPlaceData: true,
      priceRange: "€ 13.500–€ 41.500",
    });
    const json = roundtrip(node);
    expect(json["@type"]).toBe("LocalBusiness");
    expect(json.geo).toMatchObject({
      "@type": "GeoCoordinates",
      latitude: 42.925,
      longitude: 10.5236,
    });
    expect(json.priceRange).toBe("€ 13.500–€ 41.500");
    expect(Array.isArray(json.openingHoursSpecification)).toBe(true);
    const address = json.address as Record<string, unknown>;
    expect(address.addressLocality).toBe("Piombino");
  });
});

describe("buildBreadcrumbJsonLd", () => {
  it("numera le posizioni da 1 con item assoluti", () => {
    const json = roundtrip(
      buildBreadcrumbJsonLd([
        { name: "Home", url: absoluteUrl("/it/") },
        { name: "Auto", url: absoluteUrl("/it/auto/") },
      ])
    );
    expect(json["@type"]).toBe("BreadcrumbList");
    const list = json.itemListElement as Array<Record<string, unknown>>;
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({ position: 1, name: "Home" });
    expect(list[1]).toMatchObject({ position: 2 });
  });
});

describe("autoTranslationKey", () => {
  it("è indipendente dalla lingua: stesso veicolo → stessa chiave", () => {
    const it = autoTranslationKey(auto);
    // stesso veicolo in altra lingua: id/slug differiscono (Polylang), il resto no.
    const translated = { ...auto, id: "99", slug: "different-slug" };
    const en = autoTranslationKey(translated);
    expect(it).toBe(en);
  });

  it("distingue veicoli diversi", () => {
    expect(autoTranslationKey(auto)).not.toBe(
      autoTranslationKey({ ...auto, anno: 2020 })
    );
  });
});

describe("autoVehicleKey", () => {
  it("usa il legame Polylang esatto: stessa mappa traduzioni → stessa chiave", () => {
    // Le due schede tradotte condividono la stessa mappa `traduzioni` ma hanno
    // slug/prezzo/km differenti: l'euristica sbaglierebbe, il legame esatto no.
    const en = {
      ...auto,
      id: "99",
      slug: "ford-puma-ecoboost-hybrid-titanium-2",
      km: 0,
      prezzoFinale: 25900,
    };
    expect(autoVehicleKey(auto)).toBe(autoVehicleKey(en));
  });

  it("ricade sull'euristica quando `traduzioni` è assente", () => {
    const { traduzioni: _omit, ...bare } = auto;
    void _omit;
    expect(autoVehicleKey(bare)).toBe(autoTranslationKey(bare));
  });
});

describe("buildMetadata / alternates", () => {
  it("produce canonical assoluto e hreflang reciproci con x-default", () => {
    const paths = localePathsFor("auto");
    const languages = buildLanguageAlternates(paths);
    expect(languages).toEqual({
      it: "https://www.marianiford.it/it/auto/",
      en: "https://www.marianiford.it/en/auto/",
      "x-default": "https://www.marianiford.it/it/auto/",
    });
  });

  it("omette la lingua senza controparte invece di puntare a un URL errato", () => {
    const languages = buildLanguageAlternates({ en: "/en/auto/x/" });
    expect(languages).toEqual({
      en: "https://www.marianiford.it/en/auto/x/",
      "x-default": "https://www.marianiford.it/en/auto/x/",
    });
    expect(languages).not.toHaveProperty("it");
  });

  it("compone title, canonical, OG e Twitter", () => {
    const meta = buildMetadata({
      locale: "it",
      paths: localePathsFor("auto"),
      siteName: "Mariani Concessionaria Ford",
      heading: "Auto usate",
      description: "Catalogo auto usate.",
    });
    expect(meta.title).toEqual({
      absolute: "Auto usate — Mariani Concessionaria Ford",
    });
    expect(meta.alternates?.canonical).toBe(
      "https://www.marianiford.it/it/auto/"
    );
    expect(meta.openGraph?.url).toBe("https://www.marianiford.it/it/auto/");
    expect(meta.twitter && "card" in meta.twitter && meta.twitter.card).toBe(
      "summary_large_image"
    );
  });
});
