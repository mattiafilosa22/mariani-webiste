import { getTranslations } from "next-intl/server";
import type { SiteSettings } from "@/domain";

type ContactInfoProps = {
  settings: SiteSettings;
  title: string;
};

const pinIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const phoneIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const mailIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 6 10-6" />
  </svg>
);

/**
 * Riquadro contatti sede (RSC). Indirizzo, telefono ed email dalle
 * impostazioni globali; telefono ed email sono link operativi (tel:/mailto:).
 */
export async function ContactInfo({ settings, title }: ContactInfoProps) {
  const t = await getTranslations("Pages.contact");
  const phoneHref = `tel:${settings.telefono.replace(/\s/g, "")}`;

  return (
    <div className="contact-box">
      <h3>{title}</h3>
      <ul className="contact-list">
        <li className="contact-item">
          {pinIcon}
          <span>
            <span className="contact-item__lbl">{t("indirizzo")}</span>
            <span className="contact-item__val">{settings.indirizzo}</span>
          </span>
        </li>
        <li className="contact-item">
          {phoneIcon}
          <span>
            <span className="contact-item__lbl">{t("telefono")}</span>
            <a className="contact-item__val" href={phoneHref}>
              {settings.telefono}
            </a>
          </span>
        </li>
        <li className="contact-item">
          {mailIcon}
          <span>
            <span className="contact-item__lbl">{t("email")}</span>
            <a className="contact-item__val" href={`mailto:${settings.email}`}>
              {settings.email}
            </a>
          </span>
        </li>
      </ul>
    </div>
  );
}
