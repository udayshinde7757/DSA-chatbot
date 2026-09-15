import { useMemo } from "react";

/** AlgoMate brand mark — a stylized node/edge glyph in the ember accent. */
export function BrandMark({ size = 26 }: { size?: number }) {
  const id = useMemo(() => `brand-${Math.random().toString(36).slice(2, 8)}`, []);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="AlgoMate"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      {/* nodes */}
      <circle cx="16" cy="7" r="3.5" fill={`url(#${id})`} />
      <circle cx="7.5" cy="24" r="3.5" fill={`url(#${id})`} opacity="0.85" />
      <circle cx="24.5" cy="24" r="3.5" fill={`url(#${id})`} opacity="0.85" />
      {/* edges */}
      <path
        d="M16 7 L7.5 24 M16 7 L24.5 24 M8.5 23 L23.5 23"
        stroke={`url(#${id})`}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Wordmark ("AlgoMate") with optional subtitle. */
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark size={compact ? 24 : 28} />
      <div className="leading-none">
        <div
          className="font-semibold tracking-tight"
          style={{
            fontSize: compact ? 15 : 17,
            color: "var(--color-charcoal-100)",
            letterSpacing: "-0.01em",
          }}
        >
          Algo<span style={{ color: "var(--color-ember-400)" }}>Mate</span>
        </div>
        {!compact && (
          <div
            className="mt-1"
            style={{
              fontSize: 10.5,
              color: "var(--color-charcoal-500)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            DSA Mentor
          </div>
        )}
      </div>
    </div>
  );
}
