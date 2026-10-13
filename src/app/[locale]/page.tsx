import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { Place } from "@/components/home/place";
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
 * Hero (encre) → Le lieu (ivoire) → L'ambiance (taupe) → À table (marbre)
 * → Galerie (lin) → [Événements / Avis s'ils existent] → Réservation (taupe) → pied de page (encre).
 */
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { settings } = await getVenue();
  const { instagram } = contactLinks(settings);
  return (
    <>
      <Hero />
      <Place />
      <Ambiance />
      <AtTable instagramUrl={instagram} />
      <Gallery instagramUrl={instagram} />
      <Events />
      <Reviews googleReviewsUrl={settings.googleReviewsUrl} />
      <Booking />
    </>
  );
}
