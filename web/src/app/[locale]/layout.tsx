import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Archivo, Inter, Montserrat } from "next/font/google";
import { routing, type Locale } from "@/i18n/routing";
import { getSettings } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeScript } from "@/components/layout/ThemeScript";

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/** Pre-genera le due locali per lo static export. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "SEO" });
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("siteName"),
      template: `%s — ${t("siteName")}`,
    },
    description: t("defaultDescription"),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Abilita il rendering statico dei componenti next-intl.
  setRequestLocale(locale);

  const settings = await getSettings({ locale });
  const t = await getTranslations("Common");
  const fontVars = `${archivo.variable} ${inter.variable} ${montserrat.variable}`;

  return (
    <html lang={locale} className={fontVars}>
      <head>
        <ThemeScript />
      </head>
      <body>
        <NextIntlClientProvider>
          <a className="skip-link" href="#main">
            {t("skipToContent")}
          </a>
          <Header locale={locale} settings={settings} />
          <main id="main">{children}</main>
          <Footer locale={locale} settings={settings} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
