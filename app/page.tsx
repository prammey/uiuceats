import Banner from "@/components/Banner";
import EventList from "@/components/EventList";
import { formatUpdated, type EventsFile } from "@/lib/events";
import data from "@/data/events.json";

const events = data as EventsFile;
const ADVERTISE_URL = process.env.NEXT_PUBLIC_ADVERTISE_FORM_URL;
const REPORT_TEMPLATE = process.env.NEXT_PUBLIC_REPORT_FORM_URL;

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-6 sm:pt-10">
      <header className="mb-5">
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-4xl leading-none">
            🍕
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-illini-blue">
              Food<span className="text-illini-orange">Please</span>
            </h1>
            <p className="text-sm font-semibold text-ink-muted">Free food at UIUC, today. No swipes needed.</p>
          </div>
        </div>
      </header>

      <Banner />

      <EventList events={events.events} reportTemplate={REPORT_TEMPLATE} />

      <section className="mt-10 rounded-2xl bg-illini-blue px-5 py-5 text-white">
        <h2 className="text-lg font-extrabold">Hosting a free-food event?</h2>
        <p className="mt-1 text-sm text-white/85">
          Clubs and departments can get a highlighted spot here. Walk-in and free only.
        </p>
        {ADVERTISE_URL ? (
          <a
            href={ADVERTISE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-full bg-illini-orange px-4 py-2 text-sm font-extrabold text-white shadow hover:bg-white hover:text-illini-orange"
          >
            Advertise your event ✨
          </a>
        ) : (
          <p className="mt-3 inline-block rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white/80">
            Submission form coming soon
          </p>
        )}
      </section>

      <footer className="mt-8 space-y-3 text-xs leading-relaxed text-ink-muted">
        <details className="rounded-2xl bg-white/70 px-4 py-3">
          <summary className="cursor-pointer font-bold text-illini-blue">How this works</summary>
          <p className="mt-2">
            Every few hours a script reads the public campus calendar feeds (calendars.illinois.edu and
            one.illinois.edu), keeps the next 7 days, and drops anything that mentions RSVPs, registration,
            tickets, or a price. An event is listed only when a sentence in its own description says food is
            provided; that sentence is shown on the card. Nothing is written by a person or an AI.
          </p>
        </details>
        <p>
          Last checked {formatUpdated(events.generated_at)} (campus time) · {events.count} listings ·
          Student-made, not affiliated with the University of Illinois.
        </p>
      </footer>
    </main>
  );
}
