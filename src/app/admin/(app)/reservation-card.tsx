"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Mail, MessageSquare, Phone, RotateCcw, UserX, X } from "lucide-react";
import { cancelReservation, saveNote, setStatus } from "../actions";
import { cn } from "@/lib/utils";

export type Row = {
  id: string; reference: string; status: string; source: string; date: string; time: string; end: string; persons: number;
  name: string; phone: string; email: string | null; tables: string; occasion: string; message: string | null; note: string | null; cancelledBy: string | null;
};

const STATUS: Record<string, { label: string; cls: string }> = {
  CONFIRMED: { label: "Confirmée", cls: "bg-champagne/25 text-ink" },
  PENDING: { label: "En attente", cls: "bg-amber/20 text-ink" },
  SEATED: { label: "Arrivée", cls: "bg-[#8fc79a]/30 text-ink" },
  COMPLETED: { label: "Terminée", cls: "bg-ink/10 text-ink/70" },
  CANCELLED: { label: "Annulée", cls: "bg-[#e88a7a]/25 text-ink" },
  NO_SHOW: { label: "Absente", cls: "bg-[#e88a7a]/25 text-ink" },
};
const SOURCE: Record<string, string> = { WEBSITE: "Site", PHONE: "Téléphone", WALK_IN: "Sur place", ADMIN: "Équipe" };
const OCCASION: Record<string, string> = { BIRTHDAY: "Anniversaire", FRIENDS: "Entre amis", DATE: "En amoureux", BUSINESS: "Pro", OTHER: "Autre" };
const shortDate = (ymd: string) => new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${ymd}T12:00:00Z`));

/** Une réservation : heure, nom, personnes, table, contact ; actions selon son état. */
export function ReservationCard({ r, showDate }: { r: Row; showDate?: boolean }) {
  const [pending, start] = useTransition();
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState(r.note ?? "");
  const done = (res: { ok?: string; error?: string }) => (res.error ? toast.error(res.error) : toast.success(res.ok));
  const run = (fn: () => Promise<{ ok?: string; error?: string }>) => start(async () => { done(await fn()); });
  const live = ["CONFIRMED", "PENDING", "SEATED"].includes(r.status);
  const st = STATUS[r.status] ?? STATUS.CONFIRMED;

  return (
    <li className={cn("rounded-3xl bg-white p-4 shadow-soft transition-opacity sm:p-5", !live && "opacity-70", pending && "opacity-50")}>
      <div className="flex items-start gap-4">
        <div className="w-16 shrink-0 text-center">
          {showDate && <p className="text-[0.65rem] text-ink/55 first-letter:uppercase">{shortDate(r.date)}</p>}
          <p className="font-display text-2xl leading-none">{r.time}</p>
          <p className="mt-1 text-[0.65rem] text-ink/45">→ {r.end}</p>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-medium">{r.name}</p>
            <span className={cn("rounded-full px-2.5 py-0.5 text-[0.68rem]", st.cls)}>{st.label}{r.status === "CANCELLED" && r.cancelledBy ? (r.cancelledBy === "client" ? " par le client" : " par l'équipe") : ""}</span>
          </div>
          <p className="mt-1 text-sm text-ink/70">
            <strong className="text-ink">{r.persons} pers.</strong>{r.tables ? ` · ${r.tables}` : ""} · {SOURCE[r.source] ?? r.source} · <span className="tracking-wider">{r.reference}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"><Phone className="size-3.5" />{r.phone}</a>
            {r.email && <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1.5 break-all underline-offset-4 hover:underline"><Mail className="size-3.5" />{r.email}</a>}
          </div>
          {(r.occasion !== "NONE" || r.message) && (
            <p className="mt-2 rounded-xl bg-linen px-3 py-2 text-sm">{OCCASION[r.occasion] ? <strong>{OCCASION[r.occasion]}</strong> : null}{OCCASION[r.occasion] && r.message ? " — " : ""}{r.message}</p>
          )}
          {r.note && !noteOpen && <p className="mt-2 text-sm text-taupe-deep">Note : {r.note}</p>}
          {noteOpen && (
            <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); run(() => saveNote(r.id, note)); setNoteOpen(false); }}>
              <input autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note interne (visible par l'équipe)" className="h-10 flex-1 rounded-full border border-ink/15 px-4 text-sm outline-none focus:border-ink" />
              <button className="rounded-full bg-ink px-4 text-sm text-ivory">OK</button>
            </form>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/10 pt-4 text-sm">
        {(r.status === "CONFIRMED" || r.status === "PENDING") && (
          <Btn onClick={() => run(() => setStatus(r.id, "SEATED"))} icon={Check} strong>Arrivée</Btn>
        )}
        {r.status === "SEATED" && <Btn onClick={() => run(() => setStatus(r.id, "COMPLETED"))} icon={Check} strong>Terminée (libérer la table)</Btn>}
        {(r.status === "CONFIRMED" || r.status === "PENDING") && (
          <Btn onClick={() => run(() => setStatus(r.id, "NO_SHOW"))} icon={UserX}>Absente</Btn>
        )}
        {live && (
          <Btn
            danger
            icon={X}
            onClick={() => {
              if (!confirm(`Annuler la réservation de ${r.name} (${r.persons} pers., ${r.time}) ?`)) return;
              const notify = !!r.email && confirm("Prévenir le client par e-mail ?");
              run(() => cancelReservation(r.id, notify));
            }}
          >
            Annuler
          </Btn>
        )}
        {(r.status === "CANCELLED" || r.status === "NO_SHOW" || r.status === "COMPLETED") && (
          <Btn onClick={() => run(() => setStatus(r.id, "CONFIRMED"))} icon={RotateCcw}>Rétablir</Btn>
        )}
        <Btn onClick={() => setNoteOpen((o) => !o)} icon={MessageSquare}>{r.note ? "Modifier la note" : "Note"}</Btn>
      </div>
    </li>
  );
}

function Btn({ children, onClick, icon: Icon, strong, danger }: { children: React.ReactNode; onClick: () => void; icon: React.ComponentType<{ className?: string }>; strong?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 transition-colors",
        strong ? "bg-ink text-ivory hover:bg-taupe" : danger ? "border border-[#e88a7a]/60 text-[#b4483a] hover:bg-[#e88a7a]/10" : "border border-ink/15 hover:border-ink",
      )}
    >
      <Icon className="size-3.5" />{children}
    </button>
  );
}
