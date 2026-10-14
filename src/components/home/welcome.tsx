import Image from "next/image";
import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MaskReveal } from "@/components/motion";
import { Button } from "@/components/ui/button";

/**
 * Bienvenue — mise en page éditoriale, façon magazine : grande photo en arche cernée d'un filet doré,
 * seconde photo en médaillon qui glisse plus vite (parallaxe), titre fin et deux boutons.
 */
export async function Welcome() {
  const t = await getTranslations("welcome");
  const nav = await getTranslations("hero");
  const [first, ...rest] = t("title").split(" ");
  const last = rest.pop();

  return (
    <section id="bienvenue" className="relative scroll-mt-16 overflow-clip bg-ivory py-28 text-ink sm:py-40" aria-labelledby="welcome-title">
      {/* Marge : mention verticale, comme sur une page de magazine */}
      <p aria-hidden className="text-vertical eyebrow absolute top-1/2 left-6 hidden -translate-y-1/2 text-[0.58rem] text-taupe xl:block">GOIA · Kehl</p>

      <div className="container-page grid items-center gap-20 md:grid-cols-12 md:gap-10">
        {/* Photos */}
        <div className="relative mx-auto w-[78%] max-w-md md:col-span-6 md:w-full lg:col-span-5 lg:col-start-2">
          <div className="rounded-t-full outline outline-1 outline-offset-[14px] outline-champagne/60">
            <MaskReveal className="aspect-[4/5] rounded-t-full">
              <Image src="/images/menu/mojito-classic.jpg" alt={t("photoMain")} fill sizes="(min-width: 768px) 420px, 78vw" className="object-cover" />
            </MaskReveal>
          </div>
          <div style={{ "--from": "40px", "--to": "-60px" } as CSSProperties} className="sd-lift absolute -right-[10%] -bottom-[12%] w-[44%] border-[6px] border-ivory shadow-lift sm:-right-[22%]">
            <div className="relative aspect-square">
              <Image src="/images/menu/pornstar-martini.jpg" alt={t("photoSmall")} fill sizes="(min-width: 768px) 200px, 36vw" className="object-cover" />
            </div>
          </div>
        </div>

        {/* Texte */}
        <div className="md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8">
          <p className="eyebrow flex items-center gap-4 text-[0.62rem] text-taupe-deep"><span className="h-px w-10 bg-champagne" aria-hidden />Huqqa — Lounge</p>
          <h2 id="welcome-title" className="mt-8 text-[clamp(3.2rem,6.4vw,6rem)] leading-[0.95]">
            <span className="block">{first}</span>
            <span className="block">
              {rest.length > 0 && <span className="font-accent text-[0.8em] text-taupe-deep italic">{rest.join(" ")} </span>}
              {last}
            </span>
          </h2>
          <div className="sd-rise mt-12 grid gap-3 sm:flex" style={{ "--i": 1 } as CSSProperties}>
            <Button asChild size="lux"><a href="#reserver">{t("cta")}</a></Button>
            <Button asChild size="lux" variant="outline"><Link href="/carte">{nav("explore")}</Link></Button>
          </div>
        </div>
      </div>
    </section>
  );
}
