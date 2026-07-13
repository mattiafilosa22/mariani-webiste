import { z } from "zod";

/**
 * Lead di contatto inviato dai form (Fluent Forms lato WP).
 * Lo schema è usato per la validazione client dei form di contatto.
 */
export const leadSchema = z.object({
  nome: z.string().min(2),
  email: z.email(),
  telefono: z.string().optional(),
  messaggio: z.string().min(10),
  autoSlug: z.string().optional(),
  privacy: z.literal(true),
});
export type Lead = z.infer<typeof leadSchema>;
