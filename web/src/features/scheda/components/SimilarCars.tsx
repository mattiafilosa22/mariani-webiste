import { getTranslations } from "next-intl/server";
import type { AutoSummary } from "@/domain";
import type { Locale } from "@/i18n/routing";
import { toCarCardVm } from "@/lib/mappers/auto";
import { CarCard } from "@/components/ui/CarCard";
import { selectSimilar, type SimilarCriteria } from "../lib/similar";

type SimilarCarsProps = {
  all: AutoSummary[];
  current: SimilarCriteria;
  locale: Locale;
};

/**
 * Sezione "Auto simili": seleziona 3 veicoli affini (logica pura testabile) e
 * riusa la `CarCard`. Non renderizza nulla se non ci sono candidati.
 */
export async function SimilarCars({ all, current, locale }: SimilarCarsProps) {
  const similar = selectSimilar(all, current, 3);
  if (similar.length === 0) return null;

  const t = await getTranslations();

  return (
    <section className="section section--grey" aria-label={t("Scheda.similar.title")}>
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{t("Scheda.similar.eyebrow")}</p>
          <h2>{t("Scheda.similar.title")}</h2>
        </div>
        <div className="grid grid-3">
          {similar.map((summary) => {
            const vm = toCarCardVm(summary, locale, {
              km: t("CarCard.km"),
              alimentazione: t(`Spec.fuel.${summary.alimentazione}`),
              cambio: t(`Spec.transmission.${summary.cambio}`),
              priceOnRequest: t("Catalog.unit.priceOnRequest"),
              nd: t("Catalog.unit.nd"),
            });
            return <CarCard key={summary.slug} vm={vm} locale={locale} />;
          })}
        </div>
      </div>
    </section>
  );
}
