import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Words } from "@/components/fx";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Ornament } from "@/components/ornament";
import { PhotoDeck } from "./photo-deck";

const PHOTOS = [
  { src: "/images/menu/pornstar-martini.jpg", alt: "Pornstar Martini au GOIA" },
  { src: "/images/menu/mojito-framboise.jpg", alt: "Mojito Framboise au GOIA" },
  { src: "/images/menu/tiki-mangue.jpg", alt: "Tiki Mangue au GOIA" },
  { src: "/images/menu/mojito-classic.jpg", alt: "Mojito Classic au GOIA" },
];

/** Bienvenue : panneau doré qui tranche avec l'ouverture sombre, pile de photos de la carte qui se mélange, texte et deux boutons. */
export async function Welcome() {
  const t = await getTranslations("welcome");
  const nav = await getTranslations("hero");
  return (
    <section id="bienvenue" className="relative scroll-mt-16 bg-ink" aria-labelledby="welcome-title">
      {/* Choc de couleur après l'ouverture sombre : un panneau doré aux coins arrondis qui s'élargit en arrivant */}
      <div className="sd-open relative isolate overflow-clip rounded-t-[2.5rem] bg-champagne py-24 text-ink sm:rounded-t-[4rem] sm:py-32">
        <div aria-hidden className="absolute -top-24 -right-24 -z-10 size-[30rem] animate-[glow_14s_ease-in-out_infinite_alternate] rounded-full bg-ivory/45 blur-[100px] motion-reduce:animate-none" />
        <div aria-hidden className="absolute -bottom-32 -left-24 -z-10 size-[34rem] animate-[glow_18s_ease-in-out_infinite_alternate-reverse] rounded-full bg-amber/45 blur-[110px] motion-reduce:animate-none" />
        {/* Grand mot en filigrane qui glisse au défilement */}
        <div aria-hidden data-text="Bienvenue · Willkommen · Welcome ·" style={{ "--from": "0%", "--to": "-30%" } as CSSProperties} className="ghost-text sd-drift pointer-events-none absolute top-6 left-0 -z-10 font-display text-[clamp(6rem,18vw,16rem)] leading-none whitespace-nowrap text-ivory/30" />

        <div className="container-page grid items-center gap-16 md:grid-cols-2 md:gap-16">
          <PhotoDeck photos={PHOTOS} />
          <div className="text-center md:text-left">
            <p className="eyebrow text-ink/75">{t("eyebrow")}</p>
            <h2 id="welcome-title" className="mt-5 text-[clamp(3rem,7vw,5.6rem)] leading-[0.98]"><Words text={t("title")} /></h2>
            <Ornament className="mx-auto mt-6 text-ink md:mx-0" />
            <p style={{ "--i": 3 } as CSSProperties} className="sd-rise mx-auto mt-6 max-w-md text-lg leading-relaxed text-ink/85 md:mx-0">{t("text")}</p>
            <div style={{ "--i": 4 } as CSSProperties} className="sd-rise mt-10 grid justify-center gap-3 sm:flex md:justify-start">
              <Button asChild size="lux"><a href="#reserver">{t("cta")}</a></Button>
              <Button asChild size="lux" variant="outline"><Link href="/carte">{nav("explore")}</Link></Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
