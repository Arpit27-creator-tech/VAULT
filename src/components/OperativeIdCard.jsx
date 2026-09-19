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
  BRONZE: 'border-[#CD7F32]/80 text-[#CD7F32] bg-[#CD7F32]/15 shadow-[0_0_8px_rgba(205,127,50,0.25)]',
  SILVER: 'border-slate-300/80 text-slate-200 bg-slate-300/15 shadow-[0_0_8px_rgba(224,231,255,0.25)]',
  GOLD: 'border-[#FBBF24]/80 text-[#FBBF24] bg-[#FBBF24]/20 shadow-[0_0_10px_rgba(251,191,36,0.35)]',
  PLATINUM: 'border-[#34D399]/80 text-[#34D399] bg-[#10B981]/20 shadow-[0_0_12px_rgba(52,211,153,0.4)]'
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

  const activeTheme = CARD_THEMES[config.theme] || CARD_THEMES.CANOPY_EMERALD;

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

  // Frame styles
  const isHolo = config.frameStyle === 'holographic';
  const isCarbon = config.frameStyle === 'carbon';
  const isCircuit = config.frameStyle === 'circuit';

  return (
    <div className={`perspective-1000 select-none ${className}`}>
      <div 
        className={`relative w-[340px] sm:w-[380px] min-h-[600px] transition-transform duration-700 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        
        {/* ============================================================
            FRONT OF CARD — V.A.U.L.T. OPERATIVE ID CLEARANCE PASS
            ============================================================ */}
        <div 
          className={`absolute inset-0 rounded-[22px] border-2 backface-hidden overflow-hidden p-5 flex flex-col justify-between bg-gradient-to-b ${activeTheme.bgGradient} shadow-[5px_5px_0px_#020C07]`}
          style={{ 
            borderColor: activeTheme.borderColor,
            boxShadow: `6px 6px 0px #020C07, 0 0 25px ${activeTheme.statGlow}`
          }}
        >
          {/* Hologram Foil / Shimmer Overlay */}
          {isHolo && config.hologramShimmer && (
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay animate-holo-sheen"
              style={{ background: activeTheme.holoGradient }}
            />
          )}

          {/* Carbon Weave Texture Overlay */}
          {isCarbon && (
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{ 
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
                backgroundSize: '8px 8px'
              }}
            />
          )}

          {/* Circuit Grid Texture Overlay */}
          {isCircuit && (
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(to right, ${activeTheme.primaryColor} 1px, transparent 1px), linear-gradient(to bottom, ${activeTheme.primaryColor} 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }}
            />
          )}

          {/* Top Lanyard Badge Slot Cutout (Authentic ID Pass Detail) */}
          <div className="relative z-10 flex justify-center -mt-1 mb-2">
            <div className="w-14 h-2 bg-[#020B06] border border-emerald-900/80 rounded-full shadow-inner" />
          </div>

          {/* Top Security Header */}
          <div className="relative z-10 border-b border-emerald-900/60 pb-3">
            <div className="flex items-center justify-between">
              
              <div className="flex items-center space-x-2.5">
                {/* Micro Smart Chip with 6 golden pins */}
                <div 
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FBBF24] to-[#B45309] border border-amber-400 p-1 flex flex-col justify-between shadow-sm flex-shrink-0"
                  title="Syndicate Smart Key Security Chip"
                >
                  <div className="flex justify-between h-2 border-b border-amber-900/60">
                    <div className="w-2 border-r border-amber-900/60" />
                    <div className="w-2" />
                  </div>
                  <div className="flex justify-between h-2">
                    <div className="w-2 border-r border-amber-900/60" />
                    <div className="w-2" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-game font-black text-sm text-white tracking-wider">
                      🌲 V.A.U.L.T.
                    </span>
                    <span className="bg-[#10B981]/20 text-[#34D399] font-mono text-[9px] font-bold px-1.5 py-0.2 rounded border border-[#10B981]/40 uppercase">
                      SEC PASS
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-emerald-300/70">
                    OPERATIVE IDENTIFICATION
                  </p>
                </div>
              </div>

              {/* Status indicator & Flip toggle */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 bg-[#020B06] px-2.5 py-1 rounded-full border border-emerald-800/60 text-[9px] font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-emerald-300 font-bold tracking-wide">ACTIVE</span>
                </div>
                {interactive && (
                  <button
                    onClick={handleFlipToggle}
                    className="p-1.5 text-slate-400 hover:text-white bg-[#020B06] hover:bg-[#07281A] border border-emerald-800/60 rounded-lg transition-colors"
                    title="Flip to Operative Dossier"
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
              
              {/* Avatar + Yellow Level Ring — 100% Circular matching StatsDashboard */}
              <div className="relative flex-shrink-0" style={{ width: 100, height: 100 }}>
                {/* Direct SVG ring — yellow progress arc */}
                {(() => {
                  const size = 100, sw = 5;
                  const r = (size - sw) / 2;
                  const circ = 2 * Math.PI * r;
                  const offset = circ * (1 - levelProgress);
                  const c = size / 2;
                  return (
                    <svg width={size} height={size} className="absolute inset-0 pointer-events-none" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx={c} cy={c} r={r} fill="none" stroke="#041E14" strokeWidth={sw} />
                      <circle cx={c} cy={c} r={r} fill="none" stroke="#FBBF24" strokeWidth={sw}
                        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
                      />
                    </svg>
                  );
                })()}

                {/* Avatar image perfectly circular inside */}
                <div
                  className="absolute flex items-center justify-center overflow-hidden rounded-full shadow-lg"
                  style={{ 
                    inset: 9,
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

                {/* LVL Badge matching StatsDashboard.jsx */}
                <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#FBBF24] text-[#02140D] text-[10px] font-black px-2 py-0.5 rounded-full font-game shadow whitespace-nowrap z-10">
                  LVL {level}
                </span>
              </div>

              {/* Callsign & Tag details */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="bg-[#10B981]/20 text-[#34D399] font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-[#10B981]/40 uppercase">
                    {role}
                  </span>
                  {mvpCount > 0 && (
                    <span className="inline-flex items-center space-x-1 bg-[#FBBF24]/15 text-[#FDE047] font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-[#FBBF24]/50">
                      <Trophy className="w-3 h-3 text-[#FBBF24] fill-current" />
                      <span>{mvpCount} MVP</span>
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white font-game uppercase tracking-tight truncate">
                  {callsign}
                </h2>

                {/* Unique Agent ID */}
                <div className="flex items-center space-x-1.5 pt-0.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400">TAG:</span>
                  <button
                    onClick={handleCopyAgentId}
                    className="flex items-center space-x-1 text-[11px] font-mono font-black px-2 py-0.5 rounded bg-[#020B06] border border-emerald-900/80 hover:border-amber-500/50 text-[#FBBF24] hover:text-white transition-all shadow-inner group"
                    title="Click to copy Agent ID"
                  >
                    <span>{rawAgentId}</span>
                    {copiedId ? (
                      <Check className="w-3 h-3 text-[#10B981]" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400 group-hover:text-white" />
                    )}
                  </button>
                </div>

                {/* Custom Motto / Slogan */}
                <p className="text-[11px] text-emerald-200/80 font-mono italic truncate pt-0.5 leading-snug">
                  "{config.motto || 'Apex Infiltrator // Zero Trace'}"
                </p>
              </div>

            </div>
          </div>

          {/* Dual Progress Bars matching StatsDashboard */}
          <div className="relative z-10 bg-[#020B06]/80 border border-emerald-900/60 rounded-xl p-3 space-y-2.5 shadow-inner">
            
            {/* XP Progression Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-300 font-bold flex items-center space-x-1">
                  <Star className="w-3 h-3 text-amber-400" />
                  <span>XP Progress to Level {level + 1}</span>
                </span>
                <span className="text-[#FBBF24] font-bold">
                  {xp.toLocaleString()} XP ({xpPercent}%)
                </span>
              </div>
              <div className="w-full bg-[#04160E] h-2 rounded-full overflow-hidden border border-amber-900/60">
                <div 
                  className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] h-full rounded-full transition-all duration-500 shadow-sm shadow-amber-500/30"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>

            {/* Squad Loyalty Progress Bar (Strictly 1000 max) */}
            <div className="space-y-1 border-t border-emerald-900/40 pt-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-300 font-bold flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span>Squad Loyalty ({loyaltyRank.emoji} {loyaltyRank.name})</span>
                </span>
                <span className="text-[#FBBF24] font-bold">
                  {lp.toLocaleString()} / 1,000 LP
                </span>
              </div>
              <div className="w-full bg-[#04160E] h-2 rounded-full overflow-hidden border border-amber-900/60">
                <div 
                  className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] h-full rounded-full transition-all duration-500 shadow-sm shadow-amber-500/30"
                  style={{ width: `${lpPercent}%` }}
                />
              </div>
            </div>

          </div>

          {/* Showcased Medals & Pins */}
          <div className="relative z-10 py-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-black uppercase text-slate-300 tracking-wider flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Showcased Medals</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-400/80">
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
                    className={`relative p-2 rounded-xl border text-center transition-all cursor-pointer bg-[#020B06]/80 hover:bg-[#072418] ${tierClass}`}
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
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-48 p-2.5 bg-[#020B06] border border-emerald-600/50 rounded-xl text-left shadow-2xl z-30 pointer-events-none animate-in fade-in">
                        <div className="flex items-center space-x-1.5 text-[10px] font-mono font-bold text-white mb-0.5">
                          <IconComponent className="w-3.5 h-3.5 text-amber-400" />
                          <span>{medal.title}</span>
                        </div>
                        <p className="text-[9px] font-mono text-emerald-200/80 leading-snug">
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
            <div className="bg-[#020B06] border border-emerald-900/60 rounded-xl py-1.5 px-1">
              <span className="text-[8px] font-mono text-slate-400 uppercase block font-bold">Heists Done</span>
              <span className="text-xs font-black font-game text-[#10B981]">
                {stats.missionsCompleted || 0}
              </span>
            </div>
            <div className="bg-[#020B06] border border-emerald-900/60 rounded-xl py-1.5 px-1">
              <span className="text-[8px] font-mono text-slate-400 uppercase block font-bold">Vaults Cracked</span>
              <span className="text-xs font-black font-game text-cyan-400">
                {stats.vaultsCracked || 0}
              </span>
            </div>
            <div className="bg-[#020B06] border border-emerald-900/60 rounded-xl py-1.5 px-1">
              <span className="text-[8px] font-mono text-slate-400 uppercase block font-bold">Squad LP</span>
              <span className="text-xs font-black font-game text-amber-400">
                {lp} LP
              </span>
            </div>
          </div>

          {/* Card Footer: Security Barcode & Syndicate Seal */}
          <div className="relative z-10 pt-2 border-t border-emerald-900/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-emerald-400" />
              <div className="space-y-0.5">
                <div className="font-mono text-[8px] text-emerald-300/80 font-bold tracking-wider">
                  V.A.U.L.T // {rawAgentId.replace('VAULT-', '')}
                </div>
                <div className="font-mono text-[7px] text-slate-400">
                  CANOPY SYNDICATE CLEARANCE
                </div>
              </div>
            </div>

            {interactive && (
              <button
                onClick={handleFlipToggle}
                className="text-[9px] font-mono font-bold text-slate-300 hover:text-white flex items-center space-x-1 bg-[#020B06] hover:bg-[#072418] px-2.5 py-1 rounded-lg border border-emerald-800/60 transition-all"
              >
                <span>Dossier</span>
                <RotateCw className="w-3 h-3" />
              </button>
            )}
          </div>

        </div>

        {/* ============================================================
            BACK OF CARD — SYNDICATE OPERATIVE DOSSIER
            ============================================================ */}
        <div 
          className={`absolute inset-0 rounded-[22px] border-2 backface-hidden rotate-y-180 overflow-hidden p-5 flex flex-col justify-between bg-gradient-to-b ${activeTheme.bgGradient} shadow-[5px_5px_0px_#020C07]`}
          style={{ 
            borderColor: activeTheme.borderColor,
            boxShadow: `6px 6px 0px #020C07, 0 0 25px ${activeTheme.statGlow}`
          }}
        >
          {/* Header */}
          <div className="border-b border-emerald-900/60 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Fingerprint className="w-5 h-5 text-[#FBBF24]" />
                <div>
                  <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                    OPERATIVE DOSSIER
                  </h3>
                  <p className="text-[9px] font-mono text-emerald-300/70">
                    BIOMETRIC RECORD // {rawAgentId}
                  </p>
                </div>
              </div>
              {interactive && (
                <button
                  onClick={handleFlipToggle}
                  className="p-1.5 text-slate-400 hover:text-white bg-[#020B06] hover:bg-[#072418] border border-emerald-800/60 rounded-lg transition-colors"
                  title="Flip to Front"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Dossier Content */}
          <div className="space-y-3.5 py-2">
            <div className="bg-[#020B06]/80 border border-emerald-900/60 rounded-xl p-3 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Operative Callsign:</span>
                <span className="text-white font-bold">{callsign}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Assigned Specialization:</span>
                <span className="text-[#34D399] font-bold">{role}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Security Clearance:</span>
                <span className="text-[#FBBF24] font-bold">LEVEL {level}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Squad Loyalty Standing:</span>
                <span className="text-emerald-400 font-bold">{loyaltyRank.name} ({lp} LP)</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">MVP Commendations:</span>
                <span className="text-[#FBBF24] font-bold">{mvpCount} Trophies Awarded</span>
              </div>
            </div>

            {/* Specialization telemetry */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-300 font-bold block">
                Chamber Specializations
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="bg-[#020B06]/70 border border-emerald-900/50 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[8px]">PRIMARY DISCIPLINE</span>
                  <span className="text-white font-bold">{role}</span>
                </div>
                <div className="bg-[#020B06]/70 border border-emerald-900/50 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[8px]">EXTRACTION PROTOCOL</span>
                  <span className="text-emerald-400 font-bold">Sub-Zero Extraction</span>
                </div>
              </div>
            </div>

            {/* Security Cryptographic Hash */}
            <div className="bg-[#020B06]/90 border border-emerald-900/70 p-3 rounded-xl space-y-1">
              <span className="text-[8px] font-mono text-emerald-400/80 uppercase block font-bold">
                Cryptographic Signature // V.A.U.L.T Protocol
              </span>
              <p className="font-mono text-[9px] text-slate-300 break-all leading-tight">
                SHA-256: {rawAgentId.toLowerCase()}-77a94f81c9b4e0293d0a1
              </p>
            </div>
          </div>

          {/* Bottom Back Button */}
          <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between">
            <span className="text-[8px] font-mono text-slate-400">
              CONFIDENTIAL // V.A.U.L.T SYNDICATE
            </span>
            {interactive && (
              <button
                onClick={handleFlipToggle}
                className="text-[9px] font-mono font-bold text-[#FBBF24] hover:text-white flex items-center space-x-1 bg-[#020B06] hover:bg-[#072418] px-3 py-1.5 rounded-lg border border-amber-500/40 transition-all"
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
