import type { Metadata } from "next";
import {
  Black_Han_Sans,
  Bowlby_One,
  Bungee,
  DM_Sans,
  Dela_Gothic_One,
  Fredoka,
  IBM_Plex_Sans,
  Inter,
  Karla,
  Lilita_One,
  Nunito,
  Paytone_One,
  Rubik,
  Shrikhand,
  Source_Sans_3,
  Work_Sans,
} from "next/font/google";

export const metadata: Metadata = {
  title: "Font pairings · UIUC Eats",
  robots: { index: false, follow: false },
};

// Display faces
const fredoka = Fredoka({ subsets: ["latin"], weight: ["600", "700"] });
const bowlby = Bowlby_One({ subsets: ["latin"], weight: "400" });
const lilita = Lilita_One({ subsets: ["latin"], weight: "400" });
const bungee = Bungee({ subsets: ["latin"], weight: "400" });
const shrikhand = Shrikhand({ subsets: ["latin"], weight: "400" });
const paytone = Paytone_One({ subsets: ["latin"], weight: "400" });
const blackHan = Black_Han_Sans({ subsets: ["latin"], weight: "400" });
const dela = Dela_Gothic_One({ subsets: ["latin"], weight: "400" });

// Body faces
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "700"] });
const rubik = Rubik({ subsets: ["latin"], weight: ["400", "700"] });
const workSans = Work_Sans({ subsets: ["latin"], weight: ["400", "700"] });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "700"] });
const karla = Karla({ subsets: ["latin"], weight: ["400", "700"] });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "700"] });
const sourceSans = Source_Sans_3({ subsets: ["latin"], weight: ["400", "700"] });

type Pairing = {
  name: string;
  vibe: string;
  display: { font: { className: string }; name: string };
  body: { font: { className: string }; name: string };
  inUse?: boolean;
};

const PAIRINGS: Pairing[] = [
  { name: "Version A", vibe: "Rounded and friendly, very approachable", display: { font: fredoka, name: "Fredoka" }, body: { font: nunito, name: "Nunito" } },
  { name: "Poster", vibe: "Ultra-bold display with a neutral workhorse", display: { font: bowlby, name: "Bowlby One" }, body: { font: inter, name: "Inter" } },
  { name: "Soda shop", vibe: "Chunky, rounded, playful", display: { font: lilita, name: "Lilita One" }, body: { font: rubik, name: "Rubik" } },
  { name: "Street sign", vibe: "Blocky signage, geometric body", display: { font: bungee, name: "Bungee" }, body: { font: workSans, name: "Work Sans" }, inUse: true },
  { name: "Milkshake", vibe: "Swashy 70s script with a clean body", display: { font: shrikhand, name: "Shrikhand" }, body: { font: dmSans, name: "DM Sans" }, inUse: true },
  { name: "Snack bar", vibe: "Friendly heavy display, humanist body", display: { font: paytone, name: "Paytone One" }, body: { font: karla, name: "Karla" } },
  { name: "Headline", vibe: "Compressed black display, editorial body", display: { font: blackHan, name: "Black Han Sans" }, body: { font: plex, name: "IBM Plex Sans" } },
  { name: "Katakana", vibe: "Wide heavy display, neutral body", display: { font: dela, name: "Dela Gothic One" }, body: { font: sourceSans, name: "Source Sans 3" } },
];

function specimen(name: string) {
  return `https://fonts.google.com/specimen/${name.replace(/ /g, "+")}`;
}

export default function FontsPage() {
  return (
    <div className={`min-h-dvh bg-cream px-4 py-10 text-ink ${inter.className}`}>
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-illini-blue">Font pairings</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Each card shows the site headline, the rotating line, a card title, body copy, and a label in one pairing.
          Font names link to Google Fonts. The live site mixes 04 (signage) and 05 (accents and body).
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {PAIRINGS.map((pair, index) => (
            <section key={pair.name} className="rounded-2xl border-[3px] border-brut bg-white p-5 shadow-[6px_6px_0_#111]">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-ink-muted">
                  {String(index + 1).padStart(2, "0")} · {pair.name}
                  {pair.inUse && <span className="ml-2 rounded-md bg-illini-orange px-1.5 py-0.5 text-[10px] text-white">in use</span>}
                </h2>
                <p className="text-xs text-ink-muted">{pair.vibe}</p>
              </div>

              <p className={`mt-3 text-5xl uppercase leading-[0.95] text-illini-blue ${pair.display.font.className}`}>
                Free food
                <br />
                <span className="text-illini-orange">on campus</span>
              </p>
              <p className={`mt-3 text-xl font-bold ${pair.body.font.className}`}>Out of meal swipes? 🍽️</p>
              <p className={`mt-4 text-2xl ${pair.display.font.className}`}>October Illinites: Monstober</p>
              <p className={`mt-1 text-sm ${pair.body.font.className}`}>
                Illini Union Board · Illini Union I-Rooms. Lunch is provided from the Y Thai Eatery at no cost, so come
                ready to eat, listen, learn, and join the conversation!
              </p>
              <p className={`mt-3 text-[11px] font-bold uppercase tracking-[0.25em] ${pair.body.font.className}`}>
                ★ University of Illinois · Free food finder ★
              </p>

              <p className="mt-4 border-t-2 border-dashed border-brut pt-3 text-xs text-ink-muted">
                Display:{" "}
                <a className="font-bold text-illini-blue underline" href={specimen(pair.display.name)} target="_blank" rel="noopener noreferrer">
                  {pair.display.name}
                </a>{" "}
                · Body:{" "}
                <a className="font-bold text-illini-blue underline" href={specimen(pair.body.name)} target="_blank" rel="noopener noreferrer">
                  {pair.body.name}
                </a>
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
