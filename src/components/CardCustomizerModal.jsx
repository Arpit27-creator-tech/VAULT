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
  const [activeTab, setActiveTab] = useState('MOTTO'); // 'MOTTO' | 'MEDALS' | 'PASS_FEATURES'
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen || !currentUser) return null;

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
    toast.success("🔒 Cell Block 9 Inmate ID Card synchronized!");
    onClose();
  };

  const handleReset = () => {
    heistAudio.playKeyClick();
    setConfig(DEFAULT_CARD_CONFIG);
    toast.info("Inmate card configuration reset to standard issue");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-[#0e0703]/95 border border-orange-500/40 rounded-[28px] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(249,115,22,0.2)] overflow-hidden transition-all">
        
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-orange-500/20 bg-gradient-to-b from-white/[0.04] to-transparent">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500/20 text-orange-400 p-2.5 rounded-2xl border border-orange-500/40 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black uppercase text-white font-mono tracking-wider">
                  INMATE ID PASS STUDIO
                </h2>
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[9px] font-mono font-black px-2 py-0.5 rounded-full uppercase">
                  CELL BLOCK 9
                </span>
              </div>
              <p className="text-xs text-orange-200/70 mt-0.5">
                Personalize your Cell Block 9 detention pass, inmate motto, and showcase heist commendations
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
              <span className="flex items-center space-x-1 text-orange-400 font-bold">
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
              💡 Click the flip icon on the card to inspect the reverse penal confinement dossier.
            </p>
          </div>

          {/* Right Column: Customization Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Customizer Tabs Navigation */}
            <div className="flex items-center space-x-1.5 p-1 bg-black/50 rounded-2xl border border-orange-500/20">
              {[
                { id: 'MOTTO', label: 'Inmate Motto', icon: Type },
                { id: 'MEDALS', label: 'Showcase Medals', icon: Award },
                { id: 'PASS_FEATURES', label: 'Pass Features', icon: Sparkles }
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
                        ? 'bg-orange-500 text-black shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB: PASS FEATURES */}
            {activeTab === 'PASS_FEATURES' && (
              <div className="space-y-3.5 animate-in fade-in">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    Penitentiary Pass Features
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Permanent maximum security detention pass with reinforced cell bars and hazard caution banner.
                  </p>
                </div>

                {/* Primary Card Badge */}
                <div className="p-4 rounded-2xl border border-orange-500/60 bg-gradient-to-r from-orange-950/40 via-black/60 to-black/40 shadow-[0_0_20px_rgba(249,115,22,0.15)] flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-black border border-amber-400/80 p-0.5 overflow-hidden flex-shrink-0 shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                    <img src="/prison_seal_emblem.jpg" alt="Cell Block 9" className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-black text-white">
                        Cell Block 9 Inmate Pass
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold">
                        STANDARD ISSUE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Reinforced steel cell bars, diagonal hazard caution stripes, and booking identification stamp.
                    </p>
                  </div>
                </div>

                {/* Shimmer Toggle */}
                <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-between">
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
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' 
                        : 'bg-black/50 text-slate-400 border-white/15'
                    }`}
                  >
                    {config.hologramShimmer ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {/* Barcode & Booking Tag Toggle */}
                <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">
                      Penitentiary Booking QR / Barcode
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Cell block biometric booking scan on card footer
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      heistAudio.playKeyClick();
                      setConfig(prev => ({ ...prev, showBarcode: !prev.showBarcode }));
                    }}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border ${
                      config.showBarcode 
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' 
                        : 'bg-black/50 text-slate-400 border-white/15'
                    }`}
                  >
                    {config.showBarcode ? 'ENABLED' : 'DISABLED'}
                  </button>
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
                    placeholder="Enter convict motto..."
                    className="w-full px-4 py-3 bg-[#020B06] border border-orange-500/30 rounded-xl text-white font-mono text-xs sm:text-sm focus:border-orange-400 outline-none"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Appears in quotes on inmate card face</span>
                    <span>{(config.motto || '').length} / 48 characters</span>
                  </div>
                </div>

                {/* Preset Suggestions */}
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-slate-300 block">
                    Or pick from Cell Block 9 presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_MOTTOS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectMotto(preset)}
                        className={`text-[11px] font-mono px-3 py-1.5 rounded-xl border transition-all ${
                          config.motto === preset
                            ? 'bg-orange-500 text-black font-bold border-orange-500'
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

            {/* TAB: SHOWCASE MEDALS */}
            {activeTab === 'MEDALS' && (
              <div className="space-y-3 animate-in fade-in">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    Select 3 Showcased Medals
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Pin up to 3 prestigious medals to the front of your inmate clearance pass.
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
        <div className="p-4 sm:p-5 px-6 border-t border-orange-500/20 bg-gradient-to-t from-white/[0.04] to-transparent flex items-center justify-between">
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
              className="bg-orange-500 hover:bg-orange-400 text-black font-bold px-6 py-2.5 rounded-xl font-mono text-xs transition-all shadow-lg shadow-orange-950/60 flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save & Equip Inmate Pass</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
