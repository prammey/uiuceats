import { useMemo, useSyncExternalStore } from "react";
import { dayKey, hasEnded, shiftDays, weekDays, type DayInfo, type FoodEvent } from "@/lib/events";

// The clock only exists in the browser. The server snapshot is null, so the static
// HTML and the first client render both show a placeholder, then the real time
// arrives without a hydration mismatch. Ticks once a minute.
function subscribeToMinute(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
}
const minuteNow = () => Math.floor(Date.now() / 60_000);
const minuteOnServer = () => null;

export function useNow(): Date | null {
  const minute = useSyncExternalStore(subscribeToMinute, minuteNow, minuteOnServer);
  return useMemo(() => (minute === null ? null : new Date(minute * 60_000)), [minute]);
}

// Everything the event list needs for the selected day.
export type WeekView = {
  days: DayInfo[];
  todayKey: string;
  tomorrowKey: string;
  counts: Record<string, number>;
  selected: string;
  list: FoodEvent[];
  upcoming: FoodEvent[];
  nextWithFood: DayInfo | null;
};

// Groups the published events by campus day and resolves which day is selected.
export function useWeekView(events: FoodEvent[], picked: string | null, now: Date | null): WeekView | null {
  return useMemo(() => {
    if (!now) return null;
    const days = weekDays(now);
    const todayKey = days[0].key;
    const tomorrowKey = dayKey(shiftDays(now, 1));
    const counts: Record<string, number> = {};
    const byDay: Record<string, FoodEvent[]> = {};
    const upcoming: FoodEvent[] = [];
    for (const event of events) {
      const key = dayKey(new Date(event.start));
      const ended = hasEnded(event, now);
      if (!ended) upcoming.push(event);
      // Today keeps its finished events so visitors can see what already happened;
      // every other day only lists what is still to come.
      if (ended && key !== todayKey) continue;
      counts[key] = (counts[key] ?? 0) + 1;
      (byDay[key] ??= []).push(event);
    }
    // Fall back to today if the picked day scrolled out of the 7-day window overnight.
    const selected = picked && days.some((d) => d.key === picked) ? picked : todayKey;
    const nextWithFood = days.find((d) => d.key > selected && (counts[d.key] ?? 0) > 0) ?? null;
    return { days, todayKey, tomorrowKey, counts, selected, list: byDay[selected] ?? [], upcoming, nextWithFood };
  }, [events, now, picked]);
}
