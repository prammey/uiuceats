"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Mascot from "@/components/final/Mascot";
import ShareButton from "@/components/final/ShareButton";
import { mulberry32, useClientSeed } from "@/lib/seed";

const LINES = [
  "Out of meal swipes? 🍽️",
  "Broke but hungry? 🫠",
  "Skipped breakfast again? 😴",
  "New club, free snacks 👀",
  "Study fuel, zero dollars 🔋",
  "Dining hall closed? We got you 🫶",
];

const FOODS = ["🍕", "🧋", "🍪", "🌮", "🍜", "🍔", "🌯", "🥞", "🧁", "🍩", "🥟", "🍛", "🌭", "🍦", "🍉", "🥨", "🍱"];
const FLOAT_POOL = ["🍪", "🌮", "🥟", "🧋", "🍩", "🍜", "🍕", "🥐", "🍟", "🧁", "🥪"];
const FLOAT_SIZES = [30, 36, 48]; // font px

// ── Mascot settings ───────────────────────────────────────────────────────────
// Change these numbers to move or resize the bird; nothing else needs editing.
// The bird is a square box. `size` is its width and height on wide screens; it
// shrinks on narrower screens but never below `minSize`. The food is placed from
// the box's top-left corner and its size follows the bird's.
const MASCOT = {
  size: 415, // px on wide screens
  minSize: 160, // px floor on phones
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
// Shrinks with the screen (30% of its width) between the two limits above.
const MASCOT_SIZE = `clamp(${MASCOT.minSize}px, 30vw, ${MASCOT.size}px)`;
const MASCOT_PHONE_SIZE = `clamp(${MASCOT.phoneSize.min}px, ${MASCOT.phoneSize.vw}vw, ${MASCOT.phoneSize.max}px)`;

// Phone headline: "FREE" and "FOOD" each take a line at the big size, "ON CAMPUS" the base
// size. The space under the buttons gives up exactly what the headline grows, so the hero's
// height and the bird do not move. Tablet and up ignore both values.
const HERO_PHONE_BASE = "clamp(2.1rem, 11vw, 3rem)";
const HERO_PHONE_BIG = "clamp(3rem, 18vw, 4.5rem)";
const HERO_PHONE_GROWTH = "(1.9 * var(--hero-big) - 0.95 * var(--hero-base))";

// ── Floater rules ─────────────────────────────────────────────────────────────
// Background emojis land only in empty space: at least FLOATER_PAD px from anything
// marked data-keepout (text, button, mascot), FLOATER_GAP px from each other, and
// FLOATER_EDGE px inside the panel. Spots are tried at random; an emoji that finds
// no room after FLOATER_TRIES attempts is left out.
const FLOATER_PAD = 36; // 20 clear + 14 of float-animation travel + wiggle room
const FLOATER_GAP = 56;
const FLOATER_EDGE = 24;
const FLOATER_TRIES = 80;
const FLOATER_COUNT = 6;
// Phones get more, smaller floaters, and they may sit behind the text (not the buttons or bird).
const PHONE_FLOATER_COUNT = 9;
const PHONE_FLOATER_SCALE = 0.7;
const PHONE_FLOATER_PAD = 10;
const PHONE_FLOATER_GAP = 36;
const PHONE_QUERY = "(max-width: 639px)";

type FloaterPick = { emoji: string; size: number; slow: boolean };
type Floater = FloaterPick & { left: number; top: number };
type Rect = { left: number; top: number; right: number; bottom: number };

const overlaps = (a: Rect, b: Rect, margin: number) =>
  a.left < b.right + margin && a.right > b.left - margin && a.top < b.bottom + margin && a.bottom > b.top - margin;

// An emoji glyph draws a little wider than its font size.
const floaterRect = (left: number, top: number, size: number): Rect => {
  const box = size * 1.25;
  return { left, top, right: left + box, bottom: top + box };
};

// Everything the floaters must avoid, relative to the panel's top-left corner.
// `data-keepout="text"` measures the glyphs line by line, so the space beside a
// short line stays usable; anything else blocks its whole box.
function keepOutRects(panel: HTMLElement, phone: boolean): Rect[] {
  const origin = panel.getBoundingClientRect();
  const rects: Rect[] = [];
  panel.querySelectorAll<HTMLElement>("[data-keepout]").forEach((el) => {
    if (phone && el.tagName !== "DIV") return; // on phones only the buttons and the bird are kept clear
    let boxes: DOMRect[];
    if (el.dataset.keepout === "text") {
      const range = document.createRange();
      range.selectNodeContents(el);
      boxes = Array.from(range.getClientRects());
    } else {
      boxes = [el.getBoundingClientRect()];
    }
    for (const b of boxes) {
      if (b.width === 0 || b.height === 0) continue;
      rects.push({ left: b.left - origin.left, top: b.top - origin.top, right: b.right - origin.left, bottom: b.bottom - origin.top });
    }
  });
  return rects;
}

function placeFloaters(panel: HTMLElement, picks: FloaterPick[], rand: () => number): Floater[] {
  const phone = window.matchMedia(PHONE_QUERY).matches;
  const keepOut = keepOutRects(panel, phone);
  const pad = phone ? PHONE_FLOATER_PAD : FLOATER_PAD;
  const gap = phone ? PHONE_FLOATER_GAP : FLOATER_GAP;
  const placed: Floater[] = [];
  const wanted = phone ? picks : picks.slice(0, FLOATER_COUNT);
  for (const rawPick of wanted) {
    const pick = phone ? { ...rawPick, size: Math.round(rawPick.size * PHONE_FLOATER_SCALE) } : rawPick;
    const box = pick.size * 1.25;
    const spanX = Math.max(0, panel.clientWidth - box - FLOATER_EDGE * 2);
    const spanY = Math.max(0, panel.clientHeight - box - FLOATER_EDGE * 2);
    for (let attempt = 0; attempt < FLOATER_TRIES; attempt++) {
      const left = Math.round(FLOATER_EDGE + rand() * spanX);
      const top = Math.round(FLOATER_EDGE + rand() * spanY);
      const rect = floaterRect(left, top, pick.size);
      if (keepOut.some((k) => overlaps(rect, k, pad))) continue;
      if (placed.some((p) => overlaps(rect, floaterRect(p.left, p.top, p.size), gap))) continue;
      placed.push({ ...pick, left, top });
      break;
    }
  }
  return placed;
}

export default function HeroFinal() {
  const seed = useClientSeed();
  const [tick, setTick] = useState(0);
  const [pickedFood, setPickedFood] = useState<number | null>(null);
  const [jiggling, setJiggling] = useState(false);
  const [noticed, setNoticed] = useState(false); // the food has been tapped once
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [placed, setPlaced] = useState(false);
  const [ready, setReady] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Every page load gets its own opening line, starting emoji, and set of floaters.
  const start = useMemo(() => {
    if (seed === null) return { line: 0, food: 0, picks: [] as FloaterPick[] };
    const rand = mulberry32(seed);
    const pool = [...FLOAT_POOL];
    const picks: FloaterPick[] = Array.from({ length: PHONE_FLOATER_COUNT }, () => ({
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
      setFloaters(placeFloaters(panel, start.picks, mulberry32(seed + 1)));
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

  // Until the food is tapped once, jiggle it every 7–10 s to hint that it's a button.
  useEffect(() => {
    if (!ready || noticed) return;
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        setJiggling(true);
        schedule();
      }, 7000 + Math.random() * 3000);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [ready, noticed]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((current) => current + 1), 1700);
    return () => window.clearInterval(id);
  }, []);

  const lineIndex = (start.line + tick) % LINES.length;
  const foodIndex = pickedFood ?? start.food;

  function nextFood() {
    setNoticed(true);
    setJiggling(false);
    setPickedFood((foodIndex + 1) % FOODS.length);
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
            style={{ "--mascot-phone": MASCOT_PHONE_SIZE, "--mascot-full": MASCOT_SIZE, "--hero-base": HERO_PHONE_BASE, "--hero-big": HERO_PHONE_BIG } as CSSProperties}
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
            <p key={lineIndex} data-keepout="box" aria-live="polite" className="mt-8 animate-pop font-soft text-[clamp(1rem,5vw,1.5rem)] font-bold text-white drop-shadow-[2px_2px_0_#13294b] sm:mt-10 sm:text-3xl lg:text-4xl">
              {LINES[lineIndex]}
            </p>
            {/* Actions sit under the line instead of competing with the headline. Both buttons
                share one height: the Share button sets it, Find food stretches to match. */}
            <div data-keepout="box" className="mt-6 flex w-fit flex-col items-stretch gap-3 sm:mt-[47px] sm:flex-row">
              <a
                href="#menu"
                onClick={(event) => {
                  // Scroll without leaving "#menu" in the address bar.
                  event.preventDefault();
                  document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="brut-press flex items-center justify-center py-3 sm:justify-start sm:py-0 rounded-lg border-2 border-brut bg-[#6cbcff] px-3 sm:px-5 font-swash text-base leading-none text-[#ffa05c] shadow-[3px_3px_0_#111] [text-shadow:0_1px_3px_rgba(19,41,75,0.35)] transition-colors hover:bg-[#4faeff] sm:text-2xl"
              >
                Find Food&thinsp; 👀
              </a>
              <ShareButton />
            </div>
            {/* Keep room for the mascot on phones so it never sits on the text (56 is the pb-14 below). */}
            <div className="sm:hidden" style={{ height: `calc(var(--mascot-size) + ${MASCOT.raise + MASCOT.phoneGap - MASCOT.phoneLift - 56}px - ${HERO_PHONE_GROWTH})` }} />

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
