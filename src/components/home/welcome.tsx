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

/** Bienvenue : dans la continuité sombre de l'ouverture, pile de photos de la carte qui se mélange, texte et deux boutons. */
export async function Welcome() {
  const t = await getTranslations("welcome");
  const nav = await getTranslations("hero");
  return (
    <section id="bienvenue" className="relative isolate scroll-mt-16 overflow-clip bg-ink py-24 text-ivory sm:py-32" aria-labelledby="welcome-title">
      {/* Même fond que l'ouverture pour une transition continue ; une seule lueur dorée qui bouge lentement */}
      <div aria-hidden className="absolute top-1/2 left-1/4 -z-10 size-[32rem] -translate-x-1/2 -translate-y-1/2 animate-[glow_16s_ease-in-out_infinite_alternate] rounded-full bg-champagne/15 blur-[120px] motion-reduce:animate-none" />

      <div className="container-page grid items-center gap-16 md:grid-cols-2 md:gap-16">
        <PhotoDeck photos={PHOTOS} />
        <div className="text-center md:text-left">
          <p className="eyebrow text-champagne">{t("eyebrow")}</p>
          <h2 id="welcome-title" className="mt-5 text-[clamp(2.8rem,6vw,4.8rem)] leading-[1.02]"><Words text={t("title")} /></h2>
          <Ornament className="mx-auto mt-6 text-champagne md:mx-0" />
          <p style={{ "--i": 3 } as CSSProperties} className="sd-rise mx-auto mt-6 max-w-md text-lg leading-relaxed text-ivory/80 md:mx-0">{t("text")}</p>
          <div style={{ "--i": 4 } as CSSProperties} className="sd-rise mt-10 grid justify-center gap-3 sm:flex md:justify-start">
            <Button asChild size="lux" className="bg-champagne text-ink hover:text-ivory"><a href="#reserver">{t("cta")}</a></Button>
            <Button asChild size="lux" variant="outline" className="text-ivory"><Link href="/carte">{nav("explore")}</Link></Button>
          </div>
        </div>
      </div>
    </section>
  );
}
