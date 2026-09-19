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
      <div className="bg-[#051C12] border-2 border-[#059669] rounded-[28px] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[8px_8px_0px_#020C07] overflow-hidden transition-all">
        
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-[#059669]/50 bg-transparent">
          <div className="flex items-center space-x-3">
            <div className="bg-[#072418] text-[#10B981] p-2.5 rounded-2xl border border-[#059669]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black uppercase text-white font-mono tracking-wider">
                  INMATE ID PASS STUDIO
                </h2>
                <span className="bg-[#072418] text-[#10B981] border border-[#059669] text-[9px] font-mono font-black px-2 py-0.5 rounded uppercase">
                  CELL BLOCK 9
                </span>
              </div>
              <p className="text-xs text-[#A7F3D0] mt-0.5">
                Personalize your Cell Block 9 detention pass, inmate motto, and showcase heist commendations
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-[#A7F3D0] hover:text-white bg-[#072418] hover:bg-[#0A2E20] border border-[#059669] rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Studio Content Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Live Interactive Card Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-3 p-4 bg-[#020C07] rounded-2xl border border-[#059669]/60 shadow-inner">
            <div className="flex items-center justify-between w-full px-2 text-xs font-mono text-[#A7F3D0]">
              <span className="flex items-center space-x-1 text-[#10B981] font-bold">
                <Eye className="w-3.5 h-3.5" />
                <span>LIVE PREVIEW</span>
              </span>
              <button
                onClick={() => {
                  heistAudio.playKeyClick();
                  setIsFlipped(!isFlipped);
                }}
                className="text-[11px] text-[#A7F3D0] hover:text-white flex items-center space-x-1 bg-[#072418] px-2.5 py-1 rounded-lg border border-[#059669]"
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

            <p className="text-[11px] text-[#A7F3D0] font-mono text-center px-4">
              💡 Click the flip icon on the card to inspect the reverse penal confinement dossier.
            </p>
          </div>

          {/* Right Column: Customization Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Customizer Tabs Navigation */}
            <div className="flex items-center space-x-1.5 p-1 bg-[#020C07] rounded-2xl border border-[#059669]/60">
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
                        ? 'bg-[#10B981] text-[#020C07] shadow font-bold' 
                        : 'text-[#A7F3D0] hover:text-white hover:bg-[#072418]'
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
                  <p className="text-xs text-[#A7F3D0] font-mono">
                    Permanent maximum security detention pass with reinforced cell bars and hazard caution banner.
                  </p>
                </div>

                {/* Primary Card Badge */}
                <div className="p-4 rounded-2xl border border-[#059669] bg-[#072418] flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#020C07] border border-[#059669] p-0.5 overflow-hidden flex-shrink-0">
                    <img src="/prison_seal_emblem.jpg" alt="Cell Block 9" className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-black text-white">
                        Cell Block 9 Inmate Pass
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#020C07] text-[#10B981] border border-[#059669] font-bold">
                        STANDARD ISSUE
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A7F3D0] font-mono mt-0.5">
                      Reinforced steel cell bars, diagonal hazard caution stripes, and booking identification stamp.
                    </p>
                  </div>
                </div>

                {/* Shimmer Toggle */}
                <div className="p-3.5 bg-[#072418] border border-[#059669]/60 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">
                      Prismatic Hologram Shimmer
                    </span>
                    <span className="text-[11px] text-[#A7F3D0] font-mono">
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
                        ? 'bg-[#10B981] text-[#020C07] border-[#059669]' 
                        : 'bg-[#020C07] text-[#A7F3D0] border-[#059669]'
                    }`}
                  >
                    {config.hologramShimmer ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {/* Barcode & Booking Tag Toggle */}
                <div className="p-3.5 bg-[#072418] border border-[#059669]/60 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">
                      Penitentiary Booking QR / Barcode
                    </span>
                    <span className="text-[11px] text-[#A7F3D0] font-mono">
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
                        ? 'bg-[#10B981] text-[#020C07] border-[#059669]' 
                        : 'bg-[#020C07] text-[#A7F3D0] border-[#059669]'
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
                  <p className="text-xs text-[#A7F3D0] font-mono">
                    Displayed directly below your Callsign on the front of your ID card.
                  </p>
                </div>

                {/* Custom Text Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#A7F3D0]">
                    Custom Motto / Tagline:
                  </label>
                  <input
                    type="text"
                    maxLength={48}
                    value={config.motto || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, motto: e.target.value }))}
                    placeholder="Enter convict motto..."
                    className="w-full px-4 py-3 bg-[#020C07] border border-[#059669] rounded-xl text-white font-mono text-xs sm:text-sm focus:border-[#10B981] outline-none"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#A7F3D0]">
                    <span>Appears in quotes on inmate card face</span>
                    <span>{(config.motto || '').length} / 48 characters</span>
                  </div>
                </div>

                {/* Preset Suggestions */}
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-[#A7F3D0] block">
                    Or pick from Cell Block 9 presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_MOTTOS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectMotto(preset)}
                        className={`text-[11px] font-mono px-3 py-1.5 rounded-xl border transition-all ${
                          config.motto === preset
                            ? 'bg-[#10B981] text-[#020C07] font-bold border-[#10B981]'
                            : 'bg-[#072418] text-[#A7F3D0] hover:text-white border border-[#059669] hover:border-[#10B981]'
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
                  <p className="text-xs text-[#A7F3D0] font-mono">
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
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 relative ${
                          isSelected 
                            ? 'border-2 border-[#10B981] bg-[#0A2E20]' 
                            : 'border border-[#059669]/60 bg-[#072418] hover:border-[#059669]'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                          isSelected 
                            ? 'border-[#10B981] bg-[#072418] text-[#10B981]' 
                            : 'border-[#059669]/80 bg-[#020C07] text-[#A7F3D0]'
                        }`}>
                          <Award className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono text-xs font-bold text-white truncate">
                              {medal.title}
                            </span>
                            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-[#020C07] text-[#A7F3D0] border border-[#059669]">
                              {medal.tier}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#A7F3D0] font-mono truncate">
                            {medal.desc}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#10B981] text-[#020C07] flex items-center justify-center flex-shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="text-[11px] font-mono text-[#A7F3D0] pt-1">
                  Selected: <span className="text-[#10B981] font-bold">{(config.showcasedMedals || []).length}</span> / 3 medals
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 px-6 border-t border-[#059669]/50 bg-transparent flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs font-mono text-[#A7F3D0] hover:text-white flex items-center space-x-1 px-3 py-2 rounded-xl hover:bg-[#072418] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#059669] hover:bg-[#072418] text-xs font-mono text-[#A7F3D0] hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-[#10B981] hover:bg-[#059669] text-[#020C07] font-bold px-6 py-2.5 rounded-xl font-mono text-xs transition-all shadow-[4px_4px_0px_#020C07] flex items-center space-x-1.5"
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
