"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { de, enGB, fr } from "react-day-picker/locale";
import { useRouter } from "@/i18n/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { addDays, nowInKehl } from "@/lib/time";
import { arrivalSlots, dayWindow, type HoursRow, type SlotRules, type SpecialDayRow } from "@/lib/slots";
import { cn } from "@/lib/utils";

const DP_LOCALES = { fr, de, en: enGB } as const;
const ymdOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dateOf = (ymd: string) => { const [y, m, d] = ymd.split("-").map(Number); return new Date(y, m - 1, d); };

/**
 * Réservation rapide (accueil) : date, heure d'arrivée, personnes, espace
 * → « Vérifier la disponibilité » ouvre le tunnel de réservation pré-rempli.
 */
export function QuickBooking({ hours, specials, rules, zones, maxParty }: {
  hours: HoursRow[];
  specials: SpecialDayRow[];
  rules: SlotRules;
  zones: { slug: string; name: string }[];
  maxParty: number;
}) {
  const t = useTranslations("quick");
  const locale = useLocale() as keyof typeof DP_LOCALES;
  const router = useRouter();
  const today = useMemo(() => nowInKehl().ymd, []);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [persons, setPersons] = useState<string>("2");
  const [zone, setZone] = useState<string>("any");
  const [open, setOpen] = useState(false);

  const slots = useMemo(() => (date ? arrivalSlots(date, hours, rules, specials) : []), [date, hours, rules, specials]);
  const dateLabel = date
    ? new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "long" }).format(dateOf(date))
    : t("pickDate");

  const field = "flex h-14 w-full items-center gap-3 border-0 border-b border-ivory/15 bg-transparent px-1 text-left text-sm outline-none transition-colors hover:border-brass/60 focus-visible:border-brass md:border-b-0 md:border-r md:px-5";

  return (
    <form
      className="grid overflow-hidden border border-ivory/12 bg-espresso/90 shadow-lift backdrop-blur-xl md:grid-cols-[1.3fr_1fr_0.9fr_1fr_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new URLSearchParams({ persons });
        if (date) q.set("date", date);
        if (time) q.set("time", time);
        if (zone !== "any") q.set("zone", zone);
        router.push(`/reservation?${q}`);
      }}
      aria-label={t("title")}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={field}>
            <CalendarDays className="size-4 shrink-0 text-brass" aria-hidden />
            <span className="grid">
              <span className="eyebrow text-[0.6rem] text-muted-foreground">{t("date")}</span>
              <span className={cn("first-letter:uppercase", !date && "text-ivory/60")}>{dateLabel}</span>
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto border-ivory/12 bg-popover p-3" align="start">
          <Calendar
            mode="single"
            locale={DP_LOCALES[locale]}
            selected={date ? dateOf(date) : undefined}
            defaultMonth={date ? dateOf(date) : dateOf(today)}
            disabled={(d) => {
              const y = ymdOf(d);
              return y < today || y > addDays(today, rules.maxDaysAhead) || !dayWindow(y, hours, specials) || arrivalSlots(y, hours, rules, specials).length === 0;
            }}
            onSelect={(d) => {
              if (!d) return;
              const y = ymdOf(d);
              setDate(y);
              const s = arrivalSlots(y, hours, rules, specials);
              if (!s.includes(time)) setTime(s.find((x) => x >= "20:00") ?? s[0] ?? "");
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <Select value={time} onValueChange={setTime} disabled={!date || slots.length === 0}>
        <SelectTrigger className={cn(field, "rounded-none shadow-none [&>svg:last-child]:hidden")} aria-label={t("time")}>
          <Clock className="size-4 shrink-0 text-brass" aria-hidden />
          <span className="grid flex-1 text-left">
            <span className="eyebrow text-[0.6rem] text-muted-foreground">{t("time")}</span>
            <SelectValue placeholder={date && !slots.length ? t("closed") : "—"} />
          </span>
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {slots.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={persons} onValueChange={setPersons}>
        <SelectTrigger className={cn(field, "rounded-none shadow-none [&>svg:last-child]:hidden")} aria-label={t("persons")}>
          <Users className="size-4 shrink-0 text-brass" aria-hidden />
          <span className="grid flex-1 text-left">
            <span className="eyebrow text-[0.6rem] text-muted-foreground">{t("persons")}</span>
            <SelectValue />
          </span>
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: maxParty }, (_, i) => String(i + 1)).map((n) => (
            <SelectItem key={n} value={n}>{t("personsN", { n })}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={zone} onValueChange={setZone}>
        <SelectTrigger className={cn(field, "rounded-none shadow-none [&>svg:last-child]:hidden")} aria-label={t("zone")}>
          <MapPin className="size-4 shrink-0 text-brass" aria-hidden />
          <span className="grid flex-1 text-left">
            <span className="eyebrow text-[0.6rem] text-muted-foreground">{t("zone")}</span>
            <SelectValue />
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">{t("anyZone")}</SelectItem>
          {zones.map((z) => <SelectItem key={z.slug} value={z.slug}>{z.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Button type="submit" size="lux" className="m-3 h-14 rounded-none md:m-0 md:h-auto md:px-8">
        {t("check")}
      </Button>
    </form>
  );
}
