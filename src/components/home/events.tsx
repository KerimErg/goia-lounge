import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { prisma } from "@/lib/prisma";
import { tr } from "@/lib/localized";
import { utcToKehl, VENUE_TZ } from "@/lib/time";
import { SectionHeading } from "./section-heading";

/** Prochains événements publiés (gérés dans l'admin). */
export async function Events({ instagramUrl }: { instagramUrl: string }) {
  const t = await getTranslations("events");
  const locale = await getLocale();
  const events = await prisma.event.findMany({
    where: { published: true, startsAt: { gte: new Date(Date.now() - 3 * 3600_000) } },
    orderBy: { startsAt: "asc" },
    take: 3,
  });
  const day = new Intl.DateTimeFormat(locale, { timeZone: VENUE_TZ, day: "2-digit" });
  const month = new Intl.DateTimeFormat(locale, { timeZone: VENUE_TZ, month: "short" });
  const weekday = new Intl.DateTimeFormat(locale, { timeZone: VENUE_TZ, weekday: "long" });

  return (
    <section className="relative border-y border-ivory/8 bg-espresso py-24 sm:py-32" aria-labelledby="events">
      <div className="container-page">
        <Reveal><SectionHeading eyebrow={t("eyebrow")} title={t("title")} /></Reveal>
        {events.length === 0 ? (
          <p className="mx-auto mt-12 max-w-md text-center text-sand/80">
            {t("empty")}{" "}
            <a href={instagramUrl} target="_blank" rel="noopener" className="link-underline text-brass">@goia.kehl</a>
          </p>
        ) : (
          <ol className="mt-14 grid gap-px overflow-hidden border border-ivory/10 bg-ivory/10 md:grid-cols-3">
            {events.map((e, i) => {
              const { ymd, hhmm } = utcToKehl(e.startsAt);
              return (
                <Reveal key={e.id} delay={0.08 * i} className="h-full">
                  <li className="group flex h-full flex-col bg-espresso p-8 transition-colors duration-500 hover:bg-night">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex items-baseline gap-3">
                        <span className="font-display text-6xl leading-none text-ivory">{day.format(e.startsAt)}</span>
                        <span className="eyebrow text-brass">{month.format(e.startsAt).replace(".", "")}</span>
                      </div>
                      <span className="border border-brass/40 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.22em] text-brass">{t(`type_${e.type}`)}</span>
                    </div>
                    <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground first-letter:uppercase">{weekday.format(e.startsAt)} · {hhmm}</p>
                    <h3 className="mt-3 font-display text-2xl text-ivory">{tr(e.title, locale)}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-sand/80">{tr(e.description, locale)}</p>
                    <Link
                      href={{ pathname: "/reservation", query: { date: ymd } }}
                      className="mt-8 inline-flex items-center gap-2 self-start text-xs uppercase tracking-[0.22em] text-ivory transition-colors hover:text-brass"
                    >
                      {t("book")} <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </li>
                </Reveal>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
