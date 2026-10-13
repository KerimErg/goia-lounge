import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { InstagramIcon } from "@/components/brand/icons";
import { Ornament } from "@/components/ornament";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { tr } from "@/lib/localized";
import { contactLinks, getVenue } from "@/lib/venue";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "menuPage" });
  return { title: t("title") };
}

const euro = (cents: number, locale: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", minimumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
const TAGS = ["bestseller", "premium", "classique", "signature", "new"];

/**
 * La carte, comme une carte imprimée sur papier ivoire : photos en arche (le motif des niches
 * du lounge), prix sur filet pointillé, ingrédients en italique. Tout est géré dans l'admin.
 */
export default async function MenuPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("menuPage");
  const lang = await getLocale();
  const [categories, extras, venue] = await Promise.all([
    prisma.menuCategory.findMany({
      where: { active: true },
      orderBy: [{ section: "asc" }, { order: "asc" }],
      include: { items: { where: { available: true }, orderBy: { order: "asc" } } },
    }),
    prisma.menuExtra.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    getVenue(),
  ]);
  const cats = categories.filter((c) => c.items.length);
  const { instagram } = contactLinks(venue.settings);

  return (
    <div className="bg-grain bg-ivory text-ink">
      <header className="px-5 pt-32 pb-10 text-center sm:pt-40">
        <p className="eyebrow text-taupe-deep">GOIA · Huqqa Lounge</p>
        <h1 className="mt-5 text-[clamp(3.4rem,10vw,7rem)] leading-none">{t("title")}</h1>
        <Ornament className="mx-auto mt-6 text-apricot-deep" />
      </header>

      {cats.length === 0 && (
        <div className="px-5 pb-24 text-center">
          <p className="mx-auto max-w-md text-ink/75">{t("empty")}</p>
          {instagram && <Button asChild size="lux" className="mt-8"><a href={instagram} target="_blank" rel="noopener"><InstagramIcon className="size-4" />@goia.kehl</a></Button>}
        </div>
      )}

      {cats.length > 0 && (
        <nav aria-label={t("title")} className="sticky top-18 z-30 border-y border-ink/10 bg-ivory/95 backdrop-blur-md sm:top-20">
          <ul className="flex justify-center gap-2 py-3 sm:gap-4">
            {cats.map((c) => (
              <li key={c.id}>
                <a href={`#${c.slug}`} className="block px-4 py-2 font-display text-2xl transition-colors hover:text-apricot-deep sm:text-3xl">{tr(c.name, lang)}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="container-page max-w-5xl pb-24">
        {cats.map((c, ci) => {
          const showExtras = extras.some((e) => e.section === c.section) && cats.findLastIndex((x) => x.section === c.section) === ci;
          return (
            <section key={c.id} id={c.slug} className="scroll-mt-40 pt-16 sm:pt-24" aria-labelledby={`h-${c.slug}`}>
              <div className="flex items-end justify-between gap-6 border-b border-ink/15 pb-5">
                <h2 id={`h-${c.slug}`} className="text-[clamp(2.8rem,7vw,4.8rem)] leading-none">{tr(c.name, lang)}</h2>
                <p className="pb-2 font-accent text-lg text-taupe-deep italic">{c.items.length} {t("items")}</p>
              </div>
              {c.description && <p className="mt-4 max-w-xl font-accent text-xl text-ink/70 italic">{tr(c.description, lang)}</p>}

              <ul className="mt-10 grid gap-x-14 gap-y-12 md:grid-cols-2">
                {c.items.map((it) => {
                  const tags = it.tags.filter((g) => TAGS.includes(g));
                  return (
                    <li key={it.id} className="group grid grid-cols-[6.5rem_1fr] gap-5 sm:grid-cols-[8.5rem_1fr]">
                      {it.imageUrl ? (
                        <div className="arch relative aspect-[3/4] overflow-hidden bg-marble shadow-soft">
                          <Image src={it.imageUrl} alt={tr(it.name, lang)} fill sizes="136px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                      ) : (
                        <div aria-hidden className="arch flex aspect-[3/4] items-end justify-center border border-ink/15 pb-4">
                          <Ornament className="w-14 text-taupe" />
                        </div>
                      )}
                      <div className="min-w-0 pt-2">
                        <div className="flex items-baseline gap-3">
                          <h3 className="font-display text-[1.75rem] leading-tight">{tr(it.name, lang)}</h3>
                          <span aria-hidden className="min-w-4 flex-1 translate-y-[-0.35em] border-b border-dotted border-ink/30" />
                          {it.priceCents != null && <span className="font-display text-2xl tabular-nums text-apricot-deep">{euro(it.priceCents, lang)}</span>}
                        </div>
                        {(tags.length > 0 || it.subtitle) && (
                          <p className="mt-1 text-[0.62rem] tracking-[0.25em] text-taupe-deep uppercase">
                            {[...tags.map((g) => t(`tag_${g}`)), it.subtitle ? tr(it.subtitle, lang) : ""].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {it.description && <p className="mt-2.5 leading-relaxed text-ink/75">{tr(it.description, lang)}</p>}
                        {it.ingredients && (
                          <p className="mt-2 font-accent text-[1.05rem] leading-snug text-ink/65 italic">
                            <span className="not-italic text-[0.58rem] tracking-[0.25em] text-apricot-deep uppercase">{t("ingredients")} · </span>
                            {tr(it.ingredients, lang)}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {showExtras && (
                <div className="mt-12 border-t border-ink/15 pt-6">
                  <h3 className="text-[0.66rem] tracking-[0.3em] text-taupe-deep uppercase">{t("extras")}</h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2 sm:gap-x-14">
                    {extras.filter((e) => e.section === c.section).map((e) => (
                      <li key={e.id} className="flex justify-between gap-6"><span>{tr(e.name, lang)}</span><span className="tabular-nums text-apricot-deep">+ {euro(e.priceCents, lang)}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}

        {cats.length > 0 && (
          <div className="mt-24 text-center">
            <p className="text-xs text-ink/55">{t("note")}</p>
            <Button asChild size="lux" className="mt-8"><Link href="/reservation">{t("book")}</Link></Button>
          </div>
        )}
      </div>
    </div>
  );
}
