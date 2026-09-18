import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, CheckCircle2, Lock, Unlock, Sparkles, FlaskConical, 
  Compass, Terminal, Key, Shield, ShieldCheck, Zap, Activity,
  Info, ChevronDown, ChevronUp, Radio, Sliders, Eye
} from 'lucide-react';
import { heistAudio } from './HeistAudioEngine';

// ─── Default 4-Role Relay Chain Definition ────────────────────────────────────
// Chronological scientific dependency chain:
// Scientist (Reagents/Density) ➔ Engineer (Snell's Law/Port) ➔ Hacker (Array/Cipher) ➔ Cryptographer (VHF/Master Key) ➔ VAULT
const DEFAULT_CHAIN = [
  {
    role: 'scientist',
    title: 'Scientist',
    icon: FlaskConical,
    color: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    discipline: 'Chemistry & Bio',
    method: 'Stoichiometry & Reagents',
    prereqRole: null,
    nextRole: 'engineer',
    inputNeed: 'Autonomous entry (Initiates operation)',
    outputRelay: 'Refraction Index n=1.42 (Feeds Laser Array)',
    tag: 'REAGENT PH',
  },
  {
    role: 'engineer',
    title: 'Engineer',
    icon: Compass,
    color: '#FBBF24',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    discipline: 'Physics & Optics',
    method: 'Snell\'s Law & Laser Refraction',
    prereqRole: 'scientist',
    nextRole: 'hacker',
    inputNeed: 'Requires optical density n from Scientist',
    outputRelay: 'Illuminates Security Port 0x7E3A coordinates',
    tag: 'LASER ANGLE',
  },
  {
    role: 'hacker',
    title: 'Hacker',
    icon: Terminal,
    color: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    discipline: 'Computer Science',
    method: 'Memory Array Buffer Slicing',
    prereqRole: 'engineer',
    nextRole: 'cryptographer',
    inputNeed: 'Injects payload into port from Engineer',
    outputRelay: 'Extracts SLYV-782 Ciphertext stream',
    tag: 'KERNEL SLICE',
  },
  {
    role: 'cryptographer',
    title: 'Cryptographer',
    icon: Key,
    color: '#C084FC',
    glowColor: 'rgba(192, 132, 252, 0.4)',
    discipline: 'Discrete Math',
    method: 'VHF Frequency Shift Deciphering',
    prereqRole: 'hacker',
    nextRole: 'vault',
    inputNeed: 'Decodes encrypted payload from Hacker',
    outputRelay: 'Generates Vault Master Safe Passcode',
    tag: 'VHF CIPHER',
  },
];

