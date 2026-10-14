import Image from "next/image";
import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Words } from "@/components/fx";
import { Button } from "@/components/ui/button";
import { Ornament } from "@/components/ornament";

// Photos de la carte officielle
const CARDS = [
  { key: "shisha", slug: "chichas", src: "/images/menu/quasar-tete-quasar.jpg", r: "-6deg", pos: "object-top" },
  { key: "drinks", slug: "cocktails", src: "/images/menu/mojito-fraise.jpg", r: "0deg", pos: "" },
  { key: "sweets", slug: "desserts", src: "/images/menu/cheesecake-speculoos.jpg", r: "6deg", pos: "" },
] as const;

/**
 * Notre carte : trois catégories (photo + nom + une ligne) qui montent en éventail au défilement,
 * un grand mot en filigrane qui glisse derrière, et un bouton vers la carte.
 */
export async function MenuCards() {
  const t = await getTranslations("menuCards");
  return (
    <section className="relative isolate overflow-clip bg-linen py-24 text-ink sm:py-32" aria-labelledby="menu-title">
      {/* Filigrane : glisse horizontalement pendant le défilement */}
      <div aria-hidden data-text={`${t("shisha_t")} · ${t("drinks_t")} · ${t("sweets_t")} ·`} style={{ "--from": "5%", "--to": "-35%" } as CSSProperties} className="ghost-text sd-drift pointer-events-none absolute top-1/2 left-0 -z-10 -translate-y-1/2 font-display text-[clamp(7rem,22vw,20rem)] leading-none whitespace-nowrap text-transparent [-webkit-text-stroke:1px_rgb(200_169_126/0.55)]" />
      <div className="container-page">
        <div className="text-center">
          <p className="eyebrow text-taupe-deep">{t("eyebrow")}</p>
          <h2 id="menu-title" className="mt-5 text-[clamp(2.6rem,5.5vw,4.4rem)] leading-none"><Words text={t("title")} /></h2>
          <Ornament className="mx-auto mt-6 text-champagne" />
        </div>
        <ul className="mx-auto mt-12 grid max-w-5xl gap-4 sm:mt-14 sm:grid-cols-3 sm:gap-6 lg:gap-10">
          {CARDS.map((c, i) => (
            <li key={c.key} style={{ "--i": i, "--r": c.r } as CSSProperties} className="sd-rise">
              {/* Mobile : ligne compacte (photo + texte) ; ordinateur : carte verticale */}
              <Link href={`/carte/${c.slug}`} className="group flex items-center gap-5 bg-ivory p-3 shadow-[0_1px_0_rgb(27_21_17/0.04)] transition-[transform,box-shadow] duration-500 ease-[var(--ease-lux)] hover:-translate-y-2 sm:block sm:bg-transparent sm:p-0 sm:text-center sm:shadow-none">
                <div className="relative aspect-square w-24 shrink-0 overflow-hidden sm:aspect-[2/3] sm:w-full sm:rounded-t-full sm:outline sm:outline-1 sm:outline-offset-[10px] sm:outline-champagne/50">
                  <Image src={c.src} alt="" fill sizes="(min-width: 640px) 320px, 96px" className={`object-cover ${c.pos} transition-transform duration-[1.2s] ease-[var(--ease-lux)] group-hover:scale-110`} />
                  {/* Pastille « Voir » qui apparaît au survol */}
                  <span aria-hidden className="absolute inset-0 hidden place-items-center sm:grid">
                    <span className="grid size-20 scale-50 place-items-center rounded-full bg-ivory/90 text-[0.6rem] tracking-[0.3em] text-ink uppercase opacity-0 backdrop-blur-sm transition-all duration-500 ease-[var(--ease-lux)] group-hover:scale-100 group-hover:opacity-100">{t("see")}</span>
                  </span>
                </div>
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
