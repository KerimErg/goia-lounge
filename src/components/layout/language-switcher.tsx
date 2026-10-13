"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** FR · DE · EN — garde la même page en changeant de langue. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  return (
    <div role="group" aria-label={t("language")} className={cn("flex items-center gap-1 text-[0.7rem] tracking-[0.2em]", className)}>
      {locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span aria-hidden className="mx-1 opacity-30">·</span>}
          <button
            type="button"
            lang={l}
            aria-current={l === locale ? "true" : undefined}
            onClick={() => router.replace(
              // @ts-expect-error -- les paramètres dynamiques de la page courante sont conservés
              { pathname, params }, { locale: l as Locale, scroll: false })}
            className={cn("uppercase underline-offset-[6px] transition-opacity hover:opacity-100", l === locale ? "underline decoration-1" : "opacity-55")}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
