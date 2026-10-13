import { getLocale, getTranslations } from "next-intl/server";
import { Car, Mail, Phone, TramFront } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/brand/icons";
import { Link } from "@/i18n/navigation";
import { LineTitle } from "@/components/motion";
import { Reveal } from "@/components/reveal";
import { prisma } from "@/lib/prisma";
import { tr } from "@/lib/localized";
import { nowInKehl } from "@/lib/time";
import { contactLinks, dayName, getVenue, groupHours, isOpenNow } from "@/lib/venue";
import { cn, splitLines } from "@/lib/utils";
import { QuickBooking } from "./quick-booking";
import { VenueMap } from "./venue-map";

/**
 * F — Réservation, sur le taupe du logo : formulaire rapide (vers le tunnel de réservation),
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
    <section id="reserver" className="bg-grain relative scroll-mt-0 bg-taupe pt-24 pb-20 text-ivory sm:pt-32 lg:pt-40" aria-labelledby="booking-title">
      <div className="container-page">
        <Reveal><p className="eyebrow text-ivory">{t("eyebrow")}</p></Reveal>
        <LineTitle id="booking-title" lines={splitLines(t("title"), 2)} className="mt-6 text-[clamp(3.4rem,11vw,10rem)] leading-[0.88]" />
        <Reveal delay={0.1}><p className="mt-8 max-w-lg font-accent text-2xl leading-snug text-ivory/90">{t("lead")}</p></Reveal>

        <Reveal delay={0.15} className="mt-12">
          <QuickBooking
            hours={hours}
            specials={specials.map((d) => ({ date: d.date.toISOString().slice(0, 10), closed: d.closed, opensAt: d.opensAt, closesAt: d.closesAt }))}
            rules={{ slotIntervalMin: s.slotIntervalMin, lastSeatingBeforeCloseMin: s.lastSeatingBeforeCloseMin, minLeadMin: s.minLeadMin, maxDaysAhead: s.maxDaysAhead }}
            zones={zones.map((z) => ({ slug: z.slug, name: tr(z.name, locale) }))}
            maxParty={s.maxOnlinePartySize}
          />
          <p className="mt-5 text-sm text-ivory">
            {q.rich("more", { n: s.maxOnlinePartySize, link: (c) => <Link href="/privatisation" className="underline decoration-ivory/40 underline-offset-4 hover:decoration-ivory">{c}</Link> })}
          </p>
        </Reveal>

        {(links.whatsapp || links.phone || links.email || links.instagram) && (
          <Reveal className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
            <span className="eyebrow text-[0.62rem] text-ivory">{t("or")}</span>
            {links.whatsapp && <a href={links.whatsapp} target="_blank" rel="noopener" className="link-underline inline-flex items-center gap-2"><WhatsAppIcon className="size-4" />WhatsApp</a>}
            {links.phone && <a href={`tel:${links.phone.replace(/[^\d+]/g, "")}`} className="link-underline inline-flex items-center gap-2"><Phone className="size-4" />{links.phone}</a>}
            {links.email && <a href={`mailto:${links.email}`} className="link-underline inline-flex items-center gap-2"><Mail className="size-4" />{links.email}</a>}
            {links.instagram && <a href={links.instagram} target="_blank" rel="noopener" className="link-underline inline-flex items-center gap-2"><InstagramIcon className="size-4" />@goia.kehl</a>}
          </Reveal>
        )}

        {/* Infos pratiques */}
        <div id="infos" className="mt-24 grid gap-12 border-t border-ivory/25 pt-14 lg:mt-32 lg:grid-cols-12 lg:gap-10">
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
