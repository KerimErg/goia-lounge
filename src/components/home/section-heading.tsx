import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, intro, align = "center", className }: {
  eyebrow: string; title: string; intro?: string; align?: "center" | "left"; className?: string;
}) {
  return (
    <header className={cn(align === "center" ? "mx-auto text-center" : "", "max-w-2xl", className)}>
      <p className="eyebrow text-brass">{eyebrow}</p>
      <h2 className="mt-5 text-[clamp(2.4rem,6vw,4rem)] leading-[1.05] text-ivory">{title}</h2>
      <div className={cn("gold-rule mt-7 w-24", align === "center" && "mx-auto")} />
      {intro && <p className="mt-7 text-base leading-relaxed text-sand/85 sm:text-lg">{intro}</p>}
    </header>
  );
}
