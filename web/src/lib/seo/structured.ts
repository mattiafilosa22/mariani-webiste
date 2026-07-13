import type {
  Alimentazione,
  Auto,
  Cambio,
  SiteSettings,
} from "@/domain";
import type { JsonInput, JsonObject } from "./jsonLd";
import { schemaNode } from "./jsonLd";

/**
 * Builder dei nodi schema.org a partire dai DATI REALI (settings/auto).
 * Nessun campo inventato: ciò che manca viene omesso (grazie a `pruneJson`).
 */

/** Alimentazione dominio → enumerazione fuelType schema.org. */
const FUEL_TYPE: Record<Alimentazione, string> = {
  benzina: "Gasoline",
  diesel: "Diesel",
  ibrido: "Hybrid",
  elettrico: "Electric",
  gpl: "LPG",
  metano: "Natural Gas",
};

/** Cambio dominio → vehicleTransmission schema.org. */
const TRANSMISSION: Record<Cambio, string> = {
  manuale: "Manual",
  automatico: "Automatic",
};

/** Giorni IT (abbreviati) → DayOfWeek schema.org. */
const DAY_MAP: Record<string, string> = {
  lun: "Monday",
  mar: "Tuesday",
  mer: "Wednesday",
  gio: "Thursday",
  ven: "Friday",
  sab: "Saturday",
  dom: "Sunday",
};
const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export type ParsedAddress = {
  streetAddress?: string;
  postalCode?: string;
  addressLocality?: string;
  addressRegion?: string;
  addressCountry: string;
};

/**
 * Estrae i componenti dell'indirizzo dalla stringa unica dei settings
 * (es. "Via Adige 3, 57025 Piombino (LI)"). Ogni componente non ricavabile
 * viene omesso; il paese IT è l'unico valore costante ragionevole.
 */
export function parseAddress(indirizzo: string): ParsedAddress {
  const postalCode = indirizzo.match(/\b(\d{5})\b/)?.[1];
  const addressRegion = indirizzo.match(/\(([A-Za-z]{2})\)/)?.[1]?.toUpperCase();
  const streetAddress = indirizzo.split(",")[0]?.trim() || undefined;

  let addressLocality: string | undefined;
  if (postalCode) {
    const afterCap = indirizzo.slice(
      indirizzo.indexOf(postalCode) + postalCode.length
    );
    addressLocality = afterCap.replace(/\([^)]*\)/g, "").trim() || undefined;
  }

  return {
    streetAddress,
    postalCode,
    addressLocality,
    addressRegion,
    addressCountry: "IT",
  };
}

function postalAddressNode(indirizzo: string): JsonInput {
  const parsed = parseAddress(indirizzo);
  return {
    "@type": "PostalAddress",
    streetAddress: parsed.streetAddress,
    postalCode: parsed.postalCode,
    addressLocality: parsed.addressLocality,
    addressRegion: parsed.addressRegion,
    addressCountry: parsed.addressCountry,
  };
}

/** "Lun–Ven" / "Sab" → elenco di DayOfWeek schema.org. */
function parseDays(giorni: string): string[] {
  const tokens = giorni
    .toLowerCase()
    .split(/[–\-—]/)
    .map((t) => t.trim().slice(0, 3))
    .map((t) => DAY_MAP[t])
    .filter((d): d is string => Boolean(d));

  if (tokens.length === 0) return [];
  if (tokens.length === 1) return tokens;

  const start = DAY_ORDER.indexOf(tokens[0]);
  const end = DAY_ORDER.indexOf(tokens[tokens.length - 1]);
  if (start === -1 || end === -1 || end < start) return tokens;
  return DAY_ORDER.slice(start, end + 1);
}

/** "08:30–12:30 / 14:30–18:30" → coppie {opens, closes} normalizzate HH:MM. */
function parseShifts(apertura: string): Array<{ opens: string; closes: string }> {
  if (/chius/i.test(apertura)) return [];
  const shifts: Array<{ opens: string; closes: string }> = [];
  for (const chunk of apertura.split("/")) {
    const times = chunk.match(/\d{1,2}[:.]\d{2}/g);
    if (times && times.length >= 2) {
      shifts.push({
        opens: times[0].replace(".", ":"),
        closes: times[1].replace(".", ":"),
      });
    }
  }
  return shifts;
}

