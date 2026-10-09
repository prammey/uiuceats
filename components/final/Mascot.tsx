import Image from "next/image";

// Retro cartoon kingfisher drawn after the Illinois mascot logo (public/mascot.svg is the
// source; public/mascot.png is the export used here). The raised wing is an open hand so a
// food emoji can float in front of it.
export default function Mascot({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/mascot.png"
      alt=""
      aria-hidden
      width={1000}
      height={970}
      priority
      className={className}
    />
  );
}
