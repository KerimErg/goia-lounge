import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LineTitle, MaskReveal, Parallax } from "@/components/motion";
import { Reveal } from "@/components/reveal";
import { PHOTOS } from "@/content/media";
import { splitLines } from "@/lib/utils";

/**
 * C — L'ambiance, sur le taupe du logo. Trois matières vues dans le lounge,
 * chacune avec son propre cadrage : bande verticale (ambre), médaillon (marbre), arche (fumée).
 */
export async function Ambiance() {
  const t = await getTranslations("ambiance");
  return (
    <section className="bg-grain relative overflow-hidden bg-taupe py-24 text-ivory sm:py-32 lg:py-40" aria-labelledby="ambiance-title">
      <div className="container-page">
        <div className="max-w-3xl">
          <Reveal><p className="eyebrow text-ivory">{t("eyebrow")}</p></Reveal>
          <LineTitle id="ambiance-title" lines={splitLines(t("title"), 2)} className="mt-6 text-[clamp(2.6rem,6.5vw,5.5rem)] leading-[0.98]" />
        </div>

        <div className="mt-20 grid gap-20 sm:mt-24 lg:grid-cols-12 lg:gap-8">
          {/* Ambre : bande verticale étroite, le mot déborde sur l'image */}
          <article className="relative lg:col-span-4">
            <div className="relative flex items-end gap-6">
              <Parallax amount={50} className="w-[46%] shrink-0 lg:w-[58%]">
                <MaskReveal className="aspect-[2/5] w-full">
                  <Image src={PHOTOS.amber} alt="" fill sizes="(min-width: 1024px) 240px, 45vw" className="object-cover object-[12%_50%]" />
                </MaskReveal>
              </Parallax>
              <h3 className="relative z-10 -ml-16 pb-4 text-[clamp(3.2rem,8vw,6.5rem)] leading-none [text-shadow:0_2px_30px_rgb(27_21_17/0.45)] lg:-ml-20">{t("amber_t")}</h3>
            </div>
            <Reveal delay={0.1}><p className="mt-8 max-w-[30ch] leading-relaxed text-ivory/85">{t("amber")}</p></Reveal>
          </article>

          {/* Marbre : médaillon rond, texte en italique à côté */}
          <article className="relative sm:ml-auto sm:w-[80%] lg:col-span-4 lg:ml-0 lg:w-auto lg:pt-64">
            <div className="flex items-center gap-6">
              <MaskReveal from="left" className="aspect-square w-[44%] shrink-0 rounded-full">
                <Image src={PHOTOS.cheesecake} alt="" fill sizes="(min-width: 1024px) 200px, 40vw" className="origin-top-right scale-[2.4] object-cover object-[100%_0%]" />
              </MaskReveal>
              <div>
                <h3 className="text-[clamp(2.6rem,6vw,4.5rem)] leading-none">{t("marble_t")}</h3>
                <Reveal delay={0.15}><p className="mt-4 max-w-[24ch] font-accent text-xl leading-snug text-ivory/90">{t("marble")}</p></Reveal>
              </div>
            </div>
          </article>

          {/* Fumée : arche, le titre en dessous, aligné à droite */}
          <article className="relative lg:col-span-4 lg:pt-20">
            <Parallax amount={70}>
              <MaskReveal className="arch mx-auto aspect-[3/4] w-[78%] lg:w-full">
                <Image src={PHOTOS.smoke} alt="" fill sizes="(min-width: 1024px) 380px, 75vw" className="object-cover object-[30%_40%]" />
              </MaskReveal>
            </Parallax>
            <div className="mt-8 text-right">
              <h3 className="text-[clamp(3rem,7vw,5.5rem)] leading-none">{t("smoke_t")}</h3>
              <Reveal delay={0.1}><p className="mt-4 ml-auto max-w-[28ch] leading-relaxed text-ivory/85">{t("smoke")}</p></Reveal>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
