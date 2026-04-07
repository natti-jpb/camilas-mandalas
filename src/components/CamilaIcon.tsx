export default function CamilaIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill="#f5ede3" stroke="#c4a882" strokeWidth="2" />

      {/* Mandala decoration around the portrait */}
      <circle cx="50" cy="50" r="44" fill="none" stroke="#e8ddd0" strokeWidth="1" />
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 50 + 42 * Math.cos(angle);
        const y1 = 50 + 42 * Math.sin(angle);
        const x2 = 50 + 46 * Math.cos(angle);
        const y2 = 50 + 46 * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#c4a882"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}

      {/* Hair - short blond-brown */}
      <ellipse cx="50" cy="38" rx="22" ry="24" fill="#b8935a" />
      <ellipse cx="50" cy="34" rx="20" ry="18" fill="#c9a46c" />
      {/* Hair sides */}
      <ellipse cx="30" cy="42" rx="7" ry="12" fill="#b8935a" />
      <ellipse cx="70" cy="42" rx="7" ry="12" fill="#b8935a" />
      {/* Hair highlights */}
      <ellipse cx="44" cy="30" rx="8" ry="6" fill="#d4b87a" opacity="0.6" />

      {/* Neck */}
      <rect x="44" y="58" width="12" height="10" rx="4" fill="#fce4d0" />

      {/* Face */}
      <ellipse cx="50" cy="46" rx="17" ry="19" fill="#fce4d0" />

      {/* Cheeks - rosy */}
      <circle cx="38" cy="50" r="4" fill="#f0b8a8" opacity="0.4" />
      <circle cx="62" cy="50" r="4" fill="#f0b8a8" opacity="0.4" />

      {/* Eyes */}
      <ellipse cx="43" cy="44" rx="3.5" ry="2.5" fill="white" />
      <ellipse cx="57" cy="44" rx="3.5" ry="2.5" fill="white" />
      <circle cx="43.5" cy="44" r="2" fill="#5b8a6e" />
      <circle cx="57.5" cy="44" r="2" fill="#5b8a6e" />
      <circle cx="44" cy="43.5" r="0.7" fill="white" />
      <circle cx="58" cy="43.5" r="0.7" fill="white" />

      {/* Eyelashes */}
      <path d="M39 42.5 Q43 40 47 42.5" stroke="#6b5a4a" strokeWidth="0.8" fill="none" />
      <path d="M53 42.5 Q57 40 61 42.5" stroke="#6b5a4a" strokeWidth="0.8" fill="none" />

      {/* Eyebrows */}
      <path d="M39.5 40 Q43 38 46.5 39.5" stroke="#9a8060" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M53.5 39.5 Q57 38 60.5 40" stroke="#9a8060" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <path d="M50 46 L49 51 Q50 52.5 51 51 Z" fill="#ebd3be" />

      {/* Smile */}
      <path d="M44 54 Q50 59 56 54" stroke="#c4846a" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Lips detail */}
      <ellipse cx="50" cy="55" rx="4" ry="1.8" fill="#e0a090" opacity="0.5" />

      {/* Small earrings - mandala-inspired dots */}
      <circle cx="33" cy="48" r="1.5" fill="#c4a882" />
      <circle cx="67" cy="48" r="1.5" fill="#c4a882" />

      {/* Shoulders hint */}
      <path d="M35 68 Q50 62 65 68" stroke="#c4a882" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
