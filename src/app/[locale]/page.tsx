import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { Welcome } from "@/components/home/welcome";
import { MenuCards } from "@/components/home/menu-cards";
import { Gallery } from "@/components/home/gallery";
import { Events } from "@/components/home/events";
import { Reviews } from "@/components/home/reviews";
import { Booking } from "@/components/home/booking";
import { IntroCurtain, ScrollProgress } from "@/components/fx";
import { contactLinks, getVenue } from "@/lib/venue";

export const revalidate = 300;

/**
 * Accueil : un parcours plutôt qu'une pile de blocs.
 * Simple et lisible : Accueil plein écran → Bienvenue → Notre carte → Galerie
 * → [Événements / Avis s'ils existent] → Réserver + Nous trouver → pied de page.
 */
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { settings } = await getVenue();
  const { instagram } = contactLinks(settings);
  return (
    <>
      <IntroCurtain />
      <ScrollProgress />
      <Hero />
      <Welcome />
      <MenuCards />
      <Gallery instagramUrl={instagram} />
      <Events />
      <Reviews googleReviewsUrl={settings.googleReviewsUrl} />
      <Booking />
    </>
  );
}
