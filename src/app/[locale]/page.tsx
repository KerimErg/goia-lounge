import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { QuickBooking } from "@/components/home/quick-booking";
import { Experience } from "@/components/home/experience";
import { MenuPreview } from "@/components/home/menu-preview";
import { Gallery } from "@/components/home/gallery";
import { Events } from "@/components/home/events";
import { Reviews } from "@/components/home/reviews";
import { Info } from "@/components/home/info";
import { Reveal } from "@/components/reveal";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { tr } from "@/lib/localized";
import { getVenue } from "@/lib/venue";
import { nowInKehl } from "@/lib/time";

export const revalidate = 300;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("quick");
  const lang = await getLocale();
  const { settings: s, hours, zones } = await getVenue();
  const specials = await prisma.specialDay.findMany({ where: { date: { gte: new Date(`${nowInKehl().ymd}T00:00:00Z`) } } });

  return (
    <>
      <Hero />
      <section id="reserver" className="relative z-10 scroll-mt-28 pt-10 pb-8 sm:-mt-20 sm:pt-0">
        <div className="container-page">
          <Reveal>
            <h2 className="sr-only">{t("title")}</h2>
            <QuickBooking
              hours={hours}
              specials={specials.map((d) => ({ date: d.date.toISOString().slice(0, 10), closed: d.closed, opensAt: d.opensAt, closesAt: d.closesAt }))}
              rules={{
                slotIntervalMin: s.slotIntervalMin, lastSeatingBeforeCloseMin: s.lastSeatingBeforeCloseMin,
                minLeadMin: s.minLeadMin, maxDaysAhead: s.maxDaysAhead,
              }}
              zones={zones.map((z) => ({ slug: z.slug, name: tr(z.name, lang) }))}
              maxParty={s.maxOnlinePartySize}
            />
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {t.rich("more", { n: s.maxOnlinePartySize, link: (c) => <Link href="/privatisation" className="link-underline text-brass">{c}</Link> })}
            </p>
          </Reveal>
        </div>
      </section>
      <Experience />
      <MenuPreview />
      <Gallery instagramUrl={s.instagramUrl} />
      <Events instagramUrl={s.instagramUrl} />
      <Reviews googleReviewsUrl={s.googleReviewsUrl} instagramUrl={s.instagramUrl} />
      <Info />
    </>
  );
}
