// Original Hacker Terminal puzzles — extends the pool beyond the 3
// stage-derived puzzles. Each uses the multi-test-case format and one
// of the 3 function names the sandbox recognizes (extractPayload,
// filterPrimeNodes, reverseToken). Logic/theme is fully original per
// puzzle; the function name is just a fixed signature the sandbox looks
// for, not a hint about what the puzzle actually does.
export const EXTRA_HACKER_PUZZLES = [
  {
    role: "hacker",
    title: "Signal Range Extractor",
    discipline: "Computer Science — Arrays",
    prompt: "The array holds a burst of signal readings. Extract the [minimum, maximum] pair to calibrate the receiver.",
    initialCode: `function extractPayload(readings) {\n  // Return [min, max] from the array\n  return [0, 0];\n}`,
    testCases: [
      { input: [5, 3, 9, 1], expected: [1, 9] },
      { input: [10, 10, 10], expected: [10, 10] },
      { input: [-5, 0, 5], expected: [-5, 5], hidden: true }
    ],
    clueRevealed: "Signal Range Locked: MIN-MAX Calibration Complete"
  },
  {
    role: "hacker",
    title: "Divisor Sweep Filter",
    discipline: "Computer Science — Filtering",
    prompt: "Sweep the node array and isolate every value cleanly divisible by 3 — those are the compromised nodes.",
    initialCode: `function filterPrimeNodes(nodes) {\n  // Return only values divisible by 3\n  return [];\n}`,
    testCases: [
      { input: [1, 3, 4, 6, 9], expected: [3, 6, 9] },
      { input: [2, 5, 7], expected: [] },
      { input: [12, 15, 17, 18], expected: [12, 15, 18], hidden: true }
    ],
    clueRevealed: "Node Sweep Complete: Compromised Nodes Isolated"
  },
  {
    role: "hacker",
    title: "Callsign Capitalizer",
    discipline: "Computer Science — Strings",
    prompt: "Intercepted callsigns are lowercase. Capitalize the first letter to match the official transmission format.",
    initialCode: `function reverseToken(callsign) {\n  // Capitalize the first letter\n  return callsign;\n}`,
    testCases: [
      { input: "hello", expected: "Hello" },
      { input: "world", expected: "World" },
      { input: "a", expected: "A", hidden: true }
    ],
    clueRevealed: "Callsign Format Corrected: Transmission Authenticated"
  },
  {
    role: "hacker",
    title: "Energy Signature Aggregator",
    discipline: "Computer Science — Reduce/Aggregation",
    prompt: "Each reading contributes energy proportional to its square. Sum the squared energy signature of the array.",
    initialCode: `function extractPayload(readings) {\n  // Return the sum of squares of all values\n  return 0;\n}`,
    testCases: [
      { input: [1, 2, 3], expected: 14 },
      { input: [0, 0], expected: 0 },
      { input: [-2, 3], expected: 13, hidden: true }
    ],
    clueRevealed: "Energy Signature Aggregated: Power Core Signature Confirmed"
  },
  {
    role: "hacker",
    title: "Duplicate Echo Remover",
    discipline: "Computer Science — Sets/Dedup",
    prompt: "The relay is echoing duplicate packets. Strip repeats while keeping the first-seen order intact.",
    initialCode: `function filterPrimeNodes(packets) {\n  // Return the array with duplicates removed, order preserved\n  return packets;\n}`,
    testCases: [
      { input: [1, 2, 2, 3, 1], expected: [1, 2, 3] },
      { input: [5, 5, 5], expected: [5] },
      { input: [4, 3, 4, 2, 3], expected: [4, 3, 2], hidden: true }
    ],
    clueRevealed: "Echo Filter Applied: Clean Packet Stream Restored"
  },
  {
    role: "hacker",
    title: "Vowel Frequency Counter",
    discipline: "Computer Science — Strings",
    prompt: "Count how many vowels appear in the intercepted string, case-insensitive, to gauge transmission entropy.",
    initialCode: `function reverseToken(message) {\n  // Return the count of vowels (a, e, i, o, u), case-insensitive\n  return 0;\n}`,
    testCases: [
      { input: "hello", expected: 2 },
      { input: "xyz", expected: 0 },
      { input: "AEIOUaeiou", expected: 10, hidden: true }
    ],
    clueRevealed: "Entropy Scan Complete: Vowel Density Logged"
  }
];
