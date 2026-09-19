import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Sparkles, RefreshCw, Award, Type } from 'lucide-react';
import OperativeIdCard from './OperativeIdCard';
import { 
  AVAILABLE_SHOWCASE_MEDALS,
  DEFAULT_CARD_CONFIG,
  getOperativeCardConfig, 
  saveOperativeCardConfig 
} from '../utils/cardCustomization';
import { heistAudio } from './HeistAudioEngine';
import { toast } from 'sonner';

const QUICK_TITLES = [
  'FIELD OPERATIVE',
  'APEX INFILTRATOR',
  'VAULT CRACKER',
  'GHOST PROTOCOL',
  'CIPHER MASTER',
  'SQUAD VANGUARD',
  'TACTICAL LEAD',
  'ZERO TRACE'
];

export default function CardCustomizerModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser
}) {
  const initialConfig = getOperativeCardConfig(currentUser);
  const [config, setConfig] = useState({
    motto: initialConfig?.motto || 'FIELD OPERATIVE',
    showcasedMedals: Array.isArray(initialConfig?.showcasedMedals) && initialConfig.showcasedMedals.length 
      ? initialConfig.showcasedMedals 
      : DEFAULT_CARD_CONFIG.showcasedMedals
  });

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !currentUser) return null;

  const handleSelectTitle = (title) => {
    heistAudio.playKeyClick();
    setConfig(prev => ({ ...prev, motto: title }));
  };

  const handleToggleMedal = (medalId) => {
    heistAudio.playKeyClick();
    const current = config.showcasedMedals || [];
    if (current.includes(medalId)) {
      if (current.length <= 1) {
        toast.warning("Keep at least 1 medal on your pass");
        return;
      }
      setConfig(prev => ({
        ...prev,
        showcasedMedals: current.filter(id => id !== medalId)
      }));
    } else {
      if (current.length >= 3) {
        // Replace the oldest selection to maintain exactly 3
        const updated = [...current.slice(1), medalId];
        setConfig(prev => ({ ...prev, showcasedMedals: updated }));
      } else {
        setConfig(prev => ({ ...prev, showcasedMedals: [...current, medalId] }));
      }
    }
  };

  const handleSave = () => {
    const saved = saveOperativeCardConfig(currentUser, config);
    if (onUpdateUser) {
      onUpdateUser({ cardConfig: saved });
    }
    heistAudio.playSuccessChime();
    toast.success("✨ ID Pass updated successfully!");
    onClose();
  };

  const handleReset = () => {
    heistAudio.playKeyClick();
    setConfig({
      motto: 'FIELD OPERATIVE',
      showcasedMedals: [...DEFAULT_CARD_CONFIG.showcasedMedals]
    });
    toast.info("Reset to standard issue ID Pass");
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#061D13] border-2 border-[#134830] rounded-[32px] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[8px_8px_0px_#020C07] overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-[#134830]/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#34D399] border-2 border-black flex items-center justify-center text-black font-black shadow-[2px_2px_0px_#000000]">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-game font-black uppercase text-white tracking-wider">
                CUSTOMIZE ID PASS
              </h2>
              <p className="text-xs text-[#6EE7B7] font-mono mt-0.5">
                Update your callsign title and choose 3 medals to showcase.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-emerald-300 hover:text-white bg-[#0B3020] hover:bg-[#0E3D29] border border-[#134830] rounded-xl transition-all"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Live Card Preview (6 cols) */}
          <div className="lg:col-span-6 flex flex-col items-center space-y-3">
            <div className="w-full flex items-center justify-between px-2 font-mono text-xs text-[#6EE7B7]">
              <span className="font-bold flex items-center space-x-1.5 text-[#34D399]">
                <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                <span>LIVE CARD PREVIEW</span>
              </span>
              <span className="text-[11px] text-emerald-400/80">Updates in real time</span>
            </div>

            <div className="w-full flex justify-center">
              <OperativeIdCard 
                operative={currentUser}
                customConfig={config}
              />
            </div>
          </div>

          {/* Right Column: Simple Customization Options (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Section 1: Operative Title */}
            <div className="bg-[#0B3020] border-2 border-[#134830] rounded-[24px] p-5 shadow-[4px_4px_0px_#020C07] space-y-3.5">
              <div className="flex items-center space-x-2">
                <Type className="w-4 h-4 text-[#FCD34D]" />
                <h3 className="font-game font-black text-sm text-white uppercase tracking-wider">
                  1. Pass Title / Motto
                </h3>
              </div>

              {/* Text Input */}
              <div>
                <input
                  type="text"
                  maxLength={32}
                  value={config.motto}
                  onChange={(e) => setConfig(prev => ({ ...prev, motto: e.target.value }))}
                  placeholder="e.g. FIELD OPERATIVE"
                  className="w-full px-4 py-2.5 bg-[#061D13] border-2 border-[#134830] focus:border-[#34D399] rounded-xl text-white font-game font-bold text-sm outline-none transition-colors uppercase placeholder:normal-case placeholder:text-emerald-700"
                />
                <div className="flex justify-end text-[10px] font-mono text-[#6EE7B7] mt-1">
                  <span>{(config.motto || '').length} / 32</span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-[#6EE7B7] block">
                  Quick suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TITLES.map((title, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectTitle(title)}
                      className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        config.motto.toUpperCase() === title
                          ? 'bg-[#FCD34D] text-black border-black shadow-sm'
                          : 'bg-[#061D13] text-[#A7F3D0] hover:text-white border-[#134830] hover:border-[#34D399]'
                      }`}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Choose 3 Showcase Medals */}
            <div className="bg-[#0B3020] border-2 border-[#134830] rounded-[24px] p-5 shadow-[4px_4px_0px_#020C07] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-[#FCD34D]" />
                  <h3 className="font-game font-black text-sm text-white uppercase tracking-wider">
                    2. Showcase Medals
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-[#34D399] bg-[#061D13] border border-[#134830] px-2.5 py-0.5 rounded-full">
                  {(config.showcasedMedals || []).length} / 3 selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AVAILABLE_SHOWCASE_MEDALS.map((medal) => {
                  const isSelected = (config.showcasedMedals || []).includes(medal.id);
                  const isLegendary = medal.tier === 'LEGENDARY';
                  const isEpic = medal.tier === 'EPIC';
                  const tierColor = isLegendary ? '#FCD34D' : (isEpic ? '#F472B6' : '#34D399');

                  return (
                    <div
                      key={medal.id}
                      onClick={() => handleToggleMedal(medal.id)}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center space-x-3 select-none ${
                        isSelected 
                          ? 'border-[#34D399] bg-[#0E3D29] shadow-[2px_2px_0px_#020C07]' 
                          : 'border-[#134830] bg-[#061D13] hover:border-[#134830]/80 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2 border-black flex-shrink-0 shadow"
                        style={{ backgroundColor: tierColor }}
                      >
                        {medal.emoji}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-game font-black text-xs text-white uppercase truncate">
                            {medal.title}
                          </span>
                        </div>
                        <span 
                          className="text-[9px] font-game font-bold px-1.5 py-0.2 rounded border border-black uppercase inline-block mt-0.5"
                          style={{ backgroundColor: tierColor, color: '#000000' }}
                        >
                          {medal.tier}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#34D399] text-black border border-black flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 px-6 border-t border-[#134830]/80 bg-[#061D13] flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs font-mono text-[#6EE7B7] hover:text-white flex items-center space-x-1.5 px-3 py-2 rounded-xl hover:bg-[#0B3020] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#134830] hover:bg-[#0B3020] text-xs font-mono text-[#6EE7B7] hover:text-white transition-all"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="bg-[#34D399] hover:bg-[#2DD4BF] text-[#020C07] font-game font-black text-xs uppercase px-6 py-2.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center space-x-2 transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>SAVE & EQUIP PASS</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
