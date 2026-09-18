// ============================================================
// V.A.U.L.T — Squad Recruitment Directory (Leaderboard-style List)
// Displays active squads recruiting members and their open roles
// ============================================================

import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, LogIn, Sparkles, Radio, Shield, Terminal, Compass, 
  FlaskConical, Key, ArrowRight, RefreshCw, Crown, Search, Check, Zap,
  Flame, Lock, ArrowUpRight, ChevronDown, ChevronUp, Play
} from 'lucide-react';
import { heistAudio } from './HeistAudioEngine';
import { toast } from 'sonner';

const ROLE_CONFIG = {
  hacker: {
    name: 'The Hacker',
    color: '#10B981',
    bg: 'bg-emerald-950/90',
    border: 'border-emerald-500/60',
    text: 'text-emerald-300',
    icon: Terminal,
    discipline: 'CS & Algorithms'
  },
  engineer: {
    name: 'The Engineer',
    color: '#FBBF24',
    bg: 'bg-amber-950/90',
    border: 'border-amber-500/60',
    text: 'text-amber-300',
    icon: Compass,
    discipline: 'Physics & Optics'
  },
  scientist: {
    name: 'The Scientist',
    color: '#06B6D4',
    bg: 'bg-cyan-950/90',
    border: 'border-cyan-500/60',
    text: 'text-cyan-300',
    icon: FlaskConical,
    discipline: 'Chemistry & Biology'
  },
  cryptographer: {
    name: 'The Cryptographer',
    color: '#C084FC',
    bg: 'bg-purple-950/90',
    border: 'border-purple-500/60',
    text: 'text-purple-300',
    icon: Key,
    discipline: 'Math & Ciphers'
  }
};

const DEFAULT_RECRUITING_SQUADS = [];

function HackerPreview() {
  return (
    <div className="bg-[#020B06] rounded-xl p-2.5 font-mono text-[11px] text-emerald-400 border border-emerald-500/30 h-28 flex flex-col justify-between shadow-inner">
      <div className="flex items-center space-x-1.5 pb-1 border-b border-emerald-900/50 text-[10px] text-slate-400">
        <span className="w-2 h-2 rounded-full bg-red-500/80 inline-block" />
        <span className="w-2 h-2 rounded-full bg-amber-500/80 inline-block" />
        <span className="w-2 h-2 rounded-full bg-emerald-500/80 inline-block" />
        <span className="ml-1 text-emerald-500 font-bold">hacker@terminal:~$</span>
      </div>
      <div className="space-y-0.5 leading-relaxed">
        <p className="text-slate-400">// Task: slice buffer[2..7]</p>
        <p className="text-emerald-300 font-bold">&gt; return buffer.slice(2, 7);</p>
        <p className="text-emerald-400 flex items-center">
          <span>✓ PAYLOAD EXTRACTED</span>
          <span className="inline-block w-1.5 h-3 bg-emerald-400 ml-1.5 animate-pulse" />
        </p>
      </div>
      <div className="text-[9px] text-emerald-500/80 flex justify-between">
        <span>STATUS: BYPASS OK</span>
        <span className="text-slate-400">MEM: 0x7E3A</span>
      </div>
    </div>
  );
}

function EngineerPreview() {
  return (
    <div className="bg-[#020B06] rounded-xl p-2.5 font-mono text-[11px] text-amber-400 border border-amber-500/30 h-28 flex flex-col justify-between shadow-inner">
      <div className="flex items-center justify-between pb-1 border-b border-amber-900/50 text-[10px] text-slate-400">
        <span className="text-amber-400 font-bold">OPTICAL DEFLECTOR ARRAY</span>
        <span className="text-[9px] text-emerald-400 font-bold animate-pulse">LOCKED 45°/135°</span>
      </div>
      <div className="relative h-14 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 160 50">
          <circle cx="15" cy="25" r="3.5" fill="#FBBF24" />
          <line x1="50" y1="12" x2="62" y2="38" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="105" y1="10" x2="117" y2="36" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <polyline 
            points="15,25 56,25 111,35 145,12" 
            fill="none" 
            stroke="#FBBF24" 
            strokeWidth="2" 
            strokeDasharray="4 2" 
          />
          <circle cx="145" cy="12" r="4.5" fill="#10B981" stroke="#34D399" strokeWidth="1.5" />
          <text x="5" y="44" fill="#FBBF24" fontSize="7" fontFamily="monospace">EMIT</text>
          <text x="126" y="44" fill="#34D399" fontSize="7" fontFamily="monospace">SENSOR</text>
        </svg>
      </div>
      <div className="text-[9px] text-amber-500/80 flex justify-between">
        <span>BEAM ALIGNED</span>
        <span className="text-emerald-400 font-bold">TARGET 100%</span>
      </div>
    </div>
  );
}

