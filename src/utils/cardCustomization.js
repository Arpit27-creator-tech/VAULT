// ============================================================
// V.A.U.L.T — Operative ID Card Customization & Themes
// Perfectly tailored to V.A.U.L.T's Deep Forest / Emerald / Amber aesthetic
// ============================================================

export const CARD_THEMES = {
  PRISON_INMATE: {
    id: 'PRISON_INMATE',
    name: 'Cell Block 9 Inmate Pass',
    subtitle: 'V.A.U.L.T Forest Clearance & Max Security Pass',
    primaryColor: '#10B981',
    accentColor: '#FBBF24',
    goldColor: '#CA8A04',
    borderColor: '#10B981',
    bgGradient: 'from-[#072418] via-[#051C12] to-[#020C07]',
    chipColor: '#10B981',
    badgeBg: 'bg-[#10B981] text-[#020C07] border-[#059669]',
    holoGradient: 'none',
    statGlow: 'none',
    previewSwatch: 'bg-[#10B981]',
    isPrison: true
  }
};

export const FRAME_STYLES = {
  prisonBars: {
    id: 'prisonBars',
    name: 'Prison Cell Bars & Hazard',
    description: 'Reinforced prison steel bars, diagonal hazard caution stripes, and booking plate'
  }
};

export const PRESET_MOTTOS = [
  'Apex Infiltrator // Zero Trace',
  'Cell Block 9 Mastermind // High Flight Risk',
  'Maximum Security Escapee',
  'Guilty as Charged // No Prison Can Hold Me',
  'Never Leave a Partner Behind',
  'Keymaster of the Canopy Vault',
  'Ghost of the Syndicate',
  'Solitary Confinement Survivor',
  'Laser Grid Specialist',
  'Mastermind Locksmith'
];

export const AVAILABLE_SHOWCASE_MEDALS = [
  { id: 'vault_cracker', title: 'Vault Cracker', emoji: '🗝️', tier: 'LEGENDARY', desc: 'Open a Tier 5 vault without tripping a single alarm.' },
  { id: 'ghost_protocol', title: 'Ghost Protocol', emoji: '👻', tier: 'EPIC', desc: 'Finish heists without being spotted with zero alarms tripped.' },
  { id: 'squad_anchor', title: 'Squad Anchor', emoji: '⚓', tier: 'RARE', desc: 'Finish 25 runs with the same squad.' },
  { id: 'speed_demon', title: 'Sub-Zero Velocity', emoji: '⏱️', tier: 'RARE', desc: 'Completed a heist operation in record sub-2-minute speed.' },
  { id: 'quantum_heist', title: 'Quantum Heist', emoji: '⚡', tier: 'LEGENDARY', desc: 'Complete an operation in under 60 seconds.' },
  { id: 'mvp_award', title: 'Operation MVP', emoji: '🏆', tier: 'EPIC', desc: 'Awarded for supreme MVP performance in syndicate heists.' },
  { id: 'first_breach', title: 'First Infiltration', emoji: '🗝️', tier: 'RARE', desc: 'Successfully breached and cracked an operation chamber.' },
  { id: 'apex_loyalty', title: 'Squad Vanguard', emoji: '🛡️', tier: 'LEGENDARY', desc: 'Maintains elite 1,000 Loyalty Point standing with squad.' }
];

export const DEFAULT_CARD_CONFIG = {
  theme: 'DEFAULT',
  motto: 'FIELD OPERATIVE',
  showcasedMedals: ['vault_cracker', 'ghost_protocol', 'squad_anchor']
};

/**
 * Retrieve or compute the card configuration for an operative.
 */
export function getOperativeCardConfig(user) {
  if (!user) return DEFAULT_CARD_CONFIG;

  // 1. Check embedded cardConfig in user object
  if (user.cardConfig && typeof user.cardConfig === 'object') {
    return {
      ...DEFAULT_CARD_CONFIG,
      ...user.cardConfig,
      theme: 'PRISON_INMATE',
      frameStyle: 'prisonBars'
    };
  }

  // 2. Check localStorage cache for saved agent card customizations
  try {
    const raw = localStorage.getItem('vault_card_customizations');
    if (raw) {
      const map = JSON.parse(raw);
      const key = user.agentId || user.id || user.callsign;
      if (key && map[key]) {
        return {
          ...DEFAULT_CARD_CONFIG,
          ...map[key],
          theme: 'PRISON_INMATE',
          frameStyle: 'prisonBars'
        };
      }
    }
  } catch (e) {
    // Ignore parse errors
  }

  return {
    ...DEFAULT_CARD_CONFIG,
    theme: 'PRISON_INMATE',
    frameStyle: 'prisonBars',
    motto: user.rank ? `Rank: ${user.rank}` : DEFAULT_CARD_CONFIG.motto
  };
}

/**
 * Save user card configuration locally and dispatch update event.
 */
export function saveOperativeCardConfig(user, config) {
  if (!user) return;
  const merged = { ...DEFAULT_CARD_CONFIG, ...config };

  // Update in localStorage cache
  try {
    const raw = localStorage.getItem('vault_card_customizations') || '{}';
    const map = JSON.parse(raw);
    const key = user.agentId || user.id || user.callsign;
    if (key) {
      map[key] = merged;
      localStorage.setItem('vault_card_customizations', JSON.stringify(map));
    }

    // Also update currentUser in localStorage if applicable
    const curRaw = localStorage.getItem('vault_current_user');
    if (curRaw) {
      const curUser = JSON.parse(curRaw);
      curUser.cardConfig = merged;
      localStorage.setItem('vault_current_user', JSON.stringify(curUser));
    }
  } catch (e) {
    console.error('[CARD CONFIG] Error persisting card settings:', e);
  }

  try {
    window.dispatchEvent(new CustomEvent('vault:user-updated', { detail: { cardConfig: merged } }));
    window.dispatchEvent(new CustomEvent('vault:card-updated', { detail: { userId: user.id, cardConfig: merged } }));
  } catch (e) {}

  return merged;
}
