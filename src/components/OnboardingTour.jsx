import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, Terminal, Zap, FlaskConical, Key,
  Users, Compass, Play, BookOpen, Sparkles, Shield, GraduationCap,
  ArrowRight, Award
} from 'lucide-react';

import { heistAudio } from './HeistAudioEngine';
import OperativeIdCard from './OperativeIdCard';

const TOUR_DEMO_OPERATIVE = {
  callsign: 'CIPHER_GHOST',
  username: 'ghost_operative',
  agentId: 'VLT-4827-9QX',
  role: 'Canopy Hacker',
  level: 14,
  xp: 14250,
  stats: {
    heistsCompleted: 42,
    successRate: 94,
    mvpAwards: 8,
    coopRuns: 38
  },
  cardConfig: {
    motto: 'APEX INFILTRATOR',
    showcasedMedals: ['speed_runner', 'mvp_award', 'cipher_grandmaster']
  }
};

// ─── Tour Step Definitions ────────────────────────────────────────────────────
// Each step optionally has a `targetSelector` (CSS selector for a real DOM
// element to spotlight). Steps without a selector show a centered overlay.
const TOUR_STEPS = [
  {
    id: 'welcome',
    title: '👋 Welcome to V.A.U.L.T',
    subtitle: 'VIRTUAL ACADEMIC UNDERGROUND LEARNING TEAM',
    description:
      'You\'re about to enter the most intense collaborative learning experience ever built. 4 specialists, 4 disciplines, one vault to crack — together.',
    icon: Shield,
    iconColor: '#10B981',
    targetSelector: null,
    centered: true,
  },
  {
    id: 'four-roles',
    title: '⚡ 4 Specialist Roles',
    subtitle: 'EACH ROLE OWNS A UNIQUE DISCIPLINE',
    description:
      'Every squad needs a Hacker (CS & Logic), Engineer (Physics & Math), Scientist (Chemistry & Biology), and Cryptographer (Ciphers & Languages). No role can win alone — you all relay clues to each other.',
    icon: Zap,
    iconColor: '#FBBF24',
    targetSelector: '[data-tour="roles"]',
    centered: false,
    items: [
      { icon: Terminal, label: 'Hacker', desc: 'Code & Algorithms', color: '#10B981' },
      { icon: Zap, label: 'Engineer', desc: 'Physics & Optics', color: '#FBBF24' },
      { icon: FlaskConical, label: 'Scientist', desc: 'Chemistry & Bio', color: '#06B6D4' },
      { icon: Key, label: 'Cryptographer', desc: 'Ciphers & Math', color: '#C084FC' },
    ],
  },
  {
    id: 'interdependence',
    title: '🔗 The Interdependence Engine',
    subtitle: 'WHY SOLO CHEATING FAILS',
    description:
      'Your Scientist\'s stoichiometry answer becomes the Engineer\'s laser refraction input. The Engineer\'s port code feeds the Hacker\'s terminal. The Hacker\'s cipher text goes to the Cryptographer. Every role is a lock AND a key.',
    icon: Sparkles,
    iconColor: '#C084FC',
    targetSelector: null,
    centered: true,
    flow: [
      { from: '🧪 Scientist', to: '⚙️ Engineer', detail: 'Optical Density n=1.42' },
      { from: '⚙️ Engineer', to: '💻 Hacker', detail: 'Port 0x7E3A revealed' },
      { from: '💻 Hacker', to: '📜 Cryptographer', detail: 'Cipher hex stream' },
      { from: '📜 Cryptographer', to: '🔓 VAULT', detail: 'Master key unlocked' },
    ],
  },
  {
    id: 'sidebar',
    title: '🗺️ Navigation Sidebar',
    subtitle: 'YOUR MISSION CONTROL',
    description:
      'The sidebar is your command center. Jump between Expeditions (missions), Squad Lobby (multiplayer), 4 Roles (specialist info), Disciplines (subjects), and your personal Stats Dossier.',
    icon: Compass,
    iconColor: '#34D399',
    targetSelector: 'aside',
    centered: false,
  },
  {
    id: 'id-card',
    title: '🪪 Operative ID Card',
    subtitle: 'YOUR SYNDICATE IDENTITY & PASS',
    description:
      'Every operative has an official syndicate credential with a unique Agent ID. View your career rank, showcase up to 3 earned medals, personalize your title in the ID Studio, and copy your ID in 1 click for matchmaking and squad invites.',
    icon: Award,
    iconColor: '#FBBF24',
    targetSelector: null,
    centered: true,
    features: [
      { emoji: '🪪', label: 'Unique Agent ID', desc: '1-click copy for squad matchmaking' },
      { emoji: '🎖️', label: 'Medal Showcase', desc: 'Display 3 earned milestone badges' },
      { emoji: '🎨', label: 'ID Studio Studio', desc: 'Customize titles & callsign styling' },
      { emoji: '📲', label: 'Profile Sharing', desc: 'Direct link & QR code profile access' },
    ]
  },
  {
    id: 'coop-heist',
    title: '🚀 Launch Co-Op Heist',
    subtitle: 'THE FULL EXPERIENCE — 4 PLAYERS',
    description:
      'When your squad is assembled, launch a live Co-Op heist. All 4 specialists get their own cockpit view simultaneously. Real-time puzzle relay, voice comms, and a ticking clock.',
    icon: Play,
    iconColor: '#FF4D6D',
    targetSelector: '[data-tour="coop-btn"]',
    centered: false,
  },
  {
    id: 'solo-training',
    title: '🎓 Solo Training Mode',
    subtitle: 'LEARN THE MECHANICS ALONE FIRST',
    description:
      'Not ready for a full squad? Click "Solo Training" to experience all 4 role puzzles yourself, with hints enabled and no time pressure. Perfect for understanding the interdependence mechanic.',
    icon: GraduationCap,
    iconColor: '#06B6D4',
    targetSelector: '[data-tour="solo-btn"]',
    centered: false,
  },
  {
    id: 'done',
    title: '✅ You\'re Briefed, Operative!',
    subtitle: 'MISSION READY',
    description:
      'You now know how V.A.U.L.T works. Assemble your squad in the lobby, or start with Solo Training to master each role first. Good luck — crack the vault!',
    icon: Shield,
    iconColor: '#10B981',
    targetSelector: null,
    centered: true,
  },
];

