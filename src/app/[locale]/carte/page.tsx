import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { InstagramIcon } from "@/components/brand/icons";
import { Logo } from "@/components/brand/logo";
import { CategoryIcon } from "@/components/menu/category-icon";
import { Button } from "@/components/ui/button";
import { getMenu } from "@/lib/menu";
import { tr } from "@/lib/localized";
import { contactLinks, getVenue } from "@/lib/venue";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "menuPage" });
  return { title: t("title") };
}

/**
 * Accueil de la carte : bandeau photo, logo au centre, puis un grand bouton rond par catégorie
 * (Chichas, Cocktails, Desserts). Simple à comprendre, d'un seul coup d'œil.
 */
export default async function MenuHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("menuPage");
  const lang = await getLocale();
  const [cats, venue] = await Promise.all([getMenu(), getVenue()]);
  const { instagram } = contactLinks(venue.settings);

  return (
    <div className="min-h-dvh bg-ivory text-ink">
      {/* Bandeau photo coupé en biais */}
      <div className="relative h-[46vh] min-h-[300px] overflow-hidden bg-ink [clip-path:polygon(0_0,100%_0,100%_78%,0_100%)]">
        <Image src="/images/menu/mojito-classic.jpg" alt="" fill priority sizes="100vw" className="object-cover opacity-75" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(27_21_17/0.55),rgb(27_21_17/0.15)_45%,rgb(27_21_17/0.5))]" />
      </div>

      {/* Logo */}
      <div className="relative z-10 -mt-24 flex justify-center px-5 sm:-mt-28">
        <div className="grid size-44 place-items-center rounded-[2.2rem] bg-ivory shadow-lift sm:size-52">
          <div className="text-center">
            <Logo className="mx-auto w-28 text-ink sm:w-32" />
            <p className="eyebrow mt-3 text-[0.5rem] tracking-[0.45em] text-taupe-deep">Huqqa — Lounge</p>
          </div>
        </div>
      </div>

      <h1 className="sr-only">{t("title")}</h1>

      {cats.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <p className="mx-auto max-w-md text-ink/75">{t("empty")}</p>
          {instagram && <Button asChild size="lux" className="mt-8"><a href={instagram} target="_blank" rel="noopener"><InstagramIcon className="size-4" />@goia.kehl</a></Button>}
        </div>
      ) : (
        <ul className="mx-auto mt-14 flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-10 px-5 sm:mt-16 sm:gap-x-14">
          {cats.map((c) => (
            <li key={c.id}>
              <Link href={`/carte/${c.slug}`} className="group flex w-24 flex-col items-center text-center sm:w-36">
                <span className="grid size-24 place-items-center rounded-full border-[3px] border-ink bg-ink text-champagne shadow-lift ring-4 ring-ivory ring-offset-2 ring-offset-ink/15 transition-transform duration-300 group-hover:-translate-y-1 sm:size-32">
                  <CategoryIcon section={c.section} className="size-11 sm:size-14" />
                </span>
                <span className="mt-4 text-[0.72rem] font-medium tracking-[0.25em] uppercase sm:text-sm">{tr(c.name, lang)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mx-5 mt-14 rounded-full bg-white/70 px-5 py-2.5 text-center text-xs text-ink/70 shadow-soft sm:mx-auto sm:w-fit">{t("note")}</p>
      <div className="pt-10 pb-24 text-center">
        <Button asChild size="lux"><Link href="/reservation">{t("book")}</Link></Button>
      </div>
    </div>
  );
}
