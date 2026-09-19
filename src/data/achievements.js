import { 
  Trophy, Award, Zap, Shield, Sparkles, Flame, Clock, 
  Users, BookOpen, Crown, Star, Target, Terminal, Compass, 
  FlaskConical, Key, CheckCircle2
} from 'lucide-react';

export const ACHIEVEMENT_TIERS = {
  BRONZE: {
    label: 'Bronze',
    color: '#CD7F32',
    border: 'border-[#CD7F32]/50',
    bg: 'bg-[#CD7F32]/15',
    glow: 'rgba(205, 127, 50, 0.4)'
  },
  SILVER: {
    label: 'Silver',
    color: '#E0E7FF',
    border: 'border-slate-300/50',
    bg: 'bg-slate-300/15',
    glow: 'rgba(224, 231, 255, 0.4)'
  },
  GOLD: {
    label: 'Gold',
    color: '#FBBF24',
    border: 'border-[#FBBF24]/60',
    bg: 'bg-[#FBBF24]/20',
    glow: 'rgba(251, 191, 36, 0.5)'
  },
  PLATINUM: {
    label: 'Platinum',
    color: '#34D399',
    border: 'border-[#10B981]/60',
    bg: 'bg-[#10B981]/20',
    glow: 'rgba(52, 211, 153, 0.6)'
  }
};

export const ACHIEVEMENTS = [
  // ─── Tactical Speed ──────────────────────────────────────────────────────────
  {
    id: 'first_breach',
    title: 'First Infiltration',
    description: 'Complete your first heist operation successfully.',
    tier: 'BRONZE',
    category: 'speed',
    xpReward: 250,
    icon: CheckCircle2,
    hint: 'Successfully complete any heist stage with your squad or solo.'
  },
  {
    id: 'speed_demon',
    title: 'Sub-Zero Velocity',
    description: 'Complete any heist operation in under 120 seconds.',
    tier: 'SILVER',
    category: 'speed',
    xpReward: 500,
    icon: Clock,
    hint: 'Coordinate fast relays to solve all 4 security chambers under 2 minutes.'
  },
  {
    id: 'quantum_heist',
    title: 'Quantum Heist',
    description: 'Complete an operation in under 60 seconds with total team synchronization.',
    tier: 'PLATINUM',
    category: 'speed',
    xpReward: 1000,
    icon: Flame,
    hint: 'Legendary speed: crack the entire vault in 60 seconds or less.'
  },

  // ─── Academic & Role Mastery ────────────────────────────────────────────────
  {
    id: 'hacker_elite',
    title: 'Ghost in the Kernel',
    description: 'Bypass a Hacker terminal firewall with 100% test case pass rate.',
    tier: 'BRONZE',
    category: 'mastery',
    xpReward: 350,
    icon: Terminal,
    hint: 'Write clean code in the Hacker Terminal to pass all test cases without failing.'
  },
  {
    id: 'photon_surgeon',
    title: 'Diffraction Master',
    description: 'Align the Engineer laser optics using Snell\'s law on first lock-in.',
    tier: 'BRONZE',
    category: 'mastery',
    xpReward: 350,
    icon: Compass,
    hint: 'Calculate mirror angles accurately to hit the photodetector target directly.'
  },
  {
    id: 'alchemical_synthesis',
    title: 'Perfect Stoichiometry',
    description: 'Neutralize the Scientist chemical lock to the exact required pH.',
    tier: 'BRONZE',
    category: 'mastery',
    xpReward: 350,
    icon: FlaskConical,
    hint: 'Balance chemical reagents in the Scientist Lab to match target buffer pH.'
  },
  {
    id: 'cipher_whisperer',
    title: 'The Cipher Whisperer',
    description: 'Decipher the Cryptographer frequency shift without requesting hints.',
    tier: 'BRONZE',
    category: 'mastery',
    xpReward: 350,
    icon: Key,
    hint: 'Crack the Caesar / VHF radio frequency cipher in the Cryptographer Deck.'
  },
  {
    id: 'quad_discipline',
    title: 'Renaissance Operative',
    description: 'Successfully solve puzzles across all 4 specialist disciplines.',
    tier: 'GOLD',
    category: 'mastery',
    xpReward: 750,
    icon: Sparkles,
    hint: 'Play or train as Hacker, Engineer, Scientist, and Cryptographer.'
  },

  // ─── Squad & Coordination ───────────────────────────────────────────────────
  {
    id: 'perfect_sync',
    title: 'Flawless Execution',
    description: 'Clear an entire heist stage with 0 security alarms tripped.',
    tier: 'GOLD',
    category: 'squad',
    xpReward: 600,
    icon: Shield,
    hint: 'Complete all role puzzles with zero failed submission attempts.'
  },
  {
    id: 'squad_cell',
    title: 'Syndicate Cell',
    description: 'Create or join a tactical syndicate team in your operative profile.',
    tier: 'BRONZE',
    category: 'squad',
    xpReward: 250,
    icon: Users,
    hint: 'Found a squad team or join an existing crew in the Dossier.'
  },
  {
    id: 'comms_discipline',
    title: 'Comms Discipline',
    description: 'Dispatch tactical telemetry transmissions over the syndicate radio.',
    tier: 'BRONZE',
    category: 'squad',
    xpReward: 200,
    icon: Zap,
    hint: 'Use the Radio Comms or telemetry broadcast to coordinate with teammates.'
  },
  {
    id: 'coop_veteran',
    title: 'Squad Commander',
    description: 'Assemble a squad in the live lobby and launch a live multiplayer heist.',
    tier: 'SILVER',
    category: 'squad',
    xpReward: 500,
    icon: Trophy,
    hint: 'Host or join a multi-operative lobby and launch an operation.'
  },

  // ─── Progression & Architecture ─────────────────────────────────────────────
  {
    id: 'canopy_ranger',
    title: 'Canopy Ranger',
    description: 'Advance your operative rank to Syndicate Level 2.',
    tier: 'BRONZE',
    category: 'progression',
    xpReward: 200,
    icon: Star,
    hint: 'Earn XP by completing heists to level up.'
  },
  {
    id: 'syndicate_officer',
    title: 'Operative Tier Elite',
    description: 'Reach Syndicate Level 5 through persistent operational success.',
    tier: 'GOLD',
    category: 'progression',
    xpReward: 800,
    icon: Crown,
    hint: 'Amass syndicate XP across operations to reach Level 5.'
  },
  {
    id: 'architect_blueprint',
    title: 'Syndicate Architect',
    description: 'Design and save a custom multi-role heist blueprint in the Architect.',
    tier: 'SILVER',
    category: 'progression',
    xpReward: 400,
    icon: Target,
    hint: 'Open the Custom Heist Architect and save a custom mission configuration.'
  },
  {
    id: 'solo_graduate',
    title: 'Solo Survivalist',
    description: 'Complete all 4 specialist role trials in Solo Training mode.',
    tier: 'SILVER',
    category: 'progression',
    xpReward: 450,
    icon: BookOpen,
    hint: 'Conquer all 4 roles alone in the Solo Training simulator.'
  },
  {
    id: 'synchronized_breach',
    title: 'Extraction Synchronizer',
    description: 'Successfully execute a 4-way synchronized vault core breach during the extraction protocol.',
    tier: 'GOLD',
    category: 'squad',
    xpReward: 600,
    icon: Flame,
    hint: 'Lock all 4 operative tumbler pins within the 5-second synchronization window.'
  }
];
