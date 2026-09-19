import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Award, Zap, Activity, Clock, Users, Play, 
  Terminal, FlaskConical, Key, Sparkles, CheckCircle2, 
  TrendingUp, LogOut, Lock, ArrowUpRight, ArrowLeft, Compass,
  UserPlus, Copy, Check, Share2, Crown, Radio, Circle,
  Plus, MessageSquare, Eye, Send, Swords, UserX, RotateCw,
  Camera, Upload, Image as ImageIcon, Trophy, TrendingDown, Star
} from 'lucide-react';
import { heistAudio } from './HeistAudioEngine';
import { getLevelProgress } from '../utils/leveling';
import { toast } from 'sonner';
import { friendAPI, teamAPI, userAPI } from '../services/api';
import XPRing from './XPRing';
import { ACHIEVEMENTS, ACHIEVEMENT_TIERS } from '../data/achievements';
import { getLoyaltyRank } from '../utils/loyaltyPoints';

export default function StatsDashboard({ currentUser, loyaltyPoints: loyaltyPointsProp, onLogout, onStartHeist, onNavigate, onUpdateUser }) {
  const fileInputRef = useRef(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [userAvatar, setUserAvatar] = useState(currentUser?.avatar || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMyId, setCopiedMyId] = useState(false);
  
  // Real Teams State
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamMotto, setNewTeamMotto] = useState('');
  const [newTeamEmblem, setNewTeamEmblem] = useState('🌲');
  const [joinTeamCode, setJoinTeamCode] = useState('');
  const [myTeam, setMyTeam] = useState(null);
  const [isTeamLoading, setIsTeamLoading] = useState(false);

  // Real Friends State
  const [friendsFilter, setFriendsFilter] = useState('ALL'); 
  const [newFriendInput, setNewFriendInput] = useState('');
  const [inGameFriends, setInGameFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const [isFriendsLoading, setIsFriendsLoading] = useState(false);

  // Real Mission History State
  const [realHistory, setRealHistory] = useState(currentUser?.history || []);

  // Achievement Showcase State
  const [achievementFilter, setAchievementFilter] = useState('ALL');
  const [inspectingAchievement, setInspectingAchievement] = useState(null);

  // Fetch real data on mount or when user changes
  useEffect(() => {
    if (!currentUser) return;

    // Fetch real friends
    const loadFriends = async () => {
      try {
        const data = await friendAPI.list();
        if (data) {
          setInGameFriends(data.friends || []);
          setPendingRequests(data.pendingReceived || []);
          setPendingSent(data.pendingSent || []);
        }
      } catch (err) {
        console.error('[STATS] Error loading friends:', err);
      } finally {
        setIsFriendsLoading(false);
      }
    };

    // Fetch real teams
    const loadTeams = async () => {
      try {
        const data = await teamAPI.getMyTeams();
        if (data?.teams && data.teams.length > 0) {
          const primaryTeam = data.teams[0];
          const fullTeam = await teamAPI.getById(primaryTeam.id);
          if (fullTeam?.team) {
            setMyTeam(fullTeam.team);
          } else {
            setMyTeam(primaryTeam);
          }
        } else {
          setMyTeam(null);
        }
      } catch (err) {
        console.error('[STATS] Error loading teams:', err);
      } finally {
        setIsTeamLoading(false);
      }
    };

    // Fetch real history
    const loadHistory = async () => {
      if (currentUser.id) {
        try {
          const histData = await userAPI.getHistory(currentUser.id, 1, 10);
          if (histData?.history) {
            setRealHistory(histData.history);
          }
        } catch (err) {
          console.error('[STATS] Error loading history:', err);
        }
      }
    };

    setIsFriendsLoading(true);
    setIsTeamLoading(true);
    loadFriends();
    loadTeams();
    loadHistory();

    // Auto-refresh friend requests every 3.5 seconds so incoming requests appear in real time
    const interval = setInterval(loadFriends, 3500);
    return () => clearInterval(interval);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="bg-[#051C12] p-8 sm:p-12 rounded-2xl border border-emerald-800/40 text-center space-y-6 max-w-xl mx-auto shadow-2xl relative">
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

  const { stats = { missionsCompleted: 0, vaultsCracked: 0, alarmsTripped: 0, winRate: 100, csMastery: 85, physicsMastery: 80, chemMastery: 75, mathMastery: 90 }, badges = [] } = currentUser;
  const { progress: levelProgress } = getLevelProgress(currentUser.xp || 0);
  const progressPercent = Math.min(100, Math.round(levelProgress * 100));

  const myAgentId = currentUser.agentId || (
    currentUser.id ? `VAULT-${currentUser.id.replace(/-/g, '').substring(0, 8).toUpperCase()}` : null
  );

  const handleCopyMyAgentId = () => {
    if (!myAgentId) return;
    navigator.clipboard?.writeText(myAgentId);
    setCopiedMyId(true);
    heistAudio.playKeyClick();
    toast.success(`📋 Copied Unique Agent ID: ${myAgentId}`);
    setTimeout(() => setCopiedMyId(false), 2500);
  };

  const handleCopyInviteLink = () => {
    if (!myTeam?.inviteCode) return;
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://vault.vercel.app';
    const inviteUrl = `${origin}/#join?team=${myTeam.inviteCode}`;
    navigator.clipboard?.writeText(inviteUrl);
    setCopiedLink(true);
    heistAudio.playKeyClick();
    toast.success(`📋 Squad invite link copied: ${inviteUrl}`);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCreateTeamSubmit = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    try {
      const res = await teamAPI.create(newTeamName.trim(), newTeamMotto, newTeamEmblem);
      if (res?.team) {
        setMyTeam({
          ...res.team,
          members: [
            { name: currentUser.callsign, role: currentUser.role, isLeader: true, avatar: currentUser.avatar }
          ]
        });
        setIsCreatingTeam(false);
        setNewTeamName('');
        setNewTeamMotto('');
        heistAudio.playSuccessChime();
        toast.success(`🌲 Team "${newTeamName}" created! Invite code: ${res.team.inviteCode}`);
        try {
          window.dispatchEvent(new CustomEvent('vault:achievement-event', { detail: { type: 'TEAM_JOINED' } }));
        } catch {}
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create team');
    }
  };

  const handleJoinTeamSubmit = async (e) => {
    e.preventDefault();
    if (!joinTeamCode.trim()) return;
    try {
      const res = await teamAPI.join(joinTeamCode.trim().toUpperCase());
      if (res?.team) {
        setMyTeam(res.team);
        setJoinTeamCode('');
        heistAudio.playSuccessChime();
        toast.success(`🤝 Successfully joined team ${res.team.name}!`);
        try {
          window.dispatchEvent(new CustomEvent('vault:achievement-event', { detail: { type: 'TEAM_JOINED' } }));
        } catch {}
      }
    } catch (err) {
      toast.error(err.message || 'Invalid or expired team invite code');
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!newFriendInput.trim()) return;

    const clean = newFriendInput.trim().toLowerCase();
    const myCallsign = (currentUser?.callsign || '').toLowerCase();
    const myUsername = (currentUser?.username || '').toLowerCase();
    const myTag = (myAgentId || '').toLowerCase();
    const myShort = myTag.replace(/^vault-/, '');

    if (clean === myCallsign || clean === myUsername || clean === myTag || clean === myShort) {
      toast.warning("⚠️ That's your own Agent ID / Callsign! Enter another player's ID.");
      return;
    }

    try {
      const res = await friendAPI.sendRequest(newFriendInput.trim());
      setNewFriendInput('');
      heistAudio.playKeyClick();
      toast.success(res?.message || `🤝 Friend request sent!`);
      // Reload friends
      const data = await friendAPI.list();
      if (data) {
        setInGameFriends(data.friends || []);
        setPendingRequests(data.pendingReceived || []);
        setPendingSent(data.pendingSent || []);
      }
    } catch (err) {
      toast.error(err.message || 'Operative not found');
    }
  };

  const handleAcceptFriendRequest = async (reqId) => {
    try {
      await friendAPI.acceptRequest(reqId);
      heistAudio.playSuccessChime();
      toast.success("🤝 Friend request accepted!");
      const data = await friendAPI.list();
      if (data) {
        setInGameFriends(data.friends || []);
        setPendingRequests(data.pendingReceived || []);
        setPendingSent(data.pendingSent || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to accept friend request');
    }
  };

  const handleRejectFriendRequest = async (reqId) => {
    try {
      await friendAPI.rejectRequest(reqId);
      heistAudio.playRadioSquelch();
      toast.info("Friend request declined");
      const data = await friendAPI.list();
      if (data) {
        setInGameFriends(data.friends || []);
        setPendingRequests(data.pendingReceived || []);
        setPendingSent(data.pendingSent || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to decline friend request');
    }
  };

  const handleCancelSentRequest = async (reqId) => {
    try {
      await friendAPI.remove(reqId);
      toast.info("Friend request cancelled");
      setPendingSent(prev => prev.filter(r => r.id !== reqId));
    } catch (err) {
      toast.error('Failed to cancel request');
    }
  };

  const handleRemoveFriend = async (friendshipId) => {
    try {
      await friendAPI.remove(friendshipId);
      toast.info("Operative removed from contacts");
      setInGameFriends(prev => prev.filter(f => f.id !== friendshipId));
    } catch (err) {
      toast.error('Failed to remove friend');
    }
  };

  const handleInviteFriend = (friend) => {
    heistAudio.playRadioSquelch();
    toast.success(`📡 Squad invitation transmitted to ${friend.callsign || friend.username}!`);
  };

  useEffect(() => {
    if (currentUser?.avatar) {
      setUserAvatar(currentUser.avatar);
    }
  }, [currentUser]);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, JPEG, WEBP)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image size must be under 8MB');
      return;
    }

    setIsUploadingAvatar(true);
    toast.loading("Processing profile image...", { id: 'avatar-upload' });

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target.result;
        const img = new Image();
        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 360;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

            // Update in backend DB if registered user
            if (currentUser?.id && !currentUser?.isGuest) {
              try {
                await userAPI.updateProfile(currentUser.id, { avatar_url: compressedDataUrl });
              } catch (apiErr) {
                console.warn('[AVATAR] DB update error, saving locally:', apiErr);
              }
            }

            // Update UI and storage
            setUserAvatar(compressedDataUrl);
            if (currentUser) {
              currentUser.avatar = compressedDataUrl;
              try {
                localStorage.setItem('vault_current_user', JSON.stringify(currentUser));
              } catch (e) {}
              onUpdateUser?.({ avatar: compressedDataUrl });
              window.dispatchEvent(new CustomEvent('vault:user-updated', { detail: { avatar: compressedDataUrl } }));
            }

            heistAudio.playSuccessChime();
            toast.success("📸 Profile photo updated successfully!", { id: 'avatar-upload' });
          } catch (err) {
            console.error('[AVATAR] Processing error:', err);
            toast.error("Failed to process image", { id: 'avatar-upload' });
          } finally {
            setIsUploadingAvatar(false);
          }
        };
        img.onerror = () => {
          toast.error("Invalid image file format", { id: 'avatar-upload' });
          setIsUploadingAvatar(false);
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);

    } catch (err) {
      toast.error("Error reading file from device", { id: 'avatar-upload' });
      setIsUploadingAvatar(false);
    }
  };

  const filteredFriends = inGameFriends.filter(friend => {
    if (friendsFilter === 'ONLINE') return friend.status === 'ONLINE' || friend.status === 'accepted';
    if (friendsFilter === 'IN_HEIST') return friend.status === 'IN_HEIST';
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-16 font-sans">
      
      {/* Hidden File Input for Device Photo Upload */}
      <input 
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleAvatarFileChange}
        className="hidden"
      />

      {/* Top Profile Header Card */}
      <div className="bg-[#051C12]/90 backdrop-blur-md border border-emerald-800/40 rounded-2xl p-6 sm:p-8 shadow-xl text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center space-x-5">
            
            {/* Avatar + yellow XP ring */}
            <div className="relative flex-shrink-0" style={{ width: 108, height: 108 }}>
              {/* Direct SVG ring — yellow progress arc */}
              {(() => {
                const size = 108, sw = 6;
                const r = (size - sw) / 2;
                const circ = 2 * Math.PI * r;
                const { progress } = getLevelProgress(currentUser.xp || 0);
                const offset = circ * (1 - progress);
                const c = size / 2;
                return (
                  <svg width={size} height={size} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={c} cy={c} r={r} fill="none" stroke="#1a1a1a" strokeWidth={sw} />
                    <circle cx={c} cy={c} r={r} fill="none" stroke="#FBBF24" strokeWidth={sw}
                      strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                      style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                  </svg>
                );
              })()}

              {/* Avatar centered inside */}
              <div
                className="absolute flex items-center justify-center group cursor-pointer"
                style={{ inset: 10 }}
                onClick={() => fileInputRef.current?.click()}
              >
                <img
                  src={userAvatar || currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
                  alt={currentUser.callsign}
                  className="w-full h-full rounded-full object-cover shadow-lg"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-1">
                  <Camera className={`w-4 h-4 text-[#FBBF24] ${isUploadingAvatar ? 'animate-spin' : ''}`} />
                  <span className="text-[9px] font-mono font-bold uppercase text-amber-200">
                    {isUploadingAvatar ? 'Saving...' : 'Change'}
                  </span>
                </div>
              </div>

              {/* LVL badge */}
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#FBBF24] text-[#02140D] text-[11px] font-black px-2 py-0.5 rounded-full font-game shadow whitespace-nowrap z-10">
                LVL {currentUser.level || 1}
              </span>

              {/* Camera button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="absolute top-0 right-0 p-1 bg-[#020B06] hover:bg-[#FBBF24] text-[#FBBF24] hover:text-[#02140D] border border-amber-500/60 rounded-full transition-all z-10"
                title="Upload Photo"
              >
                <Camera className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold uppercase text-white tracking-tight font-game">
                  {currentUser.callsign}
                </h1>
                <span className="bg-[#10B981]/20 text-[#34D399] font-mono text-xs font-bold px-2.5 py-0.5 rounded border border-[#10B981]/40 uppercase">
                  {currentUser.role}
                </span>
              </div>
              
              {/* Unique Permanent Agent ID Badge */}
              {myAgentId && (
                <div className="flex items-center space-x-2 pt-0.5">
                  <span className="text-xs font-mono font-bold text-slate-400">AGENT ID:</span>
                  <span className="bg-[#020B06] text-[#FBBF24] font-mono font-bold text-xs px-2.5 py-0.5 rounded border border-emerald-900/80 tracking-wider">
                    {myAgentId}
                  </span>
                  <button
                    onClick={handleCopyMyAgentId}
                    className="p-1 rounded bg-[#020B06] text-slate-400 hover:text-white border border-emerald-900/60 transition-colors"
                    title="Copy Your Unique Agent ID"
                  >
                    {copiedMyId ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <p className="text-xs font-mono text-slate-400">
                  Rank Designation: <span className="text-[#FBBF24] font-bold">{currentUser.rank || 'Forest Explorer'}</span>
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-mono text-emerald-400 hover:text-[#34D399] underline underline-offset-2 flex items-center space-x-1"
                >
                  <Upload className="w-2.5 h-2.5" />
                  <span>Upload Pic</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onStartHeist(0)}
              className="flex-1 md:flex-initial bg-[#10B981] text-[#02140D] font-bold px-5 py-2.5 rounded-xl hover:bg-[#34D399] transition-all flex items-center justify-center space-x-2 text-xs uppercase font-game shadow-lg shadow-emerald-950/60"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Operation</span>
            </button>
            <button
              onClick={onLogout}
              className="bg-[#020B06] text-slate-400 border border-emerald-900 hover:text-[#FF4D6D] hover:border-[#FF4D6D]/40 font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 text-xs font-game"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>

        {/* XP Progress Bar */}
        <div className="mt-6 pt-6 border-t border-emerald-900/60 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-300 font-bold">XP Progression to Level {(currentUser.level || 1) + 1}</span>
            <span className="text-[#FBBF24] font-bold">{currentUser.xp || 0} Total XP ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-[#020B06] h-2.5 rounded-full overflow-hidden border border-amber-900/60">
            <div 
              className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] h-full rounded-full transition-all duration-500 shadow-sm shadow-amber-500/30"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Squad Loyalty Progress Bar */}
        {(() => {
          const rawLp = typeof loyaltyPointsProp === 'number' ? loyaltyPointsProp : (currentUser?.loyaltyPoints ?? 1000);
          const lp = Math.min(1000, Math.max(0, rawLp));
          const rank = getLoyaltyRank(lp);
          const maxLP = 1000;
          const pct = Math.min(100, Math.max(0, Math.round((lp / maxLP) * 100)));

          return (
            <div className="mt-4 pt-4 border-t border-emerald-900/40 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-bold flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Squad Loyalty ({rank.emoji} {rank.name})</span>
                </span>
                <span className="text-[#FBBF24] font-bold">
                  {lp.toLocaleString()} Total LP ({pct}%)
                </span>
              </div>
              <div className="w-full bg-[#020B06] h-2.5 rounded-full overflow-hidden border border-amber-900/60">
                <div 
                  className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] h-full rounded-full transition-all duration-500 shadow-sm shadow-amber-500/30"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })()}

      </div>

      {/* Real Squad Management Section */}
      {/* Real In-Game Friends & Activity Radar */}
      <section className="bg-[#051C12]/90 backdrop-blur-md border border-emerald-800/40 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 text-left">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/60 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#10B981] text-[#02140D] font-mono font-bold text-xs px-2.5 py-0.5 rounded uppercase mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Network Radar</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-game">
              In-Game Friends & Active Contacts
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Add operatives by Unique Agent ID or Callsign to coordinate multiplayer heists.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-[#020B06] p-1 rounded-xl border border-emerald-900/60 text-xs font-mono">
            <button
              onClick={() => { setFriendsFilter('ALL'); heistAudio.playKeyClick(); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                friendsFilter === 'ALL' ? 'bg-[#10B981] text-[#02140D]' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Friends ({inGameFriends.length})
            </button>
            <button
              onClick={() => { setFriendsFilter('INVITES'); heistAudio.playKeyClick(); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                friendsFilter === 'INVITES' 
                  ? 'bg-[#FBBF24] text-[#02140D]' 
                  : (pendingRequests.length > 0 ? 'text-[#FBBF24] bg-amber-950/40 hover:bg-amber-900/50' : 'text-slate-400 hover:text-white')
              }`}
            >
              <span>Incoming Invites</span>
              {pendingRequests.length > 0 && (
                <span className="bg-[#FF4D6D] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            {pendingSent.length > 0 && (
              <button
                onClick={() => { setFriendsFilter('SENT'); heistAudio.playKeyClick(); }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  friendsFilter === 'SENT' ? 'bg-[#10B981] text-[#02140D]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sent ({pendingSent.length})
              </button>
            )}

            <button
              onClick={async () => {
                heistAudio.playKeyClick();
                setIsFriendsLoading(true);
                try {
                  const data = await friendAPI.list();
                  if (data) {
                    setInGameFriends(data.friends || []);
                    setPendingRequests(data.pendingReceived || []);
                    setPendingSent(data.pendingSent || []);
                    toast.success("Radar frequencies refreshed!");
                  }
                } catch (e) {
                  toast.error("Failed to refresh contacts");
                } finally {
                  setIsFriendsLoading(false);
                }
              }}
              className="p-1.5 text-slate-400 hover:text-[#10B981] hover:bg-emerald-950/60 rounded-lg transition-all"
              title="Refresh Friend Radar"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isFriendsLoading ? 'animate-spin text-[#10B981]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Add Friend Input */}
        <form onSubmit={handleAddFriend} className="flex gap-2 max-w-md">
          <input 
            type="text"
            value={newFriendInput}
            onChange={e => setNewFriendInput(e.target.value)}
            placeholder="Add friend by Agent ID (e.g. VAULT-C1F01A1F) or Callsign..."
            className="flex-1 bg-[#020B06] border border-emerald-800/60 px-3.5 py-2 rounded-lg text-xs text-white placeholder-slate-500 font-mono outline-none focus:border-[#10B981]"
          />
          <button
            type="submit"
            className="bg-[#10B981] text-[#02140D] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#34D399] transition-all uppercase font-game flex items-center space-x-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Send Request</span>
          </button>
        </form>

        {/* Incoming Friend Invites Panel (Always visible when requests exist or tab is active) */}
        {(pendingRequests.length > 0 || friendsFilter === 'INVITES') && (
          <div className="bg-[#0A261B]/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border-2 border-amber-500/40 space-y-3.5 shadow-lg shadow-amber-950/20">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5">
              <h3 className="text-xs sm:text-sm font-mono font-bold text-[#FBBF24] uppercase flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-[#FBBF24]" />
                <span>INCOMING FRIEND INVITES ({pendingRequests.length})</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-300">
                Action required to establish squad link
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <p className="text-xs font-mono text-slate-400 py-3 text-center">
                No pending incoming invites at the moment.
              </p>
            ) : (
              <div className="space-y-2.5">
                {pendingRequests.map((req) => (
                  <div 
                    key={req.id} 
                    className="bg-[#020B06] p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-emerald-900/80 hover:border-amber-500/60 transition-colors"
                  >
                    <div className="flex items-center space-x-3.5">
                      <img 
                        src={req.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                        alt={req.callsign || req.username} 
                        className="w-10 h-10 rounded-xl object-cover border border-emerald-800"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-white font-game">{req.callsign || req.username}</span>
                          <span className="bg-[#10B981]/20 text-[#34D399] font-mono text-[9px] font-bold px-1.5 py-0.2 rounded border border-[#10B981]/30">
                            LVL {req.level || 1}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[11px] text-[#FBBF24] font-mono font-bold">{req.agentId}</span>
                          <span className="text-[10px] text-slate-400 font-mono">• {req.role || 'Operative'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleAcceptFriendRequest(req.id)}
                        className="bg-[#10B981] hover:bg-[#34D399] text-[#02140D] font-bold text-xs px-3.5 py-2 rounded-lg font-game transition-all flex items-center space-x-1.5 shadow-md"
                        title="Accept friend request"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRejectFriendRequest(req.id)}
                        className="bg-[#020B06] hover:bg-[#FF4D6D]/20 text-slate-300 hover:text-[#FF4D6D] border border-emerald-900/80 hover:border-[#FF4D6D]/50 font-bold text-xs px-3 py-2 rounded-lg font-game transition-all flex items-center space-x-1"
                        title="Decline request"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sent Friend Requests (when Sent tab is selected) */}
        {friendsFilter === 'SENT' && (
          <div className="bg-[#020B06] p-4 rounded-xl border border-emerald-900 space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
              Sent Friend Requests ({pendingSent.length})
            </h3>
            {pendingSent.length === 0 ? (
              <p className="text-xs font-mono text-slate-500">No sent requests pending approval.</p>
            ) : (
              <div className="space-y-2">
                {pendingSent.map(sentReq => (
                  <div key={sentReq.id} className="bg-[#041C12] p-3 rounded-lg flex items-center justify-between border border-emerald-900/60">
                    <div className="flex items-center space-x-3">
                      <img src={sentReq.avatar} alt={sentReq.callsign} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <span className="text-white text-xs font-bold font-mono">{sentReq.callsign}</span>
                        <span className="text-[10px] text-amber-300 block font-mono">Awaiting Response</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelSentRequest(sentReq.id)}
                      className="text-xs text-slate-400 hover:text-[#FF4D6D] font-mono px-2 py-1 bg-black/40 rounded border border-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Real Friends List */}
        {inGameFriends.length > 0 ? (
          <div className="space-y-2.5">
            {inGameFriends.map(friend => (
              <div 
                key={friend.id}
                className="p-3.5 sm:p-4 bg-[#041C12]/70 border border-emerald-900/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#10B981]/60 hover:bg-[#07281A] transition-all group"
              >
                <div className="flex items-center space-x-3.5 min-w-[240px]">
                  <div className="relative">
                    <img 
                      src={friend.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'} 
                      alt={friend.callsign || friend.username} 
                      className="w-10 h-10 rounded-xl object-cover border border-emerald-800"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#020B06] bg-[#10B981]" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm sm:text-base text-white font-game group-hover:text-[#10B981] transition-colors">
                        {friend.callsign || friend.username}
                      </h4>
                      {friend.agentId && (
                        <span className="text-[10px] font-mono text-[#FBBF24] bg-[#020B06] px-1.5 py-0.2 rounded border border-emerald-950">
                          {friend.agentId}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-[#34D399]">{friend.role || 'Operative'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      heistAudio.playRadioSquelch();
                      onNavigate?.('lobby');
                      toast.info(`🎙️ Connecting squad radio channel for ${friend.callsign || friend.username}...`);
                    }}
                    className="bg-[#042416] hover:bg-[#073621] text-[#34D399] border border-emerald-700 font-bold text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center space-x-1 font-game shadow-sm"
                    title="Open Voice & Radio Comms"
                  >
                    <Radio className="w-3 h-3 text-[#10B981]" />
                    <span>Talk</span>
                  </button>

                  <button
                    onClick={() => handleInviteFriend(friend)}
                    className="bg-[#020B06] text-emerald-300 border border-emerald-800/80 hover:bg-[#10B981] hover:text-[#02140D] font-bold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 font-game"
                  >
                    <Send className="w-3 h-3" />
                    <span>Invite to Squad</span>
                  </button>
                  <button
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="p-1.5 text-slate-500 hover:text-[#FF4D6D] bg-[#020B06] border border-emerald-900/60 rounded-lg transition-colors"
                    title="Remove Friend"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#020B06] border border-dashed border-emerald-900 rounded-xl p-8 text-center space-y-3">
            <div className="w-10 h-10 bg-[#041910] text-slate-400 flex items-center justify-center mx-auto rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase text-white font-game">No Operative Contacts Linked Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-mono">
                Enter an operative's Callsign or Unique Agent ID above to establish encrypted squad frequencies.
              </p>
            </div>
          </div>
        )}

      </section>

      {/* Discipline Mastery & Real Mission Archive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* Real Mission Archive */}
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
              {realHistory.length} Recorded
            </span>
          </div>

          {realHistory.length > 0 ? (
            <div className="space-y-2.5 font-mono text-xs">
              {realHistory.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  className="p-3 bg-[#020B06] border border-emerald-900/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-[#10B981]/60 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="bg-[#10B981] text-[#02140D] font-bold text-[10px] px-2 py-0.5 rounded">
                        {item.result || 'COMPLETED'}
                      </span>
                      <span className="text-white font-bold text-sm font-game">{item.mission || item.heistTitle || 'Sylvan Operation'}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Role: <span className="text-emerald-300 font-bold">{item.role || currentUser.role}</span> • {item.date || new Date().toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-amber-300 font-bold text-sm block">+{item.xp || item.xpEarned || 250} XP</span>
                      <span className="text-[10px] text-slate-400">Time: {item.time || '4m 12s'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#020B06] border border-dashed border-emerald-900 rounded-xl p-8 text-center space-y-3">
              <div className="w-10 h-10 bg-[#041910] text-slate-400 flex items-center justify-center mx-auto rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase text-white font-game">No Operations Completed Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto font-mono">
                  Launch an operation in Solo or Multiplayer mode to record mission telemetry, XP earned, and skill mastery.
                </p>
              </div>
              <button
                onClick={() => onStartHeist(0)}
                className="bg-[#10B981] text-[#02140D] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#34D399] uppercase font-game"
              >
                Launch First Heist
              </button>
            </div>
          )}
        </div>

        {/* ── Syndicate Trophy Case & Achievements Cabinet ── */}
        <div className="lg:col-span-4 bg-[#051C12]/90 backdrop-blur-md border-2 border-emerald-800/50 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 text-left">
          {/* Header */}
          <div className="border-b border-emerald-900/60 pb-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center space-x-1.5 text-xs font-mono font-black text-[#FBBF24] uppercase">
                <Trophy className="w-4 h-4 text-[#FBBF24]" />
                <span>TROPHY CASE</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-[#020B06] px-2 py-0.5 rounded border border-emerald-900/60">
                16 MEDALS TOTAL
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black uppercase text-white font-game mt-1">
              Syndicate Achievements
            </h3>
            
            {/* Overall Progress */}
            {(() => {
              const unlockedSet = new Set([
                ...(currentUser?.achievements || []),
                ...(currentUser?.badges || [])
              ]);
              const unlockedCount = ACHIEVEMENTS.filter(
                a => unlockedSet.has(a.id) || unlockedSet.has(a.title)
              ).length;
              const percent = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);

              return (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400 font-bold">{unlockedCount} of {ACHIEVEMENTS.length} Unlocked</span>
                    <span className="text-[#10B981] font-black">{percent}% Completion</span>
                  </div>
                  <div className="w-full bg-[#020B06] h-1.5 rounded-full overflow-hidden border border-emerald-950">
                    <div 
                      className="bg-gradient-to-r from-[#10B981] to-[#FBBF24] h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { id: 'ALL', label: 'All (16)' },
              { id: 'UNLOCKED', label: 'Unlocked' },
              { id: 'SPEED', label: 'Speed' },
              { id: 'MASTERY', label: 'Mastery' },
              { id: 'SQUAD', label: 'Squad' },
              { id: 'PROGRESSION', label: 'Rank' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  setAchievementFilter(f.id);
                  try { heistAudio.playKeyClick(); } catch {}
                }}
                className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded transition-all uppercase ${
                  achievementFilter === f.id
                    ? 'bg-[#10B981] text-[#02140D] shadow-[2px_2px_0px_#020C07] font-black'
                    : 'bg-[#020B06] text-slate-400 hover:text-white border border-emerald-950 hover:border-emerald-800/60'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Medals List */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {(() => {
              const unlockedSet = new Set([
                ...(currentUser?.achievements || []),
                ...(currentUser?.badges || [])
              ]);

              const filtered = ACHIEVEMENTS.filter(a => {
                const isUnlocked = unlockedSet.has(a.id) || unlockedSet.has(a.title);
                if (achievementFilter === 'UNLOCKED') return isUnlocked;
                if (achievementFilter === 'SPEED') return a.category === 'speed';
                if (achievementFilter === 'MASTERY') return a.category === 'mastery';
                if (achievementFilter === 'SQUAD') return a.category === 'squad';
                if (achievementFilter === 'PROGRESSION') return a.category === 'progression';
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="bg-[#020B06] p-6 rounded-xl border border-dashed border-emerald-900/60 text-center text-slate-400 text-xs font-mono">
                    No achievements match this filter yet.
                  </div>
                );
              }

              return filtered.map(item => {
                const Icon = item.icon || Award;
                const isUnlocked = unlockedSet.has(item.id) || unlockedSet.has(item.title);
                const tier = ACHIEVEMENT_TIERS[item.tier] || ACHIEVEMENT_TIERS.BRONZE;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setInspectingAchievement(item);
                      try { heistAudio.playKeyClick(); } catch {}
                    }}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden flex items-start space-x-3 ${
                      isUnlocked
                        ? 'bg-[#0A261B] border-[#10B981]/50 shadow-[0_0_12px_rgba(16,185,129,0.15)] hover:border-[#10B981]'
                        : 'bg-[#020B06]/90 border-emerald-950/60 opacity-60 hover:opacity-90 hover:border-emerald-900/80'
                    }`}
                  >
                    {/* Badge Icon */}
                    <div 
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 shadow-sm ${
                        isUnlocked ? tier.bg : 'bg-[#04160E]'
                      }`}
                      style={{ borderColor: isUnlocked ? tier.color : '#0B3824' }}
                    >
                      <Icon 
                        className="w-4 h-4" 
                        style={{ color: isUnlocked ? tier.color : '#475569' }} 
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center space-x-1.5 truncate">
                          <h4 className={`text-xs font-black uppercase truncate font-game ${
                            isUnlocked ? 'text-white' : 'text-slate-400'
                          }`}>
                            {item.title}
                          </h4>
                          <span 
                            className="text-[8px] font-mono font-bold uppercase px-1 py-0.2 rounded border flex-shrink-0"
                            style={{ 
                              color: isUnlocked ? tier.color : '#64748B', 
                              borderColor: isUnlocked ? `${tier.color}50` : '#1E293B' 
                            }}
                          >
                            {tier.label}
                          </span>
                        </div>

                        {/* Unlocked / Locked Icon */}
                        {isUnlocked ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                        ) : (
                          <Lock className="w-3 h-3 text-slate-600 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-emerald-100/75 leading-tight mt-0.5 line-clamp-2">
                        {isUnlocked ? item.description : item.hint}
                      </p>

                      <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-[#FBBF24] font-bold">
                          +{item.xpReward} XP
                        </span>
                        <span className={isUnlocked ? 'text-[#34D399] font-black' : 'text-slate-500'}>
                          {isUnlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Achievement Inspection Modal */}
        {inspectingAchievement && (() => {
          const item = inspectingAchievement;
          const tier = ACHIEVEMENT_TIERS[item.tier] || ACHIEVEMENT_TIERS.BRONZE;
          const Icon = item.icon || Award;
          const unlockedSet = new Set([
            ...(currentUser?.achievements || []),
            ...(currentUser?.badges || [])
          ]);
          const isUnlocked = unlockedSet.has(item.id) || unlockedSet.has(item.title);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020B06]/85 backdrop-blur-md animate-fade-in text-left">
              <div 
                className="forest-card max-w-sm w-full p-5 space-y-4 border-[3px] border-[#03140C] bg-[#051811] shadow-[8px_8px_0px_#020C07] rounded-xl relative overflow-hidden"
                style={{
                  boxShadow: `8px 8px 0px #020C07, 0 0 25px ${tier.glow}`
                }}
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: tier.color }}
                />

                <div className="flex items-start space-x-3 pt-1">
                  <div 
                    className="w-12 h-12 rounded-xl border-2 flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: isUnlocked ? tier.bg : '#020B06',
                      borderColor: tier.color
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: tier.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span 
                        className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border"
                        style={{ color: tier.color, borderColor: `${tier.color}60` }}
                      >
                        {tier.label} Tier
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white uppercase font-game mt-1 leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="p-3 bg-[#020B06] border border-emerald-950 rounded-lg space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block font-bold">Requirement:</span>
                    <p className="text-emerald-100 text-xs mt-0.5">{item.description}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block font-bold">Tactical Hint:</span>
                    <p className="text-emerald-300/80 text-[11px] mt-0.5">{item.hint}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs font-mono">
                  <span className="bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/50 px-2.5 py-1 rounded font-black">
                    +{item.xpReward} XP BOUNTY
                  </span>
                  <span className={`font-black uppercase ${isUnlocked ? 'text-[#10B981]' : 'text-slate-500'}`}>
                    {isUnlocked ? '✓ Status: Unlocked' : '🔒 Status: Incomplete'}
                  </span>
                </div>

                <button
                  onClick={() => setInspectingAchievement(null)}
                  className="w-full bg-[#10B981] text-[#02140D] font-mono font-black text-xs py-2 border-2 border-[#03140C] shadow-[2px_2px_0px_#020C07] hover:bg-[#34D399] uppercase transition-all rounded"
                >
                  Close Briefing
                </button>
              </div>
            </div>
          );
        })()}

      </div>

    </div>
  );
}
