import "server-only";
import type { Prisma } from "@prisma/client";
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

type DbClient = Prisma.TransactionClient;

/** Tables compatibles (avec leurs réservations et blocages) et réservations actives sur une période. */
async function loadPeriod(db: DbClient, persons: number, zoneSlug: string | null | undefined, from: Date, to: Date) {
  const [tables, booked] = await Promise.all([
    db.table.findMany({
      where: {
        active: true, onlineBookable: true, minCovers: { lte: persons }, maxCovers: { gte: persons },
        zone: { active: true, ...(zoneSlug ? { slug: zoneSlug } : {}) },
      },
      orderBy: [{ maxCovers: "asc" }, { order: "asc" }],
      select: {
        id: true,
        reservations: { where: { active: true, startAt: { lt: to }, endAt: { gt: from } }, select: { startAt: true, endAt: true } },
        blocks: { where: { startsAt: { lt: to }, endsAt: { gt: from } }, select: { startsAt: true, endsAt: true } },
      },
    }),
    db.reservation.findMany({
      where: { status: { in: ["PENDING", "CONFIRMED", "SEATED"] }, startAt: { lt: to }, endAt: { gt: from } },
      select: { startAt: true, endAt: true, partySize: true },
    }),
  ]);
  return { tables, booked };
}
type Period = Awaited<ReturnType<typeof loadPeriod>>;

/** Première arrivée et fin de la dernière place possible d'une soirée (ou null si fermé / plus de créneau). */
function dayBounds(ctx: Ctx, ymd: string) {
  const { settings, hours, specials, rules } = ctx;
  const slots = arrivalSlots(ymd, hours, rules, specials);
  const w = dayWindow(ymd, hours, specials);
  if (!w || slots.length === 0) return null;
  const durationMs = settings.defaultDurationMin * 60_000;
  const first = arrivalInstant(ymd, slots[0], w.open);
  const last = new Date(arrivalInstant(ymd, slots[slots.length - 1], w.open).getTime() + durationMs);
  return { slots, w, durationMs, first, last };
}

/** Calcul d'une soirée à partir des données déjà chargées (aucune requête). */
function computeDay(ctx: Ctx, ymd: string, persons: number, data: Period) {
  const b = dayBounds(ctx, ymd);
  if (!b) return { slots: [] as { time: string; available: boolean; left: number }[], tablesFor: () => [] as string[] };
  const { settings } = ctx;
  const { slots, w, durationMs } = b;
  const { tables, booked } = data;

  const STEP = 15 * 60_000;
  /** Places encore disponibles sur un créneau : le plus petit des deux plafonds (présents, arrivées). */
  const placesLeft = (s: number, e: number) => {
    const arrivals = booked.filter((r) => r.startAt.getTime() === s).reduce((n, r) => n + r.partySize, 0);
    let left = settings.maxGuestsPerSlot - arrivals;
    for (let t = s; t < e; t += STEP) {
      const present = booked.filter((r) => r.startAt.getTime() <= t && r.endAt.getTime() > t).reduce((n, r) => n + r.partySize, 0);
      left = Math.min(left, settings.maxGuestsAtOnce - present);
    }
    return Math.max(0, left);
  };
  const capacityOk = (s: number, e: number) => placesLeft(s, e) >= persons;

  const tablesFor = (time: string) => {
    const s = arrivalInstant(ymd, time, w.open).getTime(), e = s + durationMs;
    if (!capacityOk(s, e)) return [];
    return tables
      .filter((t) => !t.reservations.some((r) => r.startAt.getTime() < e && r.endAt.getTime() > s))
      .filter((t) => !t.blocks.some((bl) => bl.startsAt.getTime() < e && bl.endsAt.getTime() > s))
      .map((t) => t.id);
  };
  return {
    slots: slots.map((time) => {
      const s = arrivalInstant(ymd, time, w.open).getTime();
      return { time, available: tablesFor(time).length > 0, left: placesLeft(s, s + durationMs) };
    }),
    tablesFor,
    open: w.open,
  };
}

/**
 * Tables libres pour chaque créneau d'une soirée. Une table convient si elle est active,
 * réservable en ligne, accepte le nombre de personnes, est dans l'espace demandé (si précisé),
 * et n'a ni réservation active ni blocage qui chevauche [arrivée, arrivée + durée).
 * En plus : pas plus de maxGuestsAtOnce personnes présentes en même temps,
 * ni plus de maxGuestsPerSlot personnes qui arrivent sur le même créneau.
 */
export async function availability(ctx: Ctx, ymd: string, persons: number, zoneSlug?: string | null, db: DbClient = prisma) {
  const b = dayBounds(ctx, ymd);
  if (!b) return computeDay(ctx, ymd, persons, { tables: [], booked: [] });
  return computeDay(ctx, ymd, persons, await loadPeriod(db, persons, zoneSlug, b.first, b.last));
}

/** Plusieurs soirées d'un coup (calendrier du mois) : 2 requêtes au total au lieu de 2 par jour. */
export async function availabilityDays(ctx: Ctx, ymds: string[], persons: number, zoneSlug?: string | null) {
  const bounds = ymds.map((d) => dayBounds(ctx, d)).filter((x): x is NonNullable<typeof x> => !!x);
  const result = new Map<string, ReturnType<typeof computeDay>>();
  if (bounds.length === 0) return result;
  const from = new Date(Math.min(...bounds.map((x) => x.first.getTime())));
  const to = new Date(Math.max(...bounds.map((x) => x.last.getTime())));
  const data = await loadPeriod(prisma, persons, zoneSlug, from, to);
  for (const d of ymds) result.set(d, computeDay(ctx, d, persons, data));
  return result;
}
