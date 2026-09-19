// ============================================================
// V.A.U.L.T — Operative ID Card Customization Themes & Config
// ============================================================

export const CARD_THEMES = {
  EMERALD_SYNDICATE: {
    id: 'EMERALD_SYNDICATE',
    name: 'Emerald Syndicate',
    subtitle: 'Official V.A.U.L.T Standard Issue',
    primaryColor: '#10B981',
    accentColor: '#34D399',
    borderColor: 'rgba(16, 185, 129, 0.45)',
    bgGradient: 'from-[#031c12] via-[#02130c] to-[#010906]',
    holoGradient: 'linear-gradient(135deg, rgba(16,185,129,0.3) 0%, rgba(52,211,153,0.15) 30%, rgba(251,191,36,0.2) 60%, rgba(16,185,129,0.3) 100%)',
    chipColor: '#10B981',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    statGlow: 'rgba(16, 185, 129, 0.35)',
    previewSwatch: 'bg-gradient-to-br from-[#10B981] to-[#042F2E]'
  },
  CYBERPUNK_NEON: {
    id: 'CYBERPUNK_NEON',
    name: 'Cyberpunk Neon',
    subtitle: 'Night City Synthwave & High Voltage',
    primaryColor: '#F43F5E',
    accentColor: '#06B6D4',
    borderColor: 'rgba(244, 63, 94, 0.5)',
    bgGradient: 'from-[#1e0826] via-[#100419] to-[#08020d]',
    holoGradient: 'linear-gradient(135deg, rgba(244,63,94,0.3) 0%, rgba(6,182,212,0.3) 40%, rgba(168,85,247,0.35) 75%, rgba(244,63,94,0.3) 100%)',
    chipColor: '#06B6D4',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    statGlow: 'rgba(244, 63, 94, 0.4)',
    previewSwatch: 'bg-gradient-to-br from-[#F43F5E] via-[#A855F7] to-[#06B6D4]'
  },
  GOLD_OPERATIVE: {
    id: 'GOLD_OPERATIVE',
    name: 'Syndicate Gold',
    subtitle: 'High Roller Elite Classification',
    primaryColor: '#FBBF24',
    accentColor: '#FDE047',
    borderColor: 'rgba(251, 191, 36, 0.55)',
    bgGradient: 'from-[#221803] via-[#140e02] to-[#0a0701]',
    holoGradient: 'linear-gradient(135deg, rgba(251,191,36,0.35) 0%, rgba(245,158,11,0.2) 35%, rgba(254,240,138,0.35) 70%, rgba(251,191,36,0.35) 100%)',
    chipColor: '#FBBF24',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    statGlow: 'rgba(251, 191, 36, 0.45)',
    previewSwatch: 'bg-gradient-to-br from-[#FBBF24] via-[#D97706] to-[#451A03]'
  },
  VOID_OBSIDIAN: {
    id: 'VOID_OBSIDIAN',
    name: 'Void Obsidian',
    subtitle: 'Blackout Phantom & Zero Signature',
    primaryColor: '#A855F7',
    accentColor: '#C084FC',
    borderColor: 'rgba(168, 85, 247, 0.45)',
    bgGradient: 'from-[#12081f] via-[#090410] to-[#040108]',
    holoGradient: 'linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(99,102,241,0.25) 45%, rgba(192,132,252,0.3) 100%)',
    chipColor: '#C084FC',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    statGlow: 'rgba(168, 85, 247, 0.4)',
    previewSwatch: 'bg-gradient-to-br from-[#A855F7] via-[#4C1D95] to-[#0F172A]'
  },
  CRIMSON_ROGUE: {
    id: 'CRIMSON_ROGUE',
    name: 'Crimson Hazard',
    subtitle: 'High Threat Level Breach Unit',
    primaryColor: '#EF4444',
    accentColor: '#F97316',
    borderColor: 'rgba(239, 68, 68, 0.55)',
    bgGradient: 'from-[#230808] via-[#150404] to-[#090101]',
    holoGradient: 'linear-gradient(135deg, rgba(239,68,68,0.35) 0%, rgba(249,115,22,0.3) 40%, rgba(254,202,202,0.2) 75%, rgba(239,68,68,0.35) 100%)',
    chipColor: '#F97316',
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
    statGlow: 'rgba(239, 68, 68, 0.45)',
    previewSwatch: 'bg-gradient-to-br from-[#EF4444] via-[#B91C1C] to-[#1E1B4B]'
  },
  SOLAR_AEGIS: {
    id: 'SOLAR_AEGIS',
    name: 'Solar Aegis',
    subtitle: 'Sub-Orbital Laser Grid Specialist',
    primaryColor: '#0EA5E9',
    accentColor: '#38BDF8',
    borderColor: 'rgba(14, 165, 233, 0.5)',
    bgGradient: 'from-[#061828] via-[#030d17] to-[#01060c]',
    holoGradient: 'linear-gradient(135deg, rgba(14,165,233,0.35) 0%, rgba(56,189,248,0.25) 45%, rgba(165,243,252,0.3) 100%)',
    chipColor: '#38BDF8',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    statGlow: 'rgba(14, 165, 233, 0.4)',
    previewSwatch: 'bg-gradient-to-br from-[#0EA5E9] via-[#0369A1] to-[#022c22]'
  }
};

