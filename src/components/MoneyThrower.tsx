// Money-thrower machine — a comic cannon in the hero's bottom-left corner
// that blows green ₹ notes across the section. The whole layer is z-0 and
// pointer-events-none so bills always float BEHIND the hero's text/banners.
// Keyframes live in globals.css (bill-fly, machine-chug); both are disabled
// under prefers-reduced-motion.

type BillFlight = {
  bx: string; // horizontal travel (vw so it scales with the section)
  peak: string; // parabola peak (negative px, upward)
  by: string; // end vertical offset
  rot: string; // total rotation
  dur: number; // seconds
  delay: number;
  scale: number;
};

const FLIGHTS: BillFlight[] = [
  { bx: "42vw", peak: "-300px", by: "-60px", rot: "380deg", dur: 6.2, delay: 0, scale: 1 },
  { bx: "68vw", peak: "-430px", by: "-160px", rot: "540deg", dur: 8.4, delay: 1.1, scale: 0.85 },
  { bx: "26vw", peak: "-220px", by: "-20px", rot: "300deg", dur: 5.2, delay: 2.0, scale: 0.75 },
  { bx: "55vw", peak: "-370px", by: "-110px", rot: "-420deg", dur: 7.3, delay: 2.9, scale: 0.95 },
  { bx: "78vw", peak: "-480px", by: "-220px", rot: "620deg", dur: 9.2, delay: 3.6, scale: 0.8 },
  { bx: "34vw", peak: "-260px", by: "-40px", rot: "-340deg", dur: 5.8, delay: 4.4, scale: 0.7 },
  { bx: "62vw", peak: "-400px", by: "-140px", rot: "460deg", dur: 7.9, delay: 5.2, scale: 0.9 },
  { bx: "48vw", peak: "-330px", by: "-90px", rot: "-500deg", dur: 6.8, delay: 6.1, scale: 0.82 },
  { bx: "72vw", peak: "-450px", by: "-190px", rot: "580deg", dur: 8.8, delay: 6.9, scale: 0.78 },
];

// Small green ₹ note
const Bill = () => (
  <svg viewBox="0 0 64 34" className="w-14 h-auto" aria-hidden="true">
    <rect x="2" y="2" width="60" height="30" fill="#A8D5A2" stroke="var(--ink)" strokeWidth="3" />
    <rect x="7" y="7" width="50" height="20" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
    <circle cx="20" cy="17" r="8" fill="var(--paper-panel)" stroke="var(--ink)" strokeWidth="1.5" />
    <text
      x="20"
      y="22"
      textAnchor="middle"
      fontFamily="var(--font-display), sans-serif"
      fontSize="13"
      fill="var(--ink)"
    >
      ₹
    </text>
    <text
      x="44"
      y="22"
      textAnchor="middle"
      fontFamily="var(--font-mono), monospace"
      fontWeight="700"
      fontSize="11"
      fill="var(--ink)"
    >
      500
    </text>
  </svg>
);

const MoneyThrower = () => {
  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Bills — emitted from the machine's barrel mouth */}
      {FLIGHTS.map((f, i) => (
        <div
          key={i}
          className="money-bill absolute left-24 bottom-40 sm:left-32 sm:bottom-44"
          style={
            {
              "--bx": f.bx,
              "--peak": f.peak,
              "--by": f.by,
              "--rot": f.rot,
              "--bscale": f.scale,
              animationDuration: `${f.dur}s`,
              animationDelay: `${f.delay}s`,
            } as React.CSSProperties
          }
        >
          <Bill />
        </div>
      ))}

      {/* The machine */}
      <div className="money-machine absolute left-2 bottom-2 w-36 sm:w-48">
        <svg viewBox="0 0 230 200" className="w-full h-auto">
          {/* hard shadow */}
          <rect x="28" y="98" width="152" height="86" fill="var(--ink)" />
          {/* barrel (tilted up-right) + mouth */}
          <path
            d="M 128 96 L 178 38 L 208 62 L 158 118 Z"
            fill="var(--yellow-deep)"
            stroke="var(--ink)"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <ellipse
            cx="193"
            cy="50"
            rx="19"
            ry="13"
            transform="rotate(-42 193 50)"
            fill="var(--ink)"
          />
          <ellipse
            cx="193"
            cy="50"
            rx="13"
            ry="8"
            transform="rotate(-42 193 50)"
            fill="var(--paper)"
          />
          {/* burst lines at the mouth */}
          <g stroke="var(--ink)" strokeWidth="4" strokeLinecap="round">
            <line x1="208" y1="30" x2="220" y2="18" />
            <line x1="218" y1="46" x2="230" y2="42" />
            <line x1="196" y1="24" x2="200" y2="10" />
          </g>
          {/* body */}
          <rect x="20" y="90" width="152" height="86" fill="var(--gray-panel)" stroke="var(--ink)" strokeWidth="5" />
          <rect x="30" y="100" width="132" height="66" fill="none" stroke="var(--ink)" strokeWidth="2" opacity="0.5" />
          {/* ₹ emblem */}
          <circle cx="70" cy="133" r="22" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="4" />
          <text
            x="70"
            y="144"
            textAnchor="middle"
            fontFamily="var(--font-display), sans-serif"
            fontSize="30"
            fill="var(--ink)"
          >
            ₹
          </text>
          {/* gauge */}
          <circle cx="128" cy="120" r="13" fill="var(--paper-panel)" stroke="var(--ink)" strokeWidth="3" />
          <line x1="128" y1="120" x2="136" y2="112" stroke="var(--overdue)" strokeWidth="3" strokeLinecap="round" />
          {/* vents */}
          <g stroke="var(--ink)" strokeWidth="3" strokeLinecap="round">
            <line x1="112" y1="146" x2="150" y2="146" />
            <line x1="112" y1="154" x2="150" y2="154" />
            <line x1="112" y1="162" x2="150" y2="162" />
          </g>
          {/* feet */}
          <rect x="32" y="176" width="26" height="12" fill="var(--ink)" />
          <rect x="134" y="176" width="26" height="12" fill="var(--ink)" />
          {/* BRRR! sticker */}
          <g transform="translate(18,66) rotate(-8)">
            <rect x="0" y="0" width="86" height="30" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="4" />
            <text
              x="43"
              y="22"
              textAnchor="middle"
              fontFamily="var(--font-display), sans-serif"
              fontSize="21"
              fill="var(--ink)"
            >
              BRRR!
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default MoneyThrower;
