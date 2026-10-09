import { Fredoka, Nunito } from "next/font/google";
import Banner from "@/components/a/Banner";
import EventList from "@/components/a/EventList";
import FunLayer from "@/components/FunLayer";
import Hero from "@/components/a/Hero";
import Ticker from "@/components/a/Ticker";
import { formatUpdated, type EventsFile } from "@/lib/events";
import data from "@/data/events.json";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["600", "700"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], weight: ["400", "600", "700", "800"] });

const events = data as EventsFile;
const ADVERTISE_URL = process.env.NEXT_PUBLIC_ADVERTISE_FORM_URL;
const REPORT_TEMPLATE = process.env.NEXT_PUBLIC_REPORT_FORM_URL;

// Version A: the playful, emoji-forward look. Served at / and /A.
export default function PageA() {
  return (
    <div className={`${fredoka.variable} ${nunito.variable} relative min-h-dvh bg-cream font-sans text-ink`}>
      <div aria-hidden className="bg-dots pointer-events-none fixed inset-0 -z-10" />
      <FunLayer />

      <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-5 sm:pt-8">
        <Hero count={events.count} />
        <Ticker />
        <Banner />

        <EventList events={events.events} reportTemplate={REPORT_TEMPLATE} />

        <section className="mt-12 overflow-hidden rounded-[2rem] bg-illini-blue px-6 py-7 text-white shadow-xl sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h2 className="font-display text-2xl font-bold">Hosting a free-food event? 📣</h2>
              <p className="mt-1 max-w-md text-sm text-white/80">
                Clubs and departments get a highlighted ✨ spot on the day it happens. Free and walk-in only.
              </p>
            </div>
            {ADVERTISE_URL ? (
              <a
                href={ADVERTISE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-illini-orange px-5 py-2.5 font-display font-bold shadow-lg transition hover:-translate-y-0.5 hover:bg-white hover:text-illini-orange"
              >
                Advertise your event
              </a>
            ) : (
              <span className="rounded-full border-2 border-white/30 px-5 py-2.5 font-display text-sm font-bold text-white/70">
                Submission form coming soon
              </span>
            )}
          </div>
        </section>

        <footer className="mt-10 space-y-3 text-center text-xs text-ink-muted">
          <p className="font-semibold">
            Last checked {formatUpdated(events.generated_at)} (campus time) · {events.count} listings this week
          </p>
          <details className="mx-auto max-w-2xl rounded-2xl bg-white/70 px-4 py-3 text-left">
            <summary className="cursor-pointer text-center font-extrabold text-illini-blue">🤔 How this works</summary>
            <p className="mt-2 leading-relaxed">
              Every few hours a script reads the public campus calendar feeds (calendars.illinois.edu and
              one.illinois.edu), keeps the next 7 days, and drops anything that mentions RSVPs, registration,
              tickets, or a price. An event is listed only when a sentence in its own description says food is
              provided; that sentence is quoted on the card. Nothing is written by a person or an AI.
            </p>
          </details>
          <p>
            Made with 🧡💙 by a hungry Illini · Not affiliated with the University of Illinois ·{" "}
            <span className="opacity-60">psst: ↑ ↑ ↓ ↓ ← → ← → B A</span>
          </p>
          <p>
            <a href="/B" className="font-bold text-illini-blue underline underline-offset-2 hover:text-illini-orange">
              Try the other look →
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
