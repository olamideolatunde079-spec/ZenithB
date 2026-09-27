// components/ZenithLogo.jsx — Zenith Bank Logo
// ============================================================
// Recreates the official Zenith Bank "Z" mark as an SVG.
//
// The logo is a bold Z split diagonally:
//   - Top portion (top bar + upper diagonal): GREY  (#808285)
//   - Bottom portion (lower diagonal + base bar): RED (#c8102e)
//   - A white diagonal slash divides them cleanly
//
// Usage:
//   <ZenithLogo size={40} />        // square — any number
//   <ZenithLogo size={60} />
// ============================================================

export default function ZenithLogo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Zenith Bank logo"
    >
      {/*
        The Z is built from two filled polygon shapes sharing
        the same diagonal cut line through the middle.
        Coordinates are tuned to match the reference photo.
      */}

      {/* GREY portion — top bar + upper diagonal arm of the Z */}
      <polygon
        points="
          10,10
          90,10
          90,24
          38,24
          72,72
          52,72
          18,24
          10,24
        "
        fill="#808285"
      />

      {/* RED portion — lower diagonal arm + bottom bar of the Z */}
      <polygon
        points="
          28,76
          48,76
          82,28
          90,28
          90,90
          10,90
          10,76
          62,76
        "
        fill="#c8102e"
      />

      {/*
        White diagonal slash — a thin white parallelogram drawn
        over the join to give the clean "cut" look from the logo.
      */}
      <polygon
        points="
          44,22
          54,22
          56,30
          46,30
        "
        fill="white"
      />
    </svg>
  );
}
