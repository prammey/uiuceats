import { Alfa_Slab_One, Archivo, Space_Mono } from "next/font/google";
import EventListB from "@/components/b/EventListB";
import FunLayer from "@/components/FunLayer";
import HeroB from "@/components/b/HeroB";
import { formatUpdated, type EventsFile } from "@/lib/events";
import data from "@/data/events.json";

const alfa = Alfa_Slab_One({ variable: "--font-alfa", subsets: ["latin"], weight: "400" });
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], weight: ["500", "600", "700"] });
const spaceMono = Space_Mono({ variable: "--font-space-mono", subsets: ["latin"], weight: ["400", "700"] });

const events = data as EventsFile;
const ADVERTISE_URL = process.env.NEXT_PUBLIC_ADVERTISE_FORM_URL;
const REPORT_TEMPLATE = process.env.NEXT_PUBLIC_REPORT_FORM_URL;

const STEPS = [
  { n: "01", title: "We read the official calendars", body: "calendars.illinois.edu and one.illinois.edu, every 3 hours." },
  { n: "02", title: "We keep only walk-in, no-cost events", body: "Anything mentioning RSVPs, tickets, registration, or a price is dropped." },
  { n: "03", title: "Food must be in writing", body: "A listing appears only if its own description says food is provided. That line is quoted on the card." },
  { n: "04", title: "You show up", body: "Every card links to its source. Hit Proof if you want to double-check." },
];

// Version B: neo-brutalist retro fast food. Served at /B.
export default function PageB() {
  return (
    <div className={`${alfa.variable} ${archivo.variable} ${spaceMono.variable} min-h-dvh bg-b-cream font-body-b text-brut`}>
      <FunLayer />
      <HeroB count={events.count} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:pt-14">
        <EventListB events={events.events} reportTemplate={REPORT_TEMPLATE} />

        <section id="how" className="mt-16 scroll-mt-6">
          <p className="font-mono-b text-[11px] font-bold uppercase tracking-[0.3em] text-ink-muted">Kitchen rules</p>
          <h2 className="font-slab text-3xl uppercase text-illini-blue sm:text-4xl">How it works</h2>
          <ol className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <li key={step.n} className="brut bg-white p-4">
                <div className="font-slab text-4xl text-illini-orange">{step.n}</div>
                <h3 className="mt-2 font-slab text-lg leading-tight">{step.title}</h3>
                <p className="mt-2 text-sm font-medium text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="brut mt-16 bg-illini-blue p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="font-mono-b text-[11px] font-bold uppercase tracking-[0.3em] text-b-yellow">Hosts &amp; RSOs</p>
              <h2 className="font-slab text-3xl uppercase">Hosting a free-food event?</h2>
              <p className="mt-2 max-w-lg font-medium text-white/85">
                Get a sponsored spot on the menu board for the day it happens. Free and walk-in only, with a link to your
                event page so students can verify it.
              </p>
            </div>
            {ADVERTISE_URL ? (
              <a
                href={ADVERTISE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="brut brut-press bg-illini-orange px-6 py-3 font-slab text-lg uppercase text-white"
              >
                Submit an event
              </a>
            ) : (
              <span className="border-[3px] border-dashed border-white/50 px-6 py-3 font-mono-b text-xs font-bold uppercase tracking-widest text-white/70">
                Form coming soon
              </span>
            )}
          </div>
        </section>

        <footer className="mt-16">
          <div className="brut bg-white p-5 font-mono-b text-[11px] leading-relaxed text-brut">
            <p className="font-bold uppercase tracking-[0.3em]">Fine print</p>
            <p className="mt-2">
              New and experimental. Listings come straight from official campus calendars and only appear when the
              source text says food is provided. Plans change and food runs out, so tap Proof and confirm with the
              host before you head over. Nothing here is written by a person or an AI.
            </p>
            <p className="mt-2">
              Last checked {formatUpdated(events.generated_at)} (campus time) · {events.count} listings this week ·
              Student-made · Not affiliated with the University of Illinois.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 font-mono-b text-[11px] font-bold uppercase tracking-widest text-ink-muted">
            <span>Made with 🧡💙 in Urbana-Champaign</span>
            <a href="/A" className="underline decoration-2 underline-offset-4 hover:text-illini-orange">
              Try the other look →
            </a>
          </div>
        </footer>
      </main>

      <div aria-hidden className="retro-stripes h-5 border-t-[3px] border-brut" />
    </div>
  );
}
