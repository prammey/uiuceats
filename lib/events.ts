// One published listing, as written by the collector into data/events.json.
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

// The whole data/events.json file.
export type EventsFile = {
  generated_at: string;
  timezone: string;
  window_days: number;
  count: number;
  events: FoodEvent[];
};

// One box in the day strip.
export type DayInfo = {
  key: string;
  weekday: string;
  dayNumber: number;
  isToday: boolean;
};

// Card header label, chosen by the event's start time (see mealPeriod).
export type MealPeriod = "breakfast" | "lunch" | "dinner" | "late";

export const PERIOD_META: Record<MealPeriod, { label: string; emoji: string }> = {
  breakfast: { label: "Breakfast", emoji: "🌅" },
  lunch: { label: "Lunch", emoji: "☀️" },
  dinner: { label: "Dinner", emoji: "🌆" },
  late: { label: "Late night", emoji: "🌙" },
};

// Chips next to the food text; the collector only emits these keys.
export const DIETARY_META: Record<string, { label: string; emoji: string }> = {
  vegetarian: { label: "Vegetarian", emoji: "🌱" },
  vegan: { label: "Vegan", emoji: "🌿" },
  halal: { label: "Halal", emoji: "✅" },
  kosher: { label: "Kosher", emoji: "✅" },
  "gluten-free": { label: "Gluten-free", emoji: "🌾" },
};

// Days and times are always campus time, even if someone opens the site from elsewhere.
const CAMPUS_TZ = "America/Chicago";

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

const hour23Formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TZ,
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
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

// "2026-10-10" style key for a campus day; the day strip and the data agree on it.
export function dayKey(date: Date): string {
  return dayFormatter.format(date);
}

export function shiftDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

// Today plus the next six days.
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

// "9:15–9:45 AM" or "11:30 AM–1:00 PM".
export function formatTimeRange(event: FoodEvent): string {
  if (event.all_day) return "All day";
  const start = clockParts(new Date(event.start));
  const end = clockParts(new Date(event.end));
  if (start.period === end.period) return `${start.hm}–${end.hm} ${start.period}`;
  return `${start.hm} ${start.period}–${end.hm} ${end.period}`;
}

// Breakfast before 10:30, lunch before 3, dinner before 9, late after that.
export function mealPeriod(event: FoodEvent): MealPeriod {
  if (event.all_day) return "lunch";
  const parts = hour23Formatter.formatToParts(new Date(event.start));
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 12);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const decimal = hour + minute / 60;
  if (decimal < 10.5) return "breakfast";
  if (decimal < 15) return "lunch";
  if (decimal < 21) return "dinner";
  return "late";
}

// "Today · Saturday, October 10" above the list.
export function formatDayHeading(key: string, todayKey: string, tomorrowKey: string): string {
  const [year, month, day] = key.split("-").map(Number);
  const long = longDayFormatter.format(new Date(Date.UTC(year, month - 1, day, 18)));
  if (key === todayKey) return `Today · ${long}`;
  if (key === tomorrowKey) return `Tomorrow · ${long}`;
  return long;
}

// "Sat 3:00 AM" in the footer's "Last checked".
export function formatUpdated(iso: string): string {
  return updatedFormatter.format(new Date(iso));
}

export function isHappeningNow(event: FoodEvent, now: Date): boolean {
  return new Date(event.start) <= now && now < new Date(event.end);
}

export function hasEnded(event: FoodEvent, now: Date): boolean {
  return new Date(event.end) <= now;
}

// The Report form link; a template containing EVENT_ID gets the id filled in.
export function reportLink(template: string | undefined, eventId: string): string | null {
  if (!template) return null;
  if (template.includes("EVENT_ID")) return template.replace("EVENT_ID", encodeURIComponent(eventId));
  return template;
}

function gcalStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

// "+ Calendar" button: a prefilled Google Calendar event.
export function googleCalendarUrl(event: FoodEvent): string {
  const dates = event.all_day
    ? `${dayKey(new Date(event.start)).replace(/-/g, "")}/${dayKey(new Date(event.end)).replace(/-/g, "")}`
    : `${gcalStamp(event.start)}/${gcalStamp(event.end)}`;
  const details = `${event.food_text}. Found on UIUC Eats. Source: ${event.proof_url}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates,
    details,
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
