import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OPERATOR } from "@/content/legal";
import { sendDailySummary } from "@/lib/booking-email";
import { dateLabel, venueInbox } from "@/lib/booking-common";
import { tr } from "@/lib/localized";
import { addDays, kehlToUtc, nowInKehl, utcToKehl } from "@/lib/time";

export const dynamic = "force-dynamic";

/**
 * Récapitulatif des réservations du soir, envoyé chaque jour par Vercel Cron (voir vercel.json).
 * Protégé par CRON_SECRET (Vercel l'envoie automatiquement dans l'en-tête Authorization).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await purgeOldData();
  const settings = await prisma.settings.findUniqueOrThrow({ where: { id: 1 } });
  const to = venueInbox(settings.notifyEmail);
  if (!to) return NextResponse.json({ skipped: "no recipient" });

  const today = nowInKehl().ymd;
  const from = kehlToUtc(today, "06:00"), until = kehlToUtc(addDays(today, 1), "06:00");
  const rows = await prisma.reservation.findMany({
    where: { status: { in: ["PENDING", "CONFIRMED"] }, startAt: { gte: from, lt: until } },
    orderBy: { startAt: "asc" },
    include: { customer: true, tables: { include: { table: { include: { zone: true } } } } },
  });
  await sendDailySummary(to, dateLabel(from, "fr"), rows.map((r) => ({
    time: utcToKehl(r.startAt).hhmm,
    persons: r.partySize,
    name: `${r.customer.firstName} ${r.customer.lastName}`,
    phone: r.customer.phone,
    zone: r.tables[0] ? tr(r.tables[0].table.zone.name, "fr") : "",
    tables: r.tables.map((t) => t.table.label).join(", "),
    note: [r.occasion !== "NONE" ? r.occasion : "", r.specialRequest ?? ""].filter(Boolean).join(" · "),
  })));
  return NextResponse.json({ sent: rows.length });
}

/**
 * DSGVO : empreintes anti-abus effacées après 24 h ; clients sans réservation depuis
 * OPERATOR.retentionMonths mois anonymisés (les réservations restent pour les statistiques, sans nom).
 */
async function purgeOldData() {
  await prisma.rateEvent.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 3600_000) } } });
  const limit = new Date();
  limit.setMonth(limit.getMonth() - OPERATOR.retentionMonths);
  const stale = await prisma.customer.findMany({
    where: { email: { not: null }, reservations: { none: { startAt: { gte: limit } } } },
    select: { id: true },
  });
  for (const c of stale) {
    await prisma.customer.update({
      where: { id: c.id },
      data: { firstName: "Anonyme", lastName: "—", email: null, phone: "—", notes: null, marketingOptIn: false },
    });
    await prisma.reservation.updateMany({ where: { customerId: c.id }, data: { specialRequest: null, manageTokenHash: null } });
  }
}
