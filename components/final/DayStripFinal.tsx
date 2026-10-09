"use client";

import type { DayInfo } from "@/lib/events";

type Props = {
  days: DayInfo[];
  counts: Record<string, number>;
  selected: string;
  onSelect: (key: string) => void;
};

// Menu-board boxes with the hover lift-and-jiggle. Same radius and shadow as every other control.
export default function DayStripFinal({ days, counts, selected, onSelect }: Props) {
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
            className={`brut-sm flex flex-col items-center rounded-xl py-2 transition-all duration-200 hover:-translate-y-1 hover:animate-wiggle sm:py-3 ${fill}`}
          >
            <span className="font-body-f text-[10px] font-bold uppercase tracking-widest sm:text-xs">
              {day.isToday ? "Today" : day.weekday}
            </span>
            <span className="font-swash text-2xl leading-none sm:text-4xl">{day.dayNumber}</span>
            <span className="mt-1 font-body-f text-[10px] font-bold sm:text-xs">{count > 0 ? `×${count}` : "—"}</span>
          </button>
        );
      })}
    </div>
  );
}
