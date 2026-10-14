import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/menu/category-icon";
import { CategoryNav, RuleTitle } from "@/components/menu/menu-chrome";
import { getMenu, euro, menuSections } from "@/lib/menu";
import { tr } from "@/lib/localized";

// Générée à la visite (pas au déploiement) : toujours à jour avec la carte de l’admin, et une erreur éventuelle
// apparaît en clair dans les journaux Vercel au lieu de bloquer le déploiement.
export const dynamic = "force-dynamic";

const TAGS = ["bestseller", "premium", "classique", "signature", "new"];

async function find(categorie: string, produit: string) {
  const cats = await getMenu();
  const c = cats.find((x) => x.slug === categorie);
  const it = c?.items.find((i) => i.slug === produit);
  return c && it ? { cats, c, it } : null;
}

/** « Rhum, purée de coco et citron vert. » → ["Rhum", "Purée de coco", "Citron vert"] */
const split = (s: string) =>
  s.replace(/\.$/, "").split(/,\s*|\s+(?:et|und|and)\s+/).map((x) => x.trim()).filter(Boolean).map((x) => x[0].toUpperCase() + x.slice(1));

export async function generateMetadata({ params }: { params: Promise<{ locale: string; categorie: string; produit: string }> }): Promise<Metadata> {
  const { locale, categorie, produit } = await params;
  const f = await find(categorie, produit);
  return { title: f ? tr(f.it.name, locale) : "" };
}

/**
 * Fiche produit : sur téléphone, grande photo puis une fiche qui remonte par-dessus (coins arrondis) ;
 * sur ordinateur, photo encadrée d'un filet doré à gauche et fiche à droite. Puis « À découvrir aussi ».
 */
