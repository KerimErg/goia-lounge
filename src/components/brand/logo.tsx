import { LOGO_PATH, LOGO_VIEWBOX } from "./logo-path";
import { cn } from "@/lib/utils";

/** Logo GOIA en vectoriel : prend la couleur du texte (currentColor), net à toutes les tailles. */
export function Logo({ className, title = "GOIA" }: { className?: string; title?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} className={cn("h-auto", className)} role="img" aria-label={title}>
      <path d={LOGO_PATH} fill="currentColor" fillRule="evenodd" />
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
