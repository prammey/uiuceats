"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Mascot from "@/components/final/Mascot";
import ShareButton from "@/components/final/ShareButton";
import { track } from "@/lib/analytics";
import { placeFloaters, type Floater, type FloaterPick, type FloaterRules } from "@/lib/floaters";
import { mulberry32, useClientSeed } from "@/lib/seed";

// ═══════════════════════════════════════════════════════════════════════════
// Settings. Everything tunable about the hero lives in this block.
// ═══════════════════════════════════════════════════════════════════════════

// Rotating line under the headline; one is shown at a time.
const LINES = [
  "Out of meal swipes? 🍽️",
  "Broke but hungry? 🫠",
  "Skipped breakfast again? 😴",
  "New club, free snacks 👀",
  "Study fuel, zero dollars 🔋",
  "Dining hall closed? We got you 🫶",
];

// The food in the mascot's hand; a tap steps to the next one.
const FOODS = ["🍕", "🧋", "🍪", "🌮", "🍜", "🍔", "🌯", "🥞", "🧁", "🍩", "🥟", "🍛", "🌭", "🍦", "🍉", "🥨", "🍱"];
// Background emojis are drawn from this pool, each at one of these font sizes (px).
const FLOAT_POOL = ["🍪", "🌮", "🥟", "🧋", "🍩", "🍜", "🍕", "🥐", "🍟", "🧁", "🥪"];
const FLOAT_SIZES = [30, 36, 48];

// ── Mascot ───────────────────────────────────────────────────────────────────
// The bird is a square box. `size` is its width and height on wide screens; it
// shrinks on narrower screens but never below `minSize`. The food is placed from
// the box's top-left corner and its size follows the bird's.
const MASCOT = {
  size: 415, // px on wide screens
  minSize: 160, // px floor (tablet)
  raise: 40, // px between the feet and the hero's bottom border
  inset: -40, // px between the bird and the right awning (tablet and up)
  phoneInset: 0, // same, on phones, where the bird must stay fully in view
  phoneGap: 16, // px of air between the buttons and the bird on phones
  phoneSize: { min: 150, vw: 45, max: 190 }, // px: the bird is 45% of the phone's width, between these
  phoneLift: 60, // px the bird rises beside the buttons on phones (they sit at the left)
  food: {
    x: 86, // % across the box where the food's center sits
    y: 37, // % down the box
    scale: 0.17, // food size as a fraction of the bird's size
  },
};
// Tablet and up: shrinks with the screen (30% of its width) between the two limits.
const MASCOT_SIZE = `clamp(${MASCOT.minSize}px, 30vw, ${MASCOT.size}px)`;
const MASCOT_PHONE_SIZE = `clamp(${MASCOT.phoneSize.min}px, ${MASCOT.phoneSize.vw}vw, ${MASCOT.phoneSize.max}px)`;

// ── Phone typography ─────────────────────────────────────────────────────────
// Phone text sizes scale with the width left for text (the screen minus the two 36 px
// awnings and the 16 px padding each side), so nothing wraps on narrow phones. The factors
// come from measured widths: "ON CAMPUS" is 6.18 × its font size wide in Shrikhand and the
// longest rotating message is 14.98 × its font size in Fredoka; both get a 6-7% margin.
// "FREE" and "FOOD" take a line each at the big size. The space under the buttons gives up
// exactly what the headline grows, so the hero's height and the bird do not move. Tablet
// and up ignore all of these.
const PHONE_TEXT_INSET = 104; // px: 2 × 36 awning + 2 × 16 padding
const HERO_PHONE_BASE = `min(calc((100vw - ${PHONE_TEXT_INSET}px) * 0.15), 3rem)`;
const HERO_PHONE_BIG = "clamp(3rem, 18vw, 4.5rem)";
const LINE_PHONE_SIZE = `min(calc((100vw - ${PHONE_TEXT_INSET}px) * 0.0627), 1.5rem)`;
const HERO_PHONE_GROWTH = "(1.9 * var(--hero-big) - 0.95 * var(--hero-base))";
const HERO_PHONE_LINE_GAP = 12; // px between "ON CAMPUS" and the rotating line on phones (32 from tablet up)
// The rotating line's box used to be 1.5 × 5vw tall; the spacer takes back whatever the
// smaller line gives up, so the hero's height stays where it was.
const HERO_PHONE_LINE_SHRINK = "(1.5 * (5vw - var(--line-size)))";

// ── Background emojis ────────────────────────────────────────────────────────
// They land only in empty space (see lib/floaters.ts). `pad` includes the 14 px the
// float animation travels. Phones are off for now: set `count` to bring them back.
const FLOATER_RULES: FloaterRules = { count: 6, scale: 1, pad: 36, gap: 56, edge: 24, tries: 80, textKeepOut: true };
const PHONE_FLOATER_RULES: FloaterRules = { count: 0, scale: 0.7, pad: 10, gap: 36, edge: 24, tries: 80, textKeepOut: false };
const PHONE_QUERY = "(max-width: 639px)";

