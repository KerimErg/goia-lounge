import { cn } from "@/lib/utils";

// Le tracé (≈ 15 Ko) vit dans <LogoSymbol /> (posé une fois dans le layout) : ici, une simple référence.
export const LOGO_VIEWBOX = "0 0 2078 686";
const [, , vw, vh] = LOGO_VIEWBOX.split(" ").map(Number);

export function Logo({ className, title = "GOIA" }: { className?: string; title?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} className={cn("h-auto", className)} role="img" aria-label={title} style={{ aspectRatio: `${vw} / ${vh}` }}>
      <use href="#goia-logo" />
    </svg>
  );
}

/** Logo + « HUQQA – LOUNGE », comme sur le logo officiel. */
export function LogoLockup({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex flex-col items-center", className)}>
      <Logo className={cn("w-full", markClassName)} />
      <span className="eyebrow mt-[0.9em] whitespace-nowrap text-[0.62em] tracking-[0.42em]">Huqqa – Lounge</span>
    </span>
  );
}
