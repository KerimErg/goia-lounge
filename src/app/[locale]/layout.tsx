import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fontVariables } from "../fonts";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Cursor } from "@/components/cursor";
import { LogoSymbol } from "@/components/brand/logo-symbol";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
    title: { default: t("title"), template: "%s · GOIA Lounge" },
    description: t("description"),
    alternates: { languages: { fr: "/fr", de: "/de", en: "/en", "x-default": "/fr" } },
    icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  };
}

export const viewport: Viewport = { themeColor: "#1b1511", colorScheme: "dark" };

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  // Seuls les textes utilisés par les composants client partent dans le navigateur.
  const all = await getMessages();
  const messages = { nav: all.nav, quick: all.quick, flow: all.flow, cancelPage: all.cancelPage };
  return (
    <html lang={locale} className={fontVariables}>
      <body className="min-h-dvh bg-ivory">
        <LogoSymbol />
        <NextIntlClientProvider messages={messages}>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <Cursor />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
