import { heistStages } from './heistPuzzles';

// Pool every existing, already-tested puzzle variant by role, drawn from
// all stages. This gives real variety without inventing new puzzle logic
// that would need separate validation against each puzzle panel.
export const PUZZLE_POOL = heistStages.reduce((pool, stage) => {
  Object.entries(stage.puzzles || {}).forEach(([role, puzzle]) => {
    if (!pool[role]) pool[role] = [];
    pool[role].push(puzzle);
  });
  return pool;
}, { scientist: [], engineer: [], hacker: [], cryptographer: [] });

/**
 * Deterministic string hash → index, so every client in the same room
 * computes the identical "random" pick without any data needing to be
 * transmitted over the socket. Same roomCode + stageIdx + role always
 * yields the same pick; different rooms/stages/roles yield different picks.
 */
function seededIndex(seedStr, length) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  return length > 0 ? hash % length : 0;
}

/**
 * Returns one randomly (but deterministically) selected puzzle per role
 * for this room + stage + attempt combination. Every player's client
 * calling this with the same arguments gets an identical result.
 *
 * `attemptSeed` should change between separate heist launches in the same
 * lobby (e.g. a counter, or Date.now() from the launch event) so replaying
 * the same room/stage doesn't always surface the same puzzles.
 */
export function getPuzzleSetForHeist(roomCode, stageIdx, attemptSeed = '') {
  const roles = ['scientist', 'engineer', 'hacker', 'cryptographer'];
  const result = {};
  roles.forEach(role => {
    const pool = PUZZLE_POOL[role] && PUZZLE_POOL[role].length > 0 ? PUZZLE_POOL[role] : [];
    if (pool.length === 0) return;
    const seed = `${roomCode || 'solo'}:${stageIdx}:${attemptSeed}:${role}`;
    const idx = seededIndex(seed, pool.length);
    result[role] = pool[idx];
  });
  return result;
}
