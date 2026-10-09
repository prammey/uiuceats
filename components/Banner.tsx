export default function Banner() {
  return (
    <div
      role="note"
      className="rounded-2xl border border-illini-orange/40 bg-illini-orange-soft px-4 py-3 text-sm leading-snug text-ink"
    >
      <span className="font-bold text-illini-blue">New &amp; experimental.</span> Listings come straight
      from official campus calendars and only show up when the source text says food is provided.
      Plans change, so tap <span className="font-semibold">Proof</span> and confirm with the host before
      you head over.
    </div>
  );
}
