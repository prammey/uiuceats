import Image from "next/image";

// The kingfisher mascot (public/mascot.png, 1254×1254). Its raised wing is an open hand;
// the hero floats a food emoji in front of it. The hero's CSS sets the rendered size.
export default function Mascot({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/mascot.png"
      alt=""
      aria-hidden
      width={1254}
      height={1254}
      priority
      className={className}
    />
  );
}
