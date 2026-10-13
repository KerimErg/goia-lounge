import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { arrivalInstant, availability, bookingContext } from "@/lib/availability";
import { bookingSchema } from "@/lib/booking-schema";
import { sendBookingEmail } from "@/lib/booking-email";
import { dayWindow } from "@/lib/slots";
import { VENUE_TZ } from "@/lib/time";

export const dynamic = "force-dynamic";

const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const reference = () => "GO-" + Array.from(randomBytes(6), (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("");

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

/** POST /api/reservations → crée une réservation confirmée sur la meilleure table libre. */
export async function POST(req: Request) {
  const parsed = bookingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", issues: parsed.error.issues.map((i) => i.path.join(".")) }, { status: 400 });
  const d = parsed.data;
  if (await rateLimited(req)) return NextResponse.json({ error: "rate" }, { status: 429 });

  const ctx = await bookingContext();
  const { settings } = ctx;
  if (d.persons > settings.maxOnlinePartySize) return NextResponse.json({ error: "tooMany" }, { status: 400 });

  const zone = d.zone ? await prisma.zone.findUnique({ where: { slug: d.zone } }) : null;
  const av = await availability(ctx, d.date, d.persons, zone?.slug ?? null);
  const w = dayWindow(d.date, ctx.hours, ctx.specials);
  const slot = av.slots.find((s) => s.time === d.time);
  if (!w || !slot?.available) return NextResponse.json({ error: "unavailable" }, { status: 409 });

  const startAt = arrivalInstant(d.date, d.time, w.open);
  const endAt = new Date(startAt.getTime() + settings.defaultDurationMin * 60_000);
  const token = randomBytes(24).toString("base64url");

  const customer = await prisma.customer.upsert({
    where: { email: d.email },
    update: { firstName: d.firstName, lastName: d.lastName, phone: d.phone, locale: d.locale },
    create: { firstName: d.firstName, lastName: d.lastName, phone: d.phone, email: d.email, locale: d.locale },
  });

  // On tente les tables libres, de la plus petite à la plus grande. La contrainte d'exclusion
  // PostgreSQL refuse tout chevauchement : si quelqu'un a pris la table entre-temps, on passe à la suivante.
  for (const tableId of av.tablesFor(d.time)) {
    const ref = reference();
    try {
      await prisma.reservation.create({
        data: {
          reference: ref, status: "CONFIRMED", source: "WEBSITE", customerId: customer.id,
          startAt, endAt, partySize: d.persons, preferredZoneId: zone?.id ?? null,
          occasion: d.occasion, specialRequest: d.message || null, locale: d.locale,
          manageTokenHash: sha(token), adultConfirmed: true, privacyAcceptedAt: new Date(),
          tables: { create: [{ tableId, startAt, endAt }] },
        },
      });
      const dateLabel = new Intl.DateTimeFormat(d.locale, { weekday: "long", day: "numeric", month: "long", timeZone: VENUE_TZ }).format(startAt);
      const emailed = await sendBookingEmail({
        to: d.email, locale: d.locale, reference: ref, firstName: d.firstName, dateLabel, time: d.time, persons: d.persons,
        venue: settings.venueName, address: `${settings.street}, ${settings.postalCode} ${settings.city}`,
      });
      return NextResponse.json({ reference: ref, emailed }, { status: 201 });
    } catch (e) {
      const msg = String((e as Error)?.message ?? e);
      if (msg.includes("no_overlap") || msg.includes("23P01") || msg.includes("exclusion")) continue;
      if (msg.includes("Unique constraint") && msg.includes("reference")) continue;
      throw e;
    }
  }
  return NextResponse.json({ error: "unavailable" }, { status: 409 });
}
