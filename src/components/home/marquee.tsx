import { getTranslations } from "next-intl/server";

/** Bandeau de mots qui défile (taupe du logo). Décoratif : masqué aux lecteurs d'écran. */
export async function Marquee() {
  const t = await getTranslations("marquee");
  const words = t("words").split("|");
  const row = (
    <div className="flex shrink-0 items-center">
      {words.map((w, i) => (
        <span key={i} className="flex items-center">
          <span className="px-8 font-display text-[clamp(2.2rem,5vw,4.2rem)] leading-none whitespace-nowrap sm:px-12">{w}</span>
          <svg viewBox="0 0 20 20" className="size-4 shrink-0 text-amber sm:size-5" aria-hidden><path d="M10 0 12 8 20 10 12 12 10 20 8 12 0 10 8 8Z" fill="currentColor" /></svg>
        </span>
      ))}
    </div>
  );
  return (
    <div aria-hidden className="bg-grain overflow-hidden border-y border-ivory/15 bg-taupe py-6 text-ivory sm:py-8">
      <div className="flex w-max animate-[marquee_38s_linear_infinite] motion-reduce:animate-none">
        {row}
        {row}
      </div>
    </div>
  );
}
