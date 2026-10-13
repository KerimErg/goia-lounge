"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { addDays, nowInKehl } from "@/lib/time";
import { arrivalSlots, type HoursRow, type SlotRules, type SpecialDayRow } from "@/lib/slots";

/**
 * Réservation rapide (accueil) avec des champs natifs : date, heure, personnes, espace.
 * « Vérifier la disponibilité » ouvre la page de réservation pré-remplie.
 */
export function QuickBooking({ hours, specials, rules, zones, maxParty }: {
  hours: HoursRow[];
  specials: SpecialDayRow[];
  rules: SlotRules;
  zones: { slug: string; name: string }[];
  maxParty: number;
}) {
  const t = useTranslations("quick");
  const router = useRouter();
  const today = useMemo(() => nowInKehl().ymd, []);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [persons, setPersons] = useState("2");
  const [zone, setZone] = useState("");
  const slots = useMemo(() => (date ? arrivalSlots(date, hours, rules, specials) : []), [date, hours, rules, specials]);

  return (
    <form
      className="grid gap-x-8 gap-y-6 bg-ivory p-6 text-ink shadow-lift sm:p-8 md:grid-cols-[1.2fr_1fr_0.8fr_1fr_auto] md:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new URLSearchParams({ persons });
        if (date) q.set("date", date);
        if (time) q.set("time", time);
        if (zone) q.set("zone", zone);
        router.push(`/reservation?${q}`);
      }}
      aria-label={t("title")}
    >
      <label className="block">
        <span className="field-label">{t("date")}</span>
        <input
          type="date" className="field-input" value={date} min={today} max={addDays(today, rules.maxDaysAhead)}
          onChange={(e) => {
            const d = e.target.value;
            setDate(d);
            const s = d ? arrivalSlots(d, hours, rules, specials) : [];
            if (!s.includes(time)) setTime(s.find((x) => x >= "20:00") ?? s[0] ?? "");
          }}
        />
      </label>
      <label className="block">
        <span className="field-label">{t("time")}</span>
        <select className="field-input" value={time} onChange={(e) => setTime(e.target.value)} disabled={!date || slots.length === 0}>
          {!date && <option value="">—</option>}
          {date && slots.length === 0 && <option value="">{t("closed")}</option>}
          {slots.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
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
      <Button type="submit" size="lux" className="h-13 w-full md:w-auto">{t("check")}</Button>
    </form>
  );
}
