import { getLocale, getTranslations } from "next-intl/server";
import { dayName, getVenue, groupHours, isOpenNow } from "@/lib/venue";
import { cn } from "@/lib/utils";
import { VenueMap } from "@/components/home/venue-map";

/** Adresse, horaires et carte (accueil + page Contact). Prend la couleur du texte de la section (fond clair ou sombre). */
export async function VenueInfo() {
  const info = await getTranslations("info");
  const locale = await getLocale();
  const { settings: s, hours } = await getVenue();
  const open = isOpenNow(hours);
  const days = (d: number[]) => (d.length === 1 ? dayName(d[0], locale) : `${dayName(d[0], locale)} – ${dayName(d[d.length - 1], locale)}`);
  return (
        <div id="infos" className="grid gap-12 pt-14 lg:grid-cols-12 lg:gap-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7">
          <div>
            <h3 className="eyebrow text-[0.65rem]">{info("address")}</h3>
            <address className="mt-4 font-display text-3xl leading-tight not-italic">{s.street}<br />{s.postalCode} {s.city}</address>
            <a href={`https://www.openstreetmap.org/directions?to=${s.latitude}%2C${s.longitude}`} target="_blank" rel="noopener" className="link-underline mt-4 inline-block text-sm">{info("directions")} ↗</a>
          </div>
          <div>
            <h3 className="eyebrow flex items-center gap-3 text-[0.65rem]">
              {info("hours")}
              <span className={"inline-flex items-center gap-1.5 normal-case tracking-normal"}>
                <span className={cn("size-1.5 rounded-full", open ? "bg-amber" : "bg-current/40")} aria-hidden />
                {open ? info("openNow") : info("closedNow")}
              </span>
            </h3>
            <dl className="mt-4 space-y-2 text-sm">
              {groupHours(hours).map((g) => (
                <div key={g.days.join()} className="flex justify-between gap-6 border-b border-current/15 pb-2">
                  <dt className="first-letter:uppercase">{days(g.days)}</dt>
                  <dd className="tabular-nums">{g.label === "closed" ? info("closed") : g.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="lg:col-span-5">
          <VenueMap lat={s.latitude} lng={s.longitude} label={`${s.street}, ${s.postalCode} ${s.city}`} directionsText={info("directions")} />
        </div>
      </div>
  );
}
