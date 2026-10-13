"use client";

import * as React from "react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { fr } from "react-day-picker/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function Calendar({ className, classNames, ...props }: DayPickerProps) {
  return (
    <DayPicker
      locale={fr}
      weekStartsOn={1}
      showOutsideDays
      className={cn("p-1", className)}
      classNames={{
        months: "relative flex flex-col gap-6 sm:flex-row",
        month: "flex flex-col gap-3",
        month_caption: "flex h-9 items-center justify-center",
        caption_label: "inline-block font-display text-sm font-semibold first-letter:uppercase",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: "inline-flex size-9 items-center justify-center rounded-full hover:bg-muted disabled:opacity-30 z-10",
        button_next: "inline-flex size-9 items-center justify-center rounded-full hover:bg-muted disabled:opacity-30 z-10",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-10 text-[0.7rem] font-medium uppercase text-muted-foreground",
        week: "mt-1 flex w-full",
        day: "relative size-10 p-0 text-center text-sm",
        day_button:
          "inline-flex size-10 items-center justify-center rounded-full font-medium transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring outline-none",
        today: "[&>button]:text-primary [&>button]:font-bold",
        selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary",
        range_start: "rounded-l-full bg-primary/15",
        range_end: "rounded-r-full bg-primary/15",
        range_middle: "bg-primary/12 [&>button]:!bg-transparent [&>button]:!text-foreground",
        outside: "text-muted-foreground/40",
        disabled: "text-muted-foreground/30 [&>button]:hover:bg-transparent [&>button]:cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />,
      }}
      {...props}
    />
  );
}

export { Calendar };
