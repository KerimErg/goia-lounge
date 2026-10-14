"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { adminSlots, createManual, type ActionState } from "../../actions";
import { cn } from "@/lib/utils";

type Slot = { time: string; available: boolean; left?: number };
const field = "h-12 w-full rounded-xl border border-ink/15 bg-white px-4 outline-none focus:border-ink";
const label = "mb-1.5 block text-xs font-medium tracking-wide text-ink/60";

export function ManualForm({ defaultDate, zones }: { defaultDate: string; zones: { slug: string; name: string }[] }) {
  const [state, action, saving] = useActionState<ActionState, FormData>(createManual, null);
  const [date, setDate] = useState(defaultDate);
  const [persons, setPersons] = useState(2);
  const [zone, setZone] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loading, start] = useTransition();

  useEffect(() => {
    setTime("");
    start(async () => setSlots(await adminSlots(date, persons, zone || null)));
  }, [date, persons, zone]);

  return (
    <form action={action} className="mt-8 grid gap-5">
      <div className="grid grid-cols-2 gap-3">
        <div><label className={label} htmlFor="date">Date</label><input id="date" name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} required /></div>
        <div><label className={label} htmlFor="persons">Personnes</label>
          <select id="persons" name="persons" value={persons} onChange={(e) => setPersons(Number(e.target.value))} className={field}>
            {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
      <div><span className={label}>Espace</span>
        <div className="flex flex-wrap gap-2">
          {[{ slug: "", name: "Peu importe" }, ...zones].map((z) => (
            <button key={z.slug} type="button" onClick={() => setZone(z.slug)} className={cn("rounded-full border px-4 py-2 text-sm", zone === z.slug ? "border-ink bg-ink text-ivory" : "border-ink/15 bg-white")}>{z.name}</button>
          ))}
        </div>
        <input type="hidden" name="zone" value={zone} />
      </div>

      <div><span className={label}>Heure d’arrivée</span>
        {loading || !slots ? <p className="text-sm text-ink/50">Recherche des créneaux…</p> : slots.length === 0 ? (
          <p className="rounded-xl bg-linen px-4 py-3 text-sm">Fermé ce jour-là, ou plus aucun créneau.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {slots.map((s) => (
              <button key={s.time} type="button" disabled={!s.available} onClick={() => setTime(s.time)}
                className={cn("h-11 rounded-xl border text-sm tabular-nums", time === s.time ? "border-ink bg-ink text-ivory" : s.available ? "border-ink/15 bg-white hover:border-ink" : "border-transparent bg-ink/5 text-ink/30 line-through")}>
                {s.time}
              </button>
            ))}
          </div>
        )}
        <input type="hidden" name="time" value={time} />
      </div>

      <div><label className={label} htmlFor="name">Nom du client</label><input id="name" name="name" required className={field} placeholder="Prénom Nom" /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className={label} htmlFor="phone">Téléphone</label><input id="phone" name="phone" type="tel" required className={field} /></div>
        <div><label className={label} htmlFor="email">E-mail (facultatif)</label><input id="email" name="email" type="email" className={field} /></div>
      </div>
      <div><label className={label} htmlFor="note">Note interne (facultatif)</label><input id="note" name="note" className={field} placeholder="Ex. : anniversaire, table près de la terrasse…" /></div>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="radio" name="source" value="PHONE" defaultChecked /> Par téléphone</label>
        <label className="flex items-center gap-2"><input type="radio" name="source" value="WALK_IN" /> Sur place</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="notify" defaultChecked /> Envoyer la confirmation par e-mail (si e-mail)</label>
      </div>

      {state?.error && <p role="alert" className="rounded-xl bg-[#e88a7a]/15 px-4 py-3 text-sm">{state.error}</p>}
      <button disabled={saving || !time} className="h-13 rounded-full bg-ink text-sm tracking-[0.2em] text-ivory uppercase transition-colors hover:bg-taupe disabled:opacity-40">
        {saving ? "Enregistrement…" : time ? `Réserver à ${time}` : "Choisissez une heure"}
      </button>
    </form>
  );
}
