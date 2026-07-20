import { useMemo } from "react";

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
];

type Snip = {
  text: string;
  left: string;
  duration: string;
  delay: string;
  size: string;
};

function seed(i: number, salt: number) {
  const x = Math.sin(i * 91.37 + salt * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function DsaBackground() {
  const snippets = useMemo<Snip[]>(() => {
    return Array.from({ length: 22 }).map((_, i) => {
      const text = SNIPPETS[i % SNIPPETS.length];
      const left = `${Math.round(seed(i, 1) * 100)}%`;
      const duration = `${18 + Math.round(seed(i, 2) * 22)}s`;
      const delay = `${-Math.round(seed(i, 3) * 30)}s`;
      const size = `${0.72 + seed(i, 4) * 0.5}rem`;
      return { text, left, duration, delay, size };
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-dsa-ambient"
    >
      <div className="absolute inset-0 bg-dsa-grid" />
      <div className="absolute inset-0">
        {snippets.map((s, i) => (
          <span
            key={i}
            className="dsa-snippet"
            style={{
              left: s.left,
              top: `${100 + (i % 3) * 8}%`,
              animationDuration: s.duration,
              animationDelay: s.delay,
              fontSize: s.size,
            }}
          >
            {s.text}
          </span>
        ))}
      </div>
    </div>
  );
}
