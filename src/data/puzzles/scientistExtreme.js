// ═══════════════════════════════════════════════════════════════════════
// SCIENTIST — EXTREME DIFFICULTY
// Concepts: Multi-step synthesis chains, biochemical equilibria, advanced stoichiometry
// ═══════════════════════════════════════════════════════════════════════

export const SCIENTIST_EXTREME = [
  {
    role: "scientist",
    difficulty: "extreme",
    title: "Enzyme Substrate Saturation Complex",
    discipline: "Biochemistry — Michaelis-Menten",
    prompt: "Balance the multi-enzyme allosteric cascade to produce synthetic catalyst 9X without feedback inhibition.",
    equation: "a Enzyme + b Substrate + c ATP ➔ d Complex + e ADP + f Pi",
    reagents: [
      { name: "Allosteric Enzyme (E)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
      { name: "Substrate (S)", requiredCoeff: 4, currentCoeff: 2, min: 1, max: 6 },
      { name: "ATP Molecule", requiredCoeff: 4, currentCoeff: 1, min: 1, max: 6 },
      { name: "Active Catalyst Complex", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 }
    ],
    targetPh: 7.35,
    clueRevealed: "Catalytic Cascade Synchronized: Vmax Velocity Achieved"
  },
  {
    role: "scientist",
    difficulty: "extreme",
    title: "Haber-Bosch High-Pressure Equilibrium",
    discipline: "Chemical Kinetics — Le Chatelier",
    prompt: "Optimize the Le Chatelier shift under 200 atm and 450°C to push conversion past 98%.",
    equation: "a N2 + b H2 ➔ c NH3 (ΔH = -92 kJ/mol)",
    reagents: [
      { name: "Purified Nitrogen (N2)", requiredCoeff: 1, currentCoeff: 2, min: 1, max: 3 },
      { name: "High-Pressure Hydrogen (H2)", requiredCoeff: 3, currentCoeff: 1, min: 1, max: 6 },
      { name: "Condensed Ammonia (NH3)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 5 }
    ],
    targetPh: 11.2,
    clueRevealed: "Equilibrium Pushed Right: 98.4% Yield Verified"
  },
  {
    role: "scientist",
    difficulty: "extreme",
    title: "Superheavy Actinide Transmutation",
    discipline: "Nuclear Chemistry — Neutron Capture",
    prompt: "Balance the neutron flux capture across the curium target to isolate californium-252.",
    equation: "a Cm-244 + b (n,γ) ➔ c Cf-252 + d β-",
    reagents: [
      { name: "Curium-244 (Cm-244)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Neutron Bombardment (n)", requiredCoeff: 8, currentCoeff: 4, min: 2, max: 10 },
      { name: "Californium-252 (Cf-252)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Beta Emissions (β-)", requiredCoeff: 4, currentCoeff: 2, min: 1, max: 6 }
    ],
    targetPh: 7.0,
    clueRevealed: "Actinide Isotope Pure: Spontaneous Fission Emitter Calibrated"
  },
  {
    role: "scientist",
    difficulty: "extreme",
    title: "DNA Polymerase Chain Synthesis",
    discipline: "Molecular Genetics — PCR Kinetics",
    prompt: "Balance the tri-phosphate deoxynucleotide stoichiometric incorporation per duplex cycle.",
    equation: "a Primer + b dNTP + c Mg2+ ➔ d Amplicon + e PPi",
    reagents: [
      { name: "Oligonucleotide Primer", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
      { name: "dNTP Pool (A,T,C,G)", requiredCoeff: 4, currentCoeff: 2, min: 1, max: 6 },
      { name: "Magnesium Cofactor (Mg2+)", requiredCoeff: 3, currentCoeff: 1, min: 1, max: 5 },
      { name: "Amplified Sequence Copy", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 }
    ],
    targetPh: 8.3,
    clueRevealed: "Biometric DNA Sequence Amplified: Genetic Lock Signature Matched"
  },
  {
    role: "scientist",
    difficulty: "extreme",
    title: "Supercritical CO2 Extraction",
    discipline: "Phase Thermodynamics — Critical Points",
    prompt: "Balance the phase-boundary pressure and temperature loop: CO2 liquid-gas critical point convergence.",
    equation: "a CO2(liq) + b Heat(ΔH) + c Pressure(ΔP) ➔ d scCO2",
    reagents: [
      { name: "Liquid Carbon Dioxide", requiredCoeff: 3, currentCoeff: 1, min: 1, max: 5 },
      { name: "Critical Enthalpy Unit", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
      { name: "Pressure Bar Unit (73.8 bar)", requiredCoeff: 3, currentCoeff: 2, min: 1, max: 5 },
      { name: "Supercritical Fluid (scCO2)", requiredCoeff: 3, currentCoeff: 1, min: 1, max: 5 }
    ],
    targetPh: 6.0,
    clueRevealed: "Supercritical Fluid Phase Locked: Zero Surface Tension Extraction"
  },
  {
    role: "scientist",
    difficulty: "extreme",
    title: "Chlorophyll Electron Transport Cascade",
    discipline: "Photochemistry — Z-Scheme",
    prompt: "Balance the photolytic water splitting in photosystem II: 2 H2O + 4 photons ➔ O2 + 4 H+ + 4 e-.",
    equation: "a H2O + b Photon(hν) ➔ c O2 + d H+ + e e-",
    reagents: [
      { name: "Water Molecule (H2O)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
      { name: "Photon Flux (hν)", requiredCoeff: 4, currentCoeff: 2, min: 1, max: 6 },
      { name: "Molecular Oxygen (O2)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Proton Gradient (H+)", requiredCoeff: 4, currentCoeff: 2, min: 1, max: 6 },
      { name: "High-Energy Electrons (e-)", requiredCoeff: 4, currentCoeff: 2, min: 1, max: 6 }
    ],
    targetPh: 7.8,
    clueRevealed: "Z-Scheme Photolysis Synchronized: Bio-Photovoltaic Surge 100%"
  },
  {
    role: "scientist",
    difficulty: "extreme",
    title: "Graphene Oxide Reduction Lattice",
    discipline: "Nanomaterials — Chemical Vapor Deposition",
    prompt: "Deoxygenate graphene oxide sheet with hydrazine vapor to restore ballistic electrical conductivity.",
    equation: "a C10O4H4 + b N2H4 ➔ c C10H2 + d N2 + e H2O",
    reagents: [
      { name: "Graphene Oxide Flake", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Hydrazine Monohydrate", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
      { name: "Reduced Graphene (rGO)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Water Byproduct (H2O)", requiredCoeff: 4, currentCoeff: 2, min: 1, max: 6 }
    ],
    targetPh: 9.0,
    clueRevealed: "Graphene Lattice Restored: Zero-Resistance Superconductive Path"
  },
  {
    role: "scientist",
    difficulty: "extreme",
    title: "Chemiluminescent Singlet Oxygen Trap",
    discipline: "Spectroscopy — Quantum Yields",
    prompt: "Balance the alkaline luminol oxidation with hydrogen peroxide catalyzed by potassium ferricyanide.",
    equation: "a Luminol + b H2O2 + c OH- ➔ d 3-APA* + e N2 + f H2O + hν",
    reagents: [
      { name: "Luminol (C8H7N3O2)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 },
      { name: "Hydrogen Peroxide (H2O2)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
      { name: "Hydroxide Base (OH-)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 4 },
      { name: "Excited Dianion (3-APA*)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 3 }
    ],
    targetPh: 11.5,
    clueRevealed: "425nm Blue Chemiluminescence Fired: Photoelectric Relay Triggered"
  }
];
