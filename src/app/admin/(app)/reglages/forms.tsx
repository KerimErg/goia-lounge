"use client";

import { useActionState, useTransition } from "react";
import { toast } from "sonner";
import { addUser, changePassword, deleteUser, saveNotifyEmail, type ActionState } from "../../actions";

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
