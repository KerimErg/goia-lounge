import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { InstagramIcon } from "@/components/brand/icons";
import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/reveal";
import { prisma } from "@/lib/prisma";
import { tr } from "@/lib/localized";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

/** Mosaïque (photos gérées dans l'admin) + tuile Instagram. */
export async function Gallery({ instagramUrl }: { instagramUrl: string }) {
  const t = await getTranslations("gallery");
  const locale = await getLocale();
  const images = await prisma.galleryImage.findMany({ where: { published: true }, orderBy: { order: "asc" }, take: 7 });
  // Mise en page adaptée au nombre de photos (4 photos + tuile Instagram = grille pleine)
  const spans = images.length <= 4 ? ["col-span-2 row-span-2"] : ["md:col-span-2 md:row-span-2", "", "", "md:row-span-2", "", "", ""];
  return (
    <section className="py-24 sm:py-32" aria-labelledby="gallery">
      <div className="container-page">
        <Reveal><SectionHeading eyebrow={t("eyebrow")} title={t("title")} /></Reveal>
        <div className="mt-14 grid auto-rows-[44vw] grid-cols-2 gap-2 sm:auto-rows-[30vw] md:auto-rows-[15vw] md:grid-cols-4 md:gap-3">
          {images.map((img, i) => (
            <Reveal key={img.id} delay={0.05 * i} className={cn("group relative overflow-hidden", spans[i])}>
              <Image src={img.url} alt={tr(img.alt, locale)} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105" />
              <div aria-hidden className="absolute inset-0 bg-night/10 transition-colors duration-700 group-hover:bg-transparent" />
            </Reveal>
          ))}
          <Reveal delay={0.3} className="relative">
            <a href={instagramUrl} target="_blank" rel="noopener" className="group flex h-full flex-col items-center justify-center gap-4 bg-taupe p-6 text-center text-ivory transition-colors hover:bg-taupe-dark">
              <Logo className="w-24" />
              <span className="flex items-center gap-2 text-sm"><InstagramIcon className="size-4" />@goia.kehl</span>
              <span className="eyebrow text-[0.6rem] text-ivory/80 group-hover:text-ivory">{t("follow")}</span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
