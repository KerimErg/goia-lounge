import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { InstagramIcon } from "@/components/brand/icons";
import { contactLinks, getVenue } from "@/lib/venue";
import { Ornament } from "@/components/ornament";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { tr } from "@/lib/localized";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "menuPage" });
  return { title: t("title") };
}

const euro = (cents: number, locale: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", minimumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
const TAGS = ["signature", "new", "popular", "premium"];

/**
 * La carte, façon menu QR : catégories en photo, puis chaque produit avec sa photo,
 * sa description et son prix. Tout est géré dans l'admin (FR / DE / EN).
 */
export default async function MenuPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("menuPage");
  const lang = await getLocale();
  const [categories, extras] = await Promise.all([
    prisma.menuCategory.findMany({
      where: { active: true },
      orderBy: [{ section: "asc" }, { order: "asc" }],
      include: { items: { where: { available: true }, orderBy: { order: "asc" } } },
    }),
    prisma.menuExtra.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
  ]);
  const cats = categories.filter((c) => c.items.length);
  const { instagram } = contactLinks((await getVenue()).settings);

  return (
    <div className="bg-grain bg-ink text-ivory">
      <header className="px-5 pt-32 pb-10 text-center sm:pt-40">
        <Ornament className="mx-auto text-champagne" />
        <h1 className="mt-6 text-[clamp(3.2rem,9vw,6.4rem)] leading-none">{t("title")}</h1>
      </header>

      {cats.length === 0 && (
        <div className="px-5 pb-24 text-center">
          <p className="mx-auto max-w-md text-ivory/75">{t("empty")}</p>
          {instagram && (
            <Button asChild size="lux" variant="light" className="mt-8"><a href={instagram} target="_blank" rel="noopener"><InstagramIcon className="size-4" />@goia.kehl</a></Button>
          )}
        </div>
      )}

      {/* Catégories en photo */}
      <div className="container-page max-w-6xl">
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {cats.map((c) => (
            <li key={c.id}>
              <a href={`#${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-ink-soft">
                {c.imageUrl ? (
                  <Image src={c.imageUrl} alt="" fill sizes="(min-width: 768px) 280px, 50vw" className="object-cover opacity-80 transition-[transform,opacity] duration-700 group-hover:scale-105 group-hover:opacity-100" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-taupe"><Logo className="w-1/2 text-ivory/40" /></div>
                )}
                <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgb(27_21_17/0.9),transparent_60%)]" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className="font-display text-2xl leading-tight sm:text-3xl">{tr(c.name, lang)}</p>
                  <p className="mt-1 text-[0.62rem] tracking-[0.25em] text-champagne uppercase">{c.items.length} {t("items")}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Barre de catégories (reste visible) */}
      {cats.length > 0 && (
        <nav aria-label={t("title")} className="sticky top-18 z-30 mt-14 border-y border-ivory/10 bg-ink/95 backdrop-blur-md sm:top-20">
          <ul className="container-page flex gap-6 overflow-x-auto py-4 text-[0.66rem] tracking-[0.25em] whitespace-nowrap uppercase [scrollbar-width:none] sm:justify-center sm:gap-10 [&::-webkit-scrollbar]:hidden">
            {cats.map((c) => (
              <li key={c.id}><a href={`#${c.slug}`} className="text-ivory/75 transition-colors hover:text-champagne">{tr(c.name, lang)}</a></li>
            ))}
          </ul>
        </nav>
      )}

      <div className="container-page max-w-6xl pb-24">
        {cats.map((c, ci) => {
          const showExtras = extras.some((e) => e.section === c.section) && cats.findLastIndex((x) => x.section === c.section) === ci;
          return (
            <section key={c.id} id={c.slug} className="scroll-mt-40 pt-16 sm:pt-20" aria-labelledby={`h-${c.slug}`}>
              <div className="text-center">
                <h2 id={`h-${c.slug}`} className="text-[clamp(2.2rem,5vw,3.4rem)] leading-none">{tr(c.name, lang)}</h2>
                {c.description && <p className="mx-auto mt-3 max-w-md font-accent text-lg text-ivory/70 italic">{tr(c.description, lang)}</p>}
                <Ornament className="mx-auto mt-5 text-champagne" />
              </div>
              <ul className="mt-10 grid gap-3 md:grid-cols-2 md:gap-4">
                {c.items.map((it) => (
                  <li key={it.id} className="flex gap-4 border border-ivory/10 bg-ink-soft/60 p-3 transition-colors hover:border-champagne/40 sm:p-4">
                    <div className="relative size-20 shrink-0 overflow-hidden bg-taupe sm:size-24">
                      {it.imageUrl ? (
                        <Image src={it.imageUrl} alt={tr(it.name, lang)} fill sizes="96px" className="object-cover" />
                      ) : c.imageUrl ? (
                        <Image src={c.imageUrl} alt="" fill sizes="96px" className="object-cover opacity-60" />
                      ) : (
                        <div className="grid size-full place-items-center"><Logo className="w-3/4 text-ivory/50" /></div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-[1.35rem] leading-tight">{tr(it.name, lang)}</h3>
                        <span className="shrink-0 pt-1 text-[0.95rem] tabular-nums text-champagne">{euro(it.priceCents, lang)}</span>
                      </div>
                      {it.description && <p className="mt-1 text-sm leading-snug text-ivory/60">{tr(it.description, lang)}</p>}
                      {it.tags.some((g) => TAGS.includes(g)) && (
                        <p className="mt-auto flex flex-wrap gap-1.5 pt-2">
                          {it.tags.filter((g) => TAGS.includes(g)).map((g) => (
                            <span key={g} className="border border-champagne/40 px-1.5 py-0.5 text-[0.55rem] tracking-[0.2em] text-champagne uppercase">{t(`tag_${g}`)}</span>
                          ))}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              {showExtras && (
                <div className="mx-auto mt-10 max-w-xl border border-ivory/10 px-6 py-6 text-center">
                  <h3 className="text-[0.68rem] tracking-[0.35em] text-champagne uppercase">{t("extras")}</h3>
                  <ul className="mt-4 space-y-2 text-sm">
                    {extras.filter((e) => e.section === c.section).map((e) => (
                      <li key={e.id} className="flex justify-between gap-6"><span>{tr(e.name, lang)}</span><span className="tabular-nums text-champagne">+ {euro(e.priceCents, lang)}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}

        {cats.length > 0 && <div className="mt-24 text-center">
          <p className="text-xs text-ivory/50">{t("note")}</p>
          <Button asChild size="lux" variant="light" className="mt-8"><Link href="/reservation">{t("book")}</Link></Button>
        </div>}
      </div>
    </div>
  );
}
