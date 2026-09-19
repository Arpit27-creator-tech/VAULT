import React, { useState } from 'react';
import { 
  X, Check, Sparkles, RotateCw, Palette, Shield, Award, 
  Type, Layers, Eye, RefreshCw, Trophy, Zap, Clock, CheckCircle2 
} from 'lucide-react';
import OperativeIdCard from './OperativeIdCard';
import { 
  CARD_THEMES, 
  FRAME_STYLES, 
  PRESET_MOTTOS, 
  AVAILABLE_SHOWCASE_MEDALS, 
  DEFAULT_CARD_CONFIG, 
  getOperativeCardConfig, 
  saveOperativeCardConfig 
} from '../utils/cardCustomization';
import { heistAudio } from './HeistAudioEngine';
import { toast } from 'sonner';

export default function CardCustomizerModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser
}) {
  const initialConfig = getOperativeCardConfig(currentUser);
  const [config, setConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState('THEME'); // 'THEME' | 'FRAME' | 'MOTTO' | 'MEDALS'
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSelectTheme = (themeKey) => {
    heistAudio.playKeyClick();
    setConfig(prev => ({ ...prev, theme: themeKey }));
  };

  const handleSelectFrame = (frameKey) => {
    heistAudio.playKeyClick();
    setConfig(prev => ({ ...prev, frameStyle: frameKey }));
  };

  const handleSelectMotto = (mottoText) => {
    heistAudio.playKeyClick();
    setConfig(prev => ({ ...prev, motto: mottoText }));
  };

  const handleToggleMedal = (medalId) => {
    heistAudio.playKeyClick();
    const current = config.showcasedMedals || [];
    if (current.includes(medalId)) {
      // Must keep at least 1 medal
      if (current.length <= 1) {
        toast.warning("Keep at least 1 showcase medal on your card");
        return;
      }
      setConfig(prev => ({
        ...prev,
        showcasedMedals: current.filter(id => id !== medalId)
      }));
    } else {
      if (current.length >= 3) {
        // Swap out the first one or prompt
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
    toast.success("✨ Operative ID Card customized & synchronized!");
    onClose();
  };

  const handleReset = () => {
    heistAudio.playKeyClick();
    setConfig(DEFAULT_CARD_CONFIG);
    toast.info("Card configuration reset to standard issue");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-[#03140C]/95 border border-emerald-500/40 rounded-[28px] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(16,185,129,0.15)] overflow-hidden transition-all">
        
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-emerald-500/20 bg-gradient-to-b from-white/[0.04] to-transparent">
          <div className="flex items-center space-x-3">
            <div className="bg-[#10B981]/20 text-[#34D399] p-2.5 rounded-2xl border border-[#10B981]/40 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black uppercase text-white font-mono tracking-wider">
                  ID CARD STUDIO
                </h2>
                <span className="bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40 text-[9px] font-mono font-black px-2 py-0.5 rounded-full uppercase">
                  Customizer
                </span>
              </div>
              <p className="text-xs text-emerald-200/70 mt-0.5">
                Personalize your holographic security clearance pass displayed when others inspect your operative profile
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-white/[0.05] hover:bg-[#FF4D6D]/30 border border-white/10 hover:border-[#FF4D6D]/50 rounded-2xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Studio Content Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Live Interactive Card Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-3 p-4 bg-black/40 rounded-2xl border border-white/10 shadow-inner">
            <div className="flex items-center justify-between w-full px-2 text-xs font-mono text-slate-400">
              <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                <Eye className="w-3.5 h-3.5" />
                <span>LIVE PREVIEW</span>
              </span>
              <button
                onClick={() => {
                  heistAudio.playKeyClick();
                  setIsFlipped(!isFlipped);
                }}
                className="text-[11px] text-amber-300 hover:text-white flex items-center space-x-1 bg-black/50 px-2.5 py-1 rounded-lg border border-amber-500/30"
              >
                <RotateCw className="w-3 h-3" />
                <span>{isFlipped ? 'Front View' : 'Flip Dossier'}</span>
              </button>
            </div>

            <OperativeIdCard 
              operative={currentUser}
              customConfig={config}
              isFlipped={isFlipped}
              onFlip={setIsFlipped}
              interactive={true}
            />

            <p className="text-[11px] text-slate-400 font-mono text-center px-4">
              💡 Click the flip icon on the card to inspect the reverse operative dossier.
            </p>
          </div>

          {/* Right Column: Customization Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Customizer Tabs Navigation */}
            <div className="flex items-center space-x-1.5 p-1 bg-black/50 rounded-2xl border border-emerald-500/20">
              {[
                { id: 'THEME', label: 'Theme & Foil', icon: Palette },
                { id: 'FRAME', label: 'Border Finish', icon: Layers },
                { id: 'MOTTO', label: 'Callsign Motto', icon: Type },
                { id: 'MEDALS', label: 'Showcase Medals', icon: Award }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      heistAudio.playKeyClick();
                      setActiveTab(tab.id);
                    }}
                    className={`flex-1 py-2 px-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                      isActive 
                        ? 'bg-[#10B981] text-[#02140D] shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: THEMES & FOILS */}
            {activeTab === 'THEME' && (
              <div className="space-y-3 animate-in fade-in">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    Select Holographic Theme
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Choose the primary metallic foil, security glow, and chromatic spectrum of your smart ID.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(CARD_THEMES).map(([key, theme]) => {
                    const isSelected = config.theme === key;
                    return (
                      <div
                        key={key}
                        onClick={() => handleSelectTheme(key)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3.5 bg-black/40 hover:bg-black/60 relative ${
                          isSelected 
                            ? 'border-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.25)] bg-[#042416]/50' 
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        {/* Swatch */}
                        <div className={`w-10 h-10 rounded-xl flex-shrink-0 shadow-md ${theme.previewSwatch} border border-white/20 flex items-center justify-center`}>
                          {isSelected && <Check className="w-5 h-5 text-white drop-shadow" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="font-mono text-xs font-black text-white block truncate">
                            {theme.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block truncate">
                            {theme.subtitle}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Shimmer Toggle */}
                <div className="p-3.5 bg-black/30 border border-white/10 rounded-2xl flex items-center justify-between mt-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">
                      Prismatic Hologram Shimmer
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Dynamic light refraction across card surface
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      heistAudio.playKeyClick();
                      setConfig(prev => ({ ...prev, hologramShimmer: !prev.hologramShimmer }));
                    }}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border ${
                      config.hologramShimmer 
                        ? 'bg-[#10B981]/20 text-[#34D399] border-[#10B981]/50' 
                        : 'bg-black/50 text-slate-400 border-white/15'
                    }`}
                  >
                    {config.hologramShimmer ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: BORDER FINISH */}
            {activeTab === 'FRAME' && (
              <div className="space-y-3 animate-in fade-in">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    Card Border & Surface Material
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Select the structural casing and texture overlay of your syndicate card.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(FRAME_STYLES).map(([key, frame]) => {
                    const isSelected = config.frameStyle === key;
                    return (
                      <div
                        key={key}
                        onClick={() => handleSelectFrame(key)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 bg-black/40 hover:bg-black/60 relative ${
                          isSelected 
                            ? 'border-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-[#042416]/50' 
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-black text-white">
                            {frame.name}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono leading-tight">
                          {frame.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Avatar Shape Option */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <span className="text-xs font-mono font-bold text-white block">
                    Avatar Photo & Level Bar Geometry
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        heistAudio.playKeyClick();
                        setConfig(prev => ({ ...prev, avatarShape: 'circle' }));
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        config.avatarShape !== 'roundedRect'
                          ? 'border-[#10B981] bg-[#10B981]/15 text-white'
                          : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold">Circular Ring (Default)</span>
                        {config.avatarShape !== 'roundedRect' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Concentric circular photo wrapped by gold XP arc
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        heistAudio.playKeyClick();
                        setConfig(prev => ({ ...prev, avatarShape: 'roundedRect' }));
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        config.avatarShape === 'roundedRect'
                          ? 'border-[#10B981] bg-[#10B981]/15 text-white'
                          : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold">Tactical Rounded</span>
                        {config.avatarShape === 'roundedRect' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Squarish photo wrapped by rounded-rect bar
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CALLSIGN MOTTO */}
            {activeTab === 'MOTTO' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    Operative Callsign Motto & Slogan
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Displayed directly below your Callsign on the front of your ID card.
                  </p>
                </div>

                {/* Custom Text Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300">
                    Custom Motto / Tagline:
                  </label>
                  <input
                    type="text"
                    maxLength={48}
                    value={config.motto || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, motto: e.target.value }))}
                    placeholder="Enter tactical slogan..."
                    className="w-full px-4 py-3 bg-[#020B06] border border-emerald-500/30 rounded-xl text-white font-mono text-xs sm:text-sm focus:border-emerald-400 outline-none"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Appears in quotes on card face</span>
                    <span>{(config.motto || '').length} / 48 characters</span>
                  </div>
                </div>

                {/* Preset Suggestions */}
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-slate-300 block">
                    Or pick from syndicate presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_MOTTOS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectMotto(preset)}
                        className={`text-[11px] font-mono px-3 py-1.5 rounded-xl border transition-all ${
                          config.motto === preset
                            ? 'bg-[#10B981] text-[#02140D] font-bold border-[#10B981]'
                            : 'bg-black/40 text-slate-300 hover:text-white border-white/10 hover:border-white/30'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SHOWCASE MEDALS */}
            {activeTab === 'MEDALS' && (
              <div className="space-y-3 animate-in fade-in">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    Select 3 Showcased Medals
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Pin up to 3 prestigious medals to the front of your operative clearance pass.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AVAILABLE_SHOWCASE_MEDALS.map((medal) => {
                    const isSelected = (config.showcasedMedals || []).includes(medal.id);
                    return (
                      <div
                        key={medal.id}
                        onClick={() => handleToggleMedal(medal.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 bg-black/40 hover:bg-black/60 relative ${
                          isSelected 
                            ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)] bg-[#241903]/40' 
                            : 'border-white/10 hover:border-white/25'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                          isSelected 
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300' 
                            : 'border-white/15 bg-black/40 text-slate-400'
                        }`}>
                          <Award className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono text-xs font-bold text-white truncate">
                              {medal.title}
                            </span>
                            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-white/10 text-amber-300">
                              {medal.tier}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            {medal.desc}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center flex-shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  Selected: <span className="text-amber-300 font-bold">{(config.showcasedMedals || []).length}</span> / 3 medals
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 px-6 border-t border-emerald-500/20 bg-gradient-to-t from-white/[0.04] to-transparent flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs font-mono text-slate-400 hover:text-white flex items-center space-x-1 px-3 py-2 rounded-xl hover:bg-white/[0.05] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/[0.05] text-xs font-mono text-slate-300 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-[#10B981] hover:bg-[#34D399] text-[#02140D] font-bold px-6 py-2.5 rounded-xl font-mono text-xs transition-all shadow-lg shadow-emerald-950/60 flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save & Equip Card</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
