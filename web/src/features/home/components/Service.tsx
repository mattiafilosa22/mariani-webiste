import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { HomeService } from "@/domain";
import type { Locale } from "@/i18n/routing";
import { Reveal } from "./Reveal";

type ServiceProps = {
  service: HomeService;
  locale: Locale;
};

/**
 * Sezione Officina/Assistenza: split immagine + testo con checklist servizi e
 * CTA "Prenota un intervento". Contenuti da `getPage('home')`.
 */
export async function Service({ service, locale }: ServiceProps) {
  const t = await getTranslations("Actions");

  return (
    <section className="section section--grey" id="officina" aria-label={service.title}>
      <div className="container">
        <div className="split">
          <Reveal className="split__media" index={0}>
            <div className="ph" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M14.7 6.3a4 4 0 0 1-5 5L4 17v3h3l5.7-5.7a4 4 0 0 0 5-5l-2.3 2.3-2-2 2.3-2.3z" />
              </svg>
            </div>
          </Reveal>

          <Reveal className="split__body" index={1}>
            {service.eyebrow ? (
              <p className="eyebrow">{service.eyebrow}</p>
            ) : null}
            <h2>{service.title}</h2>
            <p className="lead">{service.lead}</p>
            <ul className="checklist">
              {service.checklist.map((item) => (
                <li key={item}>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--ok)"
                    strokeWidth="2.5"
                    aria-hidden="true"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              className="btn btn--green btn--lg"
              href={`/${locale}/officina#prenota`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {t("prenotaIntervento")}
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
