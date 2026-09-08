// ═══════════════════════════════════════════════════════════════════════
// CRYPTOGRAPHER — MEDIUM DIFFICULTY
// Concepts: Variable Caesar shifts (+4 to +7), ROT13, Atbash, keyword ciphers
// ═══════════════════════════════════════════════════════════════════════

export const CRYPTOGRAPHER_MEDIUM = [
  {
    role: "cryptographer",
    difficulty: "medium",
    title: "ROT13 Standard Channel",
    discipline: "Symmetric Ciphers — ROT13",
    prompt: "Tune receiver to 133.7 MHz and decode the ROT13 transmission payload.",
    targetFrequency: 133.7,
    ciphertext: "ONYYVFRPG NYVTARQ",
    solution: "BALLISTIC ALIGNED",
    cipherType: "ROT13",
    clueRevealed: "Ballistic Sensor Overridden: 'BALLISTIC ALIGNED' Logged"
  },
  {
    role: "cryptographer",
    difficulty: "medium",
    title: "Atbash Mirror Cipher",
    discipline: "Mirror Ciphers — Atbash",
    prompt: "Tune to 121.2 MHz and invert the Hebrew Atbash mirror cipher (A↔Z, B↔Y).",
    targetFrequency: 121.2,
    ciphertext: "KZHHILDW XLIIVXG",
    solution: "PASSWORD CORRECT",
    cipherType: "Atbash",
    clueRevealed: "Mirror Key Decoded: 'PASSWORD CORRECT' Accepted"
  },
  {
    role: "cryptographer",
    difficulty: "medium",
    title: "Caesar Shift (+5) Sector Lock",
    discipline: "Classical Cryptography",
    prompt: "Tune to 115.8 MHz and reverse the +5 Caesar shift to identify the primary breaker.",
    targetFrequency: 115.8,
    ciphertext: "UWNYMTW RFWNPW",
    solution: "PRIMARY MARKER",
    cipherType: "Caesar (+5)",
    clueRevealed: "Breaker Identified: 'PRIMARY MARKER' Flagged"
  },
  {
    role: "cryptographer",
    difficulty: "medium",
    title: "Vigenère Canopy Cipher",
    discipline: "Historical Cryptography",
    prompt: "Tune frequency to 98.4 MHz and decrypt using keyword 'OAK'.",
    targetFrequency: 98.4,
    ciphertext: "CZWJS",
    solution: "BOTANY",
    cipherType: "Vigenère (Key: OAK)",
    clueRevealed: "Relay Cipher Unlocked: Core Terminal Deactivated!"
  },
  {
    role: "cryptographer",
    difficulty: "medium",
    title: "Caesar Shift (+7) Bio-Vault",
    discipline: "Classical Cryptography",
    prompt: "Tune to 128.6 MHz and decode the +7 shift from the cryogenic containment deck.",
    targetFrequency: 128.6,
    ciphertext: "JVSSBSHY HUK KYVW",
    solution: "CELLULAR AND DROP",
    cipherType: "Caesar (+7)",
    clueRevealed: "Cryo Valve Directive Logged: 'CELLULAR AND DROP'"
  },
  {
    role: "cryptographer",
    difficulty: "medium",
    title: "Atbash Vault Door Matrix",
    discipline: "Mirror Ciphers",
    prompt: "Tune to 140.0 MHz and invert the Atbash sequence protecting Vault Bay 4.",
    targetFrequency: 140.0,
    ciphertext: "KILEV TLZW",
    solution: "PROVE GOLD",
    cipherType: "Atbash",
    clueRevealed: "Bay 4 Access Code Unlocked: 'PROVE GOLD'"
  },
  {
    role: "cryptographer",
    difficulty: "medium",
    title: "ROT13 Encryption Burst",
    discipline: "Symmetric Ciphers",
    prompt: "Tune to 109.5 MHz and decrypt the intercepted squad broadcast via ROT13.",
    targetFrequency: 109.5,
    ciphertext: "GUR INHYG VF BCRA",
    solution: "THE VAULT IS OPEN",
    cipherType: "ROT13",
    clueRevealed: "Squad Broadcast Deciphered: 'THE VAULT IS OPEN'"
  },
  {
    role: "cryptographer",
    difficulty: "medium",
    title: "Vigenère Relay Key (ROOT)",
    discipline: "Polyalphabetic Substitution",
    prompt: "Tune to 103.8 MHz and decrypt the ciphertext using keyword 'ROOT'.",
    targetFrequency: 103.8,
    ciphertext: "HSNVX WFLK",
    solution: "QUICK FLOW",
    cipherType: "Vigenère (Key: ROOT)",
    clueRevealed: "Coolant Flow Rate Set: 'QUICK FLOW' Confirmed"
  }
];
