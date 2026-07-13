import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { HeroContent } from "@/domain";
import type { Locale } from "@/i18n/routing";
import { HeroMedia } from "./HeroMedia";
import { CountUp } from "./CountUp";

type HeroProps = {
  hero: HeroContent;
  locale: Locale;
};

/**
 * Hero della home: unico `<h1>` della pagina, testi editoriali da `getPage`,
 * sfondo animato decorativo (client) e contatori animati sui numeri chiave.
 * L'overlay garantisce contrasto AA del testo bianco sullo sfondo scuro.
 */
export async function Hero({ hero, locale }: HeroProps) {
  const t = await getTranslations("Actions");

  return (
    <section className="hero" aria-label={hero.eyebrow ?? hero.title}>
      <HeroMedia />
      <div className="hero__overlay" aria-hidden="true" />
      <div className="container hero__content">
        {hero.eyebrow ? (
          <p className="eyebrow eyebrow--light">{hero.eyebrow}</p>
        ) : null}
        <h1 className="hero__title">
          {hero.title}
          {hero.titleAccent ? (
            <>
              <br />
              <span className="accent">{hero.titleAccent}</span>
            </>
          ) : null}
        </h1>
        <p className="hero__sub">{hero.subtitle}</p>
        <div className="hero__actions">
          <Link className="btn btn--primary btn--lg" href={`/${locale}/auto`}>
            {t("sfogliaCatalogo")}
          </Link>
          <Link
            className="btn btn--ghost-light btn--lg"
            href={`/${locale}/contatti`}
          >
            {t("contattaci")}
          </Link>
        </div>
        {hero.stats.length > 0 ? (
          <div className="hero__stats">
            {hero.stats.map((stat) => (
              <div className="hero__stat" key={stat.label}>
                <CountUp value={stat.value} />
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
