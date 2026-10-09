const ITEMS = [
  "🍕 pizza nights",
  "🌮 taco tuesdays",
  "🧋 boba socials",
  "🍩 donut mornings",
  "🥟 dumpling fests",
  "🍛 cultural dinners",
  "🍪 study snacks",
  "🍜 ramen runs",
  "🥞 pancake breakfasts",
  "🧁 cupcake drops",
  "🌯 burrito bowls",
  "☕ coffee hours",
];

// Pure CSS marquee. Content is doubled so the loop is seamless.
export default function Ticker() {
  return (
    <div aria-hidden className="mt-5 overflow-hidden rounded-full border-2 border-illini-blue/10 bg-white py-2 shadow-sm">
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap px-4 font-display text-sm font-semibold text-illini-blue">
        {[...ITEMS, ...ITEMS].map((item, index) => (
          <span key={index}>
            {item} <span className="text-illini-orange">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