export default function InterdependenceMatrix({ stageData, solvedRoles = {}, roleClues = {} }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('schematic'); // 'schematic' | 'compact'
  const [lastSolvedCount, setLastSolvedCount] = useState(0);

  // Filter steps if custom heist selected fewer roles
  const activeSteps = stageData?.selectedRoles
    ? DEFAULT_CHAIN.filter(s => stageData.selectedRoles[s.role])
    : DEFAULT_CHAIN;

  const solvedCount = activeSteps.filter(s => !!solvedRoles[s.role]).length;
  const totalCount = activeSteps.length;
  const progressPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
  const isFullySolved = solvedCount === totalCount && totalCount > 0;

  // Trigger subtle sound effect when a new role is solved
  useEffect(() => {
    if (solvedCount > lastSolvedCount && lastSolvedCount > 0) {
      try {
        heistAudio.playRadioSquelch();
      } catch {}
    }
    setLastSolvedCount(solvedCount);
  }, [solvedCount, lastSolvedCount]);

  return (
    <div className="bg-[#051C12]/95 border-2 border-emerald-800/40 rounded-xl p-3.5 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-md relative overflow-hidden transition-all text-left">
      {/* Background glowing energy grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#10B981 1px, transparent 1px), linear-gradient(90deg, #10B981 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10 border-b border-emerald-900/50 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-[#020B06] border border-emerald-500/40 text-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm font-black uppercase font-mono tracking-wider text-[#F0FDF4]">
                SYNCHRONOUS CLUE RELAY CIRCUIT
              </span>
              <span className="hidden sm:inline-flex items-center space-x-1 bg-[#10B981]/15 text-[#34D399] font-mono text-[9px] font-bold px-1.5 py-0.5 border border-[#10B981]/40 uppercase rounded">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                <span>LIVE TELEMETRY</span>
              </span>
            </div>
            <p className="text-[10px] text-emerald-300/70 font-mono">
              Interlock dependency: upstream clues automatically decrypt downstream specialist consoles
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {/* View toggle */}
          <button
            onClick={() => {
              setViewMode(m => m === 'schematic' ? 'compact' : 'schematic');
              try { heistAudio.playKeyClick(); } catch {}
            }}
            className="flex items-center space-x-1.5 bg-[#020B06] text-emerald-300 hover:text-white font-mono text-[10px] font-bold px-2.5 py-1.5 border border-emerald-900/80 hover:border-emerald-500/50 rounded transition-all"
            title="Toggle between schematic circuit diagram and compact HUD"
          >
            <Sliders className="w-3 h-3 text-[#FBBF24]" />
            <span className="uppercase">{viewMode === 'schematic' ? 'COMPACT' : 'SCHEMATIC'}</span>
          </button>

          {/* Progress pill */}
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border font-mono text-xs font-bold transition-all ${
            isFullySolved
              ? 'bg-[#10B981]/20 border-[#10B981] text-[#34D399] shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-[#020B06] border-emerald-900/60 text-[#FBBF24]'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isFullySolved ? 'bg-[#10B981] animate-ping' : 'bg-[#FBBF24]'}`} />
            <span>{solvedCount}/{totalCount} INTERLOCKS ALIGNED</span>
          </div>
        </div>
      </div>

      {/* ── SCHEMATIC VIEW: Full animated circuit pipeline ───────────────── */}
      {viewMode === 'schematic' ? (
        <div className="relative z-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">

            {/* Left/Main: The 4 Interconnected Role Nodes */}
            <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {activeSteps.map((step, idx) => {
                const Icon = step.icon;
                const isDone = !!solvedRoles[step.role];
                const clue = roleClues[step.role];
                const prereqDone = !step.prereqRole || !!solvedRoles[step.prereqRole];
                const isActive = prereqDone && !isDone;
                const isLocked = !prereqDone && !isDone;
                const isInspecting = selectedNode === step.role;

                return (
                  <div key={step.role} className="flex flex-col relative group">
                    {/* Node Card */}
                    <div
                      onClick={() => {
                        setSelectedNode(s => s === step.role ? null : step.role);
                        try { heistAudio.playKeyClick(); } catch {}
                      }}
                      className={`p-3 rounded-lg border-2 transition-all flex-1 flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                        isDone
                          ? 'bg-[#0A2E1E] border-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.25)] text-white'
                          : isActive
                          ? 'bg-[#051F14] border-[#FBBF24]/70 shadow-[0_0_15px_rgba(251,191,36,0.2)] text-emerald-100'
                          : 'bg-[#020C07]/90 border-emerald-950/80 text-slate-500 opacity-60'
                      }`}
                    >
                      {/* Top pulse radar for active solving node */}
                      {isActive && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#FBBF24] to-transparent animate-pulse" />
                      )}
                      {isDone && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#10B981] to-transparent" />
                      )}

                      {/* Header info */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2 min-w-0">
                            <div 
                              className="w-6 h-6 rounded flex items-center justify-center border flex-shrink-0"
                              style={{ 
                                backgroundColor: isDone ? `${step.color}25` : `${step.color}15`,
                                borderColor: isDone ? step.color : `${step.color}40`
                              }}
                            >
                              <Icon className="w-3.5 h-3.5" style={{ color: step.color }} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-black uppercase block truncate tracking-wide" style={{ color: step.color }}>
                                {step.title}
                              </span>
                            </div>
                          </div>

                          {/* Status badge */}
                          {isDone ? (
                            <span className="flex items-center space-x-1 text-[9px] font-mono font-black text-[#10B981] bg-[#10B981]/15 px-1.5 py-0.5 rounded border border-[#10B981]/40">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>READY</span>
                            </span>
                          ) : isActive ? (
                            <span className="flex items-center space-x-1 text-[9px] font-mono font-black text-[#FBBF24] bg-[#FBBF24]/15 px-1.5 py-0.5 rounded border border-[#FBBF24]/40 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
                              <span>ACTIVE</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-[9px] font-mono text-slate-500 bg-[#020B06] px-1.5 py-0.5 rounded border border-emerald-950">
                              <Lock className="w-2.5 h-2.5" />
                              <span>WAITING</span>
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] font-mono text-emerald-300/60 mb-2 truncate">
                          {step.method}
                        </div>
                      </div>

                      {/* Clue / Telemetry Box */}
                      <div className="mt-2 pt-2 border-t border-emerald-900/40">
                        {isDone ? (
                          <div className="bg-[#020B06]/80 p-1.5 rounded border border-emerald-500/30 text-[10px] font-mono leading-tight space-y-0.5">
                            <span className="text-[8px] font-black uppercase text-[#10B981] block tracking-wider">
                              TRANSMITTED CLUE:
                            </span>
                            <span className="text-[#34D399] font-bold block truncate" title={clue || 'Payload Relayed'}>
                              {clue ? clue.replace(/^.*:\s*/, '') : 'Packet Dispatched'}
                            </span>
                          </div>
                        ) : isActive ? (
                          <div className="bg-[#020B06]/60 p-1.5 rounded border border-amber-500/30 text-[10px] font-mono text-amber-200/90 leading-tight">
                            <span className="text-[8px] font-black uppercase text-[#FBBF24] block tracking-wider">
                              CONDUIT LIVE:
                            </span>
                            <span className="truncate block">Awaiting solution injection</span>
                          </div>
                        ) : (
                          <div className="bg-[#020B06]/40 p-1.5 rounded border border-emerald-950 text-[10px] font-mono text-slate-500 leading-tight">
                            <span className="text-[8px] font-black uppercase block tracking-wider text-slate-600">
                              RELAY LOCKED:
                            </span>
                            <span className="truncate block">Needs upstream clue</span>
                          </div>
                        )}
                      </div>

                      {/* Step index pill */}
                      <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-500 mt-2">
                        <span>STAGE {idx + 1}/4</span>
                        <span className="text-emerald-400/60 hover:text-emerald-300 flex items-center space-x-0.5">
                          <span>{isInspecting ? 'Close' : 'Inspect'}</span>
                          {isInspecting ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Master Vault Interlock Core */}
            <div className="md:col-span-3 bg-[#020B06] border-2 border-emerald-800/40 rounded-lg p-3.5 flex flex-col items-center justify-between relative overflow-hidden shadow-inner">
              {/* Radial glow background */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-700"
                style={{
                  background: isFullySolved
                    ? 'radial-gradient(circle at center, #10B981 0%, transparent 70%)'
                    : 'radial-gradient(circle at center, #FBBF24 0%, transparent 70%)'
                }}
              />

              <div className="w-full flex items-center justify-between text-[10px] font-mono font-black uppercase text-emerald-400/80 border-b border-emerald-900/50 pb-1.5">
                <span>VAULT MASTER CORE</span>
                <span className={isFullySolved ? 'text-[#10B981]' : 'text-[#FBBF24]'}>
                  {isFullySolved ? 'BYPASS CONFIRMED' : 'ARMED'}
                </span>
              </div>

              {/* Central Circular Dial SVG */}
              <div className="relative my-2 w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#041E13"
                    strokeWidth="8"
                  />
                  {/* Progress Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={isFullySolved ? '#10B981' : '#FBBF24'}
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - progressPercent / 100)}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.4s',
                      filter: isFullySolved 
                        ? 'drop-shadow(0 0 8px #10B981)' 
                        : 'drop-shadow(0 0 4px #FBBF24)'
                    }}
                  />
                </svg>

                {/* Inner Dial Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  {isFullySolved ? (
                    <Unlock className="w-6 h-6 text-[#10B981] animate-bounce" />
                  ) : (
                    <Lock className="w-5 h-5 text-[#FBBF24]" />
                  )}
                  <span className="text-xs font-mono font-black text-[#F0FDF4] mt-0.5">
                    {progressPercent}%
                  </span>
                </div>
              </div>

              {/* Bottom message */}
              <div className="text-center w-full">
                <p className={`text-[10px] font-mono font-bold uppercase truncate ${
                  isFullySolved ? 'text-[#34D399] animate-pulse' : 'text-slate-400'
                }`}>
                  {isFullySolved ? '⚡ MASTER UNLOCK ACTIVE' : `${totalCount - solvedCount} KEYS REMAINING`}
                </p>
                <div className="w-full bg-[#041E13] h-1 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${
                      isFullySolved ? 'bg-[#10B981]' : 'bg-[#FBBF24]'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ── Animated SVG Circuit Beam (Connecting the 4 Roles) ────────── */}
          <div className="hidden lg:block relative py-1 px-4 bg-[#020C07]/80 rounded border border-emerald-900/40 overflow-hidden">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
              <span className="flex items-center space-x-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                <span>ACTIVE CONDUIT BUS</span>
              </span>
              <span className="text-slate-500">
                Data packet transfers occur in synchronous sequence (Scientist ➔ Engineer ➔ Hacker ➔ Cryptographer ➔ Vault)
              </span>
            </div>

            {/* Visual SVG Beam with running laser pulses */}
            <svg className="w-full h-4 my-1" preserveAspectRatio="none">
              <defs>
                <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="33%" stopColor="#FBBF24" />
                  <stop offset="66%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#C084FC" />
                </linearGradient>
              </defs>
              {/* Inactive line */}
              <line x1="0" y1="8" x2="100%" y2="8" stroke="#041E13" strokeWidth="3" />
              {/* Active illuminated line */}
              <line 
                x1="0" y1="8" x2={`${Math.max(2, progressPercent)}%`} y2="8" 
                stroke="url(#beamGradient)" strokeWidth="3"
                strokeLinecap="round"
                style={{ 
                  filter: 'drop-shadow(0 0 6px #10B981)',
                  transition: 'x2 0.8s ease'
                }}
              />
              {/* Animated energy pulses */}
              <circle cx={`${Math.max(2, progressPercent)}%`} cy="8" r="4" fill="#FFFFFF">
                <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>

          {/* ── Detailed Telemetry Modal/Dropdown if a node is inspected ── */}
          <AnimatePresence>
            {selectedNode && (() => {
              const node = activeSteps.find(s => s.role === selectedNode);
              if (!node) return null;
              const isDone = !!solvedRoles[node.role];
              const clue = roleClues[node.role];
              const prereqNode = activeSteps.find(s => s.role === node.prereqRole);

              return (
                <motion.div
                  key="node-details"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3.5 bg-[#03150D] border-2 border-emerald-500/40 rounded-lg space-y-2 text-xs font-mono"
                >
                  <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-black uppercase text-white tracking-wide" style={{ color: node.color }}>
                        [{node.title.toUpperCase()} TELEMETRY DOSSIER]
                      </span>
                      <span className="text-[10px] text-slate-400">DISCIPLINE: {node.discipline}</span>
                    </div>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="text-slate-400 hover:text-white text-[10px] uppercase font-bold"
                    >
                      Close ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="p-2 bg-[#020B06] border border-emerald-950 rounded">
                      <span className="text-[9px] font-bold text-amber-400 block uppercase">1. INCOMING DEPENDENCY</span>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        {prereqNode ? `Requires ${prereqNode.title}'s output to proceed.` : 'Initiates chain (no prerequisites).'}
                      </p>
                    </div>
                    <div className="p-2 bg-[#020B06] border border-emerald-950 rounded">
                      <span className="text-[9px] font-bold text-cyan-400 block uppercase">2. SOLVING METHOD</span>
                      <p className="text-[11px] text-slate-300 mt-0.5">{node.method}</p>
                    </div>
                    <div className="p-2 bg-[#020B06] border border-emerald-950 rounded">
                      <span className="text-[9px] font-bold text-emerald-400 block uppercase">3. OUTGOING CLUE RELAY</span>
                      <p className="text-[11px] text-emerald-200 mt-0.5">
                        {isDone ? (clue || node.outputRelay) : node.outputRelay}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      ) : (
        /* ── COMPACT HUD VIEW ────────────────────────────────────────── */
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {activeSteps.map((step) => {
            const Icon = step.icon;
            const isDone = !!solvedRoles[step.role];
            const clue = roleClues[step.role];

            return (
              <div 
                key={step.role}
                className={`p-2.5 rounded-lg border transition-all ${
                  isDone 
                    ? 'bg-[#0A2E1E] border-[#10B981]/60 text-white shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                    : 'bg-[#03140C]/80 border-emerald-950 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: step.color }} />
                    <span className="text-xs font-bold truncate" style={{ color: step.color }}>
                      {step.title}
                    </span>
                  </div>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                  ) : (
                    <Lock className="w-3 h-3 text-slate-600 flex-shrink-0" />
                  )}
                </div>
                <div className="text-[11px] font-mono truncate">
                  {isDone && clue ? (
                    <span className="text-[#34D399] font-bold">Relayed: {clue.replace(/^.*:\s*/, '')}</span>
                  ) : (
                    <span className="text-slate-400">{step.tag}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

