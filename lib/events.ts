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

export type DayInfo = {
  key: string;
  weekday: string;
  dayNumber: number;
  isToday: boolean;
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

const weekdayFormatter = new Intl.DateTimeFormat("en-US", { timeZone: CAMPUS_TZ, weekday: "short" });
const dayNumberFormatter = new Intl.DateTimeFormat("en-US", { timeZone: CAMPUS_TZ, day: "numeric" });

const longDayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TZ,
  weekday: "long",
  month: "long",
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

export function weekDays(now: Date, count = 7): DayInfo[] {
  return Array.from({ length: count }, (_, index) => {
    const date = shiftDays(now, index);
    return {
      key: dayKey(date),
      weekday: weekdayFormatter.format(date),
      dayNumber: Number(dayNumberFormatter.format(date)),
      isToday: index === 0,
    };
  });
}

function clockParts(date: Date): { hm: string; period: string } {
  const parts = timeFormatter.formatToParts(date);
  const hour = parts.find((p) => p.type === "hour")?.value ?? "";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  const period = parts.find((p) => p.type === "dayPeriod")?.value ?? "";
  return { hm: `${hour}:${minute}`, period };
}

export function formatClock(iso: string): string {
  const { hm, period } = clockParts(new Date(iso));
  return `${hm} ${period}`;
}

export function formatTimeRange(event: FoodEvent): string {
  if (event.all_day) return "All day";
  const start = clockParts(new Date(event.start));
  const end = clockParts(new Date(event.end));
  if (start.period === end.period) return `${start.hm}–${end.hm} ${start.period}`;
  return `${start.hm} ${start.period}–${end.hm} ${end.period}`;
}

export function formatDayHeading(key: string, todayKey: string, tomorrowKey: string): string {
  const [year, month, day] = key.split("-").map(Number);
  const long = longDayFormatter.format(new Date(Date.UTC(year, month - 1, day, 18)));
  if (key === todayKey) return `Today · ${long}`;
  if (key === tomorrowKey) return `Tomorrow · ${long}`;
  return long;
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

export function reportLink(template: string | undefined, eventId: string): string | null {
  if (!template) return null;
  if (template.includes("EVENT_ID")) return template.replace("EVENT_ID", encodeURIComponent(eventId));
  return template;
}
