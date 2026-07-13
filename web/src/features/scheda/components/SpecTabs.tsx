import { getTranslations } from "next-intl/server";
import type { Auto } from "@/domain";
import type { Locale } from "@/i18n/routing";
import { formatKm } from "@/lib/mappers/auto";
import { buildSpecTabs, type SpecRow, type SpecTab } from "../lib/specTabs";
import { Tabs, type TabItem } from "./Tabs";

type SpecTabsProps = {
  auto: Auto;
  locale: Locale;
};

/**
 * Tab "Specifiche" della scheda (RSC): assembla i dati principali dai campi
 * strutturati (label i18n), delega a `buildSpecTabs` la partizione delle
 * specifiche e rende il tutto col tablist accessibile.
 */
export async function SpecTabs({ auto, locale }: SpecTabsProps) {
  const t = await getTranslations("Scheda.specs");
  const tSpec = await getTranslations("Spec");
  const tUnit = await getTranslations("Catalog.unit");
  const tDrive = await getTranslations("Catalog.drive");

  const datiRows: SpecRow[] = [
    { label: t("fields.tipo"), value: t(`tipo.${auto.tipo}`) },
    { label: t("fields.categoria"), value: t(`categoria.${auto.categoria}`) },
    { label: t("fields.marca"), value: auto.marca },
    { label: t("fields.modello"), value: auto.modello },
    { label: t("fields.versione"), value: auto.versione },
    { label: t("fields.anno"), value: String(auto.anno) },
    { label: t("fields.km"), value: `${formatKm(auto.km, locale)} ${tUnit("km")}` },
    { label: t("fields.carrozzeria"), value: auto.carrozzeria },
    { label: t("fields.colore"), value: tSpec(`color.${auto.colore}`) },
    { label: t("fields.potenza"), value: `${auto.potenzaCv} ${tUnit("cv")}` },
    { label: t("fields.alimentazione"), value: tSpec(`fuel.${auto.alimentazione}`) },
    { label: t("fields.cambio"), value: tSpec(`transmission.${auto.cambio}`) },
    { label: t("fields.trazione"), value: tDrive(auto.trazione) },
  ].filter((row) => row.value.trim().length > 0);

  const tabs = buildSpecTabs(
    {
      datiRows,
      specifiche: auto.specifiche,
      dotazioni: auto.dotazioni,
      optional: auto.optional,
    },
    {
      dati: t("dati"),
      tecniche: t("tecniche"),
      consumi: t("consumi"),
      dotazioni: t("dotazioni"),
      optional: t("optional"),
      optionalNote: t("optionalNote"),
    }
  );

  const items: TabItem[] = tabs.map((tab) => ({
    id: tab.id,
    label: tab.label,
    panel: <SpecPanel tab={tab} />,
  }));

  return (
    <section className="section section--tight section--grey" aria-label={t("aria")}>
      <div className="container">
        <Tabs items={items} ariaLabel={t("aria")} />
      </div>
    </section>
  );
}

function SpecPanel({ tab }: { tab: SpecTab }) {
  if (tab.kind === "table") {
    return (
      <table className="spectable">
        <caption>{tab.label}</caption>
        <tbody>
          {tab.rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <>
      <ul className="feat-list">
        {tab.items.map((item) => (
          <li key={item}>
            <svg
              width="20"
              height="20"
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
      {tab.note ? <p className="wrap-note feat-note">{tab.note}</p> : null}
    </>
  );
}
