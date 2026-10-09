import { DM_Sans, Fredoka, Shrikhand } from "next/font/google";
import EventListFinal from "@/components/final/EventListFinal";
import FunLayer from "@/components/FunLayer";
import HeroFinal from "@/components/final/HeroFinal";
import PurposeButton from "@/components/final/PurposeButton";
import TopBar from "@/components/final/TopBar";
import { formatUpdated, type EventsFile } from "@/lib/events";
import data from "@/data/events.json";

// Fonts page pairing 05: Shrikhand display, DM Sans body.
const shrikhand = Shrikhand({ variable: "--font-shrikhand", subsets: ["latin"], weight: "400" });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], weight: ["400", "500", "700", "800"] });
// Version A's title font, used only for the rotating hero line.
const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["600", "700"] });

const events = data as EventsFile;
const ADVERTISE_URL = process.env.NEXT_PUBLIC_ADVERTISE_FORM_URL;
const REPORT_TEMPLATE = process.env.NEXT_PUBLIC_REPORT_FORM_URL;
// The general report link is the same form without a pre-filled event id.
const REPORT_URL = REPORT_TEMPLATE ? REPORT_TEMPLATE.replace("EVENT_ID", "") : "#";

// Final version. Served at /.
export default function PageFinal() {
  return (
    <div className={`${shrikhand.variable} ${dmSans.variable} ${fredoka.variable} relative min-h-dvh bg-cream font-body-f text-brut`}>
      <div aria-hidden className="bg-dots pointer-events-none fixed inset-0 -z-10" />
      <FunLayer />

      <TopBar />
      <HeroFinal />
      <div aria-hidden className="retro-stripes-bright h-5 border-b-[3px] border-brut" />

      <div className="relative">
        {/* Green checkerboard columns, exactly three cells wide, same width as the hero's stripe
            columns, from under the hero to the bottom. Behind everything. */}
        <div
          aria-hidden
          className="checker-neon pointer-events-none absolute inset-y-0 left-0 z-0 w-9 [background-size:24px_24px] sm:w-12 sm:[background-size:32px_32px] lg:w-[60px] lg:[background-size:40px_40px]"
        />
        <div
          aria-hidden
          className="checker-neon pointer-events-none absolute inset-y-0 right-0 z-0 w-9 [background-size:24px_24px] sm:w-12 sm:[background-size:32px_32px] lg:w-[60px] lg:[background-size:40px_40px]"
        />

        <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-8 sm:pt-14">
          <EventListFinal events={events.events} reportTemplate={REPORT_TEMPLATE} />

          {/* One block: two stacked buttons on the left, the advertise panel on the right. */}
          <section className="mt-16 grid gap-4 sm:grid-cols-[15rem_1fr]">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
              <PurposeButton />
              <a
                href={REPORT_URL}
                target={REPORT_TEMPLATE ? "_blank" : undefined}
                rel={REPORT_TEMPLATE ? "noopener noreferrer" : undefined}
                className="brut brut-press flex items-center justify-center gap-2 rounded-2xl bg-[#ff9f55] px-4 py-4 text-center font-swash text-lg text-white transition-colors hover:bg-[#f0812e]"
              >
                Report a problem <span aria-hidden>→</span>
              </a>
            </div>

            <div className="group brut rounded-2xl bg-illini-blue p-6 text-white">
              <h2 className="font-swash text-2xl sm:whitespace-nowrap sm:text-3xl">
                Want to advertise your event?
                <span
                  aria-hidden
                  className="ml-4 inline-block transition duration-300 group-hover:-translate-y-1.5 group-hover:scale-125 group-hover:rotate-12"
                >
                  📣
                </span>
              </h2>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
                <p className="max-w-md font-medium text-white/85">
                  Hosting a free-food event? We&apos;ll include it and highlight it on the day it happens. Free and
                  walk-in only.
                </p>
                <a
                  href={ADVERTISE_URL || "#"}
                  target={ADVERTISE_URL ? "_blank" : undefined}
                  rel={ADVERTISE_URL ? "noopener noreferrer" : undefined}
                  className="brut brut-press shrink-0 rounded-xl bg-orange-bright px-6 py-3 font-swash text-lg text-white"
                >
                  Submit your event!
                </a>
              </div>
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
    </div>
  );
}
