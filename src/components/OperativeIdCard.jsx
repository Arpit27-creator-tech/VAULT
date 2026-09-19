import React, { useState, useMemo } from 'react';
import { 
  Shield, Award, Trophy, Zap, Terminal, Clock, CheckCircle2, 
  Sparkles, RotateCw, Copy, Check, Eye, Lock, Radio, Key, 
  Star, Flame, QrCode, Fingerprint, Compass, ShieldCheck, Cpu
} from 'lucide-react';
import { CARD_THEMES, FRAME_STYLES, AVAILABLE_SHOWCASE_MEDALS, getOperativeCardConfig } from '../utils/cardCustomization';
import { getLoyaltyRank } from '../utils/loyaltyPoints';
import { getLevelProgress } from '../utils/leveling';
import { getMvpCount } from '../utils/mvpAwards';
import { heistAudio } from './HeistAudioEngine';
import { toast } from 'sonner';

const ICON_MAP = {
  Trophy: Trophy,
  CheckCircle2: CheckCircle2,
  Clock: Clock,
  Shield: Shield,
  Sparkles: Sparkles,
  Terminal: Terminal,
  Zap: Zap,
  Key: Key,
  Star: Star,
  Flame: Flame,
  Award: Award
};

const TIER_COLORS = {
  BRONZE: 'border-[#B45309] text-[#F59E0B] bg-[#1C1917]',
  SILVER: 'border-[#71717A] text-[#E4E4E7] bg-[#18181B]',
  GOLD: 'border-[#D97706] text-[#FBBF24] bg-[#27272A]',
  PLATINUM: 'border-[#EA580C] text-[#FB923C] bg-[#1C1917]'
};

