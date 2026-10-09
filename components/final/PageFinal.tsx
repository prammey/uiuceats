import { Alfa_Slab_One, Archivo, Space_Mono } from "next/font/google";
import EventListFinal from "@/components/final/EventListFinal";
import FunLayer from "@/components/FunLayer";
import HeroFinal from "@/components/final/HeroFinal";
import TopBar from "@/components/final/TopBar";
import { formatUpdated, type EventsFile } from "@/lib/events";
import data from "@/data/events.json";

const alfa = Alfa_Slab_One({ variable: "--font-alfa", subsets: ["latin"], weight: "400" });
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], weight: ["500", "600", "700"] });
const spaceMono = Space_Mono({ variable: "--font-space-mono", subsets: ["latin"], weight: ["400", "700"] });

const events = data as EventsFile;
const ADVERTISE_URL = process.env.NEXT_PUBLIC_ADVERTISE_FORM_URL;
const REPORT_TEMPLATE = process.env.NEXT_PUBLIC_REPORT_FORM_URL;

// Final version: A's hero energy on B's bones. Served at /.
export default function PageFinal() {
  return (
    <div className={`${alfa.variable} ${archivo.variable} ${spaceMono.variable} relative min-h-dvh bg-cream font-body-b text-brut`}>
      <div aria-hidden className="bg-dots pointer-events-none fixed inset-0 -z-10" />
      <FunLayer />

      <TopBar />
      <HeroFinal />
      <div aria-hidden className="retro-stripes h-5 border-y-[3px] border-brut" />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:pt-14">
        <EventListFinal events={events.events} reportTemplate={REPORT_TEMPLATE} />

        <section className="group brut mt-14 rounded-2xl bg-illini-blue p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="font-slab text-3xl uppercase">
                Want to advertise your event?{" "}
                <span
                  aria-hidden
                  className="inline-block transition duration-300 group-hover:-translate-y-1.5 group-hover:scale-125 group-hover:rotate-12"
                >
                  📣
                </span>
              </h2>
              <p className="mt-2 max-w-lg font-medium text-white/85">
                Hosting a free-food event? We&apos;ll include it and highlight it on the day it happens. Free and walk-in
                only.
              </p>
            </div>
            <a
              href={ADVERTISE_URL || "#"}
              target={ADVERTISE_URL ? "_blank" : undefined}
              rel={ADVERTISE_URL ? "noopener noreferrer" : undefined}
              className="brut brut-press rounded-xl bg-illini-orange px-6 py-3 font-slab text-lg uppercase text-white"
            >
              Submit your event
            </a>
          </div>
        </section>

        <footer className="mt-12 text-center">
          <p className="font-mono-b text-xs font-bold uppercase tracking-widest text-brut">Made with 🧡💙 in Urbana-Champaign 🤗</p>
          <p className="mx-auto mt-4 max-w-2xl text-[11px] leading-relaxed text-ink-muted/80">
            New and experimental. Listings come from official campus calendars and appear only when the source says
            food is provided, so confirm with the host before you go. Last checked {formatUpdated(events.generated_at)}{" "}
            (campus time) · Not affiliated with the University of Illinois.
          </p>
        </footer>
      </main>
    </div>
  );
}
