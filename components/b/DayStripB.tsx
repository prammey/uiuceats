"use client";

import type { DayInfo } from "@/lib/events";

type Props = {
  days: DayInfo[];
  counts: Record<string, number>;
  selected: string;
  onSelect: (key: string) => void;
};

export default function DayStripB({ days, counts, selected, onSelect }: Props) {
  return (
    <div role="tablist" aria-label="Pick a day" className="grid grid-cols-7 gap-2 sm:gap-4">
      {days.map((day) => {
        const active = day.key === selected;
        const count = counts[day.key] ?? 0;
        const fill = active
          ? "bg-illini-orange text-white"
          : day.isToday
            ? "bg-illini-blue text-white"
            : "bg-white text-brut hover:bg-b-yellow";
        return (
          <button
            key={day.key}
            role="tab"
            type="button"
            aria-selected={active}
            aria-label={`${day.isToday ? "Today, " : ""}${day.weekday} ${day.dayNumber}, ${count} ${count === 1 ? "event" : "events"}`}
            onClick={() => onSelect(day.key)}
            className={`brut-sm brut-press relative flex flex-col items-center py-2 transition-colors sm:py-3 ${fill}`}
          >
            <span className="font-mono-b text-[10px] font-bold uppercase tracking-widest sm:text-xs">
              {day.isToday ? "Today" : day.weekday}
            </span>
            <span className="font-slab text-2xl leading-none sm:text-4xl">{day.dayNumber}</span>
            <span className="mt-1 font-mono-b text-[10px] font-bold sm:text-xs">{count > 0 ? `×${count}` : "—"}</span>
          </button>
        );
      })}
    </div>
  );
}
