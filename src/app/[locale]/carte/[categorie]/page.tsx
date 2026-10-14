import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { CategoryIcon } from "@/components/menu/category-icon";
import { Button } from "@/components/ui/button";
import { CategoryNav, MenuBadge, MenuBand, RuleTitle, SubNav } from "@/components/menu/menu-chrome";
import { getMenu, euro, menuSections } from "@/lib/menu";
import { tr } from "@/lib/localized";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; categorie: string }> }): Promise<Metadata> {
  const { locale, categorie } = await params;
  const cats = await getMenu();
  const hub = menuSections(cats).find((g) => g.hub && g.slug === categorie);
  if (hub) return { title: (await getTranslations({ locale, namespace: "menuPage" }))(`sec_${hub.section}`) };
  const c = cats.find((x) => x.slug === categorie);
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
  const groups = menuSections(cats);
  const label = (g: (typeof groups)[number]) => (g.hub ? t(`sec_${g.section}`) : tr(g.cats[0].name, lang));
  const nav = groups.map((g) => ({ id: g.slug, slug: g.slug, section: g.section, label: label(g) }));

  // Page d'une famille à plusieurs catégories (Boissons) : choisir Boissons froides, chaudes ou Cocktails
  const hub = groups.find((g) => g.hub && g.slug === categorie);
  if (hub) return <HubPage hub={hub} title={label(hub)} nav={nav} lang={lang} t={t} />;

  const c = cats.find((x) => x.slug === categorie);
  if (!c) notFound();
  const group = groups.find((g) => g.section === c.section)!;
  const shisha = c.section === "SHISHA";
  const cover = c.items.find((i) => i.imageUrl)?.imageUrl ?? c.imageUrl;

  return (
    <div className="min-h-dvh bg-ivory text-ink">
      <MenuBand src={cover} className="h-[44vh] min-h-[300px]">
        <nav aria-label="Fil d'Ariane" className="container-page pt-24 sm:pt-28">
          <ol className="flex items-center gap-2 text-[0.65rem] tracking-[0.25em] text-ivory/80 uppercase">
            <li><Link href="/carte" className="hover:text-ivory">{t("title")}</Link></li>
            <li aria-hidden><ChevronRight className="size-3" /></li>
            {group.hub && (
              <>
                <li><Link href={`/carte/${group.slug}`} className="hover:text-ivory">{label(group)}</Link></li>
                <li aria-hidden><ChevronRight className="size-3" /></li>
              </>
            )}
            <li aria-current="page" className="text-ivory">{tr(c.name, lang)}</li>
          </ol>
        </nav>
      </MenuBand>
      <MenuBadge section={c.section} slug={c.slug} label="GOIA" />

      <header style={{ animationDelay: "0.1s" }} className="enter-rise mt-8 px-5 text-center">
        <h1 className="text-[clamp(2.8rem,8vw,4.6rem)] leading-none">{tr(c.name, lang)}</h1>
        <RuleTitle className="mt-5">{shisha ? t("flavours") : `${c.items.length} ${t(c.items.length > 1 ? "items" : "item")}`}</RuleTitle>
      </header>

      <div style={{ animationDelay: "0.2s" }} className="enter-rise mt-10">
        <CategoryNav cats={nav} activeId={group.slug} />
        {group.hub && <div className="mt-7"><SubNav items={group.cats.map((x) => ({ slug: x.slug, label: tr(x.name, lang) }))} activeSlug={c.slug} /></div>}
      </div>

      {/* Produits : photo pleine, numéro, nom et prix sur l'image ; ils arrivent l'un après l'autre */}
      <ul className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-3 px-4 sm:gap-6 sm:px-8 md:grid-cols-3">
        {c.items.map((it, i) => (
          <li key={it.id} style={{ animationDelay: `${0.3 + i * 0.09}s` }} className="enter-rise">
            <Link
              href={`/carte/${c.slug}/${it.slug}`}
              className="group relative block overflow-hidden rounded-[1.4rem] bg-ink text-ivory shadow-soft transition-[transform,box-shadow] duration-500 ease-[var(--ease-lux)] hover:-translate-y-1.5 hover:shadow-lift"
            >
              <div className="relative aspect-[2/3]">
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

      <div className="pt-10 pb-24 text-center">
        <Button asChild size="lux" variant="outline"><Link href="/carte">← {t("all")}</Link></Button>
      </div>
    </div>
  );
}

type T = Awaited<ReturnType<typeof getTranslations<"menuPage">>>;

/** Famille à plusieurs catégories (ex. Boissons) : une grande carte photo par catégorie. */
function HubPage({ hub, title, nav, lang, t }: {
  hub: ReturnType<typeof menuSections>[number];
  title: string;
  nav: { id: string; slug: string; section: ReturnType<typeof menuSections>[number]["section"]; label: string }[];
  lang: string;
  t: T;
}) {
  const cover = (c: (typeof hub.cats)[number]) => c.items.find((i) => i.imageUrl)?.imageUrl ?? c.imageUrl;
  return (
    <div className="min-h-dvh bg-ivory text-ink">
      <MenuBand src={cover(hub.cats[hub.cats.length - 1])} className="h-[44vh] min-h-[300px]">
        <nav aria-label="Fil d'Ariane" className="container-page pt-24 sm:pt-28">
          <ol className="flex items-center gap-2 text-[0.65rem] tracking-[0.25em] text-ivory/80 uppercase">
            <li><Link href="/carte" className="hover:text-ivory">{t("title")}</Link></li>
            <li aria-hidden><ChevronRight className="size-3" /></li>
            <li aria-current="page" className="text-ivory">{title}</li>
          </ol>
        </nav>
      </MenuBand>
      <MenuBadge section={hub.section} slug={hub.slug} label="GOIA" />

      <header style={{ animationDelay: "0.1s" }} className="enter-rise mt-8 px-5 text-center">
        <h1 className="text-[clamp(2.8rem,8vw,4.6rem)] leading-none">{title}</h1>
        <RuleTitle className="mt-5">{hub.cats.map((c) => tr(c.name, lang)).join(" · ")}</RuleTitle>
      </header>

      <div style={{ animationDelay: "0.2s" }} className="enter-rise mt-10">
        <CategoryNav cats={nav} activeId={hub.slug} />
      </div>

      <ul className="mx-auto mt-14 grid max-w-5xl gap-4 px-4 sm:grid-cols-3 sm:gap-6 sm:px-8">
        {hub.cats.map((c, i) => (
          <li key={c.id} style={{ animationDelay: `${0.3 + i * 0.1}s` }} className="enter-rise">
            <Link href={`/carte/${c.slug}`} className="group relative block overflow-hidden rounded-[1.6rem] bg-ink text-ivory shadow-soft transition-[transform,box-shadow] duration-500 ease-[var(--ease-lux)] hover:-translate-y-1.5 hover:shadow-lift">
              <div className="relative aspect-[4/3] sm:aspect-[2/3]">
                {cover(c) ? (
                  <Image src={cover(c)!} alt="" fill sizes="(min-width: 640px) 330px, 100vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-lux)] group-hover:scale-[1.07]" />
                ) : (
                  <div className="grid size-full place-items-center"><Logo className="w-1/2 text-champagne/30" /></div>
                )}
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                <div aria-hidden className="absolute inset-3 rounded-[1.2rem] border border-champagne/0 transition-colors duration-500 group-hover:border-champagne/60" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 sm:p-6">
                <div>
                  <span className="mb-3 grid size-11 place-items-center rounded-full bg-ink/70 text-champagne ring-1 ring-champagne/40 backdrop-blur">
                    <CategoryIconSmall section={c.section} slug={c.slug} />
                  </span>
                  <h2 className="font-display text-[1.9rem] leading-none sm:text-[2.1rem]">{tr(c.name, lang)}</h2>
                  <p className="mt-2 text-xs tracking-[0.2em] text-champagne uppercase">{c.items.length} {t(c.items.length > 1 ? "items" : "item")}</p>
                </div>
                <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full border border-ivory/30 transition-all duration-500 group-hover:border-champagne group-hover:bg-champagne group-hover:text-ink">→</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="pt-12 pb-24 text-center">
        <Button asChild size="lux" variant="outline"><Link href="/carte">← {t("all")}</Link></Button>
      </div>
    </div>
  );
}

function CategoryIconSmall(props: { section: ReturnType<typeof menuSections>[number]["section"]; slug: string }) {
  return <CategoryIcon {...props} className="size-6" />;
}
