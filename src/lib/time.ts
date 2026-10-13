/**
 * Heures de Kehl (Europe/Berlin) ↔ UTC.
 * Le serveur Vercel tourne en UTC : on ne crée JAMAIS de date avec l'heure
 * locale du serveur (erreur du site location). Toutes les conversions passent ici.
 */
export const VENUE_TZ = "Europe/Berlin";

const pad = (n: number) => String(n).padStart(2, "0");

/** Décalage (en minutes) de Europe/Berlin par rapport à UTC à un instant donné. */
function offsetMinutes(at: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: VENUE_TZ, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - at.getTime()) / 60000);
}

/** "2026-10-16" + "21:00" (heure de Kehl) → instant UTC. Gère le changement d'heure. */
export function kehlToUtc(ymd: string, hhmm: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  const [h, min] = hhmm.split(":").map(Number);
  const wall = Date.UTC(y, m - 1, d, h, min);
  let utc = wall - offsetMinutes(new Date(wall)) * 60000;
  utc = wall - offsetMinutes(new Date(utc)) * 60000; // 2e passe : exact autour du changement d'heure
  return new Date(utc);
}

/** Instant → date et heure de Kehl. */
export function utcToKehl(at: Date) {
  const local = new Date(at.getTime() + offsetMinutes(at) * 60000);
  const ymd = `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`;
  const hhmm = `${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`;
  return { ymd, hhmm, minutes: local.getUTCHours() * 60 + local.getUTCMinutes(), weekday: local.getUTCDay() };
}

export const nowInKehl = () => utcToKehl(new Date());

export function addDays(ymd: string, days: number) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

export const weekdayOf = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

export const isYmd = (s: unknown): s is string =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && addDays(s, 0) === s;

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const fromMinutes = (min: number) => `${pad(Math.floor(min / 60) % 24)}:${pad(min % 60)}`;

/**
 * Ouverture d'une soirée : instants UTC d'ouverture et de fermeture.
 * Une fermeture <= ouverture signifie le lendemain (17:00 → 01:00).
 */
export function serviceWindow(ymd: string, opensAt: string, closesAt: string) {
  const open = kehlToUtc(ymd, opensAt);
  const closeDay = toMinutes(closesAt) <= toMinutes(opensAt) ? addDays(ymd, 1) : ymd;
  return { open, close: kehlToUtc(closeDay, closesAt) };
}
