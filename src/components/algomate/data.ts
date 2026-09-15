/**
 * Static data for the AlgoMate product views.
 * Topics, quick actions, example prompts, practice templates.
 */

export interface Topic {
  id: string;
  title: string;
  description: string;
  category: "core" | "patterns" | "advanced";
  difficulty: "easy" | "medium" | "hard";
  prompt: string; // Sent to AI when user clicks "Learn this"
  tags: string[];
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  prompt: string;
  icon: string; // lucide icon name
}

export interface ExamplePrompt {
  id: string;
  text: string;
  category: string;
}

export interface PracticeTemplate {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  topics: string[];
  prompt: string;
}

// ── 18 Topics across 3 categories ──

export const topics: Topic[] = [
  // Core Data Structures
  {
    id: "arrays",
    title: "Arrays & Hashing",
    description: "Hash maps, frequency counters, prefix sums, and array manipulation tricks.",
    category: "core",
    difficulty: "easy",
    prompt:
      "Teach me arrays and hashing techniques for DSA. Cover hash maps, frequency counters, prefix sums, and 2-3 classic problems with code in Python and C++.",
    tags: ["hash-map", "prefix-sum", "frequency"],
  },
  {
    id: "linked-lists",
    title: "Linked Lists",
    description: "Singly/doubly linked lists, fast/slow pointers, reversal, and merge patterns.",
    category: "core",
    difficulty: "easy",
    prompt:
      "Teach me linked list fundamentals: traversal, reversal, cycle detection with fast/slow pointers, and merging two sorted lists. Include Python and C++ code with complexity analysis.",
    tags: ["two-pointers", "in-place", "recursion"],
  },
  {
    id: "stacks",
    title: "Stacks & Queues",
    description: "Monotonic stacks, infix evaluation, sliding window maximum.",
    category: "core",
    difficulty: "easy",
    prompt:
      "Teach me stack and queue patterns: monotonic stack, next greater element, infix to postfix, and sliding window maximum. Include Python and C++ solutions.",
    tags: ["monotonic", "evaluation", "deque"],
  },
  {
    id: "hash-maps",
    title: "Hash Maps & Sets",
    description: "Design hash maps, anagram grouping, two-sum variants, bloom filters.",
    category: "core",
    difficulty: "easy",
    prompt:
      "Teach me hash map and set techniques: designing a hash map, grouping anagrams, two-sum variants, and counting distinct elements. Python and C++ code required.",
    tags: ["design", "anagram", "two-sum"],
  },
  {
    id: "heaps",
    title: "Heaps & Priority Queues",
    description: "Min/max heaps, top-K problems, median of stream, merge K sorted.",
    category: "core",
    difficulty: "medium",
    prompt:
      "Teach me heap and priority queue patterns: building heaps, top-K elements, finding median in a stream, and merging K sorted lists. Python and C++ with complexity analysis.",
    tags: ["top-k", "median", "merge"],
  },

  // Algorithmic Patterns
  {
    id: "two-pointers",
    title: "Two Pointers",
    description:
      "Opposite-end and same-direction pointers, container with most water, trapping rain.",
    category: "patterns",
    difficulty: "easy",
    prompt:
      "Teach me the two pointers technique: opposite-end and same-direction variants. Cover container with most water, trapping rain water, and 3-sum. Python and C++ code.",
    tags: ["converge", "sliding", "sorted"],
  },
  {
    id: "sliding-window",
    title: "Sliding Window",
    description: "Fixed and variable windows, longest substring, minimum window subsequence.",
    category: "patterns",
    difficulty: "medium",
    prompt:
      "Teach me the sliding window pattern: fixed-size and variable-size windows. Cover longest substring without repeating characters, minimum window subsequence, and permutations in string. Python and C++ with complexity analysis.",
    tags: ["window", "substring", "subsequence"],
  },
  {
    id: "binary-search",
    title: "Binary Search",
    description: "Classic search, search in rotated arrays, answer-space binary search.",
    category: "patterns",
    difficulty: "medium",
    prompt:
      "Teach me binary search patterns: classic search, searching in rotated sorted arrays, finding peak elements, and answer-space binary search. Python and C++ code.",
    tags: ["sorted", "rotated", "answer-space"],
  },
  {
    id: "trees",
    title: "Trees & BSTs",
    description: "Traversal orders, LCA, balanced trees, tries, serialization.",
    category: "patterns",
    difficulty: "medium",
    prompt:
      "Teach me binary tree and BST patterns: inorder/preorder/postorder traversal, lowest common ancestor, validating BST, building a trie, and tree serialization. Python and C++ with complexity analysis.",
    tags: ["traversal", "lca", "trie"],
  },
  {
    id: "graphs",
    title: "Graphs",
    description: "BFS/DFS, topological sort, shortest path, union-find, MST.",
    category: "patterns",
    difficulty: "hard",
    prompt:
      "Teach me graph algorithms: BFS, DFS, topological sort, Dijkstra's shortest path, union-find, and minimum spanning tree (Prim's/Kruskal's). Python and C++ with complexity analysis.",
    tags: ["bfs", "dfs", "dijkstra", "union-find"],
  },
  {
    id: "greedy",
    title: "Greedy Algorithms",
    description: "Interval scheduling, jump game, Huffman coding, proof by exchange.",
    category: "patterns",
    difficulty: "medium",
    prompt:
      "Teach me greedy algorithms: interval scheduling/jump game, activity selection, Huffman coding intuition, and when to prove greedy correctness. Python and C++ code.",
    tags: ["interval", "proof", "optimal-substructure"],
  },

  // Advanced Topics
  {
    id: "dynamic-programming",
    title: "Dynamic Programming",
    description: "1D/2D DP, knapsack, LCS, LIS, interval DP, digit DP.",
    category: "advanced",
    difficulty: "hard",
    prompt:
      "Teach me dynamic programming systematically: 1D DP (climbing stairs, house robber), 2D DP (LCS, edit distance), knapsack variants, LIS, and interval DP. Build up from recursion to tabulation. Python and C++ with complexity analysis.",
    tags: ["tabulation", "memoization", "knapsack"],
  },
  {
    id: "backtracking",
    title: "Backtracking",
    description: "Subsets, permutations, N-Queens, constraint satisfaction, pruning.",
    category: "advanced",
    difficulty: "hard",
    prompt:
      "Teach me backtracking: generating subsets and permutations, N-Queens problem, Sudoku solver, and constraint satisfaction with pruning. Python and C++ code with complexity analysis.",
    tags: ["permutations", "n-queens", "pruning"],
  },
  {
    id: "bit-manipulation",
    title: "Bit Manipulation",
    description: "XOR tricks, masking, bit DP, single-number, power-of-two checks.",
    category: "advanced",
    difficulty: "medium",
    prompt:
      "Teach me bit manipulation: XOR tricks (single number, missing number), masking, power-of-two checks, counting bits, and bit DP. Python and C++ code.",
    tags: ["xor", "mask", "bit-dp"],
  },
  {
    id: "tries",
    title: "Tries & String Matching",
    description: "Prefix trees, Aho-Corasick, Rabin-Karp, KMP, suffix arrays.",
    category: "advanced",
    difficulty: "hard",
    prompt:
      "Teach me string matching algorithms: implementing a trie, Aho-Corasick for multi-pattern matching, Rabin-Karp rolling hash, KMP, and suffix array basics. Python and C++ code.",
    tags: ["prefix-tree", "kmp", "rabin-karp"],
  },
  {
    id: "intervals",
    title: "Intervals & Sorting",
    description: "Merge intervals, insert interval, meeting rooms, custom comparators.",
    category: "patterns",
    difficulty: "medium",
    prompt:
      "Teach me interval problems: merge intervals, insert interval, meeting rooms I/II, non-overlapping intervals, and custom sorting/comparators. Python and C++ code.",
    tags: ["merge", "overlap", "comparator"],
  },
  {
    id: "union-find",
    title: "Union-Find & DSU",
    description: "Disjoint sets, path compression, union by rank, connected components.",
    category: "advanced",
    difficulty: "hard",
    prompt:
      "Teach me Union-Find / Disjoint Set Union: implementation with path compression and union by rank, counting connected components, and redundant connection detection. Python and C++ code.",
    tags: ["disjoint-set", "path-compression", "components"],
  },
  {
    id: "advanced-graphs",
    title: "Advanced Graphs",
    description: "Strongly connected components, network flow, A*, bipartite matching.",
    category: "advanced",
    difficulty: "hard",
    prompt:
      "Teach me advanced graph algorithms: Tarjan's SCC, network flow (Ford-Fulkerson), A* pathfinding, and bipartite matching. Python and C++ with complexity analysis.",
    tags: ["tarjan", "flow", "a-star"],
  },
];

