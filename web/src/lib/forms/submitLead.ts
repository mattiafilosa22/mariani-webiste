import { leadSchema, type Lead } from "@/domain";

/**
 * Modulo condiviso per l'invio dei lead di contatto.
 * Disaccoppiato dai form: esegue un `POST` JSON all'endpoint WordPress
 * `wp-json/mariani/v1/lead`. La finalizzazione (mapping Fluent Forms) è lato CMS.
 *
 * L'URL base runtime arriva da `NEXT_PUBLIC_WP_API_URL` (esposto al client):
 * in export statico il browser deve conoscere l'origine assoluta del CMS.
 */

const DEFAULT_API_BASE = "/wp-json/mariani/v1";

/** Campi extra inviati insieme al lead validato (es. sorgente = slug auto). */
export type LeadExtra = {
  fonte?: string;
  tipoRichiesta?: string;
};

export type LeadRequest = Lead & LeadExtra;

export function leadApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WP_API_URL;
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_API_BASE;
}

export function leadEndpoint(base: string = leadApiBase()): string {
  return `${base.replace(/\/$/, "")}/lead`;
}

export type SubmitLeadOptions = {
  endpoint?: string;
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
};

/**
 * Valida il payload col dominio e lo invia. Lancia in caso di dati non validi
 * o risposta non `ok`, così il chiamante può mostrare lo stato di errore.
 */
export async function submitLead(
  payload: LeadRequest,
  options: SubmitLeadOptions = {}
): Promise<void> {
  const { fonte, tipoRichiesta, ...lead } = payload;
  // Valida i campi di dominio; `fonte`/`tipoRichiesta` sono metadati opzionali.
  leadSchema.parse(lead);

  const doFetch = options.fetchImpl ?? fetch;
  const endpoint = options.endpoint ?? leadEndpoint();

  // Lo slug auto va inviato in snake_case (`auto_slug`): è il campo dedicato del
  // LeadController. Inviarlo solo come `autoSlug` camelCase lo relegherebbe al
  // fallback `fonte`, lasciando vuoto il campo dedicato del lead.
  const { autoSlug, ...leadFields } = lead;

  const response = await doFetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    // Il consenso GDPR nel dominio è `privacy`, ma l'endpoint WP lo attende come
    // `consenso` (LeadController): senza questo mapping ogni invio torna 422.
    body: JSON.stringify({
      ...leadFields,
      consenso: lead.privacy,
      auto_slug: autoSlug,
      fonte,
      tipoRichiesta,
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(`Invio lead non riuscito (HTTP ${response.status})`);
  }
}
