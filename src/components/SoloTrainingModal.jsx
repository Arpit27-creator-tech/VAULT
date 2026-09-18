import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, CheckCircle2, GraduationCap, Terminal, Zap,
  FlaskConical, Key, Lightbulb, Users, Play, BookOpen, Trophy,
  AlertTriangle, Info, ArrowRight, RefreshCw, Sparkles
} from 'lucide-react';
import { heistAudio } from './HeistAudioEngine';

// ─── Training Puzzle Data (simplified Stage 1 puzzles) ───────────────────────
// These are self-contained so Solo Training works with zero network/socket calls.
const TRAINING_PUZZLES = [
  {
    role: 'hacker',
    label: 'The Hacker',
    discipline: 'CS & Logic — Array Slicing',
    color: '#10B981',
    bgColor: '#10B98115',
    emoji: '💻',
    description:
      'The Hacker writes code to extract encrypted payloads from security buffers. Your output becomes the Cryptographer\'s cipher input.',
    whatYouLearn: 'JavaScript array slicing, function authoring, and algorithmic thinking.',
    puzzle: {
      type: 'code',
      prompt: 'Write a function that extracts elements at indices 2 through 6 (inclusive) from the firewall buffer.',
      initialCode: `// Hacker Terminal v3.2 — TRAINING MODE
// Task: Extract indices 2 through 6 (inclusive)
function extractPayload(buffer) {
  // Hint: Array.slice(start, end) returns elements from start up to (not including) end
  return buffer.slice(2, 7);
}`,
      testInput: ['0x00', '0x11', '0x7E', '0x3A', '0x99', '0xAA', '0xBB', '0xFF'],
      expectedOutput: ['0x7E', '0x3A', '0x99', '0xAA', '0xBB'],
      clueRevealed: 'Cipher Hex Extracted: \'SLYV-782-YLFZ\'',
    },
    hints: [
      '💡 JavaScript arrays use zero-based indexing. Index 0 is the first element.',
      '💡 `array.slice(start, end)` returns elements from `start` up to but NOT including `end`.',
      '💡 To include index 6, use `buffer.slice(2, 7)` — the end argument is exclusive.',
    ],
  },
  {
    role: 'engineer',
    label: 'The Engineer',
    discipline: 'Physics & Optics — Snell\'s Law',
    color: '#FBBF24',
    bgColor: '#FBBF2415',
    emoji: '⚙️',
    description:
      'The Engineer rotates laser mirrors to reflect a beam into the override sensor. The correct angle comes from Snell\'s Law using the Scientist\'s optical density clue.',
    whatYouLearn: 'Angle geometry, Snell\'s Law for light refraction, and reading sensor data.',
    puzzle: {
      type: 'angle',
      prompt: 'Set Mirror A to 45° and Mirror B to 135° to deflect the laser into the security sensor.',
      targetAngleA: 45,
      targetAngleB: 135,
      clueRevealed: 'Laser aligned! Security Port 0x7E3A exposed.',
    },
    hints: [
      '💡 Mirror A deflects the incoming laser horizontally. A 45° angle bounces it 90°.',
      '💡 Mirror B receives the deflected beam. At 135°, it redirects into the sensor.',
      '💡 The sensor target is in the top-right. Think about the angle of incidence = angle of reflection.',
    ],
  },
  {
    role: 'scientist',
    label: 'The Scientist',
    discipline: 'Chemistry — Stoichiometry',
    color: '#06B6D4',
    bgColor: '#06B6D415',
    emoji: '🧪',
    description:
      'The Scientist balances chemical equations to neutralize the cryogenic lock without triggering toxic gas alarms. The compound\'s density feeds the Engineer\'s laser calculation.',
    whatYouLearn: 'Balancing chemical equations, stoichiometry, and molar ratios.',
    puzzle: {
      type: 'stoichiometry',
      prompt: 'Balance: a HCl + b CaCO₃ → c CaCl₂ + d H₂O + e CO₂',
      equation: 'a HCl + b CaCO₃ → c CaCl₂ + d H₂O + e CO₂',
      solution: { a: 2, b: 1, c: 1, d: 1, e: 1 },
      reagentLabels: ['HCl (a)', 'CaCO₃ (b)', 'CaCl₂ (c)', 'H₂O (d)', 'CO₂ (e)'],
      clueRevealed: 'Compound #7F synthesized! Optical Density n = 1.42',
    },
    hints: [
      '💡 Count atoms on each side. Left: (a) H, (a) Cl, (b) Ca, (b) C, (3b) O',
      '💡 Right: (2c) Cl, (c) Ca, (2d) H, (d) O, (e) C, (2e) O — match both sides.',
      '💡 Answer: 2 HCl + 1 CaCO₃ → 1 CaCl₂ + 1 H₂O + 1 CO₂. Set a=2, b=1, c=1, d=1, e=1.',
    ],
  },
  {
    role: 'cryptographer',
    label: 'The Cryptographer',
    discipline: 'Ciphers & Linguistics — Caesar Shift',
    color: '#C084FC',
    bgColor: '#C084FC15',
    emoji: '📜',
    description:
      'The Cryptographer decodes radio intercepts using cipher keys derived from historical clues. The decoded phrase is the final vault override code.',
    whatYouLearn: 'Caesar cipher decryption, frequency analysis, and historical linguistic context.',
    puzzle: {
      type: 'cipher',
      prompt: 'Decode the intercepted cipher using a Caesar shift of +3 (shift back by 3).',
      ciphertext: 'VHFXUH WKH JURYH',
      solution: 'SECURE THE GROVE',
      cipherShift: 3,
      clueRevealed: 'Master Authorization: \'SECURE THE GROVE\'',
    },
    hints: [
      '💡 Caesar cipher shifts each letter by a fixed number. A shift of +3 means A→D, B→E...',
      '💡 To decode a +3 cipher, shift each letter BACK by 3: D→A, E→B, H→E...',
      '💡 V→S, H→E, F→C, X→U, U→R, H→E = SECURE. Apply the same to the rest.',
    ],
  },
];

