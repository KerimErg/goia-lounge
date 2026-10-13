import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { arrivalInstant, availability, bookingContext } from "@/lib/availability";
import { bookingSchema } from "@/lib/booking-schema";
import { sendCustomerConfirmation, sendVenueNotice } from "@/lib/booking-email";
import { dateLabel, manageUrl, sha, venueInbox } from "@/lib/booking-common";
import { tr } from "@/lib/localized";
import { dayWindow } from "@/lib/slots";

export const dynamic = "force-dynamic";

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

class Unavailable extends Error {}

/**
 * POST /api/reservations → réservation confirmée automatiquement sur la plus petite table libre.
 * Un verrou PostgreSQL par soirée sérialise les réservations simultanées : les plafonds
 * (45 personnes présentes, 12 arrivées par créneau) restent exacts même en cas de clics simultanés,
 * et la contrainte d'exclusion interdit toujours deux réservations sur la même table.
 */
export async function POST(req: Request) {
  const parsed = bookingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", issues: parsed.error.issues.map((i) => i.path.join(".")) }, { status: 400 });
  const d = parsed.data;
  if (await rateLimited(req)) return NextResponse.json({ error: "rate" }, { status: 429 });

  const ctx = await bookingContext();
  const { settings } = ctx;
  if (d.persons > settings.maxOnlinePartySize) return NextResponse.json({ error: "tooMany" }, { status: 400 });
  const w = dayWindow(d.date, ctx.hours, ctx.specials);
  if (!w) return NextResponse.json({ error: "unavailable" }, { status: 409 });

  const zone = d.zone ? await prisma.zone.findUnique({ where: { slug: d.zone } }) : null;
  const startAt = arrivalInstant(d.date, d.time, w.open);
  const endAt = new Date(startAt.getTime() + settings.defaultDurationMin * 60_000);
  const token = randomBytes(24).toString("base64url");

  const customer = await prisma.customer.upsert({
    where: { email: d.email },
    update: { firstName: d.firstName, lastName: d.lastName, phone: d.phone, locale: d.locale },
    create: { firstName: d.firstName, lastName: d.lastName, phone: d.phone, email: d.email, locale: d.locale },
  });

  let ref = "";
  try {
    ref = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"goia-booking:" + d.date}))`;
      const av = await availability(ctx, d.date, d.persons, zone?.slug ?? null, tx);
      if (!av.slots.find((s) => s.time === d.time)?.available) throw new Unavailable();
      const tableId = av.tablesFor(d.time)[0];
      if (!tableId) throw new Unavailable();
      const r = reference();
      await tx.reservation.create({
        data: {
          reference: r, status: "CONFIRMED", source: "WEBSITE", customerId: customer.id,
          startAt, endAt, partySize: d.persons, preferredZoneId: zone?.id ?? null,
          occasion: d.occasion, specialRequest: d.message || null, locale: d.locale,
          manageTokenHash: sha(token), adultConfirmed: true, privacyAcceptedAt: new Date(),
          tables: { create: [{ tableId, startAt, endAt }] },
        },
      });
      return r;
    }, { timeout: 15_000 });
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    if (e instanceof Unavailable || msg.includes("no_overlap") || msg.includes("23P01")) {
      return NextResponse.json({ error: "unavailable" }, { status: 409 });
    }
    throw e;
  }

  const mail = {
    locale: d.locale, reference: ref, firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone,
    dateLabel: dateLabel(startAt, d.locale), time: d.time, persons: d.persons, zone: zone ? tr(zone.name, d.locale) : null,
    occasion: d.occasion, message: d.message, venue: settings.venueName,
    address: `${settings.street}, ${settings.postalCode} ${settings.city}`, manageUrl: manageUrl(d.locale, ref, token),
  };
  const [emailed] = await Promise.all([
    sendCustomerConfirmation(mail),
    sendVenueNotice(venueInbox(settings.notifyEmail), "new", { ...mail, dateLabel: dateLabel(startAt, "fr") }),
  ]);
  return NextResponse.json({ reference: ref, emailed }, { status: 201 });
}
