import type { ReactNode } from "react";
import type { PageHero as PageHeroContent } from "@/domain";

type PageHeroProps = {
  hero: PageHeroContent;
  /** Azioni opzionali (CTA) renderizzate sotto il sottotitolo. */
  actions?: ReactNode;
};

/**
 * Hero interno delle pagine editoriali (RSC). Occhiello + titolo + sottotitolo
 * dal contenuto WordPress; le eventuali CTA arrivano dal chiamante.
 */
export function PageHero({ hero, actions }: PageHeroProps) {
  return (
    <section className="page-hero" aria-labelledby="page-hero-title">
      <div className="container page-hero__inner">
        {hero.eyebrow ? (
          <p className="eyebrow eyebrow--light">{hero.eyebrow}</p>
        ) : null}
        <h1 id="page-hero-title">{hero.title}</h1>
        <p>{hero.subtitle}</p>
        {actions ? <div className="page-hero__actions">{actions}</div> : null}
      </div>
    </section>
  );
}
