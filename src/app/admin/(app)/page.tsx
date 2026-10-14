import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { tr } from "@/lib/localized";
import { addDays, isYmd, kehlToUtc, nowInKehl, toMinutes, utcToKehl } from "@/lib/time";
import { emailConfigured } from "@/lib/booking-email";
import { ReservationCard, type Row } from "./reservation-card";

export const dynamic = "force-dynamic";

/** Une soirée va de 6 h à 6 h le lendemain (les arrivées après minuit comptent dans la soirée de la veille). */
const evening = (ymd: string) => ({ gte: kehlToUtc(ymd, "06:00"), lt: kehlToUtc(addDays(ymd, 1), "06:00") });
const tonight = () => { const n = nowInKehl(); return toMinutes(n.hhmm) < 360 ? addDays(n.ymd, -1) : n.ymd; };
const longDate = (ymd: string) =>
  new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${ymd}T12:00:00Z`));

const include = { customer: true, tables: { include: { table: { include: { zone: true } } } } } satisfies Prisma.ReservationInclude;
type WithRel = Prisma.ReservationGetPayload<{ include: typeof include }>;

const toRow = (r: WithRel): Row => ({
  id: r.id, reference: r.reference, status: r.status, source: r.source,
  date: utcToKehl(r.startAt).ymd, time: utcToKehl(r.startAt).hhmm, end: utcToKehl(r.endAt).hhmm, persons: r.partySize,
  name: `${r.customer.firstName} ${r.customer.lastName === "—" ? "" : r.customer.lastName}`.trim(),
  phone: r.customer.phone, email: r.customer.email,
  tables: r.tables.map((t) => `${tr(t.table.zone.name, "fr")} · ${t.table.label}`).join(", "),
  occasion: r.occasion, message: r.specialRequest, note: r.internalNote, cancelledBy: r.cancelledBy,
});

/**
 * Réservations d'une soirée : chiffres clés, puis la liste par heure d'arrivée avec les actions
 * (arrivé, absent, terminé, annuler, rétablir, note). Recherche par nom, téléphone, e-mail ou référence.
 */
export default async function AdminReservations({ searchParams }: { searchParams: Promise<{ date?: string; q?: string; created?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const date = isYmd(sp.date) ? sp.date : tonight();
  const q = sp.q?.trim() ?? "";

  const [rows, settings] = await Promise.all([
    q
      ? prisma.reservation.findMany({
          where: {
            startAt: { gte: kehlToUtc(addDays(nowInKehl().ymd, -60), "06:00") },
            OR: [
              { reference: { contains: q, mode: "insensitive" } },
              { customer: { firstName: { contains: q, mode: "insensitive" } } },
              { customer: { lastName: { contains: q, mode: "insensitive" } } },
              { customer: { email: { contains: q, mode: "insensitive" } } },
              { customer: { phone: { contains: q.replace(/\s+/g, "") } } },
            ],
          },
          include, orderBy: { startAt: "desc" }, take: 50,
        })
      : prisma.reservation.findMany({ where: { startAt: evening(date) }, include, orderBy: [{ startAt: "asc" }, { createdAt: "asc" }] }),
    prisma.settings.findUniqueOrThrow({ where: { id: 1 } }),
  ]);
  const list = rows.map(toRow);
  const live = list.filter((r) => ["CONFIRMED", "PENDING", "SEATED"].includes(r.status));
  const covers = live.reduce((n, r) => n + r.persons, 0);
  const seated = list.filter((r) => r.status === "SEATED").reduce((n, r) => n + r.persons, 0);
  const cancelled = list.filter((r) => r.status === "CANCELLED").length;
  const today = tonight();

  return (
    <div>
      {!emailConfigured() && (
        <p className="mb-6 rounded-2xl border border-amber/40 bg-amber/10 px-4 py-3 text-sm">
          Les e-mails ne sont pas encore activés sur ce site (clé <strong>RESEND_API_KEY</strong> et <strong>EMAIL_FROM</strong> à renseigner sur Vercel) : les réservations s’enregistrent, mais aucun e-mail ne part.
        </p>
      )}
      {sp.created && <p className="mb-6 rounded-2xl bg-ink px-4 py-3 text-sm text-ivory">Réservation <strong className="text-champagne">{sp.created}</strong> enregistrée.</p>}

      {/* Recherche */}
      <form action="/admin" className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink/40" aria-hidden />
        <input name="q" defaultValue={q} placeholder="Rechercher : nom, téléphone, e-mail ou référence" className="h-12 w-full rounded-full border border-ink/15 bg-white pr-4 pl-11 text-sm outline-none focus:border-ink" />
      </form>

      {q ? (
        <div className="mt-8">
          <div className="flex items-baseline justify-between">
            <h1 className="font-display text-3xl">Résultats pour « {q} »</h1>
            <Link href="/admin" className="text-sm underline underline-offset-4">Revenir à la soirée</Link>
          </div>
          <p className="mt-1 text-sm text-ink/55">{list.length} réservation(s)</p>
          <ul className="mt-6 grid gap-3">{list.map((r) => <ReservationCard key={r.id} r={r} showDate />)}</ul>
        </div>
      ) : (
        <>
          {/* Choix de la soirée */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <Link href={`/admin?date=${addDays(date, -1)}`} className="grid size-11 place-items-center rounded-full border border-ink/15 hover:border-ink" aria-label="Soirée précédente"><ChevronLeft className="size-5" /></Link>
            <div className="text-center">
              <p className="eyebrow text-[0.58rem] text-taupe-deep">{date === today ? "Ce soir" : date === addDays(today, 1) ? "Demain" : date === addDays(today, -1) ? "Hier" : "Soirée du"}</p>
              <h1 className="mt-1 font-display text-3xl first-letter:uppercase sm:text-4xl">{longDate(date)}</h1>
              <form action="/admin" className="mt-2 flex items-center justify-center gap-2 text-sm">
                <input key={date} type="date" name="date" defaultValue={date} className="rounded-full border border-ink/15 bg-white px-3 py-1" />
                <button className="rounded-full bg-ink px-3 py-1 text-ivory">Voir</button>
                {date !== today && <Link href="/admin" className="underline underline-offset-4">Ce soir</Link>}
              </form>
            </div>
            <Link href={`/admin?date=${addDays(date, 1)}`} className="grid size-11 place-items-center rounded-full border border-ink/15 hover:border-ink" aria-label="Soirée suivante"><ChevronRight className="size-5" /></Link>
          </div>

          {/* Chiffres clés */}
          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Réservations", String(live.length)],
              ["Personnes attendues", `${covers}`],
              ["Déjà arrivées", `${seated}`],
              ["Annulées", String(cancelled)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-white px-4 py-4 shadow-soft">
                <dt className="text-xs text-ink/55">{k}</dt>
                <dd className="mt-1 font-display text-3xl">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-ink/50">Capacité en ligne : {settings.maxGuestsAtOnce} personnes en même temps, {settings.maxGuestsPerSlot} arrivées max par créneau, groupes jusqu’à {settings.maxOnlinePartySize}.</p>

          {list.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-ink/20 px-6 py-14 text-center">
              <p className="font-display text-2xl">Aucune réservation pour cette soirée</p>
              <Link href={`/admin/nouvelle?date=${date}`} className="mt-5 inline-block rounded-full bg-ink px-5 py-2.5 text-sm text-ivory">Ajouter une réservation</Link>
            </div>
          ) : (
            <ul className="mt-8 grid gap-3">{list.map((r) => <ReservationCard key={r.id} r={r} />)}</ul>
          )}
        </>
      )}
    </div>
  );
}
