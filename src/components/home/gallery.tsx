import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { tr } from "@/lib/localized";
import { GalleryStrip } from "./gallery-strip";

/** E — Galerie (photos gérées dans l'admin) + accès Instagram. */
export async function Gallery({ instagramUrl }: { instagramUrl: string | null }) {
  const t = await getTranslations("gallery");
  const locale = await getLocale();
  const images = await prisma.galleryImage.findMany({ where: { published: true }, orderBy: { order: "asc" }, take: 12 });
  if (images.length === 0 && !instagramUrl) return null;
  return (
    <GalleryStrip
      images={images.map((i) => ({ id: i.id, url: i.url, alt: tr(i.alt, locale) }))}
      eyebrow={t("eyebrow")}
      title={t("title")}
      hint={t("hint")}
      follow={t("follow")}
      instagramUrl={instagramUrl}
    />
  );
}
