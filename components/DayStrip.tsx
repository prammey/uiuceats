"use client";

import type { DayInfo } from "@/lib/events";

type Props = {
  days: DayInfo[];
  counts: Record<string, number>;
  selected: string;
  onSelect: (key: string) => void;
};

export default function DayStrip({ days, counts, selected, onSelect }: Props) {
  return (
    <div role="tablist" aria-label="Pick a day" className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {days.map((day) => {
        const active = day.key === selected;
        const count = counts[day.key] ?? 0;
        const base = "flex flex-col items-center rounded-md border py-2 transition sm:py-3";
        const look = active
          ? "border-illini-blue bg-illini-blue text-white"
          : "border-line bg-white text-illini-blue hover:border-illini-blue/60";
        // Today keeps an orange edge whether or not it is the selected day.
        const today = day.isToday ? "ring-2 ring-illini-orange ring-offset-1" : "";
        return (
          <button
            key={day.key}
            role="tab"
            type="button"
            aria-selected={active}
            aria-label={`${day.isToday ? "Today, " : ""}${day.weekday} ${day.dayNumber}, ${count} ${count === 1 ? "event" : "events"}`}
            onClick={() => onSelect(day.key)}
            className={`${base} ${look} ${today}`}
          >
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider sm:text-[11px] ${
                active ? "text-white/80" : day.isToday ? "text-illini-orange" : "text-ink-muted"
              }`}
            >
              {day.isToday ? "Today" : day.weekday}
            </span>
            <span className="font-heading text-lg font-bold leading-tight sm:text-xl">{day.dayNumber}</span>
            <span className={`text-[10px] font-semibold sm:text-[11px] ${active ? "text-white/80" : "text-ink-muted"}`}>
              {count > 0 ? `${count} ${count === 1 ? "event" : "events"}` : "none"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
