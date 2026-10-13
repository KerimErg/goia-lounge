import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LineTitle } from "@/components/motion";
import { Reveal } from "@/components/reveal";
import { prisma } from "@/lib/prisma";
import { tr } from "@/lib/localized";
import { utcToKehl, VENUE_TZ } from "@/lib/time";

/** Prochains événements publiés dans l'admin. Aucune section si rien n'est annoncé. */
export async function Events() {
  const t = await getTranslations("events");
  const locale = await getLocale();
  const events = await prisma.event.findMany({
    where: { published: true, startsAt: { gte: new Date(Date.now() - 3 * 3600_000) } },
    orderBy: { startsAt: "asc" },
    take: 4,
  });
  if (events.length === 0) return null;
  const day = new Intl.DateTimeFormat(locale, { timeZone: VENUE_TZ, day: "2-digit" });
  const month = new Intl.DateTimeFormat(locale, { timeZone: VENUE_TZ, month: "long" });
  const weekday = new Intl.DateTimeFormat(locale, { timeZone: VENUE_TZ, weekday: "long" });

  return (
    <section className="bg-ivory py-24 text-ink sm:py-32" aria-labelledby="events-title">
      <div className="container-page">
        <Reveal><p className="eyebrow text-taupe-deep">{t("eyebrow")}</p></Reveal>
        <LineTitle id="events-title" lines={[t("title")]} className="mt-6 text-[clamp(2.4rem,6vw,5rem)] leading-none" />
        <ol className="mt-14 border-t border-ink/15">
          {events.map((e, i) => {
            const { ymd, hhmm } = utcToKehl(e.startsAt);
            return (
              <Reveal key={e.id} delay={0.06 * i}>
                <li className="group grid gap-4 border-b border-ink/15 py-8 sm:grid-cols-[9rem_1fr_auto] sm:items-center sm:gap-10">
                  <p className="flex items-baseline gap-3 sm:block">
                    <span className="font-display text-6xl leading-none">{day.format(e.startsAt)}</span>
                    <span className="eyebrow text-[0.62rem] text-taupe-deep sm:mt-2 sm:block">{month.format(e.startsAt)}</span>
                  </p>
                  <div>
                    <p className="text-xs tracking-[0.2em] text-taupe-deep uppercase">{t(`type_${e.type}`)} · <span className="first-letter:uppercase">{weekday.format(e.startsAt)}</span> · {hhmm}</p>
                    <h3 className="mt-2 font-display text-3xl">{tr(e.title, locale)}</h3>
                    <p className="mt-2 max-w-[60ch] text-ink/75">{tr(e.description, locale)}</p>
                  </div>
                  <Link href={{ pathname: "/reservation", query: { date: ymd } }} className="inline-flex items-center gap-2 text-xs tracking-[0.22em] uppercase transition-colors hover:text-taupe-deep">
                    {t("book")} <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
