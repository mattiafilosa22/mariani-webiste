import { getTranslations } from "next-intl/server";
import type { Auto, Badge, SiteSettings } from "@/domain";
import type { Locale } from "@/i18n/routing";
import {
  formatKmLabel,
  formatPower,
  formatPrice,
  formatPriceOrRequest,
  formatYear,
} from "@/lib/mappers/auto";
import { buildWhatsappText, whatsappHref } from "../lib/messages";
import { Countdown } from "./Countdown";

type BuyBoxProps = {
  auto: Auto;
  locale: Locale;
  settings: SiteSettings;
  vehicleTitle: string;
  pageUrl: string;
};

const localeTag: Record<Locale, string> = { it: "it-IT", en: "en-GB" };

const badgeVariant: Record<Badge, string> = {
  promo: "promo",
  pronta: "pronta",
  ibrido: "ibrido",
  elettrico: "elettrico",
  km0: "km0",
  neopatentati: "neutral",
};

const badgeLabelKey: Record<Badge, string> = {
  promo: "promo",
  pronta: "ready",
  ibrido: "hybrid",
  elettrico: "electric",
  km0: "km0",
  neopatentati: "beginners",
};

/**
 * Box acquisto (sticky): marca/titolo/versione (H1 unico della pagina), badge,
 * box prezzi con eventuale countdown, CTA e dati rapidi. Server Component.
 */
export async function BuyBox({
  auto,
  locale,
  settings,
  vehicleTitle,
  pageUrl,
}: BuyBoxProps) {
  const t = await getTranslations("Scheda");
  const tCard = await getTranslations("CarCard");
  const tSpec = await getTranslations("Spec");
  const tUnit = await getTranslations("Catalog.unit");

  const hasDiscount = auto.prezzoFinale < auto.prezzoListino;
  const discount = auto.prezzoListino - auto.prezzoFinale;

  const staticDate = new Intl.DateTimeFormat(localeTag[locale], {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(auto.scadenzaOfferta ? new Date(auto.scadenzaOfferta) : new Date());

  const waUrl = whatsappHref(
    settings.whatsapp,
    buildWhatsappText(t("float.prefill"), vehicleTitle, pageUrl)
  );

  const nd = tUnit("nd");
  const quick: Array<{ label: string; value: string }> = [
    { label: t("quick.anno"), value: formatYear(auto.anno, nd) },
    { label: t("quick.km"), value: formatKmLabel(auto.km, locale, tUnit("km"), nd) },
    { label: t("quick.alimentazione"), value: tSpec(`fuel.${auto.alimentazione}`) },
    { label: t("quick.cambio"), value: tSpec(`transmission.${auto.cambio}`) },
    { label: t("quick.potenza"), value: formatPower(auto.potenzaCv, tUnit("cv"), nd) },
    { label: t("quick.disponibilita"), value: auto.carrozzeria },
  ];

  return (
    <div className="buybox">
      <div>
        <p className="buybox__brand">{auto.marca}</p>
        <h1 className="buybox__title">
          {auto.marca} {auto.modello}
        </h1>
        {auto.versione ? <p className="buybox__version">{auto.versione}</p> : null}
      </div>

      {auto.badge.length > 0 ? (
        <div className="buybox__badges">
          {auto.badge.map((badge) => (
            <span key={badge} className={`badge badge--${badgeVariant[badge]}`}>
              {tCard(badgeLabelKey[badge])}
            </span>
          ))}
        </div>
      ) : null}

      <div className="pricebox">
        <div className="priceline priceline--list">
          <span className="priceline__lbl">{t("price.listino")}</span>
          <span className="priceline__val">
            {formatPriceOrRequest(auto.prezzoListino, locale, tUnit("priceOnRequest"))}
          </span>
        </div>
        {hasDiscount ? (
          <div className="priceline priceline--disc">
            <span className="priceline__lbl">{t("price.sconto")}</span>
            <span className="priceline__val">−{formatPrice(discount, locale)}</span>
          </div>
        ) : null}

        {auto.scadenzaOfferta ? (
          <Countdown deadlineIso={auto.scadenzaOfferta} staticDate={staticDate} />
        ) : null}

        <hr className="pricebox__sep" />
        <div className="pricebox__final">
          <span className="pricebox__final-lbl">{t("price.finale")}</span>
          <span className="pricebox__final-val">
            {formatPriceOrRequest(auto.prezzoFinale, locale, tUnit("priceOnRequest"))}
          </span>
        </div>
      </div>

      <div className="buybox__cta">
        <a className="btn btn--primary btn--lg btn--block" href="#contatti">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 4h16v12H7l-3 3z" />
            <path d="M8 9h8M8 12h5" />
          </svg>
          {t("cta.quote")}
        </a>
        <div className="buybox__cta-row">
          <a className="btn btn--outline" href={`tel:${settings.telefono.replace(/\s/g, "")}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {t("cta.call")}
          </a>
          <a className="btn btn--wa" href={waUrl} target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.6-1.4-3.7-3.2-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.8-.7 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.3M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2" />
            </svg>
            {t("cta.whatsapp")}
          </a>
        </div>
      </div>

      <dl className="quickspecs">
        {quick.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
