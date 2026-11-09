"use client";

import { useActionState, useState, useTransition } from "react";
import { toast } from "sonner";
import { addUser, changePassword, deleteUser, saveDailySummary, saveNotifyEmail, testEmail, type ActionState } from "../../actions";

const field = "h-11 w-full rounded-xl border border-ink/15 bg-white px-4 text-sm outline-none focus:border-ink";
const btn = "h-11 rounded-full bg-ink px-5 text-sm text-ivory transition-colors hover:bg-taupe disabled:opacity-50";
const Msg = ({ s }: { s: ActionState }) => (s?.error ? <p role="alert" className="text-sm text-[#b4483a]">{s.error}</p> : s?.ok ? <p className="text-sm text-[#3c7a48]">{s.ok}</p> : null);

export function NotifyForm({ current }: { current: string }) {
  const [s, action, pending] = useActionState<ActionState, FormData>(saveNotifyEmail, null);
  return (
    <form action={action} className="mt-5 grid gap-2">
      <label htmlFor="notifyEmail" className="text-xs font-medium text-ink/60">Adresse qui reçoit les réservations</label>
      <div className="flex gap-2">
        <input id="notifyEmail" name="notifyEmail" type="email" defaultValue={current} placeholder="contact@goia-lounge.de" className={field} />
        <button className={btn} disabled={pending}>Enregistrer</button>
      </div>
      <Msg s={s} />
    </form>
  );
}

export function DailySummaryToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();
  const flip = () => {
    const next = !on;
    setOn(next);
    start(async () => {
      const r = await saveDailySummary(next);
      if (r?.error) { setOn(!next); toast.error(r.error); } else toast.success(r?.ok);
    });
  };
  return (
    <label className="mt-5 flex cursor-pointer items-start justify-between gap-4 rounded-2xl bg-linen px-4 py-3">
      <span className="text-sm">
        <span className="font-medium">Récapitulatif de la soirée</span>
        <span className="mt-0.5 block text-ink/60">Un e-mail chaque après-midi avec les réservations du soir (rien n’est envoyé les soirs sans réservation).</span>
      </span>
      <input type="checkbox" role="switch" checked={on} disabled={pending} onChange={flip} className="peer sr-only" />
      <span aria-hidden className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-ink ${on ? "bg-ink" : "bg-ink/20"}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] ${on ? "left-[1.375rem]" : "left-0.5"}`} />
      </span>
    </label>
  );
}

export function PasswordForm() {
  const [s, action, pending] = useActionState<ActionState, FormData>(changePassword, null);
  return (
    <form action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
      <input name="current" type="password" autoComplete="current-password" placeholder="Mot de passe actuel" className={field} required />
      <input name="next" type="password" autoComplete="new-password" placeholder="Nouveau (10 caractères min.)" className={field} required minLength={10} />
      <div className="sm:col-span-2 flex items-center gap-3"><button className={btn} disabled={pending}>Changer le mot de passe</button><Msg s={s} /></div>
    </form>
  );
}

export function AddUserForm() {
  const [s, action, pending] = useActionState<ActionState, FormData>(addUser, null);
  return (
    <form action={action} className="mt-5 grid gap-3 rounded-2xl bg-linen p-4 sm:grid-cols-2">
      <p className="text-sm font-medium sm:col-span-2">Ajouter un accès</p>
      <input name="name" placeholder="Nom" className={field} required />
      <input name="email" type="email" placeholder="E-mail" className={field} required />
      <input name="password" type="password" autoComplete="new-password" placeholder="Mot de passe (10 caractères min.)" className={field} required minLength={10} />
      <select name="role" className={field} defaultValue="ADMIN">
        <option value="ADMIN">Propriétaire (tout voir et tout gérer)</option>
        <option value="STAFF">Équipe (réservations uniquement)</option>
      </select>
      <div className="sm:col-span-2 flex items-center gap-3"><button className={btn} disabled={pending}>Créer l’accès</button><Msg s={s} /></div>
    </form>
  );
}

export function DeleteUserButton({ id, email }: { id: string; email: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => { if (confirm(`Supprimer l'accès de ${email} ?`)) start(async () => { const r = await deleteUser(id); if (r.error) toast.error(r.error); else toast.success(r.ok); }); }}
      className="rounded-full border border-[#e88a7a]/60 px-3 py-1.5 text-sm text-[#b4483a] hover:bg-[#e88a7a]/10"
    >
      Supprimer
    </button>
  );
}

export function TestEmailButton() {
  const [s, action, pending] = useActionState<ActionState, FormData>(testEmail, null);
  return (
    <form action={action} className="mt-4 flex flex-wrap items-center gap-3">
      <button className="h-11 rounded-full border border-ink/20 px-5 text-sm transition-colors hover:border-ink disabled:opacity-50" disabled={pending}>{pending ? "Envoi…" : "Envoyer un e-mail de test"}</button>
      <Msg s={s} />
    </form>
  );
}
