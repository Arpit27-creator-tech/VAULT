import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { 
  ShieldAlert, Sparkles, Users, MapPin, BookOpen, Rocket, Scroll, Zap, 
  Lock, Unlock, Play, CheckCircle2, Trophy, Clock, UserPlus, Compass, 
  Radio, Terminal, ChevronRight, Award, Star, AlertTriangle, Flame, RefreshCw, Volume2, VolumeX,
  Video, VideoOff, Eye, Sliders, Sun, Trees, Flower2, Leaf, FlaskConical, Key, Activity, Send, ArrowRight, Plus,
  Menu, X, PanelLeftClose, PanelLeftOpen, ArrowLeft, LogOut, Home, BarChart3, User, UserCheck, LogIn,
  Mic, MicOff, Headphones, PhoneCall, PhoneOff, Copy, Check, Share2, Globe, Shield, RefreshCw as RefreshIcon
} from 'lucide-react';
import bgVideo from './assets/backgroundnew.mp4';
import { 
  initialMissions, 
  initialCharacters, 
  initialTopics, 
  initialLobby, 
  triviaQuestions,
  FALLBACK_SUBJECT_IMG,
  FALLBACK_AVATAR_IMG
} from './data/initialData';
import { heistStages } from './data/heistPuzzles';
import { heistAudio } from './components/HeistAudioEngine';
import HackerTerminal from './components/HackerTerminal';
import EngineerLaserGrid from './components/EngineerLaserGrid';
import ScientistLab from './components/ScientistLab';
import CryptographerDeck from './components/CryptographerDeck';
import InterdependenceMatrix from './components/InterdependenceMatrix';
import RadioComms from './components/RadioComms';
import SkillAnalyticsModal from './components/SkillAnalyticsModal';
import { voiceEngine } from './services/voiceEngine';
import CreateCustomHeistModal from './components/CreateCustomHeistModal';
import RemediationRoadmapModal from './components/RemediationRoadmapModal';
import HeroPage from './components/HeroPage';
import AuthModal from './components/AuthModal';
import StatsDashboard from './components/StatsDashboard';
import GraphicalRoadmap from './components/GraphicalRoadmap';
import OperativeDirectoryModal from './components/OperativeDirectoryModal';
import SquadRecruitmentBoard from './components/SquadRecruitmentBoard';
import { authAPI, heistAPI, missionAPI, leaderboardAPI, friendAPI } from './services/api.js';
import { connectSocket, disconnectSocket, onSocketEvent, offSocketEvent, getSocket, lobbySocket, heistSocket } from './services/socket.js';

// Specialist role configurations for multiplayer synchronization
const ROLE_CONFIGS = [
  { key: 'hacker', label: 'The Hacker', title: 'Canopy Hacker', charId: 'c1', discipline: 'CS & Logic', color: '#10B981' },
  { key: 'engineer', label: 'The Engineer', title: 'Laser Specialist', charId: 'c2', discipline: 'Physics & Optics', color: '#FBBF24' },
  { key: 'scientist', label: 'The Scientist', title: 'Botanical Chemist', charId: 'c3', discipline: 'Chemistry & Biology', color: '#06B6D4' },
  { key: 'cryptographer', label: 'The Cryptographer', title: 'Cipher Specialist', charId: 'c4', discipline: 'Math & Ciphers', color: '#C084FC' }
];

function normalizeRoleKey(role) {
  if (!role) return 'hacker';
  const r = role.toLowerCase();
  if (r.includes('hacker')) return 'hacker';
  if (r.includes('engineer') || r.includes('laser') || r.includes('safecracker')) return 'engineer';
  if (r.includes('scientist') || r.includes('chemist') || r.includes('flora')) return 'scientist';
  if (r.includes('crypto') || r.includes('cipher') || r.includes('infiltrator')) return 'cryptographer';
  return 'hacker';
}

