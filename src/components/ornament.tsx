import { cn } from "@/lib/utils";

/** Filet fin — losange — filet fin : petit ornement des titres. Couleur = couleur du texte. */
export function Ornament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 12" className={cn("h-3 w-28", className)} aria-hidden>
      <path d="M0 6h50M70 6h50" stroke="currentColor" strokeWidth="0.75" />
      <path d="M60 1l5 5-5 5-5-5z" fill="none" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="60" cy="6" r="1.2" fill="currentColor" />
    </svg>
  );
}
