// ═══════════════════════════════════════════════════════════════════════
// HACKER — EASY DIFFICULTY
// Concepts: Array indexing, .length, .slice, simple string ops, basic math
// ═══════════════════════════════════════════════════════════════════════

export const HACKER_EASY = [
  {
    role: "hacker",
    difficulty: "easy",
    title: "Perimeter Ping Counter",
    discipline: "Computer Science — Arrays",
    prompt: "The security perimeter logged a burst of sensor pings. Return the total number of pings (array length) so we can gauge traffic density.",
    initialCode: `function extractPayload(pings) {\n  // Return the number of elements in the array\n  return 0;\n}`,
    testCases: [
      { input: [1, 2, 3, 4, 5], expected: 5 },
      { input: [10, 20], expected: 2 },
      { input: [99], expected: 1, hidden: true }
    ],
    clueRevealed: "Perimeter Traffic Density Logged: Ping Count Confirmed"
  },
  {
    role: "hacker",
    difficulty: "easy",
    title: "First Byte Extractor",
    discipline: "Computer Science — Array Access",
    prompt: "Grab the very first byte from the incoming data buffer — it contains the protocol header.",
    initialCode: `function extractPayload(buffer) {\n  // Return the first element of the array\n  return null;\n}`,
    testCases: [
      { input: ["0xAA", "0xBB", "0xCC"], expected: "0xAA" },
      { input: [42, 99, 7], expected: 42 },
      { input: ["HEADER", "BODY"], expected: "HEADER", hidden: true }
    ],
    clueRevealed: "Protocol Header Extracted: Stream Synchronization Active"
  },
  {
    role: "hacker",
    difficulty: "easy",
    title: "Tail Signal Capture",
    discipline: "Computer Science — Array Access",
    prompt: "The last element of the transmission array is the checksum. Extract it for validation.",
    initialCode: `function extractPayload(transmission) {\n  // Return the last element of the array\n  return null;\n}`,
    testCases: [
      { input: [1, 2, 3, 4], expected: 4 },
      { input: ["alpha", "bravo", "checksum_OK"], expected: "checksum_OK" },
      { input: [100], expected: 100, hidden: true }
    ],
    clueRevealed: "Checksum Captured: Transmission Integrity Verified"
  },
  {
    role: "hacker",
    difficulty: "easy",
    title: "Beacon Sum Calculator",
    discipline: "Computer Science — Loops",
    prompt: "Add up all beacon signal strengths in the array to compute total broadcast power.",
    initialCode: `function extractPayload(signals) {\n  // Return the sum of all values in the array\n  return 0;\n}`,
    testCases: [
      { input: [10, 20, 30], expected: 60 },
      { input: [5, 5, 5, 5], expected: 20 },
      { input: [0, 100], expected: 100, hidden: true }
    ],
    clueRevealed: "Broadcast Power Calculated: Beacon Grid Mapped"
  },
  {
    role: "hacker",
    difficulty: "easy",
    title: "Credential Slicer",
    discipline: "Computer Science — Array Slicing",
    prompt: "The access credential sits in positions 1 through 3 (inclusive) of the key buffer. Slice it out.",
    initialCode: `function extractPayload(keyBuffer) {\n  // Return elements at index 1, 2, and 3\n  return [];\n}`,
    testCases: [
      { input: ["X", "A", "B", "C", "Y"], expected: ["A", "B", "C"] },
      { input: [0, 10, 20, 30, 40], expected: [10, 20, 30] },
      { input: ["_", "KEY1", "KEY2", "KEY3", "_", "_"], expected: ["KEY1", "KEY2", "KEY3"], hidden: true }
    ],
    clueRevealed: "Access Credential Extracted: Identity Token Assembled"
  },
  {
    role: "hacker",
    difficulty: "easy",
    title: "String Length Scanner",
    discipline: "Computer Science — Strings",
    prompt: "Measure the character length of the intercepted passphrase to check it meets minimum security requirements.",
    initialCode: `function reverseToken(passphrase) {\n  // Return the length of the string\n  return 0;\n}`,
    testCases: [
      { input: "VAULT", expected: 5 },
      { input: "hello world", expected: 11 },
      { input: "", expected: 0, hidden: true }
    ],
    clueRevealed: "Passphrase Length Verified: Security Threshold Check Passed"
  },
  {
    role: "hacker",
    difficulty: "easy",
    title: "Uppercase Converter",
    discipline: "Computer Science — Strings",
    prompt: "Convert the intercepted callsign to ALL UPPERCASE to match the official frequency registry format.",
    initialCode: `function reverseToken(callsign) {\n  // Return the string converted to uppercase\n  return callsign;\n}`,
    testCases: [
      { input: "vault", expected: "VAULT" },
      { input: "Hello World", expected: "HELLO WORLD" },
      { input: "aLrEaDy", expected: "ALREADY", hidden: true }
    ],
    clueRevealed: "Callsign Normalized: Frequency Registry Match Confirmed"
  },
  {
    role: "hacker",
    difficulty: "easy",
    title: "Even Node Filter",
    discipline: "Computer Science — Filtering",
    prompt: "Scan the relay node IDs and return only the even-numbered ones — those are the active relays.",
    initialCode: `function filterPrimeNodes(nodeIds) {\n  // Return only even numbers from the array\n  return [];\n}`,
    testCases: [
      { input: [1, 2, 3, 4, 5, 6], expected: [2, 4, 6] },
      { input: [7, 9, 11], expected: [] },
      { input: [0, 2, 4], expected: [0, 2, 4], hidden: true }
    ],
    clueRevealed: "Active Relay Nodes Identified: Even-ID Grid Online"
  }
];
