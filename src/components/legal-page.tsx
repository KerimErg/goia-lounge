import { Ornament } from "@/components/ornament";

/** Mise en page sobre et lisible des pages légales. */
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-ivory text-ink">
      <header className="bg-ink px-5 pt-36 pb-16 text-center text-ivory sm:pt-44">
        <Ornament className="mx-auto text-champagne" />
        <h1 className="mt-6 text-[clamp(2.4rem,6vw,4.2rem)] leading-none">{title}</h1>
      </header>
      <div className="container-page max-w-3xl py-16 text-[0.98rem] leading-relaxed [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-sans [&_h2]:text-xs [&_h2]:font-medium [&_h2]:tracking-[0.25em] [&_h2]:text-taupe-deep [&_h2]:uppercase">
        {children}
      </div>
    </div>
  );
}
