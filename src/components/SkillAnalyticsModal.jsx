import React from 'react';
import { Trophy, Award, Sparkles, CheckCircle2, ShieldAlert, Clock, ArrowRight, RotateCcw, Flame, Terminal, Compass, FlaskConical, Key } from 'lucide-react';
import { heistAudio } from './HeistAudioEngine';

export default function SkillAnalyticsModal({ 
  isOpen, 
  isVictory, 
  stageTitle, 
  stats, 
  onNextStage, 
  onRetry, 
  onReturnToLobby 
}) {
  if (!isOpen) return null;

  const xpBreakdown = [
    { subject: "Computer Science (Logic & Code)", xp: stats.hackerXp || 350, icon: Terminal, color: "#10B981" },
    { subject: "Applied Physics & Geometry", xp: stats.engineerXp || 350, icon: Compass, color: "#FBBF24" },
    { subject: "Chemistry & Stoichiometry", xp: stats.scientistXp || 350, icon: FlaskConical, color: "#06B6D4" },
    { subject: "Cryptography & Linguistics", xp: stats.cryptoXp || 350, icon: Key, color: "#C084FC" },
  ];

  const totalXp = xpBreakdown.reduce((acc, curr) => acc + curr.xp, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020B06]/85 backdrop-blur-md animate-fade-in">
      <div className="forest-card max-w-2xl w-full p-6 sm:p-8 space-y-6 border-[4px] border-[#03140C] bg-[#051811] shadow-[12px_12px_0px_#020C07]">
        {/* Banner Header */}
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

        {/* Tactical Performance Telemetry */}
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
            <p className="text-lg font-mono font-black text-[#FBBF24]">+{totalXp}</p>
          </div>
        </div>

        {/* Cross-Disciplinary Subject Mastery Breakdown */}
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
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="flex items-center space-x-1.5 text-emerald-100">
                      <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                      <span>{item.subject}</span>
                    </span>
                    <span className="font-black text-[#FBBF24]">+{item.xp} XP</span>
                  </div>
                  <div className="h-2 w-full bg-[#020B06] border border-[#0E3A28] overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (item.xp / 400) * 100)}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
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
