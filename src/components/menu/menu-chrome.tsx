import Image from "next/image";
import type { MenuSection } from "@prisma/client";
import { Link } from "@/i18n/navigation";
import { CategoryIcon } from "@/components/menu/category-icon";
import { cn } from "@/lib/utils";

/** Bandeau photo coupé en biais, comme l'accueil de la carte (le contenu se pose par-dessus). */
export function MenuBand({ src, className, children }: { src?: string | null; className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("relative overflow-hidden bg-ink text-ivory [clip-path:polygon(0_0,100%_0,100%_80%,0_100%)]", className)}>
      {src && <Image src={src} alt="" fill priority sizes="100vw" className="animate-[slowzoom_24s_ease-in-out_infinite_alternate] object-cover object-[50%_28%] opacity-70 motion-reduce:animate-none" />}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(27_21_17/0.7),rgb(27_21_17/0.25)_45%,rgb(27_21_17/0.65))]" />
      <div className="relative">{children}</div>
    </div>
  );
}

/** Carré ivoire posé à cheval sur le bandeau, avec le pictogramme de la catégorie dans un rond encre. */
export function MenuBadge({ section, label }: { section: MenuSection; label: string }) {
  return (
    <div className="enter-rise relative z-10 -mt-20 flex justify-center px-5 sm:-mt-24">
      <div className="grid size-40 place-items-center rounded-[2.2rem] bg-ivory shadow-lift sm:size-44">
        <div className="flex flex-col items-center">
          <span className="grid size-20 place-items-center rounded-full bg-ink text-champagne ring-4 ring-ivory ring-offset-2 ring-offset-ink/15 sm:size-22">
            <CategoryIcon section={section} className="size-10 sm:size-11" />
          </span>
          <p className="eyebrow mt-3 text-[0.5rem] tracking-[0.45em] text-taupe-deep">{label}</p>
        </div>
      </div>
    </div>
  );
}

type NavCat = { id: string; slug: string; section: MenuSection; label: string };

/** Navigation entre catégories : petits ronds encre et pictogrammes dorés (la catégorie ouverte est cerclée d'or). */
export function CategoryNav({ cats, activeId }: { cats: NavCat[]; activeId?: string }) {
  return (
    <nav aria-label="Catégories" className="flex justify-center gap-6 sm:gap-10">
      {cats.map((x) => {
        const on = x.id === activeId;
        return (
          <Link key={x.id} href={`/carte/${x.slug}`} aria-current={on ? "page" : undefined} className="group flex flex-col items-center gap-2.5">
            <span
              className={cn(
                "grid size-14 place-items-center rounded-full transition-all duration-500 ease-[var(--ease-lux)] sm:size-16",
                on ? "bg-ink text-champagne ring-2 ring-champagne ring-offset-4 ring-offset-ivory" : "border border-ink/15 bg-white text-ink/70 group-hover:-translate-y-1 group-hover:border-ink group-hover:text-ink",
              )}
            >
              <CategoryIcon section={x.section} className="size-7 sm:size-8" />
            </span>
            <span className={cn("text-[0.62rem] tracking-[0.25em] uppercase", on ? "font-medium text-ink" : "text-ink/55 group-hover:text-ink")}>{x.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Titre de section : filet — texte — filet. */
export function RuleTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("eyebrow flex items-center justify-center gap-4 text-[0.6rem] text-taupe-deep", className)}>
      <span className="h-px w-10 bg-champagne sm:w-16" aria-hidden />{children}<span className="h-px w-10 bg-champagne sm:w-16" aria-hidden />
    </p>
  );
}
