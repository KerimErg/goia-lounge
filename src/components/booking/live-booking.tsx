"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { addDays, nowInKehl } from "@/lib/time";
import { cn } from "@/lib/utils";

type DayStatus = "available" | "full" | "closed" | "out";
type Slot = { time: string; available: boolean; left: number };
const LIVE_REFRESH_MS = 30_000;
const FEW_SEATS = 6;

const ymOf = (ymd: string) => ymd.slice(0, 7);
const shiftMonth = (ym: string, n: number) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};
const utcDate = (ymd: string) => new Date(`${ymd}T12:00:00Z`);

/**
 * Réservation en direct, comme sur le premier site GOIA :
 * 1. nombre de personnes → 2. calendrier (disponible / complet / fermé) →
 * 3. horaires en temps réel → 4. coordonnées → confirmation immédiate.
 */
export function LiveBooking({ zones, maxParty, maxDaysAhead, instagram, initial }: {
  zones: { slug: string; name: string }[];
  maxParty: number;
  maxDaysAhead: number;
  instagram: string | null;
  initial?: { date?: string; time?: string; persons?: string; zone?: string };
}) {
  const t = useTranslations("bk");
  const locale = useLocale() as "fr" | "de" | "en";
  const today = useMemo(() => nowInKehl().ymd, []);
  const lastDay = useMemo(() => addDays(today, maxDaysAhead), [today, maxDaysAhead]);

  const [persons, setPersons] = useState(() => Math.min(Math.max(Number(initial?.persons) || 2, 1), maxParty));
  const [zone, setZone] = useState(zones.some((z) => z.slug === initial?.zone) ? initial!.zone! : "");
  const [month, setMonth] = useState(ymOf(initial?.date && initial.date >= today ? initial.date : today));
  const [days, setDays] = useState<Record<string, DayStatus>>({});
  const [date, setDate] = useState(initial?.date && initial.date >= today ? initial.date : "");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotsState, setSlotsState] = useState<"idle" | "loading" | "error">("idle");
  const [time, setTime] = useState(initial?.time ?? "");
  const [taken, setTaken] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "", age: false, privacy: false, botcheck: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ reference: string; emailed: boolean } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const slotsRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  // Réservation validée : le formulaire (haut) est remplacé par la confirmation (courte) ;
  // on recentre l'écran sur la confirmation au lieu de laisser la page « tomber » vers le bas.
  useEffect(() => {
    if (!done) return;
    const el = doneRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  }, [done]);

  // 2. État des jours du mois affiché
  useEffect(() => {
    const ctrl = new AbortController();
    const url = `/api/availability/month?${new URLSearchParams({ month, persons: String(persons), ...(zone ? { zone } : {}) })}`;
    // Jusqu'à 3 essais : la base gratuite peut mettre quelques secondes à se réveiller
    const load = async (attempt: number): Promise<void> => {
      try {
        const r = await fetch(url, { signal: ctrl.signal });
        if (!r.ok) throw new Error(String(r.status));
        const j: { days?: Record<string, DayStatus> } = await r.json();
        setDays((d) => ({ ...d, ...(j.days ?? {}) }));
      } catch {
        if (ctrl.signal.aborted || attempt >= 3) return;
        await new Promise((res) => setTimeout(res, 1200 * attempt));
        if (!ctrl.signal.aborted) return load(attempt + 1);
      }
    };
    load(1);
    return () => ctrl.abort();
  }, [month, persons, zone]);

  // 3. Créneaux du jour choisi, rafraîchis en temps réel
  const loadSlots = useCallback(async (quiet = false) => {
    if (!date) return;
    if (!quiet) setSlotsState("loading");
    try {
      const url = `/api/availability?${new URLSearchParams({ date, persons: String(persons), ...(zone ? { zone } : {}) })}`;
      // Un second essai si le serveur ne répond pas du premier coup (réveil de la base)
      let r = await fetch(url, { cache: "no-store" }).catch(() => null);
      if (!r?.ok) { await new Promise((res) => setTimeout(res, 1500)); r = await fetch(url, { cache: "no-store" }); }
      if (!r.ok) throw new Error(String(r.status));
      const j: { slots?: Slot[] } = await r.json();
      setSlots(j.slots ?? []);
      setSlotsState("idle");
      setTime((cur) => (j.slots?.some((s) => s.time === cur && s.available) ? cur : ""));
    } catch {
      if (!quiet) setSlotsState("error");
    }
  }, [date, persons, zone]);

  useEffect(() => {
    setSlots(null);
    loadSlots();
    if (!date) return;
    const id = window.setInterval(() => document.visibilityState === "visible" && loadSlots(true), LIVE_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [date, loadSlots]);

  const fmtDay = (ymd: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { ...opts, timeZone: "UTC" }).format(utcDate(ymd));
  const summary = date && time ? t("summary", { date: fmtDay(date, { weekday: "short", day: "numeric", month: "short" }), time, n: persons }) : "";

  // Grille du calendrier (semaine du lundi au dimanche)
  const grid = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const lead = (first.getUTCDay() + 6) % 7;
    const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return [...Array<null>(lead).fill(null), ...Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`)];
  }, [month]);
  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => fmtDay(addDays("2026-10-12", i), { weekday: "short" }).replace(".", "")), [locale]); // eslint-disable-line react-hooks/exhaustive-deps

  function choosePersons(n: number) {
    setPersons(n);
    setDays({});
    setTime("");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t("errRequired");
    if (!form.phone.trim()) e.phone = t("errRequired");
    else if (!/^[+\d\s().-]{6,25}$/.test(form.phone.trim())) e.phone = t("errPhone");
    if (!form.email.trim()) e.email = t("errRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = t("errEmail");
    if (!form.age) e.age = t("errCheck");
    if (!form.privacy) e.privacy = t("errCheck");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setAlert("");
    if (form.botcheck || !validate()) return;
    setSending(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date, time, persons, zone: zone || null, locale, name: form.name, phone: form.phone, email: form.email,
          message: form.message, adult: form.age, privacy: form.privacy,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) { setDone(j); return; }
      if (res.status === 409) {
        setTaken(true); setTime(""); await loadSlots();
        slotsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      setAlert(res.status === 429 ? t("errRate") : t("errGeneric"));
    } catch {
      setAlert(t("errGeneric"));
    } finally {
      setSending(false);
    }
  }

  function reset() {
    setDone(null); setTime(""); setTaken(false); setErrors({}); setAlert("");
    setForm({ name: "", phone: "", email: "", message: "", age: false, privacy: false, botcheck: false });
    loadSlots();
  }

  const num = (n: number) => <span className="grid size-[26px] shrink-0 place-items-center rounded-full bg-champagne text-[0.8rem] font-bold text-ink">{n}</span>;
  const label = "mb-3.5 flex flex-wrap items-center gap-2.5 font-sans text-base font-semibold";
  const input = "h-12 w-full rounded-xl border border-ivory/15 bg-ink/50 px-4 text-ivory outline-none transition-colors placeholder:text-ivory/35 focus:border-champagne";
  const err = (k: string) => errors[k] && <p className="mt-1.5 text-xs text-[#e88a7a]">{errors[k]}</p>;

  if (done) {
    return (
      <div ref={doneRef} role="status" className="mx-auto max-w-[1040px] scroll-mt-28 rounded-3xl border border-ivory/10 bg-[#211a16]/95 p-8 text-center text-ivory shadow-lift outline-none sm:p-12" tabIndex={-1}>
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-champagne text-ink"><Check className="size-8" strokeWidth={2.2} /></span>
        <h3 className="mt-6 text-[clamp(2rem,7vw,2.8rem)] leading-tight">{t("doneTitle", { name: form.name.split(" ")[0] })}</h3>
        <p className="mx-auto mt-3 max-w-[46ch] text-ivory/85">
          {t(done.emailed ? "doneText" : "doneTextNoMail", { date: fmtDay(date, { weekday: "long", day: "numeric", month: "long" }), time, n: persons, email: form.email })}
        </p>
        <p className="mt-5 text-ivory/60">{t("ref")} <strong className="ml-1.5 inline-block rounded-full border border-ivory/15 bg-ink px-4 py-1.5 font-mono tracking-[0.08em] text-ivory">{done.reference}</strong></p>
        <p className="mt-3 text-sm text-ivory/60">{t("idCheck")}</p>
        <button type="button" onClick={reset} className="mt-7 h-12 rounded-xl bg-champagne px-7 font-semibold text-ink transition-colors hover:bg-[#d9bd94]">{t("again")}</button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1040px] gap-7 rounded-3xl border border-ivory/10 bg-[#211a16]/95 p-5 text-left text-ivory shadow-lift sm:p-7 lg:grid-cols-2 lg:gap-10">
      {/* Colonne gauche : personnes + calendrier */}
      <div className="grid content-start gap-7">
        <div>
          <h3 className={label}>{num(1)}{t("persons")}</h3>
          <div role="radiogroup" aria-label={t("persons")} className="grid grid-cols-5 gap-2">
            {Array.from({ length: maxParty }, (_, i) => i + 1).map((n) => (
              <button
                key={n} type="button" role="radio" aria-checked={persons === n} aria-label={t("personsAria", { n })}
                onClick={() => choosePersons(n)}
                className={cn("min-h-[46px] rounded-xl border font-semibold transition-colors", persons === n ? "border-champagne bg-champagne text-ink" : "border-ivory/15 bg-ink/50 hover:border-champagne")}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-2.5 text-[0.8rem] text-ivory/55">
            {t.rich("more", { max: maxParty, link: (c) => (instagram ? <a href={instagram} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-ivory">{c}</a> : <>{c}</>) })}
          </p>
          {zones.length > 1 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="mr-1 text-ivory/55">{t("zone")}</span>
              {[{ slug: "", name: t("anyZone") }, ...zones].map((z) => (
                <button
                  key={z.slug || "any"} type="button" aria-pressed={zone === z.slug} onClick={() => { setZone(z.slug); setDays({}); }}
                  className={cn("rounded-full border px-3.5 py-1.5 transition-colors", zone === z.slug ? "border-champagne bg-champagne/15 text-champagne" : "border-ivory/15 hover:border-champagne")}
                >
                  {z.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className={label}>{num(2)}{t("date")}</h3>
          <div className="rounded-[18px] border border-ivory/10 bg-ink/35 p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <button type="button" aria-label={t("prevMonth")} disabled={month <= ymOf(today)} onClick={() => setMonth((m) => shiftMonth(m, -1))} className="grid size-[38px] place-items-center rounded-[10px] border border-ivory/10 disabled:cursor-not-allowed disabled:opacity-25"><ChevronLeft className="size-[18px]" /></button>
              <p className="font-display text-[1.3rem] capitalize">{new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(utcDate(`${month}-15`))}</p>
              <button type="button" aria-label={t("nextMonth")} disabled={month >= ymOf(lastDay)} onClick={() => setMonth((m) => shiftMonth(m, 1))} className="grid size-[38px] place-items-center rounded-[10px] border border-ivory/10 disabled:cursor-not-allowed disabled:opacity-25"><ChevronRight className="size-[18px]" /></button>
            </div>
            <div className="grid grid-cols-7 gap-[3px]">
              {weekdays.map((w) => <span key={w} className="py-1.5 text-center text-[0.68rem] text-ivory/55 capitalize">{w}</span>)}
              {grid.map((d, i) => {
                if (!d) return <span key={`e${i}`} />;
                const st: DayStatus = days[d] ?? (d < today || d > lastDay ? "out" : "available");
                const disabled = st !== "available";
                return (
                  <button
                    key={d} type="button" disabled={disabled} aria-pressed={date === d}
                    onClick={() => { setDate(d); setTime(""); setTaken(false); }}
                    className={cn(
                      "flex min-h-[46px] flex-col items-center justify-center rounded-[10px] border border-transparent tabular-nums transition-colors",
                      st === "available" && "bg-ivory/[0.03] hover:border-champagne hover:bg-champagne/10",
                      d === today && "border-champagne/45",
                      date === d && "border-champagne bg-champagne text-ink hover:bg-champagne",
                      st === "full" && "cursor-not-allowed bg-[#e88a7a]/[0.07] text-ivory/45",
                      (st === "closed" || st === "out") && "cursor-not-allowed text-ivory/25",
                      st === "closed" && "line-through",
                    )}
                  >
                    <span className="text-[0.95rem] font-medium">{Number(d.slice(8))}</span>
                    {st === "full" && <span className="text-[0.52rem] font-bold tracking-wide text-[#e88a7a] uppercase">{t("dayFull")}</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <ul aria-hidden className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ivory/55">
            <li className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-[3px] border border-champagne/60 bg-ivory/10" />{t("available")}</li>
            <li className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-[3px] bg-[#e88a7a]/35" />{t("full")}</li>
            <li className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-[3px] bg-ivory/15" />{t("closed")}</li>
          </ul>
        </div>
      </div>

      {/* Colonne droite : horaires + coordonnées */}
      <div className="grid content-start gap-7">
        <div ref={slotsRef} className="scroll-mt-28">
          <h3 className={label}>
            {num(3)}{t("time")}
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-[#8fc79a]">
              <span className="size-[7px] animate-pulse rounded-full bg-[#8fc79a] shadow-[0_0_0_3px_rgb(143_199_154/0.18)]" />{t("live")}
            </span>
          </h3>
          {date && <p className="-mt-1 mb-3 font-display text-[1.35rem] first-letter:uppercase">{fmtDay(date, { weekday: "long", day: "numeric", month: "long" })}</p>}
          {taken && <p role="alert" className="mb-3.5 rounded-xl border border-[#e88a7a]/45 bg-[#e88a7a]/10 px-4 py-3 text-sm text-[#e88a7a]">{t("taken")}</p>}
          {!date && <p className="py-1 text-sm text-ivory/55">{t("pickDate")}</p>}
          {date && slotsState === "loading" && <p className="flex items-center gap-2 py-1 text-sm text-ivory/55"><Loader2 className="size-4 animate-spin" />{t("loading")}</p>}
          {date && slotsState === "error" && (
            <div className="py-1 text-sm text-ivory/55">{t("loadError")} <button type="button" onClick={() => loadSlots()} className="underline">{t("retry")}</button></div>
          )}
          {date && slotsState === "idle" && slots && (slots.length === 0 || !slots.some((s) => s.available)) && <p className="py-1 text-sm text-ivory/55">{t("noSlots", { n: persons })}</p>}
          {date && slotsState === "idle" && !!slots?.length && (
            <div className="grid grid-cols-3 gap-2 min-[480px]:grid-cols-4">
              {slots.map((s) => (
                <button
                  key={s.time} type="button" disabled={!s.available}
                  onClick={() => { setTime(s.time); setTaken(false); setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50); }}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl border px-1 transition-colors",
                    time === s.time ? "border-champagne bg-champagne text-ink" : "border-champagne/45 bg-champagne/[0.06] hover:border-champagne hover:bg-champagne/20",
                    !s.available && "cursor-not-allowed border-ivory/[0.08] bg-ivory/[0.02] text-ivory/35 hover:border-ivory/[0.08] hover:bg-ivory/[0.02]",
                  )}
                >
                  <span className="text-[1.02rem] font-semibold tabular-nums">{s.time}</span>
                  {!s.available && <span className="text-[0.64rem] text-[#e88a7a]/70">{t("slotFull")}</span>}
                  {s.available && s.left <= FEW_SEATS && (
                    <span className={cn("text-[0.64rem]", time === s.time ? "text-ink/70" : "text-champagne")}>{s.left === 1 ? t("fewSeats1") : t("fewSeats", { n: s.left })}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {time && date && (
          <form ref={formRef} onSubmit={submit} noValidate className="scroll-mt-28 border-t border-ivory/10 pt-6 lg:border-t-0 lg:pt-0">
            <h3 className={label}>{num(4)}{t("details")}</h3>
            <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-champagne/35 bg-champagne/10 px-4 py-3 font-semibold text-[#e6c98a]">
              <span className="first-letter:uppercase">{summary}</span>
              <button type="button" onClick={() => { setTime(""); slotsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="text-[0.82rem] font-normal text-ivory/55 underline hover:text-ivory">{t("change")}</button>
            </div>
            {alert && <p role="alert" className="mb-4 rounded-xl border border-[#e88a7a]/45 bg-[#e88a7a]/10 px-4 py-3 text-sm text-[#e88a7a]">{alert}</p>}
            <input type="checkbox" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" checked={form.botcheck} onChange={(e) => setForm({ ...form, botcheck: e.target.checked })} />
            <div className="grid gap-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">{t("name")}</span>
                <input className={input} autoComplete="name" maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {err("name")}
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">{t("phone")}</span>
                  <input className={input} type="tel" inputMode="tel" autoComplete="tel" maxLength={25} placeholder="+33 / +49 …" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  {err("phone")}
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">{t("email")}</span>
                  <input className={input} type="email" inputMode="email" autoComplete="email" maxLength={120} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  {err("email")}
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">{t("message")} <span className="font-normal text-ivory/55">{t("optional")}</span></span>
                <textarea className={cn(input, "h-auto py-3")} rows={2} maxLength={500} placeholder={t("messagePh")} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-champagne" checked={form.age} onChange={(e) => setForm({ ...form, age: e.target.checked })} />
                <span>{t("age")}{err("age")}</span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-champagne" checked={form.privacy} onChange={(e) => setForm({ ...form, privacy: e.target.checked })} />
                <span>{t.rich("privacy", { link: (c) => <Link href="/datenschutz" target="_blank" className="underline underline-offset-2">{c}</Link> })}{err("privacy")}</span>
              </label>
              <button type="submit" disabled={sending} className="mt-1 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-champagne text-base font-semibold text-ink transition-colors hover:bg-[#d9bd94] disabled:opacity-70">
                {sending ? <><Loader2 className="size-4 animate-spin" />{t("sending")}</> : t("submit")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
