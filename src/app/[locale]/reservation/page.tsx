import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { BookingFlow } from "@/components/booking/booking-flow";
import { Ornament } from "@/components/ornament";
import { tr } from "@/lib/localized";
import { contactLinks, getVenue } from "@/lib/venue";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "flow" });
  return { title: t("title") };
}

export default async function ReservationPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("flow");
  const lang = await getLocale();
  const { settings, zones } = await getVenue();
  return (
    <section className="bg-grain min-h-dvh bg-ink px-5 pt-32 pb-24 text-ivory sm:px-8 sm:pt-40">
      <div className="mb-12 text-center">
        <Ornament className="mx-auto text-champagne" />
        <h1 className="mt-6 text-[clamp(2.8rem,7vw,5.2rem)] leading-none">{t("title")}</h1>
        <p className="mt-5 text-ivory/70">{t("lead")}</p>
      </div>
      <BookingFlow
        zones={zones.map((z) => ({ slug: z.slug, name: tr(z.name, lang) }))}
        maxParty={settings.maxOnlinePartySize}
        maxDaysAhead={settings.maxDaysAhead}
        initial={{ date: sp.date, time: sp.time, persons: sp.persons, zone: sp.zone }}
        instagram={contactLinks(settings).instagram}
      />
    </section>
  );
}
