import React, { useState } from 'react';
import { 
  Terminal, Zap, FlaskConical, Key, Sparkles, CheckCircle2, 
  Lock, Play, ArrowRight, Compass, Shield, Activity, 
  RotateCcw, Cpu, BookOpen, HelpCircle, Check, Lightbulb,
  MousePointerClick, Flame, Info
} from 'lucide-react';
import { heistAudio } from './HeistAudioEngine';
import { toast } from 'sonner';

export default function GraphicalRoadmap({ onStartHeist, onOpenModal }) {
  const [selectedNodeId, setSelectedNodeId] = useState('cs-1');
  const [disciplineFilter, setDisciplineFilter] = useState('ALL'); // 'ALL' | 'cs' | 'phys' | 'chem' | 'math'
  const [activeTabMode, setActiveTabMode] = useState('tree'); // 'tree' | 'simulators' | 'disciplines'
  const [showHowItWorks, setShowHowItWorks] = useState(true);

  // Interactive mini-simulator states
  const [laserAngle, setLaserAngle] = useState(45);
  const [refractiveIndex, setRefractiveIndex] = useState(1.5);
  const [memoryPointerOffset, setMemoryPointerOffset] = useState(2);
  const [phLevel, setPhLevel] = useState(7.0);
  const [cipherShift, setCipherShift] = useState(3);
  const [cipherInput, setCipherInput] = useState('VAULT');

  // User-understandable STEM nodes with plain English analogies
  const roadmapNodes = [
    // Chapter 1: Core Foundations
    {
      id: 'cs-1',
      category: 'cs',
      chapter: 1,
      phaseName: 'Phase 1: Foundations',
      title: 'Memory Buffers & Pointer Offsets',
      domain: 'Computer Science',
      role: 'Canopy Hacker',
      icon: Terminal,
      color: '#10B981',
      x: 12,
      y: 35,
      status: 'completed',
      xp: 250,
      simpleAnalogy: 'Think of computer memory like a row of numbered lockers. A pointer is simply the locker number (address) where your secret key is hidden.',
      whyInHeist: 'The hacker calculates how many locker steps (byte offsets) to jump to extract the vault password from server RAM.',
      formula: '*(Base_Address + Offset_Bytes)',
      formulaExplanation: 'Base Address = starting locker, Offset = number of lockers to skip.',
      interactiveType: 'memory'
    },
    {
      id: 'phys-1',
      category: 'phys',
      chapter: 1,
      phaseName: 'Phase 1: Foundations',
      title: "Snell's Law & Prism Refraction",
      domain: 'Physics & Optics',
      role: 'Woodland Engineer',
      icon: Zap,
      color: '#FBBF24',
      x: 34,
      y: 70,
      status: 'completed',
      xp: 300,
      simpleAnalogy: 'When a laser beam travels from air into glass or water, it slows down and bends at an angle—just like a straw looking bent in a glass of water.',
      whyInHeist: 'The engineer aligns glass prisms to bend security lasers away from alarms and direct them into power receivers.',
      formula: 'n₁ · sin(θ₁) = n₂ · sin(θ₂)',
      formulaExplanation: 'n₁ & n₂ = density of materials, θ₁ & θ₂ = laser entry & exit angles.',
      interactiveType: 'laser'
    },
    {
      id: 'chem-1',
      category: 'chem',
      chapter: 1,
      phaseName: 'Phase 1: Foundations',
      title: 'Acid Buffers & pH Neutralization',
      domain: 'Bio-Chemistry',
      role: 'Flora Scientist',
      icon: FlaskConical,
      color: '#60A5FA',
      x: 23,
      y: 50,
      status: 'completed',
      xp: 280,
      simpleAnalogy: 'Like adding lemon juice (acid) or baking soda (base) to water until it becomes safe and neutral (pH 7.0).',
      whyInHeist: 'Caustic acid traps lock the vault doors. The scientist titrates neutralizer reagents to reach exactly pH 7.0 to dissolve locks safely.',
      formula: 'pH = -log₁₀[H⁺]',
      formulaExplanation: 'pH < 7 is dangerous acid, pH = 7 is safe neutral water, pH > 7 is caustic base.',
      interactiveType: 'ph'
    },
    {
      id: 'math-1',
      category: 'math',
      chapter: 1,
      phaseName: 'Phase 1: Foundations',
      title: 'Modular Arithmetic & Shift Ciphers',
      domain: 'Discrete Math',
      role: 'Mist Cryptographer',
      icon: Key,
      color: '#C084FC',
      x: 45,
      y: 35,
      status: 'in_progress',
      xp: 350,
      simpleAnalogy: 'Like a 12-hour clock. If it is 10 o’clock and you add 4 hours, it wraps around to 2 o’clock. Ciphers do the exact same thing with the 26 letters of the alphabet.',
      whyInHeist: 'Vault door passwords are encrypted with Caesar shift rings. The cryptographer reverses the shift key to reveal the passkey.',
      formula: 'C = (P + k) mod 26',
      formulaExplanation: 'P = original letter position, k = shift number, mod 26 = wrap around at Z.',
      interactiveType: 'cipher'
    },

    // Chapter 2: Applied Relays
    {
      id: 'cs-2',
      category: 'cs',
      chapter: 2,
      phaseName: 'Phase 2: Applied Relays',
      title: 'Kernel Firewall Packet Injection',
      domain: 'Computer Science',
      role: 'Canopy Hacker',
      icon: Terminal,
      color: '#10B981',
      x: 56,
      y: 70,
      status: 'in_progress',
      xp: 400,
      simpleAnalogy: 'Like slipping a secret VIP invitation envelope into a guarded mail slot so the security gate opens automatically.',
      whyInHeist: 'Bypasses automated security cameras by spoofing authorized network packet headers.',
      formula: 'CheckSum = ~(Σ 16-bit Words)',
      formulaExplanation: 'Ensures the firewall accepts the injected data packet without tripping integrity alarms.',
      interactiveType: 'memory'
    },
    {
      id: 'phys-2',
      category: 'phys',
      chapter: 2,
      phaseName: 'Phase 2: Applied Relays',
      title: 'Capacitor Arc & Resonant Frequency',
      domain: 'Physics & Optics',
      role: 'Woodland Engineer',
      icon: Zap,
      color: '#FBBF24',
      x: 67,
      y: 40,
      status: 'in_progress',
      xp: 420,
      simpleAnalogy: 'Like pushing someone on a swing at the exact right moment so they swing higher and higher with very little effort.',
      whyInHeist: 'The engineer matches the electrical frequency of high-voltage fences to safely discharge their capacitors.',
      formula: 'f₀ = 1 / (2π · √(L · C))',
      formulaExplanation: 'f₀ = resonance speed, L = coil magnetism, C = capacitor battery size.',
      interactiveType: 'laser'
    },
    {
      id: 'chem-2',
      category: 'chem',
      chapter: 2,
      phaseName: 'Phase 2: Applied Relays',
      title: 'Exothermic Titration Thresholds',
      domain: 'Bio-Chemistry',
      role: 'Flora Scientist',
      icon: FlaskConical,
      color: '#60A5FA',
      x: 78,
      y: 70,
      status: 'locked',
      xp: 450,
      simpleAnalogy: 'Certain chemical reactions release heat (like hand warmers). If mixed too fast, they overheat and trigger thermal alarm sensors.',
      whyInHeist: 'Calculates the safe speed to mix chemicals without setting off infrared heat detectors in the chamber.',
      formula: 'q = m · c · ΔT',
      formulaExplanation: 'q = heat released, m = fluid mass, c = heat capacity, ΔT = temperature change.',
      interactiveType: 'ph'
    },
    {
      id: 'math-2',
      category: 'math',
      chapter: 2,
      phaseName: 'Phase 2: Applied Relays',
      title: 'Prime Factorization & RSA Keys',
      domain: 'Discrete Math',
      role: 'Mist Cryptographer',
      icon: Key,
      color: '#C084FC',
      x: 88,
      y: 35,
      status: 'locked',
      xp: 500,
      simpleAnalogy: 'Multiplying two prime numbers like 7 × 13 = 91 is easy. But given 91, finding 7 and 13 is much harder. Modern digital locks use huge prime numbers for security.',
      whyInHeist: 'Breaks multi-digit digital master key locks protecting the final core vault.',
      formula: 'N = p · q  (where p, q are primes)',
      formulaExplanation: 'Finding the secret primes p and q lets you compute the private unlocking key.',
      interactiveType: 'cipher'
    },

    // Chapter 3: Mastermind Nexus
    {
      id: 'nexus-final',
      category: 'nexus',
      chapter: 3,
      phaseName: 'Phase 3: Quantum Nexus',
      title: 'The Boreal Quantum Nexus (Mastermind Boss)',
      domain: 'Cross-Curricular Relay',
      role: 'Full 4-Player Syndicate',
      icon: Sparkles,
      color: '#34D399',
      x: 96,
      y: 50,
      status: 'locked',
      xp: 1200,
      simpleAnalogy: 'The ultimate final heist where all 4 players must solve their puzzles simultaneously to unlock the final vault door.',
      whyInHeist: 'Requires real-time team synchronization across Computer Science, Physics, Chemistry, and Mathematics.',
      formula: 'Sync_Rate = (Hacker ∩ Engineer ∩ Scientist ∩ Crypto) / Total_Time',
      formulaExplanation: 'All 4 teammates transmit their solved clues across radio channels to win.',
      interactiveType: 'memory'
    }
  ];

  const selectedNode = roadmapNodes.find(n => n.id === selectedNodeId) || roadmapNodes[0];

  const filteredNodes = roadmapNodes.filter(node => {
    if (disciplineFilter === 'ALL') return true;
    return node.category === disciplineFilter || node.category === 'nexus';
  });

  // Laser refraction calculation
  const airIndex = 1.0;
  const sinTheta2 = (airIndex * Math.sin((laserAngle * Math.PI) / 180)) / refractiveIndex;
  const clampedSin = Math.max(-1, Math.min(1, sinTheta2));
  const refractedAngleDeg = Math.round((Math.asin(clampedSin) * 180) / Math.PI);

  // Cipher encryption helper
  const encryptCaesar = (str, shift) => {
    return str
      .toUpperCase()
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }
        return char;
      })
      .join('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">

      {/* ========================================================================= */}
      {/* 1. TOP HEADER & VIEW MODE SELECTOR */}
      {/* ========================================================================= */}
      <section className="bg-[#051C12]/90 backdrop-blur-md border border-emerald-800/50 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-[#10B981] text-[#02140D] font-mono font-bold text-[10px] px-2.5 py-0.5 rounded uppercase">
              STEM Learning Roadmap
            </span>
            <span className="text-xs font-mono text-emerald-300">
              Interactive 4-Track Progression
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-game">
            Curriculum Skill Tree & Labs
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Learn real science, math, and coding concepts by interacting with live visual sandboxes.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="bg-[#020B06] text-emerald-300 border border-emerald-800/80 hover:bg-[#072419] px-3 py-2 rounded-lg text-xs font-bold font-game flex items-center space-x-1.5 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>{showHowItWorks ? 'Hide Guide' : 'How It Works'}</span>
          </button>

          <button
            onClick={onOpenModal}
            className="bg-[#10B981] text-[#02140D] font-bold text-xs px-3.5 py-2 rounded-lg hover:bg-[#34D399] transition-all flex items-center space-x-1.5 font-game shadow-md shadow-emerald-950"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Full Study Guide</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. USER-FRIENDLY "HOW IT WORKS" 3-STEP BANNER */}
      {/* ========================================================================= */}
      {showHowItWorks && (
        <div className="bg-[#020E08] border border-emerald-800/40 rounded-2xl p-5 shadow-lg space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-white font-game flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-[#FBBF24]" />
              <span>How This STEM Roadmap Works (In 3 Simple Steps):</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">Beginner Friendly</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 bg-[#041C12] border border-emerald-900/60 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-[#10B981] uppercase block">Step 1: Pick a Node</span>
              <p className="text-slate-300 font-sans text-xs">Click any glowing checkpoint on the map below to choose what to learn.</p>
            </div>
            <div className="p-3 bg-[#041C12] border border-emerald-900/60 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-amber-300 uppercase block">Step 2: Try the Simulator</span>
              <p className="text-slate-300 font-sans text-xs">Use the interactive slider on the right to see the math & science happen in real time.</p>
            </div>
            <div className="p-3 bg-[#041C12] border border-emerald-900/60 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-[#60A5FA] uppercase block">Step 3: Play the Heist</span>
              <p className="text-slate-300 font-sans text-xs">Click "Launch Practice Vault" to apply your newly learned concept inside the game!</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DISCIPLINE FILTER BUTTONS */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-[#020B06] p-1.5 rounded-xl border border-emerald-900/60 font-game text-xs">
          {[
            { id: 'ALL', label: 'All 4 Tracks' },
            { id: 'cs', label: '💻 Computer Science', color: '#10B981' },
            { id: 'phys', label: '⚡ Physics & Optics', color: '#FBBF24' },
            { id: 'chem', label: '🧪 Bio-Chemistry', color: '#60A5FA' },
            { id: 'math', label: '🔑 Discrete Math', color: '#C084FC' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => {
                setDisciplineFilter(btn.id);
                heistAudio.playKeyClick();
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                disciplineFilter === btn.id
                  ? 'bg-[#10B981] text-[#02140D] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-[#020B06] p-1 rounded-xl border border-emerald-900/60 font-game text-xs">
          <button
            onClick={() => setActiveTabMode('tree')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTabMode === 'tree' ? 'bg-emerald-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Map View
          </button>
          <button
            onClick={() => setActiveTabMode('disciplines')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTabMode === 'disciplines' ? 'bg-emerald-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Syllabus Cards
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN INTERACTIVE MAP + CONCEPT LAB SPLIT VIEW */}
      {/* ========================================================================= */}
      {activeTabMode === 'tree' ? (
        <div className="space-y-6">
          
          {/* Visual SVG Skill Constellation Canvas */}
          <div className="relative bg-[#020E08] border border-emerald-800/60 rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden min-h-[360px] flex flex-col justify-between">
            
            {/* Background Ambient Grid */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

            {/* Top Phase Header Legend */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900/60 pb-3 text-xs font-mono">
              <div className="flex items-center space-x-4">
                <span className="text-[#10B981] font-bold flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block shadow-[0_0_8px_#10B981]" />
                  <span>Phase 1: Basic Rules</span>
                </span>
                <span className="text-[#FBBF24] font-bold flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24] inline-block shadow-[0_0_8px_#FBBF24]" />
                  <span>Phase 2: Applied Heists</span>
                </span>
                <span className="text-[#34D399] font-bold flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] inline-block shadow-[0_0_8px_#34D399]" />
                  <span>Phase 3: Final Boss</span>
                </span>
              </div>
              <span className="text-slate-400 hidden sm:inline font-mono text-[11px]">
                👉 Click on any circle below to inspect!
              </span>
            </div>

            {/* SVG Interactive Metro Circuit Track */}
            <div className="relative z-10 my-4 h-60 sm:h-64 w-full">
              <svg className="w-full h-full absolute inset-0 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="roadmapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#FBBF24" />
                    <stop offset="100%" stopColor="#34D399" />
                  </linearGradient>
                </defs>

                {/* Primary path */}
                <path
                  d="M 12 35 Q 23 50 34 70 T 45 35 T 56 70 T 67 40 T 78 70 T 88 35 T 96 50"
                  fill="none"
                  stroke="url(#roadmapGrad)"
                  strokeWidth="1"
                  strokeDasharray="2 1.5"
                  className="animate-pulse"
                />
              </svg>

              {/* Node Icons Positioned by Percentage */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode.id === node.id;
                const isCompleted = node.status === 'completed';
                const isLocked = node.status === 'locked';
                const Icon = node.icon;

                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      heistAudio.playKeyClick();
                    }}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  >
                    <div 
                      className={`relative w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        isSelected 
                          ? 'scale-125 ring-4 ring-[#10B981] bg-[#0A3020] shadow-[0_0_20px_#10B981]' 
                          : isCompleted
                          ? 'bg-[#041C12] border-2 border-emerald-500 hover:scale-110 shadow-md'
                          : isLocked
                          ? 'bg-[#020B06] border border-slate-700 opacity-60 hover:opacity-100'
                          : 'bg-[#051C12] border-2 border-amber-400 hover:scale-110 shadow-md'
                      }`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: node.color }} />

                      {/* Status indicator tag */}
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold bg-[#020B06] border border-emerald-800 text-white">
                        {isCompleted ? '✓' : isLocked ? '🔒' : '⚡'}
                      </div>
                    </div>

                    {/* Tooltip Title */}
                    <div className="absolute top-12 sm:top-14 left-1/2 -translate-x-1/2 w-32 text-center pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-mono font-bold text-white bg-[#020B06]/95 px-1.5 py-0.5 rounded border border-emerald-900 block truncate shadow-sm">
                        {node.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Progress Bar */}
            <div className="relative z-10 pt-3 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-300">
              <span>Selected Node: <strong className="text-white">{selectedNode.title}</strong></span>
              <span className="text-[#10B981] font-bold">3/9 STEM Concepts Mastered</span>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* NODE INSPECTOR (LEFT: EASY ANALOGY, RIGHT: LIVE SIMULATOR) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Plain-English Concept Explanation (5 cols) */}
            <div className="lg:col-span-5 bg-[#051C12]/90 border border-emerald-800/50 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-[#020B06] border border-emerald-900/60" style={{ color: selectedNode.color }}>
                    <selectedNode.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-300">
                      {selectedNode.domain} • {selectedNode.phaseName}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white font-game">{selectedNode.title}</h3>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold bg-[#10B981]/20 text-[#34D399] px-2.5 py-1 rounded border border-[#10B981]/40">
                  +{selectedNode.xp} XP
                </span>
              </div>

              {/* 1. Simple English Analogy */}
              <div className="bg-[#020E08] p-3.5 rounded-xl border border-emerald-900/60 space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#FBBF24] flex items-center space-x-1.5 uppercase">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Plain English Explanation:</span>
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {selectedNode.simpleAnalogy}
                </p>
              </div>

              {/* 2. Why we use it in the heist */}
              <div className="space-y-1 font-mono text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  🎮 How It Works in Co-op Heists:
                </span>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  {selectedNode.whyInHeist}
                </p>
              </div>

              {/* 3. Mathematical Formula / Code Rule */}
              <div className="bg-[#020B06] p-3 rounded-xl border border-emerald-800/60 space-y-1 font-mono text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>REAL-WORLD FORMULA / RULE:</span>
                  <span className="text-emerald-400 font-bold">{selectedNode.role}</span>
                </div>
                <code className="text-sm font-bold text-[#10B981] block">
                  {selectedNode.formula}
                </code>
                <p className="text-[11px] text-slate-300 font-sans">
                  {selectedNode.formulaExplanation}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-emerald-950 flex gap-2">
                <button
                  onClick={() => onStartHeist(0)}
                  className="flex-1 bg-[#10B981] text-[#02140D] font-bold text-xs py-2.5 px-3 rounded-lg hover:bg-[#34D399] transition-all uppercase flex items-center justify-center space-x-1.5 font-game shadow-md shadow-emerald-950"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Practice In Game</span>
                </button>
              </div>

            </div>

            {/* Right Column: Interactive Sandbox Playground (7 cols) */}
            <div className="lg:col-span-7 bg-[#020E08] border border-emerald-800/60 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-[#10B981]" />
                  <h4 className="text-sm font-bold text-white uppercase font-game">
                    Interactive Playground: Test This Concept!
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-amber-300 font-bold">Try Moving The Controls 👇</span>
              </div>

              {/* SIMULATOR 1: LASER REFRACTION (PHYSICS) */}
              {selectedNode.interactiveType === 'laser' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="bg-[#041C12] p-4 rounded-xl border border-emerald-800/60 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span>Laser Entry Angle: <strong className="text-amber-300">{laserAngle}°</strong></span>
                      <span>Glass Density: <strong className="text-emerald-300">{refractiveIndex}x</strong></span>
                      <span>Bent Exit Angle: <strong className="text-[#34D399]">{refractedAngleDeg}°</strong></span>
                    </div>

                    {/* Graphic Laser SVG Visualizer */}
                    <div className="relative w-full h-36 bg-[#020B06] rounded-xl border border-emerald-900 overflow-hidden flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 300 120">
                        {/* Glass medium */}
                        <rect x="150" y="0" width="150" height="120" fill="#063220" opacity="0.6" />
                        <line x1="150" y1="0" x2="150" y2="120" stroke="#10B981" strokeDasharray="3 3" opacity="0.5" />
                        <text x="160" y="20" fill="#34D399" fontSize="10" fontFamily="monospace">Glass Medium (n=1.5)</text>
                        <text x="40" y="20" fill="#FBBF24" fontSize="10" fontFamily="monospace">Air (n=1.0)</text>

                        {/* Incoming laser */}
                        <line 
                          x1={150 - Math.cos((laserAngle * Math.PI) / 180) * 100} 
                          y1={60 - Math.sin((laserAngle * Math.PI) / 180) * 100} 
                          x2="150" 
                          y2="60" 
                          stroke="#FBBF24" 
                          strokeWidth="3"
                          className="drop-shadow-[0_0_6px_#FBBF24]"
                        />

                        {/* Bent refracted laser */}
                        <line 
                          x1="150" 
                          y1="60" 
                          x2={150 + Math.cos((refractedAngleDeg * Math.PI) / 180) * 100} 
                          y2={60 + Math.sin((refractedAngleDeg * Math.PI) / 180) * 100} 
                          stroke="#34D399" 
                          strokeWidth="3"
                          className="drop-shadow-[0_0_8px_#34D399]"
                        />

                        <circle cx="150" cy="60" r="4" fill="#FFFFFF" />
                      </svg>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] text-slate-300">
                        <span>Drag slider to change laser entry angle:</span>
                        <span className="text-amber-300 font-bold">{laserAngle}°</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="80" 
                        value={laserAngle} 
                        onChange={e => setLaserAngle(Number(e.target.value))}
                        className="w-full accent-[#FBBF24] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SIMULATOR 2: MEMORY BUFFER POINTERS (COMPUTER SCIENCE) */}
              {(selectedNode.interactiveType === 'memory' || selectedNode.interactiveType === 'nexus') && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="bg-[#041C12] p-4 rounded-xl border border-emerald-800/60 space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Server RAM Address: <strong className="text-[#10B981]">0x7FFE_00A0</strong></span>
                      <span>Target Pointer: <strong className="text-amber-300">Offset +{memoryPointerOffset}</strong></span>
                    </div>

                    {/* Interactive Memory Blocks */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {[0, 1, 2, 3, 4, 5].map((idx) => {
                        const isTarget = memoryPointerOffset === idx;
                        return (
                          <div 
                            key={idx}
                            onClick={() => {
                              setMemoryPointerOffset(idx);
                              heistAudio.playKeyClick();
                            }}
                            className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                              isTarget 
                                ? 'bg-[#10B981] text-[#02140D] border-white font-bold scale-105 shadow-[0_0_12px_#10B981]' 
                                : 'bg-[#020B06] border-emerald-900 text-slate-300 hover:border-emerald-500'
                            }`}
                          >
                            <span className="text-[9px] block text-slate-400 font-mono">Box #{idx}</span>
                            <span className="text-xs font-bold font-mono">[{isTarget ? '🔑 KEY' : 'DATA'}]</span>
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans">
                      💡 <strong>How it works:</strong> Click any locker box above to change your pointer offset. In the heist, your teammate tells you which offset number holds the key!
                    </p>
                  </div>
                </div>
              )}

              {/* SIMULATOR 3: ACID BUFFER pH LEVEL (CHEMISTRY) */}
              {selectedNode.interactiveType === 'ph' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="bg-[#041C12] p-4 rounded-xl border border-emerald-800/60 space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Current Solution pH: <strong className="text-[#60A5FA]">{phLevel.toFixed(1)}</strong></span>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        phLevel < 6 ? 'bg-red-950 text-red-300 border border-red-800' :
                        phLevel > 8 ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {phLevel < 6 ? '⚠️ Caustic Acid' : phLevel > 8 ? '⚠️ Corrosive Base' : '✅ Neutral Safe Zone (pH 7.0)'}
                      </span>
                    </div>

                    {/* Gradient bar */}
                    <div className="w-full h-6 rounded-xl bg-gradient-to-r from-red-500 via-emerald-400 to-purple-600 relative overflow-hidden border border-emerald-950 shadow-inner">
                      <div 
                        className="absolute top-0 bottom-0 w-3 bg-white border border-black shadow-md transition-all duration-300"
                        style={{ left: `${(phLevel / 14) * 100}%` }}
                      />
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] text-slate-300">
                        <span>Drag slider to add acid or base reagent:</span>
                        <span className="text-[#60A5FA] font-bold">pH {phLevel.toFixed(1)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="14" 
                        step="0.5"
                        value={phLevel} 
                        onChange={e => setPhLevel(Number(e.target.value))}
                        className="w-full accent-[#60A5FA] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SIMULATOR 4: MODULO SHIFT CIPHER (DISCRETE MATH) */}
              {selectedNode.interactiveType === 'cipher' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="bg-[#041C12] p-4 rounded-xl border border-emerald-800/60 space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Shift Key: <strong className="text-[#C084FC]">k = {cipherShift}</strong></span>
                      <span>Formula: <code className="text-[#10B981]">(letter + {cipherShift}) mod 26</code></span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#020B06] p-3 rounded-xl border border-emerald-900">
                        <span className="text-[10px] text-slate-400 block uppercase">Type Any Word:</span>
                        <input 
                          type="text" 
                          value={cipherInput}
                          onChange={e => setCipherInput(e.target.value.toUpperCase())}
                          className="bg-transparent text-base font-bold text-white outline-none w-full mt-1 uppercase font-game"
                          maxLength={8}
                        />
                      </div>
                      <div className="bg-[#020B06] p-3 rounded-xl border border-purple-900/60">
                        <span className="text-[10px] text-purple-300 block uppercase">Encrypted Passkey:</span>
                        <span className="text-base font-bold text-[#C084FC] block mt-1 font-game">
                          {encryptCaesar(cipherInput || 'VAULT', cipherShift)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] text-slate-300">
                        <span>Drag slider to rotate alphabet shift wheel:</span>
                        <span className="text-[#C084FC] font-bold">Shift +{cipherShift}</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="13" 
                        value={cipherShift} 
                        onChange={e => setCipherShift(Number(e.target.value))}
                        className="w-full accent-[#C084FC] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      ) : (
        /* Syllabus Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
          {[
            {
              title: "Computer Science",
              role: "Canopy Hacker",
              icon: Terminal,
              color: "#10B981",
              desc: "Learn memory pointers, binary trees, and firewall logic.",
              modules: ["Memory Offsets & RAM Pointers", "Binary Tree Traversal", "Kernel Firewall Injections"]
            },
            {
              title: "Physics & Optics",
              role: "Woodland Engineer",
              icon: Zap,
              color: "#FBBF24",
              desc: "Learn laser refraction, Snell's law, and resonance circuits.",
              modules: ["Snell's Law & Refraction Index", "Laser Prism Paths", "LC Resonant Circuits"]
            },
            {
              title: "Bio-Chemistry",
              role: "Flora Scientist",
              icon: FlaskConical,
              color: "#60A5FA",
              desc: "Learn chemical stoichiometry, pH buffers, and enthalpy.",
              modules: ["Stoichiometry & Molar Mass", "pH Buffer Neutralization", "Exothermic Dissolution"]
            },
            {
              title: "Discrete Math",
              role: "Mist Cryptographer",
              icon: Key,
              color: "#C084FC",
              desc: "Learn modular arithmetic, shift ciphers, and RSA encryption.",
              modules: ["Modular Arithmetic (mod 26)", "RSA Prime Factorization", "Vigenère Grid Shifts"]
            }
          ].map((disc, idx) => {
            const Icon = disc.icon;
            return (
              <div 
                key={idx}
                className="bg-[#051C12] border border-emerald-800/40 rounded-xl p-5 shadow-md flex flex-col justify-between hover:border-[#10B981] transition-all group text-left"
              >
                <div className="space-y-3">
                  <div className="p-2.5 rounded-xl bg-[#020B06] border border-emerald-900/60 w-fit" style={{ color: disc.color }}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-white font-game group-hover:text-[#10B981] transition-colors">
                      {disc.title}
                    </h3>
                    <p className="text-[11px] font-mono text-emerald-300">
                      Specialist: {disc.role}
                    </p>
                    <p className="text-xs text-slate-300 mt-1">{disc.desc}</p>
                  </div>

                  <ul className="text-xs text-slate-300 space-y-1 font-mono pt-1 border-t border-emerald-950">
                    {disc.modules.map((m, mIdx) => (
                      <li key={mIdx} className="flex items-center space-x-1.5 truncate">
                        <span className="text-emerald-500">•</span>
                        <span className="truncate">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-3 border-t border-emerald-950">
                  <button
                    onClick={() => {
                      setActiveTabMode('tree');
                      heistAudio.playKeyClick();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-[#020B06] border border-emerald-800/60 hover:bg-[#10B981] hover:text-[#02140D] text-emerald-300 text-xs font-bold transition-all flex items-center justify-between font-game"
                  >
                    <span>Inspect On Skill Tree</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
