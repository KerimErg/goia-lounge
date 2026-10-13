import { addDays, fromMinutes, isYmd, nowInKehl, toMinutes, weekdayOf } from "./time";

/** Utilisable côté navigateur ET serveur (pas de Prisma ici). */
export type HoursRow = { weekday: number; opensAt: string; closesAt: string; closed: boolean };
export type SpecialDayRow = { date: string; closed: boolean; opensAt: string | null; closesAt: string | null };
export type SlotRules = { slotIntervalMin: number; lastSeatingBeforeCloseMin: number; minLeadMin: number; maxDaysAhead: number };

/** Horaires d'une soirée (jour spécial prioritaire), en minutes depuis minuit de cette date. */
export function dayWindow(ymd: string, hours: HoursRow[], specials: SpecialDayRow[] = []) {
  const special = specials.find((s) => s.date === ymd);
  if (special?.closed) return null;
  const base = hours.find((h) => h.weekday === weekdayOf(ymd));
  const opensAt = special?.opensAt ?? (base && !base.closed ? base.opensAt : null);
  const closesAt = special?.closesAt ?? (base && !base.closed ? base.closesAt : null);
  if (!opensAt || !closesAt) return null;
  const open = toMinutes(opensAt);
  let close = toMinutes(closesAt);
  if (close <= open) close += 1440;
  return { open, close };
}

/**
 * Heures d'arrivée proposées pour une date ("HH:MM"), toutes les slotIntervalMin minutes,
 * jusqu'à lastSeatingBeforeCloseMin avant la fermeture, sans les créneaux passés
 * (ni ceux à moins de minLeadMin minutes).
 */
export function arrivalSlots(ymd: string, hours: HoursRow[], rules: SlotRules, specials: SpecialDayRow[] = [], now = nowInKehl()) {
  if (!isYmd(ymd) || ymd < now.ymd || ymd > addDays(now.ymd, rules.maxDaysAhead)) return [];
  const w = dayWindow(ymd, hours, specials);
  if (!w) return [];
  const out: string[] = [];
  for (let m = w.open; m <= w.close - rules.lastSeatingBeforeCloseMin; m += rules.slotIntervalMin) {
    if (ymd === now.ymd && m < now.minutes + rules.minLeadMin) continue;
    out.push(fromMinutes(m));
  }
  return out;
}
