import React, { useState } from 'react';
import { 
  Terminal, Zap, FlaskConical, Key, Sparkles, CheckCircle2, 
  Play, Compass, Cpu, BookOpen, Lightbulb, Lock, Award
} from 'lucide-react';
import { heistAudio } from './HeistAudioEngine';
import { toast } from 'sonner';

export default function GraphicalRoadmap({ onStartHeist, onOpenModal }) {
  const [selectedNodeId, setSelectedNodeId] = useState('cs-1');
  const [activeCategory, setActiveCategory] = useState('cs'); 

  // Interactive sandbox state
  const [laserAngle, setLaserAngle] = useState(45);
  const [refractiveIndex] = useState(1.5);
  const [memoryPointerOffset, setMemoryPointerOffset] = useState(2);
  const [phLevel, setPhLevel] = useState(7.0);
  const [cipherShift, setCipherShift] = useState(3);
  const [cipherInput, setCipherInput] = useState('VAULT');

  const roadmapNodes = [
    {
      id: 'cs-1',
      category: 'cs',
      chapter: 1,
      title: 'Memory Buffers & Pointer Offsets',
      domain: 'Computer Science',
      role: 'Canopy Hacker',
      icon: Terminal,
      color: '#10B981',
      status: 'completed',
      xp: 250,
      simpleAnalogy: 'Think of computer memory like a row of numbered lockers. A pointer is simply the locker number (address) where the secret key is hidden.',
      whyInHeist: 'The hacker calculates how many memory byte steps (offsets) to jump to extract the vault passcode from server RAM.',
      formula: '*(Base_Address + Offset_Bytes)',
      formulaExplanation: 'Base Address = starting locker, Offset = number of byte lockers to skip.',
      interactiveType: 'memory'
    },
    {
      id: 'cs-2',
      category: 'cs',
      chapter: 2,
      title: 'Kernel Firewall Packet Injection',
      domain: 'Computer Science',
      role: 'Canopy Hacker',
      icon: Terminal,
      color: '#10B981',
      status: 'in_progress',
      xp: 400,
      simpleAnalogy: 'Like slipping a VIP authorization envelope into a guarded mail slot so the security gate opens without tripping alarms.',
      whyInHeist: 'Bypasses surveillance cameras by spoofing authorized packet headers in real time.',
      formula: 'CheckSum = ~(Σ 16-bit Words)',
      formulaExplanation: 'Ensures the firewall accepts the injected data packet without tripping integrity alarms.',
      interactiveType: 'memory'
    },
    {
      id: 'phys-1',
      category: 'phys',
      chapter: 1,
      title: "Snell's Law & Prism Refraction",
      domain: 'Physics & Optics',
      role: 'Woodland Engineer',
      icon: Zap,
      color: '#FBBF24',
      status: 'completed',
      xp: 300,
      simpleAnalogy: 'When a laser travels from air into glass, it slows down and bends at an angle—just like a straw looking bent in a glass of water.',
      whyInHeist: 'The engineer rotates glass prisms to bend security lasers away from alarms and into power receivers.',
      formula: 'n₁ · sin(θ₁) = n₂ · sin(θ₂)',
      formulaExplanation: 'n₁ & n₂ = material density, θ₁ & θ₂ = entry & exit angles of the laser beam.',
      interactiveType: 'laser'
    },
    {
      id: 'phys-2',
      category: 'phys',
      chapter: 2,
      title: 'Capacitor Resonance & Discharge',
      domain: 'Physics & Optics',
      role: 'Woodland Engineer',
      icon: Zap,
      color: '#FBBF24',
      status: 'in_progress',
      xp: 420,
      simpleAnalogy: 'Like pushing someone on a swing at the exact right moment so they swing higher with very little effort.',
      whyInHeist: 'Matches electrical resonance of high-voltage fences to safely discharge defense capacitors.',
      formula: 'f₀ = 1 / (2π · √(L · C))',
      formulaExplanation: 'f₀ = resonant frequency, L = inductor coil, C = capacitor capacity.',
      interactiveType: 'laser'
    },
    {
      id: 'chem-1',
      category: 'chem',
      chapter: 1,
      title: 'Acid Buffers & pH Neutralization',
      domain: 'Bio-Chemistry',
      role: 'Flora Scientist',
      icon: FlaskConical,
      color: '#60A5FA',
      status: 'completed',
      xp: 280,
      simpleAnalogy: 'Like mixing lemon juice (acid) and baking soda (base) in water until it becomes safe and neutral (pH 7.0).',
      whyInHeist: 'Caustic acid traps lock the vault doors. The scientist titrates reagents to reach exactly pH 7.0 to dissolve locks safely.',
      formula: 'pH = -log₁₀[H⁺]',
      formulaExplanation: 'pH < 7 is dangerous acid, pH = 7 is safe neutral water, pH > 7 is caustic base.',
      interactiveType: 'ph'
    },
    {
      id: 'chem-2',
      category: 'chem',
      chapter: 2,
      title: 'Exothermic Titration Limits',
      domain: 'Bio-Chemistry',
      role: 'Flora Scientist',
      icon: FlaskConical,
      color: '#60A5FA',
      status: 'locked',
      xp: 450,
      simpleAnalogy: 'Reactions release heat (like hand warmers). If mixed too fast, they overheat and set off chamber thermal alarms.',
      whyInHeist: 'Calculates the safe speed to mix dissolving agents without triggering heat sensors.',
      formula: 'q = m · c · ΔT',
      formulaExplanation: 'q = heat released, m = mass, c = specific heat, ΔT = temperature change.',
      interactiveType: 'ph'
    },
    {
      id: 'math-1',
      category: 'math',
      chapter: 1,
      title: 'Modular Arithmetic & Shift Ciphers',
      domain: 'Discrete Math',
      role: 'Mist Cryptographer',
      icon: Key,
      color: '#C084FC',
      status: 'in_progress',
      xp: 350,
      simpleAnalogy: 'Like a 12-hour clock. If it is 10 o’clock and you add 4 hours, it wraps to 2. Ciphers do the exact same wrap-around with letters.',
      whyInHeist: 'Vault passwords are encrypted with Caesar shift rings. The cryptographer reverses the shift key to unlock.',
      formula: 'C = (P + k) mod 26',
      formulaExplanation: 'P = original letter position, k = shift number, mod 26 = wrap around at Z.',
      interactiveType: 'cipher'
    },
    {
      id: 'math-2',
      category: 'math',
      chapter: 2,
      title: 'Prime Factorization & RSA Keys',
      domain: 'Discrete Math',
      role: 'Mist Cryptographer',
      icon: Key,
      color: '#C084FC',
      status: 'locked',
      xp: 500,
      simpleAnalogy: 'Multiplying 7 × 13 = 91 is easy. Finding 7 and 13 from 91 is much harder. Real-world encryption locks rely on this principle.',
      whyInHeist: 'Calculates the private unlocking factors for multi-digit master locks on the inner vault.',
      formula: 'N = p · q  (where p, q are primes)',
      formulaExplanation: 'Finding secret prime factors p and q yields the master decrypter key.',
      interactiveType: 'cipher'
    },
    {
      id: 'nexus-final',
      category: 'nexus',
      chapter: 3,
      title: 'Boreal Quantum Nexus (Mastermind)',
      domain: 'Cross-Curricular Relay',
      role: 'Full Syndicate',
      icon: Sparkles,
      color: '#34D399',
      status: 'locked',
      xp: 1200,
      simpleAnalogy: 'The final chamber where all 4 operatives must solve their STEM locks simultaneously to bypass the master reactor.',
      whyInHeist: 'Requires real-time coordination across Computer Science, Physics, Chemistry, and Mathematics.',
      formula: 'Sync_Rate = (Hacker ∩ Engineer ∩ Scientist ∩ Crypto) / Total_Time',
      formulaExplanation: 'All 4 teammates transmit their solved clues across radio channels to win.',
      interactiveType: 'memory'
    }
  ];

  const categories = [
    { id: 'cs', label: 'Computer Science', icon: Terminal, color: '#10B981', role: 'Hacker' },
    { id: 'phys', label: 'Physics & Optics', icon: Zap, color: '#FBBF24', role: 'Engineer' },
    { id: 'chem', label: 'Bio-Chemistry', icon: FlaskConical, color: '#60A5FA', role: 'Scientist' },
    { id: 'math', label: 'Discrete Math', icon: Key, color: '#C084FC', role: 'Cryptographer' },
    { id: 'nexus', label: 'Quantum Nexus', icon: Sparkles, color: '#34D399', role: 'All Roles' }
  ];

  const currentNodes = roadmapNodes.filter(n => n.category === activeCategory);
  const selectedNode = roadmapNodes.find(n => n.id === selectedNodeId) || currentNodes[0] || roadmapNodes[0];

  // Physics calculation
  const sinTheta2 = (1.0 * Math.sin((laserAngle * Math.PI) / 180)) / refractiveIndex;
  const clampedSin = Math.max(-1, Math.min(1, sinTheta2));
  const refractedAngleDeg = Math.round((Math.asin(clampedSin) * 180) / Math.PI);

  // Math cipher calculation
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
    <div className="space-y-6 max-w-7xl mx-auto text-left font-sans">
      
      {/* Hero Header */}
      <section className="bg-[#051C12]/90 backdrop-blur-md border-2 border-[#134830] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-[#10B981] text-[#02140D] font-mono font-bold text-[10px] px-2.5 py-0.5 rounded uppercase">
              STEM Learning Pathway
            </span>
            <span className="text-xs font-mono text-[#6EE7B7]">
              Interactive Science, Math & Code Labs
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-game font-black text-white tracking-wide">
            Curriculum Skill Tree & Labs
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-sans">
            Explore concepts used in each heist chamber with hands-on live visual sandboxes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center space-x-2 bg-[#020B06] px-3.5 py-2 rounded-xl border border-[#134830] font-mono text-xs text-[#34D399]">
            <Award className="w-4 h-4 text-[#FBBF24]" />
            <span>3 / 9 Labs Mastered</span>
          </div>

          {onOpenModal && (
            <button
              onClick={onOpenModal}
              className="bg-[#34D399] hover:bg-[#2DD4BF] text-[#020C07] font-game font-bold text-xs uppercase px-4 py-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center space-x-1.5 transition-all"
            >
              <BookOpen className="w-4 h-4 stroke-[2.5]" />
              <span>Diagnostic Guide</span>
            </button>
          )}
        </div>
      </section>

      {/* Track Selector Bar (4 STEM Tracks) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                const first = roadmapNodes.find(n => n.category === cat.id);
                if (first) setSelectedNodeId(first.id);
                heistAudio.playKeyClick();
              }}
              className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-start justify-between text-left space-y-1.5 ${
                isActive
                  ? 'bg-[#0A3020] border-[#10B981] shadow-lg shadow-emerald-950/60'
                  : 'bg-[#04160E] border-[#134830] hover:bg-[#072418] hover:border-emerald-700/60'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div 
                  className="p-1.5 rounded-lg bg-black/40 border border-[#134830]"
                  style={{ color: cat.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                  {cat.role}
                </span>
              </div>
              <div>
                <span className="text-xs font-game font-bold text-white block">
                  {cat.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Concept Selector Chips for the Active Track */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <span className="text-xs font-mono text-slate-400 flex-shrink-0">
          Chamber Labs:
        </span>
        {currentNodes.map(node => {
          const isSelected = selectedNode.id === node.id;
          const isCompleted = node.status === 'completed';

          return (
            <button
              key={node.id}
              onClick={() => {
                setSelectedNodeId(node.id);
                heistAudio.playKeyClick();
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center space-x-2 transition-all flex-shrink-0 ${
                isSelected
                  ? 'bg-[#10B981] text-[#02140D] border-white shadow-md'
                  : 'bg-[#020B06] border-[#134830] text-slate-300 hover:text-white hover:bg-[#061D13]'
              }`}
            >
              <span>{node.title}</span>
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#02140D]" />
              ) : (
                <span className="text-[10px] opacity-70">+{node.xp} XP</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Split-Screen Lab View: Left Briefing, Right Interactive Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Clear Concept Briefing (5 cols) */}
        <div className="lg:col-span-5 bg-[#051C12]/90 border-2 border-[#134830] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 text-left">
          <div className="flex justify-between items-start border-b border-[#134830]/80 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#FBBF24]">
                  {selectedNode.domain}
                </span>
                <span className="text-[10px] font-mono text-[#6EE7B7]">
                  • {selectedNode.role}
                </span>
              </div>
              <h3 className="text-lg font-game font-bold text-white uppercase mt-0.5">
                {selectedNode.title}
              </h3>
            </div>
            <span className="text-xs font-mono font-bold bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40 px-2 py-0.5 rounded-lg flex-shrink-0">
              +{selectedNode.xp} XP
            </span>
          </div>

          {/* Plain English Explanation */}
          <div className="bg-[#020E08] p-4 rounded-xl border border-emerald-900/60 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-[#34D399] flex items-center space-x-1.5 uppercase">
              <Lightbulb className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>In Plain English:</span>
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {selectedNode.simpleAnalogy}
            </p>
          </div>

          {/* Real-World Formula */}
          <div className="bg-[#020B06] p-3.5 rounded-xl border border-[#134830] space-y-1 font-mono text-xs">
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>CORE FORMULA / RULE:</span>
              <span className="text-emerald-400 font-bold">{selectedNode.role}</span>
            </div>
            <code className="text-sm font-bold text-[#34D399] block bg-black/50 p-2 rounded-lg border border-emerald-950">
              {selectedNode.formula}
            </code>
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              {selectedNode.formulaExplanation}
            </p>
          </div>

          {/* Heist Role Application */}
          <div className="space-y-1 font-mono text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">
              🎮 In Co-op Heists:
            </span>
            <p className="text-slate-300 font-sans text-xs leading-relaxed">
              {selectedNode.whyInHeist}
            </p>
          </div>

          {/* Direct Practice Button */}
          <div className="pt-2 border-t border-[#134830]/80">
            <button
              onClick={() => onStartHeist(0)}
              className="w-full bg-[#10B981] hover:bg-[#34D399] text-[#02140D] font-game font-bold text-xs py-2.5 px-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center space-x-2 transition-all uppercase"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Practice In Heist Chamber</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Interactive Sandbox (7 cols) */}
        <div className="lg:col-span-7 bg-[#020E08] border-2 border-[#134830] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-[#134830]/80 pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#34D399]" />
              <h4 className="text-sm font-game font-bold text-white uppercase">
                Interactive Lab Sandbox
              </h4>
            </div>
            <span className="text-[10px] font-mono text-amber-300 font-bold">
              Adjust Sliders Below 👇
            </span>
          </div>

          {/* 1. PHYSICS OPTICS: SNELL'S LAW LASER PRISM */}
          {selectedNode.interactiveType === 'laser' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-[#041C12] p-4 rounded-xl border border-emerald-800/60 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span>Entry Angle: <strong className="text-amber-300">{laserAngle}°</strong></span>
                  <span>Glass Density: <strong className="text-emerald-300">{refractiveIndex}x</strong></span>
                  <span>Exit Angle: <strong className="text-[#34D399]">{refractedAngleDeg}°</strong></span>
                </div>

                <div className="relative w-full h-36 bg-[#020B06] rounded-xl border border-emerald-900 overflow-hidden flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 300 120">
                    <rect x="150" y="0" width="150" height="120" fill="#063220" opacity="0.6" />
                    <line x1="150" y1="0" x2="150" y2="120" stroke="#10B981" strokeDasharray="3 3" opacity="0.5" />
                    <text x="160" y="20" fill="#34D399" fontSize="10" fontFamily="monospace">Glass Medium (n=1.5)</text>
                    <text x="40" y="20" fill="#FBBF24" fontSize="10" fontFamily="monospace">Air (n=1.0)</text>

                    <line 
                      x1={150 - Math.cos((laserAngle * Math.PI) / 180) * 100} 
                      y1={60 - Math.sin((laserAngle * Math.PI) / 180) * 100} 
                      x2="150" 
                      y2="60" 
                      stroke="#FBBF24" 
                      strokeWidth="3"
                      className="drop-shadow-[0_0_6px_#FBBF24]"
                    />

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

          {/* 2. COMPUTER SCIENCE: MEMORY OFFSET & POINTER BOXES */}
          {(selectedNode.interactiveType === 'memory' || selectedNode.interactiveType === 'nexus') && (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-[#041C12] p-4 rounded-xl border border-emerald-800/60 space-y-3">
                <div className="flex justify-between items-center">
                  <span>RAM Base Address: <strong className="text-[#10B981]">0x7FFE_00A0</strong></span>
                  <span>Target Offset: <strong className="text-amber-300">+{memoryPointerOffset}</strong></span>
                </div>

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
                  💡 <strong>How it works:</strong> Click any locker above to reposition your pointer offset. In the heist, your teammate transmits which offset holds the decryption key!
                </p>
              </div>
            </div>
          )}

          {/* 3. BIO-CHEMISTRY: ACID / BASE PH REAGENT TITRATION */}
          {selectedNode.interactiveType === 'ph' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-[#041C12] p-4 rounded-xl border border-emerald-800/60 space-y-3">
                <div className="flex justify-between items-center">
                  <span>Solution pH: <strong className="text-[#60A5FA]">{phLevel.toFixed(1)}</strong></span>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    phLevel < 6 ? 'bg-red-950 text-red-300 border border-red-800' :
                    phLevel > 8 ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                    'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {phLevel < 6 ? '⚠️ Caustic Acid' : phLevel > 8 ? '⚠️ Corrosive Base' : '✅ Neutral Safe Zone (pH 7.0)'}
                  </span>
                </div>

                <div className="w-full h-6 rounded-xl bg-gradient-to-r from-red-500 via-emerald-400 to-purple-600 relative overflow-hidden border border-emerald-950 shadow-inner">
                  <div 
                    className="absolute top-0 bottom-0 w-3 bg-white border border-black shadow-md transition-all duration-300"
                    style={{ left: `${(phLevel / 14) * 100}%` }}
                  />
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Drag slider to titrate acid/base neutralizer:</span>
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

          {/* 4. DISCRETE MATH: CAESAR CIPHER SHIFT WHEEL */}
          {selectedNode.interactiveType === 'cipher' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-[#041C12] p-4 rounded-xl border border-emerald-800/60 space-y-3">
                <div className="flex justify-between items-center">
                  <span>Shift Key: <strong className="text-[#C084FC]">k = {cipherShift}</strong></span>
                  <span>Formula: <code className="text-[#34D399]">(char + {cipherShift}) mod 26</code></span>
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
                    <span>Drag slider to rotate cipher shift:</span>
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
  );
}
