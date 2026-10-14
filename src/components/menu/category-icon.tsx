import type { MenuSection } from "@prisma/client";

/** Pictogrammes fins (trait 1,5) : chicha, cocktail, dessert, boissons froides, boissons chaudes. Couleur = couleur du texte. */
export function CategoryIcon({ section, slug, className }: { section: MenuSection; slug?: string; className?: string }) {
  const soft = slug === "boissons" || slug === "boissons-froides";
  const hot = slug === "boissons-chaudes";
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {section === "SHISHA" && (
        <g {...common}>
          <path d="M20 6h8l-1 5h-6z" />
          <path d="M17 13h14" />
          <path d="M24 11v14" />
          <path d="M21 25h6l3 5c2 4-1 12-6 12s-8-8-6-12z" />
          <path d="M27 18c6 0 10 2 10 7s-4 6-7 6" />
          <path d="M29 31h6" />
        </g>
      )}
      {soft && (
        <g {...common}>
          <path d="M14 12h20l-3 30H17z" />
          <path d="M15 20h18" />
          <path d="M27 12l5-8h4" />
          <circle cx="21" cy="28" r="1.4" />
          <circle cx="26" cy="33" r="1.2" />
          <circle cx="22" cy="37" r="1" />
        </g>
      )}
      {hot && (
        <g {...common}>
          <path d="M11 20h22v8c0 7-5 12-11 12s-11-5-11-12z" />
          <path d="M33 23h3a4 4 0 0 1 0 8h-4" />
          <path d="M8 42h30" />
          <path d="M17 15c0-3 3-3 3-6M23 15c0-3 3-3 3-6" />
        </g>
      )}
      {section === "DRINK" && !soft && !hot && (
        <g {...common}>
          <path d="M10 10h28L24 26z" />
          <path d="M24 26v14" />
          <path d="M17 41h14" />
          <path d="M14 14h20" />
          <circle cx="33" cy="9" r="4" />
          <path d="M30 4l6 10" />
        </g>
      )}
      {section === "FOOD" && (
        <g {...common}>
          <path d="M8 34l30-14v14z" />
          <path d="M8 34h30v6H8z" />
          <path d="M8 34c0-3 2-5 5-6" />
          <circle cx="31" cy="15" r="3" />
          <path d="M31 12c0-3 2-5 4-5" />
        </g>
      )}
    </svg>
  );
}
