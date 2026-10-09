import Banner from "@/components/Banner";
import EventList from "@/components/EventList";
import { formatUpdated, type EventsFile } from "@/lib/events";
import data from "@/data/events.json";

const events = data as EventsFile;
const ADVERTISE_URL = process.env.NEXT_PUBLIC_ADVERTISE_FORM_URL;
const REPORT_TEMPLATE = process.env.NEXT_PUBLIC_REPORT_FORM_URL;

export default function Home() {
  return (
    <>
      {/* Slim blue and orange bands, as on illinois.edu sites. No wordmark. */}
      <div aria-hidden className="h-2 bg-illini-blue" />
      <div aria-hidden className="h-1 bg-illini-orange" />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-16 pt-8 sm:pt-10">
        <header className="mb-5">
          <h1 className="font-heading text-2xl font-bold leading-tight text-illini-blue sm:text-3xl">
            Free food on campus this week
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted sm:text-base">
            Walk-in events with free food at UIUC, from official campus calendars. No sign-ups, no swipes.
          </p>
        </header>

        <Banner />

        <EventList events={events.events} reportTemplate={REPORT_TEMPLATE} />

        <footer className="mt-12 border-t border-line pt-4 text-xs text-ink-muted">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>Last checked {formatUpdated(events.generated_at)} (campus time)</span>
            <span>{events.count} listings this week</span>
            {ADVERTISE_URL && (
              <a
                href={ADVERTISE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-illini-blue underline underline-offset-2 hover:text-illini-orange"
              >
                Advertise your free-food event
              </a>
            )}
            <span>Student-made. Not affiliated with the University of Illinois.</span>
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer font-semibold text-illini-blue">How this works</summary>
            <p className="mt-2 max-w-2xl leading-relaxed">
              Every few hours a script reads the public campus calendar feeds (calendars.illinois.edu and
              one.illinois.edu), keeps the next 7 days, and drops anything that mentions RSVPs, registration,
              tickets, or a price. An event is listed only when a sentence in its own description says food is
              provided; that sentence is quoted on the card. Nothing is written by a person or an AI.
            </p>
          </details>
        </footer>
      </main>
    </>
  );
}