// ── 7 Quick Actions ──

export const quickActions: QuickAction[] = [
  {
    id: "reverse-linked-list",
    label: "Reverse a Linked List",
    description: "In-place reversal with pointers",
    prompt:
      "Explain how to reverse a singly linked list in-place. Show the pointer manipulation step by step, then give Python and C++ code with O(n) time and O(1) space.",
    icon: "ArrowLeftRight",
  },
  {
    id: "longest-substring",
    label: "Longest Substring",
    description: "Sliding window technique",
    prompt:
      "Solve 'Longest Substring Without Repeating Characters' using the sliding window technique. Explain the approach, then provide Python and C++ code with time complexity analysis.",
    icon: "AlignLeft",
  },
  {
    id: "binary-search",
    label: "Binary Search Template",
    description: "Generalized search template",
    prompt:
      "Give me a general-purpose binary search template that works for both exact match and boundary finding. Explain the invariant, then show Python and C++ implementations.",
    icon: "Search",
  },
  {
    id: "bfs-shortest",
    label: "BFS Shortest Path",
    description: "Grid BFS for shortest path",
    prompt:
      "Explain BFS for shortest path in an unweighted grid. Walk through the algorithm step by step, then provide Python and C++ code with visited tracking.",
    icon: "Route",
  },
  {
    id: "dp-1d",
    label: "1D DP Pattern",
    description: "Tabulation vs memoization",
    prompt:
      "Teach me the 1D dynamic programming pattern. Compare top-down memoization vs bottom-up tabulation using climbing stairs and house robber as examples. Python and C++ code.",
    icon: "Layers",
  },
  {
    id: "tree-traversal",
    label: "Tree Traversal",
    description: "Inorder, preorder, postorder",
    prompt:
      "Explain the three depth-first tree traversals (inorder, preorder, postorder) with visual diagrams. Then show iterative and recursive implementations in Python and C++.",
    icon: "GitBranch",
  },
  {
    id: "interval-merge",
    label: "Merge Intervals",
    description: "Interval scheduling pattern",
    prompt:
      "Explain the merge intervals pattern: how to sort intervals by start time and merge overlapping ones. Walk through an example, then provide Python and C++ code.",
    icon: "Merge",
  },
];

