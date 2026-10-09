"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import DayStrip from "@/components/DayStrip";
import EventCard from "@/components/EventCard";
import { dayKey, formatDayHeading, hasEnded, shiftDays, weekDays, type FoodEvent } from "@/lib/events";

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

export default function EventList({ events, reportTemplate }: Props) {
  const now = useNow();
  const [picked, setPicked] = useState<string | null>(null);

  const view = useMemo(() => {
    if (!now) return null;
    const days = weekDays(now);
    const todayKey = days[0].key;
    const tomorrowKey = dayKey(shiftDays(now, 1));
    const counts: Record<string, number> = {};
    const byDay: Record<string, FoodEvent[]> = {};
    for (const event of events) {
      if (hasEnded(event, now)) continue;
      const key = dayKey(new Date(event.start));
      counts[key] = (counts[key] ?? 0) + 1;
      (byDay[key] ??= []).push(event);
    }
    // Fall back to today if the picked day scrolled out of the 7-day window overnight.
    const selected = picked && days.some((d) => d.key === picked) ? picked : todayKey;
    return { days, todayKey, tomorrowKey, counts, selected, list: byDay[selected] ?? [] };
  }, [events, now, picked]);

  if (!now || !view) {
    return (
      <div className="mt-6 h-20 animate-pulse rounded-md bg-gray-100" aria-label="Loading this week's events" />
    );
  }

  return (
    <section className="mt-6">
      <DayStrip days={view.days} counts={view.counts} selected={view.selected} onSelect={setPicked} />

      <h2 className="mt-6 font-heading text-xs font-semibold uppercase tracking-wider text-ink-muted">
        {formatDayHeading(view.selected, view.todayKey, view.tomorrowKey)}
      </h2>

      {view.list.length ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {view.list.map((event) => (
            <EventCard key={event.id} event={event} now={now} reportTemplate={reportTemplate} />
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-md border border-dashed border-line px-4 py-6 text-center text-sm text-ink-muted">
          No verified free food on this day yet. Feeds refresh every few hours.
        </p>
      )}
    </section>
  );
}
