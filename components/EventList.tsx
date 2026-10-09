"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import EventCard from "@/components/EventCard";
import {
  dayKey,
  formatDayHeading,
  groupByDay,
  hasEnded,
  shiftDays,
  type FoodEvent,
} from "@/lib/events";

type Tab = "today" | "tomorrow" | "week";

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

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "week", label: "This week" },
];

export default function EventList({ events, reportTemplate }: Props) {
  const now = useNow();
  const [tab, setTab] = useState<Tab>("today");

  const view = useMemo(() => {
    if (!now) return null;
    const todayKey = dayKey(now);
    const tomorrowKey = dayKey(shiftDays(now, 1));
    const upcoming = events.filter((event) => !hasEnded(event, now));
    const byDay = groupByDay(upcoming);
    const pick = (key: string) => byDay.find(([day]) => day === key)?.[1] ?? [];
    return {
      todayKey,
      tomorrowKey,
      today: pick(todayKey),
      tomorrow: pick(tomorrowKey),
      week: byDay,
      counts: { today: pick(todayKey).length, tomorrow: pick(tomorrowKey).length, week: upcoming.length },
    };
  }, [events, now]);

  if (!now || !view) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-illini-blue/20 p-6 text-center text-sm text-ink-muted">
        Checking what&apos;s cooking…
      </div>
    );
  }

  const renderCards = (list: FoodEvent[]) =>
    list.map((event) => <EventCard key={event.id} event={event} now={now} reportTemplate={reportTemplate} />);

  const empty = (message: string) => (
    <div className="rounded-2xl border border-dashed border-illini-blue/20 bg-white/60 p-6 text-center text-sm text-ink-muted">
      <div className="mb-1 text-2xl" aria-hidden>
        🥲
      </div>
      {message}
    </div>
  );

  return (
    <section className="mt-5">
      <div role="tablist" aria-label="When" className="flex gap-2 rounded-full bg-illini-blue-soft p-1">
        {TABS.map(({ id, label }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={`flex-1 rounded-full px-3 py-2 text-sm font-bold transition ${
                active ? "bg-illini-blue text-white shadow" : "text-illini-blue hover:bg-white/70"
              }`}
            >
              {label}
              <span className={`ml-1.5 text-xs font-semibold ${active ? "text-white/80" : "text-ink-muted"}`}>
                {view.counts[id]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        {tab === "today" &&
          (view.today.length
            ? renderCards(view.today)
            : empty("Nothing verified for today yet. Try Tomorrow or This week."))}

        {tab === "tomorrow" &&
          (view.tomorrow.length
            ? renderCards(view.tomorrow)
            : empty("Nothing verified for tomorrow yet. Feeds refresh every few hours."))}

        {tab === "week" &&
          (view.week.length
            ? view.week.map(([day, list]) => (
                <div key={day}>
                  <h2 className="mb-2 mt-5 text-xs font-extrabold uppercase tracking-wide text-ink-muted first:mt-0">
                    {formatDayHeading(day, view.todayKey, view.tomorrowKey)}
                  </h2>
                  <div className="space-y-3">{renderCards(list)}</div>
                </div>
              ))
            : empty("No verified free food found for the next 7 days. Check back soon."))}
      </div>
    </section>
  );
}