function ScientistPreview() {
  return (
    <div className="bg-[#020B06] rounded-xl p-2.5 font-mono text-[11px] text-cyan-400 border border-cyan-500/30 h-28 flex flex-col justify-between shadow-inner">
      <div className="flex items-center justify-between pb-1 border-b border-cyan-900/50 text-[10px] text-slate-400">
        <span className="text-cyan-400 font-bold">REAGENT BALANCER</span>
        <span className="text-cyan-300 font-mono bg-cyan-950 px-1 py-0.5 rounded text-[9px] border border-cyan-500/40">pH 6.8 [STABLE]</span>
      </div>
      <div className="space-y-1 text-center py-0.5">
        <div className="font-bold text-[10px] text-white tracking-wider flex items-center justify-center space-x-1">
          <span className="bg-cyan-900/50 text-cyan-300 px-1 rounded border border-cyan-500/40">2</span>
          <span>HCl +</span>
          <span className="bg-cyan-900/50 text-cyan-300 px-1 rounded border border-cyan-500/40">1</span>
          <span>CaCO₃ →</span>
          <span className="text-emerald-300">CaCl₂</span>
        </div>
        <p className="text-[9px] text-slate-400">Acid lock dissolving safely</p>
      </div>
      <div className="text-[9px] text-cyan-500/80 flex justify-between">
        <span>REACTION: BALANCED</span>
        <span className="text-cyan-300 font-bold">n = 1.42</span>
      </div>
    </div>
  );
}

function CryptographerPreview() {
  return (
    <div className="bg-[#020B06] rounded-xl p-2.5 font-mono text-[11px] text-purple-400 border border-purple-500/30 h-28 flex flex-col justify-between shadow-inner">
      <div className="flex items-center justify-between pb-1 border-b border-purple-900/50 text-[10px] text-slate-400">
        <span className="text-purple-400 font-bold">FREQUENCY DECODER</span>
        <span className="text-purple-300 font-mono bg-purple-950 px-1 py-0.5 rounded text-[9px] border border-purple-500/40">142.5 MHz</span>
      </div>
      <div className="space-y-0.5 text-center py-0.5">
        <p className="text-[10px] text-slate-500 tracking-widest line-through">VHFXUH WKH JURYH</p>
        <p className="text-[8px] text-purple-400">↓ CAESAR SHIFT (+3) ↓</p>
        <p className="text-[10px] text-emerald-300 font-bold tracking-widest animate-pulse">SECURE THE GROVE</p>
      </div>
      <div className="text-[9px] text-purple-500/80 flex justify-between">
        <span>CIPHER MATCH: 100%</span>
        <span className="text-emerald-400 font-bold">KEY REVEALED</span>
      </div>
    </div>
  );
}

const ROLE_PREVIEWS = {
  hacker: {
    discipline: 'CS & Algorithms',
    whatYouDo: 'Write array-slicing logic and syntax expressions in the terminal to breach firewalls.',
    feedsTo: 'The Cryptographer',
    outputDesc: 'Decrypted Hex Cipher',
    previewComponent: HackerPreview
  },
  engineer: {
    discipline: 'Physics & Optics',
    whatYouDo: 'Rotate deflector mirrors to align optical laser beams using Snell\'s Law geometry.',
    feedsTo: 'The Hacker',
    outputDesc: 'Security Port Address (0x7E3A)',
    previewComponent: EngineerPreview
  },
  scientist: {
    discipline: 'Chemistry & Reagents',
    whatYouDo: 'Balance chemical stoichiometry reagents to neutralize cryogenic acid security locks.',
    feedsTo: 'The Engineer',
    outputDesc: 'Optical Density Refraction Index (n = 1.42)',
    previewComponent: ScientistPreview
  },
  cryptographer: {
    discipline: 'Math & Ciphers',
    whatYouDo: 'Tune RF receiver frequencies and decipher Caesar shifts to reveal master vault keys.',
    feedsTo: 'Vault Chamber Door',
    outputDesc: 'Master Vault Passphrase',
    previewComponent: CryptographerPreview
  }
};

