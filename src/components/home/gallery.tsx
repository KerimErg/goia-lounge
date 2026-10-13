import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { InstagramIcon } from "@/components/brand/icons";
import { Logo } from "@/components/brand/logo";
import { MaskReveal } from "@/components/motion";
import { Reveal } from "@/components/reveal";
import { prisma } from "@/lib/prisma";
import { tr } from "@/lib/localized";

/** Galerie en mosaïque (photos gérées dans l'admin) + accès Instagram, sur fond encre. */
export async function Gallery({ instagramUrl }: { instagramUrl: string | null }) {
  const t = await getTranslations("gallery");
  const locale = await getLocale();
  const images = await prisma.galleryImage.findMany({ where: { published: true }, orderBy: { order: "asc" }, take: 4 });
  if (images.length === 0 && !instagramUrl) return null;
  return (
    <section className="bg-ink py-24 text-ivory sm:py-32" aria-labelledby="gallery-title">
      <div className="container-page">
        <Reveal className="flex flex-col items-center text-center">
          <p className="eyebrow text-taupe-light">{t("eyebrow")}</p>
          <h2 id="gallery-title" className="mt-5 text-[clamp(2.6rem,5.5vw,4.4rem)] leading-none">{t("title")}</h2>
        </Reveal>
        {/* Grille régulière, cases carrées : les photos restent nettes */}
        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-3 sm:mt-14 md:grid-cols-5 md:gap-4">
          {images.slice(0, 4).map((img, i) => (
            <figure key={img.id} className="group relative aspect-square overflow-hidden">
              <MaskReveal delay={0.06 * i} className="!absolute inset-0">
                <Image src={img.url} alt={tr(img.alt, locale)} fill sizes="(min-width: 768px) 230px, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </MaskReveal>
            </figure>
          ))}
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener" className="col-span-2 flex flex-col items-center justify-center gap-3 bg-taupe p-8 text-center transition-colors hover:bg-taupe-deep md:col-span-1 md:aspect-square">
              <Logo className="w-24" />
              <span className="flex items-center gap-2 text-sm"><InstagramIcon className="size-4" />@goia.kehl</span>
              <span className="eyebrow text-[0.58rem]">{t("follow")}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
