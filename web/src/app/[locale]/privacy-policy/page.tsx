import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { LegalPage, editorialPageMetadata } from "@/features/pages";

type PageProps = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return editorialPageMetadata(locale as Locale, "privacy-policy");
}

export default async function PrivacyPolicyPage({ params }: PageProps) {
  const { locale } = await params;
  return <LegalPage locale={locale as Locale} pageKey="privacy-policy" />;
}
