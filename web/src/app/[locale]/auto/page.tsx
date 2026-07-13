import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { CATALOG_SCOPES, CatalogTemplate, catalogMetadata } from "@/features/catalog";

type PageProps = { params: Promise<{ locale: string }> };

/** Locali pre-generati per lo static export (`output: 'export'`). */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return catalogMetadata(params, CATALOG_SCOPES.auto);
}

/** Catalogo completo (categoria auto): legge gli alias della ricerca rapida. */
export default function AutoCatalogPage({ params }: PageProps) {
  return <CatalogTemplate params={params} scope={CATALOG_SCOPES.auto} />;
}
