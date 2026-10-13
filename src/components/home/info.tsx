import { getLocale, getTranslations } from "next-intl/server";
import { Car, Clock, MapPin, Phone, TramFront } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/brand/icons";
import { Reveal } from "@/components/reveal";
import { dayName, getVenue, groupHours, isOpenNow } from "@/lib/venue";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";
import { VenueMap } from "./venue-map";

export async function Info() {
  const t = await getTranslations("info");
  const locale = await getLocale();
  const { settings: s, hours } = await getVenue();
  const open = isOpenNow(hours);
  const address = `${s.street}, ${s.postalCode} ${s.city}`;
  const days = (d: number[]) => d.length === 1 ? dayName(d[0], locale) : `${dayName(d[0], locale)} – ${dayName(d[d.length - 1], locale)}`;
  const directions = `https://www.openstreetmap.org/directions?to=${s.latitude}%2C${s.longitude}`;

  return (
    <section id="infos" className="py-24 sm:py-32" aria-labelledby="info">
      <div className="container-page grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <Reveal><SectionHeading eyebrow={t("eyebrow")} title={t("title")} align="left" /></Reveal>
          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            <Reveal>
              <h3 className="eyebrow flex items-center gap-2 text-brass"><MapPin className="size-3.5" aria-hidden />{t("address")}</h3>
              <address className="mt-4 not-italic leading-relaxed text-ivory">{s.venueName}<br />{s.street}<br />{s.postalCode} {s.city}</address>
              <a href={directions} target="_blank" rel="noopener" className="link-underline mt-3 inline-block text-sm text-brass">{t("directions")}</a>
            </Reveal>
            <Reveal delay={0.06}>
              <h3 className="eyebrow flex items-center gap-2 text-brass"><Clock className="size-3.5" aria-hidden />{t("hours")}</h3>
              <p className={cn("mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em]", open ? "text-emerald-300" : "text-muted-foreground")}>
                <span className={cn("size-1.5 rounded-full", open ? "bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400" : "bg-muted-foreground")} />
                {open ? t("openNow") : t("closedNow")}
              </p>
              <dl className="mt-3 space-y-1.5 text-sm">
                {groupHours(hours).map((g) => (
                  <div key={g.days.join()} className="flex justify-between gap-4">
                    <dt className="text-sand/80 first-letter:uppercase">{days(g.days)}</dt>
                    <dd className="tabular-nums text-ivory">{g.label === "closed" ? t("closed") : g.label}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={0.12}>
              <h3 className="eyebrow flex items-center gap-2 text-brass"><TramFront className="size-3.5" aria-hidden />{t("access")}</h3>
              <p className="mt-4 text-sm leading-relaxed text-sand/85">{t("tram")}</p>
              <p className="mt-3 flex gap-2 text-sm leading-relaxed text-sand/85"><Car className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden />{t("parking")}</p>
            </Reveal>
            <Reveal delay={0.18}>
              <h3 className="eyebrow flex items-center gap-2 text-brass"><Phone className="size-3.5" aria-hidden />{t("contact")}</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href={`tel:${s.phone.replace(/\s/g, "")}`} className="link-underline text-ivory">{s.phone}</a></li>
                <li><a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener" className="link-underline inline-flex items-center gap-2 text-ivory"><WhatsAppIcon className="size-4" />WhatsApp</a></li>
                <li><a href={s.instagramUrl} target="_blank" rel="noopener" className="link-underline inline-flex items-center gap-2 text-ivory"><InstagramIcon className="size-4" />@goia.kehl</a></li>
                <li><a href={`mailto:${s.email}`} className="link-underline text-ivory">{s.email}</a></li>
              </ul>
            </Reveal>
          </div>
        </div>
        <Reveal delay={0.1} className="h-full">
          <VenueMap lat={s.latitude} lng={s.longitude} label={address} consentText={t("mapConsent")} loadText={t("mapLoad")} />
        </Reveal>
      </div>
    </section>
  );
}
