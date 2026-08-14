import React, { useState } from 'react';
import { 
  Shield, Award, Zap, Activity, Clock, Users, Play, 
  Terminal, FlaskConical, Key, Sparkles, CheckCircle2, 
  TrendingUp, LogOut, Lock, ArrowUpRight, ArrowLeft, Compass,
  UserPlus, Copy, Check, Share2, Crown, Radio, Circle,
  Plus, MessageSquare, Eye, Send, Swords
} from 'lucide-react';
import { heistAudio } from './HeistAudioEngine';
import { toast } from 'sonner';

export default function StatsDashboard({ currentUser, onLogout, onStartHeist, onNavigate }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamMotto, setNewTeamMotto] = useState('');
  const [newTeamEmblem, setNewTeamEmblem] = useState('🌲');
  const [myTeam, setMyTeam] = useState({
    id: 'squad-7749',
    name: 'Apex Sylvan Syndicate',
    motto: 'Synchronous cross-curricular breach specialists',
    emblem: '🌲',
    inviteCode: 'SYNDICATE-7749',
    members: [
      { name: currentUser?.callsign || 'You', role: currentUser?.role || 'Canopy Hacker', isLeader: true, avatar: currentUser?.avatar },
      { name: 'Echo_Ranger', role: 'Woodland Engineer', isLeader: false, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80' },
      { name: 'Vespera_9', role: 'Flora Scientist', isLeader: false, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80' }
    ]
  });

  const [friendsFilter, setFriendsFilter] = useState('ALL'); // 'ALL' | 'ONLINE' | 'IN_HEIST'
  const [newFriendCallsign, setNewFriendCallsign] = useState('');
  const [inGameFriends, setInGameFriends] = useState([
    {
      id: 'f1',
      callsign: 'Kestrel_01',
      role: 'Canopy Hacker',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      status: 'IN_HEIST',
      activity: 'In Operation: Boreal Core (Stage 2/3)',
      isSquadmate: true
    },
    {
      id: 'f2',
      callsign: 'Boreal_Warden',
      role: 'Woodland Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      status: 'ONLINE',
      activity: 'Custom Heist Forge Workshop',
      isSquadmate: false
    },
    {
      id: 'f3',
      callsign: 'Cleo_Titrate',
      role: 'Flora Scientist',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      status: 'ONLINE',
      activity: 'Spectating Canopy Sector 4',
      isSquadmate: true
    },
    {
      id: 'f4',
      callsign: 'Modulo_Ghost',
      role: 'Mist Cryptographer',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
      status: 'OFFLINE',
      activity: 'Last seen 2 hours ago',
      isSquadmate: false
    }
  ]);

  if (!currentUser) {
    return (
      <div className="bg-[#051C12] p-8 sm:p-12 rounded-2xl border border-emerald-800/40 text-center space-y-6 max-w-xl mx-auto shadow-2xl relative">
        {/* Top-Left Back Button */}
        <button
          onClick={() => {
            onNavigate('home');
            heistAudio.playKeyClick();
          }}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#020B06] border border-emerald-800/60 text-emerald-300 hover:text-white hover:bg-[#072418] text-xs font-bold font-game transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="w-14 h-14 bg-[#0A261B] border border-emerald-700/50 text-[#FBBF24] flex items-center justify-center mx-auto rounded-xl shadow-md">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold uppercase text-white font-game">
            Operative Profile Locked
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Please sign in with your email and password to view your personal stats, manage your squad team, and coordinate with in-game friends.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              onNavigate('home');
              heistAudio.playKeyClick();
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-lg bg-[#020B06] border border-emerald-800/60 text-emerald-300 hover:text-white text-xs font-bold font-game transition-all"
          >
            ← Back to Home
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="w-full sm:w-auto bg-[#10B981] text-[#02140D] font-bold px-6 py-3 rounded-lg hover:bg-[#34D399] transition-all text-xs uppercase font-game shadow-md shadow-emerald-950"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  const { stats, history = [], badges = [] } = currentUser;
  const currentXpInLevel = currentUser.xp % 1000;
  const progressPercent = Math.min(100, Math.round((currentXpInLevel / 1000) * 100));

  const handleCopyInviteLink = () => {
    const inviteUrl = `https://vault.learning/join?team=${myTeam.inviteCode}`;
    navigator.clipboard?.writeText(inviteUrl);
    setCopiedLink(true);
    heistAudio.playKeyClick();
    toast.success(`📋 Squad invite link copied: ${inviteUrl}`);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCreateTeamSubmit = (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    const newCode = `VAULT-${Math.floor(1000 + Math.random() * 9000)}`;
    setMyTeam({
      id: `squad-${Date.now()}`,
      name: newTeamName,
      motto: newTeamMotto || 'Synchronous STEM Operatives',
      emblem: newTeamEmblem,
      inviteCode: newCode,
      members: [
        { name: currentUser.callsign, role: currentUser.role, isLeader: true, avatar: currentUser.avatar }
      ]
    });
    setIsCreatingTeam(false);
    setNewTeamName('');
    setNewTeamMotto('');
    heistAudio.playSuccessChime();
    toast.success(`🌲 Team "${newTeamName}" created! Invite code: ${newCode}`);
  };

  const handleInviteFriend = (friend) => {
    heistAudio.playRadioSquelch();
    toast.success(`📡 Squad invitation transmitted to ${friend.callsign}!`);
  };

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!newFriendCallsign.trim()) return;
    const newFriend = {
      id: `f-${Date.now()}`,
      callsign: newFriendCallsign.trim(),
      role: 'Canopy Hacker',
      level: 1,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      status: 'ONLINE',
      activity: 'Active in Network',
      isSquadmate: false
    };
    setInGameFriends([newFriend, ...inGameFriends]);
    setNewFriendCallsign('');
    heistAudio.playKeyClick();
    toast.success(`🤝 Friend request sent to ${newFriend.callsign}!`);
  };

  const filteredFriends = inGameFriends.filter(friend => {
    if (friendsFilter === 'ONLINE') return friend.status === 'ONLINE';
    if (friendsFilter === 'IN_HEIST') return friend.status === 'IN_HEIST';
    return true;
  });

  return (
    <div className="space-y-8 sm:space-y-12 pb-16 w-full max-w-7xl mx-auto">

      {/* ========================================================================= */}
      {/* 1. OPERATIVE DOSSIER IDENTITY HERO BANNER */}
      {/* ========================================================================= */}
      <section className="bg-[#051C12]/90 backdrop-blur-md border border-emerald-800/40 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Avatar + Callout info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="relative p-1 rounded-2xl bg-[#020B06] border border-emerald-700/60 shadow-md flex-shrink-0">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.callsign}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-emerald-900"
              />
              <div className="absolute -bottom-2 -right-2 bg-[#FBBF24] text-[#02140D] font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-amber-950 uppercase shadow-sm">
                LVL {currentUser.level}
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#10B981] text-[#02140D] font-mono font-bold text-[10px] px-2.5 py-0.5 rounded uppercase">
                  Active Operative
                </span>
                <span className="bg-[#020B06] text-emerald-300 font-mono text-xs px-2.5 py-0.5 rounded border border-emerald-900/60">
                  {currentUser.role}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold uppercase text-white tracking-tight font-game">
                {currentUser.callsign}
              </h1>
              
              <p className="text-xs font-mono font-bold text-amber-300 uppercase">
                RANK: {currentUser.rank}
              </p>
            </div>
          </div>

          {/* XP Progression Card + Quick Actions */}
          <div className="w-full lg:w-80 p-4 bg-[#020E08] border border-emerald-800/40 rounded-xl space-y-2.5 font-mono text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase">Season XP</span>
              <span className="text-[#10B981] font-bold">{currentUser.xp} XP</span>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                <span>LVL {currentUser.level}</span>
                <span>{progressPercent}% to LVL {currentUser.level + 1}</span>
              </div>
              <div className="w-full bg-[#051811] h-2.5 rounded-full overflow-hidden border border-emerald-950">
                <div 
                  className="bg-gradient-to-r from-[#10B981] to-[#34D399] h-full transition-all duration-500 rounded-full" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => onStartHeist(0)}
                className="flex-1 bg-[#10B981] text-[#02140D] font-bold py-2 px-3 rounded-lg hover:bg-[#34D399] text-xs uppercase flex items-center justify-center space-x-1.5 font-game"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Heist</span>
              </button>
              
              <button
                onClick={() => {
                  onLogout();
                  toast.info("Logged out from Syndicate terminal.");
                }}
                className="bg-[#FF4D6D] text-white p-2 rounded-lg hover:bg-[#FF3366] transition-colors"
                title="Log Out Operative"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SQUAD TEAM MANAGEMENT & INVITE LINK HUB */}
      {/* ========================================================================= */}
      <section className="bg-[#051C12]/90 backdrop-blur-md border border-emerald-800/40 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 text-left">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/60 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#FBBF24] text-[#02140D] font-mono font-bold text-xs px-2.5 py-0.5 rounded uppercase mb-1">
              <Crown className="w-3.5 h-3.5" />
              <span>Squad Team HQ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-game">
              Team Roster & Squad Invite Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Manage your 4-person synchronous crew and share instant invite links with your friends.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingTeam(!isCreatingTeam)}
              className="bg-[#020B06] text-emerald-300 border border-emerald-700/60 hover:bg-[#10B981] hover:text-[#02140D] px-4 py-2 rounded-lg text-xs font-bold font-game uppercase transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreatingTeam ? 'Cancel Team Creation' : 'Create New Team'}</span>
            </button>
          </div>
        </div>

        {/* Create Team Form Modal Box */}
        {isCreatingTeam && (
          <div className="p-5 bg-[#020E08] border border-[#10B981]/50 rounded-xl space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-white uppercase font-game flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#FBBF24]" />
              <span>Form a New 4-Operative Syndicate Team</span>
            </h3>

            <form onSubmit={handleCreateTeamSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input 
                type="text"
                required
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                placeholder="Team Name (e.g. Sylvan Vanguard)"
                className="bg-[#041910] border border-emerald-800/60 p-2.5 rounded-lg text-xs text-white placeholder-slate-500 font-mono outline-none focus:border-[#10B981]"
              />
              <input 
                type="text"
                value={newTeamMotto}
                onChange={e => setNewTeamMotto(e.target.value)}
                placeholder="Team Motto (e.g. Zero Alarms)"
                className="bg-[#041910] border border-emerald-800/60 p-2.5 rounded-lg text-xs text-white placeholder-slate-500 font-mono outline-none focus:border-[#10B981]"
              />
              <div className="flex gap-2">
                <select 
                  value={newTeamEmblem}
                  onChange={e => setNewTeamEmblem(e.target.value)}
                  className="bg-[#041910] border border-emerald-800/60 p-2.5 rounded-lg text-xs text-white font-mono outline-none focus:border-[#10B981]"
                >
                  <option value="🌲">🌲 Forest</option>
                  <option value="⚡">⚡ Laser</option>
                  <option value="🔑">🔑 Cipher</option>
                  <option value="🧪">🧪 Chemistry</option>
                  <option value="💻">💻 Hacker</option>
                  <option value="🛡️">🛡️ Shield</option>
                </select>
                <button
                  type="submit"
                  className="flex-1 bg-[#10B981] text-[#02140D] font-bold text-xs py-2.5 px-3 rounded-lg hover:bg-[#34D399] transition-all uppercase font-game"
                >
                  Establish Team
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Current Squad Info + Shareable Invite Link Bar */}
        <div className="bg-[#020E08] p-5 rounded-xl border border-emerald-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#041C12] border border-emerald-800 flex items-center justify-center text-2xl flex-shrink-0">
              {myTeam.emblem}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white font-game">{myTeam.name}</h3>
                <span className="text-[10px] font-mono font-bold bg-[#10B981]/20 text-[#34D399] px-2 py-0.5 rounded border border-[#10B981]/40">
                  {myTeam.members.length}/4 OPERATIVES
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{myTeam.motto}</p>
            </div>
          </div>

          {/* Quick Copy Link Box */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="flex-1 md:flex-initial bg-[#041C12] px-3 py-2 rounded-lg border border-emerald-800/60 font-mono text-xs text-slate-300 select-all truncate max-w-xs">
              https://vault.learning/join?team={myTeam.inviteCode}
            </div>
            <button
              onClick={handleCopyInviteLink}
              className="bg-[#10B981] text-[#02140D] font-bold text-xs px-3.5 py-2 rounded-lg hover:bg-[#34D399] transition-all flex items-center space-x-1.5 flex-shrink-0 font-game"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Invite'}</span>
            </button>
          </div>
        </div>

        {/* 4-Operative Team Roster Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[0, 1, 2, 3].map((slotIdx) => {
            const member = myTeam.members[slotIdx];
            if (member) {
              return (
                <div 
                  key={slotIdx}
                  className="bg-[#041C12] border border-emerald-800/60 rounded-xl p-4 flex items-center space-x-3 shadow-md"
                >
                  <img 
                    src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
                    alt={member.name}
                    className="w-10 h-10 rounded-lg object-cover border border-emerald-700" 
                  />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-bold text-sm text-white truncate font-game">{member.name}</h4>
                      {member.isLeader && <Crown className="w-3 h-3 text-[#FBBF24] flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] font-mono text-[#34D399] truncate">{member.role}</p>
                    <span className="text-[9px] font-mono text-emerald-400 bg-[#020B06] px-1.5 py-0.2 rounded inline-block mt-1">
                      {member.isLeader ? 'Squad Captain' : 'Active Member'}
                    </span>
                  </div>
                </div>
              );
            }
            return (
              <div 
                key={slotIdx}
                className="bg-[#020B06]/60 border border-dashed border-emerald-900/80 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-1.5"
              >
                <div className="p-2 rounded-full bg-[#041910] text-slate-500">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">Open Squad Slot #{slotIdx + 1}</span>
                <button
                  onClick={handleCopyInviteLink}
                  className="text-[10px] font-mono text-[#10B981] hover:underline font-bold"
                >
                  + Send Invite Link
                </button>
              </div>
            );
          })}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. IN-GAME FRIENDS & LIVE ACTIVITY RADAR */}
      {/* ========================================================================= */}
      <section className="bg-[#051C12]/90 backdrop-blur-md border border-emerald-800/40 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 text-left">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/60 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#10B981] text-[#02140D] font-mono font-bold text-xs px-2.5 py-0.5 rounded uppercase mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Network Radar</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-game">
              In-Game Friends & Activity Status
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Track friend availability, active heist operations, and transmit instant squad invites.
            </p>
          </div>

          {/* Activity Filters */}
          <div className="flex items-center gap-1.5 bg-[#020B06] p-1 rounded-xl border border-emerald-900/60 text-xs font-mono">
            {[
              { id: 'ALL', label: `All (${inGameFriends.length})` },
              { id: 'ONLINE', label: `Online (${inGameFriends.filter(f => f.status === 'ONLINE').length})` },
              { id: 'IN_HEIST', label: `In Heist (${inGameFriends.filter(f => f.status === 'IN_HEIST').length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setFriendsFilter(tab.id);
                  heistAudio.playKeyClick();
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  friendsFilter === tab.id
                    ? 'bg-[#10B981] text-[#02140D]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add Friend Input Strip */}
        <form onSubmit={handleAddFriend} className="flex gap-2 max-w-md">
          <input 
            type="text"
            value={newFriendCallsign}
            onChange={e => setNewFriendCallsign(e.target.value)}
            placeholder="Add friend by Operative Callsign..."
            className="flex-1 bg-[#020B06] border border-emerald-800/60 px-3.5 py-2 rounded-lg text-xs text-white placeholder-slate-500 font-mono outline-none focus:border-[#10B981]"
          />
          <button
            type="submit"
            className="bg-[#10B981] text-[#02140D] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#34D399] transition-all uppercase font-game flex items-center space-x-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Friend</span>
          </button>
        </form>

        {/* Friends List Horizontal Strips */}
        <div className="space-y-2.5">
          {filteredFriends.map(friend => {
            const isOnline = friend.status === 'ONLINE';
            const isInHeist = friend.status === 'IN_HEIST';

            return (
              <div 
                key={friend.id}
                className="p-3.5 sm:p-4 bg-[#041C12]/70 border border-emerald-900/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#10B981]/60 hover:bg-[#07281A] transition-all group"
              >
                {/* Left: Avatar + Callsign + Role + Status Indicator */}
                <div className="flex items-center space-x-3.5 min-w-[240px]">
                  <div className="relative">
                    <img 
                      src={friend.avatar} 
                      alt={friend.callsign} 
                      className="w-10 h-10 rounded-xl object-cover border border-emerald-800"
                    />
                    {/* Activity Indicator Dot */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#020B06] ${
                      isInHeist ? 'bg-amber-400 animate-pulse' :
                      isOnline ? 'bg-[#10B981]' :
                      'bg-slate-500'
                    }`} />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm sm:text-base text-white font-game group-hover:text-[#10B981] transition-colors">
                        {friend.callsign}
                      </h4>
                      <span className="text-[10px] font-mono text-amber-300 bg-[#020B06] px-1.5 py-0.2 rounded border border-emerald-950">
                        LVL {friend.level}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[#34D399]">{friend.role}</p>
                  </div>
                </div>

                {/* Center: Live Activity Status Pill */}
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                    isInHeist ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {isInHeist ? '🟠 IN HEIST' : isOnline ? '🟢 ONLINE' : '⚪ OFFLINE'}
                  </span>
                  <span className="text-xs text-slate-300">{friend.activity}</span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleInviteFriend(friend)}
                    className="bg-[#020B06] text-emerald-300 border border-emerald-800/80 hover:bg-[#10B981] hover:text-[#02140D] font-bold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 font-game"
                  >
                    <Send className="w-3 h-3" />
                    <span>Invite to Squad</span>
                  </button>
                  
                  {isInHeist && (
                    <button
                      onClick={() => {
                        onStartHeist(0);
                        toast.info(`📡 Tuning into ${friend.callsign}'s operational frequency...`);
                      }}
                      className="bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400 hover:text-[#02140D] font-bold text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center space-x-1 font-game"
                      title="Spectate Operation"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Spectate</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 4. 4 STEM DISCIPLINE MASTERY GAUGES */}
      {/* ========================================================================= */}
      <section className="bg-[#051C12]/90 backdrop-blur-md border border-emerald-800/40 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 text-left">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-emerald-900/60 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#10B981] text-[#02140D] font-mono font-bold text-xs px-2.5 py-0.5 rounded uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cross-Curricular Proficiency</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold uppercase text-white tracking-tight font-game">
              Specialist Discipline Mastery
            </h2>
          </div>
          <p className="text-xs font-mono font-bold text-emerald-300">
            BASED ON LIVE SQUAD OPERATION DATA
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          {[
            {
              role: "Canopy Hacker",
              domain: "Computer Science",
              topic: "Memory Buffers & Pointer Traversal",
              score: stats.csMastery,
              color: "#10B981",
              icon: Terminal
            },
            {
              role: "Woodland Engineer",
              domain: "Physics & Optics",
              topic: "Snell's Law & Refractive Beams",
              score: stats.physicsMastery,
              color: "#FBBF24",
              icon: Zap
            },
            {
              role: "Flora Scientist",
              domain: "Chemistry & pH",
              topic: "Stoichiometry & Acid Buffers",
              score: stats.chemMastery,
              color: "#60A5FA",
              icon: FlaskConical
            },
            {
              role: "Mist Cryptographer",
              domain: "Discrete Mathematics",
              topic: "Modular Arithmetic & Caesar Ciphers",
              score: stats.mathMastery,
              color: "#C084FC",
              icon: Key
            }
          ].map((disc, idx) => {
            const Icon = disc.icon;
            return (
              <div 
                key={idx}
                className="p-4 bg-[#020E08] border border-emerald-900/50 rounded-xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 border border-emerald-900/80 bg-[#051811] rounded-lg" style={{ color: disc.color }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-base font-bold font-mono" style={{ color: disc.color }}>
                      {disc.score}%
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase text-white font-game">{disc.domain}</h3>
                    <p className="text-[10px] text-emerald-300 font-bold">{disc.role}</p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{disc.topic}</p>
                  </div>
                </div>

                <div>
                  <div className="w-full bg-[#051811] h-2 rounded-full overflow-hidden border border-emerald-950">
                    <div 
                      className="h-full rounded-full" 
                      style={{ width: `${disc.score}%`, backgroundColor: disc.color }} 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 5. RECENT OPERATIONS LOG & MEDALS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* Recent Operations Log (8 cols) */}
        <div className="lg:col-span-8 bg-[#051C12]/90 backdrop-blur-md border border-emerald-800/40 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-amber-300 uppercase">
                <Clock className="w-3.5 h-3.5" />
                <span>Mission Archive</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold uppercase text-white font-game">
                Recent Squad Operations
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-300 font-bold bg-[#020B06] px-2 py-1 rounded border border-emerald-900/60">
              {history.length} Logs
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {history.map((item) => (
              <div 
                key={item.id}
                className="p-3 bg-[#020B06] border border-emerald-900/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-[#10B981]/60 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#10B981] text-[#02140D] font-bold text-[10px] px-2 py-0.5 rounded">
                      {item.result}
                    </span>
                    <span className="text-white font-bold text-sm font-game">{item.mission}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Role: <span className="text-emerald-300 font-bold">{item.role}</span> • {item.date}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-amber-300 font-bold text-sm block">{item.xp}</span>
                    <span className="text-[10px] text-slate-400">Time: {item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Syndicate Medals Cabinet (4 cols) */}
        <div className="lg:col-span-4 bg-[#051C12]/90 backdrop-blur-md border border-emerald-800/40 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-emerald-900/60 pb-3">
            <div className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-amber-300 uppercase">
              <Award className="w-3.5 h-3.5" />
              <span>Cabinet</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold uppercase text-white font-game">
              Earned Medals
            </h3>
          </div>

          <div className="space-y-2.5">
            {badges.map((badge, idx) => (
              <div 
                key={idx}
                className="p-3 bg-[#020B06] border border-emerald-900/50 rounded-xl flex items-center space-x-3"
              >
                <div className="p-2 bg-[#FBBF24] text-[#02140D] rounded-lg flex-shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-white font-game">{badge}</h4>
                  <p className="text-[10px] font-mono text-emerald-300">Syndicate Recognition</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
