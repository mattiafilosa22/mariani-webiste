import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { CATALOG_SCOPES, CatalogTemplate, catalogMetadata } from "@/features/catalog";

type PageProps = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return catalogMetadata(params, CATALOG_SCOPES.usate);
}

export default function AutoUsatePage({ params }: PageProps) {
  return <CatalogTemplate params={params} scope={CATALOG_SCOPES.usate} />;
}
