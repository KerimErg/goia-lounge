import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LineTitle, MaskReveal, Parallax } from "@/components/motion";
import { Reveal } from "@/components/reveal";
import { PHOTOS } from "@/content/media";
import { formatCoord, getVenue } from "@/lib/venue";
import { splitLines } from "@/lib/utils";

/** B — Le lieu : grande photo à gauche, texte décalé vers le bas, étiquette verticale. */
export async function Place() {
  const t = await getTranslations("place");
  const { settings } = await getVenue();
  return (
    <section id="le-lieu" className="bg-grain relative z-10 -mt-10 scroll-mt-16 rounded-t-[2.5rem] bg-ivory py-24 text-ink sm:-mt-14 sm:rounded-t-[4rem] sm:py-32 lg:pt-40 lg:pb-28" aria-labelledby="place-title">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="relative lg:col-span-7">
          <p aria-hidden className="text-vertical eyebrow absolute top-0 -left-1 hidden text-[0.62rem] text-taupe-deep lg:block xl:-left-8">{t("aside")}</p>
          <Parallax amount={40}>
            <MaskReveal className="aspect-[4/5] w-full max-w-[560px] lg:ml-10">
              <Image src={PHOTOS.amber} alt="Chicha, verre de cocktail et cheesecake devant le verre cannelé éclairé" fill sizes="(min-width: 1024px) 560px, 92vw" className="object-cover" />
            </MaskReveal>
          </Parallax>
        </div>
        <div className="lg:col-span-5 lg:pt-48">
          <Reveal><p className="eyebrow text-taupe-deep">{t("eyebrow")}</p></Reveal>
          <LineTitle id="place-title" lines={splitLines(t("title"), 3)} className="mt-6 text-[clamp(2.6rem,6.2vw,5rem)] leading-[0.98]" />
          <Reveal delay={0.2}>
            <p className="mt-10 max-w-[34ch] text-lg leading-relaxed text-ink/80">{t("body")}</p>
            <p className="mt-12 flex items-center gap-4 text-xs tracking-[0.22em] text-taupe-deep uppercase">
              <span className="rule w-10" aria-hidden />
              {settings.city} · {formatCoord(settings.latitude, "N", "S")} {formatCoord(settings.longitude, "E", "W")}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
