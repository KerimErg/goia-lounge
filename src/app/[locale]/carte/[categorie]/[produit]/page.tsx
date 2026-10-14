import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { getMenu, euro } from "@/lib/menu";
import { tr } from "@/lib/localized";

export const revalidate = 300;

const TAGS = ["bestseller", "premium", "classique", "signature", "new"];

async function find(categorie: string, produit: string) {
  const c = (await getMenu()).find((x) => x.slug === categorie);
  const it = c?.items.find((i) => i.slug === produit);
  return c && it ? { c, it } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; categorie: string; produit: string }> }): Promise<Metadata> {
  const { locale, categorie, produit } = await params;
  const f = await find(categorie, produit);
  return { title: f ? tr(f.it.name, locale) : "" };
}

/** Fiche produit : grande photo, nom et prix encadrés de deux filets, description, ingrédients. */
export default async function MenuItemPage({ params }: { params: Promise<{ locale: string; categorie: string; produit: string }> }) {
  const { locale, categorie, produit } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("menuPage");
  const lang = await getLocale();
  const f = await find(categorie, produit);
  if (!f) notFound();
  const { c, it } = f;
  const tags = it.tags.filter((g) => TAGS.includes(g)).map((g) => t(`tag_${g}`));
  const idx = c.items.findIndex((x) => x.id === it.id);
  const next = c.items[(idx + 1) % c.items.length];

  const rule = (flip?: boolean) => (
    <svg viewBox="0 0 240 12" className="mx-auto h-3 w-60 text-ink" aria-hidden>
      <path d={flip ? "M0 2h112l8 8 8-8h112" : "M0 10h112l8-8 8 8h112"} fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );

  return (
    <div className="min-h-dvh bg-ivory pt-18 text-ink sm:pt-20">
      <nav aria-label="Fil d'Ariane" className="bg-linen">
        <ol className="container-page flex flex-wrap items-center gap-2 py-3.5 text-xs tracking-[0.15em] uppercase">
          <li><Link href="/carte" className="text-taupe-deep hover:text-ink">{t("title")}</Link></li>
          <li aria-hidden><ChevronRight className="size-3 text-taupe" /></li>
          <li><Link href={`/carte/${c.slug}`} className="text-taupe-deep hover:text-ink">{tr(c.name, lang)}</Link></li>
          <li aria-hidden><ChevronRight className="size-3 text-taupe" /></li>
          <li aria-current="page" className="normal-case tracking-normal">{tr(it.name, lang)}</li>
        </ol>
      </nav>

      <div className="mx-auto max-w-3xl">
        <div className={`relative bg-ink sm:mt-8 sm:overflow-hidden sm:rounded-2xl ${c.section === "SHISHA" ? "aspect-[4/5] sm:mx-auto sm:max-w-md" : "aspect-[4/3]"}`}>
          {it.imageUrl ? (
            <Image src={it.imageUrl} alt={tr(it.name, lang)} fill priority sizes="(min-width: 768px) 768px, 100vw" className={`object-cover ${c.section === "SHISHA" ? "object-top" : ""}`} />
          ) : (
            <div className="grid size-full place-items-center"><Logo className="w-1/3 text-ivory/25" /></div>
          )}
        </div>

        <div className="px-6 pt-10 pb-6 text-center">
          {rule()}
          <h1 className="mt-5 text-[clamp(2.2rem,6vw,3.2rem)] leading-tight">{tr(it.name, lang)}</h1>
          {it.priceCents != null && <p className="mt-2 text-2xl tabular-nums text-taupe-deep">{euro(it.priceCents, lang)}</p>}
          <div className="mt-5">{rule(true)}</div>
        </div>

        <div className="mx-auto max-w-xl px-6 pb-10 text-center">
          {(tags.length > 0 || it.subtitle) && (
            <p className="text-xs tracking-[0.2em] text-taupe-deep uppercase">{[...tags, it.subtitle ? tr(it.subtitle, lang) : ""].filter(Boolean).join(" · ")}</p>
          )}
          {it.description && <p className="mt-4 text-lg leading-relaxed text-ink/80">{tr(it.description, lang)}</p>}
          {it.ingredients && (
            <div className="mt-6 rounded-2xl bg-white px-5 py-4 shadow-soft">
              <p className="text-[0.62rem] font-medium tracking-[0.3em] text-taupe-deep uppercase">{t("ingredients")}</p>
              <p className="mt-1.5 text-ink/75">{tr(it.ingredients, lang)}</p>
            </div>
          )}
          <div className="mt-10 grid gap-3 sm:flex sm:justify-center">
            <Button asChild size="lux" variant="outline"><Link href={`/carte/${c.slug}`}>← {tr(c.name, lang)}</Link></Button>
            {next && next.id !== it.id && (
              <Button asChild size="lux"><Link href={`/carte/${c.slug}/${next.slug}`}>{tr(next.name, lang)} →</Link></Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
