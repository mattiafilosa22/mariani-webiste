import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { SiteSettings } from "@/domain";
import { MainNav } from "./MainNav";

type HeaderProps = {
  locale: Locale;
  settings: SiteSettings;
};

/**
 * Header sticky "glass" identico su tutte le pagine: topbar contatti,
 * brand, nav principale, toggle tema, switch lingua e drawer mobile.
 * I contatti provengono da `settings` (WordPress), non sono hardcoded.
 */
export async function Header({ locale, settings }: HeaderProps) {
  const t = await getTranslations("Topbar");
  const phoneHref = `tel:${settings.telefono.replace(/\s/g, "")}`;
  const waHref = `https://wa.me/${settings.whatsapp}`;

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar__inner">
          <div className="topbar__contacts">
            <a href={phoneHref}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span className="lbl">{t("phoneLabel")}</span>&nbsp;
              <strong>{settings.telefono}</strong>
            </a>
          </div>
          <a className="topbar__wa" href={waHref}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.6-1.4-3.7-3.2-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.8-.7 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.3M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2" />
            </svg>
            &nbsp;<strong>{t("whatsapp")}</strong>
          </a>
        </div>
      </div>
      <div className="mainnav">
        <div className="container mainnav__inner">
          <Link
            className="brand"
            href={`/${locale}`}
            aria-label={`${settings.nomeAzienda} — Home`}
          >
            <span className="brand__logo">M</span>
            <span className="brand__txt">
              <span className="brand__name">{settings.nomeAzienda}</span>
              <span className="brand__sub">Ford Blubay · Concessionaria</span>
            </span>
          </Link>
          <MainNav />
        </div>
      </div>
    </header>
  );
}
