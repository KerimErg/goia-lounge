import { NextResponse } from "next/server";
import { availabilityDays, bookingContext } from "@/lib/availability";
import { dayWindow } from "@/lib/slots";
import { addDays, nowInKehl } from "@/lib/time";

export const dynamic = "force-dynamic";

/**
 * GET /api/availability/month?month=YYYY-MM&persons=2&zone=interieur
 * → état de chaque jour pour le calendrier : available | full | closed | out (passé / trop loin).
 */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const month = q.get("month") ?? "";
  const persons = Number(q.get("persons") ?? 2);
  const zone = q.get("zone") || null;
  if (!/^\d{4}-\d{2}$/.test(month) || !Number.isInteger(persons) || persons < 1 || persons > 30) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const ctx = await bookingContext();
  const today = nowInKehl().ymd, last = addDays(today, ctx.settings.maxDaysAhead);
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const ymds = Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);

  const days: Record<string, "available" | "full" | "closed" | "out"> = {};
  const todo = ymds.filter((d) => {
    if (d < today || d > last) { days[d] = "out"; return false; }
    if (!dayWindow(d, ctx.hours, ctx.specials)) { days[d] = "closed"; return false; }
    return true;
  });
  // Tout le mois en 2 requêtes, calculé en mémoire
  if (persons > ctx.settings.maxOnlinePartySize) for (const d of todo) days[d] = "full";
  else {
    const res = await availabilityDays(ctx, todo, persons, zone);
    for (const d of todo) {
      const slots = res.get(d)?.slots ?? [];
      days[d] = slots.length === 0 ? "closed" : slots.some((s) => s.available) ? "available" : "full";
    }
  }
  return NextResponse.json({ days }, { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60" } });
}
