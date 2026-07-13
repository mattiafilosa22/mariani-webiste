import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/routing";
import { getPage } from "@/lib/api";
import { Breadcrumb, type Crumb } from "./Breadcrumb";
import { PageHero } from "./PageHero";
import { RichText } from "./RichText";

type LegalPageProps = {
  locale: Locale;
  pageKey: "privacy-policy" | "cookie-policy";
};

/**
 * Guscio condiviso delle pagine legali (Privacy/Cookie). Rende titolo e corpo
 * HTML sanificato dal CMS; l'ultima data di aggiornamento è opzionale.
 */
export async function LegalPage({ locale, pageKey }: LegalPageProps) {
  setRequestLocale(locale);

  const page = await getPage({ locale, key: pageKey });
  if (!page?.legal) notFound();

  const { legal } = page;
  const t = await getTranslations("Pages");
  const tNav = await getTranslations("Nav");
  const tCommon = await getTranslations("Common");

  const crumbs: Crumb[] = [
    { label: tCommon("home"), href: `/${locale}` },
    { label: page.title },
  ];

  return (
    <>
      <Breadcrumb items={crumbs} ariaLabel={tNav("ariaLabel")} />
      <PageHero hero={{ title: page.title, subtitle: t("legal.intro") }} />
      <section className="section" aria-label={page.title}>
        <div className="container">
          <article className="legal-article">
            {legal.updatedAt ? (
              <p className="legal-updated">
                {t("legal.updated", { date: legal.updatedAt })}
              </p>
            ) : null}
            <RichText html={legal.body} />
          </article>
        </div>
      </section>
    </>
  );
}
