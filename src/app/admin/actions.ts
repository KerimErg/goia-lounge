"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { createBooking, Unavailable } from "@/lib/booking-create";
import { sendCustomerCancellation, sendCustomerConfirmation } from "@/lib/booking-email";
import { dateLabel, manageUrl, venueInbox } from "@/lib/booking-common";
import { tr } from "@/lib/localized";
import { utcToKehl } from "@/lib/time";

export type ActionState = { ok?: string; error?: string } | null;

const back = (date?: string) => (date ? `/admin?date=${date}` : "/admin");

/* ---------- Réservations : statut ---------- */

/** Arrivé · Absent · Terminé (libère la table) · Rétablir (si la table est encore libre). */
export async function setStatus(id: string, status: Extract<ReservationStatus, "CONFIRMED" | "SEATED" | "NO_SHOW" | "COMPLETED">) {
  await requireStaff();
  try {
    await prisma.reservation.update({ where: { id }, data: { status, ...(status === "CONFIRMED" ? { cancelledBy: null } : {}) } });
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    if (msg.includes("no_overlap") || msg.includes("23P01")) return { error: "Impossible de rétablir : la table a été reprise entre-temps." };
    throw e;
  }
  revalidatePath("/admin");
  return { ok: "Mis à jour" };
}

/** Annulation par l'équipe (libère la table), avec e-mail au client si demandé. */
export async function cancelReservation(id: string, notify: boolean) {
  await requireStaff();
  const r = await prisma.reservation.update({
    where: { id },
    data: { status: "CANCELLED", cancelledBy: "staff" },
    include: { customer: true },
  });
  let emailed = false;
  if (notify && r.customer.email) {
    const s = await prisma.settings.findUniqueOrThrow({ where: { id: 1 } });
    const locale = (["fr", "de", "en"].includes(r.locale) ? r.locale : "fr") as "fr" | "de" | "en";
    emailed = await sendCustomerCancellation({
      locale, reference: r.reference, firstName: r.customer.firstName, lastName: r.customer.lastName,
      email: r.customer.email, phone: r.customer.phone, dateLabel: dateLabel(r.startAt, locale),
      time: utcToKehl(r.startAt).hhmm, persons: r.partySize, venue: s.venueName, address: "", manageUrl: "",
    }, venueInbox(s.notifyEmail));
  }
  revalidatePath("/admin");
  return { ok: emailed ? "Réservation annulée — le client a été prévenu par e-mail" : "Réservation annulée" };
}

/** Note interne (visible uniquement par l'équipe). */
export async function saveNote(id: string, note: string) {
  await requireStaff();
  await prisma.reservation.update({ where: { id }, data: { internalNote: note.trim().slice(0, 500) || null } });
  revalidatePath("/admin");
  return { ok: "Note enregistrée" };
}

/* ---------- Nouvelle réservation (téléphone, sur place…) ---------- */

const manualSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Choisissez une heure"),
  persons: z.coerce.number().int().min(1).max(30),
  zone: z.string().max(40).optional().default(""),
  name: z.string().trim().min(1, "Nom obligatoire").max(120),
  phone: z.string().trim().min(6, "Téléphone obligatoire").max(30),
  email: z.union([z.literal(""), z.string().trim().toLowerCase().email("E-mail invalide")]).default(""),
  source: z.enum(["PHONE", "WALK_IN", "ADMIN"]).default("PHONE"),
  note: z.string().trim().max(500).optional().default(""),
  notify: z.string().optional(),
});

export async function createManual(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const p = manualSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Formulaire incomplet" };
  const d = p.data;
  const [first, ...rest] = d.name.replace(/\s+/g, " ").split(" ");
  let b;
  try {
    b = await createBooking({
      date: d.date, time: d.time, persons: d.persons, zone: d.zone || null, firstName: first, lastName: rest.join(" ") || "—",
      phone: d.phone, email: d.email || null, locale: "fr", source: d.source, internalNote: d.note || null,
    });
  } catch (e) {
    if (e instanceof Unavailable) return { error: "Ce créneau n'est plus disponible (plus de table libre ou plafond atteint). Choisissez une autre heure." };
    throw e;
  }
  if (d.notify && b.email) {
    const s = b.settings;
    await sendCustomerConfirmation({
      locale: "fr", reference: b.reference, firstName: first, lastName: rest.join(" "), email: b.email, phone: d.phone,
      dateLabel: dateLabel(b.startAt, "fr"), time: d.time, persons: d.persons, zone: b.zone ? tr(b.zone.name, "fr") : null,
      venue: s.venueName, address: `${s.street}, ${s.postalCode} ${s.city}`, manageUrl: manageUrl("fr", b.reference, b.token),
    });
  }
  revalidatePath("/admin");
  redirect(`${back(d.date)}&created=${b.reference}`);
}

/* ---------- Réglages ---------- */

export async function saveNotifyEmail(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const v = String(form.get("notifyEmail") ?? "").trim().toLowerCase();
  if (v && !z.string().email().safeParse(v).success) return { error: "Adresse e-mail invalide" };
  await prisma.settings.update({ where: { id: 1 }, data: { notifyEmail: v || null } });
  revalidatePath("/admin/reglages");
  return { ok: v ? `Les réservations seront envoyées à ${v}` : "Adresse retirée" };
}

export async function changePassword(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireStaff();
  const current = String(form.get("current") ?? ""), next = String(form.get("next") ?? "");
  if (next.length < 10) return { error: "Le nouveau mot de passe doit faire au moins 10 caractères" };
  const user = await prisma.user.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await bcrypt.compare(current, user.passwordHash))) return { error: "Mot de passe actuel incorrect" };
  await prisma.user.update({ where: { id: me.id }, data: { passwordHash: await bcrypt.hash(next, 10) } });
  return { ok: "Mot de passe modifié" };
}

const userSchema = z.object({
  name: z.string().trim().min(1, "Nom obligatoire").max(60),
  email: z.string().trim().toLowerCase().email("E-mail invalide"),
  password: z.string().min(10, "Mot de passe : 10 caractères minimum"),
  role: z.enum(["ADMIN", "STAFF"]).default("ADMIN"),
});

export async function addUser(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const p = userSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Formulaire incomplet" };
  if (await prisma.user.findUnique({ where: { email: p.data.email } })) return { error: "Un compte existe déjà avec cet e-mail" };
  await prisma.user.create({ data: { name: p.data.name, email: p.data.email, role: p.data.role, passwordHash: await bcrypt.hash(p.data.password, 10) } });
  revalidatePath("/admin/reglages");
  return { ok: `Compte créé pour ${p.data.email}` };
}

export async function deleteUser(id: string) {
  const me = await requireAdmin();
  if (id === me.id) return { error: "Vous ne pouvez pas supprimer votre propre compte" };
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/reglages");
  return { ok: "Compte supprimé" };
}

/** Créneaux libres pour l'ajout manuel (l'équipe peut dépasser la taille de groupe autorisée en ligne). */
export async function adminSlots(date: string, persons: number, zone: string | null) {
  await requireStaff();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(persons) || persons < 1 || persons > 30) return [];
  const { availability, bookingContext } = await import("@/lib/availability");
  const ctx = await bookingContext();
  const { slots } = await availability(ctx, date, persons, zone || null);
  return slots;
}
