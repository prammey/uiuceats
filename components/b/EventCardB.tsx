import {
  DIETARY_META,
  PERIOD_META,
  formatTimeRange,
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

// Receipt / ticket style card: thick border, hard shadow, mono labels.
export default function EventCardB({ event, now, reportTemplate, spotlight = false }: Props) {
  const live = isHappeningNow(event, now);
  const report = reportLink(reportTemplate, event.id);
  const period = PERIOD_META[mealPeriod(event)];

  return (
    <article
      id={`card-${event.id}`}
      className={`brut brut-hover flex flex-col ${event.promoted ? "bg-b-yellow" : "bg-white"} ${spotlight ? "b-spotlight" : ""}`}
    >
      <div className="flex items-stretch border-b-[3px] border-brut">
        <div
          aria-hidden
          className="checker-light flex w-20 shrink-0 items-center justify-center border-r-[3px] border-brut text-4xl"
        >
          {event.icon}
        </div>
        <div className="flex flex-1 flex-col justify-center gap-1 px-3 py-2 font-mono-b text-[11px] font-bold uppercase tracking-wider">
          <div className="flex items-center justify-between gap-2">
            <span>
              {period.emoji} {period.label}
            </span>
            <span className="text-illini-blue">{formatTimeRange(event)}</span>
          </div>
          {(live || event.promoted) && (
            <div className="flex flex-wrap gap-1.5">
              {live && <span className="bg-illini-orange px-1.5 py-0.5 text-white">● Now</span>}
              {event.promoted && <span className="bg-brut px-1.5 py-0.5 text-b-yellow">Sponsored spot</span>}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-4">
        <h3 className="font-slab text-xl leading-tight text-brut">{event.title}</h3>
        {event.host && <p className="mt-1 text-sm font-semibold text-ink-muted">{event.host}</p>}

        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex gap-3">
            <dt className="w-12 shrink-0 font-mono-b text-[11px] font-bold uppercase tracking-wider text-ink-muted pt-0.5">
              Where
            </dt>
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
            <dt className="w-12 shrink-0 font-mono-b text-[11px] font-bold uppercase tracking-wider text-ink-muted pt-0.5">
              What
            </dt>
            <dd>
              <span className="font-slab text-illini-orange">{event.food_text}</span>
              {event.dietary.map((tag) => {
                const meta = DIETARY_META[tag] ?? { label: tag, emoji: "✅" };
                return (
                  <span key={tag} className="ml-2 border-2 border-brut bg-white px-1.5 py-0.5 font-mono-b text-[10px] font-bold uppercase">
                    {meta.emoji} {meta.label}
                  </span>
                );
              })}
            </dd>
          </div>
        </dl>

        <p className="mt-3 border-t-[3px] border-dashed border-brut pt-2 font-mono-b text-[11px] leading-snug text-ink-muted">
          <span className="font-bold uppercase text-brut">Source says:</span> “{event.evidence}”
        </p>
      </div>

      <div className="flex divide-x-[3px] divide-brut border-t-[3px] border-brut font-slab text-sm uppercase">
        <a
          href={event.proof_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-illini-blue py-2.5 text-center text-white transition-colors hover:bg-illini-orange"
        >
          Proof ↗
        </a>
        <a
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2.5 text-center text-brut transition-colors hover:bg-b-yellow"
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
            className="px-4 py-2.5 text-brut transition-colors hover:bg-illini-orange hover:text-white"
          >
            ⚑
          </a>
        )}
      </div>
    </article>
  );
}
