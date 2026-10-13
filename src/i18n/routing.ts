import { defineRouting } from "next-intl/routing";

export const locales = ["fr", "de", "en"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "fr",
  localePrefix: "always", // /fr, /de, /en
});
