import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { HomeBento } from "@/domain";
import type { Locale } from "@/i18n/routing";
import { Reveal } from "./Reveal";

type BentoProps = {
  bento: HomeBento;
  locale: Locale;
};

/**
 * Sezione bento "Una concessionaria, ogni servizio".
 * Contenuti da `getPage('home')`; le celle si rivelano allo scroll (`Reveal`).
 */
export async function Bento({ bento, locale }: BentoProps) {
  const t = await getTranslations("Actions");

  return (
    <section className="section" aria-label={bento.title}>
      <div className="container">
        <div className="section-head">
          {bento.eyebrow ? <p className="eyebrow">{bento.eyebrow}</p> : null}
          <h2>{bento.title}</h2>
          {bento.subtitle ? <p>{bento.subtitle}</p> : null}
        </div>

        <div className="bento">
          <Reveal as="article" className="bento__cell bento__feature" index={0}>
            <div className="ph" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3f5a99"
                strokeWidth="1.5"
              >
                <rect x="2" y="7" width="20" height="13" rx="2" />
                <path d="M2 13h20M7 7l2-3h6l2 3" />
              </svg>
            </div>
            <div className="bento__overlay">
              <h3>{bento.feature.title}</h3>
              <p>{bento.feature.text}</p>
              <Link className="btn btn--primary" href={`/${locale}/auto`}>
                {t("sfogliaCatalogo")}
              </Link>
            </div>
          </Reveal>

          <Reveal as="article" className="bento__cell bento__wide" index={1}>
            <div className="feature-ico" aria-hidden="true">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20M6 15h4" />
              </svg>
            </div>
            <h3>{bento.highlight.title}</h3>
            <p>{bento.highlight.text}</p>
          </Reveal>

          {bento.stats.map((stat, index) => (
            <Reveal
              as="article"
              className="bento__cell bento__stat"
              index={2 + index}
              key={stat.label}
            >
              <b>{stat.value}</b>
              <span>{stat.label}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
