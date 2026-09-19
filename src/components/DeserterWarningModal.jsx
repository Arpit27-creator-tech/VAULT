import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight, Shield } from 'lucide-react';
import { getLoyaltyRank, getLoyaltyPoints } from '../utils/loyaltyPoints';
import { heistAudio } from './HeistAudioEngine';

/**
 * DeserterWarningModal
 * 
 * Shown when a player tries to leave squad mid-heist.
 * Displays LP penalty + rank risk in a dramatic red overlay.
 */
export default function DeserterWarningModal({
  isOpen,
  isHeistActive,      // true = mid-heist (–150 LP), false = lobby (–25 LP)
  roomCode,
  onConfirmLeave,     // callback to actually do the leave
  onCancel,
}) {
  const [scanlineOffset, setScanlineOffset] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);

  // Animate scanlines
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setScanlineOffset(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Random glitch effect
  useEffect(() => {
    if (!isOpen) return;
    const glitch = () => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    };
    const id = setInterval(glitch, 2000 + Math.random() * 2000);
    return () => clearInterval(id);
  }, [isOpen]);

  const currentLP = getLoyaltyPoints();
  const currentRank = getLoyaltyRank(currentLP);
  const penalty = isHeistActive ? 150 : 25;
  const newLP = Math.max(0, currentLP - penalty);
  const newRank = getLoyaltyRank(newLP);
  const rankDowngrade = newRank.name !== currentRank.name;

  const penaltyLabel = isHeistActive
    ? 'MID-HEIST DESERTION'
    : 'SQUAD ABANDONMENT';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Deep red backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#1a0007]/92 backdrop-blur-md"
          />

          {/* Scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255, 0, 40, 0.15) 2px,
                rgba(255, 0, 40, 0.15) 4px
              )`,
              backgroundPositionY: `${scanlineOffset}px`,
            }}
          />

          {/* Pulsing red vignette */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(180,0,30,0.5) 100%)',
            }}
          />

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 30 }}
            transition={{ type: 'spring', stiffness: 340, damping: 24 }}
            className="relative z-20 max-w-lg w-full"
          >
            <div
              className="rounded-2xl border-2 border-[#FF1744]/60 overflow-hidden shadow-[0_0_80px_rgba(255,0,40,0.4)]"
              style={{
                background: 'linear-gradient(145deg, #1a0007 0%, #260010 50%, #1a0007 100%)',
              }}
            >
              {/* Header stripe */}
              <div className="bg-[#FF1744] px-6 py-3 flex items-center space-x-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <AlertTriangle className="w-5 h-5 text-white fill-white" />
                </motion.div>
                <span className="font-mono font-black text-sm uppercase tracking-widest text-white">
                  ⚠ LOYALTY BREACH DETECTED
                </span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                >
                  <AlertTriangle className="w-5 h-5 text-white fill-white ml-auto" />
                </motion.div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Title */}
                <div className="text-center space-y-1">
                  <motion.h2
                    animate={glitchActive
                      ? { x: [-2, 2, -1, 0], skewX: ['-1deg', '1deg', '0deg'] }
                      : {}
                    }
                    className="text-3xl font-black uppercase tracking-tight text-white font-game"
                    style={{ textShadow: '0 0 20px rgba(255,30,60,0.8)' }}
                  >
                    CONFIRM DESERTION?
                  </motion.h2>
                  <p className="text-[#FF8099] text-xs font-mono uppercase tracking-widest">
                    {penaltyLabel} · Room {roomCode || 'UNKNOWN'}
                  </p>
                </div>

                {/* LP Penalty card */}
                <div className="bg-[#2a000f] border border-[#FF1744]/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-mono text-[#FF8099] uppercase tracking-wider">
                        Current Squad Loyalty
                      </p>
                      <p className="text-2xl font-black text-white font-game">
                        <span style={{ color: currentRank.color }}>{currentRank.emoji}</span>{' '}
                        {currentLP.toLocaleString()} LP
                      </p>
                      <p className="text-xs font-mono" style={{ color: currentRank.color }}>
                        {currentRank.name} Rank
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="px-2">
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity }}
                      >
                        <ArrowRight className="w-6 h-6 text-[#FF4D6D]" />
                      </motion.div>
                    </div>

                    {/* After penalty */}
                    <div className="space-y-0.5 text-right">
                      <p className="text-xs font-mono text-[#FF8099] uppercase tracking-wider">
                        After Desertion
                      </p>
                      <p className="text-2xl font-black text-[#FF4D6D] font-game">
                        <span style={{ color: newRank.color }}>{newRank.emoji}</span>{' '}
                        {newLP.toLocaleString()} LP
                      </p>
                      <p className="text-xs font-mono font-bold text-[#FF1744]">
                        −{penalty} LP PENALTY
                      </p>
                    </div>
                  </div>

                  {/* Rank downgrade warning */}
                  {rankDowngrade && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-[#FF1744]/15 border border-[#FF1744]/40 rounded-lg px-3 py-2 flex items-center space-x-2"
                    >
                      <span className="text-lg">{newRank.emoji}</span>
                      <div>
                        <p className="text-xs font-bold text-[#FF8099] font-mono">
                          ⬇ RANK DOWNGRADE
                        </p>
                        <p className="text-[11px] text-[#FECDD3] font-mono">
                          {currentRank.name} → {newRank.name}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Flavor text */}
                {isHeistActive && (
                  <div className="bg-[#200010]/60 border border-[#FF1744]/20 rounded-lg px-4 py-2.5 text-center">
                    <p className="text-xs font-mono text-[#FF8099] leading-relaxed">
                      ⚠ Your squad is currently mid-heist. Leaving now abandons your teammates
                      and will be recorded as a <span className="font-bold text-[#FF1744]">DESERTION</span>.
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* Stay — prominent green */}
                  <button
                    onClick={() => {
                      heistAudio.playKeyClick();
                      onCancel?.();
                    }}
                    className="col-span-2 sm:col-span-1 order-1 sm:order-2 flex items-center justify-center space-x-2 bg-[#10B981] hover:bg-[#34D399] text-[#02140D] font-black text-sm px-5 py-3.5 rounded-xl border-2 border-[#10B981]/80 uppercase font-game transition-all shadow-lg shadow-emerald-900/40 hover:shadow-emerald-700/50"
                    style={{ boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}
                  >
                    <Shield className="w-4 h-4" />
                    <span>STAY WITH SQUAD</span>
                  </button>

                  {/* Confirm desertion — red, scary */}
                  <button
                    onClick={() => {
                      heistAudio.playKeyClick();
                      onConfirmLeave?.();
                    }}
                    className="col-span-2 sm:col-span-1 order-2 sm:order-1 flex items-center justify-center space-x-2 bg-[#1a0007] hover:bg-[#280010] text-[#FF4D6D] hover:text-[#FF1744] font-black text-xs px-5 py-3.5 rounded-xl border-2 border-[#FF1744]/40 hover:border-[#FF1744]/70 uppercase font-mono transition-all"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Confirm Desertion (−{penalty} LP)</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