// ── Example prompts for empty state ──

export const examplePrompts: ExamplePrompt[] = [
  {
    id: "ep-1",
    text: "Explain the two pointers technique with 3 examples",
    category: "Concepts",
  },
  {
    id: "ep-2",
    text: "Solve LeetCode #15 3Sum with optimal approach",
    category: "Problems",
  },
  {
    id: "ep-3",
    text: "What's the difference between BFS and DFS?",
    category: "Concepts",
  },
  {
    id: "ep-4",
    text: "Give me a dynamic programming template for knapsack",
    category: "Templates",
  },
  {
    id: "ep-5",
    text: "How do I detect a cycle in a linked list?",
    category: "Problems",
  },
  {
    id: "ep-6",
    text: "Explain Big O notation with common examples",
    category: "Fundamentals",
  },
];

// ── Practice templates ──

export const practiceTemplates: PracticeTemplate[] = [
  {
    id: "pt-1",
    title: "Two Sum",
    description:
      "Given an array of integers and a target, find two numbers that add up to the target. Return their indices.",
    difficulty: "easy",
    topics: ["arrays", "hash-maps"],
    prompt:
      "Walk me through solving Two Sum. Start with brute force, then optimize with a hash map. Give Python and C++ code with time and space complexity.",
  },
  {
    id: "pt-2",
    title: "Valid Parentheses",
    description:
      "Given a string of brackets, determine if the input is valid (properly opened and closed).",
    difficulty: "easy",
    topics: ["stacks"],
    prompt:
      "Solve the Valid Parentheses problem using a stack. Explain the approach, then give Python and C++ code with O(n) time complexity analysis.",
  },
  {
    id: "pt-3",
    title: "Merge Two Sorted Lists",
    description: "Merge two sorted linked lists into one sorted list. Do this in-place.",
    difficulty: "easy",
    topics: ["linked-lists", "two-pointers"],
    prompt:
      "Solve Merge Two Sorted Lists. Explain the iterative and recursive approaches. Provide Python and C++ code with O(n + m) complexity analysis.",
  },
  {
    id: "pt-4",
    title: "Maximum Subarray",
    description: "Find the contiguous subarray with the largest sum. Return the sum.",
    difficulty: "medium",
    topics: ["dynamic-programming", "greedy"],
    prompt:
      "Solve Maximum Subarray using Kadane's algorithm. Explain the DP insight, then give Python and C++ code. Also discuss how to recover the actual subarray.",
  },
  {
    id: "pt-5",
    title: "Binary Tree Level Order Traversal",
    description: "Return the level order traversal of a binary tree's nodes (breadth-first).",
    difficulty: "medium",
    topics: ["trees", "graphs"],
    prompt:
      "Solve Binary Tree Level Order Traversal using BFS. Walk through the algorithm, then provide Python and C++ code with O(n) time and O(n) space analysis.",
  },
  {
    id: "pt-6",
    title: "Word Search in Grid",
    description:
      "Given a 2D grid of characters and a word, determine if the word exists in the grid by following adjacent cells.",
    difficulty: "medium",
    topics: ["backtracking", "graphs"],
    prompt:
      "Solve Word Search using backtracking on a 2D grid. Explain the DFS approach with visited tracking. Provide Python and C++ code with time complexity analysis.",
  },
  {
    id: "pt-7",
    title: "Coin Change",
    description:
      "Given coin denominations and a target amount, find the minimum number of coins needed.",
    difficulty: "medium",
    topics: ["dynamic-programming"],
    prompt:
      "Solve Coin Change using dynamic programming. Explain bottom-up tabulation, then show Python and C++ code. Discuss the O(n * amount) complexity.",
  },
  {
    id: "pt-8",
    title: "N-Queens",
    description: "Place N queens on an N×N chessboard so no two queens threaten each other.",
    difficulty: "hard",
    topics: ["backtracking"],
    prompt:
      "Solve the N-Queens problem using backtracking. Explain the pruning strategy (diagonal sets, column tracking). Provide Python and C++ code with complexity analysis.",
  },
  {
    id: "pt-9",
    title: "Serialize and Deserialize Binary Tree",
    description:
      "Design an algorithm to serialize a binary tree to a string and deserialize it back.",
    difficulty: "hard",
    topics: ["trees", "graphs"],
    prompt:
      "Solve binary tree serialization/deserialization using preorder traversal with null markers. Explain the approach, then give Python and C++ code with complexity analysis.",
  },
  {
    id: "pt-10",
    title: "Alien Dictionary",
    description:
      "Given a sorted list of words in an alien language, derive the character ordering.",
    difficulty: "hard",
    topics: ["graphs", "greedy"],
    prompt:
      "Solve Alien Dictionary using topological sort. Explain how to build the graph from character comparisons, then provide Python and C++ code with O(C) complexity analysis.",
  },
];

// ── Category labels ──

export const categoryLabels: Record<string, string> = {
  core: "Core Data Structures",
  patterns: "Algorithmic Patterns",
  advanced: "Advanced Topics",
};

export const categoryOrder = ["core", "patterns", "advanced"] as const;
