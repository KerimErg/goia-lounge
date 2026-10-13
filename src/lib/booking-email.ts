import "server-only";

type Lang = "fr" | "de" | "en";

/** Envoi via l'API Resend (sans dépendance). Ignoré sans erreur si RESEND_API_KEY / EMAIL_FROM manquent. */
async function send(to: string, subject: string, html: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY, from = process.env.EMAIL_FROM;
  if (!key || !from || !to) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
  }).catch(() => null);
  return !!res?.ok;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const frame = (body: string) => `<div style="font-family:Georgia,serif;max-width:520px;margin:auto;padding:32px;background:#f7f2ea;color:#1b1511">
<h1 style="font-weight:400;letter-spacing:.25em;text-align:center;margin:0 0 24px">GOIA</h1>${body}</div>`;
const button = (href: string, label: string) =>
  `<p style="text-align:center;margin:28px 0"><a href="${href}" style="background:#1b1511;color:#f7f2ea;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.2em;text-transform:uppercase">${label}</a></p>`;

export type BookingMail = {
  locale: Lang; reference: string; firstName: string; lastName: string; email: string; phone: string;
  dateLabel: string; time: string; persons: number; zone?: string | null; occasion?: string; message?: string;
  venue: string; address: string; manageUrl: string; instagram?: string | null;
};

const T = {
  fr: { subject: (v: string) => `Votre table au ${v} est réservée`, hi: "Bonjour", body: "Votre réservation est confirmée :", ref: "Référence", persons: "personnes",
    manage: "Annuler ma réservation", note: "Un empêchement ? Merci d'annuler avec le bouton ci-dessous pour libérer la table.", end: "À très vite !" },
  de: { subject: (v: string) => `Dein Tisch im ${v} ist reserviert`, hi: "Hallo", body: "Deine Reservierung ist bestätigt:", ref: "Referenz", persons: "Personen",
    manage: "Reservierung stornieren", note: "Du kannst nicht kommen? Bitte storniere über den Button, damit der Tisch frei wird.", end: "Bis bald!" },
  en: { subject: (v: string) => `Your table at ${v} is booked`, hi: "Hello", body: "Your booking is confirmed:", ref: "Reference", persons: "guests",
    manage: "Cancel my booking", note: "Can't make it? Please cancel with the button below so the table is freed.", end: "See you soon!" },
};

/** Confirmation au client, avec le lien d'annulation. */
export function sendCustomerConfirmation(m: BookingMail) {
  const t = T[m.locale];
  return send(m.email, t.subject(m.venue), frame(`<p>${t.hi} ${esc(m.firstName)},</p><p>${t.body}</p>
<p style="font-size:20px;margin:20px 0"><strong>${esc(m.dateLabel)} · ${m.time}</strong><br>${m.persons} ${t.persons}${m.zone ? ` · ${esc(m.zone)}` : ""}</p>
<p>${t.ref} : <strong style="letter-spacing:.1em">${m.reference}</strong></p>
<p style="color:#5e5145">${t.note}</p>${button(m.manageUrl, t.manage)}
<p style="color:#5e5145">${esc(m.venue)} · ${esc(m.address)}</p><p>${t.end}</p>`));
}

/** Copie à l'établissement (en français) : nouvelle réservation ou annulation. */
export function sendVenueNotice(to: string | null | undefined, kind: "new" | "cancel", m: BookingMail) {
  if (!to) return Promise.resolve(false);
  const title = kind === "new" ? "Nouvelle réservation" : "Réservation annulée par le client";
  return send(to, `${title} · ${m.dateLabel} ${m.time} · ${m.persons} pers. · ${m.lastName}`, frame(`<h2 style="font-weight:400">${title}</h2>
<p style="font-size:20px"><strong>${esc(m.dateLabel)} · ${m.time}</strong> · ${m.persons} pers.${m.zone ? ` · ${esc(m.zone)}` : ""}</p>
<p>${esc(m.firstName)} ${esc(m.lastName)}<br>${esc(m.phone)}<br>${esc(m.email)}</p>
${m.occasion && m.occasion !== "NONE" ? `<p>Occasion : ${esc(m.occasion)}</p>` : ""}${m.message ? `<p>Message : ${esc(m.message)}</p>` : ""}
<p>Référence : <strong>${m.reference}</strong></p>`), m.email);
}

/** Récapitulatif quotidien des réservations de la soirée, envoyé à l'établissement. */
export function sendDailySummary(to: string, dateLabel: string, rows: { time: string; persons: number; name: string; phone: string; zone: string; tables: string; note: string }[]) {
  const total = rows.reduce((n, r) => n + r.persons, 0);
  const list = rows.length
    ? `<table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px">${rows.map((r) => `<tr style="border-bottom:1px solid #d8cfc2"><td style="padding:8px 4px"><strong>${r.time}</strong></td><td>${r.persons} p.</td><td>${esc(r.name)}<br><span style="color:#5e5145">${esc(r.phone)}</span></td><td>${esc(r.zone)} ${esc(r.tables)}</td><td style="color:#5e5145">${esc(r.note)}</td></tr>`).join("")}</table>`
    : "<p>Aucune réservation pour ce soir.</p>";
  return send(to, `Ce soir · ${rows.length} réservation(s) · ${total} pers.`, frame(`<h2 style="font-weight:400">Réservations — ${esc(dateLabel)}</h2>${list}`));
}
