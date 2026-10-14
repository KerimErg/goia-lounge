import Image from "next/image";
import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { InstagramIcon } from "@/components/brand/icons";
import { Words } from "@/components/fx";
import { Ornament } from "@/components/ornament";

// Photos du lieu (pas les produits de la carte, déjà montrés ailleurs) : fumée, table, détail
const PHOTOS = [
  { src: "/images/goia/table-desserts-cocktails.jpg", alt: "Table dressée avec desserts et boissons au GOIA", frame: "aspect-[4/5] rounded-[1.75rem]" },
  { src: "/images/goia/chicha-fumee-ambiance.jpg", alt: "Chicha et volutes de fumée dans la lumière tamisée du GOIA", frame: "aspect-[2/3] rounded-t-full" },
  { src: "/images/goia/chicha-cocktail-dessert.jpg", alt: "Chicha, cocktail et cheesecake sur une table en marbre", frame: "aspect-[4/5] rounded-[1.75rem]" },
];

/**
 * L'ambiance : trois photos du lieu en triptyque, cerclées d'un filet doré (celle du centre en arche,
 * plus haute), puis le lien Instagram. Sur téléphone : on fait glisser les photos au doigt.
 */
export async function Gallery({ instagramUrl }: { instagramUrl: string | null }) {
  const t = await getTranslations("gallery");
  return (
    <section className="relative isolate overflow-clip bg-ivory py-24 text-ink sm:py-32" aria-labelledby="gallery-title">
      <div aria-hidden className="absolute top-1/2 left-1/2 -z-10 size-[42rem] -translate-x-1/2 -translate-y-1/2 animate-[glow_16s_ease-in-out_infinite_alternate] rounded-full bg-champagne/20 blur-[120px] motion-reduce:animate-none" />
      <div className="container-page text-center">
        <p className="eyebrow text-taupe-deep">{t("eyebrow")}</p>
        <h2 id="gallery-title" className="mt-4 text-[clamp(2.6rem,5.5vw,4.4rem)] leading-none"><Words text={t("title")} /></h2>
        <Ornament className="mx-auto mt-5 text-champagne" />
      </div>

      <ul className="mx-auto mt-14 flex max-w-5xl snap-x snap-mandatory items-center gap-4 overflow-x-auto px-[12vw] pb-6 [scrollbar-width:none] sm:mt-16 md:grid md:grid-cols-[1fr_1.15fr_1fr] md:gap-8 md:overflow-visible md:px-10">
        {PHOTOS.map((p, i) => (
          <li key={p.src} style={{ "--i": i } as CSSProperties} className={`sd-rise w-[76vw] shrink-0 snap-center md:w-auto ${i === 1 ? "md:-mt-16" : "md:mt-10"}`}>
            <figure className={`group relative overflow-hidden bg-ink shadow-lift outline outline-1 outline-offset-[8px] outline-champagne/50 ${p.frame}`}>
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 380px, 76vw" className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-lux)] group-hover:scale-[1.06]" />
            </figure>
          </li>
        ))}
      </ul>

      {instagramUrl && (
        <div className="mt-12 text-center sm:mt-16">
          <a href={instagramUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-3 border border-ink/25 px-7 py-4 text-[0.72rem] tracking-[0.28em] uppercase transition-colors hover:border-ink hover:bg-ink hover:text-ivory">
            <InstagramIcon className="size-4" />{t("follow")}
          </a>
        </div>
      )}
    </section>
  );
}