export default async function MenuItemPage({ params }: { params: Promise<{ locale: string; categorie: string; produit: string }> }) {
  const { locale, categorie, produit } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("menuPage");
  const lang = await getLocale();
  const f = await find(categorie, produit);
  if (!f) notFound();
  const { cats, c, it } = f;
  const groups = menuSections(cats);
  const group = groups.find((g) => g.section === c.section)!;
  const label = (g: (typeof groups)[number]) => (g.hub ? t(`sec_${g.section}`) : tr(g.cats[0].name, lang));
  const tags = it.tags.filter((g) => TAGS.includes(g)).map((g) => t(`tag_${g}`));
  const idx = c.items.findIndex((x) => x.id === it.id);
  const prev = c.items[(idx - 1 + c.items.length) % c.items.length];
  const next = c.items[(idx + 1) % c.items.length];
  const others = c.items.filter((x) => x.id !== it.id);
  const ingredients = it.ingredients ? split(tr(it.ingredients, lang)) : [];

  return (
    <div className="min-h-dvh bg-ivory pt-18 text-ink sm:pt-20">
      <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-2 lg:items-start lg:gap-16 lg:px-10 lg:pt-12">
        {/* Photo */}
        <div className="relative lg:sticky lg:top-28">
          <div className={`enter-rise relative overflow-hidden bg-ink lg:rounded-[2rem] lg:outline lg:outline-1 lg:outline-offset-[12px] lg:outline-champagne/60 aspect-[4/5] lg:aspect-[2/3]`}>
            {it.imageUrl ? (
              <Image src={it.imageUrl} alt={tr(it.name, lang)} fill priority sizes="(min-width: 1024px) 560px, 100vw" className="animate-[slowzoom_18s_ease-in-out_infinite_alternate] object-cover motion-reduce:animate-none" />
            ) : (
              <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_50%_40%,#2a211b,#1b1511_70%)]"><Logo className="w-1/3 text-champagne/30" /></div>
            )}
            <div aria-hidden className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/60 to-transparent lg:hidden" />
          </div>
          {/* Retour + pictogramme, posés sur la photo (téléphone) */}
          <Link href={`/carte/${c.slug}`} aria-label={tr(c.name, lang)} className="absolute top-4 left-4 grid size-11 place-items-center rounded-full bg-ivory/90 text-ink shadow-soft backdrop-blur transition-colors hover:bg-ivory lg:hidden">
            <ArrowLeft className="size-4" />
          </Link>
          <span aria-hidden className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-ink/80 text-champagne backdrop-blur lg:top-6 lg:right-6 lg:size-14">
            <CategoryIcon section={c.section} slug={c.slug} className="size-6 lg:size-7" />
          </span>
        </div>

        {/* Fiche */}
        <div style={{ animationDelay: "0.12s" }} className="enter-rise relative z-10 -mt-8 rounded-t-[2rem] bg-ivory px-6 pt-9 pb-4 sm:px-10 lg:mt-0 lg:rounded-none lg:px-0 lg:pt-2">
          <nav aria-label="Fil d'Ariane" className="hidden lg:block">
            <ol className="flex items-center gap-2 text-[0.62rem] tracking-[0.25em] text-taupe-deep uppercase">
              <li><Link href="/carte" className="hover:text-ink">{t("title")}</Link></li>
              <li aria-hidden><ChevronRight className="size-3" /></li>
              {group.hub && (
                <>
                  <li><Link href={`/carte/${group.slug}`} className="hover:text-ink">{label(group)}</Link></li>
                  <li aria-hidden><ChevronRight className="size-3" /></li>
                </>
              )}
              <li><Link href={`/carte/${c.slug}`} className="hover:text-ink">{tr(c.name, lang)}</Link></li>
            </ol>
          </nav>

          <p className="eyebrow flex items-center gap-3 text-[0.6rem] text-taupe-deep lg:mt-10">
            <span className="h-px w-8 bg-champagne" aria-hidden />{tr(c.name, lang)} · {String(idx + 1).padStart(2, "0")}/{String(c.items.length).padStart(2, "0")}
          </p>
          <h1 className="mt-4 text-[clamp(2.6rem,6vw,4.4rem)] leading-[0.98]">{tr(it.name, lang)}</h1>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            {it.priceCents != null && (
              <span className="rounded-full bg-ink px-4 py-1.5 text-lg tabular-nums text-champagne">{euro(it.priceCents, lang)}</span>
            )}
            {tags.map((g) => (
              <span key={g} className="rounded-full border border-champagne px-3 py-1 text-[0.6rem] font-medium tracking-[0.22em] text-taupe-deep uppercase">{g}</span>
            ))}
          </div>

          {it.subtitle && <p className="mt-6 font-accent text-xl text-taupe-deep italic">{tr(it.subtitle, lang)}</p>}
          {it.description && <p className="mt-5 max-w-lg text-[1.05rem] leading-[1.8] text-ink/75">{tr(it.description, lang)}</p>}

          {ingredients.length > 0 && (
            <div className="mt-9">
              <p className="eyebrow text-[0.58rem] text-taupe-deep">{t("ingredients")}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {ingredients.map((x) => (
                  <li key={x} className="rounded-full bg-white px-3.5 py-1.5 text-sm text-ink/80 shadow-soft">{x}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10 hidden lg:block">
            <Button asChild size="lux" variant="outline"><Link href={`/carte/${c.slug}`}>← {tr(c.name, lang)}</Link></Button>
          </div>

          {/* Précédent / suivant */}
          {c.items.length > 1 && (
            <div className="mt-10 grid grid-cols-2 border-y border-ink/10">
              <Link href={`/carte/${c.slug}/${prev.slug}`} className="group border-r border-ink/10 py-4 pr-4">
                <span className="eyebrow text-[0.55rem] text-taupe">← {t("prev")}</span>
                <span className="mt-1 block font-display text-lg leading-tight transition-colors group-hover:text-taupe-deep">{tr(prev.name, lang)}</span>
              </Link>
              <Link href={`/carte/${c.slug}/${next.slug}`} className="group py-4 pl-4 text-right">
                <span className="eyebrow text-[0.55rem] text-taupe">{t("next")} →</span>
                <span className="mt-1 block font-display text-lg leading-tight transition-colors group-hover:text-taupe-deep">{tr(next.name, lang)}</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* À découvrir aussi */}
      {others.length > 0 && (
        <section className="mt-20 pb-6" aria-labelledby="more-title">
          <RuleTitle><span id="more-title">{t("more")}</span></RuleTitle>
          <ul className="mx-auto mt-8 flex max-w-6xl snap-x gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] lg:px-10">
            {others.map((o) => (
              <li key={o.id} className="w-40 shrink-0 snap-start sm:w-48">
                <Link href={`/carte/${c.slug}/${o.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.2rem] bg-ink">
                    {o.imageUrl ? (
                      <Image src={o.imageUrl} alt="" fill sizes="200px" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-lux)] group-hover:scale-[1.07]" />
                    ) : (
                      <div className="grid size-full place-items-center"><Logo className="w-1/2 text-champagne/30" /></div>
                    )}
                  </div>
                  <p className="mt-3 font-display text-lg leading-tight">{tr(o.name, lang)}</p>
                  {o.priceCents != null && <p className="text-sm tabular-nums text-taupe-deep">{euro(o.priceCents, lang)}</p>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="pt-12 pb-24">
        <CategoryNav cats={groups.map((g) => ({ id: g.slug, slug: g.slug, section: g.section, label: label(g) }))} activeId={group.slug} />
      </div>
    </div>
  );
}
