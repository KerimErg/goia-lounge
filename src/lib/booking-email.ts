import "server-only";

/**
 * E-mail de confirmation via l'API Resend (sans dépendance).
 * Envoyé seulement si RESEND_API_KEY et EMAIL_FROM sont définis ; sinon ignoré sans erreur.
 */
export async function sendBookingEmail(p: {
  to: string; locale: "fr" | "de" | "en"; reference: string; firstName: string;
  dateLabel: string; time: string; persons: number; venue: string; address: string;
}) {
  const key = process.env.RESEND_API_KEY, from = process.env.EMAIL_FROM;
  if (!key || !from) return false;
  const T = {
    fr: { subject: `Votre table au ${p.venue} est réservée`, hi: `Bonjour ${p.firstName},`, body: "Votre réservation est confirmée :", ref: "Référence", persons: "personnes", end: "À très vite !" },
    de: { subject: `Dein Tisch im ${p.venue} ist reserviert`, hi: `Hallo ${p.firstName},`, body: "Deine Reservierung ist bestätigt:", ref: "Referenz", persons: "Personen", end: "Bis bald!" },
    en: { subject: `Your table at ${p.venue} is booked`, hi: `Hello ${p.firstName},`, body: "Your booking is confirmed:", ref: "Reference", persons: "guests", end: "See you soon!" },
  }[p.locale];
  const html = `<div style="font-family:Georgia,serif;max-width:520px;margin:auto;padding:32px;background:#f7f2ea;color:#1b1511">
<h1 style="font-weight:400;letter-spacing:.2em;text-align:center">GOIA</h1>
<p>${T.hi}</p><p>${T.body}</p>
<p style="font-size:18px"><strong>${p.dateLabel} · ${p.time}</strong><br>${p.persons} ${T.persons}</p>
<p>${T.ref} : <strong>${p.reference}</strong></p>
<p style="color:#5e5145">${p.venue} · ${p.address}</p><p>${T.end}</p></div>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: p.to, subject: T.subject, html }),
  }).catch(() => null);
  return !!res?.ok;
}
