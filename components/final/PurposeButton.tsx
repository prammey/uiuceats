"use client";

import { useEffect, useState } from "react";

// "Our purpose" opens a retro pop-up window inside the page.
export default function PurposeButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="brut brut-press flex items-center justify-center gap-2 rounded-2xl bg-[#4ea8ff] px-4 py-4 text-center font-swash text-lg text-white transition-colors hover:bg-[#2f8fe6]"
      >
        Our purpose <span aria-hidden>→</span>
      </button>

      {open && (
        <div
          role="presentation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-illini-blue/60 p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="purpose-title"
            onClick={(event) => event.stopPropagation()}
            className="brut w-full max-w-lg animate-pop rounded-2xl bg-white font-body-f text-brut"
          >
            <div className="flex items-stretch rounded-t-[13px] border-b-[3px] border-brut">
              <h2 id="purpose-title" className="flex-1 px-4 py-2 font-swash text-2xl">
                Purpose
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex w-14 items-center justify-center rounded-tr-[13px] border-l-[3px] border-brut bg-red-600 text-lg font-black text-white transition-colors hover:bg-red-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 px-5 py-5 text-sm leading-relaxed sm:text-base">
              <p>
                <span className="font-swash text-lg text-illini-orange">UIUC Eats</span> connects two groups that need each
                other.
              </p>
              <p>
                On one side: students who are out of swipes, short on time, or just hungry. On the other: clubs,
                cultural centers, and departments that host events with free food and want more people to show up.
              </p>
              <p>
                Every listing points to a real event on campus, so you can grab a meal, walk into a room you&apos;d never
                have found, meet new people, and maybe discover a club or an interest you never knew you had.
              </p>
              <p className="font-bold">Free food brings people together!!!! 🧡💙</p>
            </div>
            <div className="flex justify-center px-4 pb-5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="brut-sm brut-press rounded-xl bg-orange-bright px-5 py-2 font-swash text-base text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
