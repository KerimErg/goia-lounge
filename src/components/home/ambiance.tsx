import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LineTitle, MaskReveal } from "@/components/motion";
import { Reveal } from "@/components/reveal";
import { PHOTOS } from "@/content/media";
import { cn, splitLines } from "@/lib/utils";

const ITEMS = [
  { key: "amber", src: PHOTOS.amber, pos: "object-[30%_50%]", offset: "" },
  { key: "marble", src: PHOTOS.table, pos: "object-center", offset: "lg:translate-y-20" },
  { key: "smoke", src: PHOTOS.smoke, pos: "object-[35%_50%]", offset: "" },
] as const;

/**
 * L'ambiance : trois arches (le motif des niches lumineuses du lounge) sur fond ivoire.
 * Les photos restent à une taille où elles sont nettes. Mobile : défilement latéral aimanté.
 */
export async function Ambiance() {
  const t = await getTranslations("ambiance");
  return (
    <section id="ambiance" className="bg-grain scroll-mt-16 overflow-hidden bg-ivory pt-24 pb-28 text-ink sm:pt-32 lg:pb-48" aria-labelledby="ambiance-title">
      <div className="container-page text-center">
        <Reveal><p className="eyebrow text-taupe-deep">{t("eyebrow")}</p></Reveal>
        <LineTitle id="ambiance-title" lines={splitLines(t("title"), 2)} className="mx-auto mt-6 max-w-3xl text-[clamp(2.6rem,6.5vw,5.4rem)] leading-[0.98]" />
      </div>
      <ul className="mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:px-8 lg:container-page lg:mt-24 lg:grid lg:grid-cols-3 lg:gap-10 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
        {ITEMS.map((it, i) => (
          <li key={it.key} className={cn("group w-[78vw] max-w-[380px] shrink-0 snap-center lg:w-auto lg:max-w-none", it.offset)}>
            <MaskReveal delay={0.12 * i} className="arch aspect-[3/4.2] w-full lg:mx-auto lg:max-w-[360px]">
              <Image src={it.src} alt="" fill sizes="(min-width: 1024px) 360px, 78vw" className={cn("object-cover transition-transform duration-[1.4s] ease-[var(--ease-lux)] group-hover:scale-[1.06]", it.pos)} />
              <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgb(27_21_17/0.55),transparent_45%)]" />
            </MaskReveal>
            <Reveal delay={0.15 + 0.12 * i} className="mt-7 text-center lg:mx-auto lg:max-w-[360px]">
              <h3 className="text-[clamp(2.4rem,4vw,3.4rem)] leading-none">{t(`${it.key}_t`)}</h3>
              <p className="mx-auto mt-4 max-w-[30ch] leading-relaxed text-ink/75">{t(it.key)}</p>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
