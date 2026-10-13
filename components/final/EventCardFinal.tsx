import {
  DIETARY_META,
  PERIOD_META,
  formatTimeRange,
  googleCalendarUrl,
  hasEnded,
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

// Receipt card: checker tile, signage labels, swash title, button bar.
export default function EventCardFinal({ event, now, reportTemplate, spotlight = false }: Props) {
  const live = isHappeningNow(event, now);
  const ended = hasEnded(event, now);
  const report = reportLink(reportTemplate, event.id);
  const period = PERIOD_META[mealPeriod(event)];

  return (
    <article
      id={`card-${event.id}`}
      className={`brut brut-hover b-spotlight-ready group flex flex-col rounded-2xl ${event.promoted ? "bg-b-yellow" : "bg-white"} ${
        spotlight ? "b-spotlight" : ""
      } ${ended ? "opacity-40" : ""}`}
    >
      <div className="flex items-stretch border-b-[3px] border-brut">
        <div className="checker-light flex w-20 shrink-0 items-center justify-center rounded-tl-[13px] border-r-[3px] border-brut">
          <span
            aria-hidden
            className="relative z-10 select-none text-4xl drop-shadow-sm transition duration-300 group-hover:scale-[1.6] group-hover:-rotate-12"
          >
            {event.icon}
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-1 px-3 py-2 font-body-f text-[11px] font-bold uppercase tracking-wider">
          <div className="flex items-center justify-between gap-2">
            <span>
              {period.emoji} {period.label}
            </span>
            <span className="text-illini-blue">{formatTimeRange(event)}</span>
          </div>
          {(live || ended || event.promoted) && (
            <div className="flex flex-wrap gap-1.5">
              {live && <span className="rounded-md bg-illini-orange px-1.5 py-0.5 text-white">● Now</span>}
              {ended && <span className="rounded-md bg-ink-muted px-1.5 py-0.5 text-white">Ended</span>}
              {event.promoted && <span className="rounded-md bg-brut px-1.5 py-0.5 text-b-yellow">Highlighted</span>}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 font-body-f">
        <h3 className="font-swash text-2xl leading-tight text-brut">{event.title}</h3>
        {event.host && <p className="mt-1 text-sm font-semibold text-ink-muted">{event.host}</p>}

        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex gap-3">
            <dt className="w-12 shrink-0 pt-0.5 text-[11px] font-bold uppercase tracking-wider text-ink-muted">Where</dt>
            <dd>
              <a
                href={event.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline decoration-2 underline-offset-2 hover:bg-b-yellow"
              >
                {event.location}
              </a>
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-12 shrink-0 pt-0.5 text-[11px] font-bold uppercase tracking-wider text-ink-muted">What</dt>
            <dd>
              <span className="font-swash text-base text-illini-orange">{event.food_text}</span>
              {event.dietary.map((tag) => {
                const meta = DIETARY_META[tag] ?? { label: tag, emoji: "✅" };
                return (
                  <span key={tag} className="ml-2 rounded-md border-2 border-brut bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase">
                    {meta.emoji} {meta.label}
                  </span>
                );
              })}
            </dd>
          </div>
        </dl>

        <p className="mt-3 border-t-[3px] border-dashed border-brut pt-2 text-xs leading-snug text-ink-muted">
          <span className="font-bold uppercase tracking-wider text-brut">Source says:</span> “{event.evidence}”
        </p>
      </div>

      <div className="flex divide-x-[3px] divide-brut border-t-[3px] border-brut font-swash text-base">
        <a
          href={event.proof_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-bl-[13px] bg-illini-blue py-2.5 text-center text-white transition-colors hover:bg-orange-bright"
        >
          Proof ↗
        </a>
        <a
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2.5 text-center text-brut transition-colors last:rounded-br-[13px] hover:bg-b-yellow"
        >
          + Calendar
        </a>
        {report && (
          <a
            href={report}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Report a problem with this listing"
            title="Report a problem"
            className="rounded-br-[13px] px-4 py-2.5 text-brut transition-colors hover:bg-orange-bright hover:text-white"
          >
            ⚑
          </a>
        )}
      </div>
    </article>
  );
}
