import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { InstagramIcon } from "@/components/brand/icons";
import { Ornament } from "@/components/ornament";
import { VenueInfo } from "@/components/venue-info";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { contactLinks, getVenue } from "@/lib/venue";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("contact") };
}

/** Contact : Instagram (canal principal, notamment pour les groupes de plus de 8), adresse, horaires, carte. */
export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contactPage");
  const nav = await getTranslations("nav");
  const { settings } = await getVenue();
  const { instagram } = contactLinks(settings);
  return (
    <div className="bg-grain bg-ink text-ivory">
      <header className="px-5 pt-36 pb-6 text-center sm:pt-44">
        <Ornament className="mx-auto text-champagne" />
        <h1 className="mt-6 text-[clamp(3rem,9vw,6rem)] leading-none">{nav("contact")}</h1>
        <p className="mx-auto mt-6 max-w-md text-ivory/75">{t("lead")}</p>
        <div className="mt-8 grid justify-center gap-3 sm:flex">
          {instagram && <Button asChild size="lux" variant="light"><a href={instagram} target="_blank" rel="noopener"><InstagramIcon className="size-4" />@goia.kehl</a></Button>}
          <Button asChild size="lux" variant="outline" className="text-ivory"><Link href="/reservation">{nav("booking")}</Link></Button>
        </div>
      </header>
      <div className="container-page pb-24"><VenueInfo /></div>
    </div>
  );
}
