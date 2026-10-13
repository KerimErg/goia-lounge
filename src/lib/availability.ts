import "server-only";
import { prisma } from "./prisma";
import { addDays, kehlToUtc, nowInKehl, toMinutes } from "./time";
import { arrivalSlots, dayWindow, type SpecialDayRow } from "./slots";

/** Réglages, horaires et jours spéciaux nécessaires au calcul des créneaux. */
export async function bookingContext() {
  const [settings, hours, specialRows] = await Promise.all([
    prisma.settings.findUniqueOrThrow({ where: { id: 1 } }),
    prisma.openingHours.findMany(),
    prisma.specialDay.findMany({ where: { date: { gte: new Date(`${addDays(nowInKehl().ymd, -1)}T00:00:00Z`) } } }),
  ]);
  const specials: SpecialDayRow[] = specialRows.map((d) => ({ date: d.date.toISOString().slice(0, 10), closed: d.closed, opensAt: d.opensAt, closesAt: d.closesAt }));
  const rules = {
    slotIntervalMin: settings.slotIntervalMin,
    lastSeatingBeforeCloseMin: settings.lastSeatingBeforeCloseMin,
    minLeadMin: settings.minLeadMin,
    maxDaysAhead: settings.maxDaysAhead,
  };
  return { settings, hours, specials, rules };
}

/** Heure d'arrivée (date de la soirée + "HH:MM") → instant UTC. Après minuit = lendemain. */
export function arrivalInstant(ymd: string, hhmm: string, opensAt: number) {
  const day = toMinutes(hhmm) < opensAt ? addDays(ymd, 1) : ymd;
  return kehlToUtc(day, hhmm);
}

type Ctx = Awaited<ReturnType<typeof bookingContext>>;

/**
 * Tables libres pour chaque créneau d'une soirée. Une table convient si elle est active,
 * réservable en ligne, accepte le nombre de personnes, est dans l'espace demandé (si précisé),
 * et n'a ni réservation active ni blocage qui chevauche [arrivée, arrivée + durée).
 */
export async function availability(ctx: Ctx, ymd: string, persons: number, zoneSlug?: string | null) {
  const { settings, hours, specials, rules } = ctx;
  const slots = arrivalSlots(ymd, hours, rules, specials);
  const w = dayWindow(ymd, hours, specials);
  if (!w || slots.length === 0) return { slots: [] as { time: string; available: boolean }[], tablesFor: () => [] as string[] };

  const durationMs = settings.defaultDurationMin * 60_000;
  const first = arrivalInstant(ymd, slots[0], w.open);
  const last = new Date(arrivalInstant(ymd, slots[slots.length - 1], w.open).getTime() + durationMs);

  const tables = await prisma.table.findMany({
    where: {
      active: true, onlineBookable: true, minCovers: { lte: persons }, maxCovers: { gte: persons },
      zone: { active: true, ...(zoneSlug ? { slug: zoneSlug } : {}) },
    },
    orderBy: [{ maxCovers: "asc" }, { order: "asc" }],
    select: {
      id: true,
      reservations: { where: { active: true, startAt: { lt: last }, endAt: { gt: first } }, select: { startAt: true, endAt: true } },
      blocks: { where: { startsAt: { lt: last }, endsAt: { gt: first } }, select: { startsAt: true, endsAt: true } },
    },
  });

  const tablesFor = (time: string) => {
    const s = arrivalInstant(ymd, time, w.open).getTime(), e = s + durationMs;
    return tables
      .filter((t) => !t.reservations.some((r) => r.startAt.getTime() < e && r.endAt.getTime() > s))
      .filter((t) => !t.blocks.some((b) => b.startsAt.getTime() < e && b.endsAt.getTime() > s))
      .map((t) => t.id);
  };
  return { slots: slots.map((time) => ({ time, available: tablesFor(time).length > 0 })), tablesFor, open: w.open };
}
