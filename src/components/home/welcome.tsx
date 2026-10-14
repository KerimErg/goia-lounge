import Image from "next/image";
import { Fragment, type CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Ornament } from "@/components/ornament";

// Petites photos glissées dans la phrase, à la place des mots-clés [goia] [shisha] [cocktail]
const PILLS: Record<string, { src: string; alt: string }> = {
  goia: { src: "/images/goia/chicha-fumee-ambiance.jpg", alt: "Le lounge GOIA" },
  shisha: { src: "/images/menu/quasar.jpg", alt: "Chicha Quasar" },
  cocktail: { src: "/images/menu/pornstar-martini.jpg", alt: "Pornstar Martini" },
};

/**
 * Bienvenue : une seule grande phrase sur fond clair, qui s'allume mot après mot pendant le défilement,
 * avec des photos rondes glissées entre les mots. Puis deux boutons.
 */
export async function Welcome() {
  const t = await getTranslations("welcome");
  const nav = await getTranslations("hero");
  const parts = t("manifesto").split(/(\[[a-z]+\])/).filter(Boolean);
  let n = 0;

  return (
    <section id="bienvenue" className="relative scroll-mt-16 bg-ivory py-28 text-ink sm:py-40" aria-labelledby="welcome-title">
      <div className="container-page">
        <div className="flex items-center justify-center gap-4 text-taupe-deep">
          <Ornament className="w-16 sm:w-24" />
          <h2 id="welcome-title" className="eyebrow">{t("title")}</h2>
          <Ornament className="w-16 sm:w-24" />
        </div>

        <p className="manifesto mx-auto mt-12 max-w-5xl text-center font-display text-[clamp(2.1rem,5.4vw,4.6rem)] leading-[1.12] sm:mt-16">
          {parts.map((part, i) => {
            const key = part.match(/^\[([a-z]+)\]$/)?.[1];
            const pill = key && PILLS[key];
            if (pill) {
              return (
                <Fragment key={i}>
                  <span className="pill relative mx-[0.12em] inline-block h-[0.82em] w-[1.75em] translate-y-[0.08em] overflow-hidden rounded-full align-baseline shadow-soft">
                    <Image src={pill.src} alt={pill.alt} fill sizes="120px" className="object-cover" />
                  </span>{" "}
                </Fragment>
              );
            }
            return part.trim().split(/\s+/).map((w, j, arr) => (
              <Fragment key={`${i}-${j}`}>
                <span className="lw" style={{ "--k": n++ } as CSSProperties}>{w}</span>
                {j < arr.length - 1 || /\s$/.test(part) ? " " : ""}
              </Fragment>
            ));
          })}
        </p>

        <div className="mt-14 grid justify-center gap-3 sm:flex">
          <Button asChild size="lux"><a href="#reserver">{t("cta")}</a></Button>
          <Button asChild size="lux" variant="outline"><Link href="/carte">{nav("explore")}</Link></Button>
        </div>
      </div>
    </section>
  );
}
