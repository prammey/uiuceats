// Hand-drawn retro take on the Illinois kingfisher mascot: navy head and crest,
// white collar, orange belly, long beak open and ready to eat. The raised wing
// ends in an open "hand"; the food emoji floats in front of it.
export default function Mascot({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 260" className={className} aria-hidden focusable="false">
      <ellipse cx="128" cy="246" rx="70" ry="9" fill="#13294b" opacity="0.18" />
      {/* tail */}
      <path d="M186 178 L228 150 L222 196 L190 200 Z" fill="#13294b" stroke="#111" strokeWidth="5" strokeLinejoin="round" />
      {/* feet */}
      <path d="M112 226 L104 246 M112 226 L114 248 M112 226 L124 244" stroke="#ff6a14" strokeWidth="7" strokeLinecap="round" />
      <path d="M152 226 L144 246 M152 226 L154 248 M152 226 L164 244" stroke="#ff6a14" strokeWidth="7" strokeLinecap="round" />
      <path d="M112 226 L104 246 M112 226 L114 248 M112 226 L124 244 M152 226 L144 246 M152 226 L154 248 M152 226 L164 244" stroke="#111" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* body */}
      <ellipse cx="135" cy="165" rx="64" ry="70" fill="#ff6a14" stroke="#111" strokeWidth="5" />
      {/* back wing */}
      <path d="M160 118 C 205 112, 214 160, 190 208 C 172 182, 150 160, 140 128 Z" fill="#13294b" stroke="#111" strokeWidth="5" strokeLinejoin="round" />
      {/* white chest */}
      <ellipse cx="118" cy="140" rx="42" ry="32" fill="#fff6e5" stroke="#111" strokeWidth="5" />
      {/* collar */}
      <ellipse cx="116" cy="126" rx="50" ry="15" fill="#ffffff" stroke="#111" strokeWidth="5" />
      {/* head */}
      <circle cx="108" cy="82" r="52" fill="#13294b" stroke="#111" strokeWidth="5" />
      {/* crest */}
      <path d="M118 36 L146 14 L138 44 L170 30 L150 58 L166 62 L136 70 Z" fill="#13294b" stroke="#111" strokeWidth="5" strokeLinejoin="round" />
      {/* eye */}
      <circle cx="84" cy="76" r="15" fill="#ffffff" stroke="#111" strokeWidth="4" />
      <circle cx="80" cy="78" r="7" fill="#111" />
      <circle cx="77" cy="74" r="2.5" fill="#ffffff" />
      <path d="M66 58 L96 56" stroke="#111" strokeWidth="5" strokeLinecap="round" />
      {/* beak, slightly open */}
      <path d="M62 84 L6 94 L64 100 Z" fill="#2b2b2b" stroke="#111" strokeWidth="5" strokeLinejoin="round" />
      <path d="M62 104 L14 118 L66 114 Z" fill="#2b2b2b" stroke="#111" strokeWidth="5" strokeLinejoin="round" />
      <path d="M62 100 L64 104" stroke="#ff6a14" strokeWidth="4" strokeLinecap="round" />
      {/* raised wing with an open hand at the tip */}
      <path
        d="M104 150 C 84 156, 60 150, 50 134 C 46 126, 54 118, 62 124 C 58 112, 70 106, 76 116 C 78 104, 92 104, 92 116 C 100 120, 108 134, 104 150 Z"
        fill="#13294b"
        stroke="#111"
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
