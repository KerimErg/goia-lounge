import "server-only";
import { randomBytes } from "node:crypto";
import type { ReservationSource } from "@prisma/client";
import { prisma } from "./prisma";
import { arrivalInstant, availability, bookingContext } from "./availability";
import { sha } from "./booking-common";
import { dayWindow } from "./slots";

export class Unavailable extends Error {}

const reference = () => "GO-" + Array.from(randomBytes(6), (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("");

export type NewBooking = {
  date: string; time: string; persons: number; zone?: string | null;
  firstName: string; lastName: string; phone: string; email?: string | null;
  occasion?: "NONE" | "BIRTHDAY" | "FRIENDS" | "DATE" | "BUSINESS" | "OTHER"; message?: string | null;
  locale: "fr" | "de" | "en"; source: ReservationSource; internalNote?: string | null;
};

/**
 * Crée une réservation confirmée sur la plus petite table libre, avec les mêmes règles pour le site
 * et pour l'admin. Un verrou PostgreSQL par soirée sérialise les réservations simultanées : les plafonds
 * (personnes présentes, arrivées par créneau) restent exacts, et la contrainte d'exclusion interdit
 * toujours deux réservations sur la même table. Lève `Unavailable` si le créneau n'est plus libre.
 */
export async function createBooking(d: NewBooking) {
  const ctx = await bookingContext();
  const w = dayWindow(d.date, ctx.hours, ctx.specials);
  if (!w) throw new Unavailable();

  const zone = d.zone ? await prisma.zone.findUnique({ where: { slug: d.zone } }) : null;
  const startAt = arrivalInstant(d.date, d.time, w.open);
  const endAt = new Date(startAt.getTime() + ctx.settings.defaultDurationMin * 60_000);
  const token = randomBytes(24).toString("base64url");
  const email = d.email?.trim().toLowerCase() || null;

  // Client : retrouvé par e-mail s'il en a un, sinon fiche créée (réservation par téléphone)
  const customer = email
    ? await prisma.customer.upsert({
        where: { email },
        update: { firstName: d.firstName, lastName: d.lastName, phone: d.phone, locale: d.locale },
        create: { firstName: d.firstName, lastName: d.lastName, phone: d.phone, email, locale: d.locale },
      })
    : await prisma.customer.create({ data: { firstName: d.firstName, lastName: d.lastName, phone: d.phone, locale: d.locale } });

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
          reference: r, status: "CONFIRMED", source: d.source, customerId: customer.id,
          startAt, endAt, partySize: d.persons, preferredZoneId: zone?.id ?? null,
          occasion: d.occasion ?? "NONE", specialRequest: d.message || null, locale: d.locale,
          manageTokenHash: sha(token), adultConfirmed: d.source === "WEBSITE", privacyAcceptedAt: d.source === "WEBSITE" ? new Date() : null,
          internalNote: d.internalNote || null,
          tables: { create: [{ tableId, startAt, endAt }] },
        },
      });
      return r;
    }, { timeout: 15_000 });
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    if (e instanceof Unavailable || msg.includes("no_overlap") || msg.includes("23P01")) throw new Unavailable();
    throw e;
  }
  return { reference: ref, token, startAt, zone, settings: ctx.settings, email };
}
