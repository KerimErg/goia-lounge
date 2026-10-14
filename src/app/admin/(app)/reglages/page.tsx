import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { emailConfigured } from "@/lib/booking-email";
import { venueInbox } from "@/lib/booking-common";
import { AddUserForm, DeleteUserButton, NotifyForm, PasswordForm, TestEmailButton } from "./forms";

export const dynamic = "force-dynamic";

/** Réglages : où arrivent les e-mails de réservation, mot de passe, comptes des propriétaires. */
export default async function Settings() {
  const me = await requireStaff();
  const [settings, users] = await Promise.all([
    prisma.settings.findUniqueOrThrow({ where: { id: 1 } }),
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
  ]);
  const admin = me.role === "ADMIN";
  const inbox = venueInbox(settings.notifyEmail);
  const card = "rounded-3xl bg-white p-5 shadow-soft sm:p-7";

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <h1 className="font-display text-4xl">Réglages</h1>

      <section className={card}>
        <h2 className="font-display text-2xl">E-mails de réservation</h2>
        <p className="mt-2 text-sm text-ink/65">
          À chaque réservation, le client reçoit sa confirmation (avec un lien pour annuler) et le lounge reçoit une copie.
          Un récapitulatif de la soirée est aussi envoyé chaque après-midi.
        </p>
        <p className={`mt-4 rounded-2xl px-4 py-3 text-sm ${emailConfigured() ? "bg-[#8fc79a]/20" : "bg-amber/15"}`}>
          {emailConfigured()
            ? <>Envoi des e-mails : <strong>activé</strong>{inbox ? <> · copies envoyées à <strong>{inbox}</strong></> : " · ajoutez ci-dessous l'adresse qui doit recevoir les réservations"}.</>
            : <>Envoi des e-mails : <strong>pas encore activé</strong>. Il faut renseigner <code>RESEND_API_KEY</code> et <code>EMAIL_FROM</code> dans Vercel (Settings → Environment Variables), puis redéployer.</>}
        </p>
        {admin && <NotifyForm current={settings.notifyEmail ?? ""} />}
        <TestEmailButton />
      </section>

      <section className={card}>
        <h2 className="font-display text-2xl">Mon mot de passe</h2>
        <PasswordForm />
      </section>

      <section className={card}>
        <h2 className="font-display text-2xl">Comptes de l’équipe</h2>
        <p className="mt-2 text-sm text-ink/65">Chaque propriétaire a son propre accès à cet espace (adresse : <strong>/admin</strong> sur le site).</p>
        <ul className="mt-5 divide-y divide-ink/10">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">{u.name}{u.id === me.id && <span className="ml-2 text-xs text-ink/50">(vous)</span>}</p>
                <p className="text-sm text-ink/60">{u.email} · {u.role === "ADMIN" ? "Propriétaire" : "Équipe"}</p>
              </div>
              {admin && u.id !== me.id && <DeleteUserButton id={u.id} email={u.email} />}
            </li>
          ))}
        </ul>
        {admin && <AddUserForm />}
      </section>
    </div>
  );
}
