import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, X } from 'lucide-react';
import { ACHIEVEMENT_TIERS } from '../data/achievements';
import { heistAudio } from './HeistAudioEngine';

export default function AchievementUnlockBanner({ achievement, onClose }) {
  useEffect(() => {
    if (!achievement) return;
    try {
      heistAudio.playSuccess();
    } catch {}

    const timer = setTimeout(() => {
      onClose?.();
    }, 5500);

    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  if (!achievement) return null;

  const tier = ACHIEVEMENT_TIERS[achievement.tier] || ACHIEVEMENT_TIERS.BRONZE;
  const Icon = achievement.icon || Trophy;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] w-[92vw] max-w-md pointer-events-auto cursor-pointer"
        onClick={onClose}
      >
        <div 
          className="bg-[#051C12]/98 backdrop-blur-xl border-[3px] border-[#03140C] shadow-[8px_8px_0px_#020C07] p-4 relative overflow-hidden text-left rounded-xl"
          style={{
            boxShadow: `8px 8px 0px #020C07, 0 0 30px ${tier.glow}`
          }}
        >
          {/* Top colored accent line */}
          <div 
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: tier.color }}
          />

          <div className="flex items-start space-x-3.5">
            {/* Medal Icon Badge */}
            <div 
              className="w-12 h-12 rounded-lg border-2 border-[#03140C] shadow-[3px_3px_0px_#020C07] flex items-center justify-center flex-shrink-0 relative overflow-hidden"
              style={{ 
                backgroundColor: tier.bg,
                borderColor: tier.color
              }}
            >
              <Icon className="w-6 h-6" style={{ color: tier.color }} />
              {/* Inner shine animation */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-60" />
            </div>

            {/* Information */}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase font-mono tracking-widest text-[#FBBF24] flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-[#FBBF24]" />
                  <span>ACHIEVEMENT UNLOCKED</span>
                </span>
                <span 
                  className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border"
                  style={{ color: tier.color, borderColor: `${tier.color}60` }}
                >
                  {tier.label}
                </span>
              </div>

              <h3 className="text-base font-black text-white leading-snug mt-0.5 truncate font-game">
                {achievement.title}
              </h3>

              <p className="text-xs text-emerald-100/80 leading-relaxed mt-0.5 line-clamp-2">
                {achievement.description}
              </p>

              {/* Reward pill */}
              <div className="mt-2 flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1 bg-[#10B981]/20 border border-[#10B981] text-[#34D399] font-mono font-black text-[10px] px-2 py-0.5 rounded shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                  <span>+{achievement.xpReward} XP AWARDED</span>
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}
              className="text-slate-400 hover:text-white p-1 absolute top-3 right-3 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