// Timings (ms).
const LINE_INTERVAL = 1700; // rotating line
const JIGGLE_MIN = 3000; // the hand food jiggles every 3–5 s until tapped
const JIGGLE_SPREAD = 2000;

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export default function HeroFinal() {
  const seed = useClientSeed();
  const [tick, setTick] = useState(0);
  const [pickedFood, setPickedFood] = useState<number | null>(null);
  const [jiggling, setJiggling] = useState(false);
  const [noticed, setNoticed] = useState(false); // the food has been tapped once
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [placed, setPlaced] = useState(false); // floaters have been laid out at least once
  const [ready, setReady] = useState(false); // the hero may fade in
  const panelRef = useRef<HTMLDivElement>(null);

  // Every page load gets its own opening line, starting emoji, and set of floaters.
  const start = useMemo(() => {
    if (seed === null) return { line: 0, food: 0, picks: [] as FloaterPick[] };
    const rand = mulberry32(seed);
    const pool = [...FLOAT_POOL];
    const picks: FloaterPick[] = Array.from({ length: Math.max(FLOATER_RULES.count, PHONE_FLOATER_RULES.count) }, () => ({
      emoji: pool.splice(Math.floor(rand() * pool.length), 1)[0],
      size: FLOAT_SIZES[Math.floor(rand() * FLOAT_SIZES.length)],
      slow: rand() > 0.5,
    }));
    return {
      line: Math.floor(rand() * LINES.length),
      food: Math.floor(rand() * FOODS.length),
      picks,
    };
  }, [seed]);

  // Place the floaters once the real layout is known (web fonts and the mascot
  // image loaded), and again whenever the panel's width changes.
  useEffect(() => {
    const panel = panelRef.current;
    if (seed === null || !panel) return;
    let frame = 0;
    let lastWidth = 0;
    let cancelled = false;
    const place = () => {
      if (cancelled || panel.clientWidth === lastWidth) return;
      lastWidth = panel.clientWidth;
      const rules = window.matchMedia(PHONE_QUERY).matches ? PHONE_FLOATER_RULES : FLOATER_RULES;
      setFloaters(placeFloaters(panel, start.picks, mulberry32(seed + 1), rules));
      setPlaced(true);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    // decode() resolves once the mascot is ready to paint (a failed image still resolves).
    const imageReady = panel.querySelector("img")?.decode().catch(() => undefined) ?? Promise.resolve();
    Promise.all([document.fonts.ready, imageReady]).then(schedule);
    window.addEventListener("resize", schedule);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
    };
  }, [seed, start.picks]);

  // The hero's content stays invisible until that first complete layout has
  // painted, then everything fades in together.
  useEffect(() => {
    if (!placed) return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setReady(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [placed]);

  // Until the food is tapped once, jiggle it every 3–5 s to hint that it's a button.
  useEffect(() => {
    if (!ready || noticed) return;
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        setJiggling(true);
        schedule();
      }, JIGGLE_MIN + Math.random() * JIGGLE_SPREAD);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [ready, noticed]);

  // Advance the rotating line.
  useEffect(() => {
    const id = window.setInterval(() => setTick((current) => current + 1), LINE_INTERVAL);
    return () => window.clearInterval(id);
  }, []);

  const lineIndex = (start.line + tick) % LINES.length;
  const foodIndex = pickedFood ?? start.food;

  function nextFood() {
    const next = (foodIndex + 1) % FOODS.length;
    setNoticed(true);
    setJiggling(false);
    setPickedFood(next);
    track("hand_food_tapped", { food: FOODS[next] });
  }

  return (
    <section className="flex border-b-[3px] border-brut">
      {/* Awning columns on both sides of the gradient, same width as the checkerboard columns below. */}
      <div aria-hidden className="diag-stripes w-9 shrink-0 border-r-[3px] border-brut sm:w-12 lg:w-[60px]" />

      <div ref={panelRef} className="relative min-w-0 flex-1 overflow-hidden bg-linear-to-br from-illini-orange via-[#ff8a3d] to-b-yellow text-white">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/20 blur-3xl animate-blob" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-illini-blue/20 blur-3xl animate-blob [animation-delay:-8s]" />

        {/* Everything in front of the gradient fades in at once; see `ready`. */}
        <div className={`transition-opacity duration-700 ease-out ${ready ? "opacity-100" : "opacity-0"}`}>
          {floaters.map((f, index) => (
            <span
              key={`${f.emoji}-${index}`}
              aria-hidden
              className={`pointer-events-none absolute select-none leading-none opacity-50 drop-shadow ${
                f.slow ? "animate-float-slow" : "animate-float"
              }`}
              style={{ left: f.left, top: f.top, fontSize: f.size }}
            >
              {f.emoji}
            </span>
          ))}

          <div
            className="relative mx-auto max-w-6xl px-4 pb-14 pt-8 [--mascot-size:var(--mascot-phone)] sm:px-8 sm:pb-[97px] sm:pt-16 sm:[--mascot-size:var(--mascot-full)] lg:pb-[81px] lg:pt-20"
            style={{ "--mascot-phone": MASCOT_PHONE_SIZE, "--mascot-full": MASCOT_SIZE, "--hero-base": HERO_PHONE_BASE, "--hero-big": HERO_PHONE_BIG, "--line-gap": `${HERO_PHONE_LINE_GAP}px`, "--line-size": LINE_PHONE_SIZE } as CSSProperties}
          >
            <p data-keepout="text" className="font-body-f text-[11px] font-bold uppercase tracking-[0.3em] text-white/90 sm:text-xs">
              ★ University of Illinois · Free food finder ★
            </p>
            <h1 data-keepout="text" className="mt-6 font-swash text-(length:--hero-base) uppercase leading-[0.95] drop-shadow-[3px_3px_0_#13294b] sm:text-7xl lg:text-8xl xl:text-9xl">
              <span className="text-(length:--hero-big) sm:text-[1em]">Free</span>{" "}
              <br className="sm:hidden" />
              <span className="bg-linear-to-b from-[#d6f0ff] to-[#6cbcff] bg-clip-text text-transparent text-(length:--hero-big) sm:text-[1em]">Food</span>
              <br />
              on campus
            </h1>
            {/* The line changes width as it rotates, so its whole row is kept clear. */}
            <p key={lineIndex} data-keepout="box" aria-live="polite" className="mt-(--line-gap) animate-pop font-soft text-(length:--line-size) font-bold text-white drop-shadow-[2px_2px_0_#13294b] sm:mt-10 sm:text-3xl lg:text-4xl">
              {LINES[lineIndex]}
            </p>
            {/* Actions: stacked and left-aligned on phones, a row from tablet up (where the
                Share button sets the height and Find Food stretches to match). */}
            <div data-keepout="box" className="mt-6 flex w-fit flex-col items-stretch gap-3 sm:mt-[47px] sm:flex-row">
              <a
                href="#menu"
                onClick={(event) => {
                  // Scroll without leaving "#menu" in the address bar.
                  event.preventDefault();
                  track("find_food_clicked");
                  document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="brut-press flex items-center justify-center py-3 sm:justify-start sm:py-0 rounded-lg border-2 border-brut bg-[#6cbcff] px-3 sm:px-5 font-swash text-base leading-none text-white shadow-[3px_3px_0_#111] [text-shadow:0_1px_3px_rgba(255,255,255,0.7)] transition-colors hover:bg-[#4faeff] sm:text-2xl"
              >
                Find Food&thinsp; 👀
              </a>
              <ShareButton />
            </div>
            {/* Phone-only spacer that keeps the buttons clear of the bird; see "Phone typography"
                above for why it gives back what the headline takes (56 is the pb-14 below). */}
            <div className="sm:hidden" style={{ height: `calc(var(--mascot-size) + ${MASCOT.raise + MASCOT.phoneGap - MASCOT.phoneLift - 56 + (32 - HERO_PHONE_LINE_GAP)}px + ${HERO_PHONE_LINE_SHRINK} - ${HERO_PHONE_GROWTH})` }} />

            {/* Mascot box and the food in front of its raised hand; all numbers come from MASCOT above. */}
            <div
              data-keepout="box"
              className="absolute right-(--inset-phone) h-(--mascot-size) w-(--mascot-size) sm:right-(--inset)"
              style={{ bottom: MASCOT.raise, "--inset-phone": `${MASCOT.phoneInset}px`, "--inset": `${MASCOT.inset}px` } as CSSProperties}
            >
              <Mascot className="h-full w-full object-contain drop-shadow-lg" />
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 animate-bounce-soft"
                style={{ left: `${MASCOT.food.x}%`, top: `${MASCOT.food.y}%` }}
              >
                <button
                  key={foodIndex}
                  type="button"
                  onClick={nextFood}
                  aria-label="Food emoji. Tap to change it."
                  className="animate-pop select-none leading-none drop-shadow-lg transition hover:scale-110 active:scale-95"
                  style={{ fontSize: `calc(var(--mascot-size) * ${MASCOT.food.scale})` }}
                >
                  <span className={`inline-block ${jiggling ? "animate-jiggle" : ""}`} onAnimationEnd={() => setJiggling(false)}>
                    {FOODS[foodIndex]}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden className="diag-stripes w-9 shrink-0 border-l-[3px] border-brut sm:w-12 lg:w-[60px]" />
    </section>
  );
}
