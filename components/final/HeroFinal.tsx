"use client";

import { useEffect, useMemo, useState } from "react";
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

const FOODS = ["🍕", "🧋", "🍪", "🌮", "🍜", "🍔", "🌯", "🥞", "🧁", "🍣", "🍽️", "🍩", "🥟", "🍛", "🌭", "🍦", "🍉", "🥨", "🍱", "🍗"];
const FLOAT_POOL = ["🍪", "🌮", "🥟", "🧋", "🍩", "🍜", "🍕", "🥐", "🍇", "🍟", "🧁", "🍣", "🥪", "🍡"];
const SIZES = ["text-3xl", "text-4xl", "text-5xl"];

type Floater = { emoji: string; left: string; top: string; size: string; slow: boolean };

// Shown until the browser's seed arrives, then replaced by a random set.
const DEFAULT_FLOATERS: Floater[] = [
  { emoji: "🍪", left: "60%", top: "10%", size: "text-3xl", slow: true },
  { emoji: "🌮", left: "72%", top: "74%", size: "text-4xl", slow: true },
  { emoji: "🥟", left: "56%", top: "62%", size: "text-3xl", slow: false },
  { emoji: "🧋", left: "90%", top: "80%", size: "text-4xl", slow: false },
  { emoji: "🍩", left: "80%", top: "14%", size: "text-3xl", slow: true },
  { emoji: "🍜", left: "68%", top: "40%", size: "text-4xl", slow: true },
];

export default function HeroFinal() {
  const seed = useClientSeed();
  const [tick, setTick] = useState(0);
  const [pickedFood, setPickedFood] = useState<number | null>(null);

  // Every page load gets its own opening line, starting emoji, and floater layout
  // (right half of the panel only).
  const start = useMemo(() => {
    if (seed === null) return { line: 0, food: 0, floaters: DEFAULT_FLOATERS };
    const rand = mulberry32(seed);
    const pool = [...FLOAT_POOL];
    const floaters: Floater[] = Array.from({ length: 6 }, () => {
      const emoji = pool.splice(Math.floor(rand() * pool.length), 1)[0];
      return {
        emoji,
        left: `${Math.round(52 + rand() * 40)}%`,
        top: `${Math.round(6 + rand() * 82)}%`,
        size: SIZES[Math.floor(rand() * SIZES.length)],
        slow: rand() > 0.5,
      };
    });
    return {
      line: Math.floor(rand() * LINES.length),
      food: Math.floor(rand() * FOODS.length),
      floaters,
    };
  }, [seed]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((current) => current + 1), 3200);
    return () => window.clearInterval(id);
  }, []);

  const lineIndex = (start.line + tick) % LINES.length;
  const foodIndex = pickedFood ?? start.food;

  function nextFood() {
    let next = foodIndex;
    while (next === foodIndex) next = Math.floor(Math.random() * FOODS.length);
    setPickedFood(next);
  }

  return (
    <section className="flex border-b-[3px] border-brut">
      {/* Awning columns on both sides of the gradient, same width as the checkerboard columns below. */}
      <div aria-hidden className="diag-stripes w-9 shrink-0 border-r-[3px] border-brut sm:w-12 lg:w-[60px]" />

      <div className="relative min-w-0 flex-1 overflow-hidden bg-linear-to-br from-illini-orange via-[#ff8a3d] to-b-yellow text-white">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/20 blur-3xl animate-blob" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-illini-blue/20 blur-3xl animate-blob [animation-delay:-8s]" />
        {start.floaters.map((f, index) => (
          <span
            key={`${f.emoji}-${index}`}
            aria-hidden
            className={`pointer-events-none absolute select-none opacity-50 drop-shadow ${f.size} ${
              f.slow ? "animate-float-slow" : "animate-float"
            }`}
            style={{ left: f.left, top: f.top }}
          >
            {f.emoji}
          </span>
        ))}

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-8 sm:pb-24 sm:pt-16 lg:pb-28 lg:pt-20">
          {/* Share is a secondary action: thin two-line box, top-right, out of the headline's way. */}
          <div className="mb-4 flex justify-end sm:absolute sm:right-8 sm:top-8 sm:mb-0">
            <ShareButton />
          </div>

          <p className="font-body-f text-[11px] font-bold uppercase tracking-[0.3em] text-white/90 sm:text-xs">
            ★ University of Illinois · Free food finder ★
          </p>
          <h1 className="mt-6 font-swash text-5xl uppercase leading-[0.95] drop-shadow-[3px_3px_0_#13294b] sm:text-7xl lg:text-8xl xl:text-9xl">
            Free{" "}
            <span className="bg-linear-to-b from-[#d6f0ff] to-[#6cbcff] bg-clip-text text-transparent">Food</span>
            <br />
            on campus
          </h1>
          <p key={lineIndex} aria-live="polite" className="mt-5 animate-pop font-swash text-2xl text-white drop-shadow-[2px_2px_0_#13294b] sm:text-4xl lg:text-5xl">
            {LINES[lineIndex]}
          </p>
          {/* Keep room for the mascot on phones so it never sits on the text. */}
          <div className="h-36 sm:hidden" />

          {/* Mascot with the food floating in front of its open hand. */}
          <div className="absolute bottom-3 right-2 h-40 w-40 sm:bottom-auto sm:right-6 sm:top-1/2 sm:h-56 sm:w-56 sm:-translate-y-1/2 lg:right-10 lg:h-64 lg:w-64 xl:h-72 xl:w-72">
            <Mascot className="h-full w-full object-contain drop-shadow-lg" />
            <div className="absolute left-[10%] top-[44%] animate-bounce-soft">
              <button
                key={foodIndex}
                type="button"
                onClick={nextFood}
                aria-label="Food emoji. Tap to change it."
                className="animate-pop select-none text-4xl leading-none drop-shadow-lg transition hover:scale-110 active:scale-95 sm:text-6xl lg:text-7xl"
              >
                {FOODS[foodIndex]}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden className="diag-stripes w-9 shrink-0 border-l-[3px] border-brut sm:w-12 lg:w-[60px]" />
    </section>
  );
}
