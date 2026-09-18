import React, { useEffect, useRef, useState } from 'react';
import { 
  Trophy, Award, Sparkles, CheckCircle2, ShieldAlert, Clock, 
  ArrowRight, RotateCcw, Flame, Terminal, Compass, FlaskConical, Key,
  MapPin, BookOpen, Lightbulb, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { heistAudio } from './HeistAudioEngine';
import { calculateLevel, getLevelProgress } from '../utils/leveling';

export default function SkillAnalyticsModal({ 
  isOpen, 
  isVictory, 
  stageTitle, 
  stats, 
  stageData,
  solvedRoles = {},
  currentUser,
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
