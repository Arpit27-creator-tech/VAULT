import React, { useEffect, useRef, useState } from 'react';
import { 
  Trophy, Award, Sparkles, CheckCircle2, ShieldAlert, Clock, 
  ArrowRight, RotateCcw, Flame, Terminal, Compass, FlaskConical, Key,
  MapPin, BookOpen, Lightbulb, Zap, Crown, Shield, ThumbsUp, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { heistAudio } from './HeistAudioEngine';
import { calculateLevel, getLevelProgress } from '../utils/leveling';
import { incrementMvpCount } from '../utils/mvpAwards';

export default function SkillAnalyticsModal({ 
  isOpen, 
  isVictory, 
  stageTitle, 
  stats = {}, 
  stageData,
  solvedRoles = {},
  currentUser,
  lobby,
  activeCockpitRole,
  totalCareerXp,
  onNextStage, 
  onRetry, 
  onReturnToLobby,
  onOpenRoadmap
}) {
  const [revealStep, setRevealStep] = useState(0);
  const cleanupRef = useRef(null);

  const xpBreakdown = [
    { subject: "Computer Science (Logic & Code)", xp: stats.hackerXp || 350, icon: Terminal, color: "#10B981" },
    { subject: "Applied Physics & Geometry", xp: stats.engineerXp || 350, icon: Compass, color: "#FBBF24" },
    { subject: "Chemistry & Stoichiometry", xp: stats.scientistXp || 350, icon: FlaskConical, color: "#06B6D4" },
    { subject: "Cryptography & Linguistics", xp: stats.cryptoXp || 350, icon: Key, color: "#C084FC" },
  ];

  const comboBonus = stats.comboBonus || 0;
  const totalXp = stats.totalXpGain || (xpBreakdown.reduce((acc, curr) => acc + curr.xp, 0) + comboBonus);

  // Career Total XP and level progression math — prioritize explicit stats from heist completion
  const currentTotalXp = Number.isFinite(stats.newTotalXp)
    ? stats.newTotalXp
    : (Number.isFinite(totalCareerXp) ? totalCareerXp : (currentUser?.xp ?? 1200));

  const prevTotalXp = Number.isFinite(stats.prevTotalXp)
    ? stats.prevTotalXp
    : Math.max(0, currentTotalXp - totalXp);

  const prevLevelInfo = getLevelProgress(prevTotalXp);
  const newLevelInfo = getLevelProgress(currentTotalXp);

  const [animatedGainedXp, setAnimatedGainedXp] = useState(0);
  const [animatedTotalXp, setAnimatedTotalXp] = useState(prevTotalXp);
  const [animatedProgress, setAnimatedProgress] = useState(prevLevelInfo.progress);
  const [isLevelUp, setIsLevelUp] = useState(false);
  const [flyoutActive, setFlyoutActive] = useState(false);

  // ── MVP & Operative Commendation Badges ─────────────────────────────
  const [mvpVotes, setMvpVotes] = useState({});
  const [votedForId, setVotedForId] = useState(null);

  const realPlayers = (lobby?.players || []).filter(p => p.userId || p.username || p.callsign);
  const isMultiplayer = realPlayers.length > 1;

  const defaultRoleCrew = [
    { key: 'hacker', roleLabel: 'Canopy Hacker', defaultName: 'Agent Vance', color: '#10B981' },
    { key: 'engineer', roleLabel: 'Woodland Engineer', defaultName: 'Agent Chen', color: '#FBBF24' },
    { key: 'scientist', roleLabel: 'Flora Scientist', defaultName: 'Agent Rostova', color: '#06B6D4' },
    { key: 'cryptographer', roleLabel: 'Mist Cryptographer', defaultName: 'Agent Lin', color: '#C084FC' },
  ];

  const operatives = (isMultiplayer ? realPlayers : defaultRoleCrew).map((item, idx) => {
    const isCurrentUser = isMultiplayer
      ? (item.userId === currentUser?.id || item.username === currentUser?.username)
      : (item.key === activeCockpitRole || idx === 0);
    const roleKey = item.role ? (typeof item.role === 'string' ? item.role.toLowerCase() : 'hacker') : (item.key || 'hacker');
    const matchedCrew = defaultRoleCrew.find(c => c.key === roleKey) || defaultRoleCrew[idx % 4];
    const name = item.callsign || item.username || (isCurrentUser ? (currentUser?.callsign || currentUser?.username) : matchedCrew.defaultName);

    // Dynamic badge logic based on role & heist telemetry
    let badge;
    if (idx === 0 || (isCurrentUser && (stats.maxCombo >= 2 || stats.alarmsTripped === 0))) {
      badge = {
        title: "Clutch Master",
        tag: "👑 CLUTCH MASTER",
        icon: Crown,
        color: "#EC4899",
        bg: "rgba(236,72,153,0.15)",
        border: "#BE185D",
        desc: "Neutralized mission-critical locks under extreme pressure."
      };
    } else if (idx === 1 || stats.alarmsTripped === 0) {
      badge = {
        title: "Silent Specialist",
        tag: "🤫 SILENT SPECIALIST",
        icon: Shield,
        color: "#10B981",
        bg: "rgba(16,185,129,0.15)",
        border: "#059669",
        desc: "Zero security misfires. Maintained pristine acoustic stealth."
      };
    } else if (idx === 2) {
      badge = {
        title: "Fastest Solver",
        tag: "⚡ FASTEST SOLVER",
        icon: Zap,
        color: "#FBBF24",
        bg: "rgba(251,191,36,0.15)",
        border: "#D97706",
        desc: "Clocked the quickest sub-routine override in the squad."
      };
    } else {
      badge = {
        title: "Tactical Anchor",
        tag: "🎯 TACTICAL ANCHOR",
        icon: Award,
        color: "#8B5CF6",
        bg: "rgba(139,92,246,0.15)",
        border: "#7C3AED",
        desc: "Coordinated pipeline telemetry to keep the infiltration aligned."
      };
    }

    return {
      id: item.userId || item.id || `crew-${idx}`,
      name: name || `Agent ${idx + 1}`,
      roleLabel: matchedCrew.roleLabel,
      roleColor: matchedCrew.color,
      isCurrentUser,
      badge,
      avatar: item.avatar || null,
      baseVotes: idx === 0 ? 1 : 0
    };
  });

  const hasAwardedMvpRef = useRef(false);

  const handleVoteForOperative = (opId, opName) => {
    if (votedForId) {
      toast.info("You already cast your MVP vote for this operation!");
      return;
    }
    setMvpVotes(prev => ({
      ...prev,
      [opId]: (prev[opId] || 0) + 1
    }));
    setVotedForId(opId);
    heistAudio.playSuccessChime();
    toast.success(`🎖️ Voted ${opName} as MVP of the Operation! (+25 Commendation XP)`);

    const targetOp = operatives.find(o => o.id === opId);
    if (targetOp?.isCurrentUser && !hasAwardedMvpRef.current) {
      hasAwardedMvpRef.current = true;
      incrementMvpCount(currentUser);
    }
  };

  const topMvp = operatives.reduce((best, op) => {
    const currentScore = (mvpVotes[op.id] || 0) + (op.baseVotes || 0);
    const bestScore = (mvpVotes[best.id] || 0) + (best.baseVotes || 0);
    return currentScore > bestScore ? op : best;
  }, operatives[0]);

  // Award MVP count on victory if current operative is crowned MVP
  useEffect(() => {
    if (!isOpen || !isVictory || hasAwardedMvpRef.current) return;
    if (topMvp?.isCurrentUser) {
      hasAwardedMvpRef.current = true;
      incrementMvpCount(currentUser);
    }
  }, [isOpen, isVictory, topMvp, currentUser]);

  // Because the parent passes a new `key` each heist, this component fully remounts
  // each time the modal opens — useState values start fresh from the current props.
  // We run the animation on mount (with a small delay so the DOM is ready).
  useEffect(() => {
    if (!isOpen) return;

    // Snapshot the XP values at mount time to avoid stale-closure drift
    const snapPrev = prevTotalXp;
    const snapNew = currentTotalXp;
    const snapTotalGain = totalXp;
    const snapPrevProgress = prevLevelInfo.progress;
    const snapNewProgress = newLevelInfo.progress;
    const snapPrevLevel = prevLevelInfo.level;
    const snapNewLevel = newLevelInfo.level;
    const roleSteps = xpBreakdown.length + (comboBonus > 0 ? 1 : 0);

    // Small delay so the modal render is flushed before animation starts
    let step = 0;
    const startAnimation = () => {
      const interval = setInterval(() => {
        step += 1;
        setRevealStep(step);

        // Gained XP count-up at step 1
        if (step === 1) {
          const startGained = performance.now();
          const durationGained = 900;
          let lastTickGained = 0;
          const tickGained = (now) => {
            const prog = Math.min(1, (now - startGained) / durationGained);
            const ease = 1 - Math.pow(1 - prog, 3);
            setAnimatedGainedXp(Math.round(ease * snapTotalGain));
            if (now - lastTickGained > 80 && prog < 1) {
              heistAudio.playKeyClick();
              lastTickGained = now;
            }
            if (prog < 1) requestAnimationFrame(tickGained);
          };
          requestAnimationFrame(tickGained);
        }

        // Career XP + level bar animation at step 2
        if (step === 2) {
          setFlyoutActive(true);
          const startCareer = performance.now();
          const durationCareer = 1400;
          let lastTickCareer = 0;
          const tickCareer = (now) => {
            const prog = Math.min(1, (now - startCareer) / durationCareer);
            const ease = 1 - Math.pow(1 - prog, 3);
            const currentTotal = Math.round(snapPrev + ease * (snapNew - snapPrev));
            const currentProg = snapPrevProgress + ease * (snapNewProgress - snapPrevProgress);
            setAnimatedTotalXp(currentTotal);
            setAnimatedProgress(currentProg);
            if (now - lastTickCareer > 75 && prog < 1) {
              heistAudio.playKeyClick();
              lastTickCareer = now;
            }
            if (prog < 1) {
              requestAnimationFrame(tickCareer);
            } else {
              if (snapNewLevel > snapPrevLevel) {
                setIsLevelUp(true);
                heistAudio.playSuccessChime();
              }
            }
          };
          requestAnimationFrame(tickCareer);
        }

        if (step >= roleSteps + 2) clearInterval(interval);
      }, 180);
      return interval;
    };

    const timer = setTimeout(() => {
      const interval = startAnimation();
      // store interval ref for cleanup via closure
      cleanupRef.current = () => clearInterval(interval);
    }, 80);

    return () => {
      clearTimeout(timer);
      if (cleanupRef.current) cleanupRef.current();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020B06]/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="forest-card max-w-2xl w-full p-6 sm:p-8 space-y-6 border-[4px] border-[#03140C] bg-[#051811] shadow-[12px_12px_0px_#020C07] max-h-[95vh] overflow-y-auto">
        <div className="text-center space-y-2 border-b-2 border-[#03140C] pb-5">
          <div className="inline-flex items-center justify-center p-3 rounded-none border-2 border-[#03140C] mb-2 bg-[#020B06]">
            {isVictory ? (
              <Trophy className="w-10 h-10 text-[#FBBF24] animate-bounce" />
            ) : (
              <ShieldAlert className="w-10 h-10 text-[#FF4D6D] animate-pulse" />
            )}
          </div>
          
          <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${
            isVictory ? 'text-[#FBBF24]' : 'text-[#FF4D6D]'
          }`}>
            {isVictory ? "🎉 MISSION DEBRIEF: EXTRACTION SUCCESS!" : "🚨 MISSION COMPROMISED: FACILITY LOCKDOWN!"}
          </h2>
          
          <p className="text-emerald-200 text-xs sm:text-sm font-medium">
            {stageTitle} — {isVictory ? "All interlocked chamber locks neutralized." : "Security grid tripped before payload extraction."}
          </p>
        </div>

        {!isVictory && (
          <div className="bg-[#1C0D12] border-[3px] border-[#FF4D6D] p-4 sm:p-5 space-y-3 shadow-[4px_4px_0px_#020C07]">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-[#FBBF24] animate-bounce" />
              <h3 className="font-mono text-xs sm:text-sm font-black uppercase text-[#F0FDF4] tracking-wider">
                🗺️ ADAPTIVE REMEDIATION ROADMAP GENERATED!
              </h3>
            </div>
            
            <p className="text-xs text-red-100 font-medium leading-relaxed">
              We identified the exact STEM concepts that caused extraction failure. An automated study roadmap with <strong>topic deep-dives, formula cheat-sheets, and practice drills</strong> has been assembled for your squad!
            </p>

            <button
              onClick={() => {
                heistAudio.playKeyClick();
                if (onOpenRoadmap) onOpenRoadmap();
              }}
              className="w-full bg-[#FBBF24] text-[#02140D] font-black py-3 px-4 border-[3px] border-[#03140C] shadow-[3px_3px_0px_#020C07] hover:bg-[#F59E0B] active:translate-x-0.5 uppercase flex items-center justify-center space-x-2 text-xs sm:text-sm"
            >
              <BookOpen className="w-4 h-4 stroke-[2.5]" />
              <span>Explore Personalized Learning Roadmap & Topics</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-[#020B06] p-3 border border-emerald-900/60">
            <span className="text-[10px] font-mono text-emerald-400 uppercase">Time Elapsed</span>
            <p className="text-lg font-mono font-black text-[#F0FDF4]">{stats.timeElapsed || '1m 24s'}</p>
          </div>
          <div className="bg-[#020B06] p-3 border border-emerald-900/60">
            <span className="text-[10px] font-mono text-emerald-400 uppercase">Accuracy Rate</span>
            <p className="text-lg font-mono font-black text-[#10B981]">{stats.accuracy || '94.2%'}</p>
          </div>
          <div className="bg-[#020B06] p-3 border border-emerald-900/60">
            <span className="text-[10px] font-mono text-emerald-400 uppercase">Alarm Incidents</span>
            <p className={`text-lg font-mono font-black ${stats.alarmsTripped > 0 ? 'text-[#FF4D6D]' : 'text-[#10B981]'}`}>
              {stats.alarmsTripped || 0}
            </p>
          </div>
          <div className="bg-[#020B06] p-3 border border-emerald-900/60">
            <span className="text-[10px] font-mono text-emerald-400 uppercase">Total XP Gained</span>
            <p className="text-lg font-mono font-black text-[#FBBF24]">
              {revealStep >= xpBreakdown.length + (comboBonus > 0 ? 1 : 0) + 1 ? `+${animatedGainedXp}` : '???'}
            </p>
          </div>
        </div>

        {/* ── MVP of the Operation & Operative Commendation Badges ── */}
        <div className="bg-[#020F08] border-2 border-[#FBBF24]/80 p-4 sm:p-5 rounded-2xl shadow-[0_0_24px_rgba(251,191,36,0.2)] space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FBBF24]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/30 pb-3 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FBBF24] border-2 border-black flex items-center justify-center text-xl shadow-[3px_3px_0px_#000] flex-shrink-0">
                🏆
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                    Tactical Debrief Accolades
                  </span>
                  <span className="bg-[#FBBF24]/20 text-[#FDE047] text-[10px] font-mono font-black px-2 py-0.5 rounded border border-[#FBBF24]/40">
                    SQUAD VOTES ACTIVE
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black font-game text-white uppercase tracking-tight">
                  MVP of the Operation
                </h3>
              </div>
            </div>

            {/* Current Top MVP Crown Tag */}
            {topMvp && (
              <div className="flex items-center space-x-2 bg-[#051F14] border border-[#FBBF24]/70 px-3 py-1.5 rounded-xl shadow-sm">
                <Crown className="w-4 h-4 text-[#FBBF24] animate-pulse" />
                <span className="text-xs font-mono text-slate-300">Frontrunner:</span>
                <span className="text-xs font-black font-game text-[#FBBF24]">
                  {topMvp.name}
                </span>
                <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                  {(mvpVotes[topMvp.id] || 0) + (topMvp.baseVotes || 0)} 🎖️
                </span>
              </div>
            )}
          </div>

          {/* Operatives Badges Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
            {operatives.map((op) => {
              const BadgeIcon = op.badge.icon;
              const isTop = topMvp?.id === op.id;
              const totalOpVotes = (mvpVotes[op.id] || 0) + (op.baseVotes || 0);
              const isSelectedByMe = votedForId === op.id;

              return (
                <div
                  key={op.id}
                  className={`p-3.5 rounded-xl border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                    isTop
                      ? 'border-[#FBBF24] bg-[#0A261B]/90 shadow-[0_0_16px_rgba(251,191,36,0.2)]'
                      : 'border-emerald-900/60 bg-[#03140C] hover:border-emerald-700/60'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Role + MVP Crown if Top */}
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border"
                        style={{ color: op.roleColor, borderColor: `${op.roleColor}40`, backgroundColor: `${op.roleColor}15` }}
                      >
                        {op.roleLabel}
                      </span>
                      {isTop && (
                        <span className="inline-flex items-center space-x-1 bg-[#FBBF24] text-[#02140D] font-mono font-black text-[10px] px-2 py-0.5 rounded-md border border-black shadow-[1px_1px_0px_#000]">
                          <Crown className="w-3 h-3 fill-current" />
                          <span>MVP</span>
                        </span>
                      )}
                    </div>

                    {/* Operative Name */}
                    <div className="flex items-center space-x-2">
                      <span className="font-game font-black text-sm text-white">
                        {op.name}
                      </span>
                      {op.isCurrentUser && (
                        <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                          YOU
                        </span>
                      )}
                    </div>

                    {/* Assigned Badge */}
                    <div
                      className="p-2 rounded-lg border flex items-start space-x-2"
                      style={{ backgroundColor: op.badge.bg, borderColor: op.badge.border }}
                    >
                      <BadgeIcon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: op.badge.color }} />
                      <div className="min-w-0">
                        <span className="font-mono font-black text-[11px] block" style={{ color: op.badge.color }}>
                          {op.badge.tag}
                        </span>
                        <p className="text-[10px] font-mono text-slate-300 leading-tight mt-0.5">
                          {op.badge.desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Votes & Vote Button */}
                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-emerald-900/40">
                    <span className="text-[11px] font-mono text-amber-300 font-bold flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{totalOpVotes} {totalOpVotes === 1 ? 'Vote' : 'Votes'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleVoteForOperative(op.id, op.name)}
                      disabled={Boolean(votedForId)}
                      className={`text-xs font-mono font-black px-3 py-1.5 rounded-lg border uppercase transition-all flex items-center space-x-1.5 ${
                        isSelectedByMe
                          ? 'bg-[#FBBF24] text-[#02140D] border-black shadow-[2px_2px_0px_#000]'
                          : votedForId
                          ? 'bg-[#020B06] text-slate-500 border-emerald-950 cursor-not-allowed'
                          : 'bg-[#06291B] hover:bg-[#10B981] text-[#34D399] hover:text-[#02140D] border-[#10B981]/50 active:translate-x-0.5 shadow-sm'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{isSelectedByMe ? 'Voted ✓' : 'Vote MVP'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 bg-[#03140C] p-4 border border-emerald-900/60">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-emerald-300 font-black uppercase flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-[#FBBF24]" />
              <span>Cross-Disciplinary Skill Analytics</span>
            </span>
            <span className="text-emerald-400">Bloom's Taxonomy: Applied Synthesis</span>
          </div>

          <div className="space-y-2.5">
            {xpBreakdown.map((item, idx) => {
              const Icon = item.icon;
              const revealed = revealStep > idx;
              return (
                <div
                  key={idx}
                  className={`space-y-1 transition-all duration-300 ${
                    revealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'
                  }`}
                >
                  <div className="flex justify-between text-xs font-mono">
                    <span className="flex items-center space-x-1.5 text-emerald-100">
                      <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                      <span>{item.subject}</span>
                    </span>
                    <span className="font-black text-[#FBBF24]">{revealed ? `+${item.xp} XP` : ''}</span>
                  </div>
                  <div className="h-2 w-full bg-[#020B06] border border-[#0E3A28] overflow-hidden">
                    <div 
                      className="h-full transition-all duration-700"
                      style={{ width: revealed ? `${Math.min(100, (item.xp / 400) * 100)}%` : '0%', backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}

            {comboBonus > 0 && (
              <div
                className={`space-y-1 pt-2 border-t border-emerald-900/60 transition-all duration-300 ${
                  revealStep > xpBreakdown.length ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'
                }`}
              >
                <div className="flex justify-between text-xs font-mono">
                  <span className="flex items-center space-x-1.5 text-[#FBBF24]">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{stats.maxCombo}x Combo Bonus (no-miss streak)</span>
                  </span>
                  <span className="font-black text-[#FBBF24]">
                    {revealStep > xpBreakdown.length ? `+${comboBonus} XP` : ''}
                  </span>
                </div>
                <div className="h-2 w-full bg-[#020B06] border border-[#0E3A28] overflow-hidden">
                  <div
                    className="h-full transition-all duration-700 bg-[#FBBF24]"
                    style={{ width: revealStep > xpBreakdown.length ? '100%' : '0%' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Career Total XP Progression & Level Progression */}
        <div className="bg-[#020D07] border-2 border-[#10B981] p-4 sm:p-5 rounded-xl space-y-3 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/60 pb-3">
            <div className="flex items-center space-x-3">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="Avatar" className="w-9 h-9 rounded-lg border-2 border-[#10B981] object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-lg border-2 border-[#10B981] bg-[#051F14] flex items-center justify-center font-bold text-[#10B981] font-mono">
                  OP
                </div>
              )}
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                  Operative Career Progression
                </span>
                <span className="text-sm font-game font-black text-white">
                  {currentUser?.callsign || currentUser?.username || 'Field Operative'}
                </span>
              </div>
            </div>

            {/* Level badge */}
            <div className="flex items-center space-x-2">
              <AnimatePresence>
                {isLevelUp && (
                  <motion.span 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#FBBF24] text-[#02140D] text-[10px] font-black font-game px-2 py-0.5 rounded uppercase animate-bounce shadow-md"
                  >
                    🎉 LEVEL UP!
                  </motion.span>
                )}
              </AnimatePresence>
              <div className="flex items-center space-x-1.5 bg-[#051F14] px-3 py-1 rounded-lg border border-emerald-800/80 font-mono text-xs">
                <span className="text-slate-400">Level:</span>
                <span className="text-[#FBBF24] font-black font-game text-sm">LVL {isLevelUp ? newLevelInfo.level : prevLevelInfo.level}</span>
              </div>
            </div>
          </div>

          {/* XP Numbers: [Prev XP] + [Gained XP] ➔ [Total XP] */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Total Career XP:</span>
              <span className="text-[#10B981] font-black text-sm">
                {animatedTotalXp.toLocaleString()} XP
              </span>
            </div>

            {/* Flying XP Gain Badge */}
            <AnimatePresence>
              {flyoutActive && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.7, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="flex items-center space-x-1 bg-[#FBBF24]/20 border border-[#FBBF24] px-2.5 py-0.5 rounded-full text-[#FBBF24] font-black font-game text-xs shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                >
                  <Sparkles className="w-3 h-3 text-[#FBBF24]" />
                  <span>+{totalXp} XP Added!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Animated Progress Bar toward next level */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>XP to Level {(isLevelUp ? newLevelInfo.level : prevLevelInfo.level) + 1}</span>
              <span className="text-emerald-300 font-bold">{Math.round(animatedProgress * 100)}%</span>
            </div>
            <div className="h-3 w-full bg-[#020B06] border border-emerald-900 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#FBBF24] rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${Math.min(100, Math.round(animatedProgress * 100))}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {isVictory ? (
            <button
              onClick={onNextStage}
              className="flex-1 bg-[#10B981] text-[#02140D] font-black py-3.5 px-6 border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#34D399] active:translate-x-0.5 uppercase flex items-center justify-center space-x-2"
            >
              <span>Advance to Next Stage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onRetry}
              className="flex-1 bg-[#FF4D6D] text-white font-black py-3.5 px-6 border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#FF3366] active:translate-x-0.5 uppercase flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Stage</span>
            </button>
          )}

          <button
            onClick={onReturnToLobby}
            className="bg-[#0A261B] text-[#F0FDF4] font-black py-3.5 px-6 border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#0F3828] active:translate-x-0.5 uppercase"
          >
            Lobby Menu
          </button>
        </div>
      </div>
    </div>
  );
}
