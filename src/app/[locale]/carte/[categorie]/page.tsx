import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { CategoryNav, MenuBadge, MenuBand, RuleTitle } from "@/components/menu/menu-chrome";
import { getMenu, euro } from "@/lib/menu";
import { tr } from "@/lib/localized";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; categorie: string }> }): Promise<Metadata> {
  const { locale, categorie } = await params;
  const c = (await getMenu()).find((x) => x.slug === categorie);
  return { title: c ? tr(c.name, locale) : "" };
}

/**
 * Une catégorie de la carte, dans l'esprit de l'accueil de la carte : bandeau photo en biais,
 * carré ivoire avec le pictogramme, ronds pour passer d'une catégorie à l'autre, puis les produits.
 */
export default async function MenuCategoryPage({ params }: { params: Promise<{ locale: string; categorie: string }> }) {
  const { locale, categorie } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("menuPage");
  const lang = await getLocale();
  const cats = await getMenu();
  const c = cats.find((x) => x.slug === categorie);
  if (!c) notFound();
  const shisha = c.section === "SHISHA";
  const cover = c.items.find((i) => i.imageUrl)?.imageUrl ?? c.imageUrl;

  return (
    <div className="min-h-dvh bg-ivory text-ink">
      <MenuBand src={cover} className="h-[44vh] min-h-[300px]">
        <nav aria-label="Fil d'Ariane" className="container-page pt-24 sm:pt-28">
          <ol className="flex items-center gap-2 text-[0.65rem] tracking-[0.25em] text-ivory/80 uppercase">
            <li><Link href="/carte" className="hover:text-ivory">{t("title")}</Link></li>
            <li aria-hidden><ChevronRight className="size-3" /></li>
            <li aria-current="page" className="text-ivory">{tr(c.name, lang)}</li>
          </ol>
        </nav>
      </MenuBand>
      <MenuBadge section={c.section} label="GOIA" />

      <header style={{ animationDelay: "0.1s" }} className="enter-rise mt-8 px-5 text-center">
        <h1 className="text-[clamp(2.8rem,8vw,4.6rem)] leading-none">{tr(c.name, lang)}</h1>
        <RuleTitle className="mt-5">{shisha ? t("flavours") : `${c.items.length} ${t("items")}`}</RuleTitle>
      </header>

      <div style={{ animationDelay: "0.2s" }} className="enter-rise mt-10">
        <CategoryNav cats={cats.map((x) => ({ id: x.id, slug: x.slug, section: x.section, label: tr(x.name, lang) }))} activeId={c.id} />
      </div>

      {/* Produits : photo pleine, numéro, nom et prix sur l'image ; ils arrivent l'un après l'autre */}
      <ul className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-3 px-4 sm:gap-6 sm:px-8 md:grid-cols-3">
        {c.items.map((it, i) => (
          <li key={it.id} style={{ animationDelay: `${0.3 + i * 0.09}s` }} className="enter-rise">
            <Link
              href={`/carte/${c.slug}/${it.slug}`}
              className="group relative block overflow-hidden rounded-[1.4rem] bg-ink text-ivory shadow-soft transition-[transform,box-shadow] duration-500 ease-[var(--ease-lux)] hover:-translate-y-1.5 hover:shadow-lift"
            >
              <div className={`relative ${shisha ? "aspect-[2/3]" : "aspect-[4/5]"}`}>
                {it.imageUrl ? (
                  <Image src={it.imageUrl} alt={tr(it.name, lang)} fill sizes="(min-width: 768px) 320px, 50vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-lux)] group-hover:scale-[1.07]" />
                ) : (
                  <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_50%_40%,#2a211b,#1b1511_70%)]"><Logo className="w-1/2 text-champagne/30" /></div>
                )}
                <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink via-ink/55 to-transparent" />
                <div aria-hidden className="absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_40%,rgb(255_255_255/0.14)_50%,transparent_60%)] transition-transform duration-[1.1s] ease-[var(--ease-lux)] group-hover:translate-x-full" />
                {/* Cadre doré intérieur qui apparaît au survol */}
                <div aria-hidden className="absolute inset-2.5 rounded-[1rem] border border-champagne/0 transition-colors duration-500 group-hover:border-champagne/60" />
                <span className="absolute top-3.5 right-4 font-display text-sm text-ivory/70">{String(i + 1).padStart(2, "0")}</span>
                {it.tags.includes("bestseller") && (
                  <span className="absolute top-3 left-3 rounded-full bg-champagne px-2.5 py-1 text-[0.55rem] font-medium tracking-[0.2em] text-ink uppercase">{t("tag_bestseller")}</span>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5 sm:p-5">
                <div>
                  <h2 className="font-display text-[1.25rem] leading-tight sm:text-[1.6rem]">{tr(it.name, lang)}</h2>
                  {it.priceCents != null && <p className="mt-1 text-sm tabular-nums text-champagne sm:text-base">{euro(it.priceCents, lang)}</p>}
                </div>
                <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full border border-ivory/30 text-sm transition-all duration-500 group-hover:border-champagne group-hover:bg-champagne group-hover:text-ink sm:size-10">→</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mx-5 mt-16 rounded-full bg-white/70 px-5 py-2.5 text-center text-xs text-ink/70 shadow-soft sm:mx-auto sm:w-fit">{t("note")}</p>
      <div className="grid justify-center gap-3 pt-10 pb-24 sm:flex">
        <Button asChild size="lux"><Link href="/reservation">{t("book")}</Link></Button>
        <Button asChild size="lux" variant="outline"><Link href="/carte">← {t("all")}</Link></Button>
      </div>
    </div>
  );
}
