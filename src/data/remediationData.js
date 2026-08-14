
export const roleTopicGuides = {
  hacker: {
    roleName: "The Hacker (Computer Science)",
    discipline: "Algorithms, Data Structures & Logic",
    icon: "Terminal",
    color: "#10B981",
    coreConcepts: [
      {
        id: "cs-slicing",
        title: "Array Slicing & Substring Indexing",
        importance: "Critical",
        duration: "6 mins",
        summary: "Extracting contiguous memory blocks without mutating source arrays.",
        formula: "array.slice(startIndex, endIndexExcluded)",
        keyTakeaway: "Index 0 is the first element. slice(1, 4) extracts elements at indices 1, 2, and 3.",
        resources: ["MDN Web Docs: Array.prototype.slice", "Python List Slicing Notation Guide"],
        practiceDrill: {
          question: "Given array ['FIREWALL', 'KERNEL', 'CIPHER', 'ROOT', 'BUFFER'], what does arr.slice(1, 4) return?",
          options: [
            "['FIREWALL', 'KERNEL', 'CIPHER']",
            "['KERNEL', 'CIPHER', 'ROOT']",
            "['KERNEL', 'CIPHER', 'ROOT', 'BUFFER']",
            "['CIPHER', 'ROOT']"
          ],
          correct: 1,
          explanation: "Slice starts at index 1 ('KERNEL') up to index 4 (exclusive), extracting indices 1, 2, 3 ('KERNEL', 'CIPHER', 'ROOT')."
        }
      },
      {
        id: "cs-recursion",
        title: "Recursive Tree Traversal & Stack Traces",
        importance: "High",
        duration: "8 mins",
        summary: "Solving sub-problems by self-calling functions with explicit base cases.",
        formula: "T(n) = aT(n/b) + O(n^d) [Master Theorem]",
        keyTakeaway: "Every recursive algorithm MUST have a base condition to prevent Call Stack Overflow.",
        resources: ["Big-O Complexity Cheatsheet", "Binary Search Tree Traversals"],
        practiceDrill: {
          question: "What happens if a recursive function lacks a base case?",
          options: [
            "Returns 0 automatically",
            "Memory Leak / Maximum Call Stack Size Exceeded",
            "Compiles as an infinite loop with no memory cost",
            "Converts to iterative loop"
          ],
          correct: 1,
          explanation: "Without a base case, recursive stack frames continuously allocate memory until stack overflow occurs."
        }
      },
      {
        id: "cs-bitwise",
        title: "Bitwise Masking & Logic Gates",
        importance: "Medium",
        duration: "5 mins",
        summary: "Manipulating raw binary bits using AND (&), OR (|), and XOR (^).",
        formula: "A ^ B ^ B = A (XOR Invertibility)",
        keyTakeaway: "XOR is symmetric and reversible, making it foundational for streaming ciphers and hardware parity checks.",
        resources: ["Computer Systems: A Programmer's Perspective (Bits & Bytes)"],
        practiceDrill: {
          question: "What is the binary result of (1010 & 1100)?",
          options: ["1000", "1110", "0110", "1111"],
          correct: 0,
          explanation: "Bitwise AND returns 1 only where both bits are 1. Position 4 has 1 & 1 = 1; positions 3, 2, 1 have zeroes."
        }
      }
    ]
  },
  engineer: {
    roleName: "The Engineer (Applied Physics)",
    discipline: "Optics, Geometry & Electromagnetic Radiation",
    icon: "Compass",
    color: "#FBBF24",
    coreConcepts: [
      {
        id: "phys-reflection",
        title: "Law of Specular Reflection",
        importance: "Critical",
        duration: "5 mins",
        summary: "The angle of incidence equals the angle of reflection relative to the normal line.",
        formula: "θ_i = θ_r (measured relative to surface normal ⊥)",
        keyTakeaway: "Always measure beam angles with respect to the perpendicular normal line, not the plane surface.",
        resources: ["Feynman Lectures on Physics: Optics", "PhET Interactive Wave & Ray Simulation"],
        practiceDrill: {
          question: "A photon ray strikes a planar mirror at 35° relative to the normal line. What is the reflection angle?",
          options: ["35°", "55°", "90°", "180°"],
          correct: 0,
          explanation: "According to the Law of Reflection, the angle of reflection θ_r is strictly equal to the angle of incidence θ_i = 35°."
        }
      },
      {
        id: "phys-snell",
        title: "Snell's Law of Optical Refraction",
        importance: "Critical",
        duration: "7 mins",
        summary: "Bending of electromagnetic waves when transitioning across mediums of differing refractive indices.",
        formula: "n₁ · sin(θ₁) = n₂ · sin(θ₂)",
        keyTakeaway: "Light travels slower in denser mediums (higher n), bending towards the normal line.",
        resources: ["Halliday & Resnick: Principles of Physics (Optics)"],
        practiceDrill: {
          question: "When a beam passes from air (n=1.0) into glass (n=1.5), does the ray bend toward or away from the normal?",
          options: [
            "Bends toward the normal line (θ₂ < θ₁)",
            "Bends away from the normal line (θ₂ > θ₁)",
            "Continues completely straight without deflection",
            "Reflects 100% backward"
          ],
          correct: 0,
          explanation: "As refractive index increases (1.0 → 1.5), wave velocity decreases, causing the ray to refract toward the normal line."
        }
      },
      {
        id: "phys-laser",
        title: "Laser Collimation & Polarized Alignment",
        importance: "High",
        duration: "6 mins",
        summary: "Stimulated emission yielding monochromatic, coherent, in-phase photon streams.",
        formula: "E = h · f = (h · c) / λ",
        keyTakeaway: "Photon energy is inversely proportional to wavelength. Shorter wavelengths (UV/Blue) carry higher quantum energy.",
        resources: ["Laser Physics Fundamentals & Sensor Triangulation"],
        practiceDrill: {
          question: "Which electromagnetic wavelength carries the highest energy per photon?",
          options: ["Red laser (650 nm)", "Green laser (532 nm)", "Violet/UV laser (405 nm)", "Infrared (850 nm)"],
          correct: 2,
          explanation: "Energy E = hc/λ. The shortest wavelength (405 nm Violet) produces the highest photon energy."
        }
      }
    ]
  },
  scientist: {
    roleName: "The Scientist (Chemistry & Biochemistry)",
    discipline: "Stoichiometry, Reaction Kinetics & Solution pH",
    icon: "FlaskConical",
    color: "#06B6D4",
    coreConcepts: [
      {
        id: "chem-stoichiometry",
        title: "Law of Conservation of Mass & Molar Balancing",
        importance: "Critical",
        duration: "7 mins",
        summary: "Equal number of each elemental atom must be preserved on reactant and product sides.",
        formula: "Total Atoms (Reactants) ≡ Total Atoms (Products)",
        keyTakeaway: "Change only the stoichiometric integer coefficients, NEVER the chemical subscript numbers.",
        resources: ["OpenStax Chemistry 2e: Stoichiometry & Equations"],
        practiceDrill: {
          question: "To balance the combustion of Hydrogen: a H₂ + b O₂ → c H₂O, what are the lowest whole coefficients (a, b, c)?",
          options: ["2, 1, 2", "1, 1, 1", "2, 2, 2", "4, 1, 2"],
          correct: 0,
          explanation: "2 H₂ (4 Hydrogen) + 1 O₂ (2 Oxygen) yields 2 H₂O (4 Hydrogen and 2 Oxygen atoms), balancing mass perfectly."
        }
      },
      {
        id: "chem-ph",
        title: "Logarithmic pH & Buffer Neutralization",
        importance: "Critical",
        duration: "6 mins",
        summary: "Quantifying hydronium ion concentration [H⁺] on an inverse base-10 logarithmic scale.",
        formula: "pH = -log₁₀[H⁺] | pH + pOH = 14",
        keyTakeaway: "A decrease of 1.0 pH unit corresponds to a 10× increase in hydrogen ion concentration.",
        resources: ["Acid-Base Equilibria & Henderson-Hasselbalch Equation"],
        practiceDrill: {
          question: "How much more acidic is a solution with pH 5.0 compared to a neutral solution of pH 7.0?",
          options: ["2 times more acidic", "20 times more acidic", "100 times more acidic", "1,000 times more acidic"],
          correct: 2,
          explanation: "Each unit step on the logarithmic pH scale represents a 10× change. 2 units difference = 10² = 100× higher [H⁺]."
        }
      },
      {
        id: "chem-density",
        title: "Solution Molarity & Refractive Optical Density",
        importance: "High",
        duration: "5 mins",
        summary: "Concentration measurement determining physical density and light attenuation properties.",
        formula: "Molarity (M) = moles of solute / Liters of solution",
        keyTakeaway: "Higher solute concentration alters the optical density of synthesized compound reagents.",
        resources: ["Laboratory Synthesis Manual: Spectrophotometry"],
        practiceDrill: {
          question: "What is the molarity when 2 moles of NaCl are dissolved in 0.5 Liters of water?",
          options: ["1.0 M", "2.0 M", "4.0 M", "0.25 M"],
          correct: 2,
          explanation: "Molarity M = moles / Liters = 2.0 mol / 0.5 L = 4.0 M."
        }
      }
    ]
  },
  cryptographer: {
    roleName: "The Cryptographer (Linguistics & Ciphers)",
    discipline: "Modular Arithmetic, Cryptanalysis & Radio Telemetry",
    icon: "Key",
    color: "#C084FC",
    coreConcepts: [
      {
        id: "crypto-caesar",
        title: "Caesar Shift & Modular Arithmetic (mod 26)",
        importance: "Critical",
        duration: "5 mins",
        summary: "Monoalphabetic substitution shifting letter values along a circular 26-character ring.",
        formula: "E(x) = (x + k) mod 26 | D(y) = (y - k) mod 26",
        keyTakeaway: "Shift wrapping: Z shifted by +1 wraps around modulo 26 to A.",
        resources: ["The Code Book by Simon Singh", "Khan Academy Cryptography: Ciphers"],
        practiceDrill: {
          question: "With a Caesar shift key of k = +3, what is the encrypted ciphertext for the word 'KEY'?",
          options: ["NHB", "MDZ", "LFA", "NHD"],
          correct: 0,
          explanation: "K(+3) → N, E(+3) → H, Y(+3) wraps around to B. 'KEY' becomes 'NHB'."
        }
      },
      {
        id: "crypto-vigenere",
        title: "Polyalphabetic Vigenère Tabula Recta",
        importance: "High",
        duration: "8 mins",
        summary: "Repeated keyword shifts producing multiple concurrent Caesar alphabets to foil frequency analysis.",
        formula: "Cᵢ = (Pᵢ + Kᵢ) mod 26",
        keyTakeaway: "Each character of the keyword sets the specific Caesar shift for the corresponding plaintext letter.",
        resources: ["Applied Cryptography: Polyalphabetic Ciphers"],
        practiceDrill: {
          question: "Why is the Vigenère cipher much more resistant to simple frequency analysis than a standard Caesar cipher?",
          options: [
            "It uses 1024-bit prime factorization",
            "The same plaintext letter encrypts to different ciphertext letters depending on keyword position",
            "It requires quantum supercomputers to decipher",
            "It automatically scrambles letter order"
          ],
          correct: 1,
          explanation: "Because the keyword shifts change for every position, letter frequencies are flattened across multiple alphabets."
        }
      },
      {
        id: "crypto-radio",
        title: "VHF Radio Carrier Tuning & Frequency Modulation",
        importance: "Medium",
        duration: "5 mins",
        summary: "Electromagnetic signal reception over Very High Frequency (30 MHz – 300 MHz) bands.",
        formula: "c = f · λ (Speed of Light = Frequency × Wavelength)",
        keyTakeaway: "Precise carrier frequency tuning eliminates white noise interference and phase jitter.",
        resources: ["RF Telecommunications Principles & Modulation Schemes"],
        practiceDrill: {
          question: "What is the wavelength of a 100 MHz radio wave (assuming c = 3.0 × 10⁸ m/s)?",
          options: ["3.0 meters", "30 meters", "0.3 meters", "300 meters"],
          correct: 0,
          explanation: "Wavelength λ = c / f = (3.0 × 10⁸ m/s) / (100 × 10⁶ Hz) = 3.0 meters."
        }
      }
    ]
  }
};

