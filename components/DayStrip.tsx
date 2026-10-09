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
    <div role="tablist" aria-label="Pick a day" className="grid grid-cols-7 gap-1.5 sm:gap-3">
      {days.map((day) => {
        const active = day.key === selected;
        const count = counts[day.key] ?? 0;
        const base =
          "group relative flex flex-col items-center rounded-2xl border-2 py-2 transition-all duration-200 hover:-translate-y-1 hover:animate-wiggle sm:py-3";
        const look = active
          ? "border-illini-blue bg-illini-blue text-white shadow-lg scale-[1.04]"
          : "border-illini-blue/15 bg-white text-illini-blue shadow-sm hover:border-illini-orange";
        // Today always wears the orange ring, selected or not.
        const todayRing = day.isToday ? "ring-4 ring-illini-orange/70 ring-offset-2 ring-offset-cream" : "";
        return (
          <button
            key={day.key}
            role="tab"
            type="button"
            aria-selected={active}
            aria-label={`${day.isToday ? "Today, " : ""}${day.weekday} ${day.dayNumber}, ${count} ${count === 1 ? "event" : "events"}`}
            onClick={() => onSelect(day.key)}
            className={`${base} ${look} ${todayRing}`}
          >
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider sm:text-[11px] ${
                active ? "text-white/85" : day.isToday ? "text-illini-orange" : "text-ink-muted"
              }`}
            >
              {day.isToday ? "📍 Today" : day.weekday}
            </span>
            <span className="font-display text-xl font-bold leading-tight sm:text-2xl">{day.dayNumber}</span>
            <span className={`text-[10px] font-bold sm:text-xs ${active ? "text-white/85" : "text-ink-muted"}`}>
              {count > 0 ? `${count} 🍽️` : "zzz 😴"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
