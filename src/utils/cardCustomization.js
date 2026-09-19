// ============================================================
// V.A.U.L.T — Operative ID Card Customization & Themes
// Perfectly tailored to V.A.U.L.T's Deep Forest / Emerald / Amber aesthetic
// ============================================================

export const CARD_THEMES = {
  PRISON_INMATE: {
    id: 'PRISON_INMATE',
    name: 'Cell Block 9 Inmate Pass',
    subtitle: 'Max Security Penitentiary Pass & Hazard Stripes',
    primaryColor: '#EA580C',
    accentColor: '#D97706',
    goldColor: '#CA8A04',
    borderColor: '#EA580C',
    bgGradient: 'from-[#18181B] via-[#09090B] to-[#000000]',
    chipColor: '#EA580C',
    badgeBg: 'bg-[#EA580C] text-black border-[#C2410C]',
    holoGradient: 'none',
    statGlow: 'none',
    previewSwatch: 'bg-[#EA580C]',
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
  { id: 'mvp_award', title: 'Operation MVP', icon: 'Trophy', tier: 'GOLD', desc: 'Awarded for supreme MVP performance in syndicate heists.' },
  { id: 'first_breach', title: 'First Infiltration', icon: 'CheckCircle2', tier: 'BRONZE', desc: 'Successfully breached and cracked an operation chamber.' },
  { id: 'speed_demon', title: 'Sub-Zero Velocity', icon: 'Clock', tier: 'SILVER', desc: 'Completed a heist operation in record sub-2-minute speed.' },
  { id: 'apex_loyalty', title: 'Squad Vanguard', icon: 'Shield', tier: 'PLATINUM', desc: 'Maintains elite 1,000 Loyalty Point standing with squad.' },
  { id: 'ghost_protocol', title: 'Ghost Protocol', icon: 'Sparkles', tier: 'GOLD', desc: 'Cracked secure vaults with zero alarms or triggers tripped.' },
  { id: 'neural_hacker', title: 'Cybernetic Breaker', icon: 'Terminal', tier: 'PLATINUM', desc: 'Mastery of advanced terminal cryptography and relays.' },
  { id: 'clutch_save', title: 'Clutch Specialist', icon: 'Zap', tier: 'GOLD', desc: 'Saved squad extraction with under 10 seconds on clock.' }
];

export const DEFAULT_CARD_CONFIG = {
  theme: 'PRISON_INMATE',
  frameStyle: 'prisonBars',
  motto: 'Cell Block 9 Mastermind // High Flight Risk',
  showcasedMedals: ['mvp_award', 'speed_demon', 'apex_loyalty'],
  hologramShimmer: true,
  showBarcode: true
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
