import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { Ambiance } from "@/components/home/ambiance";
import { AtTable } from "@/components/home/table";
import { Gallery } from "@/components/home/gallery";
import { Events } from "@/components/home/events";
import { Reviews } from "@/components/home/reviews";
import { Booking } from "@/components/home/booking";
import { contactLinks, getVenue } from "@/lib/venue";

export const revalidate = 300;

/**
 * Accueil : un parcours plutôt qu'une pile de blocs.
 * Hero plein écran (ambiance + fumée) → bandeau défilant (taupe) → trois arches (ivoire)
 * → À table (marbre) → galerie (encre) → [Événements / Avis s'ils existent]
 * → Réservation plein écran + infos pratiques → pied de page.
 */
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { settings } = await getVenue();
  const { instagram } = contactLinks(settings);
  return (
    <>
      <Hero />
      <Marquee />
      <Ambiance />
      <AtTable instagramUrl={instagram} />
      <Gallery instagramUrl={instagram} />
      <Events />
      <Reviews googleReviewsUrl={settings.googleReviewsUrl} />
      <Booking />
    </>
  );
}
