import { Fragment } from "react";

const PHRASES = ["No swipes", "100% free", "Oh yeahhh, free food!", "Meet new clubs", "Order up", "Now serving", "Urbana-Champaign", "I ♥ Food"];

function Heart() {
  return (
    <svg aria-label="love" viewBox="0 0 24 24" className="inline-block h-3.5 w-3.5 -translate-y-px fill-illini-orange">
      <path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9z" />
    </svg>
  );
}

// Diner sign across the very top.
export default function TopBar() {
  // Two identical copies so the marquee's -50% loop is seamless; each phrase
  // carries equal padding on both sides so the stars sit centered between them.
  const loop = [...PHRASES, ...PHRASES];
  return (
    <>
      <div aria-hidden className="overflow-hidden border-b-[3px] border-brut bg-brut py-2 text-b-cream">
        <div className="flex w-max animate-marquee items-center whitespace-nowrap font-mono-b text-xs font-bold uppercase tracking-[0.3em]">
          {loop.map((phrase, index) => (
            <Fragment key={index}>
              <span className="px-6">{phrase === "I ♥ Food" ? <>I <Heart /> Food</> : phrase}</span>
              <span className="text-illini-orange">★</span>
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
