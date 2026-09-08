// ═══════════════════════════════════════════════════════════════════════
// SCIENTIST — EASY DIFFICULTY
// Concepts: Simple balancing (1–2 coefficients), basic acid/base, element ID
// ═══════════════════════════════════════════════════════════════════════

export const SCIENTIST_EASY = [
  {
    role: "scientist",
    difficulty: "easy",
    title: "Water Synthesis Balancer",
    discipline: "Chemistry — Basic Equations",
    prompt: "Balance the simplest combustion reaction: hydrogen combines with oxygen to form water.",
    equation: "a H2 + b O2 ➔ c H2O",
    reagents: [
      { name: "Hydrogen Gas (H2)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
      { name: "Oxygen Gas (O2)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 4 },
      { name: "Water (H2O)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 }
    ],
    targetPh: 7.0,
    clueRevealed: "Water Synthesized: Basic Combustion Balanced"
  },
  {
    role: "scientist",
    difficulty: "easy",
    title: "Rust Formation Equation",
    discipline: "Chemistry — Oxidation",
    prompt: "Balance the iron oxidation reaction: iron reacts with oxygen to form iron oxide (rust).",
    equation: "a Fe + b O2 ➔ c Fe2O3",
    reagents: [
      { name: "Iron (Fe)", requiredCoeff: 4, currentCoeff: 2, min: 1, max: 5 },
      { name: "Oxygen Gas (O2)", requiredCoeff: 3, currentCoeff: 1, min: 1, max: 5 },
      { name: "Iron Oxide (Fe2O3)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 5 }
    ],
    targetPh: 7.0,
    clueRevealed: "Iron Oxidation Balanced: Rust Formula Confirmed"
  },
  {
    role: "scientist",
    difficulty: "easy",
    title: "Photosynthesis Primer",
    discipline: "Biology — Cellular Energy",
    prompt: "Balance the simplified photosynthesis equation: CO2 + water → glucose + oxygen.",
    equation: "a CO2 + b H2O ➔ c C6H12O6 + d O2",
    reagents: [
      { name: "Carbon Dioxide (CO2)", requiredCoeff: 6, currentCoeff: 3, min: 1, max: 8 },
      { name: "Water (H2O)", requiredCoeff: 6, currentCoeff: 3, min: 1, max: 8 },
      { name: "Glucose (C6H12O6)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Oxygen (O2)", requiredCoeff: 6, currentCoeff: 3, min: 1, max: 8 }
    ],
    targetPh: 7.0,
    clueRevealed: "Photosynthesis Balanced: Glucose Yield Confirmed"
  },
  {
    role: "scientist",
    difficulty: "easy",
    title: "Sodium Chloride Synthesis",
    discipline: "Chemistry — Ionic Bonds",
    prompt: "Combine sodium and chlorine to produce table salt.",
    equation: "a Na + b Cl2 ➔ c NaCl",
    reagents: [
      { name: "Sodium (Na)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
      { name: "Chlorine Gas (Cl2)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 4 },
      { name: "Sodium Chloride (NaCl)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 }
    ],
    targetPh: 7.0,
    clueRevealed: "Salt Synthesized: Ionic Bond Formation Verified"
  },
  {
    role: "scientist",
    difficulty: "easy",
    title: "Acid Neutralizer Basic",
    discipline: "Chemistry — Acid-Base",
    prompt: "Neutralize hydrochloric acid with sodium hydroxide to form salt and water.",
    equation: "a HCl + b NaOH ➔ c NaCl + d H2O",
    reagents: [
      { name: "Hydrochloric Acid (HCl)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Sodium Hydroxide (NaOH)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Sodium Chloride (NaCl)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Water (H2O)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 }
    ],
    targetPh: 7.0,
    clueRevealed: "Acid Neutralized: pH 7.0 Achieved"
  },
  {
    role: "scientist",
    difficulty: "easy",
    title: "Magnesium Combustion",
    discipline: "Chemistry — Combustion",
    prompt: "Magnesium burns brilliantly in air. Balance the combustion to form magnesium oxide.",
    equation: "a Mg + b O2 ➔ c MgO",
    reagents: [
      { name: "Magnesium (Mg)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
      { name: "Oxygen Gas (O2)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 4 },
      { name: "Magnesium Oxide (MgO)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 }
    ],
    targetPh: 7.0,
    clueRevealed: "Magnesium Flash Complete: Combustion Balanced"
  },
  {
    role: "scientist",
    difficulty: "easy",
    title: "Carbon Dioxide Generator",
    discipline: "Chemistry — Decomposition",
    prompt: "Heat calcium carbonate to decompose it into calcium oxide and carbon dioxide.",
    equation: "a CaCO3 ➔ b CaO + c CO2",
    reagents: [
      { name: "Calcium Carbonate (CaCO3)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Calcium Oxide (CaO)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Carbon Dioxide (CO2)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 }
    ],
    targetPh: 7.0,
    clueRevealed: "Decomposition Complete: CO2 Gas Released"
  },
  {
    role: "scientist",
    difficulty: "easy",
    title: "Hydrogen Peroxide Decomposition",
    discipline: "Chemistry — Catalysis",
    prompt: "Hydrogen peroxide decomposes into water and oxygen. Balance this simple catalytic reaction.",
    equation: "a H2O2 ➔ b H2O + c O2",
    reagents: [
      { name: "Hydrogen Peroxide (H2O2)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
      { name: "Water (H2O)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
      { name: "Oxygen Gas (O2)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 4 }
    ],
    targetPh: 7.0,
    clueRevealed: "Peroxide Decomposed: Oxygen Released for Ventilation"
  }
];