export const FRAME_STYLES = {
  holographic: {
    id: 'holographic',
    name: 'Holographic Foil',
    description: 'Dynamic prismatic shimmer finish with security micro-reflections'
  },
  carbon: {
    id: 'carbon',
    name: 'Carbon Matrix',
    description: 'Ultra-light carbon weave with cybernetic corner brackets'
  },
  circuit: {
    id: 'circuit',
    name: 'Circuit Grid',
    description: 'Integrated neural-link printed circuit tracks'
  },
  stealth: {
    id: 'stealth',
    name: 'Stealth Matte',
    description: 'Minimalist tactical dark glass for zero electromagnetic signature'
  }
};

export const PRESET_MOTTOS = [
  'Apex Infiltrator // Zero Trace',
  'Mastermind Locksmith of Sector 7',
  'Never Leave a Partner Behind',
  'Ghost Protocol Active',
  'Silent Infiltration Specialist',
  'Keymaster of the Syndicate',
  'Laser Grid Dancer',
  'Clutch Operator Under Pressure'
];

export const AVAILABLE_SHOWCASE_MEDALS = [
  { id: 'mvp_award', title: 'Operation MVP', icon: 'Trophy', tier: 'GOLD', desc: 'Awarded for supreme MVP performance in syndicate heists.' },
  { id: 'first_breach', title: 'First Infiltration', icon: 'CheckCircle2', tier: 'BRONZE', desc: 'Successfully breached and cleared an operation.' },
  { id: 'speed_demon', title: 'Sub-Zero Velocity', icon: 'Clock', tier: 'SILVER', desc: 'Completed a heist operation in record sub-2-minute speed.' },
  { id: 'apex_loyalty', title: 'Syndicate Vanguard', icon: 'Shield', tier: 'PLATINUM', desc: 'Maintains elite 1,000 Loyalty Point standing with squad.' },
  { id: 'ghost_protocol', title: 'Ghost Protocol', icon: 'Sparkles', tier: 'GOLD', desc: 'Cracked secure vaults with zero alarms or triggers tripped.' },
  { id: 'neural_hacker', title: 'Cybernetic Breaker', icon: 'Terminal', tier: 'PLATINUM', desc: 'Mastery of advanced terminal cryptography and relays.' },
  { id: 'clutch_save', title: 'Clutch Specialist', icon: 'Zap', tier: 'GOLD', desc: 'Saved squad extraction with under 10 seconds on clock.' }
];

export const DEFAULT_CARD_CONFIG = {
  theme: 'EMERALD_SYNDICATE',
  frameStyle: 'holographic',
  motto: 'Apex Infiltrator // Zero Trace',
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
      ...user.cardConfig
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
          ...map[key]
        };
      }
    }
  } catch (e) {
    // Ignore storage parse errors
  }

  // 3. Fallback: choose thematic defaults based on operative role
  let theme = 'EMERALD_SYNDICATE';
  const role = (user.role || '').toLowerCase();
  if (role.includes('hacker')) theme = 'CYBERPUNK_NEON';
  else if (role.includes('demolition') || role.includes('combat')) theme = 'CRIMSON_ROGUE';
  else if (role.includes('infiltrator') || role.includes('ghost')) theme = 'VOID_OBSIDIAN';
  else if (role.includes('engineer')) theme = 'SOLAR_AEGIS';
  else if ((user.level || 1) >= 5) theme = 'GOLD_OPERATIVE';

  return {
    ...DEFAULT_CARD_CONFIG,
    theme,
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
