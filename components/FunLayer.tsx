"use client";

import { useEffect, useState } from "react";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const PARTY_EMOJI = ["🍕", "🌮", "🧋", "🍩", "🥟", "🍛", "🍪", "🍜", "🧁", "🍔", "🍟", "🥨", "🍉", "🍓", "🎉"];

type Piece = { id: number; left: number; delay: number; duration: number; emoji: string; size: number };

// Site-wide easter eggs: the Konami code rains food, and leaving the tab changes
// its title so people come back.
export default function FunLayer() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    let progress = 0;
    let timer: number | undefined;

    const party = () => {
      const now = Date.now();
      setPieces(
        Array.from({ length: 80 }, (_, i) => ({
          id: now + i,
          left: Math.random() * 100,
          delay: Math.random() * 1.2,
          duration: 2.6 + Math.random() * 2,
          emoji: PARTY_EMOJI[Math.floor(Math.random() * PARTY_EMOJI.length)],
          size: 22 + Math.random() * 22,
        })),
      );
      setToast(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setPieces([]);
        setToast(false);
      }, 5200);
    };

    const onKey = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === KONAMI[progress]) {
        progress += 1;
        if (progress === KONAMI.length) {
          progress = 0;
          party();
        }
      } else {
        progress = key === KONAMI[0] ? 1 : 0;
      }
    };

    const originalTitle = document.title;
    const onVisibility = () => {
      document.title = document.hidden ? "free food is waiting…  👀" : originalTitle;
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearTimeout(timer);
      document.title = originalTitle;
    };
  }, []);

  if (!pieces.length && !toast) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="absolute -top-10 animate-fall select-none"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            fontSize: `${piece.size}px`,
          }}
        >
          {piece.emoji}
        </span>
      ))}
      {toast && (
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 animate-pop rounded-full bg-illini-blue px-6 py-3 font-display text-lg font-bold text-white shadow-2xl">
          🎉 FREE FOOD MODE ACTIVATED
        </div>
      )}
    </div>
  );
}
