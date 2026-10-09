import { Bungee, DM_Sans, Shrikhand } from "next/font/google";
import EventListFinal from "@/components/final/EventListFinal";
import FunLayer from "@/components/FunLayer";
import HeroFinal from "@/components/final/HeroFinal";
import TopBar from "@/components/final/TopBar";
import { formatUpdated, type EventsFile } from "@/lib/events";
import data from "@/data/events.json";

// Pairing 06 (Bungee) for signage and 09 (Shrikhand + DM Sans) for accents and body.
const bungee = Bungee({ variable: "--font-bungee", subsets: ["latin"], weight: "400" });
const shrikhand = Shrikhand({ variable: "--font-shrikhand", subsets: ["latin"], weight: "400" });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], weight: ["400", "500", "700"] });

const events = data as EventsFile;
const ADVERTISE_URL = process.env.NEXT_PUBLIC_ADVERTISE_FORM_URL;
const REPORT_TEMPLATE = process.env.NEXT_PUBLIC_REPORT_FORM_URL;

// Final version. Served at /.
export default function PageFinal() {
  return (
    <div className={`${bungee.variable} ${shrikhand.variable} ${dmSans.variable} relative min-h-dvh bg-cream font-body-f text-brut md:px-3`}>
      <div aria-hidden className="bg-dots pointer-events-none fixed inset-0 -z-10" />
      {/* Neon tubes running down both edges of the page. */}
      <div aria-hidden className="neon-rail pointer-events-none fixed inset-y-0 left-0 z-40 hidden w-3 md:block" />
      <div aria-hidden className="neon-rail pointer-events-none fixed inset-y-0 right-0 z-40 hidden w-3 md:block" />
      <FunLayer />

      <TopBar />
      <HeroFinal />
      <div aria-hidden className="retro-stripes h-5 border-b-[3px] border-brut" />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:pt-14">
        <EventListFinal events={events.events} reportTemplate={REPORT_TEMPLATE} />

        <section className="group brut mt-16 rounded-2xl bg-illini-blue p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="font-sign text-2xl uppercase sm:text-3xl">
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
              className="brut brut-press rounded-xl bg-illini-orange px-6 py-3 font-sign text-sm uppercase tracking-wider text-white"
            >
              Submit your event
            </a>
          </div>
        </section>

        <footer className="mt-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brut">Made with 🧡💙 in Urbana-Champaign 🤗</p>
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
