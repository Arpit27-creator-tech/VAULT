// ============================================================
// V.A.U.L.T — Squad Recruitment Directory (Leaderboard-style List)
// Displays active squads recruiting members and their open roles
// ============================================================

import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, LogIn, Sparkles, Radio, Shield, Terminal, Compass, 
  FlaskConical, Key, ArrowRight, RefreshCw, Crown, Search, Check, Zap,
  Flame, Lock, ArrowUpRight
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

export default function SquadRecruitmentBoard({
  socket,
  currentUser,
  onCreateSquad,
  onJoinSquad,
  onOpenJoinModal,
  onOpenAgentDirectory
}) {
  const [squads, setSquads] = useState([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
