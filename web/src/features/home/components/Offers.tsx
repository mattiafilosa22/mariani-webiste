import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { CarCardVm } from "@/lib/mappers/auto";
import { CarCard } from "@/components/ui/CarCard";
import { OfferSlider } from "./OfferSlider";

type OffersProps = {
  locale: Locale;
  cards: CarCardVm[];
};

/**
 * Sezione "Auto in offerta": renderizza le `CarCard` (Server Component) e le
 * passa allo slider client come slide già pronte. Se non ci sono auto in
 * evidenza mostra un messaggio, senza inizializzare lo slider.
 */
export async function Offers({ locale, cards }: OffersProps) {
  const t = await getTranslations();

  const heading = (
    <div className="section-head" style={{ marginBottom: 0 }}>
      <p className="eyebrow">{t("Offers.eyebrow")}</p>
      <h2>{t("Offers.title")}</h2>
      <p>{t("Offers.subtitle")}</p>
    </div>
  );

  return (
    <section className="section section--grey" aria-label={t("Offers.title")}>
      <div className="container">
        {cards.length > 0 ? (
          <OfferSlider
            heading={heading}
            slides={cards.map((vm) => (
              <CarCard key={vm.slug} vm={vm} locale={locale} />
            ))}
          />
        ) : (
          <>
            <div className="offers-head">{heading}</div>
            <p>{t("Common.empty")}</p>
          </>
        )}

        <div className="offers-foot">
          <Link className="btn btn--outline btn--lg" href={`/${locale}/auto`}>
            {t("Actions.vediTutteOfferte")}
          </Link>
        </div>
      </div>
    </section>
  );
}
