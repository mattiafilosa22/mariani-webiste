import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { AutoImage, HeroContent } from "@/domain";
import type { Locale } from "@/i18n/routing";
import { CountUp } from "./CountUp";

/** Asset locale usato quando WordPress non fornisce un'immagine hero. */
const HERO_IMAGE_FALLBACK = "/hero/hero-mache.jpg";

type HeroProps = {
  hero: HeroContent;
  locale: Locale;
  /** Immagine hero editabile da WP; assente ⇒ fallback all'asset locale. */
  heroImage?: AutoImage | null;
  /** Credito foto editabile da WP; assente ⇒ fallback alla label i18n. */
  fotoCredit?: string;
};

/**
 * Hero della home: unico `<h1>` della pagina, testi editoriali da `getPage`,
 * sfondo animato decorativo (client) e contatori animati sui numeri chiave.
 * L'overlay garantisce contrasto AA del testo bianco sullo sfondo scuro.
 */
export async function Hero({ hero, locale, heroImage, fotoCredit }: HeroProps) {
  const t = await getTranslations("Actions");
  const tHero = await getTranslations("Hero");
  const heroSrc = heroImage?.src ?? HERO_IMAGE_FALLBACK;
  const credit = fotoCredit ?? tHero("photoCredit");

  return (
    <section className="hero" aria-label={hero.eyebrow ?? hero.title}>
      {/* Sfondo hero: foto reale del nostro showroom (Ford Mustang Mach-E),
          editabile da WordPress con fallback all'asset locale.
          Decorativa (aria-hidden): il testo vero è nell'H1. Il velo sopra
          garantisce il contrasto AA e dà l'effetto "cinematografico". */}
      <div className="hero__media" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- export statico: asset già ottimizzato */}
        <img className="hero__photo" src={heroSrc} alt="" />
      </div>
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
        <p className="hero__credit">{credit}</p>
      </div>
    </section>
  );
}
