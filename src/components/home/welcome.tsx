import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Ornament } from "@/components/ornament";
import { PhotoDeck } from "./photo-deck";

const PHOTOS = [
  { src: "/images/menu/pornstar-martini.jpg", alt: "Pornstar Martini au GOIA" },
  { src: "/images/menu/mojito-framboise.jpg", alt: "Mojito Framboise au GOIA" },
  { src: "/images/menu/tiki-mangue.jpg", alt: "Tiki Mangue au GOIA" },
  { src: "/images/menu/mojito-classic.jpg", alt: "Mojito Classic au GOIA" },
];

/** Bienvenue : fond lie-de-vin animé, pile de photos de la carte qui se mélange, texte et deux boutons. */
export async function Welcome() {
  const t = await getTranslations("welcome");
  const nav = await getTranslations("hero");
  return (
    <section id="bienvenue" className="relative isolate scroll-mt-16 overflow-hidden bg-[#2b0f16] py-24 text-ivory sm:py-32" aria-labelledby="welcome-title">
      {/* Lueurs qui bougent lentement */}
      <div aria-hidden className="absolute -top-32 -left-24 -z-10 size-[34rem] animate-[glow_14s_ease-in-out_infinite_alternate] rounded-full bg-[#b23a48]/40 blur-[110px] motion-reduce:animate-none" />
      <div aria-hidden className="absolute -right-24 -bottom-40 -z-10 size-[38rem] animate-[glow_18s_ease-in-out_infinite_alternate-reverse] rounded-full bg-champagne/30 blur-[120px] motion-reduce:animate-none" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(20_6_10/0.55))]" />

      <div className="container-page grid items-center gap-16 md:grid-cols-2 md:gap-16">
        <PhotoDeck photos={PHOTOS} />
        <Reveal className="text-center md:text-left">
          <p className="eyebrow text-champagne">{t("eyebrow")}</p>
          <h2 id="welcome-title" className="mt-5 text-[clamp(2.8rem,6vw,4.8rem)] leading-[1.02]">{t("title")}</h2>
          <Ornament className="mx-auto mt-6 text-champagne md:mx-0" />
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-ivory/80 md:mx-0">{t("text")}</p>
          <div className="mt-10 grid justify-center gap-3 sm:flex md:justify-start">
            <Button asChild size="lux" className="bg-champagne text-ink hover:text-ivory"><a href="#reserver">{t("cta")}</a></Button>
            <Button asChild size="lux" variant="outline" className="text-ivory"><Link href="/carte">{nav("explore")}</Link></Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
