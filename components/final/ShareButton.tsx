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
      className={`brut-press rounded-lg border-2 border-brut bg-white/90 px-3 py-1.5 text-center font-body-f text-[10px] font-bold uppercase leading-snug tracking-wider text-brut shadow-[3px_3px_0_#111] transition-colors hover:bg-b-yellow sm:text-xs ${className}`}
    >
      {copied ? (
        "Link copied 🎉"
      ) : (
        <>
          <span className="block">Share with a</span>
          <span className="block">hungry friend 📣</span>
        </>
      )}
    </button>
  );
}
