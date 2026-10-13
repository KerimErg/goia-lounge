import { cache } from "react";
import { prisma } from "./prisma";
import { nowInKehl, toMinutes, addDays, weekdayOf } from "./time";

/** Réglages, horaires et zones : lus une fois par requête (React cache). */
export const getVenue = cache(async () => {
  const [settings, hours, zones] = await Promise.all([
    prisma.settings.findUnique({ where: { id: 1 } }),
    prisma.openingHours.findMany({ orderBy: { weekday: "asc" } }),
    prisma.zone.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
  ]);
  if (!settings) throw new Error("Réglages absents : lancez le seed (npm run db:seed).");
  return { settings, hours, zones };
});

export type OpeningHoursRow = { weekday: number; opensAt: string; closesAt: string; closed: boolean };

/** Le lounge est-il ouvert maintenant (heure de Kehl) ? Gère les soirées qui finissent après minuit. */
export function isOpenNow(hours: OpeningHoursRow[]) {
  const now = nowInKehl();
  const check = (ymd: string, minutesFromDayStart: number) => {
    const h = hours.find((r) => r.weekday === weekdayOf(ymd));
    if (!h || h.closed) return false;
    const open = toMinutes(h.opensAt);
    let close = toMinutes(h.closesAt);
    if (close <= open) close += 1440;
    return minutesFromDayStart >= open && minutesFromDayStart < close;
  };
  return check(now.ymd, now.minutes) || check(addDays(now.ymd, -1), now.minutes + 1440);
}

/** Regroupe les jours consécutifs aux mêmes horaires (lundi – jeudi 17:00 – 01:00). */
export function groupHours(hours: OpeningHoursRow[]) {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const label = (d: number) => {
    const h = hours.find((r) => r.weekday === d);
    return !h || h.closed ? "closed" : `${h.opensAt} – ${h.closesAt}`;
  };
  const groups: { days: number[]; label: string }[] = [];
  for (const d of order) {
    const last = groups[groups.length - 1];
    if (last && last.label === label(d)) last.days.push(d);
    else groups.push({ days: [d], label: label(d) });
  }
  return groups;
}

/** Nom du jour dans la langue voulue (0 = dimanche). */
export const dayName = (weekday: number, locale: string, style: "long" | "short" = "long") =>
  new Intl.DateTimeFormat(locale, { weekday: style, timeZone: "UTC" }).format(new Date(Date.UTC(2026, 0, 4 + weekday)));
