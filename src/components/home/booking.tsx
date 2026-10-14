import type { CSSProperties } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Mail, Phone } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/brand/icons";
import { Words } from "@/components/fx";
import { Ornament } from "@/components/ornament";
import { tr } from "@/lib/localized";
import { contactLinks, getVenue } from "@/lib/venue";
import { LiveBooking } from "@/components/booking/live-booking";
import { VenueInfo } from "@/components/venue-info";

/**
 * Réservation : panneau sable qui s'ouvre au défilement, réservation en direct (carte sombre qui ressort),
 * contact réellement configuré, puis infos pratiques sur fond clair (adresse, horaires, accès, carte).
 */
export async function Booking() {
  const t = await getTranslations("booking");
  const info = await getTranslations("info");
  const locale = await getLocale();
  const { settings: s, zones } = await getVenue();
  const links = contactLinks(s);

  return (
    <section id="reserver" className="relative scroll-mt-0 bg-ivory text-ink" aria-labelledby="booking-title">
      {/* Panneau sable : s'élargit jusqu'aux bords pendant qu'il entre à l'écran */}
      <div className="sd-open relative isolate overflow-clip bg-[#e9dcc6] pt-28 pb-24 sm:pt-36 sm:pb-32">
        <div aria-hidden className="absolute -top-40 left-1/2 -z-10 size-[44rem] -translate-x-1/2 animate-[glow_16s_ease-in-out_infinite_alternate] rounded-full bg-[#f7f2ea]/70 blur-[100px] motion-reduce:animate-none" />
        <div className="container-page flex flex-col items-center text-center">
          <p className="eyebrow text-taupe-deep">{t("eyebrow")}</p>
          <h2 id="booking-title" className="mt-5 text-[clamp(2.8rem,7vw,5.6rem)] leading-none"><Words text={t("title")} /></h2>
          <Ornament className="mx-auto mt-6 text-taupe" />
          <p className="mt-6 max-w-lg text-lg text-ink/75">{t("lead")}</p>
          <div style={{ "--i": 2 } as CSSProperties} className="sd-rise fast mt-12 w-full">
            <LiveBooking
              zones={zones.map((z) => ({ slug: z.slug, name: tr(z.name, locale) }))}
              maxParty={s.maxOnlinePartySize}
              maxDaysAhead={s.maxDaysAhead}
              instagram={links.instagram}
            />
          </div>
          {(links.whatsapp || links.phone || links.email || links.instagram) && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
              <span className="eyebrow text-[0.62rem] text-ink/75">{t("or")}</span>
              {links.whatsapp && <a href={links.whatsapp} target="_blank" rel="noopener" className="link-underline inline-flex items-center gap-2"><WhatsAppIcon className="size-4" />WhatsApp</a>}
              {links.phone && <a href={`tel:${links.phone.replace(/[^\d+]/g, "")}`} className="link-underline inline-flex items-center gap-2"><Phone className="size-4" />{links.phone}</a>}
              {links.email && <a href={`mailto:${links.email}`} className="link-underline inline-flex items-center gap-2"><Mail className="size-4" />{links.email}</a>}
              {links.instagram && <a href={links.instagram} target="_blank" rel="noopener" className="link-underline inline-flex items-center gap-2"><InstagramIcon className="size-4" />@goia.kehl</a>}
            </div>
          )}
        </div>
      </div>

      <div className="container-page pb-24">
        {/* Infos pratiques */}
        <h2 className="pt-24 text-center text-[clamp(2.4rem,5vw,4rem)] leading-none"><Words text={info("title")} /></h2>
        <Ornament className="mx-auto mt-6 text-champagne" />
        <VenueInfo />
      </div>
    </section>
  );
}
