"use client";

import { useEffect, useState } from "react";

const LINES = [
  "Out of meal swipes? 🍽️",
  "Broke but hungry? 🫠",
  "Skipped breakfast again? 😴",
  "New club, free snacks 👀",
  "Study fuel, zero dollars 🔋",
  "Dining hall closed? We got you 🫶",
];

// Decorative food drifting behind the headline.
const FLOATERS = [
  { emoji: "🍪", left: "58%", top: "8%", size: "text-3xl", slow: true, mobile: false },
  { emoji: "🌮", left: "80%", top: "16%", size: "text-5xl", slow: true, mobile: true },
  { emoji: "🌯", left: "91%", top: "42%", size: "text-4xl", slow: false, mobile: true },
  { emoji: "🧋", left: "85%", top: "64%", size: "text-4xl", slow: false, mobile: true },
  { emoji: "🍩", left: "66%", top: "82%", size: "text-3xl", slow: true, mobile: false },
  { emoji: "🥟", left: "52%", top: "56%", size: "text-3xl", slow: false, mobile: false },
  { emoji: "🍜", left: "74%", top: "88%", size: "text-4xl", slow: true, mobile: true },
];

type Props = { count: number };

export default function Hero({ count }: Props) {
  const [line, setLine] = useState(0);
  const [spins, setSpins] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setLine((current) => (current + 1) % LINES.length), 3200);
    return () => window.clearInterval(id);
  }, []);

  function pizzaClick() {
    const next = spins + 1;
    setSpins(next);
    // Five clicks on the pizza throws a party.
    if (next % 5 === 0) window.dispatchEvent(new CustomEvent("uiuceats:party"));
  }

  async function share() {
    const payload = {
      title: "UIUC Eats",
      text: "Free food on campus this week 🍕 No swipes needed.",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
      } else {
        await navigator.clipboard.writeText(payload.url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      // Dismissed share sheet or clipboard blocked. Nothing to do.
    }
  }

  return (
    <header className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-illini-orange via-[#ff8a3d] to-sun p-6 text-white shadow-xl sm:p-10">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/25 blur-3xl animate-blob" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-illini-blue/25 blur-3xl animate-blob [animation-delay:-8s]" />
      {FLOATERS.map((f) => (
        <span
          key={f.emoji}
          aria-hidden
          className={`pointer-events-none absolute select-none opacity-55 drop-shadow ${f.size} ${
            f.slow ? "animate-float-slow" : "animate-float"
          } ${f.mobile ? "" : "hidden sm:inline"}`}
          style={{ left: f.left, top: f.top }}
        >
          {f.emoji}
        </span>
      ))}

      <div className="relative">
        <span className="inline-block" style={{ transform: `rotate(${spins * 72}deg)`, transition: "transform 0.5s cubic-bezier(.2,1.4,.4,1)" }}>
          <button
            type="button"
            onClick={pizzaClick}
            aria-label="Pizza. Click it a few times, trust me."
            className="text-6xl leading-none drop-shadow-lg transition hover:scale-110 active:scale-95 sm:text-7xl"
          >
            🍕
          </button>
        </span>

        <h1 className="mt-3 font-display text-4xl font-bold leading-[1.02] drop-shadow-sm sm:text-6xl">
          Free food
          <br />
          on campus
          <br />
          this week
        </h1>

        <p key={line} aria-live="polite" className="mt-4 animate-pop font-display text-xl font-semibold sm:text-2xl">
          {LINES[line]}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-illini-blue px-4 py-2 font-display text-sm font-bold shadow-md sm:text-base">
            {count} free {count === 1 ? "meal" : "meals"} this week · 0 swipes
          </span>
          <button
            type="button"
            onClick={share}
            className="rounded-full border-2 border-white/80 bg-white/15 px-4 py-2 font-display text-sm font-bold backdrop-blur transition hover:bg-white hover:text-illini-orange sm:text-base"
          >
            {copied ? "Link copied 🎉" : "Share with a hungry friend 📣"}
          </button>
        </div>
      </div>

      <div
        aria-hidden
        className="absolute right-4 top-4 rotate-6 rounded-full border-2 border-white/70 bg-white/20 px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-wider backdrop-blur animate-bounce-soft sm:right-8 sm:top-8 sm:text-xs"
      >
        100% free · walk-in only
      </div>
    </header>
  );
}
