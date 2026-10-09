export type FoodEvent = {
  id: string;
  title: string;
  host: string;
  start: string;
  end: string;
  all_day: boolean;
  location: string;
  maps_url: string;
  food_text: string;
  evidence: string;
  icon: string;
  dietary: string[];
  proof_url: string;
  also_urls: string[];
  source: string;
  source_label: string;
  promoted: boolean;
};

export type EventsFile = {
  generated_at: string;
  timezone: string;
  window_days: number;
  count: number;
  events: FoodEvent[];
};

// Days are always campus days, even if someone opens the site from elsewhere.
export const CAMPUS_TZ = "America/Chicago";

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: CAMPUS_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TZ,
  hour: "numeric",
  minute: "2-digit",
});

const longDayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TZ,
  weekday: "long",
  month: "short",
  day: "numeric",
});

const updatedFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TZ,
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
});

export function dayKey(date: Date): string {
  return dayFormatter.format(date);
}

export function shiftDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

export function formatTimeRange(event: FoodEvent): string {
  if (event.all_day) return "All day";
  const start = timeFormatter.format(new Date(event.start));
  const end = timeFormatter.format(new Date(event.end));
  return `${start} – ${end}`;
}

export function formatDayHeading(key: string, todayKey: string, tomorrowKey: string): string {
  if (key === todayKey) return "Today";
  if (key === tomorrowKey) return "Tomorrow";
  const [year, month, day] = key.split("-").map(Number);
  return longDayFormatter.format(new Date(Date.UTC(year, month - 1, day, 18)));
}

export function formatUpdated(iso: string): string {
  return updatedFormatter.format(new Date(iso));
}

export function isHappeningNow(event: FoodEvent, now: Date): boolean {
  return new Date(event.start) <= now && now < new Date(event.end);
}

export function hasEnded(event: FoodEvent, now: Date): boolean {
  return new Date(event.end) <= now;
}

export function groupByDay(events: FoodEvent[]): Array<[string, FoodEvent[]]> {
  const groups = new Map<string, FoodEvent[]>();
  for (const event of events) {
    const key = dayKey(new Date(event.start));
    const bucket = groups.get(key) ?? [];
    bucket.push(event);
    groups.set(key, bucket);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function reportLink(template: string | undefined, eventId: string): string | null {
  if (!template) return null;
  if (template.includes("EVENT_ID")) return template.replace("EVENT_ID", encodeURIComponent(eventId));
  return template;
}
