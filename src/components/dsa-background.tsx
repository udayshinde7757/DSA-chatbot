/**
 * DsaBackground — layered immersive background for AlgoMate
 *
 * Layer 1 (deepest) : Dark starfield + algorithmic grid (CSS)
 * Layer 2 (mid)     : Three.js 3D scene with DSA structures & particles
 * Layer 3 (overlay) : Drifting code snippets (algorithmic text)
 */

import { lazy, Suspense, useMemo } from "react";

const DsaScene3D = lazy(() =>
  import("./3d/dsa-scene-3d").then((m) => ({ default: m.DsaScene3D })),
);

const SNIPPETS = [
  "O(log n)",
  "O(n log n)",
  "O(n²)",
  "dp[i] = min(dp[i-1], dp[i-2] + cost)",
  "while (lo <= hi) { mid = (lo+hi) >> 1 }",
  "dfs(node.left); dfs(node.right)",
  "heap.push(-freq[c])",
  "for j in range(i+1, n):",
  "if (visited[v]) continue;",
  "graph[u].append(v)",
  "return memo[i][j]",
  "left, right = 0, len(arr) - 1",
  "kadane: cur = max(x, cur + x)",
  "union(find(a), find(b))",
  "trie.children[c] = TrieNode()",
  "prefix[i] = prefix[i-1] + a[i]",
  "sliding window: r++, shrink l",
  "topo: indegree[v]--",
  "dijkstra: heappush(pq, (d, v))",
  "swap(a[i], a[j])",
  "// two pointers",
  "reverse(head)",
  "quicksort O(n log n) avg",
  "backtrack(path, choices)",
  "BFS: queue.append((x+1, y))",
  "DP table: N×M",
];

type Snip = {
  text: string;
  left: string;
  duration: string;
  delay: string;
  size: string;
  opacity: string;
};

function seed(i: number, salt: number) {
  const x = Math.sin(i * 91.37 + salt * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function DsaBackground() {
  const snippets = useMemo<Snip[]>(() => {
    return Array.from({ length: 28 }).map((_, i) => {
      const text = SNIPPETS[i % SNIPPETS.length];
      const left = `${Math.round(seed(i, 1) * 100)}%`;
      const duration = `${22 + Math.round(seed(i, 2) * 28)}s`;
      const delay = `${-Math.round(seed(i, 3) * 40)}s`;
      const size = `${0.62 + seed(i, 4) * 0.42}rem`;
      const opacity = `${0.08 + seed(i, 5) * 0.22}`;
      return { text, left, duration, delay, size, opacity };
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-dsa-ambient"
    >
      {/* Layer 1 — deep grid */}
      <div className="absolute inset-0 bg-dsa-grid" />

      {/* Ambient radial glow orbs (CSS, no JS) */}
      <div
        className="absolute"
        style={{
          top: "-20%",
          left: "30%",
          width: "60%",
          height: "60%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, oklch(0.62 0.25 290 / 8%) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: "-10%",
          right: "-10%",
          width: "50%",
          height: "50%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, oklch(0.72 0.20 40 / 10%) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: "40%",
          left: "-5%",
          width: "40%",
          height: "40%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, oklch(0.78 0.18 200 / 7%) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Layer 2 — Three.js 3D scene */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <DsaScene3D />
        </Suspense>
      </div>

      {/* Layer 3 — Drifting code snippets */}
      <div className="absolute inset-0">
        {snippets.map((s, i) => (
          <span
            key={i}
            className="dsa-snippet"
            style={{
              left: s.left,
              top: `${100 + (i % 4) * 8}%`,
              animationDuration: s.duration,
              animationDelay: s.delay,
              fontSize: s.size,
              opacity: s.opacity,
            }}
          >
            {s.text}
          </span>
        ))}
      </div>
    </div>
  );
}
