import { heistStages } from './heistPuzzles';
import { EXTRA_HACKER_PUZZLES } from './extraHackerPuzzles';

import { HACKER_EASY } from './puzzles/hackerEasy';
import { HACKER_MEDIUM } from './puzzles/hackerMedium';
import { HACKER_HARD } from './puzzles/hackerHard';
import { HACKER_EXTREME } from './puzzles/hackerExtreme';

import { ENGINEER_EASY } from './puzzles/engineerEasy';
import { ENGINEER_MEDIUM } from './puzzles/engineerMedium';
import { ENGINEER_HARD } from './puzzles/engineerHard';
import { ENGINEER_EXTREME } from './puzzles/engineerExtreme';

import { SCIENTIST_EASY } from './puzzles/scientistEasy';
import { SCIENTIST_MEDIUM } from './puzzles/scientistMedium';
import { SCIENTIST_HARD } from './puzzles/scientistHard';
import { SCIENTIST_EXTREME } from './puzzles/scientistExtreme';

import { CRYPTOGRAPHER_EASY } from './puzzles/cryptographerEasy';
import { CRYPTOGRAPHER_MEDIUM } from './puzzles/cryptographerMedium';
import { CRYPTOGRAPHER_HARD } from './puzzles/cryptographerHard';
import { CRYPTOGRAPHER_EXTREME } from './puzzles/cryptographerExtreme';

// 4 Difficulty tiers across 4 roles (16 puzzle files)
export const TIERED_PUZZLE_POOL = {
  hacker: {
    easy: HACKER_EASY,
    medium: HACKER_MEDIUM,
    hard: HACKER_HARD,
    extreme: HACKER_EXTREME
  },
  engineer: {
    easy: ENGINEER_EASY,
    medium: ENGINEER_MEDIUM,
    hard: ENGINEER_HARD,
    extreme: ENGINEER_EXTREME
  },
  scientist: {
    easy: SCIENTIST_EASY,
    medium: SCIENTIST_MEDIUM,
    hard: SCIENTIST_HARD,
    extreme: SCIENTIST_EXTREME
  },
  cryptographer: {
    easy: CRYPTOGRAPHER_EASY,
    medium: CRYPTOGRAPHER_MEDIUM,
    hard: CRYPTOGRAPHER_HARD,
    extreme: CRYPTOGRAPHER_EXTREME
  }
};

// Flat pool containing all variants by role for full backward compatibility
export const PUZZLE_POOL = heistStages.reduce((pool, stage) => {
  Object.entries(stage.puzzles || {}).forEach(([role, puzzle]) => {
    if (!pool[role]) pool[role] = [];
    pool[role].push(puzzle);
  });
  return pool;
}, { scientist: [], engineer: [], hacker: [], cryptographer: [] });

// Append extra and tiered puzzles into flat pool
PUZZLE_POOL.hacker = [
  ...PUZZLE_POOL.hacker,
  ...EXTRA_HACKER_PUZZLES,
  ...HACKER_EASY,
  ...HACKER_MEDIUM,
  ...HACKER_HARD,
  ...HACKER_EXTREME
];

PUZZLE_POOL.engineer = [
  ...PUZZLE_POOL.engineer,
  ...ENGINEER_EASY,
  ...ENGINEER_MEDIUM,
  ...ENGINEER_HARD,
  ...ENGINEER_EXTREME
];

PUZZLE_POOL.scientist = [
  ...PUZZLE_POOL.scientist,
  ...SCIENTIST_EASY,
  ...SCIENTIST_MEDIUM,
  ...SCIENTIST_HARD,
  ...SCIENTIST_EXTREME
];

PUZZLE_POOL.cryptographer = [
  ...PUZZLE_POOL.cryptographer,
  ...CRYPTOGRAPHER_EASY,
  ...CRYPTOGRAPHER_MEDIUM,
  ...CRYPTOGRAPHER_HARD,
  ...CRYPTOGRAPHER_EXTREME
];

/**
 * Deterministic string hash → index
 */
function seededIndex(seedStr, length) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  return length > 0 ? hash % length : 0;
}

/**
 * Returns one deterministically selected puzzle per role for room + stage + attempt,
 * respecting difficulty tier (easy, medium, hard, extreme).
 *
 * If difficulty is not specified or 'auto', it maps based on stage:
 *   Stage 0 (Perimeter) -> easy
 *   Stage 1 (Core)      -> medium
 *   Stage 2 (Vault)     -> hard
 *   Stage 3+            -> extreme
 */
export function getPuzzleSetForHeist(roomCode, stageIdx, attemptSeed = '', difficulty = 'auto') {
  const roles = ['scientist', 'engineer', 'hacker', 'cryptographer'];
  const result = {};

  let effectiveDifficulty = difficulty;
  if (effectiveDifficulty === 'auto' || !effectiveDifficulty) {
    if (stageIdx === 0) effectiveDifficulty = 'easy';
    else if (stageIdx === 1) effectiveDifficulty = 'medium';
    else if (stageIdx === 2) effectiveDifficulty = 'hard';
    else effectiveDifficulty = 'extreme';
  }

  roles.forEach(role => {
    const tieredList = TIERED_PUZZLE_POOL[role]?.[effectiveDifficulty];
    const pool = tieredList && tieredList.length > 0 ? tieredList : (PUZZLE_POOL[role] || []);
    if (pool.length === 0) return;
    const seed = `${roomCode || 'solo'}:${stageIdx}:${attemptSeed}:${role}:${effectiveDifficulty}`;
    const idx = seededIndex(seed, pool.length);
    result[role] = pool[idx];
  });

  return result;
}
