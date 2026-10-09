"use client";

import { useEffect, useState } from "react";
import ShareButton from "@/components/final/ShareButton";

const LINES = [
  "Out of meal swipes? 🍽️",
  "Broke but hungry? 🫠",
  "Skipped breakfast again? 😴",
  "New club, free snacks 👀",
  "Study fuel, zero dollars 🔋",
  "Dining hall closed? We got you 🫶",
];

const FOODS = ["🍕", "🧋", "🍪", "🌮", "🍜", "🍔", "🌯", "🥞", "🧁", "🍣", "🍽️", "🍩", "🥟", "🍛", "🌭", "🍦", "🍉", "🥨", "🍱", "🍗"];

// Faint food drifting in the panel, on every screen size.
const FLOATERS = [
  { emoji: "🍪", left: "62%", top: "8%", size: "text-3xl", slow: true },
  { emoji: "🌮", left: "74%", top: "56%", size: "text-4xl", slow: true },
  { emoji: "🥟", left: "58%", top: "66%", size: "text-3xl", slow: false },
  { emoji: "🧋", left: "90%", top: "70%", size: "text-4xl", slow: false },
  { emoji: "🍩", left: "66%", top: "88%", size: "text-3xl", slow: true },
  { emoji: "🍜", left: "82%", top: "22%", size: "text-4xl", slow: true },
];

export default function HeroFinal() {
  const [line, setLine] = useState(0);
  const [food, setFood] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setLine((current) => (current + 1) % LINES.length), 3200);
    return () => window.clearInterval(id);
  }, []);

  function nextFood() {
    setFood((current) => {
      let next = current;
      while (next === current) next = Math.floor(Math.random() * FOODS.length);
      return next;
    });
  }

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-illini-orange via-[#ff8a3d] to-b-yellow text-white">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/20 blur-3xl animate-blob" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-illini-blue/20 blur-3xl animate-blob [animation-delay:-8s]" />
      {FLOATERS.map((f) => (
        <span
          key={f.emoji}
          aria-hidden
          className={`pointer-events-none absolute select-none opacity-40 drop-shadow ${f.size} ${
            f.slow ? "animate-float-slow" : "animate-float"
          }`}
          style={{ left: f.left, top: f.top }}
        >
          {f.emoji}
        </span>
      ))}

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-24">
        <div className="pr-24 sm:pr-56">
          <p className="font-mono-b text-[11px] font-bold uppercase tracking-[0.3em] text-white/90 sm:text-xs">
            ★ University of Illinois · Free food finder ★
          </p>
          {/* Headline, rotating line, and share button share one column so the
              button's right edge lines up with the end of "CAMPUS". */}
          <div className="inline-flex w-fit max-w-full flex-col">
            <h1 className="mt-3 font-slab text-5xl uppercase leading-[0.92] drop-shadow-sm sm:text-7xl lg:text-8xl">
              Free food
              <br />
              on campus
            </h1>
            <p key={line} aria-live="polite" className="mt-5 animate-pop text-xl font-bold text-illini-blue sm:text-2xl">
              {LINES[line]}
            </p>
            <ShareButton className="mt-7 w-full" />
          </div>
        </div>

        <div className="absolute right-4 top-12 animate-bounce-soft sm:right-10 sm:top-20">
          <button
            key={food}
            type="button"
            onClick={nextFood}
            aria-label="Food emoji. Tap to change it."
            className="animate-pop select-none text-6xl leading-none drop-shadow-lg transition hover:scale-110 active:scale-95 sm:text-[6.5rem]"
          >
            {FOODS[food]}
          </button>
        </div>
      </div>
    </section>
  );
}
