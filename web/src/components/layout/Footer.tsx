import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { SiteSettings } from "@/domain";

type FooterProps = {
  locale: Locale;
  settings: SiteSettings;
};

/**
 * Footer identico su tutte le pagine. Contatti sede, colonne (catalogo,
 * azienda, legali), social e barra legale. I dati provengono da `settings`.
 */
export async function Footer({ locale, settings }: FooterProps) {
  const t = await getTranslations("Footer");
  const tNav = await getTranslations("Nav");
  const base = `/${locale}`;
  const phoneHref = `tel:${settings.telefono.replace(/\s/g, "")}`;
  const year = new Date().getFullYear();

  const catalogo = [
    { label: tNav("autoNuove"), href: `${base}/auto/nuove` },
    { label: tNav("autoUsate"), href: `${base}/auto/usate` },
    { label: tNav("km0"), href: `${base}/auto/km0` },
    { label: tNav("commerciali"), href: `${base}/veicoli-commerciali/nuovi` },
    { label: tNav("noleggioLungo"), href: `${base}/noleggio` },
  ];
  const azienda = [
    { label: tNav("chiSiamo"), href: `${base}/chi-siamo` },
    { label: tNav("doveSiamo"), href: `${base}/chi-siamo` },
    { label: tNav("officina"), href: `${base}/officina` },
    { label: tNav("contatti"), href: `${base}/contatti` },
    { label: tNav("lavoraConNoi"), href: `${base}/chi-siamo` },
  ];
  const legali = [
    { label: t("privacy"), href: `${base}/privacy-policy` },
    { label: t("cookie"), href: `${base}/cookie-policy` },
  ];

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col footer-brand">
          <Link className="brand" href={base}>
            <span className="brand__logo">M</span>
            <span className="brand__txt">
              <span className="brand__name">{settings.nomeAzienda}</span>
              <span className="brand__sub">Ford Blubay · Concessionaria</span>
            </span>
          </Link>
          <div className="footer-contact">
            <span>{settings.indirizzo}</span>
            <a href={phoneHref}>
              {tNav("orariContatti")} · {settings.telefono}
            </a>
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </div>
          <div className="footer-social">
            {settings.social.facebook ? (
              <a href={settings.social.facebook} aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            ) : null}
            {settings.social.instagram ? (
              <a href={settings.social.instagram} aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </a>
            ) : null}
            {settings.social.whatsapp ? (
              <a href={settings.social.whatsapp} aria-label="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.6-1.4-3.7-3.2-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.8-.7 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.3M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2" />
                </svg>
              </a>
            ) : null}
          </div>
        </div>

        <div className="footer-col">
          <h3>{t("catalogo")}</h3>
          <ul>
            {catalogo.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h3>{t("azienda")}</h3>
          <ul>
            {azienda.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h3>{t("legali")}</h3>
          <ul>
            {legali.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>
          © {year} {settings.ragioneSociale} · Concessionaria Ford Blubay ·
          P.IVA {settings.partitaIva}
        </p>
        <div className="footer-bottom__legal">
          <Link href={`${base}/cookie-policy`}>{t("cookiePrefs")}</Link>
        </div>
      </div>
    </footer>
  );
}
