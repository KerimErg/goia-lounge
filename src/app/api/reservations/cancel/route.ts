import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVenueNotice } from "@/lib/booking-email";
import { dateLabel, sha, venueInbox } from "@/lib/booking-common";
import { utcToKehl } from "@/lib/time";

export const dynamic = "force-dynamic";

const schema = z.object({ ref: z.string().min(4).max(20), t: z.string().min(16).max(80) });

/** POST /api/reservations/cancel { ref, t } → annulation par le client (lien de l'e-mail). */
export async function POST(req: Request) {
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const r = await prisma.reservation.findUnique({ where: { reference: p.data.ref }, include: { customer: true } });
  if (!r || !r.manageTokenHash || r.manageTokenHash !== sha(p.data.t)) return NextResponse.json({ error: "notFound" }, { status: 404 });
  if (r.status === "CANCELLED") return NextResponse.json({ ok: true, already: true });
  if (!["PENDING", "CONFIRMED"].includes(r.status)) return NextResponse.json({ error: "locked" }, { status: 409 });
  const settings = await prisma.settings.findUniqueOrThrow({ where: { id: 1 } });
  if (r.startAt.getTime() - Date.now() < settings.cancelHoursBefore * 3600_000) return NextResponse.json({ error: "tooLate" }, { status: 409 });

  // Le déclencheur SQL libère automatiquement la table (ReservationTable.active = false).
  await prisma.reservation.update({ where: { id: r.id }, data: { status: "CANCELLED", cancelledBy: "client" } });
  await sendVenueNotice(venueInbox(settings.notifyEmail), "cancel", {
    locale: "fr", reference: r.reference, firstName: r.customer.firstName, lastName: r.customer.lastName,
    email: r.customer.email ?? "", phone: r.customer.phone, dateLabel: dateLabel(r.startAt, "fr"),
    time: utcToKehl(r.startAt).hhmm, persons: r.partySize, venue: settings.venueName, address: "", manageUrl: "",
  });
  return NextResponse.json({ ok: true });
}