export function generateRemediationPlan(stageData, solvedRoles = {}, failsCount = 0) {
  const activeRoles = stageData?.selectedRoles
    ? Object.keys(stageData.selectedRoles).filter(k => stageData.selectedRoles[k])
    : ['hacker', 'engineer', 'scientist', 'cryptographer'];

  const failedRoles = activeRoles.filter(role => !solvedRoles[role]);
  const passedRoles = activeRoles.filter(role => !!solvedRoles[role]);

  const recommendedTopics = [];
  const focusRoles = failedRoles.length > 0 ? failedRoles : activeRoles;

  focusRoles.forEach(roleKey => {
    const roleGuide = roleTopicGuides[roleKey];
    if (roleGuide && roleGuide.coreConcepts) {
      roleGuide.coreConcepts.forEach(concept => {
        recommendedTopics.push({
          ...concept,
          roleKey,
          roleName: roleGuide.roleName,
          roleColor: roleGuide.color,
          discipline: roleGuide.discipline,
          isCriticalGap: failedRoles.includes(roleKey)
        });
      });
    }
  });

  const totalMinutes = recommendedTopics.reduce((acc, curr) => {
    const mins = parseInt(curr.duration) || 5;
    return acc + mins;
  }, 0);

  const milestones = [
    {
      step: 1,
      phase: "Diagnostic Gap Review",
      title: "Analyze Failed Chamber Gate Clues",
      desc: `Review the ${failedRoles.length || 1} compromised subsystem locks that triggered facility security alarms.`,
      status: "action_needed"
    },
    {
      step: 2,
      phase: "Fundamental Theory Labs",
      title: "Master Prerequisite STEM Formulas",
      desc: `Deep-dive into ${recommendedTopics.length} recommended topics across ${focusRoles.length} specialized disciplines.`,
      status: "ready"
    },
    {
      step: 3,
      phase: "Targeted Micro-Drills",
      title: "Interactive Knowledge Checks",
      desc: "Complete rapid-fire practice questions to verify conceptual mastery before re-entering the vault.",
      status: "pending"
    },
    {
      step: 4,
      phase: "Tactical Vault Re-Infiltration",
      title: "Re-Engage Mission with Tactical Hints",
      desc: "Execute the heist with enhanced confidence, coordinated timing, and formula overlays.",
      status: "locked"
    }
  ];

  return {
    stageTitle: stageData?.title || "STEM Extraction Operation",
    failedRoles,
    passedRoles,
    focusRoles,
    totalTopicsCount: recommendedTopics.length,
    estimatedStudyTime: `${totalMinutes} mins`,
    recommendedTopics,
    milestones,
    diagnosticSummary: failedRoles.length === 0
      ? "All role locks were technically addressed, but overall extraction timer expired before full interlock pipeline synchronization."
      : `Extraction failed because ${failedRoles.map(r => r.toUpperCase()).join(' & ')} chambers could not bypass security gates in time.`
  };
}
