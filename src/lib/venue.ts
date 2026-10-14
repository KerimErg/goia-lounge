import { cache } from "react";
import { logged, prisma } from "./prisma";
import { nowInKehl, toMinutes, addDays, weekdayOf } from "./time";

/** Réglages, horaires et zones : lus une fois par requête (React cache). */
export const getVenue = cache(async () => {
  const [settings, hours, zones] = await logged("getVenue", Promise.all([
    prisma.settings.findUnique({ where: { id: 1 } }),
    prisma.openingHours.findMany({ orderBy: { weekday: "asc" } }),
    prisma.zone.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
  ]));
  if (!settings) {
    console.error("[venue] Réglages absents dans la base : elle n'a pas été remplie (voir scripts/bootstrap.ts).");
    throw new Error("Réglages absents : lancez le seed (npm run db:seed).");
  }
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

/**
 * Coordonnées réellement renseignées ? Les valeurs provisoires du seed
 * (« 0000 », @example.com) ne sont jamais affichées en lien cliquable.
 */
export function contactLinks(s: { phone: string; whatsapp: string; email: string; instagramUrl: string }) {
  const real = (v: string) => !!v && !/0000|example\./i.test(v);
  return {
    phone: real(s.phone) ? s.phone : null,
    whatsapp: real(s.whatsapp) ? `https://wa.me/${s.whatsapp.replace(/\D/g, "")}` : null,
    email: real(s.email) ? s.email : null,
    instagram: real(s.instagramUrl) ? s.instagramUrl : null,
  };
}

/** Horaires d'un jour donné (0 = dimanche), ou null si fermé. */
export function hoursFor(hours: OpeningHoursRow[], weekday: number) {
  const h = hours.find((r) => r.weekday === weekday);
  return !h || h.closed ? null : `${h.opensAt} – ${h.closesAt}`;
}

/** 48.5717 → « 48°34′N » (détail typographique du lieu). */
export function formatCoord(value: number, pos: string, neg: string) {
  const a = Math.abs(value);
  const d = Math.floor(a);
  const m = Math.round((a - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}′${value >= 0 ? pos : neg}`;
}
