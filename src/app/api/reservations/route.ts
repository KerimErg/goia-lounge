import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingContext } from "@/lib/availability";
import { bookingSchema } from "@/lib/booking-schema";
import { createBooking, Unavailable } from "@/lib/booking-create";
import { sendCustomerConfirmation, sendVenueNotice } from "@/lib/booking-email";
import { dateLabel, manageUrl, sha, venueInbox } from "@/lib/booking-common";
import { tr } from "@/lib/localized";

export const dynamic = "force-dynamic";

/** Anti-abus : 8 demandes max par adresse IP (empreinte, jamais l'IP en clair) sur 15 minutes. */
async function rateLimited(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  const keyHash = sha(`${process.env.NEXTAUTH_SECRET ?? ""}:${ip}`);
  const since = new Date(Date.now() - 15 * 60_000);
  const count = await prisma.rateEvent.count({ where: { bucket: "booking", keyHash, createdAt: { gte: since } } });
  if (count >= 8) return true;
  await prisma.rateEvent.create({ data: { bucket: "booking", keyHash } });
  return false;
}

/** POST /api/reservations → réservation confirmée automatiquement (voir createBooking), e-mails au client et au lounge. */
export async function POST(req: Request) {
  const parsed = bookingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", issues: parsed.error.issues.map((i) => i.path.join(".")) }, { status: 400 });
  const d = parsed.data;
  if (await rateLimited(req)) return NextResponse.json({ error: "rate" }, { status: 429 });

  const { settings } = await bookingContext();
  if (d.persons > settings.maxOnlinePartySize) return NextResponse.json({ error: "tooMany" }, { status: 400 });

  let b;
  try {
    b = await createBooking({ ...d, source: "WEBSITE" });
  } catch (e) {
    if (e instanceof Unavailable) return NextResponse.json({ error: "unavailable" }, { status: 409 });
    throw e;
  }

  const mail = {
    locale: d.locale, reference: b.reference, firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone,
    dateLabel: dateLabel(b.startAt, d.locale), time: d.time, persons: d.persons, zone: b.zone ? tr(b.zone.name, d.locale) : null,
    occasion: d.occasion, message: d.message, venue: settings.venueName,
    address: `${settings.street}, ${settings.postalCode} ${settings.city}`, manageUrl: manageUrl(d.locale, b.reference, b.token),
  };
  const [emailed] = await Promise.all([
    sendCustomerConfirmation(mail),
    sendVenueNotice(venueInbox(settings.notifyEmail), "new", { ...mail, dateLabel: dateLabel(b.startAt, "fr") }),
  ]);
  return NextResponse.json({ reference: b.reference, emailed }, { status: 201 });
}
