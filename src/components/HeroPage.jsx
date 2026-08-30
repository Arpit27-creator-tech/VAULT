import React, { useState } from 'react';
import { 
  Sparkles, Zap, Users, Compass, Terminal, MapPin, BookOpen, Rocket,
  Play, ShieldAlert, CheckCircle2, Award, Clock, ArrowRight, Radio,
  Trees, Volume2, Plus, FlaskConical, Key, Star, Layers, Activity,
  Cpu, Flame, Eye, Lock, Unlock, HelpCircle, ChevronRight, LogIn,
  Trophy, Globe, Crown, Medal
} from 'lucide-react';
import { heistAudio } from './HeistAudioEngine';
import { toast } from 'sonner';
import { leaderboardAPI } from '../services/api';





export default function HeroPage({
  onNavigate,
  onStartStage,
  onOpenCustomHeist,
  onRequireAuth,
  currentUser,
  characters = [],
  missions = [],
  heistStages = []
}) {
  const [selectedRoleIdx, setSelectedRoleIdx] = useState(0);
  const [liveRelayStep, setLiveRelayStep] = useState(0);
  const [isSimulatingTransmission, setIsSimulatingTransmission] = useState(false);
  const [leaderboardFilter, setLeaderboardFilter] = useState('ALL');
  const [realLeaderboard, setRealLeaderboard] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);

  React.useEffect(() => {
    let mounted = true;
    const fetchLeaderboard = async () => {
      try {
        const data = await leaderboardAPI.getGlobal(100);
        if (mounted && data?.leaderboard) {
          setRealLeaderboard(data.leaderboard);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        if (mounted) setIsLoadingLeaderboard(false);
      }
    };
    fetchLeaderboard();
    return () => { mounted = false; };
  }, []); 

  const [liveTransmissions] = useState([
    { id: 1, sender: "Canopy Hacker", role: "hacker", color: "#10B981", text: "Array pointer unlocked at 0x7FF. Sending refractive index n=1.52 to Engineer!" },
    { id: 2, sender: "Woodland Engineer", role: "engineer", color: "#FBBF24", text: "Snell angle calibrated at 45.0°. Deflecting green laser to Bio-Chamber!" },
    { id: 3, sender: "Flora Scientist", role: "scientist", color: "#60A5FA", text: "Stoichiometry balanced 2H₂ + O₂ -> 2H₂O. Neutralizer pH stabilized at 7.4!" },
    { id: 4, sender: "Mist Cryptographer", role: "crypto", color: "#C084FC", text: "Cipher shift key +7 decoded! Final master override verified. Vault unlocked!" }
  ]);

  const handleSimulateRelay = () => {
    setIsSimulatingTransmission(true);
    setLiveRelayStep(1);
    heistAudio.playRadioSquelch();

    setTimeout(() => {
      setLiveRelayStep(2);
      heistAudio.playKeyClick();
      setTimeout(() => {
        setLiveRelayStep(3);
        heistAudio.playLaserHum();
        setTimeout(() => {
          setLiveRelayStep(4);
          heistAudio.playSuccessChime();
          toast.success("🔓 Master Vault Override Confirmed! 4 Roles Interlocked!");
          setIsSimulatingTransmission(false);
          setLiveRelayStep(0);
        }, 800);
      }, 700);
    }, 700);
  };

  const handleSimulateTransmission = handleSimulateRelay;

  const handleGuardedAction = (actionCallback, message = "Sign in to access this operation.") => {
    if (!currentUser && onRequireAuth) {
      onRequireAuth();
      toast.info(`🔐 Operative clearance required: ${message}`);
    } else if (actionCallback) {
      actionCallback();
    }
  };

  const filteredLeaderboard = realLeaderboard.filter(item => {
    if (leaderboardFilter === 'ALL') return true;
    return (item.role || '').toLowerCase().includes(leaderboardFilter.toLowerCase());
  });

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 w-full">

      <section className="relative overflow-hidden bg-gradient-to-br from-[#062417]/90 via-[#0A3824]/85 to-[#041A11]/95 backdrop-blur-xl border-[3px] border-[#03140C] shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-8 sm:p-12 lg:p-16">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
          <div className="lg:col-span-7 space-y-7">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center space-x-2 bg-[#FBBF24] text-[#02140D] font-mono font-black text-xs sm:text-sm uppercase px-3.5 py-1.5 border-[2.5px] border-[#03140C] shadow-[3px_3px_0px_#020C07] rotate-[-1.5deg]">
                <Trees className="w-4 h-4 text-[#02140D] stroke-[2.5]" />
                <span className="text-sm">🌲</span>
                <span className="tracking-wide">REAL–TIME MULTIPLAYER LEARNING HEIST</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-none uppercase drop-shadow-[4px_4px_0px_#020C07] text-[#F0FDF4]">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span>EDUCATION IS A</span>
                <span className="bg-[#10B981] text-[#02140D] px-3.5 sm:px-5 py-0.5 sm:py-1 border-[3.5px] border-[#03140C] shadow-[5px_5px_0px_#020C07] inline-block">
                  TEAM
                </span>
              </div>
              <div className="mt-2.5 sm:mt-3">
                <span className="bg-[#10B981] text-[#02140D] px-3.5 sm:px-5 py-0.5 sm:py-1 border-[3.5px] border-[#03140C] shadow-[5px_5px_0px_#020C07] inline-block">
                  SPORT!
                </span>
              </div>
            </h1>
            <p className="text-base sm:text-lg font-medium text-emerald-100/90 max-w-2xl leading-relaxed">
              Assemble a 4-specialist crew to crack interconnected academic vaults across <strong>Computer Science</strong>, <strong>Physics</strong>, <strong>Chemistry</strong>, and <strong>Discrete Mathematics</strong>. Real-time puzzle interdependence means no single player can win alone.
            </p>
            <div className="flex flex-wrap gap-4 pt-3">
              <button
                onClick={() => {
                  handleGuardedAction(() => onStartStage(0), "Sign in with email & password to launch live co-op operations.");
                  heistAudio.playKeyClick();
                }}
                className="bg-[#10B981] text-[#02140D] font-black px-7 sm:px-9 py-4 border-[3px] border-[#03140C] shadow-[5px_5px_0px_#020C07] hover:bg-[#34D399] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-2.5 text-base sm:text-lg uppercase group"
              >
                <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                <span>LAUNCH CO-OP HEIST</span>
              </button>
              <button
                onClick={() => {
                  handleGuardedAction(() => onNavigate('lobby'), "Sign in to assemble squad crews in the lobby.");
                  heistAudio.playKeyClick();
                }}
                className="bg-[#0A261B] text-[#F0FDF4] font-black px-6 sm:px-8 py-4 border-[3px] border-[#03140C] shadow-[5px_5px_0px_#020C07] hover:bg-[#0E3526] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-2.5 text-base sm:text-lg uppercase border-2 border-emerald-500/40"
              >
                <Users className="w-5 h-5 text-[#FBBF24]" />
                <span>SQUAD LOBBY</span>
              </button>
              <button
                onClick={() => {
                  handleGuardedAction(() => onNavigate('map'), "Sign in to view real-time canopy map tracking.");
                  heistAudio.playKeyClick();
                }}
                className="bg-[#FBBF24] text-[#02140D] font-black px-5 sm:px-6 py-4 border-[3px] border-[#03140C] shadow-[5px_5px_0px_#020C07] hover:bg-[#F59E0B] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-2 text-sm sm:text-base uppercase"
              >
                <MapPin className="w-4 h-4" />
                <span>CANOPY MAP</span>
              </button>
            </div>
            <div className="pt-4 flex flex-wrap items-center gap-5 text-xs font-mono font-bold text-emerald-200">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Zero Solo Rote Learning</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Real-Time Interlock Relay</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Post-Heist Skill Analytics</span>
              </span>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="forest-card p-5 sm:p-6 border-[3.5px] border-[#03140C] relative shadow-[8px_8px_0px_#020C07] bg-[#051A12]/95 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#03140C] pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-[#FF4D6D] text-white border border-[#03140C]">
                    <Radio className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-black uppercase text-[#F0FDF4] tracking-wider">
                      LIVE SQUAD INTERDEPENDENCE HUD
                    </h3>
                    <p className="text-[10px] text-emerald-300 font-mono">SYNCHRONOUS PUZZLE RELAY</p>
                  </div>
                </div>
                <span className={`font-mono text-[10px] font-black px-2 py-0.5 border border-[#03140C] ${
                  currentUser ? 'bg-[#10B981] text-[#02140D]' : 'bg-[#FBBF24] text-[#02140D]'
                }`}>
                  {currentUser ? 'ONLINE' : 'LOCKED 🔒'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px] text-center">
                {[
                  { label: "1. HACK", icon: Terminal, active: liveRelayStep >= 1 },
                  { label: "2. LASER", icon: Zap, active: liveRelayStep >= 2 },
                  { label: "3. CHEM", icon: FlaskConical, active: liveRelayStep >= 3 },
                  { label: "4. CRYPT", icon: Key, active: liveRelayStep >= 4 }
                ].map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div 
                      key={idx}
                      className={`p-1.5 border-2 border-[#03140C] flex flex-col items-center justify-center transition-all ${
                        step.active 
                          ? 'bg-[#10B981] text-[#02140D] font-black shadow-[2px_2px_0px_#FBBF24]' 
                          : 'bg-[#020C07] text-slate-400 font-bold'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 mb-0.5" />
                      <span>{step.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {liveTransmissions.map((t) => (
                  <div key={t.id} className="p-2 bg-[#020B06] border border-[#03140C] rounded-none text-xs font-mono space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[10px] uppercase" style={{ color: t.color }}>
                        [{t.sender}]
                      </span>
                      <span className="text-[9px] text-slate-500">LIVE FEED</span>
                    </div>
                    <p className="text-[#E2FBEA] text-[11px] leading-snug">{t.text}</p>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-[#03140C] flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    if (!currentUser) {
                      handleGuardedAction(() => {}, "Sign in with email & password to test live squad interdependence telemetry.");
                      return;
                    }
                    handleSimulateTransmission();
                  }}
                  disabled={isSimulatingTransmission}
                  className="flex-1 bg-[#FBBF24] text-[#02140D] font-black text-xs py-2.5 px-3 border-2 border-[#03140C] shadow-[3px_3px_0px_#020C07] hover:bg-[#F59E0B] active:translate-x-0.5 disabled:opacity-50 flex items-center justify-center space-x-1.5 uppercase"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>{isSimulatingTransmission ? "RELAYING DATA..." : "TEST SQUAD INTERLOCK"}</span>
                </button>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      handleGuardedAction(() => {}, "Sign in to enter the live squad operation cockpit.");
                      return;
                    }
                    onNavigate('liveheist');
                  }}
                  className="bg-[#10B981] text-[#02140D] font-black text-xs py-2.5 px-3 border-2 border-[#03140C] shadow-[3px_3px_0px_#020C07] hover:bg-[#34D399] uppercase flex items-center space-x-1"
                >
                  <span>LIVE HUD</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Operatives", val: "4,820+", icon: Users, color: "#10B981" },
          { label: "STEM Vaults Solved", val: "18,500+", icon: ShieldAlert, color: "#FBBF24" },
          { label: "Co-Op Success Rate", val: "98.4%", icon: CheckCircle2, color: "#60A5FA" },
          { label: "Specialist Roles", val: "4 Classes", icon: Sparkles, color: "#C084FC" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx}
              className="bg-[#051C12] p-4 sm:p-5 rounded-xl border border-emerald-800/40 shadow-md text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  {stat.label}
                </span>
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">{stat.val}</p>
            </div>
          );
        })}
      </section>

      <section className="bg-[#03150D]/40 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-5 text-left relative overflow-hidden">
        
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/60 pb-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#FBBF24] text-[#02140D] font-mono font-bold text-xs px-2.5 py-0.5 rounded uppercase mb-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>Worldwide Rankings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-game">
              Global Syndicate Leaderboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Live individual specialist standings ranked by season XP.
            </p>
          </div>
        </div>

        {true && (
          <div className="flex flex-wrap gap-1.5 bg-[#020B06]/70 backdrop-blur-sm p-1 rounded-xl border border-emerald-900/60 text-xs font-mono relative z-10">
            {[
              { id: 'ALL', label: 'All Specialists' },
              { id: 'Hacker', label: 'Hackers' },
              { id: 'Engineer', label: 'Engineers' },
              { id: 'Scientist', label: 'Scientists' },
              { id: 'Cryptographer', label: 'Cryptographers' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setLeaderboardFilter(tab.id);
                  heistAudio.playKeyClick();
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  leaderboardFilter === tab.id
                    ? 'bg-[#10B981] text-[#02140D] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {true && (
          <div className="space-y-2.5 relative z-10">
            {isLoadingLeaderboard ? (
              <div className="text-center text-slate-400 py-10 font-mono text-sm">Loading Leaderboard...</div>
            ) : filteredLeaderboard.length === 0 ? (
              <div className="text-center text-slate-400 py-10 font-mono text-sm">No operatives found in this category.</div>
            ) : filteredLeaderboard.map(player => {
              const pos = player.position;
              const isTop3 = pos <= 3;
              return (
                <div
                  key={player.userId || pos}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4 group ${
                    pos === 1
                      ? 'bg-gradient-to-r from-[#173019]/60 via-[#041A11]/60 to-[#041A11]/60 backdrop-blur-md border-amber-400/50 hover:border-amber-400'
                      : pos === 2
                      ? 'bg-gradient-to-r from-[#162721]/60 via-[#041A11]/60 to-[#041A11]/60 backdrop-blur-md border-slate-300/40 hover:border-slate-300'
                      : pos === 3
                      ? 'bg-gradient-to-r from-[#201A12]/60 via-[#041A11]/60 to-[#041A11]/60 backdrop-blur-md border-amber-700/50 hover:border-amber-600'
                      : 'bg-[#041C13]/40 backdrop-blur-md border-emerald-900/40 hover:border-[#10B981]/60 hover:bg-[#06291B]/60'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-[260px]">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 shadow-sm ${
                      pos === 1 ? 'bg-amber-400 text-[#02140D] font-black ring-1 ring-amber-300' :
                      pos === 2 ? 'bg-slate-200 text-[#02140D] font-black ring-1 ring-slate-100' :
                      pos === 3 ? 'bg-amber-700 text-white font-black ring-1 ring-amber-600' :
                      'bg-[#020B06]/90 text-slate-400 border border-emerald-900/60'
                    }`}>
                      #{pos}
                    </span>

                    <div className="relative flex-shrink-0">
                      <img 
                        src={player.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
                        alt={player.callsign || player.username} 
                        className="w-10 h-10 rounded-xl object-cover border border-emerald-800/80 group-hover:scale-105 transition-transform" 
                      />
                      {isTop3 && (
                        <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-[#020B06]">
                          <Crown className={`w-3 h-3 ${
                            pos === 1 ? 'text-amber-400' :
                            pos === 2 ? 'text-slate-300' : 'text-amber-600'
                          }`} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-base sm:text-lg text-white font-game truncate group-hover:text-[#10B981] transition-colors">
                          {player.callsign || player.username}
                        </h3>
                        <span className="text-xs">{player.level ? `LVL ${player.level}` : ''}</span>
                      </div>
                      <p className="text-[11px] font-mono text-emerald-300/80 truncate">
                        {player.rank || 'Operative'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#020B06]/70 px-2.5 py-1 rounded-lg border border-emerald-900/60 text-xs font-mono text-[#34D399] font-medium uppercase">
                      {player.role || 'Hacker'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 sm:space-x-6 text-xs font-mono pt-2 md:pt-0 border-t md:border-t-0 border-emerald-950/80">
                    <div className="text-left md:text-center">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Streak</span>
                      <span className="text-white font-bold text-sm">{player.streak || 0}</span>
                    </div>
                    <div className="text-left md:text-right min-w-[70px]">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Total XP</span>
                      <span className="text-amber-300 font-bold text-sm">{(player.totalXp || 0).toLocaleString()}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}


      </section>

    </div>
  );
}
