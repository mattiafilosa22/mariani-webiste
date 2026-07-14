import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { Badge } from "@/domain";
import type { CarCardVm } from "@/lib/mappers/auto";

type CarCardProps = {
  vm: CarCardVm;
  locale: Locale;
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
 * Card veicolo riusabile (griglie catalogo, offerte, correlate).
 * Server Component: riceve un ViewModel già formattato dal mapper.
 */
export async function CarCard({ vm, locale }: CarCardProps) {
  const t = await getTranslations("CarCard");
  const tActions = await getTranslations("Actions");
  const href = `/${locale}/auto/${vm.slug}`;

  return (
    <article className="car-card">
      <div className="car-card__media">
        {/* eslint-disable-next-line @next/next/no-img-element -- export statico: immagini già dimensionate, ottimizzatore server non disponibile */}
        <img
          src={vm.image.src}
          srcSet={vm.image.srcset}
          width={vm.image.width}
          height={vm.image.height}
          alt={vm.image.alt}
          loading="lazy"
          decoding="async"
        />
        {vm.badges.length > 0 ? (
          <div className="car-card__badges">
            {vm.badges.map((badge) => (
              <span key={badge.key} className={`badge badge--${badge.variant}`}>
                {t(badgeLabelKey[badge.key])}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="car-card__body">
        <span className="car-card__brand">{vm.brand}</span>
        <h3 className="car-card__title">
          {vm.model}
          {/* Riga versione sempre presente (nbsp se assente): riserva lo spazio
              così tutte le card hanno la stessa altezza, senza effetto scaletta. */}
          <small>{vm.version || " "}</small>
        </h3>
        <div className="specline">
          {vm.specs.map((spec, index) => (
            // La chiave include l'indice: più spec possono avere lo stesso testo
            // (es. anno e km valgono entrambi il placeholder "n.d." quando ≤ 0),
            // quindi il solo valore non è univoco.
            <span key={`${index}-${spec}`}>
              {index > 0 ? <span className="sep">/</span> : null}
              <span>{spec}</span>
            </span>
          ))}
        </div>
        <div className="car-card__foot">
          <div className="price">
            {vm.price.old ? (
              <span className="price__old">{vm.price.old}</span>
            ) : null}
            <span
              className={[
                "price__now",
                vm.price.isPromo ? "" : "price__now--plain",
                vm.price.onRequest ? "price__now--request" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {vm.price.now}
            </span>
          </div>
          <Link
            className="car-card__cta"
            href={href}
            aria-label={`${tActions("vediScheda")} — ${vm.brand} ${vm.model}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