export default function App() {
  const activeSocket = getSocket() || connectSocket();
  const [activeTab, setActiveTab] = useState('home');
  const [tabHistory, setTabHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isEndHeistModalOpen, setIsEndHeistModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vault_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [missions, setMissions] = useState(() => {
    try {
      const saved = localStorage.getItem('kh_missions_subject_v4');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialMissions;
    } catch {
      return initialMissions;
    }
  });
  const [characters] = useState(initialCharacters || []);
  const [topics] = useState(initialTopics || []);
  const [lobby, setLobby] = useState(initialLobby);

  const [isLobbyVoiceConnected, setIsLobbyVoiceConnected] = useState(false);
  const [isLobbyMicMuted, setIsLobbyMicMuted] = useState(false);
  const [isLobbyDeafened, setIsLobbyDeafened] = useState(false);
  const [speakingPlayerSlot, setSpeakingPlayerSlot] = useState(1);
  const [micVolumeBars, setMicVolumeBars] = useState([8, 14, 10, 18, 12, 16, 10, 12]);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  useEffect(() => {
    const unsubVol = voiceEngine.onVolume((bars) => setMicVolumeBars(bars));
    const unsubSpk = voiceEngine.onSpeaking((speaking) => setIsUserSpeaking(speaking));
    return () => {
      unsubVol();
      unsubSpk();
    };
  }, []);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bgVideoActive, setBgVideoActive] = useState(true);
  const [bgDimMode, setBgDimMode] = useState('vivid'); 
  const videoRef = useRef(null);
  const [isCustomHeistModalOpen, setIsCustomHeistModalOpen] = useState(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [allStages, setAllStages] = useState(heistStages);

  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [activeCockpitRole, setActiveCockpitRole] = useState('hacker');
  const [stageSolvedRoles, setStageSolvedRoles] = useState({
    1: {},
    2: {},
    3: {},
    99: {}
  });
  const [stageRoleClues, setStageRoleClues] = useState({
    1: {},
    2: {},
    3: {},
    99: {}
  });
  const [alarmLevel, setAlarmLevel] = useState('LOW_SECURITY'); 
  const [alarmFails, setAlarmFails] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [radioMessages, setRadioMessages] = useState([
    { sender: "Sylvan HQ", role: "hq", text: "Expedition crew deployed. Interlock sequence initialized. Coordinate all 4 roles!", time: "00:01" },
    { sender: "Scientist Cleo", role: "scientist", text: "Analyzing compound stoichiometry now. Will transmit optical density to Engineer.", time: "00:04" }
  ]);
  const lobbyChatEndRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'lobby') {
      lobbyChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [radioMessages, activeTab]);

  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [isMatchVictory, setIsMatchVictory] = useState(true);
  const [analyticsStats, setAnalyticsStats] = useState({
    hackerXp: 450,
    engineerXp: 450,
    scientistXp: 450,
    cryptoXp: 450,
    timeElapsed: "1m 18s",
    accuracy: "96%",
    alarmsTripped: 0
  });

  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isAgentDirectoryOpen, setIsAgentDirectoryOpen] = useState(false);
  const [isJoinRoomModalOpen, setIsJoinRoomModalOpen] = useState(false);
  const [joinRoomCodeInput, setJoinRoomCodeInput] = useState('');
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [createRoomTitleInput, setCreateRoomTitleInput] = useState('');
  const [isInSquadRoom, setIsInSquadRoom] = useState(false);
  const [isLeaveSquadModalOpen, setIsLeaveSquadModalOpen] = useState(false);
  const [isLaunchingCountdown, setIsLaunchingCountdown] = useState(false);
  const [launchCountdown, setLaunchCountdown] = useState(3);
  const [lobbyRadioInput, setLobbyRadioInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [emailInput, setEmailInput] = useState('');
  const [crewNameInput, setCrewNameInput] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [targetSlotId, setTargetSlotId] = useState(null);
  const [joinPlayerName, setJoinPlayerName] = useState('');
  const [joinRole, setJoinRole] = useState('The Hacker');
  const [joinCharacterId, setJoinCharacterId] = useState('c1');

  const [unlockedRooms, setUnlockedRooms] = useState(() => {
    try {
      const saved = localStorage.getItem('kh_unlocked_rooms_sylvan');
      return saved ? JSON.parse(saved) : [1];
    } catch {
      return [1];
    }
  });
  const [activeRoom, setActiveRoom] = useState(1);
  const [roomSolved, setRoomSolved] = useState(() => {
    try {
      const saved = localStorage.getItem('kh_room_solved_sylvan');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [xp, setXp] = useState(() => {
    try {
      const saved = localStorage.getItem('kh_xp_sylvan');
      return saved ? parseInt(saved, 10) : 1200;
    } catch {
      return 1200;
    }
  });
  const [streak, setStreak] = useState(() => {
    try {
      const saved = localStorage.getItem('kh_streak_sylvan');
      return saved ? parseInt(saved, 10) : 3;
    } catch {
      return 3;
    }
  });
  const [leaderboard, setLeaderboard] = useState(() => {
    try {
      const saved = localStorage.getItem('kh_leaderboard_sylvan');
      return saved ? JSON.parse(saved) : [
        { name: 'You (Explorer)', xp: 1200, streak: 3 },
        { name: 'Captain Bramble', xp: 2450, streak: 5 },
        { name: 'Dr. Cleo', xp: 1900, streak: 4 },
        { name: 'Shadow Nyx', xp: 1720, streak: 3 }
      ];
    } catch {
      return [
        { name: 'You (Explorer)', xp: 1200, streak: 3 },
        { name: 'Captain Bramble', xp: 2450, streak: 5 },
        { name: 'Dr. Cleo', xp: 1900, streak: 4 },
        { name: 'Shadow Nyx', xp: 1720, streak: 3 }
      ];
    }
  });
  const [showFinale, setShowFinale] = useState(false);
  const [builderSaving, setBuilderSaving] = useState(false);
  const [builder, setBuilder] = useState({ 
    title: '', 
    category: 'Forest Botany & Lore', 
    difficulty: 'Medium', 
    reward: '5,000 XP & Leaf Star', 
    description: '', 
    question: '', 
    answer: '' 
  });

  // ─── Fullscreen Lock Helpers ───────────────────────────────────
  const enterHeistFullscreen = () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    } catch (e) { /* fullscreen not supported / blocked */ }
  };

  const exitHeistFullscreen = () => {
    try {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else if (document.webkitFullscreenElement) document.webkitExitFullscreen();
    } catch (e) { /* already not fullscreen */ }
  };

  const isHeistLocked = isTimerRunning && activeTab === 'liveheist';

  const navigateToTab = (newTab) => {
    if (newTab === 'login') {
      setIsAuthModalOpen(true);
      heistAudio.playKeyClick();
      return;
    }
    // Block navigation during active heist
    if (isHeistLocked && newTab !== 'liveheist') {
      toast.warning("🔒 Navigation locked! Complete or quit the heist to leave.");
      return;
    }
    const protectedTabs = ['stats', 'builder'];
    if (!currentUser && protectedTabs.includes(newTab)) {
      setIsAuthModalOpen(true);
      toast.info("🔐 Operative clearance required: Sign in with email & password to access this sector.");
      return;
    }
    if (newTab !== activeTab) {
      if (activeTab === 'liveheist' && newTab !== 'liveheist') {
        setIsTimerRunning(false);
        heistAudio.stopTension();
      }
      setTabHistory(prev => [...prev, activeTab]);
      setActiveTab(newTab);
    }
  };

  const handleGoBack = () => {
    // Block back navigation during active heist
    if (isHeistLocked) {
      toast.warning("🔒 Navigation locked! Complete or quit the heist to leave.");
      return;
    }
    heistAudio.playKeyClick();
    if (activeTab === 'liveheist') {
      setIsTimerRunning(false);
      heistAudio.stopTension();
    }
    if (tabHistory.length > 0) {
      const prevTab = tabHistory[tabHistory.length - 1];
      setTabHistory(prev => prev.slice(0, -1));
      setActiveTab(prevTab);
    } else {
      setActiveTab('home');
    }
  };

  const handleConcludeHeist = (actionType = 'abort') => {
    setIsTimerRunning(false);
    heistAudio.stopTension();
    setIsEndHeistModalOpen(false);
    exitHeistFullscreen();

    const stage = allStages[currentStageIdx] || heistStages[0];
    const stageId = stage.stageId || 1;
    const defaultTime = stage.timeLimit || 180;

    if (actionType === 'debrief') {
      heistAudio.playSuccessChime();
      const solved = stageSolvedRoles[stageId] || {};
      const solvedCount = Object.keys(solved).filter(k => solved[k]).length;
      const totalTimeSpent = Math.max(0, defaultTime - timeLeft);
      const timeStr = `${Math.floor(totalTimeSpent / 60)}m ${(totalTimeSpent % 60)}s`;

      setIsMatchVictory(solvedCount > 0);
      setAnalyticsStats({
        hackerXp: solved.hacker ? 350 : 100,
        engineerXp: solved.engineer ? 350 : 100,
        scientistXp: solved.scientist ? 350 : 100,
        cryptoXp: solved.cryptographer ? 350 : 100,
        timeElapsed: timeStr,
        accuracy: alarmFails === 0 ? "100%" : `${Math.max(50, 100 - alarmFails * 10)}%`,
        alarmsTripped: alarmFails
      });

      if (currentUser) {
        const gainedXp = solvedCount > 0 ? 450 : 150;
        const resultLabel = solvedCount > 0 ? 'VICTORY' : 'CONCLUDED';
        const roleLabel = activeCockpitRole === 'hacker' ? 'Canopy Hacker' : activeCockpitRole === 'engineer' ? 'Woodland Engineer' : activeCockpitRole === 'scientist' ? 'Flora Scientist' : 'Mist Cryptographer';
        const newRecord = {
          id: `h-${Date.now()}`,
          mission: stage.title || 'Infiltration Op',
          role: roleLabel,
          result: resultLabel,
          xp: `+${gainedXp} XP`,
          time: timeStr,
          date: 'Just now'
        };
        // Optimistic local update so the UI reflects progress immediately,
        // without waiting on the network round-trip.
        const optimisticUser = {
          ...currentUser,
          xp: currentUser.xp + gainedXp,
          level: Math.floor((currentUser.xp + gainedXp) / 1000) + 1,
          stats: {
            ...currentUser.stats,
            missionsCompleted: (currentUser.stats?.missionsCompleted || 0) + 1,
            vaultsCracked: (currentUser.stats?.vaultsCracked || 0) + solvedCount,
            alarmsTripped: (currentUser.stats?.alarmsTripped || 0) + alarmFails
          },
          history: [newRecord, ...(currentUser.history || [])]
        };
        setCurrentUser(optimisticUser);
        localStorage.setItem('vault_current_user', JSON.stringify(optimisticUser));

        // Persist to the database so XP/level/history are consistent across
        // every device the account logs into, not just this browser tab.
        heistAPI.completeHeist({
          mission_title: stage.title || 'Infiltration Op',
          role: activeCockpitRole || 'hacker',
          result: resultLabel,
          xp_earned: gainedXp,
          time_elapsed: timeStr,
          accuracy: alarmFails === 0 ? '100%' : `${Math.max(50, 100 - alarmFails * 10)}%`,
          alarms_tripped: alarmFails,
          vaults_cracked: solvedCount
        }).then((res) => {
          if (res?.user) {
            // Reconcile with the server's authoritative xp/level in case
            // of any drift, while keeping locally-tracked fields like history.
            setCurrentUser(prev => {
              const reconciled = { ...prev, ...res.user, history: prev?.history };
              localStorage.setItem('vault_current_user', JSON.stringify(reconciled));
              return reconciled;
            });
          }
        }).catch((err) => {
          console.error('[HEIST] Failed to persist results to server:', err);
          toast.error('Could not save mission results to your account. Progress may not sync across devices.');
        });
      }

      setTimeLeft(defaultTime);
      setAlarmLevel('LOW_SECURITY');
      setAlarmFails(0);

      setAnalyticsModalOpen(true);
      toast.success("📊 Operation Concluded. Generating Tactical Debrief & Skill Analytics.");
    } else {
      heistAudio.playRadioSquelch();
      setTimeLeft(defaultTime);
      setAlarmLevel('LOW_SECURITY');
      setAlarmFails(0);

      toast.info("🚁 Emergency Exfiltration Confirmed. Mission timer reset to full duration.");
      setActiveTab('home');
    }
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('vault_current_user', JSON.stringify(userData));
    setSidebarCollapsed(false);
    // Connect to Socket.io after successful login
    try { connectSocket(); } catch (e) { /* socket optional */ }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vault_current_user');
    localStorage.removeItem('vault_guest_id');
    localStorage.removeItem('vault_guest_name');
    authAPI.logout();
    disconnectSocket();
    setActiveTab('home');
    setTabHistory([]);
    setIsAuthModalOpen(false);
    toast.info("👋 Signed out. Welcome to the Syndicate Public Gateway.");
  };

  // Auto-login from JWT token on mount if returning user
  useEffect(() => {
    if (!currentUser && authAPI.isAuthenticated()) {
      authAPI.getMe().then(data => {
        if (data?.user) {
          setCurrentUser(data.user);
          localStorage.setItem('vault_current_user', JSON.stringify(data.user));
          try { connectSocket(); } catch (e) { /* socket optional */ }
        }
      }).catch(() => {
        // Token expired or invalid — clean up
        authAPI.logout();
      });
    } else if (currentUser) {
      // Connect socket for existing session
      try { connectSocket(); } catch (e) { /* socket optional */ }
    }

    // Listen for auth expiration events from API service
    const handleAuthExpired = () => {
      setCurrentUser(null);
      setActiveTab('home');
      toast.warning('🔒 Session expired. Please sign in again.');
    };
    window.addEventListener('vault:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('vault:auth-expired', handleAuthExpired);
  }, []);

  // Real-Time Socket Event Subscriptions & Live Room Sync
  useEffect(() => {
    // Check for room parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      const code = roomParam.trim().toUpperCase();
      lobbySocket.get(code, (res) => {
        if (res?.lobby) {
          setLobby(res.lobby);
          setActiveTab('lobby');
          toast.success(`Joined squad room ${code}!`);
        }
      });
    }

    // Hydrate missions from REST API if available
    missionAPI.list().then(data => {
      if (data?.missions && data.missions.length > 0) {
        setMissions(data.missions);
      }
    }).catch(() => { /* offline fallback */ });

    // Socket Connection Status
    const handleConnected = () => {
      setIsSocketConnected(true);
      if (lobby?.code) {
        lobbySocket.get(lobby.code, (res) => {
          if (res?.lobby) setLobby(res.lobby);
        });
      }
    };

    const handleDisconnected = () => {
      setIsSocketConnected(false);
    };

    // Lobby Events
    const handleLobbyState = (newLobby) => {
      if (newLobby && Array.isArray(newLobby.players)) {
        setLobby(newLobby);
      }
    };

    const handleLobbyPlayerJoined = (data) => {
      toast.success(`Operative ${data.username} joined slot 0${data.slotId} (${data.role})!`);
      heistAudio.playSuccessChime();
    };

    const handleLobbyPlayerLeft = (data) => {
      toast.info(`Operative ${data.username} vacated slot 0${data.slotId}`);
    };

    const handleLobbyPlayerReady = (data) => {
      toast.info(`${data.username} is ${data.isReady ? 'READY' : 'NOT READY'}`);
    };

    const handleLobbyRoleChanged = (data) => {
      toast.info(`${data.username} switched role to ${data.role}`);
    };

    const handleLobbyHostChanged = (data) => {
      toast.info(`Squad host reassigned to ${data.newHost}`);
    };

    const handleLobbyKicked = (data) => {
      toast.error(data.message || 'You have been removed from the squad.');
      setActiveTab('home');
    };

    const handleLobbyStarting = (data) => {
      setIsLaunchingCountdown(true);
      setLaunchCountdown(data.countdown || 3);
      heistAudio.playRadioSquelch();
      let cnt = data.countdown || 3;
      const cntInterval = setInterval(() => {
        cnt -= 1;
        if (cnt > 0) {
          setLaunchCountdown(cnt);
          heistAudio.playKeyClick();
        } else {
          clearInterval(cntInterval);
        }
      }, 1000);
    };

    const handleLobbyError = (data) => {
      if (data?.message) toast.error(data.message);
    };

    // Live Heist Events
    const handleHeistStarted = (data) => {
      setIsLaunchingCountdown(false);
      toast.success("🚀 Squad launch confirmed! Entering live cockpit.");
      
      const currentLobby = data?.lobby || lobby;
      const myId = currentUser?.id || localStorage.getItem('vault_guest_id');
      const myName = currentUser?.username || localStorage.getItem('vault_guest_name');
      const mySlot = currentLobby?.players?.find(p => (p.userId && p.userId === myId) || (myName && p.username === myName));
      const assignedRole = mySlot?.role ? normalizeRoleKey(mySlot.role) : 'hacker';
      
      handleStartHeistStage(0, false, assignedRole);
    };

    const handleRemotePuzzleSolved = (data) => {
      if (data?.role) {
        const stage = allStages[currentStageIdx] || heistStages[0];
        const sId = stage.stageId || 1;
        setStageSolvedRoles(prev => ({
          ...prev,
          [sId]: { ...(prev[sId] || {}), [data.role]: true }
        }));
        if (data.clue) {
          setStageRoleClues(prev => ({
            ...prev,
            [sId]: { ...(prev[sId] || {}), [data.role]: data.clue }
          }));
        }
        heistAudio.playSuccessChime();
        toast.success(`🔓 ${data.role.toUpperCase()} puzzle solved by ${data.solvedBy || 'teammate'}!`);
      }
    };

    const handleRemotePuzzleFailed = (data) => {
      if (data) {
        if (data.alarmFails !== undefined) setAlarmFails(data.alarmFails);
        if (data.alarmLevel) setAlarmLevel(data.alarmLevel);
        if (data.timeLeft !== undefined) setTimeLeft(data.timeLeft);
        heistAudio.playAlarmChime();
        toast.error(`🚨 ALARM ESCALATED by ${data.failedBy || 'teammate'}: ${data.reason}`);
      }
    };

    const handleRemoteRadioMessage = (msg) => {
      if (msg?.text) {
        setRadioMessages(prev => {
          const last = prev[prev.length - 1];
          if (
            last && 
            last.text === msg.text && 
            last.sender === msg.sender && 
            (last.time === msg.time || !last.time || !msg.time)
          ) {
            return prev;
          }
          return [...prev, msg];
        });
        heistAudio.playRadioSquelch();
      }
    };

    const handleTimerTick = (data) => {
      if (data?.timeLeft !== undefined) setTimeLeft(data.timeLeft);
      if (data?.alarmLevel) setAlarmLevel(data.alarmLevel);
    };

    const handleRemoteStageSynced = (data) => {
      if (data) {
        setCurrentStageIdx(data.stageIdx || 0);
        setTimeLeft(data.timeLimit || 180);
        setAlarmLevel('LOW_SECURITY');
        setAlarmFails(0);
        toast.success(`Advancing to Stage ${(data.stageIdx || 0) + 1} synchronously!`);
      }
    };

    const handleLobbyVoiceUpdate = (data) => {
      if (data?.slotId) {
        setLobby(prev => {
          if (!prev?.players) return prev;
          const updatedPlayers = prev.players.map(p => {
            if (p.slotId === data.slotId || p.userId === data.userId) {
              return { ...p, voiceState: data.voiceState };
            }
            return p;
          });
          return { ...prev, players: updatedPlayers };
        });
      }
    };

    onSocketEvent('connected', handleConnected);
    onSocketEvent('disconnected', handleDisconnected);
    onSocketEvent('lobbyState', handleLobbyState);
    onSocketEvent('lobbyPlayerJoined', handleLobbyPlayerJoined);
    onSocketEvent('lobbyPlayerLeft', handleLobbyPlayerLeft);
    onSocketEvent('lobbyPlayerReady', handleLobbyPlayerReady);
    onSocketEvent('lobbyRoleChanged', handleLobbyRoleChanged);
    onSocketEvent('lobbyHostChanged', handleLobbyHostChanged);
    onSocketEvent('lobbyKicked', handleLobbyKicked);
    onSocketEvent('lobbyStarting', handleLobbyStarting);
    onSocketEvent('lobbyVoiceUpdate', handleLobbyVoiceUpdate);
    onSocketEvent('lobbyError', handleLobbyError);
    onSocketEvent('heistStarted', handleHeistStarted);
    onSocketEvent('heistPuzzleSolved', handleRemotePuzzleSolved);
    onSocketEvent('heistPuzzleFailed', handleRemotePuzzleFailed);
    onSocketEvent('lobbyRadioMessage', handleRemoteRadioMessage);
    onSocketEvent('heistRadioMessage', handleRemoteRadioMessage);
    onSocketEvent('heistTimerTick', handleTimerTick);
    onSocketEvent('heistStageSynced', handleRemoteStageSynced);

    return () => {
      offSocketEvent('connected', handleConnected);
      offSocketEvent('disconnected', handleDisconnected);
      offSocketEvent('lobbyState', handleLobbyState);
      offSocketEvent('lobbyPlayerJoined', handleLobbyPlayerJoined);
      offSocketEvent('lobbyPlayerLeft', handleLobbyPlayerLeft);
      offSocketEvent('lobbyPlayerReady', handleLobbyPlayerReady);
      offSocketEvent('lobbyRoleChanged', handleLobbyRoleChanged);
      offSocketEvent('lobbyHostChanged', handleLobbyHostChanged);
      offSocketEvent('lobbyKicked', handleLobbyKicked);
      offSocketEvent('lobbyStarting', handleLobbyStarting);
      offSocketEvent('lobbyVoiceUpdate', handleLobbyVoiceUpdate);
      offSocketEvent('lobbyError', handleLobbyError);
      offSocketEvent('heistStarted', handleHeistStarted);
      offSocketEvent('heistPuzzleSolved', handleRemotePuzzleSolved);
      offSocketEvent('heistPuzzleFailed', handleRemotePuzzleFailed);
      offSocketEvent('lobbyRadioMessage', handleRemoteRadioMessage);
      offSocketEvent('heistRadioMessage', handleRemoteRadioMessage);
      offSocketEvent('heistTimerTick', handleTimerTick);
      offSocketEvent('heistStageSynced', handleRemoteStageSynced);
    };
  }, [currentStageIdx, lobby?.code, currentUser]);

  useEffect(() => {
    heistAudio.toggleSound(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('kh_missions_subject_v4', JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem('kh_lobby_subject_v4', JSON.stringify(lobby));
  }, [lobby]);

  useEffect(() => {
    localStorage.setItem('kh_unlocked_rooms_sylvan', JSON.stringify(unlockedRooms));
  }, [unlockedRooms]);

  useEffect(() => {
    localStorage.setItem('kh_room_solved_sylvan', JSON.stringify(roomSolved));
  }, [roomSolved]);

  useEffect(() => {
    localStorage.setItem('kh_xp_sylvan', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('kh_streak_sylvan', streak.toString());
  }, [streak]);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleHeistTimeout();
            return 0;
          }
          if (prev <= 30 && alarmLevel !== 'HIGH_LOCKDOWN') {
            setAlarmLevel('HIGH_LOCKDOWN');
            heistAudio.startTensionBeat('HIGH_LOCKDOWN');
          } else if (prev <= 60 && alarmLevel === 'LOW_SECURITY') {
            setAlarmLevel('MEDIUM_ALERT');
            heistAudio.startTensionBeat('MEDIUM_ALERT');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, alarmLevel]);

  // Re-enter fullscreen if user presses Escape during active heist
  useEffect(() => {
    if (!isHeistLocked) return;
    const handleFullscreenChange = () => {
      if (isHeistLocked && !document.fullscreenElement && !document.webkitFullscreenElement) {
        // Re-request fullscreen after a brief delay
        setTimeout(() => {
          enterHeistFullscreen();
          toast.warning("🔒 Fullscreen locked during heist! Use END HEIST to exit.");
        }, 300);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isHeistLocked]);

  // ─────────────────────────────────────────────────────────────
  // Multiplayer Room Handlers
  // ─────────────────────────────────────────────────────────────

  const handleCreateNewRoom = (customTitle) => {
    const code = `HEIST-${Math.floor(100 + Math.random() * 900)}`;
    const title = customTitle || `Squad Delta ${code}`;
    const myName = currentUser?.callsign || currentUser?.username || localStorage.getItem('vault_guest_name') || 'Operative';

    lobbySocket.create('m1', code, title, 'hacker', 'c1', (res) => {
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      if (res?.lobby) {
        setLobby(res.lobby);
        setIsInSquadRoom(true);
        toast.success(`Squad room ${code} created! Share invite code with friends.`);
        heistAudio.playSuccessChime();
      }
    });
    setIsCreateRoomModalOpen(false);
  };

  const handleJoinRoomSubmit = (e) => {
    e.preventDefault();
    const code = joinRoomCodeInput.trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a valid room code (e.g. HEIST-782)');
      return;
    }

    const myName = currentUser?.callsign || currentUser?.username || localStorage.getItem('vault_guest_name') || 'Operative';

    lobbySocket.join(code, 'engineer', 'c2', myName, (res) => {
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      if (res?.lobby) {
        setLobby(res.lobby);
        setIsInSquadRoom(true);
        toast.success(`Joined room ${code}!`);
        heistAudio.playSuccessChime();
        setIsJoinRoomModalOpen(false);
        setJoinRoomCodeInput('');
      }
    });
  };

  const handleJoinSquadOperation = (roomCode, chosenRole = 'hacker') => {
    if (!roomCode || !roomCode.trim()) {
      toast.error("Enter a valid room code before enlisting.");
      return;
    }
    const roleMap = {
      hacker: 'c1',
      engineer: 'c2',
      scientist: 'c3',
      cryptographer: 'c4'
    };
    const charId = roleMap[chosenRole] || 'c1';
    const myName = currentUser?.callsign || currentUser?.username || localStorage.getItem('vault_guest_name') || 'Operative';

    lobbySocket.join(roomCode, chosenRole, charId, myName, (res) => {
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      if (res?.lobby) {
        setLobby(res.lobby);
        setIsInSquadRoom(true);
        toast.success(`Enlisted in squad as ${chosenRole.toUpperCase()}!`);
        heistAudio.playSuccessChime();
      }
    });
  };

  const handleToggleVoice = async () => {
    heistAudio.playKeyClick();
    const roomCode = lobby.roomCode || lobby.code;
    if (!roomCode) {
      toast.error("No active squad room found. Join or create a squad before starting voice.");
      return;
    }
    if (isLobbyVoiceConnected) {
      voiceEngine.stopVoice();
      setIsLobbyVoiceConnected(false);
      lobbySocket.updateVoiceState(roomCode, false, isLobbyMicMuted, isLobbyDeafened);
      toast.info("🔴 Disconnected from Squad Voice Channel");
    } else {
      try {
        let currentSocket = getSocket();
        if (!currentSocket || !currentSocket.connected) {
          currentSocket = connectSocket();
        }
        await voiceEngine.startVoice(currentSocket, roomCode);
        setIsLobbyVoiceConnected(true);
        lobbySocket.updateVoiceState(roomCode, true, isLobbyMicMuted, isLobbyDeafened);
        toast.success("🎙️ Voice Channel Live (Opus HD Audio Mesh)");
      } catch (err) {
        console.error('[VOICE] Toggle voice error:', err);
        toast.error(err?.message || "Microphone access denied or unavailable");
        setIsLobbyVoiceConnected(false);
      }
    }
  };

  const handleToggleMic = () => {
    const newMuted = !isLobbyMicMuted;
    setIsLobbyMicMuted(newMuted);
    voiceEngine.setMuted(newMuted);
    const roomCode = lobby.roomCode || lobby.code || 'MAIN';
    lobbySocket.updateVoiceState(roomCode, isLobbyVoiceConnected, newMuted, isLobbyDeafened);
    heistAudio.playKeyClick();
    toast.info(newMuted ? "🔇 Microphone Muted" : "🎙️ Microphone Live & Transmitting");
  };

  const handleToggleDeafen = () => {
    const newDeafened = !isLobbyDeafened;
    setIsLobbyDeafened(newDeafened);
    voiceEngine.setDeafened(newDeafened);
    const roomCode = lobby.roomCode || lobby.code || 'MAIN';
    lobbySocket.updateVoiceState(roomCode, isLobbyVoiceConnected, isLobbyMicMuted, newDeafened);
    heistAudio.playKeyClick();
    toast.info(newDeafened ? "🎧 Deafen Active: Audio Muted" : "🔊 Deafen Off: Audio Live");
  };

  const handleCopyInviteLink = () => {
    const code = lobby?.code || lobby?.roomCode || '';
    if (!code) {
      toast.error('No active room code to share.');
      return;
    }
    const link = `${window.location.origin}?room=${code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      toast.success('🔗 Invite link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleCopyRoomCode = () => {
    const code = lobby?.code || lobby?.roomCode || '';
    if (!code) {
      toast.error('No active room code.');
      return;
    }
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(true);
      toast.success(`📋 Room code ${code} copied!`);
      setTimeout(() => setCopiedCode(false), 2500);
    });
  };

  const handleSelectRole = (roleKey) => {
    const code = lobby?.code || lobby?.roomCode;
    if (code) lobbySocket.selectRole(code, roleKey);
    heistAudio.playKeyClick();
  };

  const handleToggleReady = (currentReadyState) => {
    const code = lobby?.code || lobby?.roomCode;
    if (code) lobbySocket.setReady(code, !currentReadyState);
    heistAudio.playKeyClick();
  };

  const handleKickSlot = (slotId) => {
    const code = lobby?.code || lobby?.roomCode;
    if (code) lobbySocket.kick(code, slotId);
    heistAudio.playKeyClick();
  };

  const handleStartMultiplayerHeist = () => {
    const code = lobby?.code || lobby?.roomCode;
    if (!code) {
      toast.error('No active squad room found to launch.');
      return;
    }
    lobbySocket.start(code, (res) => {
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.info('🚀 Launch sequence initiated! Synchronizing squad...');
    });
  };

  const handleConfirmLeaveSquad = () => {
    const code = lobby?.code || lobby?.roomCode;
    if (code) {
      lobbySocket.leave(code);
    }
    if (isLobbyVoiceConnected) {
      try {
        voiceEngine.leaveRoom();
      } catch (e) {}
      setIsLobbyVoiceConnected(false);
    }
    setIsInSquadRoom(false);
    setIsLeaveSquadModalOpen(false);
    heistAudio.playKeyClick();
    toast.info("Left squad operation.");
  };

  const handleSendLobbyRadio = (e) => {
    e?.preventDefault?.();
    if (!lobbyRadioInput.trim()) return;
    const roomCode = lobby.roomCode || lobby.code;
    if (!roomCode) {
      toast.error("No active squad room found. Join or create a squad before broadcasting.");
      return;
    }
    const myId = currentUser?.id || localStorage.getItem('vault_guest_id');
    const mySlot = lobby?.players?.find(p => p.userId === myId);
    const myRole = mySlot?.role ? normalizeRoleKey(mySlot.role) : 'hacker';

    lobbySocket.sendRadioMessage(roomCode, lobbyRadioInput.trim(), myRole);
    setLobbyRadioInput('');
    heistAudio.playRadioSquelch();
  };

  const handleSendLobbyQuickMacro = (text) => {
    if (!text || !text.trim()) return;
    const roomCode = lobby.roomCode || lobby.code;
    if (!roomCode) {
      toast.error("No active squad room found. Join or create a squad before broadcasting.");
      return;
    }
    const myId = currentUser?.id || localStorage.getItem('vault_guest_id');
    const mySlot = lobby?.players?.find(p => p.userId === myId);
    const myRole = mySlot?.role ? normalizeRoleKey(mySlot.role) : 'hacker';

    lobbySocket.sendRadioMessage(roomCode, text.trim(), myRole);
    heistAudio.playRadioSquelch();
  };

  // ─────────────────────────────────────────────────────────────
  // In-Game Heist Handlers
  // ─────────────────────────────────────────────────────────────

  const handleStartHeistStage = (stageIdx = 0, isInitiator = true, overrideRole = null) => {
    setCurrentStageIdx(stageIdx);
    const stage = allStages[stageIdx] || heistStages[0];
    setTimeLeft(stage.timeLimit || 180);
    setIsTimerRunning(true);
    setAlarmLevel('LOW_SECURITY');
    setAlarmFails(0);
    const activeRoles = stage.selectedRoles 
      ? Object.keys(stage.selectedRoles).filter(k => stage.selectedRoles[k])
      : ['hacker', 'engineer', 'scientist', 'cryptographer'];
    
    const chosenRole = overrideRole || activeCockpitRole || activeRoles[0] || 'hacker';
    setActiveCockpitRole(chosenRole);
    setActiveTab('liveheist');
    enterHeistFullscreen();
    heistAudio.startTensionBeat('LOW_SECURITY');
    heistAudio.playRadioSquelch();
    toast.success(`🚀 ${stage.title} ENGAGED! Specialist cockpit assigned: ${chosenRole.toUpperCase()}`);

    try {
      heistSocket.joinRoom(lobby.code);
      if (isInitiator) {
        heistSocket.start(lobby.code, stageIdx, stage.timeLimit || 180, stage.puzzles, stage.selectedRoles);
      }
    } catch (e) {
      console.warn('[SOCKET] Heist start fallback');
    }
  };

  const handleLaunchCustomHeist = (customStage) => {
    const stageIdx = allStages.length;
    setAllStages(prev => [...prev, customStage]);
    setCurrentStageIdx(stageIdx);
    setTimeLeft(customStage.timeLimit || 180);
    setIsTimerRunning(true);
    setAlarmLevel('LOW_SECURITY');
    setAlarmFails(0);
    const activeRoles = Object.keys(customStage.selectedRoles || {}).filter(k => customStage.selectedRoles[k]);
    setActiveCockpitRole(activeRoles[0] || 'hacker');
    setActiveTab('liveheist');
    enterHeistFullscreen();
    heistAudio.startTensionBeat('LOW_SECURITY');
    heistAudio.playRadioSquelch();
    toast.success(`🚀 CUSTOM HEIST ENGAGED: ${customStage.title}!`);

    try {
      heistSocket.joinRoom(lobby.code);
      heistSocket.start(lobby.code, stageIdx, customStage.timeLimit || 180, customStage.puzzles, customStage.selectedRoles);
    } catch (e) { /* socket fallback */ }
  };

  const handleSaveCustomHeist = (customStage) => {
    const newMission = {
      id: `custom-${Math.random().toString(36).substring(2, 9)}`,
      title: customStage.title,
      category: customStage.subtitle?.split('•')[0]?.trim() || 'Custom Operation',
      difficulty: customStage.subtitle?.split('•')[1]?.trim() || 'Medium',
      reward: '8,000 XP & Custom Master Token',
      description: customStage.description,
      roomsCount: Object.values(customStage.selectedRoles || {}).filter(Boolean).length,
      image: FALLBACK_SUBJECT_IMG,
      featured: true,
      customStageData: customStage,
      rooms: []
    };

    setMissions(prev => [newMission, ...prev]);
    setAllStages(prev => [...prev, customStage]);
    heistAudio.playSuccessChime();
    toast.success(`💾 Custom Heist '${customStage.title}' saved to Expeditions!`);
  };

  const handleHeistTimeout = () => {
    setIsTimerRunning(false);
    setAlarmLevel('BUSTED');
    heistAudio.stopTension();
    heistAudio.playAlarmSiren();
    exitHeistFullscreen();
    setIsMatchVictory(false);
    setAnalyticsStats({
      hackerXp: 50,
      engineerXp: 50,
      scientistXp: 50,
      cryptoXp: 50,
      timeElapsed: "EXPIRED (3m 00s)",
      accuracy: "42%",
      alarmsTripped: alarmFails + 1
    });
    setAnalyticsModalOpen(true);
    toast.error("🚨 FACILITY LOCKDOWN TRIPPED! Time limit expired.");
  };

  const handleRolePuzzleSolved = (role, clue) => {
    const stage = allStages[currentStageIdx] || heistStages[0];
    const stageId = stage.stageId;
    
    setStageSolvedRoles(prev => {
      const current = { ...(prev[stageId] || {}) };
      current[role] = true;
      return { ...prev, [stageId]: current };
    });

    setStageRoleClues(prev => {
      const current = { ...(prev[stageId] || {}) };
      current[role] = clue;
      return { ...prev, [stageId]: current };
    });

    const roleNames = {
      scientist: "Scientist Rostova",
      engineer: "Engineer Chen",
      hacker: "Hacker Vance",
      cryptographer: "Operator Lin"
    };

    const solverName = currentUser?.username || localStorage.getItem('vault_guest_name') || roleNames[role] || role.toUpperCase();
    const timeStr = `${Math.floor((180 - timeLeft) / 60)}:${((180 - timeLeft) % 60).toString().padStart(2, '0')}`;
    const newMsg = {
      sender: solverName,
      role: role,
      text: `[PASSED] ${clue} — Transmitting across interdependence pipeline!`,
      time: timeStr
    };
    setRadioMessages(prev => [...prev, newMsg]);

    toast.success(`🔓 ${role.toUpperCase()} LOCK BYPASSED! Clue dispatched.`);

    try {
      heistSocket.puzzleSolved(lobby.code, role, clue, solverName);
    } catch (e) { /* socket broadcast */ }

    const activeRoles = stage.selectedRoles 
      ? Object.keys(stage.selectedRoles).filter(k => stage.selectedRoles[k])
      : ['hacker', 'engineer', 'scientist', 'cryptographer'];
    const nextSolved = { ...(stageSolvedRoles[stageId] || {}), [role]: true };
    const allRoleSolved = activeRoles.every(r => nextSolved[r]);
    if (allRoleSolved) {
      handleStageVictory();
    }
  };

  const handleRolePuzzleFailed = (role, reason) => {
    const newFails = alarmFails + 1;
    setAlarmFails(newFails);
    
    setTimeLeft(prev => Math.max(5, prev - 12));

    let nextAlert = 'LOW_SECURITY';
    if (newFails >= 4) {
      nextAlert = 'HIGH_LOCKDOWN';
      heistAudio.startTensionBeat('HIGH_LOCKDOWN');
    } else if (newFails >= 2) {
      nextAlert = 'MEDIUM_ALERT';
      heistAudio.startTensionBeat('MEDIUM_ALERT');
    }
    setAlarmLevel(nextAlert);

    const failerName = currentUser?.username || localStorage.getItem('vault_guest_name') || 'Specialist';
    try {
      heistSocket.puzzleFailed(lobby.code, role, reason, failerName);
    } catch (e) { /* socket broadcast */ }

    const timeStr = `${Math.floor((180 - timeLeft) / 60)}:${((180 - timeLeft) % 60).toString().padStart(2, '0')}`;
    setRadioMessages(prev => [
      ...prev,
      {
        sender: "SECURITY SYSTEM",
        role: "alert",
        text: `[ALARM +1] ${role.toUpperCase()} trigger fail by ${failerName}: "${reason}" (-12s Penalty)`,
        time: timeStr
      }
    ]);
    heistAudio.playAlarmChime();
    toast.error(`🚨 ALARM ESCALATED! ${role.toUpperCase()} misfire!`);

    if (newFails >= 6) {
      handleHeistTimeout();
    }
  };

  const handleStageVictory = () => {
    setIsTimerRunning(false);
    heistAudio.stopTension();
    heistAudio.playSuccessChime();
    exitHeistFullscreen();

    const stage = allStages[currentStageIdx] || heistStages[0];
    const totalTimeSpent = (stage.timeLimit || 180) - timeLeft;
    const timeStr = `${Math.floor(totalTimeSpent / 60)}m ${(totalTimeSpent % 60)}s`;

    const xpReward = 500 + (currentStageIdx + 1) * 250;
    setXp(prev => prev + xpReward);
    setStreak(prev => prev + 1);

    setIsMatchVictory(true);
    setAnalyticsStats({
      hackerXp: 350 + (currentStageIdx + 1) * 50,
      engineerXp: 350 + (currentStageIdx + 1) * 50,
      scientistXp: 350 + (currentStageIdx + 1) * 50,
      cryptoXp: 350 + (currentStageIdx + 1) * 50,
      timeElapsed: timeStr,
      accuracy: alarmFails === 0 ? "100%" : `${Math.max(65, 100 - alarmFails * 8)}%`,
      alarmsTripped: alarmFails
    });
    setAnalyticsModalOpen(true);
  };

  const handleSimulateBotTeammates = () => {
    const stage = allStages[currentStageIdx] || heistStages[0];
    const stageId = stage.stageId;
    const allRoles = ['scientist', 'engineer', 'hacker', 'cryptographer'];
    const activeRoles = stage.selectedRoles 
      ? allRoles.filter(r => stage.selectedRoles[r])
      : allRoles;
    const currentSolved = stageSolvedRoles[stageId] || {};
    const unsolved = activeRoles.filter(r => !currentSolved[r] && r !== activeCockpitRole);

    if (unsolved.length === 0) {
      toast.info("All bot squad roles are already solved for this stage!");
      return;
    }

    const botRole = unsolved[0];
    const puzzle = stage.puzzles[botRole];
    handleRolePuzzleSolved(botRole, puzzle.clueRevealed);
    toast.success(`🤖 Bot Specialist solved ${botRole.toUpperCase()} task!`);
  };

  const handleSendMessage = (text, role) => {
    const timeStr = `${Math.floor((180 - timeLeft) / 60)}:${((180 - timeLeft) % 60).toString().padStart(2, '0')}`;
    const senderName = currentUser?.username || localStorage.getItem('vault_guest_name') || `You (${role.toUpperCase()})`;
    const code = lobby?.code || lobby?.roomCode;

    if (code) {
      try {
        heistSocket.sendRadioMessage(code, text, role, senderName);
      } catch (e) {
        const newMsg = { sender: senderName, role, text, time: timeStr };
        setRadioMessages(prev => [...prev, newMsg]);
      }
    } else {
      const newMsg = { sender: senderName, role, text, time: timeStr };
      setRadioMessages(prev => [...prev, newMsg]);
    }
  };

  const handleClaimSlot = (slotId) => {
    setTargetSlotId(slotId);
    setIsJoinModalOpen(true);
    heistAudio.playKeyClick();
  };

  const handleJoinLobbySubmit = (e) => {
    e.preventDefault();
    if (!joinPlayerName.trim()) {
      toast.error("Please enter your operative codename!");
      return;
    }

    const mappedRole = normalizeRoleKey(joinRole);

    lobbySocket.join(lobby.code, mappedRole, joinCharacterId, joinPlayerName.trim(), (res) => {
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      if (res?.lobby) {
        setLobby(res.lobby);
      }
      toast.success(`🌿 Welcome to the squad, ${joinPlayerName}! Slot confirmed.`);
    });

    setIsJoinModalOpen(false);
    setJoinPlayerName('');
    heistAudio.playSuccessChime();
  };

  const handleSaveCustomMission = (e) => {
    e.preventDefault();
    if (!builder.title || !builder.description || !builder.question) {
      toast.error("Please fill in all mission and puzzle fields!");
      return;
    }

    setBuilderSaving(true);
    setTimeout(() => {
      const newMission = {
        id: `custom-${Math.random().toString(36).substring(2, 9)}`,
        title: builder.title,
        category: builder.category,
        difficulty: builder.difficulty,
        reward: builder.reward,
        description: builder.description,
        roomsCount: 1,
        image: FALLBACK_SUBJECT_IMG,
        featured: false,
        rooms: [
          {
            id: 1,
            title: "Custom Security Gate",
            question: builder.question,
            options: [builder.answer || "Correct Solution", "Alternative Decoy A", "Alternative Decoy B", "Alternative Decoy C"],
            correct: 0
          }
        ]
      };

      setMissions([newMission, ...missions]);
      setBuilderSaving(false);
      setBuilder({
        title: '',
        category: 'Forest Botany & Lore',
        difficulty: 'Medium',
        reward: '5,000 XP & Leaf Star',
        description: '',
        question: '',
        answer: ''
      });
      heistAudio.playSuccessChime();
      toast.success("🌳 Custom Sylvan Heist Blueprint Published to Expeditions!");
      setActiveTab('missions');
    }, 600);
  };

  // Only registered users get a unique Agent ID
  const currentAgentId = currentUser?.agentId || (
    currentUser?.id 
      ? `VAULT-${currentUser.id.replace(/-/g, '').substring(0, 8).toUpperCase()}`
      : null
  );

  const currentStageData = (allStages && allStages[currentStageIdx]) || heistStages[0] || {};
  const stageId = currentStageData.stageId || 1;
  const currentStageSolved = (stageSolvedRoles && stageSolvedRoles[stageId]) || {};
  const currentStageClues = (stageRoleClues && stageRoleClues[stageId]) || {};
  const currentStagePuzzles = currentStageData.puzzles || heistStages[0].puzzles || {};

  return (
    <div className="relative min-h-screen bg-[#051811] text-[#F0FDF4] selection:bg-[#10B981] selection:text-[#02140D] font-sans antialiased">
      <Toaster 
        position="top-right" 
        theme="dark"
        closeButton={false}
        duration={1000}
        richColors={false}
        toastOptions={{
          className: 'vault-toast',
          duration: 1000
        }}
      />

      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {bgVideoActive && (
          <video
            ref={videoRef}
            src={bgVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-105 filter brightness-105 saturate-110 contrast-105 transition-opacity duration-1000"
          />
        )}
        <div 
          className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
          style={{
            backgroundColor: '#051811',
            opacity: 0.22
          }}
        />
        {alarmLevel === 'HIGH_LOCKDOWN' && (
          <div className="absolute inset-0 bg-red-900/25 pointer-events-none animate-pulse" />
        )}
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">

        <header className="sticky top-0 z-50 bg-[#071E14]/95 backdrop-blur-xl border-b-[3px] border-[#03140C] px-3 sm:px-6 py-2.5 sm:py-3 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
          <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
            
            <div className="flex items-center space-x-1.5 sm:space-x-2.5">
              
              {currentUser && (
                <button 
                  onClick={handleGoBack}
                  disabled={activeTab === 'home' && tabHistory.length === 0}
                  className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 border-2 border-[#03140C] font-black text-xs uppercase shadow-[2px_2px_0px_#020C07] transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                    activeTab === 'home' && tabHistory.length === 0
                      ? 'bg-[#051811] text-slate-600 border-slate-800 cursor-not-allowed opacity-40'
                      : 'bg-[#FBBF24] text-[#02140D] hover:bg-[#F59E0B]'
                  }`}
                  title={activeTab === 'home' && tabHistory.length === 0 ? "At Mission HQ" : "Go Back to Previous Screen"}
                  aria-label="Go Back"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                  <span className="hidden sm:inline">BACK</span>
                </button>
              )}

              {currentUser && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => {
                    navigateToTab('home');
                    heistAudio.playKeyClick();
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-[#03140C] font-black text-xs uppercase shadow-[2px_2px_0px_#020C07] transition-colors ${
                    activeTab === 'home'
                      ? 'bg-[#10B981] text-[#02140D] shadow-[2px_2px_0px_#FBBF24]'
                      : 'bg-[#0A261B] text-[#6EE7B7] hover:bg-[#10B981]/20 hover:text-white'
                  }`}
                  title="Mission HQ / Home Page"
                  aria-label="Home Section"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">HOME</span>
                </motion.button>
              )}

              {currentUser && (
                <button 
                  onClick={() => {
                    setSidebarOpen(!sidebarOpen);
                    heistAudio.playKeyClick();
                  }}
                  className="md:hidden p-2 border-2 border-[#03140C] bg-[#0A2D1F] text-[#FBBF24] shadow-[2px_2px_0px_#020C07] hover:bg-[#10B981] hover:text-[#02140D] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  title={sidebarOpen ? "Close Syndicate Menu" : "Open Syndicate Menu"}
                  aria-label="Toggle navigation menu"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}

              {currentUser && (
                <button 
                  onClick={() => {
                    setSidebarCollapsed(!sidebarCollapsed);
                    heistAudio.playKeyClick();
                  }}
                  className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 border-2 border-[#03140C] font-black text-xs uppercase shadow-[2px_2px_0px_#020C07] transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                    sidebarCollapsed
                      ? 'bg-[#10B981] text-[#02140D] hover:bg-[#34D399] shadow-[2px_2px_0px_#FBBF24]'
                      : 'bg-[#0A261B] text-[#6EE7B7] hover:text-[#FBBF24] hover:bg-[#0E3526]'
                  }`}
                  title={sidebarCollapsed ? "Open Syndicate Sidebar Menu" : "Minimize / Hide Sidebar Menu Completely"}
                  aria-label="Toggle sidebar visibility"
                >
                  {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                  <span>{sidebarCollapsed ? "MENU" : "HIDE"}</span>
                </button>
              )}

              <div 
                className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group" 
                onClick={() => {
                  navigateToTab('home');
                  heistAudio.playKeyClick();
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
              >
                <div className="bg-[#10B981] border-[3px] border-[#03140C] p-1.5 sm:p-2 shadow-[3px_3px_0px_#020C07] group-hover:rotate-6 transition-transform rotate-[-2deg]">
                  <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-[#02140D]" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <span className="text-lg sm:text-2xl font-black tracking-widest uppercase font-mono bg-[#FBBF24] text-[#02140D] px-2 sm:px-2.5 py-0.5 border-2 border-[#03140C] shadow-[2px_2px_0px_#020C07]">
                      V.A.U.L.T
                    </span>
                    <span className="hidden sm:inline-block bg-[#10B981]/20 text-[#34D399] text-[10px] font-mono font-bold px-2 py-0.5 border border-[#10B981]/40 uppercase tracking-widest">
                      v3.5 CO-OP
                    </span>
                  </div>
                  <span className="text-[9px] sm:text-xs block font-bold text-[#6EE7B7] tracking-widest mt-0.5">
                    VIRTUAL ACADEMIC UNDERGROUND LEARNING TEAM
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 sm:space-x-2.5">
              
              {activeTab === 'liveheist' && (
                <button
                  onClick={() => setIsEndHeistModalOpen(true)}
                  className="bg-[#FF4D6D] text-white font-mono font-black text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-red-400/40 shadow-md shadow-red-950/60 hover:bg-[#FF3366] active:translate-x-0.5 transition-all flex items-center space-x-1.5 uppercase animate-pulse"
                  title="Conclude or Abort this operation on your own wish"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">END HEIST</span>
                  <span className="sm:hidden">END</span>
                </button>
              )}

              <button 
                onClick={() => {
                  setIsAgentDirectoryOpen(true);
                  heistAudio.playKeyClick();
                }}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 border-2 border-[#03140C] bg-[#0A2D1F] text-[#34D399] hover:bg-[#10B981] hover:text-[#02140D] font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#020C07] active:translate-x-0.5 transition-all"
                title="Search and identify syndicate operatives by unique Agent ID"
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">FIND AGENT</span>
                <span className="sm:hidden">AGENT</span>
              </button>

              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      navigateToTab('stats');
                      heistAudio.playKeyClick();
                    }}
                    className={`flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 border-2 border-[#03140C] font-mono shadow-[2px_2px_0px_#020C07] transition-all ${
                      activeTab === 'stats' 
                        ? 'bg-[#10B981] text-[#02140D] shadow-[2px_2px_0px_#FBBF24]' 
                        : 'bg-[#0A261B] text-[#F0FDF4] hover:bg-[#10B981]/20'
                    }`}
                    title={`View ${currentUser.callsign}'s Operative Dossier`}
                  >
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.callsign} 
                      className="w-5 h-5 object-cover border border-[#03140C]" 
                    />
                    <div className="text-left hidden md:block leading-tight">
                      <span className="text-[11px] font-black uppercase block truncate max-w-[90px]">{currentUser.callsign}</span>
                      <span className="text-[9px] text-[#FBBF24] font-bold block">LVL {currentUser.level}</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsCustomHeistModalOpen(true);
                      heistAudio.playKeyClick();
                    }}
                    className="hidden sm:flex bg-[#FBBF24] text-[#02140D] font-black px-2.5 sm:px-4 py-1.5 sm:py-2 border-[2.5px] sm:border-[3px] border-[#03140C] shadow-[2px_2px_0px_#020C07] sm:shadow-[3px_3px_0px_#020C07] hover:bg-[#F59E0B] active:translate-x-0.5 active:translate-y-0.5 transition-all items-center space-x-1 sm:space-x-1.5 text-xs sm:text-sm"
                    title="Create a custom multi-role heist with selected roles"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                    <span className="hidden sm:inline">CUSTOM HEIST</span>
                    <span className="sm:hidden">HEIST</span>
                  </button>

                  {activeTab !== 'liveheist' && (
                    <button
                      onClick={() => handleStartHeistStage(0)}
                      className="bg-[#FF4D6D] text-white font-black px-3 sm:px-5 py-1.5 sm:py-2 border-[2.5px] sm:border-[3px] border-[#03140C] shadow-[2px_2px_0px_#020C07] sm:shadow-[3px_3px_0px_#020C07] hover:bg-[#FF3366] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                    >
                      <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                      <span className="hidden sm:inline">LAUNCH STAGE 1</span>
                      <span className="sm:hidden">STAGE 1</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    heistAudio.playKeyClick();
                  }}
                  className="bg-[#10B981] text-[#02140D] font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 border-2 border-[#03140C] shadow-[2px_2px_0px_#020C07] hover:bg-[#34D399] active:translate-x-0.5 transition-all flex items-center space-x-2"
                  title="Sign In with email or username and password"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>

          </div>
        </header>

        <div className="flex flex-1 relative min-h-[calc(100vh-65px)]">

          {currentUser && sidebarOpen && (
            <div 
              className="fixed inset-0 z-30 bg-black/75 backdrop-blur-sm md:hidden transition-opacity"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {currentUser && (
            <aside className={`
              fixed md:sticky top-[58px] sm:top-[65px] z-40 md:z-20
              h-[calc(100vh-58px)] sm:h-[calc(100vh-65px)]
              bg-[#061E14]/95 md:bg-[#071E14]/90 backdrop-blur-xl
              border-r-[3px] border-[#03140C] shadow-[4px_0_20px_rgba(0,0,0,0.5)]
              flex flex-col justify-between
              transition-all duration-300 ease-in-out
              overflow-y-auto overflow-x-hidden flex-shrink-0
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
              ${sidebarCollapsed 
                ? 'md:-translate-x-full md:w-0 md:opacity-0 md:pointer-events-none md:border-r-0 md:overflow-hidden' 
                : 'w-72 md:w-60 lg:w-64 md:opacity-100'
              }
            `}>
            
            <div className="flex-1 w-72 md:w-60 lg:w-64">
              
              <div className="p-3.5 border-b-2 border-[#03140C] bg-[#04160E]/80 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                  <span className="text-[11px] font-black uppercase font-mono tracking-wider text-[#34D399]">
                    SYNDICATE MENU
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono bg-[#0A261B] text-[#FBBF24] px-2 py-0.5 border border-[#03140C] font-bold">
                    9 OPS
                  </span>
                  <button
                    onClick={() => {
                      setSidebarCollapsed(true);
                      heistAudio.playKeyClick();
                    }}
                    className="hidden md:flex p-1 text-slate-400 hover:text-white hover:bg-[#0E3526] border border-[#03140C]"
                    title="Minimize Sidebar"
                  >
                    <PanelLeftClose className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <nav className="p-2.5 sm:p-3 space-y-1.5">
                {[
                  { id: 'home', label: 'Home HQ', icon: Home, badge: 'HOME', sub: 'Platform Overview' },
                  { id: 'stats', label: 'My Stats', icon: BarChart3, badge: currentUser ? `LVL ${currentUser.level}` : 'STATS', sub: 'Operative Dossier', highlight: !!currentUser },
                  { id: 'missions', label: 'Expeditions', icon: Compass, badge: '3 Ops', sub: 'Campaign Missions' },
                  { id: 'lobby', label: 'Squad Lobby', icon: Users, badge: '4 Roles', sub: 'Crew Assembly' },
                  { id: 'characters', label: '4 Roles', icon: Sparkles, badge: 'Classes', sub: 'Role Capabilities' },
                  { id: 'topics', label: 'Disciplines', icon: BookOpen, badge: 'STEM', sub: 'Cross-Curricular' },
                  { id: 'map', label: 'Canopy Map', icon: MapPin, badge: 'Tactical', sub: 'Interactive Vaults' },
                  { id: 'builder', label: 'Architect', icon: Terminal, badge: 'Forge', sub: 'Custom Blueprints' },
                  { id: 'waitlist', label: 'Syndicate Pass', icon: Rocket, badge: 'VIP', sub: 'Early Access Pass' }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => {
                        if (isHeistLocked && tab.id !== 'liveheist') {
                          toast.warning("🔒 Navigation locked! Complete or quit the heist to leave.");
                          return;
                        }
                        navigateToTab(tab.id);
                        heistAudio.playKeyClick();
                        if (tab.id === 'liveheist' && !isTimerRunning) {
                          setIsTimerRunning(true);
                        }
                        if (window.innerWidth < 768) {
                          setSidebarOpen(false);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-2.5 transition-colors text-left border-[2.5px] border-[#03140C] ${
                        isHeistLocked && tab.id !== 'liveheist'
                          ? 'bg-[#0A261B]/40 text-[#D1FAE5]/30 cursor-not-allowed opacity-40 shadow-none'
                          : isActive
                          ? 'bg-[#10B981] text-[#02140D] font-black shadow-[3px_3px_0px_#FBBF24] translate-x-0.5'
                          : tab.highlight
                          ? 'bg-[#0E3523] text-[#FBBF24] hover:bg-[#10B981]/25 hover:text-white border-amber-400/40 shadow-[2px_2px_0px_#020C07]'
                          : 'bg-[#0A261B]/80 text-[#D1FAE5] hover:bg-[#10B981]/20 hover:text-white shadow-[2px_2px_0px_#020C07]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                        <div className={`p-1.5 border border-[#03140C] flex-shrink-0 ${
                          isActive 
                            ? 'bg-[#02140D] text-[#10B981]' 
                            : tab.highlight 
                            ? 'bg-[#FBBF24] text-[#02140D]' 
                            : 'bg-[#051A12] text-[#34D399]'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black uppercase tracking-wider truncate flex items-center space-x-1.5">
                            <span>{tab.label}</span>
                            {tab.highlight && (
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#02140D]' : 'bg-red-500'} animate-ping`} />
                            )}
                          </div>
                          <p className={`text-[10px] truncate ${isActive ? 'text-[#02140D]/80 font-bold' : 'text-emerald-400/70 font-medium'}`}>
                            {tab.sub}
                          </p>
                        </div>
                      </div>

                      {tab.badge && (
                        <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 border flex-shrink-0 ${
                          isActive
                            ? 'bg-[#02140D] text-[#FBBF24] border-[#02140D]'
                            : tab.highlight
                            ? 'bg-[#FF4D6D] text-white border-[#03140C] animate-pulse'
                            : 'bg-[#051C13] text-[#6EE7B7] border-[#03140C]'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </nav>

            </div>

            <div className="p-3 border-t-2 border-[#03140C] bg-[#04160E]/90 space-y-2.5 w-72 md:w-60 lg:w-64">
              <div className="p-2 bg-[#020B06] border border-[#03140C] flex items-center justify-between text-[11px] font-mono font-bold">
                <div className="flex items-center space-x-1.5 text-[#34D399]">
                  <Radio className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
                  <span>RADAR ACTIVE</span>
                </div>
                <span className="text-[#FBBF24] text-[10px]">4.8K CO-OP</span>
              </div>

              <button
                onClick={() => {
                  handleStartHeistStage(0);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className="w-full bg-[#FF4D6D] text-white font-black text-xs py-2 px-2.5 border-[2px] border-[#03140C] shadow-[2px_2px_0px_#020C07] hover:bg-[#FF3366] active:translate-x-0.5 flex items-center justify-center space-x-1.5 uppercase"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>LAUNCH CO-OP</span>
              </button>
            </div>

          </aside>
          )}

          <div className="flex-1 min-w-0 flex flex-col">

        {activeTab === 'missions' && (
          <section className="bg-gradient-to-r from-[#062417]/85 via-[#093522]/80 to-[#052115]/85 backdrop-blur-md text-white border-b-[3px] border-[#03140C] py-12 sm:py-16 px-6 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:20px_20px]"></div>
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center space-x-2 bg-[#FBBF24] text-[#02140D] font-mono font-black text-xs sm:text-sm uppercase px-3.5 py-1.5 border-[2.5px] border-[#03140C] shadow-[3px_3px_0px_#020C07] rotate-[-1.5deg]">
                  <Trees className="w-4 h-4 text-[#02140D] stroke-[2.5]" />
                  <span className="text-sm">🌲</span>
                  <span className="tracking-wide">REAL–TIME MULTIPLAYER LEARNING HEIST</span>
                </div>
                
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none uppercase drop-shadow-[4px_4px_0px_#020C07] text-[#F0FDF4]">
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
                
                <p className="text-base sm:text-lg font-medium text-emerald-100/90 max-w-xl leading-relaxed">
                  Execute high-stakes virtual heists by solving interconnected cross-disciplinary puzzles. The Hacker writes algorithms, the Engineer calculates laser deflections, the Scientist synthesizes chemical neutralizers, and the Cryptographer cracks ancient ciphers!
                </p>
                
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => handleStartHeistStage(0)}
                    className="bg-[#10B981] text-[#02140D] font-black px-8 py-3.5 border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#34D399] active:translate-x-0.5 transition-all flex items-center space-x-2 text-base sm:text-lg"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>LAUNCH CO-OP OPERATION</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('lobby');
                      heistAudio.playKeyClick();
                    }}
                    className="bg-[#0A261B]/90 text-[#F0FDF4] font-black px-6 py-3.5 border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#0F3828] active:translate-x-0.5 transition-all flex items-center space-x-2 text-base sm:text-lg border-2 border-emerald-500/30"
                  >
                    <Users className="w-5 h-5 text-[#FBBF24]" />
                    <span>SQUAD LOBBY</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="forest-glass p-4 rotate-2 relative shadow-[8px_8px_0px_#020C07]">
                  <div className="absolute -top-4 -left-4 bg-[#10B981] text-[#02140D] font-black px-3 py-1 border-2 border-[#03140C] text-xs uppercase shadow-[2px_2px_0px_#020C07] flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>HEIST COMMAND RADAR ACTIVE</span>
                  </div>
                  <img 
                    src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80" 
                    alt="Multi-Disciplinary Heist Command Center" 
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_SUBJECT_IMG; }}
                    className="w-full h-64 object-cover border-2 border-[#03140C]"
                  />
                  <div className="mt-4 flex items-center justify-between text-xs font-bold text-emerald-200">
                    <span className="flex items-center space-x-1.5">
                      <Radio className="w-4 h-4 text-[#34D399] animate-pulse" />
                      <span>4,821 RANGERS IN SQUAD HEISTS</span>
                    </span>
                    <span className="bg-[#FBBF24] text-[#02140D] font-black px-2.5 py-0.5 border-2 border-[#03140C]">v3.5 HEIST</span>
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-14 w-full">
          <AnimatePresence mode="wait" initial={false}>

          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(3px)' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <HeroPage
                onNavigate={navigateToTab}
                onStartStage={handleStartHeistStage}
                onOpenCustomHeist={() => {
                  if (!currentUser) {
                    setIsAuthModalOpen(true);
                    toast.info("🔐 Please sign in with email & password to build custom heist blueprints.");
                  } else {
                    setIsCustomHeistModalOpen(true);
                  }
                }}
                onRequireAuth={() => setIsAuthModalOpen(true)}
                currentUser={currentUser}
                characters={characters}
                missions={missions}
                heistStages={allStages}
              />
            </motion.div>
          )}

          {activeTab === 'liveheist' && (
            <motion.div
              key="liveheist"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="space-y-5 max-w-7xl mx-auto"
            >
              
              <div className="bg-[#051C12] border border-emerald-800/40 rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#10B981] text-[#02140D] font-bold text-[10px] px-2.5 py-0.5 rounded uppercase font-mono">
                      Active Mission
                    </span>
                    <span className="text-xs font-mono text-emerald-300">
                      Target: {currentStageData.targetFacility}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {currentStageData.title}
                  </h2>
                  <p className="text-xs text-slate-300 max-w-2xl">{currentStageData.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs self-stretch lg:self-auto justify-between lg:justify-end">
                  
                  <div className={`px-3 py-2 rounded-lg border text-center flex items-center space-x-2 ${
                    timeLeft <= 30 
                      ? 'bg-red-950/80 border-red-500 text-red-200 animate-pulse' 
                      : 'bg-[#020B06] border-emerald-900/60 text-[#FBBF24]'
                  }`}>
                    <Clock className="w-4 h-4 text-[#FBBF24]" />
                    <div>
                      <span className="text-[9px] text-slate-400 block leading-none">TIMER</span>
                      <span className="font-bold text-base leading-none">
                        {Math.floor(timeLeft / 60)}:{((timeLeft % 60)).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  <div className={`px-3 py-2 rounded-lg border text-center flex items-center space-x-2 ${
                    alarmLevel === 'HIGH_LOCKDOWN' 
                      ? 'bg-red-950 border-red-500 text-red-200 animate-pulse' 
                      : alarmLevel === 'MEDIUM_ALERT'
                      ? 'bg-amber-950 border-amber-500 text-amber-200'
                      : 'bg-[#020B06] border-emerald-900/60 text-[#10B981]'
                  }`}>
                    <ShieldAlert className="w-4 h-4" />
                    <div>
                      <span className="text-[9px] text-slate-400 block leading-none">STATUS</span>
                      <span className="font-bold text-xs leading-none">
                        {alarmLevel === 'LOW_STEALTH' ? 'Normal' : alarmLevel.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex bg-[#020B06] rounded-lg p-1 border border-emerald-900/60">
                    {allStages.map((stg, sIdx) => (
                      <button
                        key={stg.stageId || sIdx}
                        onClick={() => handleStartHeistStage(sIdx)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
                          currentStageIdx === sIdx 
                            ? 'bg-[#10B981] text-[#02140D]' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {stg.isCustom ? 'Custom' : `S0${stg.stageId}`}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      handleStartHeistStage(currentStageIdx);
                      toast.info(`🔄 Stage restarted! Timer reset.`);
                    }}
                    className="p-2 rounded-lg border border-emerald-900/60 bg-[#020B06] text-[#FBBF24] hover:bg-[#10B981] hover:text-[#02140D] transition-colors"
                    title="Restart Stage"
                    aria-label="Restart Stage"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsEndHeistModalOpen(true)}
                    className="bg-[#FF4D6D] text-white font-bold text-xs px-3 py-2 rounded-lg hover:bg-[#FF3366] transition-colors flex items-center space-x-1.5"
                    title="End or Abort Operation"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>End Heist</span>
                  </button>

                </div>
              </div>

              <InterdependenceMatrix
                stageData={currentStageData}
                solvedRoles={currentStageSolved}
                roleClues={currentStageClues}
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'hacker', name: 'The Hacker', icon: Terminal, color: '#10B981', discipline: 'Data Structures' },
                  { id: 'engineer', name: 'The Engineer', icon: Compass, color: '#FBBF24', discipline: 'Physics & Optics' },
                  { id: 'scientist', name: 'The Scientist', icon: FlaskConical, color: '#06B6D4', discipline: 'Chemistry & pH' },
                  { id: 'cryptographer', name: 'The Cryptographer', icon: Key, color: '#C084FC', discipline: 'Math & Ciphers' }
                ].filter(roleItem => !currentStageData.selectedRoles || currentStageData.selectedRoles[roleItem.id]).map(roleItem => {
                  const Icon = roleItem.icon;
                  const isRoleSolved = !!currentStageSolved[roleItem.id];
                  const isActive = activeCockpitRole === roleItem.id;

                  return (
                    <button
                      key={roleItem.id}
                      onClick={() => {
                        setActiveCockpitRole(roleItem.id);
                        heistAudio.playKeyClick();
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isActive
                          ? 'bg-[#0A2E1E] border-[#10B981] shadow-md ring-1 ring-[#10B981]'
                          : 'bg-[#051C12] border-emerald-900/40 hover:bg-[#072418]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2 min-w-0">
                          <Icon className="w-4 h-4 flex-shrink-0" style={{ color: roleItem.color }} />
                          <span className="font-bold text-xs truncate text-white">
                            {roleItem.name}
                          </span>
                        </div>
                        {isRoleSolved && (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-1.5">{roleItem.discipline}</p>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                <div className="lg:col-span-8 space-y-4">
                  {activeCockpitRole === 'hacker' && (
                    <HackerTerminal
                      puzzle={currentStagePuzzles.hacker || heistStages[0].puzzles.hacker}
                      isSolved={!!currentStageSolved.hacker}
                      onSolved={handleRolePuzzleSolved}
                      onFail={handleRolePuzzleFailed}
                    />
                  )}

                  {activeCockpitRole === 'engineer' && (
                    <EngineerLaserGrid
                      puzzle={currentStagePuzzles.engineer || heistStages[0].puzzles.engineer}
                      isSolved={!!currentStageSolved.engineer}
                      onSolved={handleRolePuzzleSolved}
                      onFail={handleRolePuzzleFailed}
                    />
                  )}

                  {activeCockpitRole === 'scientist' && (
                    <ScientistLab
                      puzzle={currentStagePuzzles.scientist || heistStages[0].puzzles.scientist}
                      isSolved={!!currentStageSolved.scientist}
                      onSolved={handleRolePuzzleSolved}
                      onFail={handleRolePuzzleFailed}
                    />
                  )}

                  {activeCockpitRole === 'cryptographer' && (
                    <CryptographerDeck
                      puzzle={currentStagePuzzles.cryptographer || heistStages[0].puzzles.cryptographer}
                      isSolved={!!currentStageSolved.cryptographer}
                      onSolved={handleRolePuzzleSolved}
                      onFail={handleRolePuzzleFailed}
                    />
                  )}
                </div>

                <div className="lg:col-span-4 space-y-4">
                  <RadioComms
                    messages={radioMessages}
                    activeRole={activeCockpitRole}
                    onSendMessage={handleSendMessage}
                    voiceConnected={isLobbyVoiceConnected}
                    micMuted={isLobbyMicMuted}
                    isDeafened={isLobbyDeafened}
                    onToggleVoice={handleToggleVoice}
                    onToggleMic={handleToggleMic}
                    onToggleDeafen={handleToggleDeafen}
                    isSpeaking={isUserSpeaking}
                  />

                  <div className="bg-[#051C12] p-4 rounded-xl border border-emerald-800/40 space-y-2.5 shadow-md">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-[#FBBF24]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        AI Teammate Assist
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Playing solo or need a squadmate clue? Trigger an AI teammate to solve one of the pending roles.
                    </p>
                    <button
                      onClick={handleSimulateBotTeammates}
                      className="w-full bg-[#10B981] text-[#02140D] font-bold text-xs py-2.5 rounded-lg hover:bg-[#34D399] transition-colors"
                    >
                      🤖 Request AI Teammate Clue
                    </button>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {activeTab === 'missions' && (
            <motion.div
              key="missions"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 max-w-7xl mx-auto"
            >
              <div className="bg-[#051C12] border border-emerald-800/40 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#10B981] text-[#02140D] font-bold text-[10px] px-2.5 py-0.5 rounded uppercase font-mono">
                      Campaigns
                    </span>
                    <span className="text-xs font-mono text-emerald-300">
                      {missions.length} Operations Ready
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1 font-game">
                    STEM Expeditions
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Select a collaborative mission target below to start your co-op heist.
                  </p>
                </div>

                <div className="flex items-center space-x-2.5 self-start sm:self-auto">
                  <button
                    onClick={() => {
                      setIsCustomHeistModalOpen(true);
                      heistAudio.playKeyClick();
                    }}
                    className="bg-[#10B981] text-[#02140D] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-lg hover:bg-[#34D399] transition-colors flex items-center space-x-1.5 shadow-md shadow-emerald-950 font-game"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Custom Heist</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {missions.map((mission, mIdx) => (
                  <div
                    key={mission.id || mIdx}
                    className="bg-[#051C12] border border-emerald-800/40 rounded-xl overflow-hidden shadow-md flex flex-col justify-between hover:border-[#10B981]/70 hover:bg-[#072418] transition-all group"
                  >
                    <div>
                      <div className="relative h-44 overflow-hidden bg-[#020B06]">
                        <img 
                          src={mission.image} 
                          alt={mission.title} 
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_SUBJECT_IMG; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-3 left-3 bg-[#020B06]/85 backdrop-blur-sm text-[#34D399] font-mono text-[10px] font-bold px-2.5 py-1 rounded border border-emerald-900/60">
                          {mission.category}
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded ${
                            mission.difficulty?.includes('Master') 
                              ? 'bg-red-500/90 text-white' 
                              : 'bg-[#10B981] text-[#02140D]'
                          }`}>
                            {mission.difficulty}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-lg text-white group-hover:text-[#10B981] transition-colors font-game">
                            {mission.title}
                          </h3>
                          <span className="text-[11px] font-mono text-amber-300 font-semibold">
                            🎁 {mission.reward}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {mission.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        onClick={() => {
                          if (mission.customStageData) {
                            handleLaunchCustomHeist(mission.customStageData);
                          } else {
                            handleStartHeistStage(mIdx % allStages.length);
                          }
                        }}
                        className="w-full bg-[#10B981] text-[#02140D] font-bold py-2.5 rounded-lg hover:bg-[#34D399] active:scale-[0.98] transition-all text-xs flex items-center justify-center space-x-2 uppercase font-game shadow-md shadow-emerald-950"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Launch Expedition</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 max-w-7xl mx-auto text-left"
            >
              {!isInSquadRoom ? (
                <SquadRecruitmentBoard
                  socket={activeSocket}
                  currentUser={currentUser}
                  onCreateSquad={() => setIsCreateRoomModalOpen(true)}
                  onOpenJoinModal={() => setIsJoinRoomModalOpen(true)}
                  onOpenAgentDirectory={() => setIsAgentDirectoryOpen(true)}
                  onJoinSquad={handleJoinSquadOperation}
                />
              ) : (
                <div className="space-y-4">
                  
                  {/* Leave Squad Button */}
                  <button
                    onClick={() => {
                      setIsLeaveSquadModalOpen(true);
                      heistAudio.playKeyClick();
                    }}
                    className="bg-[#020B06] hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-emerald-900/80 hover:border-rose-700/60 px-4 py-2.5 rounded-2xl text-xs font-mono font-bold flex items-center space-x-2 transition-all shadow-md group"
                  >
                    <LogOut className="w-4 h-4 text-rose-400 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Leave Squad</span>
                  </button>

                  <div className="bg-[#051C12] border border-emerald-800/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden">
                    {/* Background ambient grid pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(#10b98115_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

                    {/* Header Bar */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-emerald-900/60 pb-5 relative z-10">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-[#10B981] text-[#02140D] font-mono font-bold text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
                            SQUAD ASSEMBLED
                          </span>
                      <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded flex items-center space-x-1.5 ${
                        isSocketConnected 
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' 
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-[#10B981] animate-ping' : 'bg-amber-400'}`} />
                        <span>{isSocketConnected ? 'LIVE MESH CONNECTED' : 'LOCAL NETWORK MODE'}</span>
                      </span>
                      <span className="text-xs font-mono text-emerald-300">4-OPERATIVE MULTIPLAYER ROOM</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#F0FDF4] font-game">
                      {lobby?.name || 'Squad Operation'}
                    </h2>
                    <p className="text-slate-300 text-xs sm:text-sm">
                      Coordinate roles, calibrate voice frequencies, and launch synchronized co-op operations.
                    </p>
                  </div>

                  {/* Room Actions & Launch Button */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Room Code with 1-click copy */}
                    <div className="bg-[#020B06] px-3.5 py-2 rounded-xl border border-emerald-800/60 flex items-center space-x-2">
                      <div>
                        <span className="text-[9px] font-mono text-emerald-400 block uppercase font-bold">Room Code</span>
                        <span className="text-base sm:text-lg font-mono font-bold text-[#FBBF24] tracking-widest">{lobby?.code || 'HEIST-782'}</span>
                      </div>
                      <button
                        onClick={handleCopyRoomCode}
                        className="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 hover:text-white hover:bg-emerald-800 transition-all"
                        title="Copy Room Code"
                      >
                        {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={handleCopyInviteLink}
                        className="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 hover:text-white hover:bg-emerald-800 transition-all"
                        title="Copy Invite Link"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-[#10B981]" /> : <Share2 className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Create Room Button */}
                    <button
                      onClick={() => {
                        setIsCreateRoomModalOpen(true);
                        heistAudio.playKeyClick();
                      }}
                      className="bg-[#020B06] text-emerald-300 border border-emerald-700/60 hover:bg-emerald-950/60 font-bold px-3.5 py-2.5 rounded-xl uppercase flex items-center space-x-1.5 text-xs font-game transition-all"
                    >
                      <Plus className="w-4 h-4 text-[#10B981]" />
                      <span>New Room</span>
                    </button>

                    {/* Join by Code Button */}
                    <button
                      onClick={() => {
                        setIsJoinRoomModalOpen(true);
                        heistAudio.playKeyClick();
                      }}
                      className="bg-[#020B06] text-amber-300 border border-amber-700/60 hover:bg-amber-950/60 font-bold px-3.5 py-2.5 rounded-xl uppercase flex items-center space-x-1.5 text-xs font-game transition-all"
                    >
                      <LogIn className="w-4 h-4 text-amber-400" />
                      <span>Join Room</span>
                    </button>

                    {/* Search & Invite by Agent ID */}
                    <button
                      onClick={() => {
                        setIsAgentDirectoryOpen(true);
                        heistAudio.playKeyClick();
                      }}
                      className="bg-[#020B06] text-[#34D399] border border-[#10B981]/60 hover:bg-[#072418] font-bold px-3.5 py-2.5 rounded-xl uppercase flex items-center space-x-1.5 text-xs font-game transition-all"
                      title="Search operatives worldwide by unique Agent ID to invite to this squad"
                    >
                      <Users className="w-4 h-4 text-[#10B981]" />
                      <span>Search by ID</span>
                    </button>

                    {/* Custom Heist Creator */}
                    <button
                      onClick={() => {
                        setIsCustomHeistModalOpen(true);
                        heistAudio.playKeyClick();
                      }}
                      className="bg-[#020B06] text-[#FBBF24] border border-amber-500/60 hover:bg-amber-950/40 font-bold px-3.5 py-2.5 rounded-xl uppercase flex items-center space-x-1.5 text-xs font-game transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Custom</span>
                    </button>

                    {/* Synchronized Squad Launch */}
                    <button
                      onClick={handleStartMultiplayerHeist}
                      className="bg-[#10B981] text-[#02140D] font-bold px-5 py-2.5 rounded-xl hover:bg-[#34D399] uppercase flex items-center space-x-2 text-sm font-game shadow-lg shadow-emerald-950 transition-all"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>LAUNCH SQUAD HEIST</span>
                    </button>
                  </div>
                </div>

                {/* Squad Radio Voice Frequency Bar */}
                <div className="bg-[#020E08] border border-emerald-800/60 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center space-x-3.5">
                    <div className={`p-2.5 rounded-xl border transition-all ${
                      isLobbyVoiceConnected
                        ? 'bg-[#042416] border-[#10B981] text-[#10B981] shadow-[0_0_12px_#10B98144]'
                        : 'bg-[#020B06] border-slate-700 text-slate-500'
                    }`}>
                      <Radio className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white font-game">
                          Squad Radio Frequency: <span className="text-amber-300 font-mono">SYLVAN-142.85 MHz</span>
                        </span>
                        <span className={`w-2 h-2 rounded-full ${isLobbyVoiceConnected ? 'bg-[#10B981] animate-ping' : 'bg-slate-600'}`} />
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 mt-0.5">
                        <span className={isLobbyVoiceConnected ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {isLobbyVoiceConnected ? '● VOICE COMMS LIVE' : '○ VOICE COMMS MUTED'}
                        </span>
                        <span>•</span>
                        <span>Low-Latency Opus HD</span>
                        <span>•</span>
                        <span>{(lobby?.players || []).filter(p => p?.playerName || p?.username).length} / 4 Operatives Linked</span>
                      </div>
                    </div>
                  </div>

                  {isLobbyVoiceConnected && !isLobbyMicMuted && (
                    <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-[#020B06] rounded-xl border border-emerald-500/40 shadow-inner">
                      <span className="text-[10px] font-mono font-black text-emerald-400 mr-1.5">MIC AUDIO:</span>
                      {micVolumeBars.map((h, i) => (
                        <span
                          key={i}
                          style={{ height: `${h}px` }}
                          className="w-1 bg-[#10B981] rounded-full transition-all duration-75"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleToggleMic}
                      className={`px-3 py-2 rounded-xl text-xs font-bold font-game flex items-center space-x-1.5 transition-all ${
                        isLobbyMicMuted
                          ? 'bg-red-950/80 text-red-300 border border-red-800'
                          : isUserSpeaking
                          ? 'bg-[#063520] text-[#10B981] border-[#10B981] ring-1 ring-[#10B981]'
                          : 'bg-[#042416] text-[#34D399] border border-emerald-700 hover:bg-[#073621]'
                      }`}
                      title={isLobbyMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                    >
                      {isLobbyMicMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-[#10B981]" />}
                      <span>{isLobbyMicMuted ? 'Muted' : 'Mic On'}</span>
                    </button>

                    <button
                      onClick={handleToggleDeafen}
                      className={`px-3 py-2 rounded-xl text-xs font-bold font-game flex items-center space-x-1.5 transition-all ${
                        isLobbyDeafened
                          ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                          : 'bg-[#020B06] text-slate-300 border border-emerald-900/60 hover:text-white'
                      }`}
                      title={isLobbyDeafened ? "Undeafen Audio" : "Deafen Audio"}
                    >
                      {isLobbyDeafened ? <VolumeX className="w-4 h-4 text-purple-400" /> : <Headphones className="w-4 h-4 text-slate-300" />}
                      <span>{isLobbyDeafened ? 'Deafened' : 'Sound'}</span>
                    </button>

                    <button
                      onClick={() => {
                        heistAudio.playRadioSquelch();
                        toast.success("📻 Transmitting squad radio ping across all slots!");
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-bold font-game bg-[#020B06] text-amber-300 border border-amber-900/60 hover:bg-amber-950/40 flex items-center space-x-1.5 transition-all"
                      title="Test Voice Channel Ping"
                    >
                      <Radio className="w-4 h-4" />
                      <span>Radio Ping</span>
                    </button>

                    <button
                      onClick={handleToggleVoice}
                      className={`p-2 rounded-xl border transition-all ${
                        isLobbyVoiceConnected
                          ? 'bg-red-950/40 border-red-900/80 text-red-400 hover:bg-red-900/60'
                          : 'bg-emerald-950 border-emerald-700 text-[#10B981]'
                      }`}
                      title={isLobbyVoiceConnected ? "Disconnect Voice Call" : "Connect Voice Call"}
                    >
                      {isLobbyVoiceConnected ? <PhoneOff className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 4 Squad Operatives Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                  {(lobby?.players || []).map((slot) => {
                    const char = characters.find(c => c.id === slot.characterId);
                    const playerName = slot.playerName || slot.username;
                    const myId = currentUser?.id || localStorage.getItem('vault_guest_id');
                    const myName = currentUser?.username || localStorage.getItem('vault_guest_name');
                    const isMe = (slot.userId && slot.userId === myId) || (myName && playerName === myName);
                    const isSpeaking = isLobbyVoiceConnected && !isLobbyMicMuted && isMe && isUserSpeaking;

                    return (
                      <div
                        key={slot.slotId}
                        className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                          playerName 
                            ? isSpeaking
                              ? 'bg-[#042416] border-[#10B981] shadow-[0_0_18px_#10B98144]'
                              : 'bg-[#051C12] border-emerald-800/50 shadow-md' 
                            : 'bg-[#020B06]/70 border-dashed border-emerald-950'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="bg-[#020B06] text-emerald-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-900">
                              SLOT 0{slot.slotId}
                            </span>
                            
                            {playerName && isLobbyVoiceConnected && (
                              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded flex items-center space-x-1 ${
                                isSpeaking
                                  ? 'bg-[#10B981] text-[#02140D] animate-pulse'
                                  : isLobbyMicMuted && isMe
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : 'bg-[#020B06] text-emerald-400 border border-emerald-900'
                              }`}>
                                {isSpeaking ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#02140D] animate-ping" />
                                    <span>SPEAKING</span>
                                  </>
                                ) : isLobbyMicMuted && isMe ? (
                                  <>
                                    <MicOff className="w-2.5 h-2.5 text-red-300" />
                                    <span>MUTED</span>
                                  </>
                                ) : (
                                  <>
                                    <Mic className="w-2.5 h-2.5 text-[#10B981]" />
                                    <span>VOICE READY</span>
                                  </>
                                )}
                              </span>
                            )}
                          </div>

                          {playerName ? (
                            <div className="space-y-3 text-center">
                              <div className="relative w-16 h-16 mx-auto">
                                <img 
                                  src={char?.avatar || FALLBACK_AVATAR_IMG} 
                                  alt={playerName} 
                                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_AVATAR_IMG; }}
                                  className={`w-16 h-16 rounded-2xl border-2 object-cover transition-all ${
                                    isSpeaking ? 'border-[#10B981] ring-4 ring-[#10B981]/30 scale-105' : 'border-emerald-800'
                                  }`}
                                />
                                {slot.isHost && (
                                  <span className="absolute -top-1.5 -right-1.5 bg-[#FBBF24] text-[#02140D] text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">
                                    ★ HOST
                                  </span>
                                )}
                                {isMe && (
                                  <span className="absolute -bottom-1.5 -left-1.5 bg-[#10B981] text-[#02140D] text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">
                                    YOU
                                  </span>
                                )}
                              </div>

                              <div>
                                <h4 className="font-bold text-base text-white font-game">{playerName}</h4>
                                
                                {(() => {
                                  const isRegisteredUser = slot.userId && /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(slot.userId);
                                  const slotTag = slot.agentId || (isRegisteredUser ? `VAULT-${slot.userId.replace(/-/g, '').substring(0, 8).toUpperCase()}` : null);
                                  
                                  return slotTag ? (
                                    <div className="flex items-center justify-center space-x-1 mt-0.5">
                                      <span className="text-[9px] font-mono font-bold text-[#FBBF24] bg-[#020B06] px-1.5 py-0.2 rounded border border-emerald-900/60">
                                        {slotTag}
                                      </span>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(slotTag);
                                          heistAudio.playKeyClick();
                                          toast.success(`📋 Copied ${playerName}'s ID: ${slotTag}`);
                                        }}
                                        className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                                        title="Copy Operative ID"
                                      >
                                        <Copy className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center mt-0.5">
                                      <span className="text-[9px] font-mono font-bold text-slate-400 bg-[#020B06] px-1.5 py-0.2 rounded border border-slate-800">
                                        GUEST
                                      </span>
                                    </div>
                                  );
                                })()}
                                
                                {isMe ? (
                                  <div className="mt-1.5">
                                    <label className="text-[9px] font-mono text-emerald-400 block mb-0.5 font-bold uppercase">Role Selector</label>
                                    <select
                                      value={normalizeRoleKey(slot.role)}
                                      onChange={(e) => handleSelectRole(e.target.value)}
                                      className="w-full bg-[#020B06] border border-emerald-700/80 rounded-lg py-1 px-2 text-[11px] font-bold text-[#6EE7B7] uppercase font-mono outline-none cursor-pointer focus:border-[#10B981]"
                                    >
                                      <option value="hacker">Hacker (CS & Logic)</option>
                                      <option value="engineer">Engineer (Optics & Physics)</option>
                                      <option value="scientist">Scientist (Chemistry)</option>
                                      <option value="cryptographer">Cryptographer (Math)</option>
                                    </select>
                                  </div>
                                ) : (
                                  <div className="inline-block bg-[#10B981]/20 border border-[#10B981]/40 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase text-[#6EE7B7] mt-1 font-mono">
                                    {slot.role}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="py-8 text-center space-y-2">
                              <UserPlus className="w-8 h-8 text-emerald-700 mx-auto" />
                              <p className="text-xs font-bold text-emerald-500 font-game">Empty Operative Slot</p>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-emerald-950">
                          {playerName ? (
                            isMe ? (
                              <button
                                onClick={() => handleToggleReady(slot.isReady)}
                                className={`w-full py-2 rounded-lg text-xs font-bold font-game uppercase transition-all flex items-center justify-center space-x-1.5 ${
                                  slot.isReady
                                    ? 'bg-[#042416] text-[#10B981] border border-emerald-600 hover:bg-emerald-950'
                                    : 'bg-[#FBBF24] text-[#02140D] hover:bg-[#F59E0B]'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{slot.isReady ? 'READY (Click to Standby)' : 'CLICK TO READY'}</span>
                              </button>
                            ) : (
                              <div className="flex items-center justify-center space-x-1.5 text-xs font-bold font-game">
                                <CheckCircle2 className={`w-4 h-4 ${slot.isReady ? 'text-[#10B981]' : 'text-amber-400'}`} />
                                <span className={slot.isReady ? 'text-[#10B981]' : 'text-amber-400'}>
                                  {slot.isReady ? 'SYNCED & READY' : 'STANDBY'}
                                </span>
                              </div>
                            )
                          ) : (
                            <button
                              onClick={() => handleClaimSlot(slot.slotId)}
                              className="w-full bg-[#FBBF24] text-[#02140D] font-bold text-xs py-2 rounded-lg hover:bg-[#F59E0B] uppercase font-game transition-all"
                            >
                              + Claim Slot
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Live Squad Tactical Radio & Chat Stream */}
                <div className="bg-[#020B06] border border-emerald-900/60 rounded-2xl p-4 sm:p-5 space-y-3.5 relative z-10 shadow-2xl">
                  {/* Chat Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-950 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-950/90 border border-emerald-700/60 text-[#10B981]">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-white font-game uppercase tracking-wider">
                            Squad Tactical Comms & Live Chat
                          </h3>
                          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                        </div>
                        <p className="text-[10px] font-mono text-emerald-400/80">
                          REAL-TIME ENCRYPTED SQUAD FREQUENCY • {lobby.code ? `ROOM: ${lobby.code}` : 'SQUAD CHANNEL'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] font-mono">
                      <span className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                        isLobbyVoiceConnected 
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700' 
                          : 'bg-[#051C12] text-slate-400 border-emerald-900/50'
                      }`}>
                        <Radio className="w-3 h-3 text-[#10B981]" />
                        <span>{isLobbyVoiceConnected ? 'VOICE MESH LIVE' : 'VOICE STANDBY'}</span>
                      </span>
                      <span className="bg-[#042416] text-[#FBBF24] border border-amber-900/60 px-2.5 py-1 rounded-lg font-bold">
                        {radioMessages.length} TRANSMISSIONS
                      </span>
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div className="h-56 sm:h-64 overflow-y-auto space-y-2 bg-[#04160E]/90 p-3.5 rounded-xl border border-emerald-950 font-mono text-xs shadow-inner custom-scrollbar">
                    {(!radioMessages || radioMessages.length === 0) ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2 text-slate-400">
                        <Radio className="w-6 h-6 text-emerald-600 animate-pulse" />
                        <p className="text-xs text-emerald-300 font-bold font-game">Tactical Frequency Clear</p>
                        <p className="text-[11px] text-slate-400 max-w-xs">
                          Coordinate role specializations, strategy, or test squad communications below.
                        </p>
                      </div>
                    ) : (
                      (radioMessages || []).map((msg, idx) => {
                        const isStringMsg = typeof msg === 'string';
                        const sender = isStringMsg ? 'OPERATIVE' : msg?.sender || 'OPERATIVE';
                        const text = isStringMsg ? msg : msg?.text || '';
                        const time = isStringMsg
                          ? 'NOW'
                          : (msg?.timestamp
                              ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : msg?.time || 'NOW');
                        const roleKey = (isStringMsg ? 'hacker' : msg?.role || 'hacker').toLowerCase();

                        const roleBadgeStyle = 
                          roleKey.includes('hacker') ? 'text-[#10B981] bg-emerald-950/80 border-emerald-700/60' :
                          roleKey.includes('engineer') ? 'text-[#FBBF24] bg-amber-950/80 border-amber-700/60' :
                          roleKey.includes('scientist') ? 'text-[#06B6D4] bg-cyan-950/80 border-cyan-700/60' :
                          roleKey.includes('cryptographer') || roleKey.includes('crypto') ? 'text-[#C084FC] bg-purple-950/80 border-purple-700/60' :
                          roleKey.includes('hq') ? 'text-[#FBBF24] bg-[#020B06] border-amber-500/50' :
                          'text-emerald-300 bg-emerald-950/60 border-emerald-800/40';

                        return (
                          <div 
                            key={idx} 
                            className="p-2 rounded-lg bg-[#020B06]/70 border border-emerald-900/30 hover:border-emerald-700/50 transition-colors flex items-start justify-between gap-2"
                          >
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border font-mono ${roleBadgeStyle}`}>
                                  {sender}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  [{time}]
                                </span>
                              </div>
                              <p className="text-slate-100 text-xs break-words leading-relaxed pl-0.5 pt-0.5">
                                {text}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={lobbyChatEndRef} />
                  </div>

                  {/* Quick Tactical Macro Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase mr-1">
                      Quick Macros:
                    </span>
                    {[
                      "🎯 Taking Hacker (CS & Logic)",
                      "🔧 Taking Engineer (Optics & Physics)",
                      "🧪 Taking Scientist (Chemistry)",
                      "🔐 Taking Cryptographer (Ciphers)",
                      "🚀 All slots confirmed, ready to launch!",
                      "🎙️ Mic check, 5x5 loud and clear."
                    ].map((macro, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendLobbyQuickMacro(macro)}
                        className="bg-[#042416] text-emerald-300 hover:text-white hover:bg-[#10B981] hover:border-emerald-400 border border-emerald-800/60 text-[10px] font-mono px-2.5 py-1 rounded-lg transition-all"
                      >
                        {macro}
                      </button>
                    ))}
                  </div>

                  {/* Message Composer Input Form */}
                  <form onSubmit={handleSendLobbyRadio} className="flex gap-2 pt-1">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={lobbyRadioInput}
                        onChange={(e) => setLobbyRadioInput(e.target.value)}
                        placeholder={`Broadcast tactical comms to squad room (${lobby.code || 'Squad'})...`}
                        className="w-full bg-[#051811] border border-emerald-800/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-mono text-emerald-100 placeholder-emerald-800/80 outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!lobbyRadioInput.trim()}
                      className="bg-[#10B981] disabled:opacity-40 disabled:cursor-not-allowed text-[#02140D] font-bold px-5 py-2.5 rounded-xl hover:bg-[#34D399] uppercase text-xs font-game flex items-center space-x-1.5 shadow-md shadow-emerald-950 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmit</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

          {activeTab === 'characters' && (
            <motion.div
              key="characters"
              initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(3px)' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#03140C] pb-4 bg-[#071E14]/70 p-4 backdrop-blur-md">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight flex items-center space-x-2 text-[#F0FDF4]">
                    <Sparkles className="w-8 h-8 text-[#10B981]" />
                    <span>The 4 Specialized Heist Roles</span>
                  </h2>
                  <p className="text-emerald-200 font-medium">Every role commands a crucial academic discipline and puzzle toolkit.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {characters.map(char => (
                  <div 
                    key={char.id}
                    className="forest-card p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 border-2 border-[#03140C] overflow-hidden bg-[#03140C]">
                        <img 
                          src={char.avatar} 
                          alt={char.name} 
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_AVATAR_IMG; }}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 bg-[#10B981] text-[#02140D] font-black text-xs px-2.5 py-0.5 border border-[#03140C] uppercase">
                          {char.role}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2">
                        <h3 className="text-xl font-black text-[#F0FDF4] uppercase">{char.name}</h3>
                        <p className="text-xs text-emerald-200/90 font-medium leading-relaxed">{char.description}</p>
                        
                        <div className="bg-[#03140C] p-2.5 border border-[#0E3A28] mt-3">
                          <p className="text-[10px] uppercase font-black text-[#FBBF24]">Special Grove Trait</p>
                          <p className="text-xs font-bold text-emerald-300">{char.specialAbility}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const roleMap = {
                          c1: 'hacker',
                          c2: 'engineer',
                          c3: 'scientist',
                          c4: 'cryptographer'
                        };
                        setActiveCockpitRole(roleMap[char.id] || 'hacker');
                        setActiveTab('liveheist');
                        toast.info(`Selected ${char.name} (${char.role})!`);
                      }}
                      className="w-full bg-[#10B981] text-[#02140D] font-black text-xs py-2.5 border-2 border-[#03140C] shadow-[2px_2px_0px_#020C07] hover:bg-[#34D399] uppercase mt-4"
                    >
                      Enter Cockpit
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'topics' && (
            <motion.div
              key="topics"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 max-w-7xl mx-auto text-left"
            >
              <GraphicalRoadmap 
                onStartHeist={handleStartHeistStage}
                onOpenModal={() => setIsRoadmapModalOpen(true)}
              />
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 max-w-7xl mx-auto text-left"
            >
              <div className="bg-[#051C12] border border-emerald-800/40 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#10B981] text-[#02140D] font-mono font-bold text-[10px] px-2.5 py-0.5 rounded uppercase">
                      Tactical Map
                    </span>
                    <span className="text-xs font-mono text-emerald-300">
                      4 Sequential Vault Chambers
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-game">
                    Canopy Grove Mind Map
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Unlock and clear sequential security chambers of the World Tree sanctuary by answering tactical STEM checks.
                  </p>
                </div>

                <div className="flex items-center space-x-2.5 font-mono text-xs">
                  <div className="bg-[#020B06] px-3.5 py-2 rounded-xl border border-emerald-800/60 flex items-center space-x-1.5">
                    <span className="text-slate-400">Vault XP:</span>
                    <span className="text-[#10B981] font-bold">{xp} XP</span>
                  </div>
                  <div className="bg-[#020B06] px-3.5 py-2 rounded-xl border border-amber-900/60 flex items-center space-x-1.5">
                    <span className="text-slate-400">Streak:</span>
                    <span className="text-amber-400 font-bold">{streak} 🔥</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { num: 1, name: "Roots of Logic", discipline: "Computer Science", color: "#10B981" },
                  { num: 2, name: "Prism Canopy", discipline: "Physics & Optics", color: "#FBBF24" },
                  { num: 3, name: "Caustic Bio-Vault", discipline: "Bio-Chemistry", color: "#60A5FA" },
                  { num: 4, name: "Nexus Mastermind", discipline: "Cryptography", color: "#C084FC" }
                ].map(chamber => {
                  const roomNum = chamber.num;
                  const q = triviaQuestions[roomNum];
                  const isUnlocked = unlockedRooms.includes(roomNum);
                  const isDone = !!roomSolved[roomNum];

                  return (
                    <div 
                      key={roomNum}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-md ${
                        isDone 
                          ? 'bg-[#041C12] border-emerald-500/80' 
                          : isUnlocked 
                          ? 'bg-[#051C12] border-amber-400/60' 
                          : 'bg-[#020B06]/70 border-emerald-950 opacity-60'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#020B06] border border-emerald-900" style={{ color: chamber.color }}>
                            CHAMBER 0{roomNum}
                          </span>
                          
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center space-x-1 ${
                            isDone ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
                            isUnlocked ? 'bg-amber-950 text-amber-300 border border-amber-700' :
                            'bg-slate-900 text-slate-500 border border-slate-800'
                          }`}>
                            {isDone ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                                <span>CLEARED</span>
                              </>
                            ) : isUnlocked ? (
                              <>
                                <Unlock className="w-3 h-3 text-[#FBBF24]" />
                                <span>READY</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 text-slate-500" />
                                <span>LOCKED</span>
                              </>
                            )}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-base text-white font-game">{chamber.name}</h3>
                          <p className="text-[11px] font-mono text-emerald-400">{chamber.discipline}</p>
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed font-sans pt-1">
                          {q?.question}
                        </p>

                        <div className="space-y-1.5 pt-2">
                          {q?.options.map((opt, oIdx) => {
                            const isCorrectOpt = isDone && oIdx === q.correct;
                            return (
                              <button
                                key={oIdx}
                                disabled={!isUnlocked || isDone}
                                onClick={() => {
                                  if (oIdx === q.correct) {
                                    heistAudio.playSuccessChime();
                                    setRoomSolved(prev => ({ ...prev, [roomNum]: true }));
                                    setUnlockedRooms(prev => [...new Set([...prev, roomNum + 1])]);
                                    setXp(prev => prev + 250);
                                    toast.success(`🎉 Chamber 0${roomNum} Cleared! +250 XP Awarded!`);
                                  } else {
                                    heistAudio.playAlarmSiren();
                                    toast.error("⚠️ Security Gate Triggered! Review concept and try again.");
                                  }
                                }}
                                className={`w-full text-left p-2.5 rounded-lg text-xs font-mono border transition-all ${
                                  isCorrectOpt
                                    ? 'bg-[#10B981] text-[#02140D] font-bold border-[#10B981]'
                                    : isUnlocked && !isDone
                                    ? 'bg-[#020B06] text-slate-200 border-emerald-800/60 hover:bg-[#10B981] hover:text-[#02140D] hover:border-emerald-400 cursor-pointer'
                                    : 'bg-[#020B06]/50 text-slate-500 border-transparent cursor-not-allowed'
                                }`}
                              >
                                <span className="font-bold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-emerald-950 flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Bounty: +250 XP</span>
                        {isDone ? (
                          <span className="text-[#10B981] font-bold">✓ Gate Overridden</span>
                        ) : isUnlocked ? (
                          <span className="text-amber-300 font-bold">Select Answer 👆</span>
                        ) : (
                          <span>Requires Ch. 0{roomNum - 1}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'builder' && (
            <motion.div
              key="builder"
              initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(3px)' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="forest-card p-6 sm:p-8 space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#03140C] pb-4">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight text-[#F0FDF4]">Heist Architect Workshop</h2>
                  <p className="text-emerald-200 text-sm">Design custom multi-stage educational heists and configure active squad roles.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomHeistModalOpen(true);
                    heistAudio.playKeyClick();
                  }}
                  className="bg-[#FBBF24] text-[#02140D] font-black px-5 py-2.5 border-[3px] border-[#03140C] shadow-[3px_3px_0px_#020C07] hover:bg-[#F59E0B] active:translate-x-0.5 uppercase flex items-center space-x-2 text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Visual Heist Studio</span>
                </button>
              </div>

              <form onSubmit={handleSaveCustomMission} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-xs font-mono font-bold text-emerald-300 mb-1">Expedition Title</label>
                  <input
                    type="text"
                    required
                    value={builder.title}
                    onChange={e => setBuilder({ ...builder, title: e.target.value })}
                    placeholder="e.g. The Quantum Redwood Reactor"
                    className="w-full bg-[#020B06] border-2 border-[#03140C] p-3 text-emerald-100 font-mono text-sm focus:border-[#10B981] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-emerald-300 mb-1">Discipline Category</label>
                    <select
                      value={builder.category}
                      onChange={e => setBuilder({ ...builder, category: e.target.value })}
                      className="w-full bg-[#020B06] border-2 border-[#03140C] p-3 text-emerald-100 font-mono text-sm focus:border-[#10B981] outline-none"
                    >
                      <option>Forest Botany & Lore</option>
                      <option>Ecology & Sunlight</option>
                      <option>Computer Science & Logic</option>
                      <option>Applied Physics & Math</option>
                      <option>Ancient Earth & Archeology</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-emerald-300 mb-1">Difficulty Tier</label>
                    <select
                      value={builder.difficulty}
                      onChange={e => setBuilder({ ...builder, difficulty: e.target.value })}
                      className="w-full bg-[#020B06] border-2 border-[#03140C] p-3 text-emerald-100 font-mono text-sm focus:border-[#10B981] outline-none"
                    >
                      <option>Easy (Beginner)</option>
                      <option>Medium (Intermediate)</option>
                      <option>Master Expedition (Advanced)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-emerald-300 mb-1">Expedition Lore / Briefing</label>
                  <textarea
                    rows={3}
                    required
                    value={builder.description}
                    onChange={e => setBuilder({ ...builder, description: e.target.value })}
                    placeholder="Describe the target vault, storyline, and stakes..."
                    className="w-full bg-[#020B06] border-2 border-[#03140C] p-3 text-emerald-100 font-mono text-sm focus:border-[#10B981] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-emerald-300 mb-1">Core Security Gate Question</label>
                  <input
                    type="text"
                    required
                    value={builder.question}
                    onChange={e => setBuilder({ ...builder, question: e.target.value })}
                    placeholder="e.g. Which pigment absorbs blue and red wavelengths of light for photosynthesis?"
                    className="w-full bg-[#020B06] border-2 border-[#03140C] p-3 text-emerald-100 font-mono text-sm focus:border-[#10B981] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-emerald-300 mb-1">Correct Solution Answer</label>
                  <input
                    type="text"
                    required
                    value={builder.answer}
                    onChange={e => setBuilder({ ...builder, answer: e.target.value })}
                    placeholder="e.g. Chlorophyll a & b"
                    className="w-full bg-[#020B06] border-2 border-[#03140C] p-3 text-emerald-100 font-mono text-sm focus:border-[#10B981] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={builderSaving}
                  className="bg-[#10B981] text-[#02140D] font-black py-3 px-8 border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#34D399] uppercase text-sm"
                >
                  {builderSaving ? "Compiling Blueprint..." : "Publish Expedition Blueprint"}
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === 'waitlist' && (
            <motion.div 
              key="waitlist"
              initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(3px)' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="forest-card p-6 sm:p-8 space-y-6 max-w-2xl mx-auto text-center"
            >
              <Rocket className="w-12 h-12 text-[#FBBF24] mx-auto animate-bounce" />
              <h2 className="text-3xl font-black uppercase tracking-tight text-[#F0FDF4]">
                The Syndicate Battle Pass
              </h2>
              <p className="text-emerald-200 text-sm">
                Unlock exclusive cosmetic terminal skins, custom laser beam colors, specialized sound packs, and weekly high-stakes raid tournaments!
              </p>

              {waitlistSuccess ? (
                <div className="p-4 bg-[#0A3020] border-2 border-[#10B981] text-[#10B981] font-mono font-black text-sm">
                  🎉 Priority Syndicate Pass Access Reserved! Check your inbox for briefing credentials.
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!emailInput.trim()) return;
                    setWaitlistSuccess(true);
                    heistAudio.playSuccessChime();
                    toast.success("Syndicate Pass reservation confirmed!");
                  }} 
                  className="space-y-3"
                >
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder="Enter your student or ranger email..."
                    className="w-full bg-[#020B06] border-2 border-[#03140C] p-3 text-emerald-100 font-mono text-sm focus:border-[#10B981] outline-none text-center"
                  />
                  <button
                    type="submit"
                    className="w-full bg-[#FBBF24] text-[#02140D] font-black py-3 border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#F59E0B] uppercase text-sm"
                  >
                    Claim Syndicate Pass
                  </button>
                </form>
              )}
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(3px)' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <StatsDashboard
                currentUser={currentUser}
                onLogout={handleLogout}
                onStartHeist={handleStartHeistStage}
                onUpdateUser={(updated) => {
                  setCurrentUser(prev => prev ? { ...prev, ...updated } : prev);
                }}
                onNavigate={(dest) => {
                  if (dest === 'login') {
                    setIsAuthModalOpen(true);
                  } else {
                    navigateToTab(dest);
                  }
                }}
              />
            </motion.div>
          )}

          </AnimatePresence>
        </main>
          </div>
        </div>
      </div>

      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020B06]/80 backdrop-blur-sm animate-fade-in">
          <div className="forest-card max-w-md w-full p-6 space-y-5 border-[4px] border-[#03140C] bg-[#051811] shadow-[8px_8px_0px_#020C07]">
            <div className="flex justify-between items-center border-b-2 border-[#03140C] pb-3">
              <h3 className="text-xl font-black uppercase text-[#F0FDF4]">Claim Ranger Slot 0{targetSlotId}</h3>
              <button onClick={() => setIsJoinModalOpen(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleJoinLobbySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-emerald-300 mb-1">Ranger Codename</label>
                <input
                  type="text"
                  required
                  value={joinPlayerName}
                  onChange={e => setJoinPlayerName(e.target.value)}
                  placeholder="e.g. Agent Willow"
                  className="w-full bg-[#020B06] border-2 border-[#03140C] p-3 text-emerald-100 font-mono text-sm focus:border-[#10B981] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-emerald-300 mb-1">Select Role</label>
                <select
                  value={joinRole}
                  onChange={e => {
                    setJoinRole(e.target.value);
                    const charMap = {
                      'Canopy Hacker': 'c1',
                      'Woodland Safecracker': 'c2',
                      'Flora Historian': 'c3',
                      'Mist Infiltrator': 'c4'
                    };
                    setJoinCharacterId(charMap[e.target.value] || 'c1');
                  }}
                  className="w-full bg-[#020B06] border-2 border-[#03140C] p-3 text-emerald-100 font-mono text-sm focus:border-[#10B981] outline-none"
                >
                  <option>Canopy Hacker</option>
                  <option>Woodland Safecracker</option>
                  <option>Flora Historian</option>
                  <option>Mist Infiltrator</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#10B981] text-[#02140D] font-black py-3 border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#34D399] uppercase text-sm"
              >
                Confirm Squad Slot
              </button>
            </form>
          </div>
        </div>
      )}

      <CreateCustomHeistModal
        isOpen={isCustomHeistModalOpen}
        onClose={() => setIsCustomHeistModalOpen(false)}
        onSaveHeist={handleSaveCustomHeist}
        onLaunchCustomHeist={handleLaunchCustomHeist}
      />

      <SkillAnalyticsModal
        isOpen={analyticsModalOpen}
        isVictory={isMatchVictory}
        stageTitle={currentStageData.title}
        stats={analyticsStats}
        stageData={currentStageData}
        solvedRoles={currentStageSolved}
        onOpenRoadmap={() => {
          setIsRoadmapModalOpen(true);
        }}
        onNextStage={() => {
          setAnalyticsModalOpen(false);
          const nextIdx = (currentStageIdx + 1) % allStages.length;
          handleStartHeistStage(nextIdx);
        }}
        onRetry={() => {
          setAnalyticsModalOpen(false);
          handleStartHeistStage(currentStageIdx);
        }}
        onReturnToLobby={() => {
          setAnalyticsModalOpen(false);
          setActiveTab('lobby');
        }}
      />

      <RemediationRoadmapModal
        isOpen={isRoadmapModalOpen}
        onClose={() => setIsRoadmapModalOpen(false)}
        stageData={currentStageData}
        solvedRoles={currentStageSolved}
        alarmFails={alarmFails}
        onRetryWithHints={() => {
          setIsRoadmapModalOpen(false);
          setAnalyticsModalOpen(false);
          handleStartHeistStage(currentStageIdx);
          setTimeLeft(prev => prev + 60);
          toast.success("💡 Tactical retry initiated with +60s bonus time!");
        }}
      />

      {isEndHeistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020B06]/75 backdrop-blur-xl animate-fade-in">
          <div className="max-w-xl w-full p-6 sm:p-8 space-y-6 border-4 border-[#042416]/90 bg-[#0D4A32]/55 backdrop-blur-2xl rounded-[36px] shadow-[10px_10px_0px_#03140C] text-left relative overflow-hidden text-white animate-cartoon-pop">
            
            {/* Playful Ambient Background Dots & Frost Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(#34d39925_2px,transparent_2px)] [background-size:16px_16px] pointer-events-none opacity-80" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Cartoon Header */}
            <div className="flex items-start justify-between gap-4 border-b-4 border-[#042416]/80 pb-5 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-1.5 bg-[#FDE047] text-[#02140D] font-mono font-black text-xs px-3 py-1 rounded-xl uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000] rotate-[-1.5deg] animate-badge-bounce">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>HQ Tactical Broadcast</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-game drop-shadow-md">
                  Conclude Mission, Agent?
                </h2>
                <p className="text-[#A7F3D0] text-xs sm:text-sm font-medium leading-relaxed">
                  Currently infiltrating <span className="bg-[#06291B]/90 backdrop-blur-sm text-[#FDE047] px-2.5 py-0.5 rounded-lg border border-[#10B981]/60 font-mono font-bold">{currentStageData.title}</span>. Choose an exit directive:
                </p>
              </div>

              <button 
                onClick={() => setIsEndHeistModalOpen(false)} 
                className="w-10 h-10 rounded-2xl bg-[#06291B]/90 hover:bg-[#FF4D6D] text-white border-2 border-black font-black text-sm flex items-center justify-center shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all backdrop-blur-sm"
                title="Resume Heist"
              >
                ✕
              </button>
            </div>

            {/* Frosted Cartoon Directive Option Cards */}
            <div className="space-y-4 relative z-10 font-mono">
              
              {/* Option 1: Claim Loot & Debrief (Frosted Jade & Gold) */}
              <div
                onClick={() => handleConcludeHeist('debrief')}
                className="p-4 sm:p-5 rounded-3xl border-3 border-[#052817]/90 bg-[#135C3E]/80 hover:bg-[#18704C]/90 backdrop-blur-md shadow-[5px_5px_0px_#03180E] active:translate-x-0.5 active:translate-y-0.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#FDE047] border-2 border-black flex items-center justify-center text-3xl shadow-[3px_3px_0px_#000] flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 group-hover:animate-icon-wobble transition-transform">
                    🏆
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-base sm:text-lg text-white font-game group-hover:text-[#FDE047] transition-colors">
                        CLAIM LOOT & DEBRIEF
                      </h3>
                      <span className="text-[10px] bg-[#34D399] text-[#02140D] font-black px-2 py-0.5 rounded-md border border-black hidden sm:inline-block">
                        +XP
                      </span>
                    </div>
                    <p className="text-xs text-[#D1FAE5] font-medium mt-0.5">
                      Save stage progress, inspect telemetry & log victory stats!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="bg-[#10B981]/90 hover:bg-[#34D399] text-[#02140D] font-black text-xs px-4 py-3 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] uppercase font-game transition-all flex items-center justify-center space-x-1.5 flex-shrink-0 group-hover:shadow-[4px_4px_0px_#000] backdrop-blur-sm"
                >
                  <span>Claim Loot</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* Option 2: Emergency Abort (Frosted Crimson & Coral) */}
              <div
                onClick={() => handleConcludeHeist('abort')}
                className="p-4 sm:p-5 rounded-3xl border-3 border-[#2E0B12]/90 bg-[#4D1420]/80 hover:bg-[#631B2B]/90 backdrop-blur-md shadow-[5px_5px_0px_#1B060B] active:translate-x-0.5 active:translate-y-0.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#FF4D6D] border-2 border-black flex items-center justify-center text-3xl shadow-[3px_3px_0px_#000] flex-shrink-0 group-hover:scale-110 group-hover:-rotate-3 group-hover:animate-icon-wobble transition-transform">
                    🚨
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-base sm:text-lg text-white font-game group-hover:text-[#FDA4AF] transition-colors">
                        EMERGENCY EJECT (ABORT)
                      </h3>
                      <span className="text-[10px] bg-[#881337] text-[#FECDD3] font-bold px-2 py-0.5 rounded-md border border-[#BE123C] hidden sm:inline-block">
                        RETREAT
                      </span>
                    </div>
                    <p className="text-xs text-[#FECDD3] font-medium mt-0.5">
                      Hit the emergency exfil button and retreat to HQ base.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="bg-[#FF4D6D]/90 hover:bg-[#FF3366] text-white font-black text-xs px-4 py-3 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] uppercase font-game transition-all flex items-center justify-center space-x-1.5 flex-shrink-0 group-hover:shadow-[4px_4px_0px_#000] backdrop-blur-sm"
                >
                  <span>Abort Mission</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

            </div>

            {/* Frosted Cartoon Footer / Resume Button */}
            <div className="pt-2 relative z-10 font-mono">
              <button
                onClick={() => setIsEndHeistModalOpen(false)}
                className="w-full bg-[#06291B]/85 hover:bg-[#0A3D29]/95 backdrop-blur-md text-[#34D399] hover:text-[#10B981] font-black py-3.5 rounded-2xl border-2 border-[#10B981]/60 shadow-[4px_4px_0px_#03180E] text-xs font-game uppercase transition-all flex items-center justify-center space-x-2 active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>🎮 ← KEEP PLAYING (RESUME MISSION)</span>
              </button>
            </div>

          </div>
        </div>
      )}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Join Multiplayer Squad Room Modal */}
      {isJoinRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020B06]/85 backdrop-blur-md animate-fade-in">
          <div className="forest-card max-w-md w-full p-6 space-y-5 border-[4px] border-[#03140C] bg-[#051811] shadow-[10px_10px_0px_#020C07]">
            <div className="flex justify-between items-center border-b-2 border-[#03140C] pb-3">
              <div className="flex items-center space-x-2">
                <LogIn className="w-5 h-5 text-[#10B981]" />
                <h3 className="text-xl font-black uppercase text-[#F0FDF4]">Join Squad Room</h3>
              </div>
              <button 
                onClick={() => setIsJoinRoomModalOpen(false)} 
                className="text-slate-400 hover:text-white font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleJoinRoomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-emerald-300 mb-1 uppercase">Enter Room Code</label>
                <input
                  type="text"
                  required
                  value={joinRoomCodeInput}
                  onChange={e => setJoinRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. HEIST-782"
                  className="w-full bg-[#020B06] border-2 border-[#03140C] p-3 text-[#FBBF24] font-mono font-bold text-base tracking-widest uppercase focus:border-[#10B981] outline-none"
                />
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                💡 Entering a valid squad room code will instantly link your specialist terminal and calibrate encrypted radio frequencies with all 4 teammates.
              </div>

              <button
                type="submit"
                className="w-full bg-[#10B981] text-[#02140D] font-black py-3 border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#34D399] uppercase text-sm font-game flex items-center justify-center space-x-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Connect to Squad Room</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create New Squad Room Modal */}
      {isCreateRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020B06]/85 backdrop-blur-md animate-fade-in">
          <div className="forest-card max-w-md w-full p-6 space-y-5 border-[4px] border-[#03140C] bg-[#051811] shadow-[10px_10px_0px_#020C07]">
            <div className="flex justify-between items-center border-b-2 border-[#03140C] pb-3">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-[#FBBF24]" />
                <h3 className="text-xl font-black uppercase text-[#F0FDF4]">Create Squad Room</h3>
              </div>
              <button 
                onClick={() => setIsCreateRoomModalOpen(false)} 
                className="text-slate-400 hover:text-white font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-emerald-300 mb-1 uppercase">Squad Operation Name</label>
                <input
                  type="text"
                  value={createRoomTitleInput}
                  onChange={e => setCreateRoomTitleInput(e.target.value)}
                  placeholder="e.g. The Quantum Core Strike Squad"
                  className="w-full bg-[#020B06] border-2 border-[#03140C] p-3 text-emerald-100 font-mono text-sm focus:border-[#10B981] outline-none"
                />
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                ⚡ You will be assigned as Host (Squad Leader) with full clearance to manage slots, adjust roles, and initiate synchronized launch.
              </div>

              <button
                type="button"
                onClick={() => handleCreateNewRoom(createRoomTitleInput)}
                className="w-full bg-[#10B981] text-[#02140D] font-black py-3 border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#34D399] uppercase text-sm font-game flex items-center justify-center space-x-2 transition-all"
              >
                <Rocket className="w-4 h-4" />
                <span>Initialize Multiplayer Room</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Synchronized Squad Launch Countdown HUD Overlay */}
      {isLaunchingCountdown && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020B06]/95 backdrop-blur-lg animate-fade-in select-none">
          <div className="text-center space-y-6 max-w-lg p-8">
            <div className="inline-flex items-center space-x-2 bg-emerald-950 border border-emerald-500/80 px-4 py-1.5 rounded-full text-emerald-300 font-mono text-xs font-bold uppercase tracking-widest animate-pulse">
              <Shield className="w-4 h-4 text-[#10B981]" />
              <span>SYNCHRONIZING SQUAD EXTRACTION</span>
            </div>

            <div className="relative my-6">
              <div className="text-9xl font-black font-game text-[#10B981] drop-shadow-[0_0_35px_#10B981aa] animate-bounce">
                {launchCountdown}
              </div>
              <div className="text-xs font-mono text-emerald-400 mt-2 tracking-wider">
                CALIBRATING COCKPITS IN T-MINUS {launchCountdown}s
              </div>
            </div>

            <div className="space-y-2 text-slate-300 text-sm font-mono">
              <p>Transmitting mission parameters to all 4 squad terminals...</p>
              <div className="w-64 mx-auto bg-[#051C12] h-2 rounded-full overflow-hidden border border-emerald-900">
                <div 
                  className="bg-[#10B981] h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((4 - launchCountdown) / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operative Directory & Unique ID Search Modal */}
      <OperativeDirectoryModal
        isOpen={isAgentDirectoryOpen}
        onClose={() => setIsAgentDirectoryOpen(false)}
        currentUser={currentUser}
        currentLobbyCode={lobby?.code}
        onInviteToLobby={(op) => {
          if (lobby?.code) {
            lobbySocket.sendRadioMessage(lobby.code, `[DISPATCH] Squad invitation routed to ${op.callsign} (${op.agentId})`, 'hq');
          }
        }}
      />

      {/* Leave Squad Confirmation Modal (Styled per Tactical Broadcast Blueprint) */}
      <AnimatePresence>
        {isLeaveSquadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020B06]/75 backdrop-blur-xl animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="max-w-xl w-full p-6 sm:p-8 space-y-6 border-4 border-[#042416]/90 bg-[#0D4A32]/55 backdrop-blur-2xl rounded-[36px] shadow-[10px_10px_0px_#03140C] text-left relative overflow-hidden text-white animate-cartoon-pop"
            >
              {/* Playful Ambient Background Dots & Frost Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(#34d39925_2px,transparent_2px)] [background-size:16px_16px] pointer-events-none opacity-80" />
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />

              {/* Cartoon Header */}
              <div className="flex items-start justify-between gap-4 border-b-4 border-[#042416]/80 pb-5 relative z-10">
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-1.5 bg-[#FDE047] text-[#02140D] font-mono font-black text-xs px-3 py-1 rounded-xl uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000] rotate-[-1.5deg] animate-badge-bounce">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>HQ TACTICAL BROADCAST</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-game drop-shadow-md">
                    LEAVE SQUAD, AGENT?
                  </h2>
                  <p className="text-[#A7F3D0] text-xs sm:text-sm font-medium leading-relaxed">
                    Currently assembled in <span className="bg-[#06291B]/90 backdrop-blur-sm text-[#FDE047] px-2.5 py-0.5 rounded-lg border border-[#10B981]/60 font-mono font-bold">Room {lobby?.code || 'SQUAD'}</span>. Choose an exit directive:
                  </p>
                </div>

                <button 
                  onClick={() => {
                    setIsLeaveSquadModalOpen(false);
                    heistAudio.playKeyClick();
                  }}
                  className="w-10 h-10 rounded-2xl bg-[#06291B]/90 hover:bg-[#FF4D6D] text-white border-2 border-black font-black text-sm flex items-center justify-center shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all backdrop-blur-sm"
                  title="Cancel"
                >
                  ✕
                </button>
              </div>

              {/* Frosted Cartoon Directive Option Cards */}
              <div className="space-y-4 relative z-10 font-mono">
                
                {/* Option 1: Stay in Squad & Sync (Frosted Jade & Gold) */}
                <div
                  onClick={() => {
                    setIsLeaveSquadModalOpen(false);
                    heistAudio.playKeyClick();
                  }}
                  className="p-4 sm:p-5 rounded-3xl border-3 border-[#052817]/90 bg-[#135C3E]/80 hover:bg-[#18704C]/90 backdrop-blur-md shadow-[5px_5px_0px_#03180E] active:translate-x-0.5 active:translate-y-0.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#FDE047] border-2 border-black flex items-center justify-center text-3xl shadow-[3px_3px_0px_#000] flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 group-hover:animate-icon-wobble transition-transform">
                      🏆
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-black text-base sm:text-lg text-white font-game group-hover:text-[#FDE047] transition-colors">
                          STAY IN SQUAD & SYNC
                        </h3>
                        <span className="text-[10px] bg-[#34D399] text-[#02140D] font-black px-2 py-0.5 rounded-md border border-black hidden sm:inline-block">
                          +CO-OP
                        </span>
                      </div>
                      <p className="text-xs text-[#D1FAE5] font-medium mt-0.5">
                        Maintain active voice & radio mesh. Keep your specialist slot reserved!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="bg-[#10B981]/90 hover:bg-[#34D399] text-[#02140D] font-black text-xs px-4 py-3 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] uppercase font-game transition-all flex items-center justify-center space-x-1.5 flex-shrink-0 group-hover:shadow-[4px_4px_0px_#000] backdrop-blur-sm"
                  >
                    <span>Stay in Squad</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>

                {/* Option 2: Leave Squad (Frosted Crimson & Coral) */}
                <div
                  onClick={handleConfirmLeaveSquad}
                  className="p-4 sm:p-5 rounded-3xl border-3 border-[#2E0B12]/90 bg-[#4D1420]/80 hover:bg-[#631B2B]/90 backdrop-blur-md shadow-[5px_5px_0px_#1B060B] active:translate-x-0.5 active:translate-y-0.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#FF4D6D] border-2 border-black flex items-center justify-center text-3xl shadow-[3px_3px_0px_#000] flex-shrink-0 group-hover:scale-110 group-hover:-rotate-3 group-hover:animate-icon-wobble transition-transform">
                      🚨
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-black text-base sm:text-lg text-white font-game group-hover:text-[#FDA4AF] transition-colors">
                          LEAVE SQUAD (DISCONNECT)
                        </h3>
                        <span className="text-[10px] bg-[#881337] text-[#FECDD3] font-bold px-2 py-0.5 rounded-md border border-[#BE123C] hidden sm:inline-block">
                          RETREAT
                        </span>
                      </div>
                      <p className="text-xs text-[#FECDD3] font-medium mt-0.5">
                        Disconnect from squad frequency and return to Recruitment Directory.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="bg-[#FF4D6D]/90 hover:bg-[#FF3366] text-white font-black text-xs px-4 py-3 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] uppercase font-game transition-all flex items-center justify-center space-x-1.5 flex-shrink-0 group-hover:shadow-[4px_4px_0px_#000] backdrop-blur-sm"
                  >
                    <span>Leave Squad</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>

              </div>

              {/* Frosted Cartoon Footer / Resume Button */}
              <div className="pt-2 relative z-10 font-mono">
                <button
                  onClick={() => {
                    setIsLeaveSquadModalOpen(false);
                    heistAudio.playKeyClick();
                  }}
                  className="w-full bg-[#06291B]/85 hover:bg-[#0A3D29]/95 backdrop-blur-md text-[#34D399] hover:text-[#10B981] font-black py-3.5 rounded-2xl border-2 border-[#10B981]/60 shadow-[4px_4px_0px_#03180E] text-xs font-game uppercase transition-all flex items-center justify-center space-x-2 active:translate-x-0.5 active:translate-y-0.5"
                >
                  <span>🎮 ← KEEP PLAYING (RESUME SQUAD LOBBY)</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
