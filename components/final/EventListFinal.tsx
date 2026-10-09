"use client";

import { useEffect, useState } from "react";
import DayStripFinal from "@/components/final/DayStripFinal";
import EventCardFinal from "@/components/final/EventCardFinal";
import { dayKey, formatDayHeading, type FoodEvent } from "@/lib/events";
import { useNow, useWeekView } from "@/lib/week";

type Props = {
  events: FoodEvent[];
  reportTemplate?: string;
};

export default function EventListFinal({ events, reportTemplate }: Props) {
  const now = useNow();
  const [picked, setPicked] = useState<string | null>(null);
  const [spotlight, setSpotlight] = useState<string | null>(null);
  const view = useWeekView(events, picked, now);

  useEffect(() => {
    if (!spotlight) return;
    document.getElementById(`card-${spotlight}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = window.setTimeout(() => setSpotlight(null), 2600);
    return () => window.clearTimeout(timer);
  }, [spotlight]);

  if (!now || !view) {
    return (
      <div className="mt-8 space-y-4" aria-label="Loading this week's events">
        <div className="brut h-20 animate-pulse rounded-xl bg-white" />
        <div className="brut h-48 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  function surpriseMe() {
    if (!view || view.upcoming.length === 0) return;
    const choice = view.upcoming[Math.floor(Math.random() * view.upcoming.length)];
    setPicked(dayKey(new Date(choice.start)));
    setSpotlight(choice.id);
  }

  return (
    <section id="menu" className="scroll-mt-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-slab text-3xl uppercase text-illini-blue sm:text-4xl">Pick a day 👇</h2>
        <button
          type="button"
          onClick={surpriseMe}
          disabled={view.upcoming.length === 0}
          className="brut-sm brut-press rounded-xl bg-white px-4 py-2 font-slab text-sm uppercase text-brut hover:bg-b-yellow disabled:opacity-40"
        >
          🎲 Surprise me
        </button>
      </div>

      <DayStripFinal days={view.days} counts={view.counts} selected={view.selected} onSelect={setPicked} />

      <div className="mt-8 flex items-center gap-3">
        <h3 className="font-mono-b text-xs font-bold uppercase tracking-[0.3em] text-brut">
          {formatDayHeading(view.selected, view.todayKey, view.tomorrowKey)}
        </h3>
        <div aria-hidden className="h-[3px] flex-1 bg-brut" />
        <span className="shrink-0 whitespace-nowrap font-mono-b text-xs font-bold uppercase text-ink-muted">
          {view.list.length} {view.list.length === 1 ? "listing" : "listings"}
        </span>
      </div>

      {view.list.length ? (
        <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {view.list.map((event) => (
            <EventCardFinal
              key={event.id}
              event={event}
              now={now}
              reportTemplate={reportTemplate}
              spotlight={spotlight === event.id}
            />
          ))}
        </div>
      ) : (
        <div className="brut mt-5 rounded-2xl bg-white px-6 py-12 text-center">
          <p className="font-slab text-5xl uppercase text-illini-orange">86&apos;d</p>
          <p className="mt-2 font-mono-b text-xs font-bold uppercase tracking-widest text-brut">Nothing free on this day (yet)</p>
          <p className="mt-1 text-sm text-ink-muted">The calendars are re-read every 3 hours.</p>
          {view.nextWithFood && (
            <button
              type="button"
              onClick={() => setPicked(view.nextWithFood!.key)}
              className="brut-sm brut-press mt-5 rounded-xl bg-illini-orange px-5 py-2 font-slab text-sm uppercase text-white"
            >
              Next: {view.nextWithFood.weekday} {view.nextWithFood.dayNumber} →
            </button>
          )}
        </div>
      )}
    </section>
  );
}
