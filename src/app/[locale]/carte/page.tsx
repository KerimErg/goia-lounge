import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Ornament } from "@/components/ornament";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { tr } from "@/lib/localized";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "menuPage" });
  return { title: t("title") };
}

const SECTIONS = ["SHISHA", "DRINK", "FOOD"] as const;
const ANCHOR = { SHISHA: "chichas", DRINK: "boissons", FOOD: "douceurs" } as const;
const euro = (cents: number, locale: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", minimumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);

/** La carte, gérée dans l'admin (catégories, produits, prix, suppléments) en FR / DE / EN. */
export default async function MenuPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("menuPage");
  const lang = await getLocale();
  const [categories, extras] = await Promise.all([
    prisma.menuCategory.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      include: { items: { where: { available: true }, orderBy: { order: "asc" } } },
    }),
    prisma.menuExtra.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
  ]);
  const sections = SECTIONS.map((s) => ({ s, cats: categories.filter((c) => c.section === s && c.items.length) })).filter((x) => x.cats.length);

  return (
    <div className="bg-grain bg-ink text-ivory">
      <header className="px-5 pt-36 pb-12 text-center sm:pt-44">
        <Ornament className="mx-auto text-champagne" />
        <h1 className="mt-6 text-[clamp(3.4rem,10vw,7rem)] leading-none">{t("title")}</h1>
      </header>

      {sections.length > 0 && (
        <nav aria-label={t("title")} className="sticky top-18 z-30 border-y border-ivory/10 bg-ink/90 backdrop-blur-md sm:top-20">
          <ul className="flex justify-center gap-8 py-4 text-[0.68rem] tracking-[0.3em] uppercase sm:gap-14">
            {sections.map(({ s }) => (
              <li key={s}><a href={`#${ANCHOR[s]}`} className="text-ivory/75 transition-colors hover:text-champagne">{t(`sec_${s}`)}</a></li>
            ))}
          </ul>
        </nav>
      )}

      <div className="container-page max-w-5xl pb-24">
        {sections.length === 0 && <p className="py-24 text-center text-ivory/70">{t("empty")}</p>}
        {sections.map(({ s, cats }) => (
          <section key={s} id={ANCHOR[s]} className="scroll-mt-40 pt-20 sm:pt-28" aria-labelledby={`h-${ANCHOR[s]}`}>
            <Reveal className="text-center">
              <h2 id={`h-${ANCHOR[s]}`} className="text-[clamp(2.6rem,6vw,4.4rem)] leading-none">{t(`sec_${s}`)}</h2>
              <Ornament className="mx-auto mt-6 text-champagne" />
            </Reveal>
            {cats.map((c) => (
              <div key={c.id} className="mt-16">
                <Reveal className="text-center">
                  <h3 className="text-[0.72rem] font-sans font-medium tracking-[0.4em] text-champagne uppercase">{tr(c.name, lang)}</h3>
                  {c.description && <p className="mx-auto mt-3 max-w-md font-accent text-lg text-ivory/70 italic">{tr(c.description, lang)}</p>}
                </Reveal>
                <ul className="mt-10 grid gap-x-16 gap-y-8 md:grid-cols-2">
                  {c.items.map((it) => (
                    <li key={it.id}>
                      <div className="flex items-baseline gap-3">
                        <span className="font-display text-[1.45rem] leading-tight">{tr(it.name, lang)}</span>
                        <span aria-hidden className="min-w-6 flex-1 translate-y-[-0.3em] border-b border-dotted border-ivory/30" />
                        <span className="text-[0.95rem] tabular-nums text-champagne">{euro(it.priceCents, lang)}</span>
                      </div>
                      {(it.description || it.tags.length > 0) && (
                        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ivory/60">
                          {it.description && <span>{tr(it.description, lang)}</span>}
                          {it.tags.filter((g) => ["signature", "new", "popular", "premium"].includes(g)).map((g) => (
                            <span key={g} className="border border-champagne/40 px-1.5 py-0.5 text-[0.55rem] tracking-[0.2em] text-champagne uppercase">{t(`tag_${g}`)}</span>
                          ))}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {extras.some((e) => e.section === s) && (
              <div className="mx-auto mt-14 max-w-xl border border-ivory/10 px-6 py-6 text-center">
                <h3 className="text-[0.68rem] tracking-[0.35em] text-champagne uppercase">{t("extras")}</h3>
                <ul className="mt-4 space-y-2 text-sm">
                  {extras.filter((e) => e.section === s).map((e) => (
                    <li key={e.id} className="flex justify-between gap-6"><span>{tr(e.name, lang)}</span><span className="tabular-nums text-champagne">+ {euro(e.priceCents, lang)}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}

        <div className="mt-24 text-center">
          <p className="text-xs text-ivory/50">{t("note")}</p>
          <Button asChild size="lux" variant="light" className="mt-8"><Link href="/reservation">{t("book")}</Link></Button>
        </div>
      </div>
    </div>
  );
}
