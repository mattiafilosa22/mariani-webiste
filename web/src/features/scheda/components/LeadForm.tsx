"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { submitLead, type LeadRequest } from "@/lib/forms";

export type LeadVariant =
  | "preventivo"
  | "finanziamento"
  | "testdrive"
  | "permuta";

type LeadFormProps = {
  variant: LeadVariant;
  vehicleTitle: string;
  slug: string;
  /** Messaggio di default per il tab "Preventivo" (pre-compilato). */
  defaultMessage: string;
};

type Status = "idle" | "sending" | "success" | "error";
type Errors = Record<string, string>;

const SUBMIT_LABEL = {
  preventivo: "submitPreventivo",
  finanziamento: "submitFinanziamento",
  testdrive: "submitTestdrive",
  permuta: "submitPermuta",
} as const;

/**
 * Form contatto accessibile (una variante per tipo di richiesta).
 * - Label associate, `aria-invalid`/`aria-describedby`, errori con `role="alert"`.
 * - Consenso GDPR obbligatorio; honeypot anti-bot.
 * - Invio disaccoppiato via `submitLead` (POST a /lead); stati loading/success/error.
 */
export function LeadForm({
  variant,
  vehicleTitle,
  slug,
  defaultMessage,
}: LeadFormProps) {
  const t = useTranslations("Scheda.form");
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

  const id = useMemo(
    () => (name: string) => `${uid}-${variant}-${name}`,
    [uid, variant]
  );

  function composeMessage(values: Record<string, string>): string {
    const common = { vehicle: vehicleTitle, slug };
    switch (variant) {
      case "preventivo":
        return values.messaggio && values.messaggio.length > 0
          ? values.messaggio
          : defaultMessage;
      case "finanziamento":
        return t("msgFinanziamento", {
          ...common,
          anticipo: values.anticipo || "—",
          durata: values.durata || "—",
          rata: values.rata || "—",
          note: values.note || "—",
        });
      case "testdrive":
        return t("msgTestdrive", {
          ...common,
          data: values.data || "—",
          fascia: values.fascia || "—",
          note: values.note || "—",
        });
      case "permuta":
        return t("msgPermuta", {
          ...common,
          marca: values.marca || "—",
          modello: values.modello || "—",
          anno: values.anno || "—",
          km: values.km || "—",
        });
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot: se compilato è un bot → simuliamo il successo senza inviare.
    if (String(data.get("website") ?? "").length > 0) {
      setStatus("success");
      form.reset();
      return;
    }

    const values = Object.fromEntries(
      Array.from(data.entries()).map(([key, value]) => [key, String(value).trim()])
    ) as Record<string, string>;

    const nextErrors = validate(variant, values, data.get("privacy") === "on");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      document.getElementById(id(Object.keys(nextErrors)[0]))?.focus();
      return;
    }

    const payload: LeadRequest = {
      nome: `${values.nome ?? ""} ${values.cognome ?? ""}`.trim(),
      email: values.email,
      telefono: values.telefono || undefined,
      messaggio: composeMessage(values),
      privacy: true,
      // Slug reale della scheda: popola il campo dedicato `auto_slug` del lead
      // (via submitLead) e, come sorgente, resta anche in `fonte`.
      autoSlug: slug,
      fonte: slug,
      tipoRichiesta: variant,
    };

    setStatus("sending");
    try {
      await submitLead(payload);
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="form-grid" onSubmit={onSubmit} noValidate>
      <Field id={id("nome")} name="nome" label={t("nome")} required autoComplete="given-name" error={errors.nome} errorMsg={t("required")} />
      <Field id={id("cognome")} name="cognome" label={t("cognome")} required autoComplete="family-name" error={errors.cognome} errorMsg={t("required")} />
      <Field
        id={id("email")}
        name="email"
        type="email"
        label={t("email")}
        required
        autoComplete="email"
        error={errors.email}
        errorMsg={errors.email === "email" ? t("invalidEmail") : t("required")}
      />
      <Field id={id("telefono")} name="telefono" type="tel" label={t("telefono")} required autoComplete="tel" error={errors.telefono} errorMsg={t("required")} />

      <VariantFields variant={variant} id={id} errors={errors} />

      {/* Honeypot: nascosto agli utenti e agli screen reader. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="check field--full">
        <input
          id={id("privacy")}
          name="privacy"
          type="checkbox"
          aria-required
          aria-invalid={errors.privacy ? true : undefined}
          aria-describedby={errors.privacy ? `${id("privacy")}-err` : undefined}
        />
        <label htmlFor={id("privacy")}>
          {t.rich("privacy", { a: (chunks) => <a href="#">{chunks}</a> })}{" "}
          <span className="req">*</span>
          {errors.privacy ? (
            <span className="field-error" id={`${id("privacy")}-err`} role="alert">
              {t("consentRequired")}
            </span>
          ) : null}
        </label>
      </div>

      <div className="form-actions field--full">
        <button className="btn btn--primary btn--lg" type="submit" disabled={status === "sending"}>
          {status === "sending" ? t("sending") : t(SUBMIT_LABEL[variant])}
        </button>
      </div>

      <p className={`form-status field--full form-status--${status}`} role="status" aria-live="polite">
        {status === "success" ? t("success") : null}
        {status === "error" ? t("failure") : null}
      </p>
    </form>
  );
}

function VariantFields({
  variant,
  id,
  errors,
}: {
  variant: LeadVariant;
  id: (name: string) => string;
  errors: Errors;
}) {
  const t = useTranslations("Scheda.form");

  if (variant === "preventivo") {
    return (
      <div className="field field--full">
        <label htmlFor={id("messaggio")}>{t("messaggio")}</label>
        <textarea
          className="textarea"
          id={id("messaggio")}
          name="messaggio"
          placeholder={t("messaggioPlaceholder")}
        />
      </div>
    );
  }

  if (variant === "finanziamento") {
    return (
      <>
        <Field id={id("anticipo")} name="anticipo" type="number" label={t("anticipo")} inputMode="numeric" min={0} step={500} />
        <div className="field">
          <label htmlFor={id("durata")}>{t("durata")}</label>
          <select className="select" id={id("durata")} name="durata" defaultValue="48">
            <option>24</option>
            <option>36</option>
            <option>48</option>
            <option>60</option>
            <option>72</option>
          </select>
        </div>
        <Field id={id("rata")} name="rata" type="number" label={t("rata")} inputMode="numeric" min={0} step={10} />
        <Field id={id("note")} name="note" label={t("note")} />
      </>
    );
  }

  if (variant === "testdrive") {
    return (
      <>
        <Field id={id("data")} name="data" type="date" label={t("data")} required error={errors.data} errorMsg={t("required")} />
        <div className="field">
          <label htmlFor={id("fascia")}>{t("fascia")}</label>
          <select className="select" id={id("fascia")} name="fascia" defaultValue={t("fasciaMattino")}>
            <option>{t("fasciaMattino")}</option>
            <option>{t("fasciaPomeriggio")}</option>
          </select>
        </div>
        <Field id={id("note")} name="note" label={t("note")} className="field--full" />
      </>
    );
  }

  return (
    <fieldset className="form-fieldset field--full">
      <legend>{t("permutaLegend")}</legend>
      <div className="form-grid">
        <Field id={id("marca")} name="marca" label={t("permutaMarca")} required error={errors.marca} errorMsg={t("required")} />
        <Field id={id("modello")} name="modello" label={t("permutaModello")} required error={errors.modello} errorMsg={t("required")} />
        <Field id={id("anno")} name="anno" type="number" label={t("permutaAnno")} inputMode="numeric" min={1990} max={2030} />
        <Field id={id("km")} name="km" type="number" label={t("permutaKm")} inputMode="numeric" min={0} step={1000} />
      </div>
    </fieldset>
  );
}

type FieldProps = {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "numeric" | "text" | "tel" | "email";
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  error?: string;
  errorMsg?: string;
};

function Field({
  id,
  name,
  label,
  type = "text",
  required,
  autoComplete,
  inputMode,
  min,
  max,
  step,
  className,
  error,
  errorMsg,
}: FieldProps) {
  const errId = `${id}-err`;
  return (
    <div className={`field${className ? ` ${className}` : ""}`}>
      <label htmlFor={id}>
        {label} {required ? <span className="req">*</span> : null}
      </label>
      <input
        className="input"
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        min={min}
        max={max}
        step={step}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
      />
      {error ? (
        <span className="field-error" id={errId} role="alert">
          {errorMsg}
        </span>
      ) : null}
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validazione lato client dei campi obbligatori per variante. */
function validate(
  variant: LeadVariant,
  values: Record<string, string>,
  consent: boolean
): Errors {
  const errors: Errors = {};
  if (!values.nome) errors.nome = "required";
  if (!values.cognome) errors.cognome = "required";
  if (!values.email) errors.email = "required";
  else if (!EMAIL_RE.test(values.email)) errors.email = "email";
  if (!values.telefono) errors.telefono = "required";

  if (variant === "testdrive" && !values.data) errors.data = "required";
  if (variant === "permuta") {
    if (!values.marca) errors.marca = "required";
    if (!values.modello) errors.modello = "required";
  }

  if (!consent) errors.privacy = "required";
  return errors;
}
