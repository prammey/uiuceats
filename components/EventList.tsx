"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import DayStrip from "@/components/DayStrip";
import EventCard from "@/components/EventCard";
import {
  dayKey,
  formatDayHeading,
  hasEnded,
  isHappeningNow,
  shiftDays,
  weekDays,
  type FoodEvent,
} from "@/lib/events";

type Props = {
  events: FoodEvent[];
  reportTemplate?: string;
};

// The clock only exists in the browser. The server snapshot is null, so the static
// HTML and the first client render both show the placeholder, then the real time
// arrives without a hydration mismatch. Ticks once a minute.
function subscribeToMinute(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
}
const minuteNow = () => Math.floor(Date.now() / 60_000);
const minuteOnServer = () => null;

function useNow(): Date | null {
  const minute = useSyncExternalStore(subscribeToMinute, minuteNow, minuteOnServer);
  return useMemo(() => (minute === null ? null : new Date(minute * 60_000)), [minute]);
}

const EMPTY_LINES = [
  "Nothing free on this day (yet). The feeds refresh every 3 hours.",
  "Quiet day on the calendars. Fridge raid? 🧊",
  "No verified free food here yet. Check a neighbor day 👉",
];

export default function EventList({ events, reportTemplate }: Props) {
  const now = useNow();
  const [picked, setPicked] = useState<string | null>(null);
  const [spotlight, setSpotlight] = useState<string | null>(null);

  const view = useMemo(() => {
    if (!now) return null;
    const days = weekDays(now);
    const todayKey = days[0].key;
    const tomorrowKey = dayKey(shiftDays(now, 1));
    const counts: Record<string, number> = {};
    const byDay: Record<string, FoodEvent[]> = {};
    const upcoming: FoodEvent[] = [];
    for (const event of events) {
      if (hasEnded(event, now)) continue;
      upcoming.push(event);
      const key = dayKey(new Date(event.start));
      counts[key] = (counts[key] ?? 0) + 1;
      (byDay[key] ??= []).push(event);
    }
    // Fall back to today if the picked day scrolled out of the 7-day window overnight.
    const selected = picked && days.some((d) => d.key === picked) ? picked : todayKey;
    const live = upcoming.filter((event) => isHappeningNow(event, now));
    const nextWithFood = days.find((d) => d.key > selected && (counts[d.key] ?? 0) > 0) ?? null;
    return { days, todayKey, tomorrowKey, counts, selected, list: byDay[selected] ?? [], upcoming, live, nextWithFood };
  }, [events, now, picked]);

  // Scroll the spotlighted card into view once it exists, then let the glow fade.
  useEffect(() => {
    if (!spotlight) return;
    const element = document.getElementById(`card-${spotlight}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = window.setTimeout(() => setSpotlight(null), 2600);
    return () => window.clearTimeout(timer);
  }, [spotlight]);

  if (!now || !view) {
    return (
      <div className="mt-8 space-y-3" aria-label="Loading this week's events">
        <div className="h-20 animate-pulse rounded-2xl bg-white/70" />
        <div className="h-40 animate-pulse rounded-2xl bg-white/70" />
      </div>
    );
  }

  function surpriseMe() {
    if (!view || view.upcoming.length === 0) return;
    const choice = view.upcoming[Math.floor(Math.random() * view.upcoming.length)];
    setPicked(dayKey(new Date(choice.start)));
    setSpotlight(choice.id);
  }

  const emptyLine = EMPTY_LINES[view.selected.charCodeAt(view.selected.length - 1) % EMPTY_LINES.length];

  return (
    <section className="mt-8">
      {view.live.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 font-display text-lg font-bold text-illini-orange">🔥 Happening right now</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {view.live.map((event) => (
              <EventCard key={`live-${event.id}`} event={event} now={now} reportTemplate={reportTemplate} />
            ))}
          </div>
        </div>
      )}

      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-illini-blue sm:text-xl">Pick a day 👇</h2>
        <button
          type="button"
          onClick={surpriseMe}
          disabled={view.upcoming.length === 0}
          className="rounded-full border-2 border-illini-blue/15 bg-white px-3 py-1.5 text-xs font-extrabold text-illini-blue shadow-sm transition hover:-translate-y-0.5 hover:border-illini-orange hover:text-illini-orange disabled:opacity-40 sm:text-sm"
        >
          🎲 Surprise me
        </button>
      </div>

      <DayStrip days={view.days} counts={view.counts} selected={view.selected} onSelect={setPicked} />

      <h3 className="mt-7 font-display text-sm font-bold uppercase tracking-wider text-ink-muted">
        {formatDayHeading(view.selected, view.todayKey, view.tomorrowKey)}
      </h3>

      {view.list.length ? (
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {view.list.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              now={now}
              reportTemplate={reportTemplate}
              spotlight={spotlight === event.id}
            />
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border-2 border-dashed border-illini-blue/20 bg-white/70 px-5 py-10 text-center">
          <div aria-hidden className="text-5xl animate-bounce-soft">🫙</div>
          <p className="mt-3 font-display text-lg font-bold text-illini-blue">Empty plate.</p>
          <p className="mt-1 text-sm text-ink-muted">{emptyLine}</p>
          {view.nextWithFood && (
            <button
              type="button"
              onClick={() => setPicked(view.nextWithFood!.key)}
              className="mt-4 rounded-full bg-illini-orange px-4 py-2 text-sm font-extrabold text-white shadow transition hover:-translate-y-0.5 hover:bg-illini-blue"
            >
              Jump to {view.nextWithFood.weekday} {view.nextWithFood.dayNumber} →
            </button>
          )}
        </div>
      )}
    </section>
  );
}
