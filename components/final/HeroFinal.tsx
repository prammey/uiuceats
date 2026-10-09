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
  { emoji: "🍪", left: "60%", top: "10%", size: "text-3xl", slow: true },
  { emoji: "🌮", left: "72%", top: "74%", size: "text-4xl", slow: true },
  { emoji: "🥟", left: "56%", top: "62%", size: "text-3xl", slow: false },
  { emoji: "🧋", left: "90%", top: "80%", size: "text-4xl", slow: false },
  { emoji: "🍩", left: "80%", top: "14%", size: "text-3xl", slow: true },
  { emoji: "🍜", left: "68%", top: "40%", size: "text-4xl", slow: true },
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
    <section className="flex border-b-[3px] border-brut">
      {/* Awning columns on both sides of the gradient. */}
      <div aria-hidden className="diag-stripes w-6 shrink-0 border-r-[3px] border-brut sm:w-10 lg:w-14" />

      <div className="relative min-w-0 flex-1 overflow-hidden bg-linear-to-br from-[#ff9f55] via-[#ffc46b] to-[#ffe7a3] text-illini-blue">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/30 blur-3xl animate-blob" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-illini-orange/20 blur-3xl animate-blob [animation-delay:-8s]" />
        {FLOATERS.map((f) => (
          <span
            key={f.emoji}
            aria-hidden
            className={`pointer-events-none absolute select-none opacity-50 drop-shadow ${f.size} ${
              f.slow ? "animate-float-slow" : "animate-float"
            }`}
            style={{ left: f.left, top: f.top }}
          >
            {f.emoji}
          </span>
        ))}

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-24 lg:py-28">
          {/* Share is a secondary action: thin box, top-right, out of the headline's way. */}
          <div className="mb-4 flex justify-end sm:absolute sm:right-8 sm:top-8 sm:mb-0">
            <ShareButton />
          </div>

          <p className="font-body-f text-[11px] font-bold uppercase tracking-[0.3em] sm:text-xs">
            ★ University of Illinois · Free food finder ★
          </p>
          <h1 className="mt-3 font-sign text-[2.75rem] uppercase leading-[0.95] sm:text-7xl lg:text-8xl xl:text-9xl">
            Free food
            <br />
            on campus
          </h1>
          <p key={line} aria-live="polite" className="mt-5 animate-pop font-swash text-2xl text-illini-orange drop-shadow-[2px_2px_0_#fff] sm:text-4xl lg:text-5xl">
            {LINES[line]}
          </p>
          {/* Keep room for the emoji on phones so it never sits on the text. */}
          <div className="h-20 sm:hidden" />

          <div className="absolute bottom-6 right-4 animate-bounce-soft sm:bottom-auto sm:right-12 sm:top-1/2 sm:-translate-y-1/2 lg:right-20">
            <button
              key={food}
              type="button"
              onClick={nextFood}
              aria-label="Food emoji. Tap to change it."
              className="animate-pop select-none text-6xl leading-none drop-shadow-lg transition hover:scale-110 active:scale-95 sm:text-[6.5rem] lg:text-[7.5rem]"
            >
              {FOODS[food]}
            </button>
          </div>
        </div>
      </div>

      <div aria-hidden className="diag-stripes w-6 shrink-0 border-l-[3px] border-brut sm:w-10 lg:w-14" />
    </section>
  );
}
