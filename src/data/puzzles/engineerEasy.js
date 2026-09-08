// ═══════════════════════════════════════════════════════════════════════
// ENGINEER — EASY DIFFICULTY
// Concepts: Simple angle matching, basic geometry, straightforward mirrors
// ═══════════════════════════════════════════════════════════════════════

export const ENGINEER_EASY = [
  {
    role: "engineer",
    difficulty: "easy",
    title: "Basic Mirror Alignment",
    discipline: "Geometry — Angle Setting",
    prompt: "Align the single deflector mirror to exactly 45° to redirect the laser beam into the photo-sensor.",
    requiredAngleA: 45,
    requiredAngleB: 135,
    sensorTargetX: 80,
    sensorTargetY: 50,
    clueRevealed: "Mirror Aligned at 45°: Laser Lock Confirmed"
  },
  {
    role: "engineer",
    difficulty: "easy",
    title: "Right-Angle Reflector",
    discipline: "Geometry — Perpendicular Lines",
    prompt: "Set Mirror A to 90° and Mirror B to 90° to create a perpendicular reflection corridor.",
    requiredAngleA: 90,
    requiredAngleB: 90,
    sensorTargetX: 50,
    sensorTargetY: 50,
    clueRevealed: "Perpendicular Corridor Established: Beam Straight-Line Verified"
  },
  {
    role: "engineer",
    difficulty: "easy",
    title: "Quarter-Turn Deflector",
    discipline: "Geometry — Basic Angles",
    prompt: "Rotate Mirror A to 30° and Mirror B to 150° — the standard perimeter bypass angle pair.",
    requiredAngleA: 30,
    requiredAngleB: 150,
    sensorTargetX: 70,
    sensorTargetY: 60,
    clueRevealed: "Quarter-Turn Bypass Active: Perimeter Sensor Overridden"
  },
  {
    role: "engineer",
    difficulty: "easy",
    title: "Emergency Straight Beam",
    discipline: "Geometry — Zero Deflection",
    prompt: "Under emergency protocol, set both mirrors to 0° for a direct undeflected beam to the sensor.",
    requiredAngleA: 0,
    requiredAngleB: 180,
    sensorTargetX: 95,
    sensorTargetY: 50,
    clueRevealed: "Emergency Protocol Active: Direct Beam Established"
  },
  {
    role: "engineer",
    difficulty: "easy",
    title: "Symmetric Split Alignment",
    discipline: "Geometry — Symmetry",
    prompt: "Create a symmetric deflection by setting Mirror A to 60° and Mirror B to 120°.",
    requiredAngleA: 60,
    requiredAngleB: 120,
    sensorTargetX: 85,
    sensorTargetY: 35,
    clueRevealed: "Symmetric Split Achieved: Dual Beam Coverage Active"
  },
  {
    role: "engineer",
    difficulty: "easy",
    title: "Shallow Angle Entry",
    discipline: "Geometry — Acute Angles",
    prompt: "The ventilation duct requires a shallow laser entry — set Mirror A to 15° and Mirror B to 165°.",
    requiredAngleA: 15,
    requiredAngleB: 165,
    sensorTargetX: 90,
    sensorTargetY: 70,
    clueRevealed: "Shallow Entry Achieved: Ventilation Duct Laser Threaded"
  },
  {
    role: "engineer",
    difficulty: "easy",
    title: "Standard Security Bypass",
    discipline: "Geometry — Complementary Angles",
    prompt: "Standard security bypass requires complementary angles: Mirror A at 35° and Mirror B at 145°.",
    requiredAngleA: 35,
    requiredAngleB: 145,
    sensorTargetX: 75,
    sensorTargetY: 45,
    clueRevealed: "Standard Bypass Engaged: Security Grid Neutralized"
  },
  {
    role: "engineer",
    difficulty: "easy",
    title: "Diagonal Corridor Sweep",
    discipline: "Geometry — 45° Increments",
    prompt: "Set up a diagonal corridor sweep with Mirror A at 45° and Mirror B at 45° for maximum coverage.",
    requiredAngleA: 45,
    requiredAngleB: 45,
    sensorTargetX: 60,
    sensorTargetY: 40,
    clueRevealed: "Diagonal Sweep Complete: Full Corridor Mapped"
  }
];
