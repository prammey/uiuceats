import Image from "next/image";

// The kingfisher mascot (public/mascot.webp, 840×840, about 85 KB; it shows at 415 px at most). Its raised wing is an open hand;
// the hero floats a food emoji in front of it. The hero's CSS sets the rendered size.
export default function Mascot({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/mascot.webp"
      alt=""
      aria-hidden
      width={840}
      height={840}
      priority
      className={className}
    />
  );
}
