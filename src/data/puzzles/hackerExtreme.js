// ═══════════════════════════════════════════════════════════════════════
// HACKER — EXTREME DIFFICULTY
// Concepts: Graph traversal, dynamic programming, tree ops, advanced algos
// ═══════════════════════════════════════════════════════════════════════

export const HACKER_EXTREME = [
  {
    role: "hacker",
    difficulty: "extreme",
    title: "Graph Adjacency Pathfinder",
    discipline: "Computer Science — Graph Theory",
    prompt: "Given an adjacency list (object mapping node → neighbors) and a start/end node, return true if a path exists using BFS/DFS.",
    initialCode: `function extractPayload(args) {\n  // args = [adjacencyList, startNode, endNode]\n  // Return true if a path exists from start to end\n  const [graph, start, end] = args;\n  return false;\n}`,
    testCases: [
      { input: [{ A: ["B", "C"], B: ["D"], C: [], D: [] }, "A", "D"], expected: true },
      { input: [{ A: ["B"], B: [], C: ["D"], D: [] }, "A", "D"], expected: false },
      { input: [{ X: ["Y"], Y: ["Z"], Z: ["X"] }, "X", "Z"], expected: true, hidden: true }
    ],
    clueRevealed: "Network Path Verified: Graph Traversal Complete"
  },
  {
    role: "hacker",
    difficulty: "extreme",
    title: "Longest Common Subsequence",
    discipline: "Computer Science — Dynamic Programming",
    prompt: "Find the length of the longest common subsequence between two security key strings to determine overlap vulnerability.",
    initialCode: `function reverseToken(args) {\n  // args = "string1|string2" (pipe-separated)\n  // Return the length of the longest common subsequence\n  const [s1, s2] = args.split("|");\n  return 0;\n}`,
    testCases: [
      { input: "ABCDE|ACE", expected: 3 },
      { input: "ABC|DEF", expected: 0 },
      { input: "AGGTAB|GXTXAYB", expected: 4, hidden: true }
    ],
    clueRevealed: "LCS Overlap Computed: Key Vulnerability Index Determined"
  },
  {
    role: "hacker",
    difficulty: "extreme",
    title: "Max Subarray Intrusion Window",
    discipline: "Computer Science — Dynamic Programming",
    prompt: "Find the maximum sum contiguous subarray in the power-fluctuation log. This reveals the peak intrusion window.",
    initialCode: `function extractPayload(log) {\n  // Kadane's algorithm: return max sum of contiguous subarray\n  return 0;\n}`,
    testCases: [
      { input: [-2, 1, -3, 4, -1, 2, 1, -5, 4], expected: 6 },
      { input: [1, 2, 3], expected: 6 },
      { input: [-1, -2, -3], expected: -1, hidden: true }
    ],
    clueRevealed: "Peak Intrusion Window Identified: Max Power Surge Logged"
  },
  {
    role: "hacker",
    difficulty: "extreme",
    title: "Parentheses Validator",
    discipline: "Computer Science — Stacks",
    prompt: "Validate that the firewall rule expression has properly balanced brackets: (), [], {}. Return true if valid.",
    initialCode: `function reverseToken(expression) {\n  // Return true if all brackets are balanced\n  return false;\n}`,
    testCases: [
      { input: "({[]})", expected: true },
      { input: "({[})", expected: false },
      { input: "((()))[{}]", expected: true, hidden: true }
    ],
    clueRevealed: "Firewall Expression Validated: Bracket Balance Confirmed"
  },
  {
    role: "hacker",
    difficulty: "extreme",
    title: "Merge Interval Compactor",
    discipline: "Computer Science — Sorting & Intervals",
    prompt: "Overlapping surveillance time windows waste resources. Merge all overlapping intervals into consolidated ranges.",
    initialCode: `function extractPayload(intervals) {\n  // intervals = [[start, end], ...]\n  // Return merged non-overlapping intervals sorted by start\n  return [];\n}`,
    testCases: [
      { input: [[1, 3], [2, 6], [8, 10], [15, 18]], expected: [[1, 6], [8, 10], [15, 18]] },
      { input: [[1, 4], [4, 5]], expected: [[1, 5]] },
      { input: [[1, 10], [2, 3], [4, 5]], expected: [[1, 10]], hidden: true }
    ],
    clueRevealed: "Surveillance Windows Merged: Optimal Coverage Map Generated"
  },
  {
    role: "hacker",
    difficulty: "extreme",
    title: "Trie Prefix Counter",
    discipline: "Computer Science — Data Structures",
    prompt: "Given an array of codewords and a prefix string, count how many codewords start with that prefix.",
    initialCode: `function extractPayload(args) {\n  // args = [codewords, prefix]\n  // Return count of words starting with prefix\n  const [words, prefix] = args;\n  return 0;\n}`,
    testCases: [
      { input: [["apple", "app", "apricot", "banana"], "ap"], expected: 3 },
      { input: [["hello", "help", "world"], "hel"], expected: 2 },
      { input: [["test", "testing", "tested", "best"], "test"], expected: 3, hidden: true }
    ],
    clueRevealed: "Prefix Scan Complete: Matching Codewords Tallied"
  },
  {
    role: "hacker",
    difficulty: "extreme",
    title: "Matrix Spiral Reader",
    discipline: "Computer Science — 2D Arrays",
    prompt: "Read the security grid values in clockwise spiral order starting from the top-left corner.",
    initialCode: `function extractPayload(matrix) {\n  // Return elements in clockwise spiral order\n  return [];\n}`,
    testCases: [
      { input: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], expected: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
      { input: [[1, 2], [3, 4]], expected: [1, 2, 4, 3] },
      { input: [[1]], expected: [1], hidden: true }
    ],
    clueRevealed: "Spiral Grid Decoded: Security Matrix Read Sequence Confirmed"
  },
  {
    role: "hacker",
    difficulty: "extreme",
    title: "Permutation Generator",
    discipline: "Computer Science — Backtracking",
    prompt: "Generate all permutations of the access code digits. Return sorted array of arrays.",
    initialCode: `function extractPayload(digits) {\n  // Return all permutations of the input array, sorted\n  return [];\n}`,
    testCases: [
      { input: [1, 2], expected: [[1, 2], [2, 1]] },
      { input: [1, 2, 3], expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
      { input: [0], expected: [[0]], hidden: true }
    ],
    clueRevealed: "All Access Code Permutations Generated: Brute Force Ready"
  }
];
