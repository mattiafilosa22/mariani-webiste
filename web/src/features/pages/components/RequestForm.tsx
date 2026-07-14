"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { submitLead, type LeadRequest } from "@/lib/forms";

export type RequestVariant = "noleggio" | "officina" | "contatti";

type RequestFormProps = {
  variant: RequestVariant;
  /** Rotta della privacy policy per il link di consenso GDPR. */
  privacyHref: string;
  /** Opzioni di durata (mesi) per il noleggio, derivate dal contenuto WP. */
  durataOptions?: number[];
};

type Status = "idle" | "sending" | "success" | "error";
type Errors = Record<string, string>;

const SUBMIT_KEY: Record<RequestVariant, string> = {
  noleggio: "submitNoleggio",
  officina: "submitOfficina",
  contatti: "submitContatti",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Form contatto accessibile e riusabile per Noleggio, Officina e Contatti.
 * - Label associate, `aria-invalid`/`aria-describedby`, errori con `role="alert"`.
 * - Consenso GDPR obbligatorio (link alla privacy policy) + honeypot anti-bot.
 * - Invio disaccoppiato via `submitLead` (POST /lead); messaggio composto dai
 *   campi della variante tramite template i18n. Nessun testo editoriale qui.
 */
export function RequestForm({
  variant,
  privacyHref,
  durataOptions = [],
}: RequestFormProps) {
  const t = useTranslations("Pages.form");
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

  const id = useMemo(
    () => (name: string) => `${uid}-${variant}-${name}`,
    [uid, variant]
  );

  function composeMessage(v: Record<string, string>): string {
    const dash = "—";
    switch (variant) {
      case "noleggio":
        return t("msgNoleggio", {
          tipo: v.tipo || dash,
          veicolo: v.veicolo || dash,
          durata: v.durata || dash,
          km: v.km || dash,
          messaggio: v.messaggio || dash,
        });
      case "officina":
        return t("msgOfficina", {
          targa: v.targa || dash,
          messaggio: v.messaggio || dash,
        });
      case "contatti":
        return t("msgContatti", {
          oggetto: v.oggetto || dash,
          messaggio: v.messaggio || dash,
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
      Array.from(data.entries()).map(([key, value]) => [
        key,
        String(value).trim(),
      ])
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
      fonte: variant,
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
    <form className="request__box" onSubmit={onSubmit} noValidate>
      <div className="form-grid">
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

        <VariantFields
          variant={variant}
          id={id}
          errors={errors}
          durataOptions={durataOptions}
        />
      </div>

      {/* Honeypot: nascosto agli utenti e agli screen reader. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="request__consents">
        <div className="check">
          <input
            id={id("privacy")}
            name="privacy"
            type="checkbox"
            aria-required
            aria-invalid={errors.privacy ? true : undefined}
            aria-describedby={errors.privacy ? `${id("privacy")}-err` : undefined}
          />
          <label htmlFor={id("privacy")}>
            {t.rich("privacy", {
              a: (chunks) => <Link href={privacyHref}>{chunks}</Link>,
            })}{" "}
            <span className="req">*</span>
            {errors.privacy ? (
              <span className="field-error" id={`${id("privacy")}-err`} role="alert">
                {t("consentRequired")}
              </span>
            ) : null}
          </label>
        </div>
        <div className="check">
          <input id={id("marketing")} name="marketing" type="checkbox" />
          <label htmlFor={id("marketing")}>{t("marketing")}</label>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn--primary btn--lg" type="submit" disabled={status === "sending"}>
          {status === "sending" ? t("sending") : t(SUBMIT_KEY[variant])}
        </button>
        <span className="req-note">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          {t("responseNote")}
        </span>
      </div>

      <p className={`form-status form-status--${status}`} role="status" aria-live="polite">
        {status === "success" ? t("success") : null}
        {status === "error" ? t("failure") : null}
      </p>

      <p className="request__legal">{t("legalNote")}</p>
    </form>
  );
}

function VariantFields({
  variant,
  id,
  errors,
  durataOptions,
}: {
  variant: RequestVariant;
  id: (name: string) => string;
  errors: Errors;
  durataOptions: number[];
}) {
  const t = useTranslations("Pages.form");

  if (variant === "noleggio") {
    return (
      <>
        <SelectField id={id("tipo")} name="tipo" label={t("tipo")} placeholder={t("select")} options={[t("tipoPrivato"), t("tipoAzienda"), t("tipoPiva")]} />
        <Field id={id("veicolo")} name="veicolo" label={t("veicolo")} />
        <SelectField
          id={id("durata")}
          name="durata"
          label={t("durata")}
          placeholder={t("select")}
          options={durataOptions.map((m) => t("durataMonths", { count: m }))}
        />
        <Field id={id("km")} name="km" type="number" label={t("km")} inputMode="numeric" min={0} step={1000} />
        <TextareaField id={id("messaggio")} label={t("messaggio")} placeholder={t("messaggioPlaceholder")} />
      </>
    );
  }

  if (variant === "officina") {
    return (
      <>
        <Field id={id("targa")} name="targa" label={t("targa")} required error={errors.targa} errorMsg={t("required")} autoComplete="off" />
        <TextareaField id={id("messaggio")} label={t("messaggio")} placeholder={t("messaggioPlaceholder")} />
      </>
    );
  }

  return (
    <>
      <SelectField
        id={id("oggetto")}
        name="oggetto"
        label={t("oggetto")}
        placeholder={t("select")}
        required
        error={errors.oggetto}
        errorMsg={t("required")}
        options={[t("oggettoVendita"), t("oggettoAssistenza"), t("oggettoNoleggio"), t("oggettoAltro")]}
      />
      <TextareaField
        id={id("messaggio")}
        label={t("messaggio")}
        placeholder={t("messaggioPlaceholder")}
        required
        error={errors.messaggio}
        errorMsg={t("required")}
      />
    </>
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
  step?: number;
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
  step,
  error,
  errorMsg,
}: FieldProps) {
  const errId = `${id}-err`;
  return (
    <div className="field">
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

function SelectField({
  id,
  name,
  label,
  placeholder,
  options,
  required,
  error,
  errorMsg,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  options: string[];
  required?: boolean;
  error?: string;
  errorMsg?: string;
}) {
  const errId = `${id}-err`;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label} {required ? <span className="req">*</span> : null}
      </label>
      <select
        className="select"
        id={id}
        name={name}
        defaultValue=""
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      {error ? (
        <span className="field-error" id={errId} role="alert">
          {errorMsg}
        </span>
      ) : null}
    </div>
  );
}

function TextareaField({
  id,
  label,
  placeholder,
  required,
  error,
  errorMsg,
}: {
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
  error?: string;
  errorMsg?: string;
}) {
  const errId = `${id}-err`;
  return (
    <div className="field field--full">
      <label htmlFor={id}>
        {label} {required ? <span className="req">*</span> : null}
      </label>
      <textarea
        className="textarea"
        id={id}
        name="messaggio"
        placeholder={placeholder}
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

/** Validazione lato client dei campi obbligatori per variante. */
function validate(
  variant: RequestVariant,
  values: Record<string, string>,
  consent: boolean
): Errors {
  const errors: Errors = {};
  if (!values.nome) errors.nome = "required";
  if (!values.cognome) errors.cognome = "required";
  if (!values.email) errors.email = "required";
  else if (!EMAIL_RE.test(values.email)) errors.email = "email";
  if (!values.telefono) errors.telefono = "required";

  if (variant === "officina" && !values.targa) errors.targa = "required";
  if (variant === "contatti") {
    if (!values.oggetto) errors.oggetto = "required";
    if (!values.messaggio) errors.messaggio = "required";
  }

  if (!consent) errors.privacy = "required";
  return errors;
}
