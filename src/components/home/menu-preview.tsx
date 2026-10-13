import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { prisma } from "@/lib/prisma";
import { tr } from "@/lib/localized";
import { SectionHeading } from "./section-heading";

export async function MenuPreview() {
  const t = await getTranslations("menuPreview");
  const locale = await getLocale();
  const [shishas, drinks] = await Promise.all([
    prisma.menuItem.findMany({ where: { available: true, tags: { has: "signature" }, category: { section: "SHISHA", active: true } }, orderBy: { order: "asc" }, take: 4 }),
    prisma.menuItem.findMany({ where: { available: true, category: { slug: "mocktails", active: true } }, orderBy: { order: "asc" }, take: 4 }),
  ]);
  const price = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });

  const List = ({ title, items }: { title: string; items: typeof shishas }) => (
    <div>
      <h3 className="eyebrow text-brass">{title}</h3>
      <ul className="mt-6 space-y-6">
        {items.map((it) => (
          <li key={it.id}>
            <div className="flex items-baseline gap-3">
              <span className="font-display text-2xl text-ivory">{tr(it.name, locale)}</span>
              <span aria-hidden className="mb-1.5 flex-1 border-b border-dotted border-ivory/25" />
              <span className="font-display text-xl text-brass">{price.format(it.priceCents / 100)}</span>
            </div>
            {it.description && <p className="mt-1 text-sm text-sand/70">{tr(it.description, locale)}</p>}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <section className="bg-marble relative overflow-hidden py-24 sm:py-32" aria-labelledby="menu-preview">
      <div className="container-page">
        <Reveal><SectionHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("text")} /></Reveal>
        <div className="mt-16 grid gap-14 lg:grid-cols-[1fr_0.8fr_1fr] lg:items-center">
          <Reveal><List title={t("shishas")} items={shishas} /></Reveal>
          <Reveal delay={0.1} className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-full border border-brass/30">
            <Image src="/images/goia/table-desserts-cocktails.jpg" alt="Desserts et cocktails sur une table en marbre" fill sizes="(min-width: 1024px) 28vw, 80vw" className="object-cover" />
          </Reveal>
          <Reveal delay={0.2}><List title={t("drinks")} items={drinks} /></Reveal>
        </div>
        <div className="mt-16 text-center">
          <Button asChild size="lux" variant="outline"><Link href="/carte">{t("cta")}</Link></Button>
        </div>
      </div>
    </section>
  );
}
