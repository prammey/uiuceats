import {
  DIETARY_META,
  PERIOD_META,
  formatClock,
  googleCalendarUrl,
  isHappeningNow,
  mealPeriod,
  reportLink,
  type FoodEvent,
} from "@/lib/events";

type Props = {
  event: FoodEvent;
  now: Date;
  reportTemplate?: string;
  spotlight?: boolean;
};

export default function EventCard({ event, now, reportTemplate, spotlight = false }: Props) {
  const live = isHappeningNow(event, now);
  const report = reportLink(reportTemplate, event.id);
  const period = PERIOD_META[mealPeriod(event)];
  const frame = event.promoted
    ? "border-illini-orange bg-linear-to-br from-orange-50 to-yellow-50"
    : "border-illini-blue/10 bg-white";

  return (
    <article
      id={`card-${event.id}`}
      className={`group relative overflow-hidden rounded-2xl border-2 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl ${frame} ${
        spotlight ? "card-spotlight" : ""
      }`}
    >
      <div aria-hidden className={`absolute inset-y-0 left-0 w-2 ${period.stripe}`} />

      <div className="flex gap-4 p-4 pl-5 sm:p-5 sm:pl-6">
        <div className="flex w-16 shrink-0 flex-col items-center text-center sm:w-20">
          <span
            aria-hidden
            className="text-4xl leading-none drop-shadow-sm transition duration-300 group-hover:scale-125 group-hover:rotate-12 sm:text-5xl"
          >
            {event.icon}
          </span>
          {event.all_day ? (
            <span className="mt-2 text-xs font-extrabold text-illini-blue">All day</span>
          ) : (
            <>
              <span className="mt-2 text-xs font-extrabold text-illini-blue sm:text-sm">{formatClock(event.start)}</span>
              <span className="text-[11px] text-ink-muted">to {formatClock(event.end)}</span>
            </>
          )}
          <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
            {period.emoji} {period.label}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          {(live || event.promoted) && (
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {live && (
                <span className="animate-pulse-ring rounded-full bg-illini-orange px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-white">
                  🔥 Happening now
                </span>
              )}
              {event.promoted && (
                <span className="rounded-full bg-illini-blue px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-white">
                  ✨ Promoted by host
                </span>
              )}
            </div>
          )}

          <h3 className="font-display text-lg font-bold leading-tight text-illini-blue sm:text-xl">{event.title}</h3>
          {event.host && <p className="mt-0.5 text-sm font-semibold text-ink-muted">{event.host}</p>}

          <p className="mt-2 text-sm">
            <span aria-hidden>📍 </span>
            <a
              href={event.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline decoration-illini-orange/50 decoration-2 underline-offset-2 hover:text-illini-orange"
            >
              {event.location}
            </a>
          </p>
          <p className="mt-1 text-sm font-extrabold text-illini-orange">
            <span aria-hidden>🍴 </span>
            {event.food_text}
          </p>

          {event.dietary.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Dietary notes">
              {event.dietary.map((tag) => {
                const meta = DIETARY_META[tag] ?? { label: tag, emoji: "✅" };
                return (
                  <li key={tag} className="rounded-full bg-mint/15 px-2 py-0.5 text-xs font-bold text-mint">
                    <span aria-hidden>{meta.emoji} </span>
                    {meta.label}
                  </li>
                );
              })}
            </ul>
          )}

          <blockquote className="mt-3 rounded-xl bg-cream px-3 py-2 text-xs leading-snug text-ink-muted">
            <span aria-hidden>💬 </span>
            <span className="font-bold text-ink">Source says:</span> “{event.evidence}”
          </blockquote>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold">
            <a
              href={event.proof_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-illini-blue px-3 py-1.5 text-white shadow transition hover:bg-illini-orange"
            >
              Proof ↗
            </a>
            <a
              href={googleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-illini-blue/15 px-3 py-1 text-illini-blue transition hover:border-illini-orange hover:text-illini-orange"
            >
              📅 Add to calendar
            </a>
            <span className="font-semibold text-ink-muted">via {event.source_label}</span>
            {report && (
              <a
                href={report}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto font-semibold text-ink-muted underline underline-offset-2 hover:text-illini-orange"
              >
                Report a problem
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
