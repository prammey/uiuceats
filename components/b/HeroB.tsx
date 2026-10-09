type Props = { count: number };

const SIGN = [
  "NOW SERVING",
  "FREE FOOD",
  "WALK-IN ONLY",
  "NO SWIPES",
  "NO TICKETS",
  "URBANA-CHAMPAIGN",
  "EST. 1867",
  "ORDER UP",
];

// Full-width diner sign + headline. States the purpose in one breath.
export default function HeroB({ count }: Props) {
  return (
    <>
      <div aria-hidden className="overflow-hidden border-b-[3px] border-brut bg-brut py-2 text-b-cream">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap px-4 font-mono-b text-xs font-bold uppercase tracking-[0.3em]">
          {[...SIGN, ...SIGN, ...SIGN].map((word, index) => (
            <span key={index}>
              {word} <span className="text-illini-orange">★</span>
            </span>
          ))}
        </div>
      </div>

      <section className="border-b-[3px] border-brut bg-b-yellow">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:py-14 md:grid-cols-[1.35fr_1fr]">
          <div>
            <p className="font-mono-b text-[11px] font-bold uppercase tracking-[0.3em] text-brut sm:text-xs">
              ★ University of Illinois · Free food finder ★
            </p>
            <h1 className="mt-3 font-slab text-5xl uppercase leading-[0.92] text-illini-blue sm:text-6xl lg:text-7xl">
              Free food.
              <br />
              <span className="text-illini-orange">On campus.</span>
              <br />
              This week.
            </h1>
            <p className="mt-6 max-w-xl text-lg font-semibold leading-snug text-brut sm:text-xl">
              Every listing is pulled from official UIUC calendars and quotes the exact line that says the food is
              free. No sign-ups, no tickets, no meal swipes. Just show up.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <a
                href="#menu"
                className="brut brut-press inline-block bg-illini-orange px-6 py-3 font-slab text-xl uppercase text-white"
              >
                Order up ↓
              </a>
              <a href="#how" className="brut brut-press inline-block bg-white px-6 py-3 font-slab text-xl uppercase text-brut">
                How it works
              </a>
            </div>
          </div>

          <div className="relative mx-auto flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80">
            <div aria-hidden className="starburst absolute inset-0 bg-brut" />
            <div aria-hidden className="starburst absolute inset-[5px] bg-illini-orange" />
            <div className="relative text-center text-white">
              <div className="font-slab text-6xl leading-none sm:text-7xl">{count}</div>
              <div className="font-mono-b text-xs font-bold uppercase tracking-[0.25em] sm:text-sm">
                free {count === 1 ? "meal" : "meals"}
                <br />
                this week
              </div>
            </div>
            <div
              aria-hidden
              className="brut-sm absolute -bottom-2 -left-4 -rotate-6 bg-white px-3 py-1 font-mono-b text-xs font-bold uppercase tracking-widest text-brut sm:-left-8"
            >
              $0.00 · 0 swipes
            </div>
            <div
              aria-hidden
              className="brut-sm absolute -right-4 -top-2 rotate-6 bg-illini-blue px-3 py-1 font-mono-b text-xs font-bold uppercase tracking-widest text-white sm:-right-8"
            >
              100% sourced
            </div>
          </div>
        </div>
      </section>

      <div aria-hidden className="retro-stripes h-5 border-b-[3px] border-brut" />
    </>
  );
}
