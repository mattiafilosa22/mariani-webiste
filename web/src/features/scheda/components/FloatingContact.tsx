import { getTranslations } from "next-intl/server";
import type { SiteSettings } from "@/domain";
import {
  buildWhatsappText,
  messengerHandle,
  messengerHref,
  whatsappHref,
} from "../lib/messages";

type FloatingContactProps = {
  settings: SiteSettings;
  vehicleTitle: string;
  /** URL assoluto della scheda (per il messaggio WhatsApp). */
  pageUrl: string;
};

/**
 * CTA social flottanti (sempre visibili nella scheda): WhatsApp con messaggio
 * pre-compilato + Messenger. Numeri/pagina dai `settings`. Target ≥44px,
 * `aria-label` espliciti, `rel="noopener"`.
 */
export async function FloatingContact({
  settings,
  vehicleTitle,
  pageUrl,
}: FloatingContactProps) {
  const t = await getTranslations("Scheda.float");

  const waText = buildWhatsappText(t("prefill"), vehicleTitle, pageUrl);
  const waUrl = whatsappHref(settings.whatsapp, waText);
  const handle = messengerHandle(settings.social.facebook);

  return (
    <div className="social-float" role="group" aria-label={t("region")}>
      <a
        className="social-float__btn social-float__btn--wa"
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("whatsapp")}
      >
        <span className="social-tip" aria-hidden="true">
          {t("whatsapp")}
        </span>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.6-1.4-3.7-3.2-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.8-.7 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.3M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2" />
        </svg>
      </a>

      {handle ? (
        <a
          className="social-float__btn social-float__btn--msg"
          href={messengerHref(handle)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("messenger")}
        >
          <span className="social-tip" aria-hidden="true">
            {t("messenger")}
          </span>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.3 2 2 6.2 2 11.7c0 2.9 1.2 5.4 3.1 7.1V22l2.9-1.6c.8.2 1.6.3 2.4.3 5.7 0 10-4.2 10-9.7S17.7 2 12 2zm1 13l-2.5-2.7L5.6 15l5.4-5.7 2.6 2.7L18.3 9 13 15z" />
          </svg>
        </a>
      ) : null}
    </div>
  );
}
