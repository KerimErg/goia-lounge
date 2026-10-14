import Image from "next/image";
import type { CSSProperties } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { InstagramIcon } from "@/components/brand/icons";
import { Logo } from "@/components/brand/logo";
import { Words } from "@/components/fx";
import { Ornament } from "@/components/ornament";
import { prisma } from "@/lib/prisma";
import { tr } from "@/lib/localized";

// Photos de la carte, intercalées avec celles du lieu (gérées dans l'admin)
const MENU_SHOTS = [
  { url: "/images/menu/quasar.jpg", alt: "Chicha Quasar" },
  { url: "/images/menu/tiki-mangue.jpg", alt: "Tiki Mangue" },
  { url: "/images/menu/pornstar-martini.jpg", alt: "Pornstar Martini" },
  { url: "/images/menu/mojito-classic.jpg", alt: "Mojito Classic" },
];
// Formats et décalages variés : un défilé vivant plutôt qu'une grille
const SHAPES = ["aspect-[4/5] rounded-t-full", "aspect-square rounded-[2rem] translate-y-[8%]", "aspect-[3/4] rounded-[2rem] -translate-y-[6%]", "aspect-[4/5] rounded-b-full translate-y-[4%]"];

/**
 * Galerie épinglée : pendant que l'on fait défiler la page vers le bas, les photos glissent vers la
 * gauche devant un grand mot en filigrane. Sans défilement animé : bande que l'on fait glisser au doigt.
 */
export async function Gallery({ instagramUrl }: { instagramUrl: string | null }) {
  const t = await getTranslations("gallery");
  const locale = await getLocale();
  const images = await prisma.galleryImage.findMany({ where: { published: true }, orderBy: { order: "asc" }, take: 8 });
  const venue = images.map((img) => ({ url: img.url, alt: tr(img.alt, locale) }));
  const photos = [...venue.flatMap((v, i) => (MENU_SHOTS[i] ? [v, MENU_SHOTS[i]] : [v])), ...MENU_SHOTS.slice(venue.length)];
  const count = photos.length + (instagramUrl ? 1 : 0);

  return (
    <section className="gal relative bg-ivory text-ink" style={{ "--n": count } as CSSProperties} aria-labelledby="gallery-title">
      <div className="gal-sticky py-20">
        {/* Filigrane qui glisse dans l'autre sens */}
        <div aria-hidden data-text="GOIA · Kehl · GOIA · Kehl ·" style={{ "--from": "-5%", "--to": "-55%" } as CSSProperties} className="ghost-text gal-word pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 font-display text-[clamp(8rem,26vw,24rem)] leading-none whitespace-nowrap text-champagne/15" />
        <div className="container-page relative text-center">
          <p className="eyebrow text-taupe-deep">{t("eyebrow")}</p>
          <h2 id="gallery-title" className="mt-4 text-[clamp(2.6rem,5.5vw,4.4rem)] leading-none"><Words text={t("title")} /></h2>
          <Ornament className="mx-auto mt-5 text-champagne" />
        </div>
        <div className="gal-track relative mt-10 items-center sm:mt-14">
          {photos.map((p, i) => (
            <figure key={p.url} className={`relative h-[min(46svh,440px)] shrink-0 overflow-hidden shadow-lift ${SHAPES[i % SHAPES.length]}`}>
              <Image src={p.url} alt={p.alt} fill sizes="(min-width: 768px) 360px, 70vw" className="object-cover" />
            </figure>
          ))}
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener" className="flex aspect-[4/5] h-[min(46svh,440px)] shrink-0 flex-col items-center justify-center gap-3 rounded-[2rem] bg-ink p-8 text-center text-ivory transition-colors hover:bg-taupe-deep">
              <Logo className="w-28" />
              <span className="flex items-center gap-2 text-sm"><InstagramIcon className="size-4" />@goia.kehl</span>
              <span className="eyebrow text-[0.58rem] text-champagne">{t("follow")}</span>
            </a>
          )}
        </div>
        <p className="eyebrow mt-10 text-center text-[0.6rem] text-taupe-deep">{t("hint")} ↓</p>
      </div>
    </section>
  );
}
