"use client";

import { useEffect, useRef, useState } from "react";
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
  // `at` makes every press a fresh spotlight, even if the same card is chosen again.
  const [spotlight, setSpotlight] = useState<{ id: string; at: number } | null>(null);
  const lastSurprise = useRef<string | null>(null);
  const view = useWeekView(events, picked, now);
  // A day's list is held back for a beat the first time it is opened; after that it
  // shows at once. Days with nothing on them hesitate every time.
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const [seenKeys, setSeenKeys] = useState<Set<string>>(() => new Set());
  const selectedKey = view?.selected ?? null;
  const isEmpty = (view?.list.length ?? 0) === 0;
  const settling = settledKey !== null && selectedKey !== settledKey && (isEmpty || !seenKeys.has(selectedKey ?? ""));

  useEffect(() => {
    if (!selectedKey) return;
    const timer = window.setTimeout(() => {
      setSeenKeys((prev) => (prev.has(selectedKey) ? prev : new Set(prev).add(selectedKey)));
      setSettledKey(selectedKey);
    }, settling ? 420 : 0);
    return () => window.clearTimeout(timer);
  }, [selectedKey, settling]);

  // Scroll to the chosen card once it is on screen, hold the ring, then let the
  // card fade it out.
  useEffect(() => {
    if (!spotlight || settling) return;
    document.getElementById(`card-${spotlight.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = window.setTimeout(() => setSpotlight(null), 1500);
    return () => window.clearTimeout(timer);
  }, [spotlight, settling]);

  if (!now || !view) {
    return (
      <div className="mt-8 space-y-4" aria-label="Loading this week's events">
        <div className="brut h-20 animate-pulse rounded-xl bg-white" />
        <div className="brut h-48 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  // Only events on a day the strip can show, and never the same card twice in a row.
  function surpriseMe() {
    if (!view) return;
    const inWeek = view.upcoming.filter((event) => view.days.some((day) => day.key === dayKey(new Date(event.start))));
    const options = inWeek.length > 1 ? inWeek.filter((event) => event.id !== lastSurprise.current) : inWeek;
    if (options.length === 0) return;
    const choice = options[Math.floor(Math.random() * options.length)];
    lastSurprise.current = choice.id;
    setPicked(dayKey(new Date(choice.start)));
    setSpotlight({ id: choice.id, at: Date.now() });
  }

  return (
    <section id="menu" className="scroll-mt-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-swash text-3xl text-illini-blue sm:text-4xl">Pick a day 👇</h2>
        <button
          type="button"
          onClick={surpriseMe}
          disabled={view.upcoming.length === 0}
          className="brut-sm brut-press rounded-xl bg-orange-bright px-4 py-2 font-swash text-base text-white hover:bg-illini-blue disabled:opacity-40"
        >
          🎲 Surprise me
        </button>
      </div>

      <DayStripFinal days={view.days} counts={view.counts} selected={view.selected} onSelect={setPicked} />

      <div className="mt-8 flex items-center gap-3 font-body-f">
        <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-brut">
          {formatDayHeading(view.selected, view.todayKey, view.tomorrowKey)}
        </h3>
        <div aria-hidden className="h-[3px] flex-1 bg-brut" />
        <span className="shrink-0 whitespace-nowrap text-xs font-bold uppercase text-ink-muted">
          {settling ? "…" : `${view.list.length} ${view.list.length === 1 ? "listing" : "listings"}`}
        </span>
      </div>

      {settling ? (
        <p aria-busy="true" aria-live="polite" className="mt-5 animate-pulse py-12 text-center font-body-f text-xs font-bold uppercase tracking-widest text-ink-muted">
          Loading…
        </p>
      ) : view.list.length ? (
        <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {view.list.map((event) => (
            <EventCardFinal
              key={event.id}
              event={event}
              now={now}
              reportTemplate={reportTemplate}
              spotlight={spotlight?.id === event.id}
            />
          ))}
        </div>
      ) : (
        <div className="brut mt-5 rounded-2xl bg-white px-6 py-12 text-center font-body-f">
          <p className="font-swash text-5xl text-illini-orange">Oh no...   🥀</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-brut">Nothing free on this day (yet)</p>
          <p className="mt-1 text-sm text-ink-muted">The calendar refreshes every 3 hours.</p>
          {view.nextWithFood && (
            <button
              type="button"
              onClick={() => setPicked(view.nextWithFood!.key)}
              className="brut-sm brut-press mt-5 rounded-xl bg-orange-bright px-5 py-2 font-swash text-base text-white"
            >
              Next: {view.nextWithFood.weekday} {view.nextWithFood.dayNumber} →
            </button>
          )}
        </div>
      )}
    </section>
  );
}
