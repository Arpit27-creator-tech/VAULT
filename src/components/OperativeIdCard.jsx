import React, { useState, useMemo } from 'react';
import { 
  Shield, Award, Trophy, Zap, Terminal, Clock, CheckCircle2, 
  Sparkles, Cpu, RotateCw, Copy, Check, Eye, Lock, Radio, Key, 
  Star, Flame, QrCode, Fingerprint, Compass, ShieldCheck
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
  BRONZE: 'border-[#CD7F32]/80 text-[#CD7F32] bg-[#CD7F32]/10 shadow-[0_0_10px_rgba(205,127,50,0.2)]',
  SILVER: 'border-slate-300/80 text-slate-200 bg-slate-300/10 shadow-[0_0_10px_rgba(224,231,255,0.2)]',
  GOLD: 'border-[#FBBF24]/80 text-[#FBBF24] bg-[#FBBF24]/15 shadow-[0_0_12px_rgba(251,191,36,0.3)]',
  PLATINUM: 'border-[#34D399]/80 text-[#34D399] bg-[#10B981]/15 shadow-[0_0_14px_rgba(52,211,153,0.35)]'
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

  const activeTheme = CARD_THEMES[config.theme] || CARD_THEMES.EMERALD_SYNDICATE;

  // Operative metrics
  const callsign = operative?.callsign || operative?.username || 'GHOST OPERATIVE';
  const rawAgentId = operative?.agentId || (
    operative?.id 
      ? `VAULT-${operative.id.replace(/-/g, '').substring(0, 8).toUpperCase()}` 
      : 'VAULT-00000000'
  );
  const role = operative?.role || 'Syndicate Operative';
  const level = operative?.level || 1;
  const xp = operative?.xp || 0;
  const { progress: levelProgress } = getLevelProgress(xp);
  const xpPercent = Math.min(100, Math.round(levelProgress * 100));

  // Squad Loyalty (strictly capped at 1000)
  const rawLp = typeof operative?.loyaltyPoints === 'number' ? operative.loyaltyPoints : 1000;
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
        className={`relative w-[340px] sm:w-[380px] min-h-[580px] transition-transform duration-700 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        
        {/* ============================================================
            FRONT OF CARD — BIOMETRIC SMART ID CLEARANCE PASS
            ============================================================ */}
        <div 
          className={`absolute inset-0 rounded-[24px] border backface-hidden overflow-hidden p-5 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.85)] bg-gradient-to-b ${activeTheme.bgGradient}`}
          style={{ 
            borderColor: activeTheme.borderColor,
            boxShadow: `0 20px 50px rgba(0,0,0,0.85), 0 0 25px ${activeTheme.statGlow}`
          }}
        >
          {/* Hologram Foil / Shimmer Overlay */}
          {isHolo && config.hologramShimmer && (
            <div 
              className="absolute inset-0 opacity-25 pointer-events-none mix-blend-overlay animate-holo-sheen"
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

          {/* Top Security Header */}
          <div className="relative z-10 border-b border-white/10 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center border font-mono font-black text-xs shadow-inner"
                  style={{ 
                    backgroundColor: `${activeTheme.primaryColor}22`,
                    borderColor: `${activeTheme.primaryColor}66`,
                    color: activeTheme.primaryColor 
                  }}
                >
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-[9px] font-black tracking-widest text-slate-300 uppercase">
                      V.A.U.L.T. CLEARANCE
                    </span>
                    <span 
                      className="text-[8px] font-mono font-black px-1.5 py-0.2 rounded uppercase"
                      style={{ 
                        backgroundColor: `${activeTheme.primaryColor}25`,
                        color: activeTheme.accentColor 
                      }}
                    >
                      LVL {level}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400">
                    ID // SYNDICATE OPERATIVE PASS
                  </p>
                </div>
              </div>

              {/* Status indicator & Flip toggle */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/10 text-[9px] font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 font-bold">ACTIVE</span>
                </div>
                {interactive && (
                  <button
                    onClick={handleFlipToggle}
                    className="p-1 text-slate-400 hover:text-white bg-black/40 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
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
            <div className="flex items-start space-x-4">
              
              {/* Photo in Biometric HUD Frame */}
              <div className="relative flex-shrink-0">
                <div 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 relative shadow-lg group"
                  style={{ borderColor: activeTheme.primaryColor }}
                >
                  <img 
                    src={avatarUrl} 
                    alt={callsign}
                    className="w-full h-full object-cover"
                  />
                  {/* Biometric Scanline sweep */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none animate-scanline" />
                  
                  {/* Cybernetic Corner Brackets */}
                  <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white/60 pointer-events-none" />
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white/60 pointer-events-none" />
                  <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white/60 pointer-events-none" />
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white/60 pointer-events-none" />

                  {/* Level Pill */}
                  <div 
                    className="absolute bottom-1 right-1 text-[9px] font-mono font-black px-1.5 py-0.5 rounded shadow-sm text-black"
                    style={{ backgroundColor: activeTheme.accentColor }}
                  >
                    L{level}
                  </div>
                </div>
              </div>

              {/* Identity Details */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <span 
                    className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border"
                    style={{ 
                      backgroundColor: `${activeTheme.primaryColor}20`,
                      borderColor: `${activeTheme.primaryColor}40`,
                      color: activeTheme.accentColor 
                    }}
                  >
                    {role}
                  </span>
                  {mvpCount > 0 && (
                    <span className="flex items-center space-x-1 text-[9px] font-mono font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40">
                      <Trophy className="w-2.5 h-2.5 fill-current" />
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
                    className="flex items-center space-x-1 text-[11px] font-mono font-black px-2 py-0.5 rounded bg-black/50 border border-white/15 hover:border-white/40 text-amber-300 hover:text-white transition-all shadow-inner group"
                    title="Click to copy Agent ID"
                  >
                    <span>{rawAgentId}</span>
                    {copiedId ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400 group-hover:text-white" />
                    )}
                  </button>
                </div>

                {/* Custom Motto / Slogan */}
                <p className="text-[11px] text-slate-300 font-mono italic truncate pt-1 leading-snug">
                  "{config.motto || 'Apex Infiltrator // Zero Trace'}"
                </p>
              </div>

            </div>
          </div>

          {/* Progression Dual Telemetry (XP & Squad LP) */}
          <div className="relative z-10 bg-black/40 border border-white/10 rounded-xl p-2.5 space-y-2.5 shadow-inner">
            
            {/* XP Progression */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-400 font-bold flex items-center space-x-1">
                  <Star className="w-3 h-3 text-amber-400" />
                  <span>Level {level} Infiltrator</span>
                </span>
                <span className="text-amber-300 font-bold">
                  {xp.toLocaleString()} XP ({xpPercent}%)
                </span>
              </div>
              <div className="w-full bg-[#020B06] h-1.5 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ 
                    width: `${xpPercent}%`,
                    backgroundColor: activeTheme.accentColor 
                  }}
                />
              </div>
            </div>

            {/* Squad Loyalty Progress Bar (Clamped strictly to 1000) */}
            <div className="space-y-1 border-t border-white/10 pt-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-400 font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Squad Loyalty ({loyaltyRank.emoji} {loyaltyRank.name})</span>
                </span>
                <span className="text-emerald-300 font-bold">
                  {lp.toLocaleString()} / 1,000 LP
                </span>
              </div>
              <div className="w-full bg-[#020B06] h-1.5 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#10B981] transition-all duration-500 shadow-sm"
                  style={{ width: `${lpPercent}%` }}
                />
              </div>
            </div>

          </div>

          {/* Showcased Medals & Pins */}
          <div className="relative z-10 py-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-black uppercase text-slate-400 tracking-wider flex items-center space-x-1">
                <Award className="w-3 h-3 text-amber-400" />
                <span>Showcased Medals</span>
              </span>
              <span className="text-[9px] font-mono text-slate-500">
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
                    className={`relative p-2 rounded-xl border text-center transition-all cursor-pointer bg-black/40 hover:bg-black/60 ${tierClass}`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-mono font-bold block truncate leading-tight">
                      {medal.title}
                    </span>
                    <span className="text-[8px] font-mono uppercase opacity-75 block">
                      {medal.tier}
                    </span>

                    {/* Hover Tooltip */}
                    {isHovered && (
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-44 p-2 bg-[#020B06] border border-white/20 rounded-lg text-left shadow-2xl z-30 pointer-events-none animate-in fade-in">
                        <div className="flex items-center space-x-1 text-[10px] font-mono font-bold text-white mb-0.5">
                          <IconComponent className="w-3 h-3 text-amber-400" />
                          <span>{medal.title}</span>
                        </div>
                        <p className="text-[9px] font-mono text-slate-300 leading-snug">
                          {medal.desc}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Telemetry Micro Grid */}
          <div className="relative z-10 grid grid-cols-3 gap-1.5 py-1 text-center">
            <div className="bg-black/30 border border-white/10 rounded-lg py-1.5 px-1">
              <span className="text-[8px] font-mono text-slate-400 uppercase block">Heists Done</span>
              <span className="text-xs font-black font-game text-white">
                {stats.missionsCompleted || 0}
              </span>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-lg py-1.5 px-1">
              <span className="text-[8px] font-mono text-slate-400 uppercase block">Vaults Cracked</span>
              <span className="text-xs font-black font-game text-cyan-300">
                {stats.vaultsCracked || 0}
              </span>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-lg py-1.5 px-1">
              <span className="text-[8px] font-mono text-slate-400 uppercase block">Infiltrate Win %</span>
              <span className="text-xs font-black font-game text-emerald-300">
                {stats.winRate || 100}%
              </span>
            </div>
          </div>

          {/* Card Footer: Security Barcode & Smart Card Chip */}
          <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-slate-400" />
              <div className="space-y-0.5">
                <div className="font-mono text-[8px] text-slate-400 tracking-wider">
                  AUTH // {rawAgentId.replace('VAULT-', '')}
                </div>
                <div className="font-mono text-[7px] text-slate-500">
                  SEC-ZONE // SYNDICATE-NET
                </div>
              </div>
            </div>

            {interactive && (
              <button
                onClick={handleFlipToggle}
                className="text-[9px] font-mono font-bold text-slate-400 hover:text-white flex items-center space-x-1 bg-black/40 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/15 transition-all"
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
          className={`absolute inset-0 rounded-[24px] border backface-hidden rotate-y-180 overflow-hidden p-5 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.85)] bg-gradient-to-b ${activeTheme.bgGradient}`}
          style={{ 
            borderColor: activeTheme.borderColor,
            boxShadow: `0 20px 50px rgba(0,0,0,0.85), 0 0 25px ${activeTheme.statGlow}`
          }}
        >
          {/* Header */}
          <div className="border-b border-white/10 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Fingerprint className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                    OPERATIVE DOSSIER
                  </h3>
                  <p className="text-[9px] font-mono text-slate-400">
                    BIOMETRIC SECURITY RECORD // {rawAgentId}
                  </p>
                </div>
              </div>
              {interactive && (
                <button
                  onClick={handleFlipToggle}
                  className="p-1 text-slate-400 hover:text-white bg-black/40 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                  title="Flip to Front"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Dossier Content */}
          <div className="space-y-3.5 py-2">
            <div className="bg-black/40 border border-white/10 rounded-xl p-3 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Enlistment Role:</span>
                <span className="text-white font-bold">{role}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Security Clearance:</span>
                <span className="text-amber-300 font-bold">LEVEL {level}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Loyalty Designation:</span>
                <span className="text-emerald-400 font-bold">{loyaltyRank.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Syndicate MVP Trophies:</span>
                <span className="text-yellow-400 font-bold">{mvpCount} Awarded</span>
              </div>
            </div>

            {/* Specialization telemetry */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Combat & Breach Protocols
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="bg-black/30 border border-white/10 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[8px]">PRIMARY SKILL</span>
                  <span className="text-white font-bold">Neural Cryptography</span>
                </div>
                <div className="bg-black/30 border border-white/10 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[8px]">EXTRACTION</span>
                  <span className="text-emerald-400 font-bold">Sub-Zero Protocol</span>
                </div>
              </div>
            </div>

            {/* Signature Hash */}
            <div className="bg-black/50 border border-white/10 p-3 rounded-xl space-y-1">
              <span className="text-[8px] font-mono text-slate-500 uppercase block">
                Cryptographic Authentication Hash
              </span>
              <p className="font-mono text-[9px] text-slate-400 break-all leading-tight">
                SHA-256: {rawAgentId.toLowerCase()}-77a94f81c9b4e0293d0a1
              </p>
            </div>
          </div>

          {/* Bottom Back Button */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[8px] font-mono text-slate-500">
              CONFIDENTIAL // V.A.U.L.T HQ
            </span>
            {interactive && (
              <button
                onClick={handleFlipToggle}
                className="text-[9px] font-mono font-bold text-amber-300 hover:text-white flex items-center space-x-1 bg-black/40 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all"
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