export default function OperativeIdCard({
  operative,
  customConfig = null,
  isFlipped: controlledFlipped,
  onFlip = null,
  interactive = true,
  className = ''
}) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [hoveredMedal, setHoveredMedal] = useState(null);

  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const handleFlipToggle = (e) => {
    e?.stopPropagation();
    heistAudio.playKeyClick();
    if (onFlip) {
      onFlip(!isFlipped);
    } else {
      setInternalFlipped(!internalFlipped);
    }
  };

  // Derive card configuration
  const config = useMemo(() => {
    if (customConfig) {
      return {
        ...getOperativeCardConfig(operative),
        ...customConfig
      };
    }
    return getOperativeCardConfig(operative);
  }, [operative, customConfig]);

  const activeTheme = CARD_THEMES.PRISON_INMATE;

  // Operative metrics
  const callsign = operative?.callsign || operative?.username || 'GHOST OPERATIVE';
  const rawAgentId = operative?.agentId || (
    operative?.id 
      ? `VAULT-${operative.id.replace(/-/g, '').substring(0, 8).toUpperCase()}` 
      : 'VAULT-00000000'
  );
  const role = operative?.role || 'Canopy Hacker';
  const level = operative?.level || 1;
  const xp = operative?.xp || 0;
  const { progress: levelProgress } = getLevelProgress(xp);
  const xpPercent = Math.min(100, Math.round(levelProgress * 100));

  // Squad Loyalty (strictly capped at 1000)
  const rawLp = typeof operative?.loyaltyPoints === 'number' ? operative.loyaltyPoints : (operative?.lp ?? 1000);
  const lp = Math.min(1000, Math.max(0, rawLp));
  const loyaltyRank = getLoyaltyRank(lp);
  const lpPercent = Math.min(100, Math.max(0, Math.round((lp / 1000) * 100)));

  // Telemetry stats
  const stats = operative?.stats || { missionsCompleted: 0, vaultsCracked: 0, winRate: 100 };
  const mvpCount = getMvpCount(operative);

  const avatarUrl = operative?.avatar || operative?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

  const handleCopyAgentId = (e) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(rawAgentId);
    setCopiedId(true);
    heistAudio.playKeyClick();
    toast.success(`📋 Copied Agent ID: ${rawAgentId}`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Resolve showcased medals
  const showcasedMedalsList = useMemo(() => {
    const medalIds = config.showcasedMedals || ['mvp_award', 'speed_demon', 'apex_loyalty'];
    return medalIds.map(id => {
      const found = AVAILABLE_SHOWCASE_MEDALS.find(m => m.id === id);
      if (found) return found;
      return {
        id,
        title: id.replace(/_/g, ' ').toUpperCase(),
        icon: 'Award',
        tier: 'GOLD',
        desc: 'Special commendation from syndicate command.'
      };
    });
  }, [config.showcasedMedals]);


  return (
    <div className={`perspective-1000 select-none ${className}`}>
      <div 
        className={`relative w-[340px] sm:w-[380px] min-h-[600px] transition-transform duration-700 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        
        {/* ============================================================
            FRONT OF CARD — CANOPY PENITENTIARY CELL BLOCK 9 INMATE PASS
            ============================================================ */}
        <div 
          className="absolute inset-0 rounded-[22px] border-2 backface-hidden overflow-hidden p-5 flex flex-col justify-between shadow-[6px_6px_0px_#000000]"
          style={{ 
            borderColor: '#EA580C',
            boxShadow: '6px 6px 0px #000000',
            backgroundImage: `linear-gradient(to bottom, rgba(24, 12, 6, 0.92), rgba(12, 6, 3, 0.96), rgba(0, 0, 0, 0.98)), url('/prison_card_bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Industrial Corner Hex Bolts */}
          <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600 shadow flex items-center justify-center pointer-events-none z-30">
            <div className="w-1 h-0.5 bg-black rotate-45" />
          </div>
          <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600 shadow flex items-center justify-center pointer-events-none z-30">
            <div className="w-1 h-0.5 bg-black -rotate-45" />
          </div>
          <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600 shadow flex items-center justify-center pointer-events-none z-30">
            <div className="w-1 h-0.5 bg-black -rotate-45" />
          </div>
          <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600 shadow flex items-center justify-center pointer-events-none z-30">
            <div className="w-1 h-0.5 bg-black rotate-45" />
          </div>

          {/* Prison Cell Bars Texture */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, #FFFFFF 0px, #FFFFFF 2px, transparent 2px, transparent 22px)'
            }}
          />

          {/* Prison Hazard Caution Banner */}
          <div 
            className="relative -mx-5 -mt-5 mb-2.5 py-1 px-3 flex items-center justify-between text-[8px] font-mono font-black uppercase text-black tracking-wider shadow-md"
            style={{ background: 'repeating-linear-gradient(45deg, #CA8A04, #CA8A04 10px, #000000 10px, #000000 20px)' }}
          >
            <span className="bg-black text-[#FBBF24] px-2 py-0.5 rounded font-black tracking-widest flex items-center space-x-1">
              <span>⚠️ CANOPY PENITENTIARY</span>
            </span>
            <span className="bg-[#DC2626] text-white px-1.5 py-0.5 rounded font-black">
              CELL BLOCK 9
            </span>
          </div>

          {/* Distressed Inmate Stamp Overlay */}
          <div className="absolute top-14 right-3.5 rotate-12 border-2 border-[#DC2626] text-[#DC2626] bg-[#18181B] font-mono font-black text-[9px] tracking-widest px-2 py-0.5 rounded shadow uppercase pointer-events-none select-none z-20">
            [ INMATE C-09 ]
          </div>

          {/* Top Lanyard Badge Slot Cutout (Authentic ID Pass Detail) */}
          <div className="relative z-10 flex justify-center -mt-1 mb-2">
            <div className="w-14 h-2 bg-black border border-zinc-700 rounded-full shadow-inner" />
          </div>

          {/* Top Security Header with Official Seal & Smart Key */}
          <div className="relative z-10 border-b border-zinc-800 pb-3">
            <div className="flex items-center justify-between">
              
              <div className="flex items-center space-x-2.5">
                {/* Official Cell Block 9 Graphic Emblem */}
                <div 
                  className="w-10 h-10 rounded-full border-2 border-[#EA580C] p-0.5 bg-black flex-shrink-0 overflow-hidden shadow"
                  title="Official Cell Block 9 Penitentiary Insignia"
                >
                  <img 
                    src="/prison_seal_emblem.jpg" 
                    alt="Cell Block 9 Seal" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-game font-black text-sm text-white tracking-wider">
                      🔒 CELL BLOCK 9
                    </span>
                    <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase bg-[#EA580C] text-black border-[#C2410C]">
                      INMATE PASS
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-400">
                    MAX SECURITY INCARCERATION
                  </p>
                </div>
              </div>

              {/* Status indicator & Flip toggle */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 bg-black px-2.5 py-1 rounded-full border border-zinc-700 text-[9px] font-mono">
                  <div className="w-2 h-2 rounded-full bg-[#DC2626]" />
                  <span className="font-bold tracking-wide text-[#EF4444]">
                    DETAINED
                  </span>
                </div>
                {interactive && (
                  <button
                    onClick={handleFlipToggle}
                    className="p-1.5 text-zinc-300 hover:text-white bg-[#18181B] hover:bg-[#27272A] border border-zinc-700 rounded-lg transition-colors"
                    title="Flip to Inmate Dossier"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Main Identity: Photo + Bio + Callsign */}
          <div className="relative z-10 py-3 space-y-3">
            <div className="flex items-start space-x-3.5">
              
              {/* Avatar + Yellow Level Ring + Mugshot Height Scale Lineup */}
              <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 106, height: 104 }}>
                {/* Background Mugshot Height Grid */}
                <div className="absolute inset-0 rounded-2xl bg-black border border-zinc-700 overflow-hidden pointer-events-none flex flex-col justify-between py-1 px-1 opacity-90">
                  <div className="flex justify-between items-center border-b border-zinc-800 text-[7px] font-mono text-zinc-400 font-bold">
                    <span>6'0"</span>
                    <span className="w-6 border-b border-zinc-700" />
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-800 text-[7px] font-mono text-zinc-400 font-bold">
                    <span>5'8"</span>
                    <span className="w-6 border-b border-zinc-700" />
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-800 text-[7px] font-mono text-zinc-400 font-bold">
                    <span>5'4"</span>
                    <span className="w-6 border-b border-zinc-700" />
                  </div>
                  <div className="flex justify-between items-center text-[7px] font-mono text-zinc-400 font-bold">
                    <span>5'0"</span>
                    <span className="w-6 border-b border-zinc-700" />
                  </div>
                </div>

                {/* Direct SVG ring — solid orange progress arc */}
                {(() => {
                  const size = 96, sw = 4.5;
                  const r = (size - sw) / 2;
                  const circ = 2 * Math.PI * r;
                  const offset = circ * (1 - levelProgress);
                  const c = size / 2;
                  return (
                    <svg width={size} height={size} className="absolute inset-0 m-auto pointer-events-none" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx={c} cy={c} r={r} fill="none" stroke="#27272A" strokeWidth={sw} />
                      <circle cx={c} cy={c} r={r} fill="none" stroke="#EA580C" strokeWidth={sw}
                        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
                      />
                    </svg>
                  );
                })()}

                {/* Avatar image perfectly circular inside */}
                <div
                  className="absolute flex items-center justify-center overflow-hidden rounded-full shadow"
                  style={{ 
                    width: 78,
                    height: 78,
                    borderRadius: '9999px',
                    WebkitMaskImage: '-webkit-radial-gradient(white, black)'
                  }}
                >
                  <img 
                    src={avatarUrl} 
                    alt={callsign}
                    className="w-full h-full rounded-full object-cover"
                    style={{ borderRadius: '9999px' }}
                  />
                </div>

                {/* LVL Badge */}
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#EA580C] text-black text-[10px] font-black px-2 py-0.5 rounded font-game shadow whitespace-nowrap z-20 border border-[#C2410C]">
                  LVL {level}
                </span>
              </div>

              {/* Callsign & Tag details */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase bg-[#EA580C] text-black border-[#C2410C]">
                    Convict {role}
                  </span>
                  {mvpCount > 0 && (
                    <span className="inline-flex items-center space-x-1 bg-[#CA8A04] text-black font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-[#A16207]">
                      <Trophy className="w-3 h-3 text-black fill-current" />
                      <span>{mvpCount} MVP</span>
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white font-game uppercase tracking-tight truncate">
                  INMATE: {callsign}
                </h2>

                {/* Unique Agent ID / Booking Code */}
                <div className="flex items-center space-x-1.5 pt-0.5">
                  <span className="text-[10px] font-mono font-bold text-zinc-400">
                    BOOKING:
                  </span>
                  <button
                    onClick={handleCopyAgentId}
                    className="flex items-center space-x-1 text-[11px] font-mono font-black px-2 py-0.5 rounded bg-[#18181B] border border-zinc-700 hover:border-zinc-500 text-white transition-all shadow group"
                    title="Click to copy Agent ID"
                  >
                    <span>{rawAgentId}</span>
                    {copiedId ? (
                      <Check className="w-3 h-3 text-[#EA580C]" />
                    ) : (
                      <Copy className="w-3 h-3 text-zinc-400 group-hover:text-white" />
                    )}
                  </button>
                </div>

                {/* Custom Motto / Slogan */}
                <p className="text-[11px] text-zinc-300 font-mono italic truncate pt-0.5 leading-snug">
                  "{config.motto || 'Apex Infiltrator // Zero Trace'}"
                </p>
              </div>

            </div>

            {/* SVG Barbed Wire Decorative Divider Graphic */}
            <div className="relative py-0.5 overflow-hidden">
              <svg className="w-full h-3 pointer-events-none select-none" viewBox="0 0 340 10" preserveAspectRatio="none">
                <line x1="0" y1="5" x2="340" y2="5" stroke="#3F3F46" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 25 1 L 32 9 M 32 1 L 25 9 M 85 1 L 92 9 M 92 1 L 85 9 M 145 1 L 152 9 M 152 1 L 145 9 M 205 1 L 212 9 M 212 1 L 205 9 M 265 1 L 272 9 M 272 1 L 265 9 M 315 1 L 322 9 M 322 1 L 315 9" stroke="#CA8A04" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Dual Progress Bars matching StatsDashboard */}
          <div className="relative z-10 bg-[#18181B] border border-zinc-800 rounded-xl p-3 space-y-2.5">
            
            {/* XP Progression Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-300 font-bold flex items-center space-x-1">
                  <Star className="w-3 h-3 text-[#EA580C]" />
                  <span>XP Progress to Level {level + 1}</span>
                </span>
                <span className="text-[#EA580C] font-bold">
                  {xp.toLocaleString()} XP ({xpPercent}%)
                </span>
              </div>
              <div className="w-full bg-[#09090B] h-2.5 rounded-full overflow-hidden border border-zinc-800">
                <div 
                  className="bg-[#EA580C] h-full rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>

            {/* Squad Loyalty Progress Bar (Strictly 1000 max) */}
            <div className="space-y-1 border-t border-zinc-800 pt-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-300 font-bold flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-[#D97706]" />
                  <span>Squad Loyalty ({loyaltyRank.emoji} {loyaltyRank.name})</span>
                </span>
                <span className="text-[#D97706] font-bold">
                  {lp.toLocaleString()} / 1,000 LP
                </span>
              </div>
              <div className="w-full bg-[#09090B] h-2.5 rounded-full overflow-hidden border border-zinc-800">
                <div 
                  className="bg-[#D97706] h-full rounded-full transition-all duration-500"
                  style={{ width: `${lpPercent}%` }}
                />
              </div>
            </div>

          </div>

          {/* Showcased Medals & Pins */}
          <div className="relative z-10 py-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-black uppercase text-zinc-300 tracking-wider flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Showcased Medals</span>
              </span>
              <span className="text-[9px] font-mono text-zinc-400">
                {showcasedMedalsList.length} FEATURED
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {showcasedMedalsList.map((medal) => {
                const IconComponent = ICON_MAP[medal.icon] || Award;
                const tierClass = TIER_COLORS[medal.tier] || TIER_COLORS.GOLD;
                const isHovered = hoveredMedal === medal.id;

                return (
                  <div
                    key={medal.id}
                    onMouseEnter={() => setHoveredMedal(medal.id)}
                    onMouseLeave={() => setHoveredMedal(null)}
                    className={`relative p-2 rounded-xl border text-center transition-all cursor-pointer ${tierClass}`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono font-bold block truncate leading-tight">
                      {medal.title}
                    </span>
                    <span className="text-[8px] font-mono uppercase opacity-75 block">
                      {medal.tier}
                    </span>

                    {/* Hover Tooltip */}
                    {isHovered && (
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-48 p-2.5 bg-[#09090B] border border-zinc-700 rounded-xl text-left shadow-xl z-30 pointer-events-none animate-in fade-in">
                        <div className="flex items-center space-x-1.5 text-[10px] font-mono font-bold text-white mb-0.5">
                          <IconComponent className="w-3.5 h-3.5 text-[#EA580C]" />
                          <span>{medal.title}</span>
                        </div>
                        <p className="text-[9px] font-mono text-zinc-300 leading-snug">
                          {medal.desc}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Telemetry Grid matching StatsDashboard stats */}
          <div className="relative z-10 grid grid-cols-3 gap-1.5 py-1 text-center">
            <div className="bg-[#18181B] border border-zinc-800 rounded-xl py-1.5 px-1">
              <span className="text-[8px] font-mono text-zinc-400 uppercase block font-bold">Heists Done</span>
              <span className="text-xs font-black font-game text-white">
                {stats.missionsCompleted || 0}
              </span>
            </div>
            <div className="bg-[#18181B] border border-zinc-800 rounded-xl py-1.5 px-1">
              <span className="text-[8px] font-mono text-zinc-400 uppercase block font-bold">Vaults Cracked</span>
              <span className="text-xs font-black font-game text-[#EA580C]">
                {stats.vaultsCracked || 0}
              </span>
            </div>
            <div className="bg-[#18181B] border border-zinc-800 rounded-xl py-1.5 px-1">
              <span className="text-[8px] font-mono text-zinc-400 uppercase block font-bold">Squad LP</span>
              <span className="text-xs font-black font-game text-[#D97706]">
                {lp} LP
              </span>
            </div>
          </div>

          {/* Card Footer: Security Barcode & Syndicate Seal */}
          <div className="relative z-10 pt-2 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-zinc-300" />
              <div className="space-y-0.5">
                <div className="font-mono text-[8px] text-[#EA580C] font-bold tracking-wider">
                  CANOPY PENITENTIARY // CELL BLOCK 9
                </div>
                <div className="font-mono text-[7px] text-zinc-400">
                  BOOKING RECORD // {rawAgentId}
                </div>
              </div>
            </div>

            {interactive && (
              <button
                onClick={handleFlipToggle}
                className="text-[9px] font-mono font-bold text-zinc-300 hover:text-white flex items-center space-x-1 bg-[#18181B] hover:bg-[#27272A] px-2.5 py-1 rounded-lg border border-zinc-700 transition-all"
              >
                <span>Dossier</span>
                <RotateCw className="w-3 h-3" />
              </button>
            )}
          </div>

        </div>

        {/* ============================================================
            BACK OF CARD — CANOPY PENITENTIARY INMATE DOSSIER
            ============================================================ */}
        <div 
          className="absolute inset-0 rounded-[22px] border-2 backface-hidden rotate-y-180 overflow-hidden p-5 flex flex-col justify-between shadow-[6px_6px_0px_#000000]"
          style={{ 
            borderColor: '#EA580C',
            boxShadow: '6px 6px 0px #000000',
            backgroundImage: `linear-gradient(to bottom, rgba(24, 12, 6, 0.92), rgba(12, 6, 3, 0.96), rgba(0, 0, 0, 0.98)), url('/prison_card_bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Industrial Corner Hex Bolts */}
          <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600 shadow flex items-center justify-center pointer-events-none z-30">
            <div className="w-1 h-0.5 bg-black rotate-45" />
          </div>
          <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600 shadow flex items-center justify-center pointer-events-none z-30">
            <div className="w-1 h-0.5 bg-black -rotate-45" />
          </div>
          <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600 shadow flex items-center justify-center pointer-events-none z-30">
            <div className="w-1 h-0.5 bg-black -rotate-45" />
          </div>
          <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600 shadow flex items-center justify-center pointer-events-none z-30">
            <div className="w-1 h-0.5 bg-black rotate-45" />
          </div>

          {/* Official Prison Emblem Watermark */}
          <div className="absolute right-3 bottom-14 opacity-15 pointer-events-none select-none w-32 h-32 rounded-full overflow-hidden filter contrast-150">
            <img src="/prison_seal_emblem.jpg" alt="Watermark Seal" className="w-full h-full object-cover" />
          </div>

          {/* Red Distressed Dossier Stamp */}
          <div className="absolute top-14 right-3 -rotate-6 border-2 border-[#DC2626] text-[#DC2626] bg-[#18181B] font-mono font-black text-[9px] tracking-widest px-2 py-0.5 rounded shadow uppercase pointer-events-none select-none z-20">
            [ CLASSIFIED // FLIGHT RISK ]
          </div>

          {/* Header */}
          <div className="relative z-10 border-b border-zinc-800 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full border-2 border-[#EA580C] p-0.5 bg-black overflow-hidden flex-shrink-0">
                  <img src="/prison_seal_emblem.jpg" alt="Prison Seal" className="w-full h-full object-cover rounded-full" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                    PENAL CONFINEMENT DOSSIER
                  </h3>
                  <p className="text-[9px] font-mono text-zinc-400">
                    INMATE RECORD // CELL BLOCK 9
                  </p>
                </div>
              </div>
              {interactive && (
                <button
                  onClick={handleFlipToggle}
                  className="p-1.5 text-zinc-300 hover:text-white bg-[#18181B] hover:bg-[#27272A] border border-zinc-700 rounded-lg transition-colors"
                  title="Flip to Front"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Dossier Content */}
          <div className="relative z-10 space-y-3 py-1">
            <div className="bg-[#18181B] border border-zinc-800 rounded-xl p-3 space-y-2 shadow-inner">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-400">Inmate Callsign:</span>
                <span className="text-white font-bold">{callsign}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-400">Criminal Discipline:</span>
                <span className="text-[#EA580C] font-bold">{role}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-400">Flight Risk Classification:</span>
                <span className="text-[#D97706] font-bold">LEVEL {level} // CRITICAL</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-400">Inmate Loyalty Standing:</span>
                <span className="text-zinc-200 font-bold">{loyaltyRank.name} ({lp} LP)</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-400">Heist Commendations:</span>
                <span className="text-[#CA8A04] font-bold">{mvpCount} Trophies Awarded</span>
              </div>
            </div>

            {/* Specialization telemetry */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-zinc-300 font-bold block">
                Detention Cell Specializations
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="bg-[#09090B] border border-zinc-800 p-2 rounded-lg">
                  <span className="text-zinc-400 block text-[8px]">PRIMARY DISCIPLINE</span>
                  <span className="text-white font-bold">{role}</span>
                </div>
                <div className="bg-[#09090B] border border-zinc-800 p-2 rounded-lg">
                  <span className="text-zinc-400 block text-[8px]">CELL BLOCK STATUS</span>
                  <span className="text-[#DC2626] font-bold">High Flight Risk</span>
                </div>
              </div>
            </div>

            {/* Security Cryptographic Hash & Biometric Seal */}
            <div className="bg-[#18181B] border border-zinc-800 p-2.5 rounded-xl space-y-1 flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <span className="text-[8px] font-mono text-[#EA580C] uppercase block font-bold">
                  Penitentiary Booking Signature // Cell Block 9
                </span>
                <p className="font-mono text-[9px] text-zinc-400 break-all leading-tight">
                  SHA-256: {rawAgentId.toLowerCase()}-77a94f81c9b4e0293d0a1
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-black border border-zinc-700 p-1 flex items-center justify-center flex-shrink-0">
                <Fingerprint className="w-5 h-5 text-[#EA580C]" />
              </div>
            </div>
          </div>

          {/* Bottom Back Button */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-[8px] font-mono text-zinc-400">
              MAXIMUM SECURITY // CANOPY PENITENTIARY
            </span>
            {interactive && (
              <button
                onClick={handleFlipToggle}
                className="text-[9px] font-mono font-bold text-zinc-300 hover:text-white flex items-center space-x-1 bg-[#18181B] hover:bg-[#27272A] px-3 py-1.5 rounded-lg border border-zinc-700 transition-all"
              >
                <span>Return to ID Front</span>
                <RotateCw className="w-3 h-3" />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
