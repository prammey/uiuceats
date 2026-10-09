export default function Banner() {
  return (
    <p
      role="note"
      className="mt-5 -rotate-1 rounded-xl border-2 border-sun bg-sun/35 px-4 py-3 text-sm leading-snug text-ink shadow-sm"
    >
      <span aria-hidden>📌 </span>
      <span className="font-extrabold text-illini-blue">New &amp; experimental.</span> Listings come straight from
      official campus calendars and only show up when the source text says food is provided. Plans change, so tap{" "}
      <span className="font-bold">Proof</span> and double-check with the host before you head over.
    </p>
  );
}
