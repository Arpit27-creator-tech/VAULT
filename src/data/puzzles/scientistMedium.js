// ═══════════════════════════════════════════════════════════════════════
// SCIENTIST — MEDIUM DIFFICULTY
// Concepts: Multi-reagent balancing, cellular biology, stoichiometry
// ═══════════════════════════════════════════════════════════════════════

export const SCIENTIST_MEDIUM = [
  {
    role: "scientist",
    difficulty: "medium",
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
  {
    role: "scientist",
    difficulty: "medium",
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
  {
    role: "scientist",
    difficulty: "medium",
    title: "Sulfuric Acid Dilution",
    discipline: "Chemistry — Acid Reactions",
    prompt: "Dilute sulfuric acid by reacting it with zinc to produce zinc sulfate and hydrogen gas.",
    equation: "a Zn + b H2SO4 ➔ c ZnSO4 + d H2",
    reagents: [
      { name: "Zinc (Zn)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 4 },
      { name: "Sulfuric Acid (H2SO4)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 4 },
      { name: "Zinc Sulfate (ZnSO4)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 4 },
      { name: "Hydrogen Gas (H2)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 4 }
    ],
    targetPh: 5.0,
    clueRevealed: "Zinc Sulfate Produced: Acid Concentration Reduced"
  },
  {
    role: "scientist",
    difficulty: "medium",
    title: "Methane Combustion Analyzer",
    discipline: "Chemistry — Organic Combustion",
    prompt: "Balance methane combustion to power the auxiliary generator for the extraction drill.",
    equation: "a CH4 + b O2 ➔ c CO2 + d H2O",
    reagents: [
      { name: "Methane (CH4)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 4 },
      { name: "Oxygen Gas (O2)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 5 },
      { name: "Carbon Dioxide (CO2)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 4 },
      { name: "Water Vapor (H2O)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 5 }
    ],
    targetPh: 7.0,
    clueRevealed: "Methane Combustion Optimized: Auxiliary Generator Online"
  },
  {
    role: "scientist",
    difficulty: "medium",
    title: "Ammonia Production Unit",
    discipline: "Chemistry — Industrial Synthesis",
    prompt: "Balance the Haber process reaction to synthesize ammonia for the cryo-coolant system.",
    equation: "a N2 + b H2 ➔ c NH3",
    reagents: [
      { name: "Nitrogen Gas (N2)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Hydrogen Gas (H2)", requiredCoeff: 3, currentCoeff: 1, min: 1, max: 5 },
      { name: "Ammonia (NH3)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 }
    ],
    targetPh: 11.0,
    clueRevealed: "Ammonia Synthesized: Cryo-Coolant System Recharged"
  },
  {
    role: "scientist",
    difficulty: "medium",
    title: "Ethanol Fermentation Monitor",
    discipline: "Biology — Fermentation",
    prompt: "Balance the anaerobic fermentation of glucose to ethanol and carbon dioxide.",
    equation: "a C6H12O6 ➔ b C2H5OH + c CO2",
    reagents: [
      { name: "Glucose (C6H12O6)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Ethanol (C2H5OH)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
      { name: "Carbon Dioxide (CO2)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 }
    ],
    targetPh: 4.5,
    clueRevealed: "Fermentation Balanced: Ethanol Yield Maximized"
  },
  {
    role: "scientist",
    difficulty: "medium",
    title: "Baking Soda Volcano",
    discipline: "Chemistry — Acid-Base Reactions",
    prompt: "Balance the classic vinegar + baking soda reaction to create a controlled gas release.",
    equation: "a NaHCO3 + b CH3COOH ➔ c CH3COONa + d H2O + e CO2",
    reagents: [
      { name: "Sodium Bicarbonate (NaHCO3)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Acetic Acid (CH3COOH)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Sodium Acetate (CH3COONa)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Water (H2O)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Carbon Dioxide (CO2)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 }
    ],
    targetPh: 7.0,
    clueRevealed: "Controlled Gas Release: Pressure Vent Cleared"
  },
  {
    role: "scientist",
    difficulty: "medium",
    title: "Calcium Hydroxide pH Buffer",
    discipline: "Chemistry — Bases",
    prompt: "Produce calcium hydroxide (slaked lime) by adding water to calcium oxide to create a pH buffer.",
    equation: "a CaO + b H2O ➔ c Ca(OH)2",
    reagents: [
      { name: "Calcium Oxide (CaO)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Water (H2O)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Calcium Hydroxide (Ca(OH)2)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 }
    ],
    targetPh: 12.4,
    clueRevealed: "pH Buffer Established: Alkaline Shield Active"
  }
];
