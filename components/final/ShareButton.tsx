"use client";

import { useState } from "react";

export default function ShareButton({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const payload = {
      title: "UIUC Eats",
      text: "Free food on campus 🍕 No swipes needed.",
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
    <button
      type="button"
      onClick={share}
      className={`brut-press rounded-full border-[3px] border-brut bg-white px-5 py-2 font-mono-b text-[11px] font-bold uppercase tracking-wider text-brut shadow-[4px_4px_0_#111] transition-colors hover:bg-b-yellow sm:text-xs ${className}`}
    >
      {copied ? "Link copied 🎉" : "Share with a hungry friend 📣"}
    </button>
  );
}
