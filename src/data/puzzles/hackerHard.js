// ═══════════════════════════════════════════════════════════════════════
// HACKER — HARD DIFFICULTY
// Concepts: Recursion, binary search, sorting, nested data, matrix ops
// ═══════════════════════════════════════════════════════════════════════

export const HACKER_HARD = [
  {
    role: "hacker",
    difficulty: "hard",
    title: "Fibonacci Sequence Generator",
    discipline: "Computer Science — Recursion",
    prompt: "Generate the first N numbers of the Fibonacci sequence to reconstruct the authentication handshake pattern.",
    initialCode: `function extractPayload(n) {\n  // Return an array of the first n Fibonacci numbers\n  // Fibonacci: 0, 1, 1, 2, 3, 5, 8, ...\n  return [];\n}`,
    testCases: [
      { input: 5, expected: [0, 1, 1, 2, 3] },
      { input: 1, expected: [0] },
      { input: 8, expected: [0, 1, 1, 2, 3, 5, 8, 13], hidden: true }
    ],
    clueRevealed: "Fibonacci Handshake Pattern Reconstructed: Auth Sequence Valid"
  },
  {
    role: "hacker",
    difficulty: "hard",
    title: "Binary Search Decoder",
    discipline: "Computer Science — Search Algorithms",
    prompt: "The encrypted vault index is hidden in a sorted array. Implement binary search to find the target value's position, or return -1 if it doesn't exist.",
    initialCode: `function extractPayload(args) {\n  // args = [sortedArray, target]\n  // Return the index of target in sortedArray, or -1\n  const [arr, target] = args;\n  return -1;\n}`,
    testCases: [
      { input: [[1, 3, 5, 7, 9], 5], expected: 2 },
      { input: [[10, 20, 30, 40], 25], expected: -1 },
      { input: [[2, 4, 6, 8, 10, 12], 12], expected: 5, hidden: true }
    ],
    clueRevealed: "Vault Index Located: Binary Scan Complete"
  },
  {
    role: "hacker",
    difficulty: "hard",
    title: "Frequency Map Builder",
    discipline: "Computer Science — Hash Maps",
    prompt: "Build a frequency map counting how many times each element appears in the intercepted packet stream. Return as a sorted array of [element, count] pairs.",
    initialCode: `function extractPayload(packets) {\n  // Return [[element, count], ...] sorted by element ascending\n  return [];\n}`,
    testCases: [
      { input: ["a", "b", "a", "c", "b", "a"], expected: [["a", 3], ["b", 2], ["c", 1]] },
      { input: [1, 1, 2], expected: [[1, 2], [2, 1]] },
      { input: ["x"], expected: [["x", 1]], hidden: true }
    ],
    clueRevealed: "Frequency Map Compiled: Packet Distribution Analyzed"
  },
  {
    role: "hacker",
    difficulty: "hard",
    title: "Matrix Row Sum",
    discipline: "Computer Science — 2D Arrays",
    prompt: "Compute the sum of each row in the security grid matrix. Return an array of row sums.",
    initialCode: `function extractPayload(matrix) {\n  // matrix is a 2D array, return array of row sums\n  return [];\n}`,
    testCases: [
      { input: [[1, 2, 3], [4, 5, 6]], expected: [6, 15] },
      { input: [[10], [20], [30]], expected: [10, 20, 30] },
      { input: [[0, 0], [1, -1]], expected: [0, 0], hidden: true }
    ],
    clueRevealed: "Security Grid Rows Summed: Power Distribution Mapped"
  },
  {
    role: "hacker",
    difficulty: "hard",
    title: "Palindrome Verifier",
    discipline: "Computer Science — Strings & Recursion",
    prompt: "Check if the decoded passphrase is a palindrome (reads the same forwards and backwards, case-insensitive, ignoring spaces).",
    initialCode: `function reverseToken(passphrase) {\n  // Return true if palindrome (ignore case & spaces), false otherwise\n  return false;\n}`,
    testCases: [
      { input: "racecar", expected: true },
      { input: "hello", expected: false },
      { input: "Was It A Rat I Saw", expected: true, hidden: true }
    ],
    clueRevealed: "Palindrome Validation Passed: Passphrase Symmetry Confirmed"
  },
  {
    role: "hacker",
    difficulty: "hard",
    title: "Insertion Sort Sequencer",
    discipline: "Computer Science — Sorting",
    prompt: "The relay node IDs arrived out of order. Implement insertion sort to restore the correct sequence.",
    initialCode: `function filterPrimeNodes(nodes) {\n  // Sort the array using insertion sort and return it\n  return nodes;\n}`,
    testCases: [
      { input: [5, 3, 8, 1, 2], expected: [1, 2, 3, 5, 8] },
      { input: [1], expected: [1] },
      { input: [9, 7, 5, 3, 1], expected: [1, 3, 5, 7, 9], hidden: true }
    ],
    clueRevealed: "Node Sequence Restored: Relay Order Corrected"
  },
  {
    role: "hacker",
    difficulty: "hard",
    title: "Nested Object Key Extractor",
    discipline: "Computer Science — Objects & Recursion",
    prompt: "Flatten a nested object and return all leaf values in an array (depth-first order).",
    initialCode: `function extractPayload(obj) {\n  // Recursively collect all non-object values from the nested object\n  // Return them as a flat array\n  return [];\n}`,
    testCases: [
      { input: { a: 1, b: { c: 2, d: 3 } }, expected: [1, 2, 3] },
      { input: { x: { y: { z: 42 } } }, expected: [42] },
      { input: { a: "hello", b: { c: "world" } }, expected: ["hello", "world"], hidden: true }
    ],
    clueRevealed: "Nested Data Flattened: Deep Payload Values Extracted"
  },
  {
    role: "hacker",
    difficulty: "hard",
    title: "Two-Sum Key Finder",
    discipline: "Computer Science — Hash Maps & Search",
    prompt: "Find two indices in the key array whose values sum to the target passcode. Return [index1, index2] (index1 < index2).",
    initialCode: `function extractPayload(args) {\n  // args = [array, target]\n  // Return [i, j] where array[i] + array[j] === target and i < j\n  const [arr, target] = args;\n  return [];\n}`,
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[1, 5, 3, 7], 8], expected: [0, 3], hidden: true }
    ],
    clueRevealed: "Two-Sum Pair Located: Passcode Indices Confirmed"
  }
];
