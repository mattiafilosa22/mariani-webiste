"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";

/**
 * Switch lingua IT/EN.
 *
 * Per la maggior parte delle pagine il path si mantiene sostituendo il solo
 * segmento di locale iniziale. Ma le schede auto hanno slug TRADOTTI (Polylang:
 * `ford-puma-st-x` ⇄ `ford-puma-st-x-2`), quindi lo swap ingenuo produce un 404.
 * La coppia corretta è già nota al server, che la pubblica come
 * `<link rel="alternate" hreflang="…">` nell'`<head>`: la leggiamo dal DOM (fonte
 * di verità) via `useSyncExternalStore`, con lo swap del segmento come fallback.
 */

/** Legge gli alternate hreflang dall'`<head>` come stringa stabile "it=/…|en=/…". */
function readAlternates(): string {
  if (typeof document === "undefined") return "";
  const pairs: string[] = [];
  document
    .querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')
    .forEach((link) => {
      const lang = link.getAttribute("hreflang");
      if (!lang || !routing.locales.includes(lang as Locale)) return;
      try {
        pairs.push(`${lang}=${new URL(link.href).pathname}`);
      } catch {
        /* href non valido: ignora, resta il fallback */
      }
    });
  return pairs.sort().join("|");
}

function parseAlternates(serialized: string): Partial<Record<Locale, string>> {
  const map: Partial<Record<Locale, string>> = {};
  if (!serialized) return map;
  for (const pair of serialized.split("|")) {
    const [lang, path] = pair.split("=");
    if (lang && path) map[lang as Locale] = path;
  }
  return map;
}

// Store esterno = il DOM. Nessun evento da sottoscrivere: gli alternate cambiano
// solo alla navigazione, che ri-renderizza il componente (via usePathname) e fa
// rileggere lo snapshot.
const noopSubscribe = () => () => {};
const serverSnapshot = () => "";

export function LocaleSwitcher() {
  const t = useTranslations("LangSwitch");
  const active = useLocale();
  const pathname = usePathname();
  const serialized = useSyncExternalStore(
    noopSubscribe,
    readAlternates,
    serverSnapshot
  );
  const alternates = parseAlternates(serialized);

  function hrefFor(locale: Locale): string {
    // Locale corrente: il path esatto è sempre quello attuale, noto anche in SSR.
    if (locale === active) return pathname;

    // Fonte di verità: l'alternate hreflang esatto pubblicato dal server nell'
    // `<head>`, letto dopo l'idratazione (gestisce lo slug TRADOTTO delle schede).
    const fromHead = alternates[locale];
    if (fromHead) return fromHead;

    // Fallback pre-idratazione (SSR, `<head>` non ancora leggibile).
    const segments = pathname.split("/");
    // segments[0] è "" (path assoluto), segments[1] è la locale corrente.
    if (segments.length > 1) {
      // Scheda auto (`/{locale}/auto/{slug}/`): lo slug è tradotto tra locali
      // (Polylang, es. `-2` in EN) e qui non è noto. Lo swap ingenuo del solo
      // segmento locale produrrebbe uno slug INESISTENTE nell'altra lingua: in
      // export statico quel path non è generato → 404 / "missing param in
      // generateStaticParams". Puntiamo quindi al catalogo localizzato, link
      // sempre valido; dopo l'idratazione l'hreflang porta alla scheda esatta.
      if (segments[2] === "auto" && Boolean(segments[3])) {
        return `/${locale}/auto/`;
      }
      // Le altre route condividono gli stessi segmenti in entrambe le lingue:
      // lo swap del solo locale è corretto.
      segments[1] = locale;
      return segments.join("/") || `/${locale}`;
    }
    return `/${locale}`;
  }

  return (
    <div className="lang-switch" role="group" aria-label={t("label")}>
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={hrefFor(locale)}
          hrefLang={locale}
          // Niente prefetch: prima dell'idratazione lo slug tradotto non è ancora
          // risolto e prefetcharlo (URL swappato) darebbe un 404.
          prefetch={false}
          aria-current={locale === active ? "true" : undefined}
        >
          {t(locale)}
        </Link>
      ))}
    </div>
  );
}
