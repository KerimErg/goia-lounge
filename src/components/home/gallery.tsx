import Image from "next/image";
import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { InstagramIcon } from "@/components/brand/icons";
import { Logo } from "@/components/brand/logo";
import { Words } from "@/components/fx";
import { Ornament } from "@/components/ornament";

// Cinq images verticales (9:16, haute définition) qui défilent comme une story Instagram
const SLIDES = [
  { src: "/images/ambiance/chicha-classique.jpg", alt: "Chicha au GOIA" },
  { src: "/images/ambiance/mojito-fraise.jpg", alt: "Mojito Fraise" },
  { src: "/images/ambiance/quasar.jpg", alt: "Tête Quasar" },
  { src: "/images/ambiance/rubis-des-iles.jpg", alt: "Rubis des Îles" },
  { src: "/images/ambiance/mojito-classic.jpg", alt: "Mojito Classic" },
];

/**
 * L'ambiance, façon story Instagram : un écran vertical où les photos s'enchaînent toutes seules
 * (fondu + lent zoom), barres de progression en haut, halo coloré derrière qui suit l'image.
 * Tout en CSS : rien à charger ; pause au survol ; une seule image fixe si l'on réduit les animations.
 */
export async function Gallery({ instagramUrl }: { instagramUrl: string | null }) {
  const t = await getTranslations("gallery");
  return (
    <section className="relative isolate overflow-clip bg-ivory py-24 text-ink sm:py-32" aria-labelledby="gallery-title">
      <div className="container-page grid items-center gap-14 md:grid-cols-2 md:gap-10">
        <div className="text-center md:order-2 md:text-left">
          <p className="eyebrow text-taupe-deep">{t("eyebrow")}</p>
          <h2 id="gallery-title" className="mt-4 text-[clamp(2.8rem,6vw,5rem)] leading-none"><Words text={t("title")} /></h2>
          <Ornament className="mx-auto mt-5 text-champagne md:mx-0" />
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener" className="mt-10 inline-flex items-center gap-3 border border-ink/25 px-7 py-4 text-[0.72rem] tracking-[0.28em] uppercase transition-colors hover:border-ink hover:bg-ink hover:text-ivory">
              <InstagramIcon className="size-4" />{t("follow")}
            </a>
          )}
        </div>

        <div className="story relative mx-auto w-[min(78vw,360px)] md:order-1">
          {/* Halo : les mêmes images, très floues, qui changent en même temps */}
          <div aria-hidden className="absolute -inset-10 -z-10 opacity-60 blur-3xl sm:-inset-16">
            {SLIDES.map((s, i) => (
              <div key={s.src} style={{ "--i": i } as CSSProperties} className="story-slide absolute inset-0">
                <Image src={s.src} alt="" fill sizes="200px" className="object-cover" />
              </div>
            ))}
          </div>

          <div className="relative aspect-[9/16] overflow-hidden rounded-[2rem] bg-ink shadow-lift ring-1 ring-ink/10">
            {SLIDES.map((s, i) => (
              <div key={s.src} style={{ "--i": i } as CSSProperties} className="story-slide absolute inset-0">
                <Image src={s.src} alt={s.alt} fill sizes="(min-width: 640px) 360px, 78vw" quality={85} className="story-zoom object-cover" />
              </div>
            ))}
            <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/60 to-transparent" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/70 to-transparent" />

            {/* Barres de progression */}
            <div aria-hidden className="absolute inset-x-3 top-3 flex gap-1">
              {SLIDES.map((s, i) => (
                <span key={s.src} className="h-[3px] flex-1 overflow-hidden rounded-full bg-ivory/30">
                  <span className={`story-bar story-bar-${i} block h-full w-full origin-left rounded-full bg-ivory`} />
                </span>
              ))}
            </div>
            {/* En-tête de story */}
            <div className="absolute inset-x-4 top-7 flex items-center gap-2.5 text-ivory">
              <span className="grid size-9 place-items-center rounded-full bg-ivory ring-2 ring-champagne"><Logo className="w-6 text-ink" title="" /></span>
              <span className="text-sm font-medium">goia.kehl</span>
              <span className="text-xs text-ivory/70">Kehl</span>
            </div>
            <div className="absolute inset-x-0 bottom-6 flex justify-center text-ivory">
              <span className="eyebrow text-[0.6rem] tracking-[0.4em]">Huqqa · Lounge</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