const STORAGE_KEY = 'vault_tour_seen_v3';

export default function OnboardingTour({ onComplete, currentUser }) {
  const [step, setStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const rafRef = useRef(null);

  const demoOperative = (currentUser?.callsign || currentUser?.username) ? currentUser : TOUR_DEMO_OPERATIVE;

  const currentStep = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const isFirst = step === 0;

  // ── Spotlight positioning ────────────────────────────────────────────────
  const updateSpotlight = useCallback(() => {
    if (!currentStep?.targetSelector || currentStep?.centered) {
      setSpotlightRect(null);
      return;
    }
    const el = document.querySelector(currentStep.targetSelector);
    if (!el) {
      setSpotlightRect(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      setSpotlightRect(null);
      return;
    }
    // Scroll element gently into view if offscreen
    const inView = rect.top >= 40 && rect.bottom <= window.innerHeight - 40;
    if (!inView) {
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {}
    }
    const PADDING = 10;
    setSpotlightRect({
      x: Math.max(0, rect.left - PADDING),
      y: Math.max(0, rect.top - PADDING),
      w: rect.width + PADDING * 2,
      h: rect.height + PADDING * 2,
    });
  }, [currentStep]);

  useEffect(() => {
    updateSpotlight();
    // Re-measure after layout settles (sidebar animation)
    const t1 = setTimeout(updateSpotlight, 120);
    const t2 = setTimeout(updateSpotlight, 350);
    const t3 = setTimeout(updateSpotlight, 600);
    window.addEventListener('resize', updateSpotlight);
    window.addEventListener('scroll', updateSpotlight, true);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', updateSpotlight);
      window.removeEventListener('scroll', updateSpotlight, true);
    };
  }, [updateSpotlight, step]);

  // ── Navigation ───────────────────────────────────────────────────────────
  const handleNext = () => {
    try { heistAudio.playKeyClick(); } catch {}
    if (isLast) {
      try { heistAudio.playSuccess(); } catch {}
      handleDismiss();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    try { heistAudio.playKeyClick(); } catch {}
    if (!isFirst) setStep(s => s - 1);
  };

  const handleDismiss = () => {
    try { heistAudio.playKeyClick(); } catch {}
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
    setTimeout(() => onComplete?.(), 350);
  };

  if (!isVisible) return null;

  // ── SVG spotlight mask (dark overlay with transparent cutout) ─────────────
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const spotlightPath = spotlightRect
    ? `M 0 0 H ${vw} V ${vh} H 0 Z M ${spotlightRect.x} ${spotlightRect.y} H ${spotlightRect.x + spotlightRect.w} V ${spotlightRect.y + spotlightRect.h} H ${spotlightRect.x} Z`
    : `M 0 0 H ${vw} V ${vh} H 0 Z`;

  // Determine if tooltip should appear below or above the spotlight
  const tooltipAbove = spotlightRect && spotlightRect.y + spotlightRect.h > vh * 0.65;

  return (
    <AnimatePresence>
      <motion.div
        key="tour-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9998]"
        style={{ pointerEvents: 'auto' }}
      >
        {/* ── Dark SVG overlay with spotlight cutout ── */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none' }}
        >
          <defs>
            <clipPath id="tour-spotlight-clip">
              <path d={spotlightPath} fillRule="evenodd" />
            </clipPath>
          </defs>
          <rect
            x={0} y={0} width={vw} height={vh}
            fill="rgba(2, 8, 5, 0.82)"
            clipPath="url(#tour-spotlight-clip)"
          />
          {/* Glowing border around spotlight */}
          {spotlightRect && (
            <rect
              x={spotlightRect.x - 2}
              y={spotlightRect.y - 2}
              width={spotlightRect.w + 4}
              height={spotlightRect.h + 4}
              fill="none"
              stroke="#10B981"
              strokeWidth={2.5}
              rx={8}
              style={{ filter: 'drop-shadow(0 0 8px #10B981)' }}
            />
          )}
        </svg>

        {/* ── Skip button (always top-right) ── */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 flex items-center space-x-1.5 bg-[#0A2D1F] text-[#6EE7B7] hover:bg-[#FF4D6D] hover:text-white font-mono font-black text-xs px-3 py-1.5 border-2 border-[#03140C] shadow-[2px_2px_0px_#020C07] uppercase transition-all rounded-md"
        >
          <X className="w-3.5 h-3.5" />
          <span>Skip Tour</span>
        </button>

        {/* ── Step counter (top-left) ── */}
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-1 font-mono text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-4 h-2 bg-[#10B981]'
                  : i < step
                  ? 'w-2 h-2 bg-[#10B981]/50'
                  : 'w-2 h-2 bg-[#0A2D1F] border border-[#10B981]/30'
              }`}
            />
          ))}
          <span className="ml-2 text-[#34D399]/60">{step + 1}/{TOUR_STEPS.length}</span>
        </div>

        {/* ── Tooltip / Content card ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, y: currentStep.centered ? 20 : (tooltipAbove ? -16 : 16), scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: currentStep.centered ? -12 : (tooltipAbove ? 12 : -12), scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`absolute z-10 w-[92vw] ${
              currentStep.id === 'id-card' ? 'max-w-2xl sm:max-w-3xl' : 'max-w-md'
            } ${
              currentStep.centered || !spotlightRect
                ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                : tooltipAbove
                ? ''
                : ''
            }`}
            style={
              !currentStep.centered && spotlightRect
                ? (() => {
                    const cardWidth = Math.min(416, vw - 32);
                    const idealLeft = spotlightRect.x + spotlightRect.w / 2 - cardWidth / 2;
                    const clampedLeft = Math.max(16, Math.min(idealLeft, Math.max(16, vw - cardWidth - 16)));
                    return tooltipAbove
                      ? {
                          left: clampedLeft,
                          top: Math.max(16, spotlightRect.y - 16),
                          transform: 'translateY(-100%)',
                          maxWidth: cardWidth,
                        }
                      : {
                          left: clampedLeft,
                          top: Math.min(vh - 80, spotlightRect.y + spotlightRect.h + 16),
                          maxWidth: cardWidth,
                        };
                  })()
                : undefined
            }
          >
            {/* Card */}
            <div className="bg-[#071E14]/97 backdrop-blur-2xl border-[3px] border-[#03140C] shadow-[8px_8px_0px_#020C07,0_0_40px_rgba(16,185,129,0.15)] p-5 sm:p-6 max-h-[88vh] overflow-y-auto">

              {/* Role badge + title */}
              <div className="flex items-start space-x-3 mb-4">
                <div
                  className="flex-shrink-0 w-10 h-10 border-2 border-[#03140C] shadow-[3px_3px_0px_#020C07] flex items-center justify-center"
                  style={{ backgroundColor: `${currentStep.iconColor}22` }}
                >
                  {React.createElement(currentStep.icon, {
                    className: 'w-5 h-5',
                    style: { color: currentStep.iconColor },
                  })}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase font-mono tracking-[3px]"
                     style={{ color: currentStep.iconColor }}>
                    {currentStep.subtitle}
                  </p>
                  <h2 className="text-base sm:text-lg font-black text-[#F0FDF4] leading-tight mt-0.5">
                    {currentStep.title}
                  </h2>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-emerald-100/85 leading-relaxed mb-4">
                {currentStep.description}
              </p>

              {/* Role grid (step 1) */}
              {currentStep.items && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {currentStep.items.map(item => {
                    const ItemIcon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-center space-x-2 p-2 border-2 border-[#03140C] bg-[#020B06]"
                      >
                        <div
                          className="w-7 h-7 border border-[#03140C] flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${item.color}20` }}
                        >
                          <ItemIcon className="w-3.5 h-3.5" style={{ color: item.color }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-[#F0FDF4]">{item.label}</p>
                          <p className="text-[9px] text-emerald-300/60 font-mono">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Interdependence flow (step 2) */}
              {currentStep.flow && (
                <div className="space-y-1.5 mb-4">
                  {currentStep.flow.map((f, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs font-mono">
                      <span className="text-[#FBBF24] font-black w-28 truncate">{f.from}</span>
                      <ArrowRight className="w-3 h-3 text-[#10B981] flex-shrink-0" />
                      <span className="text-[#10B981] font-bold flex-1 truncate">{f.to}</span>
                      <span className="text-emerald-300/50 text-[9px] truncate hidden sm:block">{f.detail}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ID Card highlights */}
              {currentStep.features && (
                <div className="grid grid-cols-2 gap-2 mb-4 font-mono">
                  {currentStep.features.map(feat => (
                    <div
                      key={feat.label}
                      className="p-2.5 border-2 border-[#03140C] bg-[#020B06] space-y-0.5"
                    >
                      <div className="flex items-center space-x-1.5 text-[10px] font-black text-[#FBBF24] uppercase">
                        <span>{feat.emoji}</span>
                        <span>{feat.label}</span>
                      </div>
                      <p className="text-[9px] text-emerald-300/70 font-mono leading-tight">
                        {feat.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Live ID Card Preview */}
              {currentStep.id === 'id-card' && (
                <div className="my-3 rounded-2xl border-2 border-[#03140C] bg-[#020B06] overflow-hidden shadow-inner flex flex-col">
                  <div className="bg-[#051C12] px-3 py-1.5 border-b border-[#134830] flex items-center justify-between text-[11px] font-mono text-[#34D399]">
                    <span className="flex items-center space-x-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                      <span>OPERATIVE PASS PREVIEW</span>
                    </span>
                    <span className="text-slate-400 text-[10px]">Active Credential Card</span>
                  </div>
                  <div className="max-h-[340px] sm:max-h-[380px] overflow-y-auto p-2 sm:p-3 flex justify-center">
                    <div className="w-full flex justify-center">
                      <OperativeIdCard 
                        operative={demoOperative}
                        isMe={true}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#03140C]">
                <button
                  onClick={handleBack}
                  disabled={isFirst}
                  className={`flex items-center space-x-1 font-mono font-black text-xs px-3 py-2 border-2 border-[#03140C] uppercase transition-all shadow-[2px_2px_0px_#020C07] ${
                    isFirst
                      ? 'bg-[#020B06] text-slate-700 cursor-not-allowed'
                      : 'bg-[#0A261B] text-[#6EE7B7] hover:bg-[#10B981]/20 active:translate-x-0.5'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  onClick={handleNext}
                  className="flex items-center space-x-1.5 bg-[#10B981] text-[#02140D] font-mono font-black text-xs px-4 py-2 border-2 border-[#03140C] shadow-[3px_3px_0px_#020C07] hover:bg-[#34D399] active:translate-x-0.5 active:translate-y-0.5 uppercase transition-all"
                >
                  <span>{isLast ? '🚀 Start Playing!' : 'Next'}</span>
                  {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Connector arrow pointing to spotlight (if not centered) */}
            {!currentStep.centered && spotlightRect && (
              <div
                className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
                style={
                  tooltipAbove
                    ? {
                        bottom: -10,
                        borderLeft: '10px solid transparent',
                        borderRight: '10px solid transparent',
                        borderTop: '10px solid #03140C',
                      }
                    : {
                        top: -10,
                        borderLeft: '10px solid transparent',
                        borderRight: '10px solid transparent',
                        borderBottom: '10px solid #03140C',
                      }
                }
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

// Utility: call this before rendering the tour to check if it should show
export function shouldShowTour() {
  try {
    return !localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

export function resetTour() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
