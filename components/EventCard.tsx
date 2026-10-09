import { formatClock, isHappeningNow, reportLink, type FoodEvent } from "@/lib/events";

type Props = {
  event: FoodEvent;
  now: Date;
  reportTemplate?: string;
};

export default function EventCard({ event, now, reportTemplate }: Props) {
  const live = isHappeningNow(event, now);
  const report = reportLink(reportTemplate, event.id);
  const frame = event.promoted
    ? "border-illini-orange bg-orange-50/40"
    : "border-line bg-white hover:border-illini-blue/40";

  return (
    <article className={`flex gap-4 rounded-md border p-4 transition ${frame}`}>
      <div className="w-[4.5rem] shrink-0 text-illini-blue">
        {event.all_day ? (
          <div className="text-sm font-bold leading-tight">All day</div>
        ) : (
          <>
            <div className="text-sm font-bold leading-tight">{formatClock(event.start)}</div>
            <div className="mt-0.5 text-xs text-ink-muted">to {formatClock(event.end)}</div>
          </>
        )}
        {live && (
          <span className="mt-1.5 inline-block rounded-sm bg-illini-orange px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Now
          </span>
        )}
        {event.promoted && (
          <span className="mt-1.5 inline-block rounded-sm bg-illini-blue px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Promoted
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-[15px] font-bold leading-snug text-illini-blue">{event.title}</h3>
        {event.host && <p className="mt-0.5 text-sm text-ink-muted">{event.host}</p>}

        <p className="mt-2 text-sm leading-snug">
          <a
            href={event.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink underline decoration-line underline-offset-2 hover:decoration-illini-orange"
          >
            {event.location}
          </a>
          <span className="mx-2 text-line">|</span>
          <span className="font-semibold text-illini-orange">{event.food_text}</span>
          {event.dietary.map((tag) => (
            <span key={tag} className="text-ink-muted">
              <span className="mx-1.5">·</span>
              {tag}
            </span>
          ))}
        </p>

        <p className="mt-2 text-xs italic leading-snug text-ink-muted">“{event.evidence}”</p>

        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold">
          <a
            href={event.proof_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-illini-blue underline underline-offset-2 hover:text-illini-orange"
          >
            Source ↗
          </a>
          <span className="font-normal text-ink-muted">{event.source_label}</span>
          {report && (
            <a
              href={report}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto font-normal text-ink-muted underline underline-offset-2 hover:text-illini-orange"
            >
              Report
            </a>
          )}
        </p>
      </div>
    </article>
  );
}
