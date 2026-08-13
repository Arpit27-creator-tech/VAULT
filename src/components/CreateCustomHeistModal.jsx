import React, { useState } from 'react';
import { 
  X, Plus, Sparkles, Play, Save, CheckCircle2, ShieldAlert, 
  Terminal, Compass, FlaskConical, Key, Clock, Award, Users, RefreshCw
} from 'lucide-react';
import { heistAudio } from './HeistAudioEngine';
import { FALLBACK_SUBJECT_IMG } from '../data/initialData';

export default function CreateCustomHeistModal({ 
  isOpen, 
  onClose, 
  onSaveHeist, 
  onLaunchCustomHeist 
}) {
  if (!isOpen) return null;

  // Presets
  const presets = [
    {
      title: "The Dark Matter Quantum Core",
      category: "Applied Physics & Mathematics",
      difficulty: "Master Expedition",
      timeLimit: 180,
      description: "Neutralize particle accelerators and align polarized laser deflectors before the containment field destabilizes.",
      roles: { hacker: true, engineer: true, scientist: true, cryptographer: true }
    },
    {
      title: "The Silicon Vault & Cyber Matrix",
      category: "Computer Science & Logic",
      difficulty: "Medium",
      timeLimit: 120,
      description: "Bypass kernel firewalls, solve recursive tree logic, and decrypt intercepted access tokens.",
      roles: { hacker: true, engineer: false, scientist: false, cryptographer: true }
    },
    {
      title: "The Cryo-Genetics Synthesis Lab",
      category: "Chemistry & Life Sciences",
      difficulty: "Easy",
      timeLimit: 150,
      description: "Formulate cryogenic neutralizers, balance molar equations, and calibrate optical microscope sensors.",
      roles: { hacker: false, engineer: true, scientist: true, cryptographer: false }
    }
  ];

  const [title, setTitle] = useState("The Dark Matter Quantum Core");
  const [targetFacility, setTargetFacility] = useState("Sanctum Sector 09");
  const [category, setCategory] = useState("Integrated STEM Synthesis");
  const [difficulty, setDifficulty] = useState("Master Expedition");
  const [timeLimit, setTimeLimit] = useState(180);
  const [description, setDescription] = useState("Infiltrate the high-voltage underground facility by solving synchronized academic puzzles across specialized cockpits.");

  // Role Selection toggles
  const [selectedRoles, setSelectedRoles] = useState({
    hacker: true,
    engineer: true,
    scientist: true,
    cryptographer: true
  });

  // Custom puzzle overrides
  const [hackerPrompt, setHackerPrompt] = useState("Write an array slice expression to extract indices 2 through 6 of the security buffer.");
  const [engineerAngleA, setEngineerAngleA] = useState(45);
  const [engineerAngleB, setEngineerAngleB] = useState(135);
  const [scientistEquation, setScientistEquation] = useState("2 HCl + 1 CaCO3 ➔ 1 CaCl2 + 1 H2O + 1 CO2");
  const [scientistPh, setScientistPh] = useState(6.8);
  const [cryptoFreq, setCryptoFreq] = useState(142.5);
  const [cryptoCiphertext, setCryptoCiphertext] = useState("VHFXUH WKH JURYH");
  const [cryptoSolution, setCryptoSolution] = useState("SECURE THE GROVE");

  const toggleRole = (roleKey) => {
    heistAudio.playKeyClick();
    const count = Object.values(selectedRoles).filter(Boolean).length;
    if (selectedRoles[roleKey] && count <= 1) {
      return; // At least one role must remain selected
    }
    setSelectedRoles(prev => ({
      ...prev,
      [roleKey]: !prev[roleKey]
    }));
  };

  const applyPreset = (preset) => {
    heistAudio.playKeyClick();
    setTitle(preset.title);
    setCategory(preset.category);
    setDifficulty(preset.difficulty);
    setTimeLimit(preset.timeLimit);
    setDescription(preset.description);
    setSelectedRoles(preset.roles);
  };

  const constructCustomStage = () => {
    return {
      stageId: 99,
      isCustom: true,
      title: title || "Custom Vault Operation",
      subtitle: `${category} • ${difficulty}`,
      description: description || "Custom heist mission configured by player.",
      timeLimit: parseInt(timeLimit, 10) || 180,
      targetFacility: targetFacility || "Secure Facility Alpha",
      selectedRoles: selectedRoles,
      puzzles: {
        hacker: {
          role: "hacker",
          title: "Custom Firewall Terminal",
          discipline: "Computer Science & Logic",
          prompt: hackerPrompt,
          initialCode: `// Hacker Terminal - Custom Injection
function extractPayload(buffer) {
  // Return extracted slice:
  return buffer.slice(2, 7);
}`,
          testCase: ["0x00", "0x11", "0x7E", "0x3A", "0x99", "0xAA", "0xBB", "0xFF"],
          expectedOutput: ["0x7E", "0x3A", "0x99", "0xAA", "0xBB"],
          clueRevealed: "Custom Firewall Bypassed: Token '0x9F4C' Dispatched!"
        },
        engineer: {
          role: "engineer",
          title: "Custom Laser Deflector Array",
          discipline: "Applied Physics & Geometry",
          prompt: `Align Mirror A (${engineerAngleA}°) and Mirror B (${engineerAngleB}°) to trigger the override photo-sensor.`,
          requiredAngleA: parseInt(engineerAngleA, 10) || 45,
          requiredAngleB: parseInt(engineerAngleB, 10) || 135,
          sensorTargetX: 85,
          sensorTargetY: 40,
          clueRevealed: "Custom Laser Grid Equalized! Optical lock disengaged."
        },
        scientist: {
          role: "scientist",
          title: "Custom Chemical Synthesis Lab",
          discipline: "Chemistry & Stoichiometry",
          prompt: `Balance stoichiometric reagents for reaction: ${scientistEquation}`,
          equation: scientistEquation,
          reagents: [
            { name: "Hydrochloric Acid (HCl)", requiredCoeff: 2, currentCoeff: 1, min: 1, max: 5 },
            { name: "Calcium Carbonate (CaCO3)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 5 },
            { name: "Calcium Chloride (CaCl2)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 5 },
            { name: "Water (H2O)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 5 },
            { name: "Carbon Dioxide (CO2)", requiredCoeff: 1, currentCoeff: 1, min: 1, max: 5 }
          ],
          targetPh: parseFloat(scientistPh) || 6.8,
          clueRevealed: "Custom Reagent Synthesized! pH buffer neutralized."
        },
        cryptographer: {
          role: "cryptographer",
          title: "Custom VHF Frequency Deck",
          discipline: "Cryptography & Linguistics",
          prompt: `Tune receiver to ${cryptoFreq} MHz and decipher: '${cryptoCiphertext}'`,
          targetFrequency: parseFloat(cryptoFreq) || 142.5,
          ciphertext: cryptoCiphertext,
          solution: cryptoSolution,
          cipherType: "Caesar (+3)",
          clueRevealed: `Authorization Passcode Verified: '${cryptoSolution}'`
        }
      }
    };
  };

  const handleLaunchNow = () => {
    const stage = constructCustomStage();
    onLaunchCustomHeist(stage);
    onClose();
  };

  const handleSaveToCatalog = (e) => {
    e.preventDefault();
    const stage = constructCustomStage();
    onSaveHeist(stage);
    onClose();
  };

  const activeRoleCount = Object.values(selectedRoles).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020B06]/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="forest-card max-w-4xl w-full p-6 sm:p-8 space-y-6 border-[4px] border-[#03140C] bg-[#051811] shadow-[12px_12px_0px_#020C07] my-8">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-[#03140C] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-[#FBBF24] text-[#02140D] font-mono font-black text-xs px-2.5 py-0.5 border border-[#03140C] uppercase">
                HEIST ARCHITECT
              </span>
              <span className="text-xs font-mono font-bold text-emerald-300">CUSTOM OPERATION CREATOR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#F0FDF4] mt-1">
              Create Custom Heist & Select Squad Roles
            </h2>
            <p className="text-xs text-emerald-200 font-medium">
              Configure mission objectives, choose active specialist roles, set countdown timers, and craft custom puzzles.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 hover:bg-[#0E3A28] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-emerald-400">⚡ Quick Mission Presets:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="p-2.5 bg-[#020B06] border border-[#0E3A28] text-left hover:border-[#10B981] transition-all group"
              >
                <p className="text-xs font-bold text-[#FBBF24] group-hover:text-[#34D399] truncate">{preset.title}</p>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{preset.category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 1: General Mission Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#03140C] p-4 border border-emerald-900/60">
          <div>
            <label className="block text-xs font-mono font-bold text-emerald-300 mb-1">Mission / Vault Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. The Quantum Redwood Reactor"
              className="w-full bg-[#020B06] border-2 border-[#03140C] p-2.5 text-emerald-100 font-mono text-xs focus:border-[#10B981] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-emerald-300 mb-1">Target Facility / Sector</label>
            <input
              type="text"
              value={targetFacility}
              onChange={e => setTargetFacility(e.target.value)}
              placeholder="e.g. High-Voltage Chamber B"
              className="w-full bg-[#020B06] border-2 border-[#03140C] p-2.5 text-emerald-100 font-mono text-xs focus:border-[#10B981] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-emerald-300 mb-1">Subject Focus</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-[#020B06] border-2 border-[#03140C] p-2.5 text-emerald-100 font-mono text-xs focus:border-[#10B981] outline-none"
            >
              <option>Computer Science & Logic</option>
              <option>Applied Physics & Mathematics</option>
              <option>Chemistry & Life Sciences</option>
              <option>Linguistics & Ancient Ciphers</option>
              <option>Integrated STEM Synthesis</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-mono font-bold text-emerald-300 mb-1">Time Limit</label>
              <select
                value={timeLimit}
                onChange={e => setTimeLimit(e.target.value)}
                className="w-full bg-[#020B06] border-2 border-[#03140C] p-2.5 text-emerald-100 font-mono text-xs focus:border-[#10B981] outline-none"
              >
                <option value={60}>60s (Speed Blitz)</option>
                <option value={120}>120s (Fast)</option>
                <option value={180}>180s (Standard 3m)</option>
                <option value={240}>240s (Extended 4m)</option>
                <option value={300}>300s (Master 5m)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-emerald-300 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full bg-[#020B06] border-2 border-[#03140C] p-2.5 text-emerald-100 font-mono text-xs focus:border-[#10B981] outline-none"
              >
                <option>Easy (Beginner)</option>
                <option>Medium (Intermediate)</option>
                <option>Master Expedition</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Role Selection */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-emerald-300 uppercase">
              Select Active Squad Roles ({activeRoleCount} / 4 Selected):
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Toggle roles for 1-player, 2-player, or 4-player co-op</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'hacker',
                name: 'The Hacker',
                icon: Terminal,
                color: '#10B981',
                discipline: 'Data Structures / Code',
                desc: 'Array slices & pointer firewall bypass'
              },
              {
                id: 'engineer',
                name: 'The Engineer',
                icon: Compass,
                color: '#FBBF24',
                discipline: 'Physics / Geometry',
                desc: 'Snell’s law laser mirror angles'
              },
              {
                id: 'scientist',
                name: 'The Scientist',
                icon: FlaskConical,
                color: '#06B6D4',
                discipline: 'Chemistry / Stoichiometry',
                desc: 'Stoichiometric molar balancing'
              },
              {
                id: 'cryptographer',
                name: 'The Cryptographer',
                icon: Key,
                color: '#C084FC',
                discipline: 'Ciphers / Linguistics',
                desc: 'VHF radio frequency & Caesar shift'
              }
            ].map(role => {
              const Icon = role.icon;
              const isSelected = !!selectedRoles[role.id];

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => toggleRole(role.id)}
                  className={`p-4 border-[3px] border-[#03140C] text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#0A3020] shadow-[3px_3px_0px_#10B981]'
                      : 'bg-[#020B06] opacity-50 border-dashed hover:opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <Icon className="w-4 h-4" style={{ color: role.color }} />
                        <span className="font-mono text-xs font-black uppercase" style={{ color: role.color }}>
                          {role.name}
                        </span>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">OFF</span>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-emerald-200">{role.discipline}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{role.desc}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#03140C] text-[10px] font-mono font-bold">
                    <span className={isSelected ? "text-[#34D399]" : "text-slate-600"}>
                      {isSelected ? "✓ ACTIVE IN MISSION" : "✕ EXCLUDED"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Fine-Tune Selected Role Puzzles */}
        <div className="space-y-3 bg-[#03140C] p-4 border border-emerald-900/60">
          <span className="text-xs font-mono font-bold text-[#FBBF24] uppercase block">
            Custom Puzzle Configuration for Selected Roles:
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            
            {/* Hacker Settings */}
            {selectedRoles.hacker && (
              <div className="p-3 bg-[#020B06] border border-[#10B981]/40 space-y-1.5">
                <span className="text-[#10B981] font-bold flex items-center space-x-1">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Hacker Terminal Objective:</span>
                </span>
                <input
                  type="text"
                  value={hackerPrompt}
                  onChange={e => setHackerPrompt(e.target.value)}
                  className="w-full bg-[#051811] border border-[#03140C] p-2 text-emerald-100 text-[11px] outline-none"
                />
              </div>
            )}

            {/* Engineer Settings */}
            {selectedRoles.engineer && (
              <div className="p-3 bg-[#020B06] border border-[#FBBF24]/40 space-y-1.5">
                <span className="text-[#FBBF24] font-bold flex items-center space-x-1">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Engineer Laser Target Angles:</span>
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={engineerAngleA}
                    onChange={e => setEngineerAngleA(e.target.value)}
                    placeholder="Angle A (e.g. 45°)"
                    className="w-1/2 bg-[#051811] border border-[#03140C] p-2 text-emerald-100 text-[11px] outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={engineerAngleB}
                    onChange={e => setEngineerAngleB(e.target.value)}
                    placeholder="Angle B (e.g. 135°)"
                    className="w-1/2 bg-[#051811] border border-[#03140C] p-2 text-emerald-100 text-[11px] outline-none"
                  />
                </div>
              </div>
            )}

            {/* Scientist Settings */}
            {selectedRoles.scientist && (
              <div className="p-3 bg-[#020B06] border border-[#06B6D4]/40 space-y-1.5">
                <span className="text-[#06B6D4] font-bold flex items-center space-x-1">
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Scientist Target Reaction & pH:</span>
                </span>
                <input
                  type="text"
                  value={scientistEquation}
                  onChange={e => setScientistEquation(e.target.value)}
                  className="w-full bg-[#051811] border border-[#03140C] p-2 text-emerald-100 text-[11px] outline-none"
                />
              </div>
            )}

            {/* Cryptographer Settings */}
            {selectedRoles.cryptographer && (
              <div className="p-3 bg-[#020B06] border border-[#C084FC]/40 space-y-1.5">
                <span className="text-[#C084FC] font-bold flex items-center space-x-1">
                  <Key className="w-3.5 h-3.5" />
                  <span>Cryptographer Frequency & Solution:</span>
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={cryptoFreq}
                    onChange={e => setCryptoFreq(e.target.value)}
                    placeholder="MHz (e.g. 142.5)"
                    className="w-1/3 bg-[#051811] border border-[#03140C] p-2 text-emerald-100 text-[11px] outline-none"
                  />
                  <input
                    type="text"
                    value={cryptoSolution}
                    onChange={e => setCryptoSolution(e.target.value)}
                    placeholder="Plaintext Solution"
                    className="w-2/3 bg-[#051811] border border-[#03140C] p-2 text-emerald-100 text-[11px] outline-none uppercase"
                  />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleLaunchNow}
            className="flex-1 bg-[#10B981] text-[#02140D] font-black py-3.5 px-6 border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#34D399] active:translate-x-0.5 uppercase flex items-center justify-center space-x-2 text-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch & Play Custom Heist Now</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToCatalog}
            className="bg-[#FBBF24] text-[#02140D] font-black py-3.5 px-6 border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#F59E0B] active:translate-x-0.5 uppercase flex items-center justify-center space-x-2 text-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save to Expeditions Catalog</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-[#0A261B] text-[#F0FDF4] font-black py-3.5 px-5 border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#0F3828] active:translate-x-0.5 uppercase text-sm"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
