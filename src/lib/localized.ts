import type { Locale } from "@/i18n/routing";

/** Texte traduit stocké en base : { fr, de?, en? }. */
export type LocalizedText = { fr: string; de?: string; en?: string };

/** Texte dans la langue demandée, sinon en français. */
export function tr(value: unknown, locale: Locale | string): string {
  if (!value || typeof value !== "object") return typeof value === "string" ? value : "";
  const v = value as Record<string, string | undefined>;
  return v[locale] || v.fr || "";
}
