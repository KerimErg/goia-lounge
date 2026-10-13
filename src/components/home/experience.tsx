import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "./section-heading";

const ITEMS = ["ambiance", "shisha", "service", "music"] as const;
const ROMAN = ["I", "II", "III", "IV"];

export async function Experience() {
  const t = await getTranslations("experience");
  return (
    <section className="relative py-24 sm:py-32" aria-labelledby="experience-title">
      <div className="container-page grid items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image src="/images/goia/chicha-cocktail-dessert.jpg" alt="Chicha, cocktail et cheesecake au GOIA" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover transition-transform duration-[2s] ease-out hover:scale-105" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/50 via-transparent to-transparent" />
          </div>
          <div aria-hidden className="absolute -right-4 -bottom-4 -z-10 h-full w-full border border-brass/30 sm:-right-6 sm:-bottom-6" />
        </Reveal>
        <div>
          <Reveal><SectionHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} align="left" /></Reveal>
          <dl className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {ITEMS.map((k, i) => (
              <Reveal key={k} delay={0.08 * i}>
                <dt className="flex items-baseline gap-4">
                  <span className="font-display text-xl text-brass">{ROMAN[i]}</span>
                  <span className="font-display text-2xl text-ivory">{t(`${k}_t`)}</span>
                </dt>
                <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(k)}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
