import "server-only";
import { createHash } from "node:crypto";
import { VENUE_TZ } from "./time";

export const sha = (s: string) => createHash("sha256").update(s).digest("hex");

/** Adresse publique du site (liens des e-mails). */
export const siteUrl = () => (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const dateLabel = (at: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: VENUE_TZ }).format(at);

/** Lien « Gérer / annuler ma réservation » envoyé au client. */
export const manageUrl = (locale: string, reference: string, token: string) =>
  `${siteUrl()}/${locale}/reservation/annuler?ref=${encodeURIComponent(reference)}&t=${encodeURIComponent(token)}`;

/** Destinataire des copies : réglage en base, sinon variable NOTIFY_EMAIL. */
export const venueInbox = (settingsEmail: string | null | undefined) => settingsEmail || process.env.NOTIFY_EMAIL || null;
