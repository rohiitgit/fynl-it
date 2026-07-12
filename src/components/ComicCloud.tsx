// Comic dialogue cloud — scalloped bubble that stretches around its text.
// Paper fill, ink border (non-scaling stroke), hard offset ink shadow,
// optional speech tail. Used for display headings on marketing surfaces.
import { CSSProperties, ReactNode } from "react";

// Lobed cloud outline drawn around an ellipse in a 480x180 box;
// preserveAspectRatio="none" stretches it to the wrapper, non-scaling
// strokes keep the ink weight even.
const CLOUD_PATH =
  "M 15 90 C 8 62, 24 40, 45 51 C 30 18, 82 0, 127 22 C 132 -8, 202 -16, 240 12 " +
  "C 278 -16, 348 -8, 352 22 C 398 0, 450 18, 435 51 C 456 40, 472 62, 465 90 " +
  "C 480 118, 458 142, 435 129 C 452 164, 400 182, 352 157 C 346 188, 276 194, 240 168 " +
  "C 204 194, 134 188, 127 157 C 80 182, 28 164, 45 129 C 22 142, 0 118, 15 90 Z";

const ComicCloud = ({
  children,
  tail,
  className = "",
  style,
}: {
  children: ReactNode;
  tail?: "left" | "right";
  className?: string;
  style?: CSSProperties;
}) => {
  return (
    <div className={`relative inline-block ${className}`} style={style}>
      {/* Cloud body (shadow + fill) */}
      <svg
        className="absolute inset-0 w-full h-full overflow-visible"
        viewBox="0 0 480 180"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d={CLOUD_PATH}
          fill="var(--ink)"
          transform="translate(8,8)"
        />
        <path
          d={CLOUD_PATH}
          fill="var(--paper-panel)"
          stroke="var(--ink)"
          strokeWidth="3.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Speech tail */}
      {tail && (
        <svg
          className={`absolute -bottom-7 w-16 h-10 ${
            tail === "right" ? "right-10" : "left-10 -scale-x-100"
          }`}
          viewBox="0 0 64 40"
          aria-hidden="true"
        >
          <path
            d="M 6 0 Q 28 12 58 38 Q 30 28 34 0 Z"
            fill="var(--paper-panel)"
            stroke="var(--ink)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {/* Text sits centered on top, padded in from the lobes; dialogue text
          in comics is always centered in its bubble */}
      <div className="relative text-center px-10 py-8 sm:px-14 sm:py-10">
        {children}
      </div>
    </div>
  );
};

export default ComicCloud;
