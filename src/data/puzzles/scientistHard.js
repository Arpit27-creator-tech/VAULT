// ═══════════════════════════════════════════════════════════════════════
// SCIENTIST — HARD DIFFICULTY
// Concepts: Thermodynamics, complex stoichiometry, redox, multi-step reactions
// ═══════════════════════════════════════════════════════════════════════

export const SCIENTIST_HARD = [
  {
    role: "scientist",
    difficulty: "hard",
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
  {
    role: "scientist",
    difficulty: "hard",
    title: "Thermite Demolition Charge",
    discipline: "Chemistry — Exothermic Redox",
    prompt: "Balance the high-temperature thermite reaction between aluminum and iron(III) oxide.",
    equation: "a Al + b Fe2O3 ➔ c Al2O3 + d Fe",
    reagents: [
      { name: "Aluminum Powder (Al)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 5 },
      { name: "Iron(III) Oxide (Fe2O3)", requiredCoeff: 1, currentCoeff: 2, min: 1, max: 4 },
      { name: "Aluminum Oxide (Al2O3)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 4 },
      { name: "Molten Iron (Fe)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 5 }
    ],
    targetPh: 7.0,
    clueRevealed: "Thermite Mix Stabilized: Molten Slag Breaches Blast Gate"
  },
  {
    role: "scientist",
    difficulty: "hard",
    title: "Potassium Permanganate Redox Titration",
    discipline: "Chemistry — Complex Redox",
    prompt: "Balance the acidic redox titration of permanganate with oxalic acid.",
    equation: "a KMnO4 + b H2C2O4 + c H2SO4 ➔ d K2SO4 + e MnSO4 + f CO2 + g H2O",
    reagents: [
      { name: "Potassium Permanganate (KMnO4)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
      { name: "Oxalic Acid (H2C2O4)", requiredCoeff: 5, currentCoeff: 2, min: 1, max: 6 },
      { name: "Sulfuric Acid (H2SO4)", requiredCoeff: 3, currentCoeff: 1, min: 1, max: 5 },
      { name: "Manganese Sulfate (MnSO4)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 }
    ],
    targetPh: 2.1,
    clueRevealed: "Redox Titration Endpoint Reached: Purple Dye Cleared"
  },
  {
    role: "scientist",
    difficulty: "hard",
    title: "Nitroglycerin Synthesis Intermediate",
    discipline: "Organic Chemistry — Nitration",
    prompt: "Balance glycerol nitration using concentrated nitric and sulfuric acids.",
    equation: "a C3H8O3 + b HNO3 ➔ c C3H5N3O9 + d H2O",
    reagents: [
      { name: "Glycerol (C3H8O3)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Nitric Acid (HNO3)", requiredCoeff: 3, currentCoeff: 1, min: 1, max: 5 },
      { name: "Nitroglycerin (C3H5N3O9)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Water (H2O)", requiredCoeff: 3, currentCoeff: 1, min: 1, max: 5 }
    ],
    targetPh: 1.5,
    clueRevealed: "Nitration Compound Purified: Stabilizer Added"
  },
  {
    role: "scientist",
    difficulty: "hard",
    title: "Phosphorus Combustion Flare",
    discipline: "Inorganic Chemistry",
    prompt: "Balance white phosphorus burning in limited oxygen to create dense aerosol smoke.",
    equation: "a P4 + b O2 ➔ c P4O10",
    reagents: [
      { name: "White Phosphorus (P4)", requiredCoeff: 1, currentCoeff: 2, min: 1, max: 4 },
      { name: "Oxygen Gas (O2)", requiredCoeff: 5, currentCoeff: 2, min: 1, max: 7 },
      { name: "Phosphorus Pentoxide (P4O10)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 }
    ],
    targetPh: 6.0,
    clueRevealed: "Aerosol Screen Deployed: Thermal Cameras Blinded"
  },
  {
    role: "scientist",
    difficulty: "hard",
    title: "Hydrazine Rocket Fuel Blend",
    discipline: "Energetic Materials — Kinetics",
    prompt: "Balance hydrazine and dinitrogen tetroxide hypergolic combustion.",
    equation: "a N2H4 + b N2O4 ➔ c N2 + d H2O",
    reagents: [
      { name: "Hydrazine (N2H4)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
      { name: "Dinitrogen Tetroxide (N2O4)", requiredCoeff: 1, currentCoeff: 2, min: 1, max: 3 },
      { name: "Nitrogen Gas (N2)", requiredCoeff: 3, currentCoeff: 1, min: 1, max: 5 },
      { name: "Water Vapor (H2O)", requiredCoeff: 4, currentCoeff: 2, min: 1, max: 6 }
    ],
    targetPh: 7.2,
    clueRevealed: "Hypergolic Thruster Ignited: Override Mechanism Forced"
  },
  {
    role: "scientist",
    difficulty: "hard",
    title: "Lead-Acid Battery Reversal",
    discipline: "Electrochemistry — Accumulators",
    prompt: "Balance the lead sulfate disproportionation during rapid emergency recharging.",
    equation: "a PbSO4 + b H2O ➔ c Pb + d PbO2 + e H2SO4",
    reagents: [
      { name: "Lead(II) Sulfate (PbSO4)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
      { name: "Water (H2O)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
      { name: "Lead Sponge (Pb)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Lead Dioxide (PbO2)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Sulfuric Acid (H2SO4)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 }
    ],
    targetPh: 1.0,
    clueRevealed: "Emergency Battery Cells Recharged: Standby Power 100%"
  },
  {
    role: "scientist",
    difficulty: "hard",
    title: "Aqua Regia Gold Dissolution",
    discipline: "Inorganic Chemistry — Coordination",
    prompt: "Balance gold dissolving in nitro-hydrochloric acid to penetrate the gold-plated contact pins.",
    equation: "a Au + b HNO3 + c HCl ➔ d HAuCl4 + e NO2 + f H2O",
    reagents: [
      { name: "Gold (Au)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Nitric Acid (HNO3)", requiredCoeff: 3, currentCoeff: 1, min: 1, max: 5 },
      { name: "Hydrochloric Acid (HCl)", requiredCoeff: 4, currentCoeff: 2, min: 1, max: 6 },
      { name: "Chloroauric Acid (HAuCl4)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 }
    ],
    targetPh: 0.5,
    clueRevealed: "Gold Pins Etched: Security Relay Short-Circuited"
  }
];
