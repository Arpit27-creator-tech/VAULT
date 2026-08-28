import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Award, Zap, Activity, Clock, Users, Play, 
  Terminal, FlaskConical, Key, Sparkles, CheckCircle2, 
  TrendingUp, LogOut, Lock, ArrowUpRight, ArrowLeft, Compass,
  UserPlus, Copy, Check, Share2, Crown, Radio, Circle,
  Plus, MessageSquare, Eye, Send, Swords, UserX, RotateCw,
  Camera, Upload, Image as ImageIcon
} from 'lucide-react';
import { heistAudio } from './HeistAudioEngine';
import { toast } from 'sonner';
import { friendAPI, teamAPI, userAPI } from '../services/api';

export default function StatsDashboard({ currentUser, onLogout, onStartHeist, onNavigate, onUpdateUser }) {
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
          const histData = await userAPI.getHistory(currentUser.id);
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
  const currentXpInLevel = (currentUser.xp || 0) % 1000;
  const progressPercent = Math.min(100, Math.round((currentXpInLevel / 1000) * 100));

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
            
            {/* Interactive Avatar with Device Upload Trigger */}
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img 
                src={userAvatar || currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'} 
                alt={currentUser.callsign} 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#10B981] shadow-lg shadow-emerald-950/60 group-hover:border-[#34D399] transition-all group-hover:scale-105"
              />
              
              {/* Hover / Active Camera Upload Overlay */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white space-y-1">
                <Camera className={`w-5 h-5 text-[#10B981] ${isUploadingAvatar ? 'animate-spin' : ''}`} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-200">
                  {isUploadingAvatar ? 'Saving...' : 'Change'}
                </span>
              </div>

              {/* Floating Camera Badge Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="absolute -top-1.5 -right-1.5 p-1.5 bg-[#020B06] hover:bg-[#10B981] text-[#34D399] hover:text-[#02140D] border border-emerald-500/60 rounded-full transition-all shadow-md"
                title="Upload Photo from Device"
              >
                <Camera className="w-3 h-3" />
              </button>

              <span className="absolute -bottom-2 -right-2 bg-[#FBBF24] text-[#02140D] text-xs font-black px-2 py-0.5 rounded-full font-game shadow">
                LVL {currentUser.level || 1}
              </span>
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
            <span className="text-emerald-300 font-bold">{currentUser.xp || 0} Total XP ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-[#020B06] h-2.5 rounded-full overflow-hidden border border-emerald-900">
            <div 
              className="bg-gradient-to-r from-[#10B981] to-[#34D399] h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* Real Squad Management Section */}
      <section className="bg-[#051C12]/90 backdrop-blur-md border border-emerald-800/40 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 text-left">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/60 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#FBBF24] text-[#02140D] font-mono font-bold text-xs px-2.5 py-0.5 rounded uppercase mb-1">
              <Crown className="w-3.5 h-3.5" />
              <span>Syndicate Squad</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold uppercase text-white tracking-tight font-game">
              Tactical Squad Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Form persistent crews, share synchronized lobby invite codes, and complete group expeditions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!myTeam && (
              <button
                onClick={() => setIsCreatingTeam(!isCreatingTeam)}
                className="bg-[#020B06] text-[#FBBF24] border border-amber-500/40 hover:bg-[#07281A] font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 font-game transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{isCreatingTeam ? 'Cancel' : 'Create Squad'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Create Squad Form */}
        {isCreatingTeam && (
          <form onSubmit={handleCreateTeamSubmit} className="bg-[#020B06] p-5 rounded-xl border border-emerald-800/80 space-y-4 animate-fade-in">
            <h3 className="text-sm font-bold uppercase text-[#FBBF24] font-game">Register New Syndicate Squad</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <input
                type="text"
                required
                placeholder="Squad Name (e.g. Quantum Breakers)"
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                className="bg-[#041C12] border border-emerald-800/80 px-3.5 py-2.5 rounded-lg text-white outline-none focus:border-[#10B981]"
              />
              <input
                type="text"
                placeholder="Squad Motto (Optional)"
                value={newTeamMotto}
                onChange={e => setNewTeamMotto(e.target.value)}
                className="bg-[#041C12] border border-emerald-800/80 px-3.5 py-2.5 rounded-lg text-white outline-none focus:border-[#10B981]"
              />
              <select
                value={newTeamEmblem}
                onChange={e => setNewTeamEmblem(e.target.value)}
                className="bg-[#041C12] border border-emerald-800/80 px-3.5 py-2.5 rounded-lg text-white outline-none focus:border-[#10B981]"
              >
                <option value="🌲">🌲 Forest Rangers</option>
                <option value="⚡">⚡ Lightning Strikers</option>
                <option value="🔮">🔮 Quantum Cryptographers</option>
                <option value="🦅">🦅 Valkyrie Squadron</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-[#10B981] text-[#02140D] font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-[#34D399] uppercase font-game transition-all"
            >
              Confirm Squad Registration
            </button>
          </form>
        )}

        {/* Real Team Display or Honest Empty State */}
        {myTeam ? (
          <div className="space-y-4">
            <div className="bg-[#020B06] p-4 sm:p-5 rounded-xl border border-emerald-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#041C12] border border-emerald-800 flex items-center justify-center text-2xl flex-shrink-0">
                  {myTeam.emblem || '🌲'}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-white font-game">{myTeam.name}</h3>
                    <span className="text-[10px] font-mono font-bold bg-[#10B981]/20 text-[#34D399] px-2 py-0.5 rounded border border-[#10B981]/40">
                      {(myTeam.members || []).length || 1}/4 OPERATIVES
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{myTeam.motto || 'Active Syndicate Cell'}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => {
                    heistAudio.playRadioSquelch();
                    onNavigate?.('lobby');
                    toast.info("🎙️ Opening Squad Lobby & Voice Comms Channel...");
                  }}
                  className="bg-[#042416] hover:bg-[#073621] text-[#34D399] border border-emerald-600 font-bold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center space-x-1.5 font-game shadow-md"
                  title="Open Voice Comms & Talk with Squad"
                >
                  <Radio className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
                  <span>Talk With Team</span>
                </button>

                {myTeam.inviteCode && (
                  <>
                    <div className="bg-[#041C12] px-3 py-2 rounded-lg border border-emerald-800/60 font-mono text-xs text-[#FBBF24] select-all">
                      CODE: {myTeam.inviteCode}
                    </div>
                    <button
                      onClick={handleCopyInviteLink}
                      className="bg-[#10B981] text-[#02140D] font-bold text-xs px-3.5 py-2 rounded-lg hover:bg-[#34D399] transition-all flex items-center space-x-1.5 flex-shrink-0 font-game"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied!' : 'Copy Invite'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {(myTeam.members || [
                { name: currentUser.callsign, role: currentUser.role, isLeader: true, avatar: currentUser.avatar }
              ]).map((member, slotIdx) => (
                <div 
                  key={slotIdx}
                  className="bg-[#041C12] border border-emerald-800/60 rounded-xl p-4 flex items-center space-x-3 shadow-md"
                >
                  <img 
                    src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
                    alt={member.name || member.callsign} 
                    className="w-10 h-10 rounded-lg object-cover border border-emerald-700" 
                  />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-bold text-sm text-white truncate font-game">{member.name || member.callsign}</h4>
                      {member.isLeader && <Crown className="w-3 h-3 text-[#FBBF24] flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] font-mono text-[#34D399] truncate">{member.role}</p>
                    <span className="text-[9px] font-mono text-emerald-400 bg-[#020B06] px-1.5 py-0.2 rounded inline-block mt-1">
                      {member.isLeader ? 'Squad Captain' : 'Active Member'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#020B06] border border-dashed border-emerald-900 rounded-xl p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-[#041910] text-[#10B981] flex items-center justify-center mx-auto rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold uppercase text-white font-game">Not Enrolled in a Syndicate Squad</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto font-mono">
                You are currently operating as an independent agent. Create your own squad or join an existing squad with an invite code.
              </p>
            </div>

            <form onSubmit={handleJoinTeamSubmit} className="flex max-w-sm mx-auto gap-2 pt-2">
              <input
                type="text"
                value={joinTeamCode}
                onChange={e => setJoinTeamCode(e.target.value.toUpperCase())}
                placeholder="Enter Invite Code (e.g. SYNDICATE-XXXX)"
                className="flex-1 bg-[#041C12] border border-emerald-800/60 px-3 py-2 rounded-lg text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-[#10B981]"
              />
              <button
                type="submit"
                className="bg-[#10B981] text-[#02140D] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#34D399] uppercase font-game"
              >
                Join Squad
              </button>
            </form>
          </div>
        )}

      </section>

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

        {/* Real Badges Cabinet */}
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
            {badges.length > 0 ? (
              badges.map((badge, idx) => (
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
              ))
            ) : (
              <div className="bg-[#020B06] p-6 rounded-xl border border-dashed border-emerald-900 text-center text-slate-400 text-xs font-mono">
                No medals earned yet. Crack security chambers with high accuracy to earn syndicate medals.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
