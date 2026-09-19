/**
 * Loyalty Points System
 * 
 * Players earn LP for staying committed to their squads and lose LP for deserting.
 * LP persists in localStorage and is synced to the user object.
 */

export const LOYALTY_RANKS = [
  {
    name: 'Rogue',
    min: 0,
    max: 99,
    emoji: '💀',
    color: '#6B7280',
    glowColor: 'rgba(107,114,128,0.4)',
    description: 'Untested. No squad loyalty established.',
    border: '#374151',
  },
  {
    name: 'Recruit',
    min: 100,
    max: 249,
    emoji: '🪖',
    color: '#78716C',
    glowColor: 'rgba(120,113,108,0.4)',
    description: 'Beginning to show squad commitment.',
    border: '#57534E',
  },
  {
    name: 'Operative',
    min: 250,
    max: 499,
    emoji: '🎯',
    color: '#10B981',
    glowColor: 'rgba(16,185,129,0.4)',
    description: 'Reliable squad member. Shows up when it counts.',
    border: '#059669',
  },
  {
    name: 'Ranger',
    min: 500,
    max: 999,
    emoji: '🌲',
    color: '#22C55E',
    glowColor: 'rgba(34,197,94,0.4)',
    description: 'Seasoned operative. Squad trusts you with their lives.',
    border: '#16A34A',
  },
  {
    name: 'Syndicate',
    min: 1000,
    max: 2499,
    emoji: '🔱',
    color: '#F59E0B',
    glowColor: 'rgba(245,158,11,0.5)',
    description: 'Elite-tier loyalty. A cornerstone of every operation.',
    border: '#D97706',
  },
  {
    name: 'Phantom',
    min: 2500,
    max: Infinity,
    emoji: '👻',
    color: '#C084FC',
    glowColor: 'rgba(192,132,252,0.5)',
    description: 'Legendary fidelity. Never deserts. Never flinches.',
    border: '#A855F7',
  },
];

/** LP gain/loss amounts */
export const LP_EVENTS = {
  JOIN_SQUAD: { amount: 10, label: 'Joined a squad', icon: '🤝' },
  COMPLETE_HEIST: { amount: 50, label: 'Completed heist with squad', icon: '✅' },
  WIN_HEIST: { amount: 100, label: 'Won heist with squad', icon: '🏆' },
  SQUAD_STREAK_5: { amount: 200, label: 'Completed 5 heists same squad', icon: '🔥' },
  LEAVE_LOBBY: { amount: -25, label: 'Abandoned squad lobby', icon: '⚠️' },
  LEAVE_MID_HEIST: { amount: -150, label: 'Deserted mid-heist (BETRAYAL)', icon: '💀' },
  DISCONNECT_MID: { amount: -100, label: 'Disconnected during active heist', icon: '🔌' },
};

const STORAGE_KEY = 'vault_loyalty_points';
const LOG_KEY = 'vault_loyalty_log';
const MAX_LOG_ENTRIES = 20;

/** Get current LP from localStorage */
export function getLoyaltyPoints() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const val = raw !== null ? parseInt(raw, 10) : 0;
    return isNaN(val) ? 0 : Math.max(0, val);
  } catch {
    return 0;
  }
}

/** Set LP in localStorage */
export function setLoyaltyPoints(amount) {
  const clamped = Math.max(0, Math.round(amount));
  try {
    localStorage.setItem(STORAGE_KEY, String(clamped));
  } catch {}
  return clamped;
}

/** Get the LP change log */
export function getLoyaltyLog() {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Apply an LP event — returns { newPoints, delta, rank } */
export function applyLoyaltyEvent(eventKey, overrideLabel) {
  const event = LP_EVENTS[eventKey];
  if (!event) return null;

  const current = getLoyaltyPoints();
  const delta = event.amount;
  const newPoints = Math.max(0, current + delta);
  setLoyaltyPoints(newPoints);

  // Append to log
  const log = getLoyaltyLog();
  const entry = {
    id: Date.now(),
    icon: event.icon,
    label: overrideLabel || event.label,
    delta,
    total: newPoints,
    ts: new Date().toISOString(),
  };
  const updated = [entry, ...log].slice(0, MAX_LOG_ENTRIES);
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(updated));
  } catch {}

  return {
    newPoints,
    delta,
    rank: getLoyaltyRank(newPoints),
    previousRank: getLoyaltyRank(current),
    entry,
  };
}

/** Initialize LP for a user from their stored profile (merge localStorage + user object) */
export function initLoyaltyFromUser(user) {
  if (!user) return getLoyaltyPoints();
  // If user object has loyaltyPoints, use the higher of the two (be generous)
  const stored = getLoyaltyPoints();
  const fromUser = typeof user.loyaltyPoints === 'number' ? user.loyaltyPoints : 0;
  const merged = Math.max(stored, fromUser);
  setLoyaltyPoints(merged);
  return merged;
}

/** Get the rank object for a given LP value */
export function getLoyaltyRank(lp) {
  for (let i = LOYALTY_RANKS.length - 1; i >= 0; i--) {
    if (lp >= LOYALTY_RANKS[i].min) return LOYALTY_RANKS[i];
  }
  return LOYALTY_RANKS[0];
}

/** Get progress (0-1) within current rank toward next rank */
export function getLoyaltyProgress(lp) {
  const rank = getLoyaltyRank(lp);
  if (rank.max === Infinity) return 1; // max rank
  const rangeSize = rank.max - rank.min + 1;
  const progress = (lp - rank.min) / rangeSize;
  return Math.min(1, Math.max(0, progress));
}
