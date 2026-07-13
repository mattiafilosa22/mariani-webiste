export {
  SITE_URL,
  absoluteUrl,
  localePath,
  autoPath,
  localePathsFor,
  OG_LOCALE,
} from "./site";
export {
  buildMetadata,
  buildLanguageAlternates,
  DEFAULT_OG_IMAGE,
  type SeoInput,
  type SeoImage,
} from "./metadata";
export {
  pruneJson,
  schemaNode,
  type JsonValue,
  type JsonObject,
  type JsonInput,
} from "./jsonLd";
export {
  parseAddress,
  buildOpeningHours,
  socialSameAs,
  buildVehicleJsonLd,
  buildDealerJsonLd,
  buildBreadcrumbJsonLd,
  type Crumb,
  type VehicleJsonLdInput,
  type DealerJsonLdInput,
} from "./structured";
export { JsonLd } from "./JsonLdScript";
export { autoPriceRange } from "./price";
export { autoTranslationKey, autoVehicleKey } from "./translation";
