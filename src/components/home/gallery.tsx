import Image from "next/image";
import type { CSSProperties } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { InstagramIcon } from "@/components/brand/icons";
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
const SHAPES = ["aspect-[4/5] rounded-t-full", "aspect-square rounded-[2rem]", "aspect-[3/4] rounded-[2rem]", "aspect-[4/5] rounded-b-full"];

/**
 * Galerie : deux rangées de photos qui glissent en sens inverse pendant le défilement
 * (rien n'est épinglé, la page défile normalement), puis le lien Instagram.
 */
export async function Gallery({ instagramUrl }: { instagramUrl: string | null }) {
  const t = await getTranslations("gallery");
  const locale = await getLocale();
  const images = await prisma.galleryImage.findMany({ where: { published: true }, orderBy: { order: "asc" }, take: 8 });
  const venue = images.map((img) => ({ url: img.url, alt: tr(img.alt, locale) }));
  const photos = [...venue.flatMap((v, i) => (MENU_SHOTS[i] ? [v, MENU_SHOTS[i]] : [v])), ...MENU_SHOTS.slice(venue.length)];
  const half = Math.ceil(photos.length / 2);
  const rows = [photos.slice(0, half), [...photos.slice(half), ...photos.slice(0, Math.max(0, half - (photos.length - half)))]];

  return (
    <section className="relative overflow-clip bg-ivory py-24 text-ink sm:py-32" aria-labelledby="gallery-title">
      <div className="container-page text-center">
        <p className="eyebrow text-taupe-deep">{t("eyebrow")}</p>
        <h2 id="gallery-title" className="mt-4 text-[clamp(2.6rem,5.5vw,4.4rem)] leading-none"><Words text={t("title")} /></h2>
        <Ornament className="mx-auto mt-5 text-champagne" />
      </div>
      <div className="mt-12 grid gap-4 sm:mt-16 sm:gap-6">
        {rows.map((row, r) => (
          <div
            key={r}
            style={(r === 0 ? { "--from": "0%", "--to": "-25%" } : { "--from": "-25%", "--to": "0%" }) as CSSProperties}
            className="sd-drift flex w-max gap-4 sm:gap-6"
          >
            {[...row, ...row].map((p, i) => (
              <figure key={p.url + i} aria-hidden={i >= row.length || undefined} className={`relative h-[min(30svh,300px)] shrink-0 overflow-hidden shadow-lift ${SHAPES[(i + r) % SHAPES.length]}`}>
                <Image src={p.url} alt={p.alt} fill sizes="(min-width: 768px) 300px, 50vw" className="object-cover" />
              </figure>
            ))}
          </div>
        ))}
      </div>
      {instagramUrl && (
        <div className="mt-14 text-center">
          <a href={instagramUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-3 border border-ink/25 px-7 py-4 text-[0.72rem] tracking-[0.28em] uppercase transition-colors hover:border-ink hover:bg-ink hover:text-ivory">
            <InstagramIcon className="size-4" />{t("follow")}
          </a>
        </div>
      )}
    </section>
  );
}
