import { getTranslations } from "next-intl/server";
import { Tabs, type TabItem } from "./Tabs";
import { LeadForm, type LeadVariant } from "./LeadForm";
import type { Locale } from "@/i18n/routing";

type ContactFormProps = {
  vehicleTitle: string;
  slug: string;
  locale: Locale;
};

const VARIANTS: LeadVariant[] = [
  "preventivo",
  "finanziamento",
  "testdrive",
  "permuta",
];

/**
 * Sezione "Richiedi informazioni": tablist accessibile con un form per tipo di
 * richiesta. Il guscio è RSC (label/messaggio pre-compilato da i18n); ogni
 * pannello è un `LeadForm` client autonomo.
 */
export async function ContactForm({ vehicleTitle, slug, locale }: ContactFormProps) {
  const t = await getTranslations("Scheda.contact");
  const tForm = await getTranslations("Scheda.form");

  const defaultMessage = tForm("quotePrefill", { vehicle: vehicleTitle, slug });

  const items: TabItem[] = VARIANTS.map((variant) => ({
    id: variant,
    label: t(`tabs.${variant}`),
    panel: (
      <LeadForm
        variant={variant}
        vehicleTitle={vehicleTitle}
        slug={slug}
        defaultMessage={defaultMessage}
        privacyHref={`/${locale}/privacy-policy`}
      />
    ),
  }));

  return (
    <section className="section" id="contatti" aria-labelledby="contact-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 id="contact-title">{t("title", { vehicle: vehicleTitle })}</h2>
          <p>{t("subtitle")}</p>
        </div>

        <div className="contact-card">
          <Tabs items={items} ariaLabel={t("aria")} />
        </div>
      </div>
    </section>
  );
}
