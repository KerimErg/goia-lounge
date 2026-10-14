import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { tr } from "@/lib/localized";
import { addDays, isYmd, nowInKehl, toMinutes } from "@/lib/time";
import { ManualForm } from "./manual-form";

export const dynamic = "force-dynamic";

/** Ajouter une réservation prise par téléphone ou sur place (mêmes règles de tables et de plafonds que le site). */
export default async function NewReservation({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const n = nowInKehl();
  const today = toMinutes(n.hhmm) < 360 ? addDays(n.ymd, -1) : n.ymd;
  const zones = await prisma.zone.findMany({ orderBy: { order: "asc" } });
  return (
    <div className="mx-auto max-w-xl">
      <p className="eyebrow text-[0.58rem] text-taupe-deep">Téléphone · sur place</p>
      <h1 className="mt-1 font-display text-4xl">Ajouter une réservation</h1>
      <p className="mt-2 text-sm text-ink/60">La table est attribuée automatiquement, comme pour une réservation en ligne.</p>
      <ManualForm defaultDate={isYmd(sp.date) ? sp.date : today} zones={zones.map((z) => ({ slug: z.slug, name: tr(z.name, "fr") }))} />
    </div>
  );
}
