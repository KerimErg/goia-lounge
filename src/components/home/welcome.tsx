import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MaskReveal } from "@/components/motion";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { PHOTOS } from "@/content/media";

/** Bienvenue : une photo, un titre, une phrase, un bouton. */
export async function Welcome() {
  const t = await getTranslations("welcome");
  return (
    <section id="bienvenue" className="scroll-mt-16 bg-ivory py-24 text-ink sm:py-32" aria-labelledby="welcome-title">
      <div className="container-page grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <MaskReveal className="arch mx-auto aspect-[4/5] w-full max-w-[420px]">
          <Image src={PHOTOS.amber} alt="Chicha, cocktail et dessert au GOIA" fill sizes="(min-width: 768px) 420px, 90vw" className="object-cover" />
        </MaskReveal>
        <Reveal className="text-center md:text-left">
          <p className="eyebrow text-taupe-deep">{t("eyebrow")}</p>
          <h2 id="welcome-title" className="mt-5 text-[clamp(2.6rem,5.5vw,4.4rem)] leading-[1.02]">{t("title")}</h2>
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-ink/75 md:mx-0">{t("text")}</p>
          <Button asChild size="lux" className="mt-10"><a href="#reserver">{t("cta")}</a></Button>
        </Reveal>
      </div>
    </section>
  );
}