// ─── Sub-Components ───────────────────────────────────────────────────────────

function RoleCard({ puzzle, onSolved, isTrainingMode }) {
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintStep, setHintStep] = useState(0);
  const [answer, setAnswer] = useState('');
  const [angles, setAngles] = useState({ a: 45, b: 90 });
  const [coeffs, setCoeffs] = useState({ a: 1, b: 1, c: 1, d: 1, e: 1 });
  const [codeVal, setCodeVal] = useState(puzzle.puzzle.initialCode || '');
  const [cipherInput, setCipherInput] = useState('');

  const handleCheck = () => {
    heistAudio.playKeyClick();
    const p = puzzle.puzzle;
    let correct = false;

    if (p.type === 'code') {
      try {
        const userFunc = new Function(
          `${codeVal}\nreturn typeof extractPayload !== 'undefined' ? extractPayload : null;`
        )();
        if (typeof userFunc === 'function') {
          const result = userFunc([...p.testInput]);
          correct = JSON.stringify(result) === JSON.stringify(p.expectedOutput);
        }
      } catch {}
    } else if (p.type === 'angle') {
      correct = Math.abs(angles.a - p.targetAngleA) <= 5 && Math.abs(angles.b - p.targetAngleB) <= 5;
    } else if (p.type === 'stoichiometry') {
      const s = p.solution;
      correct = coeffs.a === s.a && coeffs.b === s.b && coeffs.c === s.c && coeffs.d === s.d && coeffs.e === s.e;
    } else if (p.type === 'cipher') {
      correct = cipherInput.trim().toUpperCase().replace(/\s+/g, ' ') === p.solution.toUpperCase();
    }

    if (correct) {
      setFeedback('correct');
      heistAudio.playSuccessChime();
      setTimeout(() => onSolved(puzzle.role, p.clueRevealed), 900);
    } else {
      setFeedback('wrong');
      setWrongAttempts(w => w + 1);
      heistAudio.playKeyClick();
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const nextHint = () => {
    setHintStep(s => Math.min(s + 1, puzzle.hints.length - 1));
  };

  const p = puzzle.puzzle;

  return (
    <div className="space-y-4">
      {/* Context description */}
      <div
        className="p-3 border-2 border-[#03140C] bg-[#020B06]"
        style={{ borderLeftColor: puzzle.color, borderLeftWidth: 4 }}
      >
        <div className="flex items-center space-x-2 mb-1.5">
          <Info className="w-3.5 h-3.5 flex-shrink-0" style={{ color: puzzle.color }} />
          <span className="text-[10px] font-black uppercase font-mono" style={{ color: puzzle.color }}>
            HOW THIS ROLE FITS IN THE SQUAD
          </span>
        </div>
        <p className="text-xs text-emerald-100/80 leading-relaxed">{puzzle.description}</p>
      </div>

      {/* Puzzle prompt */}
      <div className="p-4 border-2 border-[#03140C] bg-[#051811]/60 space-y-3">
        <p className="text-[10px] font-black uppercase font-mono text-[#FBBF24] tracking-widest">PUZZLE</p>
        <p className="text-sm text-[#F0FDF4] font-medium leading-relaxed">{p.prompt}</p>

        {/* Code input */}
        {p.type === 'code' && (
          <div className="space-y-2">
            <p className="text-[9px] font-mono text-emerald-300/60 uppercase tracking-wider">
              Test Input: {JSON.stringify(p.testInput)}
            </p>
            <p className="text-[9px] font-mono text-emerald-300/60 uppercase tracking-wider">
              Expected Output: {JSON.stringify(p.expectedOutput)}
            </p>
            <textarea
              value={codeVal}
              onChange={e => setCodeVal(e.target.value)}
              className="w-full h-36 bg-[#020B06] text-[#10B981] font-mono text-xs p-3 border-2 border-[#03140C] focus:border-[#10B981] outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        )}

        {/* Angle sliders */}
        {p.type === 'angle' && (
          <div className="space-y-4">
            {['a', 'b'].map(key => (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-emerald-300/80">Mirror {key.toUpperCase()}</span>
                  <span style={{ color: puzzle.color }}>{angles[key]}°</span>
                </div>
                <input
                  type="range"
                  min={0} max={180}
                  value={angles[key]}
                  onChange={e => setAngles(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-600">
                  <span>0°</span><span>90°</span><span>180°</span>
                </div>
              </div>
            ))}
            {/* Simple laser visualizer */}
            <div className="relative w-full h-28 bg-[#020B06] border-2 border-[#03140C] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                LASER GRID — SET BOTH MIRRORS
              </div>
              <div
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 border-2 border-[#FBBF24] bg-[#FBBF2420] flex items-center justify-center text-[8px] font-black text-[#FBBF24]"
              >A</div>
              <div
                className="absolute right-8 top-4 w-6 h-6 border-2 border-[#FBBF24] bg-[#FBBF2420] flex items-center justify-center text-[8px] font-black text-[#FBBF24]"
              >B</div>
              <div
                className="absolute right-2 top-2 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[8px] font-black"
                style={{
                  borderColor: (Math.abs(angles.a - p.targetAngleA) <= 5 && Math.abs(angles.b - p.targetAngleB) <= 5) ? '#10B981' : '#475569',
                  color: (Math.abs(angles.a - p.targetAngleA) <= 5 && Math.abs(angles.b - p.targetAngleB) <= 5) ? '#10B981' : '#475569',
                  backgroundColor: (Math.abs(angles.a - p.targetAngleA) <= 5 && Math.abs(angles.b - p.targetAngleB) <= 5) ? '#10B98120' : 'transparent',
                }}
              >⊙</div>
              {/* angle labels */}
              <div className="absolute bottom-2 left-2 text-[9px] font-mono text-[#FBBF24]/70">A: {angles.a}°</div>
              <div className="absolute bottom-2 right-2 text-[9px] font-mono text-[#FBBF24]/70">B: {angles.b}°</div>
            </div>
          </div>
        )}

        {/* Stoichiometry sliders */}
        {p.type === 'stoichiometry' && (
          <div className="space-y-3">
            <p className="text-xs font-mono text-emerald-300/60 font-bold">{p.equation}</p>
            <div className="grid grid-cols-5 gap-2">
              {p.reagentLabels.map((label, i) => {
                const key = ['a', 'b', 'c', 'd', 'e'][i];
                return (
                  <div key={key} className="flex flex-col items-center space-y-1">
                    <span className="text-[9px] font-mono font-black text-emerald-300/80">{label}</span>
                    <input
                      type="number"
                      min={1} max={6}
                      value={coeffs[key]}
                      onChange={e => setCoeffs(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                      className="w-full text-center bg-[#020B06] text-[#06B6D4] font-mono font-black text-sm p-1.5 border-2 border-[#03140C] focus:border-[#06B6D4] outline-none"
                    />
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] font-mono text-slate-500 italic">Set each coefficient (1–6) to balance the equation.</p>
          </div>
        )}

        {/* Cipher input */}
        {p.type === 'cipher' && (
          <div className="space-y-3">
            <div className="p-3 bg-[#020B06] border border-[#C084FC]/30 font-mono">
              <p className="text-[9px] text-[#C084FC] uppercase tracking-widest font-black mb-1">INTERCEPTED CIPHER TEXT</p>
              <p className="text-lg font-black text-[#F0FDF4] tracking-[4px]">{p.ciphertext}</p>
              <p className="text-[9px] text-slate-500 mt-1">Cipher: Caesar +{p.cipherShift} (shift back by {p.cipherShift})</p>
            </div>
            <input
              type="text"
              value={cipherInput}
              onChange={e => setCipherInput(e.target.value)}
              placeholder="Type decoded message here..."
              className="w-full bg-[#020B06] text-[#C084FC] font-mono font-bold text-sm p-3 border-2 border-[#03140C] focus:border-[#C084FC] outline-none uppercase tracking-widest"
            />
          </div>
        )}
      </div>

      {/* Feedback banner */}
      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-2 p-3 bg-emerald-900/40 border-2 border-[#10B981] text-[#10B981]"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-black uppercase font-mono">✅ Correct! Clue dispatched to next specialist.</span>
          </motion.div>
        )}
        {feedback === 'wrong' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-amber-900/30 border-2 border-[#FBBF24] space-y-1"
          >
            <div className="flex items-center space-x-2 text-[#FBBF24]">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-black uppercase font-mono">Not quite — training mode, no penalty!</span>
            </div>
            {wrongAttempts >= 1 && (
              <p className="text-[11px] text-amber-200/80 font-mono pl-6">
                {wrongAttempts >= 2
                  ? 'Click the 💡 Hint button below for a step-by-step guide.'
                  : 'Try again — check the hints if you\'re stuck.'}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint panel */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-[#0A2D1F] border-2 border-[#10B981]/40 space-y-2">
              <p className="text-[9px] font-black uppercase font-mono text-[#10B981] tracking-widest">TRAINING HINTS</p>
              {puzzle.hints.slice(0, hintStep + 1).map((hint, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-emerald-100/85 font-mono leading-relaxed"
                >
                  {hint}
                </motion.p>
              ))}
              {hintStep < puzzle.hints.length - 1 && (
                <button
                  onClick={nextHint}
                  className="text-[10px] font-black uppercase font-mono text-[#FBBF24] hover:text-[#F59E0B] flex items-center space-x-1 mt-1"
                >
                  <ChevronRight className="w-3 h-3" />
                  <span>Show next hint</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          onClick={() => {
            setShowHint(s => !s);
            setHintStep(0);
            heistAudio.playKeyClick();
          }}
          className="flex items-center space-x-1.5 bg-[#0A261B] text-[#FBBF24] font-mono font-black text-xs px-3 py-2.5 border-2 border-[#03140C] shadow-[2px_2px_0px_#020C07] hover:bg-[#FBBF24]/20 active:translate-x-0.5 transition-all uppercase"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>{showHint ? 'Hide Hints' : 'Show Hints'}</span>
        </button>

        <button
          onClick={handleCheck}
          className="flex-1 flex items-center justify-center space-x-2 font-mono font-black text-sm py-2.5 border-2 border-[#03140C] shadow-[3px_3px_0px_#020C07] hover:opacity-90 active:translate-x-0.5 active:translate-y-0.5 transition-all uppercase"
          style={{ backgroundColor: puzzle.color, color: '#02140D' }}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Submit Answer</span>
        </button>
      </div>

      {/* What you learn */}
      <p className="text-[9px] font-mono text-slate-500 italic text-center border-t border-[#03140C] pt-2">
        📚 What you learn: {puzzle.whatYouLearn}
      </p>
    </div>
  );
}

// ─── Main SoloTrainingModal ───────────────────────────────────────────────────
export default function SoloTrainingModal({ isOpen, onClose, onNavigate }) {
  const [currentRoleIdx, setCurrentRoleIdx] = useState(0);
  const [completedRoles, setCompletedRoles] = useState([]);
  const [phase, setPhase] = useState('intro'); // 'intro' | 'playing' | 'complete'
  const [lastClue, setLastClue] = useState('');

  const currentPuzzle = TRAINING_PUZZLES[currentRoleIdx];
  const totalRoles = TRAINING_PUZZLES.length;

  const handleSolved = useCallback((role, clue) => {
    setLastClue(clue);
    setCompletedRoles(prev => [...new Set([...prev, role])]);

    if (currentRoleIdx < totalRoles - 1) {
      setTimeout(() => {
        setCurrentRoleIdx(i => i + 1);
      }, 1000);
    } else {
      setTimeout(() => {
        setPhase('complete');
        heistAudio.playSuccessChime();
      }, 1000);
    }
  }, [currentRoleIdx, totalRoles]);

  const handleReset = () => {
    setCurrentRoleIdx(0);
    setCompletedRoles([]);
    setPhase('playing');
    setLastClue('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="solo-training-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[9990] bg-[#020B06]/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-xl bg-[#071E14]/98 border-[3px] border-[#03140C] shadow-[12px_12px_0px_#020C07,0_0_60px_rgba(16,185,129,0.15)] flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-4 border-b-[3px] border-[#03140C] bg-[#04160E]/80 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="bg-[#06B6D4]/20 border-2 border-[#03140C] p-2 shadow-[2px_2px_0px_#020C07]">
                <GraduationCap className="w-5 h-5 text-[#06B6D4]" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase font-mono tracking-[3px] text-[#06B6D4]">SOLO TRAINING MODE</p>
                <h2 className="text-base font-black text-[#F0FDF4] uppercase">Learn All 4 Roles</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 border-2 border-[#03140C] bg-[#0A261B] text-[#6EE7B7] hover:bg-[#FF4D6D] hover:text-white shadow-[2px_2px_0px_#020C07] transition-all active:translate-x-0.5 rounded-md"
              aria-label="Close Solo Training"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Role Progress Bar ── */}
          {phase === 'playing' && (
            <div className="flex-shrink-0 px-5 pt-4 pb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black uppercase font-mono text-emerald-400/70 tracking-widest">SPECIALIST PROGRESS</span>
                <span className="text-[9px] font-mono text-emerald-300/50">{completedRoles.length}/{totalRoles} unlocked</span>
              </div>
              <div className="flex gap-2">
                {TRAINING_PUZZLES.map((p, i) => {
                  const isDone = completedRoles.includes(p.role);
                  const isCurrent = i === currentRoleIdx;
                  return (
                    <div
                      key={p.role}
                      className={`flex-1 flex flex-col items-center space-y-1.5 p-2 border-2 transition-all ${
                        isDone
                          ? 'border-[#10B981] bg-[#10B981]/10'
                          : isCurrent
                          ? 'border-[#FBBF24] bg-[#FBBF24]/10'
                          : 'border-[#03140C] bg-[#020B06] opacity-50'
                      }`}
                    >
                      <span className="text-base leading-none">{p.emoji}</span>
                      <span className="text-[8px] font-black uppercase font-mono" style={{ color: isDone ? '#10B981' : isCurrent ? '#FBBF24' : '#475569' }}>
                        {isDone ? '✓ DONE' : isCurrent ? 'ACTIVE' : 'LOCKED'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Body (scrollable) ── */}
          <div className="flex-1 overflow-y-auto">

            {/* Intro Phase */}
            {phase === 'intro' && (
              <div className="p-6 space-y-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-[#06B6D4]/15 border-2 border-[#03140C] shadow-[4px_4px_0px_#020C07] flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-[#06B6D4]" />
                  </div>
                  <h3 className="text-xl font-black text-[#F0FDF4] uppercase">Before You Join a Squad</h3>
                  <p className="text-sm text-emerald-100/80 leading-relaxed max-w-sm mx-auto">
                    This training mode walks you through all 4 specialist roles one by one. No timer, no alarms, no squad needed. Hints are available at any step.
                  </p>
                </div>

                <div className="space-y-2">
                  {TRAINING_PUZZLES.map((p, i) => (
                    <div key={p.role} className="flex items-center space-x-3 p-3 border-2 border-[#03140C] bg-[#020B06]">
                      <div
                        className="w-8 h-8 border-2 border-[#03140C] flex items-center justify-center flex-shrink-0 font-mono font-black text-xs"
                        style={{ backgroundColor: `${p.color}20`, color: p.color }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#F0FDF4] uppercase">{p.label}</p>
                        <p className="text-[10px] text-emerald-300/60 font-mono">{p.discipline}</p>
                      </div>
                      <span className="ml-auto text-lg">{p.emoji}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => { setPhase('playing'); heistAudio.playRadioSquelch(); }}
                    className="w-full bg-[#06B6D4] text-[#02140D] font-black text-base py-3 border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#22D3EE] active:translate-x-0.5 active:translate-y-0.5 transition-all uppercase flex items-center justify-center space-x-2"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Start Solo Training</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full bg-transparent text-[#6EE7B7] font-mono font-bold text-xs py-2 border border-[#10B981]/30 hover:border-[#10B981] transition-colors uppercase tracking-widest"
                  >
                    Maybe Later — Back to Home
                  </button>
                </div>
              </div>
            )}

            {/* Playing Phase */}
            {phase === 'playing' && currentPuzzle && (
              <div className="p-5">
                {/* Role header */}
                <div
                  className="flex items-center space-x-3 p-3 mb-4 border-2 border-[#03140C]"
                  style={{ backgroundColor: currentPuzzle.bgColor }}
                >
                  <span className="text-2xl">{currentPuzzle.emoji}</span>
                  <div>
                    <p
                      className="text-[9px] font-black uppercase font-mono tracking-[3px]"
                      style={{ color: currentPuzzle.color }}
                    >
                      SPECIALIST #{currentRoleIdx + 1} OF {totalRoles}
                    </p>
                    <h3 className="text-base font-black text-[#F0FDF4] uppercase">{currentPuzzle.label}</h3>
                    <p className="text-[10px] text-emerald-300/60 font-mono">{currentPuzzle.discipline}</p>
                  </div>
                  {completedRoles.includes(currentPuzzle.role) && (
                    <CheckCircle2 className="w-6 h-6 text-[#10B981] ml-auto flex-shrink-0" />
                  )}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentRoleIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                  >
                    {completedRoles.includes(currentPuzzle.role) ? (
                      <div className="text-center py-8 space-y-3">
                        <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto" />
                        <p className="text-base font-black text-[#10B981] uppercase">Role Cleared!</p>
                        <p className="text-xs font-mono text-emerald-300/70">{lastClue}</p>
                        {currentRoleIdx < totalRoles - 1 && (
                          <button
                            onClick={() => setCurrentRoleIdx(i => i + 1)}
                            className="mt-4 flex items-center space-x-2 mx-auto bg-[#10B981] text-[#02140D] font-black text-xs px-4 py-2.5 border-2 border-[#03140C] shadow-[2px_2px_0px_#020C07] hover:bg-[#34D399] transition-all uppercase"
                          >
                            <span>Next Specialist</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <RoleCard
                        puzzle={currentPuzzle}
                        onSolved={handleSolved}
                        isTrainingMode={true}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* Complete Phase */}
            {phase === 'complete' && (
              <div className="p-6 space-y-6 text-center">
                <div className="space-y-4">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                    className="w-20 h-20 mx-auto bg-[#10B981]/20 border-[3px] border-[#10B981] shadow-[4px_4px_0px_#020C07,0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center"
                  >
                    <Trophy className="w-10 h-10 text-[#10B981]" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-black text-[#F0FDF4] uppercase">🎉 All 4 Roles Mastered!</h3>
                    <p className="text-sm text-emerald-100/80 mt-2 leading-relaxed max-w-sm mx-auto">
                      You've experienced the Hacker, Engineer, Scientist, and Cryptographer disciplines. Now you understand how the interdependence relay works!
                    </p>
                  </div>
                </div>

                {/* Role summary */}
                <div className="grid grid-cols-2 gap-2">
                  {TRAINING_PUZZLES.map(p => (
                    <div key={p.role} className="flex items-center space-x-2 p-2 border-2 border-[#10B981]/50 bg-[#10B981]/10">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                      <span className="text-[10px] font-black uppercase font-mono text-[#F0FDF4]">{p.emoji} {p.label}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-black uppercase font-mono text-[#FBBF24] tracking-widest">WHAT'S NEXT?</p>
                  <button
                    onClick={() => { onNavigate?.('lobby'); onClose(); }}
                    className="w-full bg-[#10B981] text-[#02140D] font-black text-sm py-3 border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#34D399] active:translate-x-0.5 active:translate-y-0.5 transition-all uppercase flex items-center justify-center space-x-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>Assemble a Real Squad → Lobby</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full bg-[#0A261B] text-[#6EE7B7] font-mono font-black text-xs py-2.5 border-2 border-[#03140C] shadow-[2px_2px_0px_#020C07] hover:bg-[#10B981]/20 active:translate-x-0.5 transition-all uppercase flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Play Training Again</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full text-slate-500 hover:text-slate-300 font-mono text-xs py-1 transition-colors"
                  >
                    Close & Return to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
