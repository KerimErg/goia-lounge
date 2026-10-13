import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MaskReveal } from "@/components/motion";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Ornament } from "@/components/ornament";

// Photos de la carte officielle
const CARDS = [
  { key: "shisha", src: "/images/menu/chicha-classique.jpg" },
  { key: "drinks", src: "/images/menu/mojito-framboise.jpg" },
] as const;

/** Notre carte : trois catégories claires (photo + nom + une ligne) et un bouton vers la carte. */
export async function MenuCards() {
  const t = await getTranslations("menuCards");
  return (
    <section className="bg-linen py-24 text-ink sm:py-32" aria-labelledby="menu-title">
      <div className="container-page">
        <Reveal className="text-center">
          <p className="eyebrow text-taupe-deep">{t("eyebrow")}</p>
          <h2 id="menu-title" className="mt-5 text-[clamp(2.6rem,5.5vw,4.4rem)] leading-none">{t("title")}</h2>
          <Ornament className="mx-auto mt-6 text-apricot-deep" />
        </Reveal>
        <ul className="mx-auto mt-12 grid max-w-3xl gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-8">
          {CARDS.map((c, i) => (
            <li key={c.key}>
              {/* Mobile : ligne compacte (photo + texte) ; ordinateur : carte verticale */}
              <Link href="/carte" className="group flex items-center gap-5 bg-ivory p-3 sm:block sm:bg-transparent sm:p-0 sm:text-center">
                <MaskReveal delay={0.1 * i} className="aspect-square w-24 shrink-0 sm:arch sm:aspect-[3/4] sm:w-full">
                  <Image src={c.src} alt="" fill sizes="(min-width: 640px) 320px, 96px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </MaskReveal>
                <div>
                  <h3 className="text-[1.9rem] leading-none sm:mt-8 sm:text-[2.2rem]">{t(`${c.key}_t`)}</h3>
                  <p className="mt-2 text-ink/70">{t(c.key)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-14 text-center">
          <Button asChild size="lux"><Link href="/carte">{t("cta")}</Link></Button>
        </div>
      </div>
    </section>
  );
}
