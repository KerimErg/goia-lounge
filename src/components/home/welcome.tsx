import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MaskReveal } from "@/components/motion";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Ornament } from "@/components/ornament";

/** Bienvenue : une photo, un titre, une phrase, un bouton. */
export async function Welcome() {
  const t = await getTranslations("welcome");
  return (
    <section id="bienvenue" className="scroll-mt-16 bg-ivory py-24 text-ink sm:py-32" aria-labelledby="welcome-title">
      <div className="container-page grid items-center gap-12 md:grid-cols-2 md:gap-16">
        {/* Photos nettes de la carte : arche principale + médaillon, cadre fin qui reste dans l'écran */}
        <div className="relative mx-auto w-[78%] max-w-[380px] md:w-full">
          <div aria-hidden className="arch absolute -inset-2.5 border border-champagne/60 sm:-inset-3.5" />
          <MaskReveal className="arch aspect-[4/5] w-full bg-ink">
            <Image src="/images/menu/pornstar-martini.jpg" alt="Pornstar Martini au GOIA" fill sizes="(min-width: 768px) 380px, 78vw" className="object-cover object-[50%_40%]" />
          </MaskReveal>
          <div className="absolute -bottom-6 -left-6 size-28 overflow-hidden rounded-full border-4 border-ivory shadow-lift sm:-left-10 sm:size-36">
            <Image src="/images/menu/chicha-classique.jpg" alt="Chicha Classique au GOIA" fill sizes="144px" className="object-cover" />
          </div>
        </div>
        <Reveal className="text-center md:text-left">
          <p className="eyebrow text-taupe-deep">{t("eyebrow")}</p>
          <h2 id="welcome-title" className="mt-5 text-[clamp(2.6rem,5.5vw,4.4rem)] leading-[1.02]">{t("title")}</h2>
          <Ornament className="mx-auto mt-6 text-champagne md:mx-0" />
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-ink/75 md:mx-0">{t("text")}</p>
          <Button asChild size="lux" className="mt-10"><a href="#reserver">{t("cta")}</a></Button>
        </Reveal>
      </div>
    </section>
  );
}
