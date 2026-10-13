"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { addDays, nowInKehl } from "@/lib/time";
import { cn } from "@/lib/utils";

type Zone = { slug: string; name: string };
type Slot = { time: string; available: boolean };
const OCCASIONS = ["NONE", "BIRTHDAY", "FRIENDS", "DATE", "BUSINESS", "OTHER"] as const;

/**
 * Réservation en 3 étapes : soirée (date, personnes, espace, heure libre) → coordonnées → confirmation.
 * Champs natifs (date, listes) : fiables et cliquables sur tous les téléphones.
 */
export function BookingFlow({ zones, maxParty, maxDaysAhead, initial }: {
  zones: Zone[]; maxParty: number; maxDaysAhead: number;
  initial: { date?: string; time?: string; persons?: string; zone?: string };
}) {
  const t = useTranslations("flow");
  const locale = useLocale() as "fr" | "de" | "en";
  const today = useMemo(() => nowInKehl().ymd, []);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [date, setDate] = useState(initial.date && initial.date >= today ? initial.date : "");
  const [persons, setPersons] = useState(String(Math.min(Number(initial.persons) || 2, maxParty)));
  const [zone, setZone] = useState(zones.some((z) => z.slug === initial.zone) ? initial.zone! : "");
  const [time, setTime] = useState(initial.time ?? "");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", occasion: "NONE", message: "", adult: false, privacy: false, website: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ reference: string; emailed: boolean } | null>(null);

  // Créneaux libres pour la date / le nombre de personnes / l'espace choisis
  useEffect(() => {
    if (!date) { setSlots(null); return; }
    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/availability?${new URLSearchParams({ date, persons, ...(zone ? { zone } : {}) })}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((j: { slots?: Slot[] }) => {
        setSlots(j.slots ?? []);
        setTime((cur) => (j.slots?.some((s) => s.time === cur && s.available) ? cur : ""));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [date, persons, zone]);

  const dateLabel = date ? new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`)) : "";
  const zoneName = zones.find((z) => z.slug === zone)?.name;
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target instanceof HTMLInputElement && e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.firstName || !form.lastName || !form.phone || !form.email || !form.adult || !form.privacy) { setError(t("required")); return; }
    setSending(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, date, time, persons: Number(persons), zone: zone || null, locale }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) { setDone(j); setStep(3); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
      if (res.status === 409) { setError(t("errUnavailable")); setStep(1); setSlots((s) => s?.map((x) => (x.time === time ? { ...x, available: false } : x)) ?? s); setTime(""); return; }
      setError(res.status === 429 ? t("errRate") : res.status === 400 ? t("required") : t("errGeneric"));
    } catch {
      setError(t("errGeneric"));
    } finally {
      setSending(false);
    }
  }

  const steps = [t("step1"), t("step2"), t("step3")];

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Étapes */}
      <ol className="mb-10 flex items-center justify-center gap-3 text-[0.62rem] tracking-[0.25em] uppercase sm:gap-5">
        {steps.map((s, i) => (
          <li key={s} className={cn("flex items-center gap-3 sm:gap-5", step >= i + 1 ? "text-ivory" : "text-ivory/40")}>
            <span className={cn("grid size-7 place-items-center rounded-full border text-[0.7rem] tracking-normal", step > i + 1 ? "border-champagne bg-champagne text-ink" : step === i + 1 ? "border-champagne text-champagne" : "border-ivory/30")}>
              {step > i + 1 ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className="hidden sm:inline">{s}</span>
            {i < 2 && <span aria-hidden className="h-px w-6 bg-ivory/25 sm:w-10" />}
          </li>
        ))}
      </ol>

      <div className="bg-ivory p-6 text-ink shadow-lift sm:p-10">
        {error && <p role="alert" className="mb-6 border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}

        {step === 1 && (
          <div>
            <div className="grid gap-6 sm:grid-cols-3">
              <label className="block">
                <span className="field-label">{t("date")}</span>
                <input type="date" className="field-input" value={date} min={today} max={addDays(today, maxDaysAhead)} onChange={(e) => setDate(e.target.value)} required />
              </label>
              <label className="block">
                <span className="field-label">{t("persons")}</span>
                <select className="field-input" value={persons} onChange={(e) => setPersons(e.target.value)}>
                  {Array.from({ length: maxParty }, (_, i) => String(i + 1)).map((n) => <option key={n} value={n}>{t("personsN", { n })}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="field-label">{t("zone")}</span>
                <select className="field-input" value={zone} onChange={(e) => setZone(e.target.value)}>
                  <option value="">{t("anyZone")}</option>
                  {zones.map((z) => <option key={z.slug} value={z.slug}>{z.name}</option>)}
                </select>
              </label>
            </div>

            <div className="mt-10">
              <p className="field-label">{t("time")}</p>
              {!date && <p className="text-sm text-ink/60">{t("pickDate")}</p>}
              {date && loading && <p className="flex items-center gap-2 text-sm text-ink/60"><Loader2 className="size-4 animate-spin" />{t("loading")}</p>}
              {date && !loading && slots?.length === 0 && <p className="text-sm text-ink/70">{t("closed")}</p>}
              {date && !loading && !!slots?.length && !slots.some((s) => s.available) && <p className="text-sm text-ink/70">{t("noneFree")}</p>}
              {date && !loading && !!slots?.length && (
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {slots.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      disabled={!s.available}
                      onClick={() => setTime(s.time)}
                      aria-pressed={time === s.time}
                      className={cn(
                        "h-12 border text-sm tabular-nums transition-colors",
                        time === s.time ? "border-ink bg-ink text-ivory" : "border-ink/20 hover:border-ink",
                        !s.available && "cursor-not-allowed border-ink/10 text-ink/30 line-through hover:border-ink/10",
                      )}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-10 flex flex-col-reverse items-center justify-between gap-5 sm:flex-row">
              <p className="text-sm text-ink/60">
                {t.rich("more", { n: maxParty, link: (c) => <Link href="/privatisation" className="underline underline-offset-4">{c}</Link> })}
              </p>
              <Button size="lux" type="button" disabled={!date || !time} onClick={() => { setError(""); setStep(2); }} className="w-full sm:w-auto">{t("continue")}</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={submit} noValidate>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-6">
              <p className="font-display text-2xl first-letter:uppercase">{dateLabel} · {time} · {t("personsN", { n: persons })}{zoneName ? ` · ${zoneName}` : ""}</p>
              <button type="button" onClick={() => setStep(1)} className="text-xs tracking-[0.2em] uppercase underline underline-offset-4">{t("back")}</button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block"><span className="field-label">{t("firstName")} *</span><input className="field-input" autoComplete="given-name" value={form.firstName} onChange={set("firstName")} required /></label>
              <label className="block"><span className="field-label">{t("lastName")} *</span><input className="field-input" autoComplete="family-name" value={form.lastName} onChange={set("lastName")} required /></label>
              <label className="block"><span className="field-label">{t("phone")} *</span><input className="field-input" type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={set("phone")} required /></label>
              <label className="block"><span className="field-label">{t("email")} *</span><input className="field-input" type="email" autoComplete="email" value={form.email} onChange={set("email")} required /></label>
              <label className="block sm:col-span-2">
                <span className="field-label">{t("occasion")}</span>
                <select className="field-input" value={form.occasion} onChange={set("occasion")}>
                  {OCCASIONS.map((o) => <option key={o} value={o}>{t(`occ_${o}`)}</option>)}
                </select>
              </label>
              <label className="block sm:col-span-2"><span className="field-label">{t("message")}</span><textarea className="field-input h-24 resize-none py-3" maxLength={500} value={form.message} onChange={set("message")} /></label>
              {/* Piège à robots, invisible */}
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={form.website} onChange={set("website")} />
            </div>
            <div className="mt-8 space-y-4 text-sm">
              <label className="flex items-start gap-3"><input type="checkbox" className="mt-0.5 size-5 accent-ink" checked={form.adult} onChange={set("adult")} /><span>{t("adult")} *</span></label>
              <label className="flex items-start gap-3"><input type="checkbox" className="mt-0.5 size-5 accent-ink" checked={form.privacy} onChange={set("privacy")} /><span>{t.rich("privacy", { link: (c) => <Link href="/datenschutz" className="underline underline-offset-4" target="_blank">{c}</Link> })} *</span></label>
            </div>
            <Button size="lux" type="submit" disabled={sending} className="mt-10 w-full">{sending ? <><Loader2 className="size-4 animate-spin" />{t("sending")}</> : t("confirm")}</Button>
          </form>
        )}

        {step === 3 && done && (
          <div className="py-6 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full border border-champagne text-champagne"><Check className="size-7" /></span>
            <h2 className="mt-8 text-[clamp(2rem,5vw,3rem)] leading-tight">{t("thanks", { name: form.firstName })}</h2>
            <p className="mt-6 font-display text-2xl first-letter:uppercase">{dateLabel} · {time} · {t("personsN", { n: persons })}</p>
            <p className="mt-8 text-xs tracking-[0.3em] text-taupe-deep uppercase">{t("reference")}</p>
            <p className="mt-2 font-display text-4xl tracking-[0.12em]">{done.reference}</p>
            <p className="mx-auto mt-6 max-w-sm text-sm text-ink/70">{done.emailed ? t("emailed") : t("keepRef")}</p>
            <Button asChild size="lux" className="mt-10"><Link href="/">{t("home")}</Link></Button>
          </div>
        )}
      </div>
    </div>
  );
}
