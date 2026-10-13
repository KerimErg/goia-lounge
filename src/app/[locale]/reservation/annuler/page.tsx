import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Ornament } from "@/components/ornament";
import { prisma } from "@/lib/prisma";
import { dateLabel, sha } from "@/lib/booking-common";
import { contactLinks } from "@/lib/venue";
import { utcToKehl } from "@/lib/time";
import { CancelForm } from "./cancel-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false } };

export default async function CancelPage({ params, searchParams }: {
  params: Promise<{ locale: string }>; searchParams: Promise<{ ref?: string; t?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { ref = "", t: token = "" } = await searchParams;
  const t = await getTranslations("cancelPage");
  const settings = await prisma.settings.findUniqueOrThrow({ where: { id: 1 } });
  const r = ref ? await prisma.reservation.findUnique({ where: { reference: ref } }) : null;
  const valid = !!r && !!token && r.manageTokenHash === sha(token);

  return (
    <section className="bg-grain min-h-dvh bg-ink px-5 pt-36 pb-24 text-ivory sm:pt-44">
      <div className="mx-auto max-w-xl text-center">
        <Ornament className="mx-auto text-champagne" />
        <h1 className="mt-6 text-[clamp(2.4rem,6vw,4rem)] leading-none">{t("title")}</h1>
      </div>
      <div className="mx-auto mt-12 max-w-xl bg-ivory p-8 text-ink shadow-lift sm:p-10">
        {!valid ? (
          <p className="text-center">{t("notFound")}</p>
        ) : (
          <>
            <p className="text-center font-display text-2xl first-letter:uppercase">
              {dateLabel(r.startAt, locale)} · {utcToKehl(r.startAt).hhmm} · {r.partySize} pers.
            </p>
            <p className="mt-2 mb-8 text-center text-xs tracking-[0.3em] text-taupe-deep uppercase">{r.reference}</p>
            {r.status === "CANCELLED" ? <p className="text-center">{t("already")}</p> : (
              <CancelForm reference={r.reference} token={token} cancelHours={settings.cancelHoursBefore} instagram={contactLinks(settings).instagram} />
            )}
          </>
        )}
      </div>
    </section>
  );
}
