import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { getMenu, euro } from "@/lib/menu";
import { tr } from "@/lib/localized";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; categorie: string }> }): Promise<Metadata> {
  const { locale, categorie } = await params;
  const c = (await getMenu()).find((x) => x.slug === categorie);
  return { title: c ? tr(c.name, locale) : "" };
}

/** Une catégorie de la carte : grille de produits (photo, nom, prix). */
export default async function MenuCategoryPage({ params }: { params: Promise<{ locale: string; categorie: string }> }) {
  const { locale, categorie } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("menuPage");
  const lang = await getLocale();
  const cats = await getMenu();
  const c = cats.find((x) => x.slug === categorie);
  if (!c) notFound();

  return (
    <div className="min-h-dvh bg-ivory pt-18 text-ink sm:pt-20">
      <nav aria-label="Fil d'Ariane" className="bg-linen">
        <ol className="container-page flex items-center gap-2 py-3.5 text-xs tracking-[0.15em] uppercase">
          <li><Link href="/carte" className="text-taupe-deep hover:text-ink">{t("title")}</Link></li>
          <li aria-hidden><ChevronRight className="size-3 text-taupe" /></li>
          <li aria-current="page">{tr(c.name, lang)}</li>
        </ol>
      </nav>

      <h1 className="enter-rise pt-10 text-center text-[clamp(2.6rem,7vw,4rem)] leading-none">{tr(c.name, lang)}</h1>

      {/* Autres catégories */}
      <ul style={{ animationDelay: "0.1s" }} className="enter-rise mt-6 flex justify-center gap-2 px-5">
        {cats.map((x) => (
          <li key={x.id}>
            <Link href={`/carte/${x.slug}`} className={x.id === c.id ? "block rounded-full bg-ink px-4 py-1.5 text-xs tracking-[0.15em] text-ivory uppercase" : "block rounded-full border border-ink/15 px-4 py-1.5 text-xs tracking-[0.15em] uppercase transition-colors hover:border-ink"}>
              {tr(x.name, lang)}
            </Link>
          </li>
        ))}
      </ul>

      {/* Produits : grandes cartes photo, nom et prix posés sur l'image ; elles arrivent l'une après l'autre */}
      <ul className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-3 px-4 pb-24 sm:gap-6 sm:px-8 md:grid-cols-3">
        {c.items.map((it, i) => (
          <li key={it.id} style={{ animationDelay: `${0.15 + i * 0.09}s` }} className="enter-rise">
            <Link
              href={`/carte/${c.slug}/${it.slug}`}
              className="group relative block overflow-hidden rounded-[1.4rem] bg-ink text-ivory shadow-soft ring-1 ring-ink/5 transition-[transform,box-shadow] duration-500 ease-[var(--ease-lux)] hover:-translate-y-1.5 hover:shadow-lift hover:ring-champagne/50"
            >
              {/* Chichas : photos verticales, l'appareil entier au centre ; boissons et desserts : 4:5 */}
              <div className={`relative ${c.section === "SHISHA" ? "aspect-[2/3]" : "aspect-[4/5]"}`}>
                {it.imageUrl ? (
                  <Image src={it.imageUrl} alt={tr(it.name, lang)} fill sizes="(min-width: 768px) 320px, 50vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-lux)] group-hover:scale-[1.07]" />
                ) : (
                  <div className="grid size-full place-items-center"><Logo className="w-1/2 text-ivory/25" /></div>
                )}
                <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
                {/* Reflet qui traverse la carte au survol */}
                <div aria-hidden className="absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_40%,rgb(255_255_255/0.14)_50%,transparent_60%)] transition-transform duration-[1.1s] ease-[var(--ease-lux)] group-hover:translate-x-full" />
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
    </div>
  );
}
