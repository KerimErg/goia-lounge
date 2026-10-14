import { NextResponse } from "next/server";
import { availability, bookingContext } from "@/lib/availability";
import { isYmd } from "@/lib/time";

export const dynamic = "force-dynamic";

/** GET /api/availability?date=YYYY-MM-DD&persons=2&zone=lounge → créneaux et disponibilité. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const date = q.get("date");
  const persons = Number(q.get("persons") ?? 2);
  const zone = q.get("zone") || null;
  if (!isYmd(date) || !Number.isInteger(persons) || persons < 1 || persons > 30) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const ctx = await bookingContext();
  if (persons > ctx.settings.maxOnlinePartySize) return NextResponse.json({ slots: [], tooMany: true });
  const { slots } = await availability(ctx, date, persons, zone);
  // Cache très court au CDN : la réservation revérifie tout au moment de valider
  return NextResponse.json({ slots }, { headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=30" } });
}