export default function SquadRecruitmentBoard({
  socket,
  currentUser,
  onCreateSquad,
  onJoinSquad,
  onOpenJoinModal,
  onOpenAgentDirectory,
  onOpenSoloTraining
}) {
  const [squads, setSquads] = useState([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRolesExpanded, setIsRolesExpanded] = useState(false);

  // Fetch live recruiting squads from socket if connected
  const refreshSquads = () => {
    setIsRefreshing(true);
    if (socket && socket.connected) {
      socket.emit('lobby:list-recruiting', (res) => {
        setIsRefreshing(false);
        if (res?.success && Array.isArray(res.squads)) {
          // Only ever show real, live squads — no fake/demo fallback data.
          setSquads(res.squads);
        }
      });
    } else {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  useEffect(() => {
    refreshSquads();
    const interval = setInterval(refreshSquads, 4000);
    return () => clearInterval(interval);
  }, [socket]);

  // Filter squads by search and open role
  const filteredSquads = squads.filter(squad => {
    const matchesSearch = !searchQuery.trim() || (
      squad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      squad.roomCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      squad.hostName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesRole = roleFilter === 'ALL' || (squad.openRoles || []).includes(roleFilter);

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans text-left pb-12">
      
      {/* Top Banner Card */}
      <div className="bg-[#051C12]/90 backdrop-blur-md border border-emerald-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-[#10B981] text-[#02140D] font-mono font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Squad Matchmaking Radar</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold uppercase tracking-tight text-white font-game">
              Recruiting Strike Squads
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Explore active syndicate operations seeking specialist operatives. Enlist in an open slot to join the squad room.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                onCreateSquad();
                heistAudio.playKeyClick();
              }}
              className="bg-[#10B981] hover:bg-[#34D399] text-[#02140D] font-bold px-5 py-3 rounded-2xl transition-all flex items-center space-x-2 text-xs sm:text-sm font-game uppercase shadow-lg shadow-emerald-950/60"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Form New Squad</span>
            </button>

            <button
              onClick={() => {
                onOpenJoinModal();
                heistAudio.playKeyClick();
              }}
              className="bg-[#020B06] hover:bg-[#072418] text-[#FBBF24] border border-amber-500/50 font-bold px-4 py-3 rounded-2xl transition-all flex items-center space-x-2 text-xs sm:text-sm font-game uppercase shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Join by Code</span>
            </button>

            {currentUser && (
              <button
                onClick={() => {
                  onOpenAgentDirectory();
                  heistAudio.playKeyClick();
                }}
                className="bg-[#020B06] hover:bg-[#072418] text-emerald-300 border border-emerald-800/80 font-bold px-4 py-3 rounded-2xl transition-all flex items-center space-x-2 text-xs sm:text-sm font-game uppercase shadow-md"
              >
                <Search className="w-4 h-4" />
                <span>Find Agent</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="mt-8 pt-6 border-t border-emerald-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Role Filter Tabs (Leaderboard Style) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#020B06] p-1.5 rounded-2xl border border-emerald-900/80 text-xs font-mono">
            <button
              onClick={() => { setRoleFilter('ALL'); heistAudio.playKeyClick(); }}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                roleFilter === 'ALL' ? 'bg-[#10B981] text-[#02140D]' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Open Squads ({squads.length})
            </button>

            {['hacker', 'engineer', 'scientist', 'cryptographer'].map(roleKey => {
              const cfg = ROLE_CONFIG[roleKey];
              const count = squads.filter(s => (s.openRoles || []).includes(roleKey)).length;
              return (
                <button
                  key={roleKey}
                  onClick={() => { setRoleFilter(roleKey); heistAudio.playKeyClick(); }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
                    roleFilter === roleKey 
                      ? 'bg-white text-[#02140D]' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <cfg.icon className="w-3.5 h-3.5" style={{ color: roleFilter === roleKey ? '#02140D' : cfg.color }} />
                  <span>Needs {roleKey.charAt(0).toUpperCase() + roleKey.slice(1)} ({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search + Refresh */}
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search squad, leader, code..."
                className="bg-[#020B06] border border-emerald-900/80 rounded-xl px-3.5 py-2 pl-9 text-xs font-mono text-emerald-100 placeholder-slate-500 outline-none focus:border-[#10B981] w-48 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={() => {
                refreshSquads();
                heistAudio.playKeyClick();
                toast.success("Recruitment board updated!");
              }}
              className="p-2.5 bg-[#020B06] text-slate-400 hover:text-[#10B981] border border-emerald-900/80 rounded-xl transition-all flex items-center space-x-1.5 font-mono text-xs"
              title="Refresh active squad listings"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#10B981]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Expandable Role Preview & Interdependence Guide ── */}
      <div className="bg-[#051C12]/80 backdrop-blur-md border border-emerald-800/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold text-white font-game uppercase tracking-wider">
                  Meet the 4 Specialists & Puzzle Types
                </h3>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">
                  Interdependent Mechanics
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Each specialist operates a distinct puzzle cockpit. Learn what they do and how their clues feed each other.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onOpenSoloTraining && (
              <button
                onClick={() => {
                  onOpenSoloTraining();
                  heistAudio.playKeyClick();
                }}
                className="bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-emerald-300" />
                <span>Solo Training</span>
              </button>
            )}
            <button
              onClick={() => {
                setIsRolesExpanded(!isRolesExpanded);
                heistAudio.playKeyClick();
              }}
              className="bg-[#020B06] hover:bg-[#072418] text-slate-300 hover:text-white border border-emerald-900/80 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <span>{isRolesExpanded ? 'Hide Previews' : 'Show Previews'}</span>
              {isRolesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsed view: compact summary badges */}
        {!isRolesExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {['hacker', 'engineer', 'scientist', 'cryptographer'].map((roleKey) => {
              const cfg = ROLE_CONFIG[roleKey];
              const preview = ROLE_PREVIEWS[roleKey];
              const Icon = cfg.icon;
              return (
                <button
                  key={roleKey}
                  onClick={() => {
                    setIsRolesExpanded(true);
                    heistAudio.playKeyClick();
                  }}
                  className="flex items-center space-x-2 p-2.5 rounded-2xl bg-[#020B06]/70 border border-emerald-900/60 hover:border-emerald-500/50 text-left transition-all group"
                >
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${cfg.color}20`, border: `1px solid ${cfg.color}50` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate font-game">{cfg.name}</p>
                    <p className="text-[10px] font-mono text-slate-400 truncate">{preview.discipline}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Expanded view: interactive role preview cards */}
        {isRolesExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
            {['hacker', 'engineer', 'scientist', 'cryptographer'].map((roleKey) => {
              const cfg = ROLE_CONFIG[roleKey];
              const preview = ROLE_PREVIEWS[roleKey];
              const Icon = cfg.icon;
              const PreviewComp = preview.previewComponent;

              return (
                <div
                  key={roleKey}
                  className="bg-[#020B06]/90 border border-emerald-900/80 hover:border-emerald-700/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all shadow-lg hover:shadow-emerald-950/40 relative overflow-hidden group"
                >
                  {/* Top accent border */}
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: cfg.color }} />

                  {/* Role Header */}
                  <div className="flex items-start justify-between gap-2 pt-1">
                    <div className="flex items-center space-x-2.5">
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                        style={{ backgroundColor: `${cfg.color}25`, border: `1.5px solid ${cfg.color}70` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white font-game uppercase tracking-wide">
                          {cfg.name}
                        </h4>
                        <span 
                          className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border inline-block mt-0.5"
                          style={{ backgroundColor: `${cfg.color}15`, color: cfg.color, borderColor: `${cfg.color}40` }}
                        >
                          {preview.discipline}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* What you do */}
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {preview.whatYouDo}
                  </p>

                  {/* Animated Puzzle Interface Preview */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-0.5">
                      <span>COCKPIT PREVIEW</span>
                      <span className="text-emerald-400 font-bold">LIVE INTERFACE</span>
                    </div>
                    <PreviewComp />
                  </div>

                  {/* Interdependence Arrow Banner */}
                  <div className="bg-[#051C12] border border-emerald-900/90 rounded-xl p-2 font-mono text-[10px] space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>FEEDS CLUE TO:</span>
                      <span className="font-bold text-white flex items-center space-x-1">
                        <span>{preview.feedsTo}</span>
                        <ArrowRight className="w-3 h-3 text-emerald-400 inline" />
                      </span>
                    </div>
                    <p className="text-emerald-300 text-[9px] font-mono truncate">
                      Output: {preview.outputDesc}
                    </p>
                  </div>

                  {/* Solo Training Action Link */}
                  {onOpenSoloTraining && (
                    <button
                      onClick={() => {
                        onOpenSoloTraining();
                        heistAudio.playKeyClick();
                      }}
                      className="w-full bg-[#051811] hover:bg-[#072618] text-slate-300 hover:text-emerald-300 border border-emerald-900/90 hover:border-emerald-600/60 rounded-xl py-2 px-3 text-[11px] font-mono font-bold flex items-center justify-center space-x-1.5 transition-all group-hover:border-emerald-500/40"
                    >
                      <span>Try in Solo Training</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leaderboard-style Squad List Rows */}
      {filteredSquads.length === 0 ? (
        <div className="bg-[#051C12]/60 border-2 border-dashed border-emerald-900/80 rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-950/80 text-emerald-400 rounded-2xl border border-emerald-800 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold uppercase text-white font-game">No Active Squads Match This Filter</h3>
            <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
              Start your own strike squad operation and recruit operatives from the global mesh.
            </p>
          </div>
          <button
            onClick={() => {
              onCreateSquad();
              heistAudio.playKeyClick();
            }}
            className="bg-[#10B981] text-[#02140D] font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-[#34D399] uppercase font-game"
          >
            Create Squad Room
          </button>
        </div>
      ) : (
        <div className="space-y-2.5 relative z-10">
          {filteredSquads.map((squad, index) => {
            const isFull = squad.totalMembers >= squad.maxMembers;
            return (
              <div
                key={squad.roomCode || index}
                className="p-3.5 sm:p-4 rounded-2xl border border-emerald-900/50 hover:border-[#10B981]/70 bg-[#041C13]/60 hover:bg-[#06291B]/80 backdrop-blur-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group shadow-lg hover:shadow-xl"
              >
                {/* Left Side: Room Code + Squad Leader Info + Squad Name */}
                <div className="flex items-center space-x-3.5 min-w-[280px]">
                  
                  {/* Room Code Badge */}
                  <span className="w-16 sm:w-20 py-1.5 bg-[#020B06]/90 rounded-xl flex items-center justify-center font-mono font-bold text-[11px] text-[#FBBF24] border border-amber-500/30 flex-shrink-0 shadow-inner">
                    {squad.roomCode}
                  </span>

                  {/* Leader Avatar */}
                  <div className="relative flex-shrink-0">
                    <img 
                      src={squad.hostAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                      alt={squad.hostName} 
                      className="w-11 h-11 rounded-xl object-cover border-2 border-[#10B981] group-hover:scale-105 transition-transform" 
                    />
                    <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-[#020B06] border border-emerald-800">
                      <Crown className="w-2.5 h-2.5 text-[#FBBF24]" />
                    </div>
                  </div>

                  {/* Squad Name & Host info */}
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-base sm:text-lg text-white font-game truncate group-hover:text-[#10B981] transition-colors">
                        {squad.name}
                      </h3>
                      {squad.voiceActive && (
                        <span className="inline-flex items-center space-x-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/80 flex-shrink-0">
                          <Radio className="w-2 h-2 text-[#10B981] animate-pulse" />
                          <span>Voice HD</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-400 truncate">
                      Leader: <span className="text-emerald-300 font-bold">{squad.hostName}</span>
                    </p>
                  </div>
                </div>

                {/* Center: Mission Intel & Open Slots Status (Clean Leaderboard Style) */}
                <div className="flex flex-wrap items-center gap-2.5 py-1 lg:py-0">
                  <span className="bg-[#020B06]/80 px-3 py-1 rounded-xl border border-emerald-900/60 text-xs font-mono text-[#34D399] font-medium flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>4-Operative Heist</span>
                  </span>

                  {/* Open Slots Counter Badge */}
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl border ${
                    squad.openRoles?.length > 0
                      ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {squad.openRoles?.length > 0 
                      ? `⚡ ${squad.openRoles.length} Open Slot${squad.openRoles.length > 1 ? 's' : ''}` 
                      : '✓ Squad Full'}
                  </span>
                </div>

                {/* Right Side: Capacity Stats & 1-Click Enlist Button */}
                <div className="flex items-center justify-between lg:justify-end space-x-4 sm:space-x-5 text-xs font-mono">
                  
                  {/* Capacity Pill */}
                  <div className="text-left lg:text-center flex-shrink-0">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Crew Fill</span>
                    <span className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg border inline-block mt-0.5 ${
                      isFull 
                        ? 'bg-red-950/80 text-red-300 border-red-800' 
                        : 'bg-[#10B981]/20 text-[#34D399] border-[#10B981]/40'
                    }`}>
                      {squad.totalMembers} / {squad.maxMembers}
                    </span>
                  </div>

                  {/* 1-Click Enlist / Enter Button */}
                  <button
                    onClick={() => {
                      const firstOpenRole = squad.openRoles?.[0] || 'hacker';
                      onJoinSquad(squad.roomCode, firstOpenRole);
                      heistAudio.playKeyClick();
                    }}
                    className="bg-[#10B981] hover:bg-[#34D399] text-[#02140D] font-bold text-xs px-4 py-2.5 rounded-xl font-game uppercase transition-all flex items-center space-x-1.5 shadow-md shadow-emerald-950/80 hover:scale-105 flex-shrink-0"
                  >
                    <span>Enlist</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
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
