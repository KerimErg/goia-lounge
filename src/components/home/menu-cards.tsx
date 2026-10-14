import type { CSSProperties } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Words } from "@/components/fx";
import { Button } from "@/components/ui/button";
import { Ornament } from "@/components/ornament";
import { CategoryIcon } from "@/components/menu/category-icon";
import { getMenu, euro } from "@/lib/menu";
import { tr } from "@/lib/localized";

const SHOWN = 4;

/**
 * Notre carte, sans photos (elles sont dans Bienvenue et L'ambiance) : un aperçu du vrai menu.
 * Une carte par catégorie avec le pictogramme doré dans un rond encre, comme sur la page de la carte,
 * et les premiers produits avec leur prix, reliés par des pointillés.
 */
export async function MenuCards() {
  const t = await getTranslations("menuCards");
  const lang = await getLocale();
  const cats = await getMenu();
  if (cats.length === 0) return null;

  return (
    <section className="relative isolate overflow-clip bg-linen py-24 text-ink sm:py-32" aria-labelledby="menu-title">
      <div className="container-page">
        <div className="text-center">
          <p className="eyebrow text-taupe-deep">{t("eyebrow")}</p>
          <h2 id="menu-title" className="mt-5 text-[clamp(2.6rem,5.5vw,4.4rem)] leading-none"><Words text={t("title")} /></h2>
          <Ornament className="mx-auto mt-6 text-champagne" />
        </div>

        <ul className="mx-auto mt-16 grid max-w-6xl gap-14 sm:mt-20 md:grid-cols-3 md:gap-6 lg:gap-8">
          {cats.map((c, i) => (
            <li key={c.id} style={{ "--i": i } as CSSProperties} className="sd-rise">
              <Link
                href={`/carte/${c.slug}`}
                className="group relative flex h-full flex-col rounded-[2rem] bg-ivory px-7 pt-14 pb-8 shadow-soft transition-[transform,box-shadow] duration-500 ease-[var(--ease-lux)] hover:-translate-y-2 hover:shadow-lift sm:px-9"
              >
                {/* Pictogramme posé à cheval sur le haut de la carte */}
                <span className="absolute -top-10 left-1/2 grid size-20 -translate-x-1/2 place-items-center rounded-full bg-ink text-champagne ring-4 ring-linen transition-transform duration-500 ease-[var(--ease-lux)] group-hover:scale-105">
                  <CategoryIcon section={c.section} className="size-10" />
                </span>
                <span className="absolute top-5 right-6 font-display text-sm text-taupe">{String(i + 1).padStart(2, "0")}</span>

                <h3 className="text-center text-[2.1rem] leading-none">{tr(c.name, lang)}</h3>
                <span aria-hidden className="mx-auto mt-4 block h-px w-10 bg-champagne transition-all duration-500 group-hover:w-20" />

                <ul className="mt-7 space-y-3.5">
                  {c.items.slice(0, SHOWN).map((it) => (
                    <li key={it.id} className="flex items-baseline gap-3 text-[0.95rem]">
                      <span>{tr(it.name, lang)}</span>
                      <span aria-hidden className="mb-1 flex-1 border-b border-dotted border-ink/25" />
                      <span className="tabular-nums text-taupe-deep">{it.priceCents != null ? euro(it.priceCents, lang) : "—"}</span>
                    </li>
                  ))}
                </ul>
                {c.items.length > SHOWN && <p className="mt-3.5 text-sm text-ink/50">{t("more", { n: c.items.length - SHOWN })}</p>}

                <span className="mt-auto flex items-center justify-center gap-3 pt-8 text-[0.68rem] tracking-[0.3em] uppercase">
                  {t("see")}
                  <span aria-hidden className="grid size-8 place-items-center rounded-full border border-ink/20 transition-all duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-ivory">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-16 text-center">
          <Button asChild size="lux"><Link href="/carte">{t("cta")}</Link></Button>
        </div>
      </div>
    </section>
  );
}