/** Costruisce le `OpeningHoursSpecification` dagli orari editabili in WP. */
export function buildOpeningHours(
  orari: SiteSettings["orari"]
): JsonInput[] {
  const specs: JsonInput[] = [];
  for (const { giorni, apertura } of orari) {
    const dayOfWeek = parseDays(giorni);
    const shifts = parseShifts(apertura);
    if (dayOfWeek.length === 0 || shifts.length === 0) continue;
    for (const shift of shifts) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek,
        opens: shift.opens,
        closes: shift.closes,
      });
    }
  }
  return specs;
}

/** Link social validi (esclude segnaposto "#"/vuoti) per `sameAs`. */
export function socialSameAs(settings: SiteSettings): string[] {
  return Object.values(settings.social)
    .filter((url): url is string => typeof url === "string")
    .map((url) => url.trim())
    .filter((url) => url.length > 0 && url !== "#" && /^https?:\/\//.test(url));
}

export type VehicleJsonLdInput = {
  auto: Auto;
  name: string;
  url: string;
  images: string[];
  colorLabel?: string;
  sellerName: string;
};

/** Nodo `Car` (sottotipo di Vehicle) con `offers` in EUR. */
export function buildVehicleJsonLd(input: VehicleJsonLdInput): JsonObject {
  const { auto, name, url, images, colorLabel, sellerName } = input;
  return schemaNode("Car", {
    name,
    url,
    image: images,
    brand: { "@type": "Brand", name: auto.marca },
    model: auto.modello,
    vehicleConfiguration: auto.versione || undefined,
    vehicleModelDate: String(auto.anno),
    productionDate: String(auto.anno),
    bodyType: auto.carrozzeria,
    color: colorLabel,
    fuelType: FUEL_TYPE[auto.alimentazione],
    vehicleTransmission: TRANSMISSION[auto.cambio],
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: auto.km,
      unitCode: "KMT",
    },
    vehicleEngine: {
      "@type": "EngineSpecification",
      enginePower: {
        "@type": "QuantitativeValue",
        value: auto.potenzaCv,
        unitText: "CV",
      },
    },
    offers: {
      "@type": "Offer",
      price: auto.prezzoFinale,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      itemCondition:
        auto.tipo === "usata"
          ? "https://schema.org/UsedCondition"
          : "https://schema.org/NewCondition",
      url,
      priceValidUntil: auto.scadenzaOfferta,
      seller: { "@type": "AutoDealer", name: sellerName },
    },
  });
}

export type DealerJsonLdInput = {
  settings: SiteSettings;
  url: string;
  logoUrl: string;
  /** `LocalBusiness` per la pagina Chi Siamo, `AutoDealer` per la home. */
  type?: "AutoDealer" | "LocalBusiness";
  /** Aggiunge geo/orari/priceRange (scheda "dove siamo"). */
  withPlaceData?: boolean;
  priceRange?: string;
};

/** Nodo `AutoDealer`/`LocalBusiness` dai settings reali. */
export function buildDealerJsonLd(input: DealerJsonLdInput): JsonObject {
  const {
    settings,
    url,
    logoUrl,
    type = "AutoDealer",
    withPlaceData = false,
    priceRange,
  } = input;

  const sameAs = socialSameAs(settings);
  const openingHours = withPlaceData
    ? buildOpeningHours(settings.orari)
    : undefined;
  const geo =
    withPlaceData && settings.mappa
      ? {
          "@type": "GeoCoordinates",
          latitude: settings.mappa.lat,
          longitude: settings.mappa.lng,
        }
      : undefined;

  return schemaNode(type, {
    name: settings.nomeAzienda,
    legalName: settings.ragioneSociale,
    url,
    logo: logoUrl,
    image: logoUrl,
    telephone: settings.telefono,
    email: settings.email,
    vatID: settings.partitaIva,
    address: postalAddressNode(settings.indirizzo),
    geo,
    hasMap: settings.mapsUrl,
    areaServed: withPlaceData ? undefined : "Piombino",
    openingHoursSpecification: openingHours,
    priceRange,
    sameAs,
  });
}

export type Crumb = { name: string; url: string };

/** Nodo `BreadcrumbList` con posizioni 1..n e URL assoluti. */
export function buildBreadcrumbJsonLd(items: Crumb[]): JsonObject {
  return schemaNode("BreadcrumbList", {
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}
