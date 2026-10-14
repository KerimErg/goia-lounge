import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Mail, Phone } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/brand/icons";
import { Reveal } from "@/components/reveal";
import { Ornament } from "@/components/ornament";
import { PHOTOS } from "@/content/media";
import { tr } from "@/lib/localized";
import { contactLinks, getVenue } from "@/lib/venue";
import { LiveBooking } from "@/components/booking/live-booking";
import { VenueInfo } from "@/components/venue-info";

/**
 * Réservation : photo du lieu floutée en plein écran : formulaire rapide (vers le tunnel de réservation),
 * contact réellement configuré, puis infos pratiques (adresse, horaires, accès, carte).
 */
export async function Booking() {
  const t = await getTranslations("booking");
  const info = await getTranslations("info");
  const locale = await getLocale();
  const { settings: s, zones } = await getVenue();
  const links = contactLinks(s);

  return (
    <section id="reserver" className="relative scroll-mt-0 bg-ink text-ivory" aria-labelledby="booking-title">
      {/* Plein écran : la table du GOIA, floutée, en fond */}
      <div className="relative isolate overflow-hidden pt-28 pb-24 sm:pt-36 sm:pb-32">
        <Image src={PHOTOS.tableBlur} alt="" fill sizes="100vw" quality={70} className="-z-20 scale-110 object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_40%,rgb(27_21_17/0.45),rgb(27_21_17/0.9)_80%)]" />
        <div className="container-page flex flex-col items-center text-center">
          <Reveal><p className="eyebrow text-champagne">{t("eyebrow")}</p></Reveal>
          <h2 id="booking-title" className="mt-5 text-[clamp(2.8rem,7vw,5.6rem)] leading-none">{t("title")}</h2>
          <Ornament className="mx-auto mt-6 text-champagne" />
          <p className="mt-6 max-w-lg text-lg text-ivory/85">{t("lead")}</p>
          <div className="mt-12 w-full">
            <LiveBooking
              zones={zones.map((z) => ({ slug: z.slug, name: tr(z.name, locale) }))}
              maxParty={s.maxOnlinePartySize}
              maxDaysAhead={s.maxDaysAhead}
              instagram={links.instagram}
            />
          </div>
          {(links.whatsapp || links.phone || links.email || links.instagram) && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
              <span className="eyebrow text-[0.62rem] text-ivory/80">{t("or")}</span>
              {links.whatsapp && <a href={links.whatsapp} target="_blank" rel="noopener" className="link-underline inline-flex items-center gap-2"><WhatsAppIcon className="size-4" />WhatsApp</a>}
              {links.phone && <a href={`tel:${links.phone.replace(/[^\d+]/g, "")}`} className="link-underline inline-flex items-center gap-2"><Phone className="size-4" />{links.phone}</a>}
              {links.email && <a href={`mailto:${links.email}`} className="link-underline inline-flex items-center gap-2"><Mail className="size-4" />{links.email}</a>}
              {links.instagram && <a href={links.instagram} target="_blank" rel="noopener" className="link-underline inline-flex items-center gap-2"><InstagramIcon className="size-4" />@goia.kehl</a>}
            </div>
          )}
        </div>
      </div>

      <div className="container-page pb-20">
        {/* Infos pratiques */}
        <h2 className="pt-20 text-center text-[clamp(2.4rem,5vw,4rem)] leading-none">{info("title")}</h2>
        <Ornament className="mx-auto mt-6 text-champagne" />
        <VenueInfo />
      </div>
    </section>
  );
}
