// Interactive Role Puzzle Data & Interdependence Chains

export const heistStages = [
  {
    stageId: 1,
    title: "Stage 1: Perimeter Breach",
    subtitle: "Parallel Security Tasks & Chemical Bypass",
    description: "Breach the outer canopy perimeter by neutralizing the cryogenic acid lock and aligning the optical laser sensor.",
    timeLimit: 180, // 3 minutes
    targetFacility: "Canopy Security Station A",
    puzzles: {
      scientist: {
        role: "scientist",
        title: "Chemical Synthesis Rig",
        discipline: "Stoichiometry & Reagents",
        prompt: "Balance the neutralization reaction to dissolve the petrified lock hinge without releasing toxic gas alarms.",
        equation: "a HCl + b CaCO3 ➔ c CaCl2 + d H2O + e CO2",
        reagents: [
          { name: "Hydrochloric Acid (HCl)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 5 },
          { name: "Calcium Carbonate (CaCO3)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 5 },
          { name: "Calcium Chloride (CaCl2)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 5 },
          { name: "Water (H2O)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 5 },
          { name: "Carbon Dioxide (CO2)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 5 }
        ],
        targetPh: 6.8,
        clueRevealed: "Compound Reagent Synthesized: #7F (Optical Density n = 1.42)"
      },
      engineer: {
        role: "engineer",
        title: "Optical Laser Deflector Array",
        discipline: "Geometry & Snell's Law",
        prompt: "Rotate Mirror A and Mirror B to refract the laser beam into the override photo-sensor.",
        requiredAngleA: 45,
        requiredAngleB: 135,
        sensorTargetX: 85,
        sensorTargetY: 40,
        clueRevealed: "Optical Alignment Established! Laser illuminates Security Port: 0x7E3A"
      },
      hacker: {
        role: "hacker",
        title: "Kernel Firewall Terminal",
        discipline: "Data Structures & Array Slicing",
        prompt: "Write a function that extracts the security payload from indices 2 through 6 (inclusive) of the firewall buffer.",
        initialCode: `// Hacker Terminal v3.2
// Task: Extract indices 2 through 6 (inclusive)
function extractPayload(buffer) {
  // Write your slice expression below:
  return buffer.slice(2, 7);
}`,
        testCase: ["0x00", "0x11", "0x7E", "0x3A", "0x99", "0xAA", "0xBB", "0xFF"],
        expectedOutput: ["0x7E", "0x3A", "0x99", "0xAA", "0xBB"],
        clueRevealed: "Firewall Bypassed! Intercepted Cipher Hex: 'SLYV-782-YLFZ'"
      },
      cryptographer: {
        role: "cryptographer",
        title: "Frequency Decoder Deck",
        discipline: "Ciphers & Linguistics",
        prompt: "Tune the receiver to 142.5 MHz and decipher the ancient Caesar shift (+3 shift).",
        targetFrequency: 142.5,
        ciphertext: "VHFXUH WKH JURYH",
        solution: "SECURE THE GROVE",
        cipherType: "Caesar (+3)",
        clueRevealed: "Master Authorization Phrase Verified: 'SECURE THE GROVE'"
      }
    }
  },
  {
    stageId: 2,
    title: "Stage 2: The Central Core",
    subtitle: "Interlocked Circuit & Mycelium Wire",
    description: "Coordinate inputs across all 4 squad terminals in strict sequence to disable the central security grid.",
    timeLimit: 150,
    targetFacility: "World-Tree Central Relay",
    puzzles: {
      scientist: {
        role: "scientist",
        title: "Mycelium Bio-Voltage Regulator",
        discipline: "Cellular Respiration & Ions",
        prompt: "Adjust the cellular ATP ion balance to generate exactly 36 ATP molecules.",
        equation: "Glycolysis (2) + Krebs (2) + Electron Transport (32) = 36 ATP",
        reagents: [
          { name: "Glycolysis Net ATP", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
          { name: "Krebs Cycle Net ATP", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
          { name: "Oxidative Phosphorylation", requiredCoeff: 32, currentCoeff: 30, min: 25, max: 35 }
        ],
        targetPh: 7.4,
        clueRevealed: "Bio-Voltage Synchronized at 36mV (Transmitted to Engineer Grid)"
      },
      engineer: {
        role: "engineer",
        title: "Capacitor Grid Load Balancer",
        discipline: "Calculus & Resistance",
        prompt: "Adjust the deflector mirror to achieve resonant frequency at angle θ = 60°.",
        requiredAngleA: 60,
        requiredAngleB: 120,
        sensorTargetX: 90,
        sensorTargetY: 25,
        clueRevealed: "Capacitor Grid Equalized! Mainframe Access Port Opened."
      },
      hacker: {
        role: "hacker",
        title: "Binary Tree Traversal Node",
        discipline: "Algorithms & Search",
        prompt: "Filter out corrupted nodes by returning only prime node IDs from the tree list.",
        initialCode: `// Binary Tree Prime Validator
function filterPrimeNodes(nodes) {
  function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) {
      if (n % i === 0) return false;
    }
    return true;
  }
  return nodes.filter(isPrime);
}`,
        testCase: [4, 7, 10, 13, 15, 19, 21, 23],
        expectedOutput: [7, 13, 19, 23],
        clueRevealed: "Prime Node Handshake Verified! Transmitting Cipher Token."
      },
      cryptographer: {
        role: "cryptographer",
        title: "Vigenère Canopy Cipher",
        discipline: "Historical Cryptography",
        prompt: "Tune frequency to 98.4 MHz and decrypt using keyword 'OAK'.",
        targetFrequency: 98.4,
        ciphertext: "CZWJS", // with key OAK -> BOTANY
        solution: "BOTANY",
        cipherType: "Vigenère (Key: OAK)",
        clueRevealed: "Relay Cipher Unlocked: Core Terminal Deactivated!"
      }
    }
  },
  {
    stageId: 3,
    title: "Stage 3: Vault Extraction",
    subtitle: "Grand Boss Challenge (Rapid Coordination)",
    description: "Extract the sacred World-Tree seed archive before the high-alert security lockdown seals the facility.",
    timeLimit: 120,
    targetFacility: "Master Sylvan Sanctum",
    puzzles: {
      scientist: {
        role: "scientist",
        title: "Cryo-Containment Neutralizer",
        discipline: "Thermodynamics & Catalysts",
        prompt: "Balance the exothermic enthalpy equation: 2 H2 + O2 ➔ 2 H2O",
        equation: "2 H2 + 1 O2 ➔ 2 H2O (ΔH = -572 kJ)",
        reagents: [
          { name: "Hydrogen Gas (H2)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
          { name: "Oxygen Gas (O2)", requiredCoeff: 1, currentCoeff: 2, min: 1, max: 4 },
          { name: "Water Vapor (H2O)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 }
        ],
        targetPh: 7.0,
        clueRevealed: "Cryo Shield Neutralized! Laser Sensors Exposed."
      },
      engineer: {
        role: "engineer",
        title: "Master Beam Reflector Prism",
        discipline: "Triangulation & Physics",
        prompt: "Set the dual prisms to 30° and 150° to split the extraction beam.",
        requiredAngleA: 30,
        requiredAngleB: 150,
        sensorTargetX: 95,
        sensorTargetY: 50,
        clueRevealed: "Prism Lock Overridden! Master Vault Door Opened."
      },
      hacker: {
        role: "hacker",
        title: "Mainframe Root Injection",
        discipline: "Recursion & Data Parsing",
        prompt: "Reverse the decrypted byte sequence string to bypass the anti-tamper lock.",
        initialCode: `// Master Extraction Reverser
function reverseToken(str) {
  return str.split('').reverse().join('');
}`,
        testCase: "SYLVAN-MASTER-VAULT",
        expectedOutput: "TLUAV-RETSAM-NAVLYS",
        clueRevealed: "Root Access Granted: Archive Disengaged!"
      },
      cryptographer: {
        role: "cryptographer",
        title: "Ancient Sylvan Rune Decryption",
        discipline: "Ancient Chronology & Runes",
        prompt: "Tune frequency to 108.0 MHz and decode the final glyph message.",
        targetFrequency: 108.0,
        ciphertext: "NQRZOHGJH LV IUHHGRP", // Caesar +3
        solution: "KNOWLEDGE IS FREEDOM",
        cipherType: "Caesar (+3)",
        clueRevealed: "Extraction Complete! World Tree Secured."
      }
    }
  }
];
