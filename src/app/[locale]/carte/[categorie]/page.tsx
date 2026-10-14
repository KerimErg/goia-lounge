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

      <h1 className="pt-10 text-center text-[clamp(2.6rem,7vw,4rem)] leading-none">{tr(c.name, lang)}</h1>

      {/* Autres catégories */}
      <ul className="mt-6 flex justify-center gap-2 px-5">
        {cats.map((x) => (
          <li key={x.id}>
            <Link href={`/carte/${x.slug}`} className={x.id === c.id ? "block rounded-full bg-ink px-4 py-1.5 text-xs tracking-[0.15em] text-ivory uppercase" : "block rounded-full border border-ink/15 px-4 py-1.5 text-xs tracking-[0.15em] uppercase hover:border-ink"}>
              {tr(x.name, lang)}
            </Link>
          </li>
        ))}
      </ul>

      <ul className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-3 px-4 pb-24 sm:gap-5 sm:px-8 md:grid-cols-3">
        {c.items.map((it) => (
          <li key={it.id}>
            <Link href={`/carte/${c.slug}/${it.slug}`} className="group block overflow-hidden rounded-2xl bg-white shadow-soft transition-shadow hover:shadow-lift">
              {/* Chichas : photos verticales (l'appareil en entier) ; boissons et desserts : carré */}
              <div className={`relative overflow-hidden bg-ink ${c.section === "SHISHA" ? "aspect-[3/4]" : "aspect-square"}`}>
                {it.imageUrl ? (
                  <Image src={it.imageUrl} alt={tr(it.name, lang)} fill sizes="(min-width: 768px) 320px, 50vw" className={`object-cover transition-transform duration-700 group-hover:scale-105 ${c.section === "SHISHA" ? "object-top" : ""}`} />
                ) : (
                  <div className="grid size-full place-items-center"><Logo className="w-1/2 text-ivory/25" /></div>
                )}
              </div>
              <div className="px-3 py-4 text-center">
                <h2 className="text-[1.05rem] font-medium leading-snug sm:text-lg">{tr(it.name, lang)}</h2>
                {it.priceCents != null && <p className="mt-1 text-lg tabular-nums text-taupe-deep">{euro(it.priceCents, lang)}</p>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
