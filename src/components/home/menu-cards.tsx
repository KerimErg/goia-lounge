import type { CSSProperties } from "react";
import type { MenuSection } from "@prisma/client";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Words } from "@/components/fx";
import { Button } from "@/components/ui/button";
import { Ornament } from "@/components/ornament";
import { CategoryIcon } from "@/components/menu/category-icon";
import { getMenu } from "@/lib/menu";
import { tr } from "@/lib/localized";

const LINE: Record<MenuSection, "shisha" | "drinks" | "sweets"> = { SHISHA: "shisha", DRINK: "drinks", FOOD: "sweets" };

/**
 * Notre carte : un sommaire, comme la première page d'une carte de restaurant.
 * Une ligne par catégorie — numéro, pictogramme, grand nom, une courte ligne — séparées par des filets fins.
 */
export async function MenuCards() {
  const t = await getTranslations("menuCards");
  const lang = await getLocale();
  const cats = await getMenu();
  if (cats.length === 0) return null;

  return (
    <section className="relative bg-linen py-24 text-ink sm:py-32" aria-labelledby="menu-title">
      <div className="container-page">
        <div className="text-center">
          <p className="eyebrow text-taupe-deep">{t("eyebrow")}</p>
          <h2 id="menu-title" className="mt-5 text-[clamp(2.6rem,5.5vw,4.4rem)] leading-none"><Words text={t("title")} /></h2>
          <Ornament className="mx-auto mt-6 text-champagne" />
        </div>

        <ul className="mx-auto mt-14 max-w-4xl border-t border-ink/15 sm:mt-20">
          {cats.map((c, i) => (
            <li key={c.id} style={{ "--i": i } as CSSProperties} className="sd-rise border-b border-ink/15">
              <Link href={`/carte/${c.slug}`} className="group relative flex items-center gap-5 py-7 sm:gap-8 sm:py-9">
                {/* Fond qui se remplit au survol */}
                <span aria-hidden className="absolute inset-0 origin-left scale-x-0 bg-ivory/70 transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-x-100" />
                <span className="relative w-7 font-display text-sm text-taupe sm:w-10 sm:text-base">{String(i + 1).padStart(2, "0")}</span>
                <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-ink text-champagne transition-transform duration-500 ease-[var(--ease-lux)] group-hover:rotate-[-8deg] sm:size-16">
                  <CategoryIcon section={c.section} className="size-6 sm:size-8" />
                </span>
                <span className="relative min-w-0 flex-1 transition-transform duration-700 ease-[var(--ease-lux)] group-hover:translate-x-2">
                  <span className="block text-[clamp(2rem,5vw,3.6rem)] leading-none">{tr(c.name, lang)}</span>
                  <span className="mt-2 block truncate text-sm text-ink/55">{t(LINE[c.section])}</span>
                </span>
                <span aria-hidden className="relative grid size-11 shrink-0 place-items-center rounded-full border border-ink/20 transition-all duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-ivory sm:size-14">→</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-14 text-center">
          <Button asChild size="lux"><Link href="/carte">{t("cta")}</Link></Button>
        </div>
      </div>
    </section>
  );
}
