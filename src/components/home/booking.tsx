import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Car, Mail, Phone, TramFront } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/brand/icons";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { Ornament } from "@/components/ornament";
import { PHOTOS } from "@/content/media";
import { prisma } from "@/lib/prisma";
import { tr } from "@/lib/localized";
import { nowInKehl } from "@/lib/time";
import { contactLinks, dayName, getVenue, groupHours, isOpenNow } from "@/lib/venue";
import { cn } from "@/lib/utils";
import { QuickBooking } from "./quick-booking";
import { VenueMap } from "./venue-map";

/**
 * Réservation : photo du lieu floutée en plein écran : formulaire rapide (vers le tunnel de réservation),
 * contact réellement configuré, puis infos pratiques (adresse, horaires, accès, carte).
 */
export async function Booking() {
  const t = await getTranslations("booking");
  const q = await getTranslations("quick");
  const info = await getTranslations("info");
  const locale = await getLocale();
  const { settings: s, hours, zones } = await getVenue();
  const specials = await prisma.specialDay.findMany({ where: { date: { gte: new Date(`${nowInKehl().ymd}T00:00:00Z`) } } });
  const links = contactLinks(s);
  const open = isOpenNow(hours);
  const days = (d: number[]) => (d.length === 1 ? dayName(d[0], locale) : `${dayName(d[0], locale)} – ${dayName(d[d.length - 1], locale)}`);

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
          <Reveal delay={0.15} className="mt-12 w-full max-w-5xl text-left">
            <QuickBooking
              hours={hours}
              specials={specials.map((d) => ({ date: d.date.toISOString().slice(0, 10), closed: d.closed, opensAt: d.opensAt, closesAt: d.closesAt }))}
              rules={{ slotIntervalMin: s.slotIntervalMin, lastSeatingBeforeCloseMin: s.lastSeatingBeforeCloseMin, minLeadMin: s.minLeadMin, maxDaysAhead: s.maxDaysAhead }}
              zones={zones.map((z) => ({ slug: z.slug, name: tr(z.name, locale) }))}
              maxParty={s.maxOnlinePartySize}
            />
          </Reveal>
          <p className="mt-6 text-sm text-ivory/85">
            {q.rich("more", { n: s.maxOnlinePartySize, link: (c) => <Link href="/privatisation" className="underline decoration-ivory/40 underline-offset-4 hover:decoration-ivory">{c}</Link> })}
          </p>
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
        <div id="infos" className="grid gap-12 pt-14 lg:grid-cols-12 lg:gap-10">
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7">
            <div>
              <h3 className="eyebrow text-[0.65rem] text-ivory">{info("address")}</h3>
              <address className="mt-4 font-display text-3xl leading-tight not-italic">{s.street}<br />{s.postalCode} {s.city}</address>
              <a href={`https://www.openstreetmap.org/directions?to=${s.latitude}%2C${s.longitude}`} target="_blank" rel="noopener" className="link-underline mt-4 inline-block text-sm">{info("directions")} ↗</a>
            </div>
            <div>
              <h3 className="eyebrow flex items-center gap-3 text-[0.65rem] text-ivory">
                {info("hours")}
                <span className={cn("inline-flex items-center gap-1.5 normal-case tracking-normal", open ? "text-ivory" : "text-ivory")}>
                  <span className={cn("size-1.5 rounded-full", open ? "bg-amber" : "bg-ivory/40")} aria-hidden />
                  {open ? info("openNow") : info("closedNow")}
                </span>
              </h3>
              <dl className="mt-4 space-y-2 text-sm">
                {groupHours(hours).map((g) => (
                  <div key={g.days.join()} className="flex justify-between gap-6 border-b border-ivory/15 pb-2">
                    <dt className="first-letter:uppercase">{days(g.days)}</dt>
                    <dd className="tabular-nums">{g.label === "closed" ? info("closed") : g.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="sm:col-span-2">
              <h3 className="eyebrow text-[0.65rem] text-ivory">{info("access")}</h3>
              <ul className="mt-4 grid gap-3 text-sm leading-relaxed sm:grid-cols-2">
                <li className="flex gap-3"><TramFront className="mt-0.5 size-4 shrink-0" aria-hidden />{info("tram")}</li>
                <li className="flex gap-3"><Car className="mt-0.5 size-4 shrink-0" aria-hidden />{info("parking")}</li>
              </ul>
            </div>
          </div>
          <div className="lg:col-span-5">
            <VenueMap lat={s.latitude} lng={s.longitude} label={`${s.street}, ${s.postalCode} ${s.city}`} consentText={info("mapConsent")} loadText={info("mapLoad")} />
          </div>
        </div>
      </div>
    </section>
  );
}
