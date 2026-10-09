import { formatTimeRange, isHappeningNow, reportLink, type FoodEvent } from "@/lib/events";

type Props = {
  event: FoodEvent;
  now: Date;
  reportTemplate?: string;
};

export default function EventCard({ event, now, reportTemplate }: Props) {
  const live = isHappeningNow(event, now);
  const report = reportLink(reportTemplate, event.id);

  const card = (
    <article
      className={`rounded-2xl bg-white p-4 shadow-sm ${
        event.promoted ? "" : "border border-illini-blue/10"
      }`}
    >
      <div className="flex gap-3">
        <div aria-hidden className="select-none text-3xl leading-none pt-0.5">
          {event.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
            <h3 className="text-base font-extrabold leading-tight text-illini-blue">{event.title}</h3>
            {live && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">
                Happening now
              </span>
            )}
            {event.promoted && (
              <span className="rounded-full bg-illini-orange px-2 py-0.5 text-xs font-bold text-white">
                Promoted by host
              </span>
            )}
          </div>
          {event.host && <p className="mt-0.5 text-sm text-ink-muted">{event.host}</p>}

          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex gap-2">
              <dt aria-label="Time" className="shrink-0">
                🕐
              </dt>
              <dd className="font-semibold">{formatTimeRange(event)}</dd>
            </div>
            <div className="flex gap-2">
              <dt aria-label="Location" className="shrink-0">
                📍
              </dt>
              <dd>
                <a
                  href={event.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-illini-orange/60 underline-offset-2 hover:text-illini-orange"
                >
                  {event.location}
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt aria-label="Food" className="shrink-0">
                🍴
              </dt>
              <dd className="font-bold text-illini-orange">{event.food_text}</dd>
            </div>
          </dl>

          <blockquote className="mt-2 rounded-xl bg-cream px-3 py-2 text-xs leading-snug text-ink-muted">
            <span className="font-bold text-ink">Source says:</span> “{event.evidence}”
          </blockquote>

          {event.dietary.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Dietary notes">
              {event.dietary.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-illini-blue-soft px-2 py-0.5 text-xs font-semibold text-illini-blue"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <a
              href={event.proof_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-illini-blue px-3 py-1 font-bold text-white hover:bg-illini-orange"
            >
              Proof ↗
            </a>
            <span className="text-xs text-ink-muted">via {event.source_label}</span>
            {report && (
              <a
                href={report}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs font-semibold text-ink-muted underline underline-offset-2 hover:text-illini-orange"
              >
                Report a problem
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );

  return event.promoted ? <div className="promoted-frame rounded-2xl">{card}</div> : card;
}
