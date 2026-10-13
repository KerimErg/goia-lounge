import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { InstagramIcon } from "@/components/brand/icons";
import { Logo } from "@/components/brand/logo";
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
 * La carte, simple et épurée : une ligne par produit (petite photo, nom, description, prix à droite),
 * un onglet par catégorie. Tout est géré dans l'admin.
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
    <div className="bg-ivory text-ink">
      <header className="bg-ink px-5 pt-32 pb-14 text-center text-ivory sm:pt-40">
        <Ornament className="mx-auto text-champagne" />
        <h1 className="mt-6 text-[clamp(3rem,8vw,5.6rem)] leading-none">{t("title")}</h1>
      </header>

      {cats.length === 0 && (
        <div className="px-5 py-24 text-center">
          <p className="mx-auto max-w-md text-ink/75">{t("empty")}</p>
          {instagram && <Button asChild size="lux" className="mt-8"><a href={instagram} target="_blank" rel="noopener"><InstagramIcon className="size-4" />@goia.kehl</a></Button>}
        </div>
      )}

      {cats.length > 0 && (
        <nav aria-label={t("title")} className="sticky top-18 z-30 border-b border-ink/10 bg-ivory/95 backdrop-blur-md sm:top-20">
          <ul className="flex justify-center">
            {cats.map((c) => (
              <li key={c.id}>
                <a href={`#${c.slug}`} className="block px-6 py-4 text-[0.72rem] font-medium tracking-[0.25em] uppercase transition-colors hover:text-taupe-deep">
                  {tr(c.name, lang)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mx-auto w-full max-w-3xl px-5 pb-24 sm:px-8">
        {cats.map((c, ci) => {
          const showExtras = extras.some((e) => e.section === c.section) && cats.findLastIndex((x) => x.section === c.section) === ci;
          return (
            <section key={c.id} id={c.slug} className="scroll-mt-36 pt-14" aria-labelledby={`h-${c.slug}`}>
              <h2 id={`h-${c.slug}`} className="text-[2.6rem] leading-none">{tr(c.name, lang)}</h2>
              {c.description && <p className="mt-2 text-ink/60">{tr(c.description, lang)}</p>}

              <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
                {c.items.map((it) => {
                  const tags = it.tags.filter((g) => TAGS.includes(g)).map((g) => t(`tag_${g}`));
                  return (
                    <li key={it.id} className="flex gap-4 py-5">
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-linen sm:size-24">
                        {it.imageUrl ? (
                          <Image src={it.imageUrl} alt={tr(it.name, lang)} fill sizes="96px" className="object-cover" />
                        ) : (
                          <div className="grid size-full place-items-center"><Logo className="w-3/4 text-taupe/40" /></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-lg font-medium leading-snug">{tr(it.name, lang)}</h3>
                          {it.priceCents != null && <span className="shrink-0 text-lg font-medium tabular-nums">{euro(it.priceCents, lang)}</span>}
                        </div>
                        {(tags.length > 0 || it.subtitle) && (
                          <p className="mt-0.5 text-xs text-taupe-deep">{[...tags, it.subtitle ? tr(it.subtitle, lang) : ""].filter(Boolean).join(" · ")}</p>
                        )}
                        {it.description && <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{tr(it.description, lang)}</p>}
                        {it.ingredients && <p className="mt-1 text-sm leading-relaxed text-ink/50">{tr(it.ingredients, lang)}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {showExtras && (
                <div className="mt-6">
                  <h3 className="text-xs tracking-[0.25em] text-taupe-deep uppercase">{t("extras")}</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {extras.filter((e) => e.section === c.section).map((e) => (
                      <li key={e.id} className="flex justify-between gap-6"><span>{tr(e.name, lang)}</span><span className="tabular-nums">+ {euro(e.priceCents, lang)}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}

        {cats.length > 0 && (
          <div className="mt-16 text-center">
            <p className="text-xs text-ink/55">{t("note")}</p>
            <Button asChild size="lux" className="mt-6"><Link href="/reservation">{t("book")}</Link></Button>
          </div>
        )}
      </div>
    </div>
  );
}
