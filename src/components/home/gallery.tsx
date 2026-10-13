import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { InstagramIcon } from "@/components/brand/icons";
import { Logo } from "@/components/brand/logo";
import { LineTitle, MaskReveal } from "@/components/motion";
import { Reveal } from "@/components/reveal";
import { prisma } from "@/lib/prisma";
import { tr } from "@/lib/localized";

/** Galerie en mosaïque (photos gérées dans l'admin) + accès Instagram, sur fond encre. */
export async function Gallery({ instagramUrl }: { instagramUrl: string | null }) {
  const t = await getTranslations("gallery");
  const locale = await getLocale();
  const images = await prisma.galleryImage.findMany({ where: { published: true }, orderBy: { order: "asc" }, take: 11 });
  if (images.length === 0 && !instagramUrl) return null;
  return (
    <section className="bg-ink py-24 text-ivory sm:py-32" aria-labelledby="gallery-title">
      <div className="container-page">
        <div className="flex flex-col items-center text-center">
          <Reveal><p className="eyebrow text-taupe-light">{t("eyebrow")}</p></Reveal>
          <LineTitle id="gallery-title" lines={[t("title")]} className="mt-6 text-[clamp(2.6rem,6.5vw,5.4rem)] leading-none" />
        </div>
        {/* Colonnes étroites : les photos restent nettes */}
        <div className="mx-auto mt-14 max-w-5xl columns-2 gap-3 sm:gap-4 md:columns-3 [&>*]:mb-3 sm:[&>*]:mb-4">
          {images.map((img, i) => (
            <figure key={img.id} className="group relative break-inside-avoid overflow-hidden">
              <MaskReveal delay={0.06 * i} className="!absolute inset-0">
                <Image src={img.url} alt={tr(img.alt, locale)} fill sizes="(min-width: 768px) 330px, 50vw" className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-lux)] group-hover:scale-[1.05]" />
              </MaskReveal>
              <div style={{ aspectRatio: `${img.width} / ${img.height}` }} aria-hidden />
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgb(27_21_17/0.8),transparent)] p-4 pt-12 text-sm opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                {tr(img.alt, locale)}
              </figcaption>
            </figure>
          ))}
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener" className="group flex aspect-square break-inside-avoid flex-col items-center justify-center gap-4 bg-taupe p-6 text-center transition-colors hover:bg-taupe-deep">
              <Logo className="w-28" />
              <span className="flex items-center gap-2 text-sm"><InstagramIcon className="size-4" />@goia.kehl</span>
              <span className="eyebrow text-[0.6rem]">{t("follow")}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
