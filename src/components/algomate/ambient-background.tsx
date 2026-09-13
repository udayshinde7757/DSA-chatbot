/**
 * AmbientBackground — very restrained, CSS-only.
 * Faint grid + one radial ember glow + a few slowly drifting code
 * symbols (statically positioned, no continuous motion loops).
 */

import { useMemo } from "react";

const SYMBOLS = [
  "{ }",
  "()",
  "[]",
  "<>",
  "=>",
  "&&",
  "||",
  "++",
  "--",
  "===",
  "fn",
  "def",
  "log n",
  "O(1)",
  "O(n log n)",
  "=>",
  "while",
  "if",
  "self",
  "this",
  "→",
  "≤",
  "λ",
];

interface Drift {
  top: string;
  left: string;
  symbol: string;
}

export function AmbientBackground() {
  const drifts = useMemo<Drift[]>(() => {
    // Deterministic-ish positions; randomness happens once per mount.
    const items: Drift[] = [];
    for (let i = 0; i < 14; i++) {
      items.push({
        top: `${40 + ((i * 7) % 55)}%`,
        left: `${(i * 13) % 90}%`,
        symbol: SYMBOLS[i % SYMBOLS.length],
      });
    }
    return items;
  }, []);

  return (
    <div className="ambient-bg" aria-hidden="true">
      {drifts.map((d, i) => (
        <span
          key={i}
          className="ambient-symbol"
          style={{ top: d.top, left: d.left, animationDelay: `${i * 3}s` }}
        >
          {d.symbol}
        </span>
      ))}
    </div>
  );
}
