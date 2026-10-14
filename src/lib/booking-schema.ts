import { z } from "zod";

/** Données envoyées par le formulaire de réservation (validées côté serveur). */
export const bookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  persons: z.coerce.number().int().min(1).max(30),
  zone: z.string().max(40).optional().nullable(),
  // Soit un seul champ « Nom » (formulaire du site), soit prénom + nom séparés
  name: z.string().trim().max(120).optional(),
  firstName: z.string().trim().max(60).optional(),
  lastName: z.string().trim().max(60).optional(),
  phone: z.string().trim().min(6).max(30).regex(/^[+\d\s().-]+$/),
  email: z.string().trim().toLowerCase().email().max(120),
  occasion: z.enum(["NONE", "BIRTHDAY", "FRIENDS", "DATE", "BUSINESS", "OTHER"]).default("NONE"),
  message: z.string().trim().max(500).optional().default(""),
  adult: z.literal(true),
  privacy: z.literal(true),
  locale: z.enum(["fr", "de", "en"]).default("fr"),
  website: z.string().max(0).optional().default(""), // piège à robots : doit rester vide
}).transform((d) => {
  const full = (d.name || `${d.firstName ?? ""} ${d.lastName ?? ""}`).trim().replace(/\s+/g, " ");
  const [first, ...rest] = full.split(" ");
  return { ...d, firstName: d.firstName || first || "", lastName: d.lastName || rest.join(" ") || "—" };
}).refine((d) => d.firstName.length > 0, { path: ["name"] });
export type BookingInput = z.infer<typeof bookingSchema>;
