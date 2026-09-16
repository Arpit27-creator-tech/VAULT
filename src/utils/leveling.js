// Leveling formula: level 1→2 requires 1000 XP, and each subsequent level
// requires 20% more XP than the previous one (1000, 1200, 1440, 1728, ...).
// This mirrors server/utils/leveling.js on the server — keep both in sync if
// this formula ever changes.

const BASE_XP = 1000;
const GROWTH = 1.2;

/**
 * Given a user's total lifetime XP, returns their current level.
 * Uses an iterative walk rather than a closed-form log formula to avoid
 * floating-point edge cases that could cause off-by-one level bugs.
 */
export function calculateLevel(xp) {
  let level = 1;
  let requirement = BASE_XP;
  let remaining = Math.max(0, xp || 0);

  while (remaining >= requirement) {
    remaining -= requirement;
    level += 1;
    requirement = Math.round(requirement * GROWTH);
  }

  return level;
}

/**
 * Given total lifetime XP, returns the current level plus progress detail
 * toward the next level (how much XP into the current level, and how much
 * the current level requires in total).
 */
export function getLevelProgress(xp) {
  let level = 1;
  let requirement = BASE_XP;
  let remaining = Math.max(0, xp || 0);

  while (remaining >= requirement) {
    remaining -= requirement;
    level += 1;
    requirement = Math.round(requirement * GROWTH);
  }

  return {
    level,
    xpIntoLevel: remaining,
    xpForNextLevel: requirement,
    progress: requirement > 0 ? remaining / requirement : 0
  };
}
