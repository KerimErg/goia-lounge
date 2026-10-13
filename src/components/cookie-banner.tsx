"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { onConsentChange, readConsent, writeConsent } from "@/lib/consent";

/** Bandeau de confidentialité : choix équivalents (accepter / refuser), rappelable depuis le pied de page. */
export function CookieBanner() {
  const t = useTranslations("consent");
  const [show, setShow] = useState(false);
  useEffect(() => {
    const sync = () => setShow(!readConsent().decided);
    sync();
    return onConsentChange(sync);
  }, []);
  if (!show) return null;
  return (
    <div role="dialog" aria-live="polite" aria-label={t("title")} className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-2xl border border-champagne/30 bg-ink/95 p-5 text-ivory shadow-lift backdrop-blur-md sm:inset-x-5 sm:bottom-5 sm:p-6">
      <p className="text-[0.62rem] tracking-[0.3em] text-champagne uppercase">{t("title")}</p>
      <p className="mt-3 text-sm leading-relaxed text-ivory/85">
        {t.rich("text", { link: (c) => <Link href="/datenschutz" className="underline underline-offset-4">{c}</Link> })}
      </p>
      <div className="mt-5 grid gap-2 sm:flex sm:justify-end">
        <button type="button" onClick={() => writeConsent({ maps: false })} className="h-11 border border-ivory/35 px-5 text-[0.68rem] tracking-[0.22em] uppercase transition-colors hover:border-ivory">{t("decline")}</button>
        <button type="button" onClick={() => writeConsent({ maps: true })} className="h-11 bg-ivory px-5 text-[0.68rem] tracking-[0.22em] text-ink uppercase transition-colors hover:bg-linen">{t("accept")}</button>
      </div>
    </div>
  );
}

/** Lien « Paramètres de confidentialité » (pied de page). */
export function ConsentSettingsLink({ label }: { label: string }) {
  return (
    <button type="button" className="link-underline" onClick={() => import("@/lib/consent").then((m) => m.reopenConsent())}>
      {label}
    </button>
  );
}
