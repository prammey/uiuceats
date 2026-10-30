import Link from "next/link";

// Shown for any URL that is not the home page (static export writes it to 404.html).
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-cream px-6 text-center font-body-f text-brut">
      <p aria-hidden className="text-6xl">🍽️</p>
      <h1 className="font-swash text-4xl text-illini-blue">Nothing on this plate</h1>
      <p className="max-w-sm text-sm text-ink-muted">That page doesn&apos;t exist. This week&apos;s free food is on the home page.</p>
      <Link href="/" className="brut-sm brut-press rounded-xl bg-illini-blue px-5 py-2 font-swash text-lg text-white">
        Find free food →
      </Link>
    </main>
  );
}
