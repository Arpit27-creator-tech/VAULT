import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { 
  ShieldAlert, Sparkles, Users, MapPin, BookOpen, Rocket, Scroll, Zap, 
  Lock, Unlock, Play, CheckCircle2, Trophy, Clock, UserPlus, Compass, 
  Radio, Terminal, ChevronRight, Award, Star, AlertTriangle, Flame, RefreshCw, Volume2, VolumeX,
  Video, VideoOff, Eye, Sliders, Sun, Trees, Flower2, Leaf, FlaskConical, Key, Activity, Send, ArrowRight, Plus,
  Menu, X, PanelLeftClose, PanelLeftOpen, ArrowLeft, LogOut, Home, BarChart3, User, UserCheck, LogIn,
  Mic, MicOff, Headphones, PhoneCall, PhoneOff
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
import CreateCustomHeistModal from './components/CreateCustomHeistModal';
import RemediationRoadmapModal from './components/RemediationRoadmapModal';
import HeroPage from './components/HeroPage';
import AuthModal from './components/AuthModal';
import StatsDashboard from './components/StatsDashboard';
import GraphicalRoadmap from './components/GraphicalRoadmap';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [tabHistory, setTabHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isEndHeistModalOpen, setIsEndHeistModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Operative Authentication State
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
  const [lobby, setLobby] = useState(() => {
    try {
      const saved = localStorage.getItem('kh_lobby_subject_v4');
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed && Array.isArray(parsed.players) ? parsed : initialLobby;
    } catch {
      return initialLobby;
    }
  });

  // Squad Lobby Voice Chat State
  const [isLobbyVoiceConnected, setIsLobbyVoiceConnected] = useState(true);
  const [isLobbyMicMuted, setIsLobbyMicMuted] = useState(false);
  const [isLobbyDeafened, setIsLobbyDeafened] = useState(false);
  const [speakingPlayerSlot, setSpeakingPlayerSlot] = useState(1);

  // Sound & Ambient Video Controls
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bgVideoActive, setBgVideoActive] = useState(true);
  const [bgDimMode, setBgDimMode] = useState('vivid'); // 'cinema' (0.08), 'vivid' (0.22), 'focus' (0.45)
  const videoRef = useRef(null);

  // Custom Heist Builder & Remediation Roadmap state
  const [isCustomHeistModalOpen, setIsCustomHeistModalOpen] = useState(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [allStages, setAllStages] = useState(heistStages);

  // Live Multi-Role Heist Engine State
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
  const [alarmLevel, setAlarmLevel] = useState('LOW_SECURITY'); // 'LOW_SECURITY', 'MEDIUM_ALERT', 'HIGH_LOCKDOWN', 'BUSTED'
  const [alarmFails, setAlarmFails] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [radioMessages, setRadioMessages] = useState([
    { sender: "Sylvan HQ", role: "hq", text: "Expedition crew deployed. Interlock sequence initialized. Coordinate all 4 roles!", time: "00:01" },
    { sender: "Scientist Cleo", role: "scientist", text: "Analyzing compound stoichiometry now. Will transmit optical density to Engineer.", time: "00:04" }
  ]);
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

  const navigateToTab = (newTab) => {
    if (newTab === 'login') {
      setIsAuthModalOpen(true);
      heistAudio.playKeyClick();
      return;
    }
    // Only lock private operational zones (Stats Dossier, Custom Forge) behind login
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

      // Update logged in user stats automatically
      if (currentUser) {
        const gainedXp = solvedCount > 0 ? 450 : 150;
        const newRecord = {
          id: `h-${Date.now()}`,
          mission: stage.title || 'Infiltration Op',
          role: activeCockpitRole === 'hacker' ? 'Canopy Hacker' : activeCockpitRole === 'engineer' ? 'Woodland Engineer' : activeCockpitRole === 'scientist' ? 'Flora Scientist' : 'Mist Cryptographer',
          result: solvedCount > 0 ? 'VICTORY' : 'CONCLUDED',
          xp: `+${gainedXp} XP`,
          time: timeStr,
          date: 'Just now'
        };
        const updatedUser = {
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
        setCurrentUser(updatedUser);
        localStorage.setItem('vault_current_user', JSON.stringify(updatedUser));
      }

      // Reset timer, alarm state, and fail counters back to clean initial state
      setTimeLeft(defaultTime);
      setAlarmLevel('LOW_SECURITY');
      setAlarmFails(0);

      setAnalyticsModalOpen(true);
      toast.success("📊 Operation Concluded. Generating Tactical Debrief & Skill Analytics.");
    } else {
      heistAudio.playRadioSquelch();
      // Full reset of timer, security level, and alarms
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
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vault_current_user');
    setActiveTab('home');
    setTabHistory([]);
    toast.info("👋 Signed out. Welcome to the Syndicate Public Gateway.");
  };

  // Waitlist state
  const [emailInput, setEmailInput] = useState('');
  const [crewNameInput, setCrewNameInput] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  // Join Lobby Modal state
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [targetSlotId, setTargetSlotId] = useState(null);
  const [joinPlayerName, setJoinPlayerName] = useState('');
  const [joinRole, setJoinRole] = useState('Canopy Hacker');
  const [joinCharacterId, setJoinCharacterId] = useState('c1');

  // Interactive Room Map state
  const [unlockedRooms, setUnlockedRooms] = useState(() => {
    const saved = localStorage.getItem('kh_unlocked_rooms_sylvan');
    return saved ? JSON.parse(saved) : [1];
  });
  const [activeRoom, setActiveRoom] = useState(1);
  const [roomSolved, setRoomSolved] = useState(() => {
    const saved = localStorage.getItem('kh_room_solved_sylvan');
    return saved ? JSON.parse(saved) : {};
  });
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem('kh_xp_sylvan');
    return saved ? parseInt(saved, 10) : 1200;
  });
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('kh_streak_sylvan');
    return saved ? parseInt(saved, 10) : 3;
  });
  const [leaderboard, setLeaderboard] = useState(() => {
    const saved = localStorage.getItem('kh_leaderboard_sylvan');
    return saved ? JSON.parse(saved) : [
      { name: 'You (Explorer)', xp: 1200, streak: 3 },
      { name: 'Captain Bramble', xp: 2450, streak: 5 },
      { name: 'Dr. Cleo', xp: 1900, streak: 4 },
      { name: 'Shadow Nyx', xp: 1720, streak: 3 }
    ];
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

  // Sound toggle sync
  useEffect(() => {
    heistAudio.toggleSound(soundEnabled);
  }, [soundEnabled]);

  // Save to localStorage
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

  // Live Heist Timer & Tension Sound Loop
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleHeistTimeout();
            return 0;
          }
          // Dynamic alarm escalation based on time left
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

  const handleStartHeistStage = (stageIdx = 0) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      toast.info("🔐 Operative clearance required: Sign in with email & password to launch co-op operations.");
      return;
    }
    setCurrentStageIdx(stageIdx);
    const stage = allStages[stageIdx] || heistStages[0];
    setTimeLeft(stage.timeLimit || 180);
    setIsTimerRunning(true);
    setAlarmLevel('LOW_SECURITY');
    setAlarmFails(0);
    const activeRoles = stage.selectedRoles 
      ? Object.keys(stage.selectedRoles).filter(k => stage.selectedRoles[k])
      : ['hacker', 'engineer', 'scientist', 'cryptographer'];
    setActiveCockpitRole(activeRoles[0] || 'hacker');
    setActiveTab('liveheist');
    heistAudio.startTensionBeat('LOW_SECURITY');
    heistAudio.playRadioSquelch();
    toast.success(`🚀 ${stage.title} ENGAGED! ${activeRoles.length} squad roles active!`);
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
    heistAudio.startTensionBeat('LOW_SECURITY');
    heistAudio.playRadioSquelch();
    toast.success(`🚀 CUSTOM HEIST ENGAGED: ${customStage.title}!`);
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
    
    // Update solved state
    setStageSolvedRoles(prev => {
      const current = { ...(prev[stageId] || {}) };
      current[role] = true;
      return { ...prev, [stageId]: current };
    });

    // Update clues
    setStageRoleClues(prev => {
      const current = { ...(prev[stageId] || {}) };
      current[role] = clue;
      return { ...prev, [stageId]: current };
    });

    // Radio chatter
    const roleNames = {
      scientist: "Scientist Rostova",
      engineer: "Engineer Chen",
      hacker: "Hacker Vance",
      cryptographer: "Operator Lin"
    };

    const timeStr = `${Math.floor((180 - timeLeft) / 60)}:${((180 - timeLeft) % 60).toString().padStart(2, '0')}`;
    const newMsg = {
      sender: roleNames[role] || role.toUpperCase(),
      role: role,
      text: `[PASSED] ${clue} — Transmitting across interdependence pipeline!`,
      time: timeStr
    };
    setRadioMessages(prev => [...prev, newMsg]);

    toast.success(`🔓 ${role.toUpperCase()} LOCK BYPASSED! Clue dispatched.`);

    // Check if all active roles in current stage are solved
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
    
    // Penalty time deduction (-12 seconds)
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

    const timeStr = `${Math.floor((180 - timeLeft) / 60)}:${((180 - timeLeft) % 60).toString().padStart(2, '0')}`;
    setRadioMessages(prev => [
      ...prev,
      {
        sender: "SECURITY SYSTEM",
        role: "hq",
        text: `⚠️ ANOMALY DETECTED by ${role.toUpperCase()}: ${reason} (-12s Penalty, Alarm Level: ${nextAlert})`,
        time: timeStr
      }
    ]);

    toast.error(`⚠️ Security Warning! ${reason} (-12s penalty)`);

    if (newFails >= 6) {
      handleHeistTimeout();
    }
  };

  const handleStageVictory = () => {
    setIsTimerRunning(false);
    heistAudio.stopTension();
    heistAudio.playSuccessChime();

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
    setRadioMessages(prev => [
      ...prev,
      {
        sender: `You (${role.toUpperCase()})`,
        role: role,
        text: text,
        time: timeStr
      }
    ]);
  };

  const handleClaimSlot = (slotId) => {
    setTargetSlotId(slotId);
    setIsJoinModalOpen(true);
    heistAudio.playKeyClick();
  };

  const handleJoinLobbySubmit = (e) => {
    e.preventDefault();
    if (!joinPlayerName.trim()) {
      toast.error("Please enter your Sylvan Ranger Codename!");
      return;
    }

    const updatedPlayers = [...lobby.players];
    const targetIdx = targetSlotId 
      ? updatedPlayers.findIndex(p => p.slotId === targetSlotId)
      : updatedPlayers.findIndex(p => !p.playerName);

    if (targetIdx === -1) {
      toast.error("All 4 ranger slots are filled!");
      return;
    }

    updatedPlayers[targetIdx] = {
      ...updatedPlayers[targetIdx],
      playerName: joinPlayerName.trim(),
      role: joinRole,
      characterId: joinCharacterId,
      isReady: true,
      isHost: targetIdx === 0
    };

    setLobby({ ...lobby, players: updatedPlayers });
    setIsJoinModalOpen(false);
    setJoinPlayerName('');
    heistAudio.playSuccessChime();
    toast.success(`🌿 Welcome to the squad, ${joinPlayerName}! Ready for extraction.`);
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

  const currentStageData = (allStages && allStages[currentStageIdx]) || heistStages[0] || {};
  const stageId = currentStageData.stageId || 1;
  const currentStageSolved = (stageSolvedRoles && stageSolvedRoles[stageId]) || {};
  const currentStageClues = (stageRoleClues && stageRoleClues[stageId]) || {};
  const currentStagePuzzles = currentStageData.puzzles || heistStages[0].puzzles || {};

  return (
    <div className="relative min-h-screen bg-[#051811] text-[#F0FDF4] selection:bg-[#10B981] selection:text-[#02140D] font-sans antialiased">
      <Toaster position="top-right" richColors />

      {/* BACKGROUND VIDEO LAYER */}
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
        {/* Translucent Dimmer Overlay */}
        <div 
          className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
          style={{
            backgroundColor: '#051811',
            opacity: 0.22
          }}
        />
        {/* Alarm lockdown flasher overlay */}
        {alarmLevel === 'HIGH_LOCKDOWN' && (
          <div className="absolute inset-0 bg-red-900/25 pointer-events-none animate-pulse" />
        )}
      </div>

      {/* FOREGROUND APPLICATION (z-10) */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* STICKY TOP MENU BAR */}
        <header className="sticky top-0 z-50 bg-[#071E14]/95 backdrop-blur-xl border-b-[3px] border-[#03140C] px-3 sm:px-6 py-2.5 sm:py-3 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
          <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Left: If Logged In -> Back, Home, Sidebar Toggles, Brand Logo; If Visitor -> Brand Logo */}
            <div className="flex items-center space-x-1.5 sm:space-x-2.5">
              
              {/* TOP-LEFT BACK BUTTON (When Logged In) */}
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

              {/* MENU BAR HOME SECTION BUTTON (When Logged In) */}
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

              {/* Mobile Sidebar Menu Toggle (When Logged In) */}
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

              {/* Desktop Sidebar Collapse Toggle (When Logged In) */}
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

              {/* Brand Logo */}
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

            {/* Right: Actions & Operative Authentication Controls */}
            <div className="flex items-center space-x-1.5 sm:space-x-2.5">
              
              {/* If in liveheist: Show End Heist Quick Button in Top Bar */}
              {activeTab === 'liveheist' && (
                <button
                  onClick={() => setIsEndHeistModalOpen(true)}
                  className="bg-[#FF4D6D] text-white font-mono font-black text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 border-2 border-[#03140C] shadow-[2px_2px_0px_#020C07] hover:bg-[#FF3366] active:translate-x-0.5 transition-all flex items-center space-x-1.5 uppercase animate-pulse"
                  title="Conclude or Abort this operation on your own wish"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">END HEIST</span>
                  <span className="sm:hidden">END</span>
                </button>
              )}

              {/* Sound Toggle */}
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 sm:p-2 border-[2px] border-[#03140C] bg-[#0A261B] text-[#34D399] font-black shadow-[2px_2px_0px_#020C07] hover:bg-[#0E3526]"
                title={soundEnabled ? "Mute SFX" : "Enable SFX"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-[#10B981]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>

              {/* Operative Login / Profile Button */}
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

                  {/* Create Custom Heist Action */}
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

                  {/* Start Expedition Action (when not in liveheist) */}
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
                /* Visitor Mode: Clean Standard Sign In Button */
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

        {/* WORKSPACE LAYOUT: SIDEBAR (WHEN AUTHENTICATED) + MAIN CONTENT */}
        <div className="flex flex-1 relative min-h-[calc(100vh-65px)]">

          {/* MOBILE SIDEBAR BACKDROP */}
          {currentUser && sidebarOpen && (
            <div 
              className="fixed inset-0 z-30 bg-black/75 backdrop-blur-sm md:hidden transition-opacity"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* SIDEBAR UNDER MENU BAR (LOCKED/HIDDEN UNTIL AUTHENTICATED) */}
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
            
            {/* Top Section / Syndicate Deck Header & Nav items */}
            <div className="flex-1 w-72 md:w-60 lg:w-64">
              
              {/* Syndicate Menu Header */}
              <div className="p-3.5 border-b-2 border-[#03140C] bg-[#04160E]/80 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                  <span className="text-[11px] font-black uppercase font-mono tracking-wider text-[#34D399]">
                    SYNDICATE MENU
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono bg-[#0A261B] text-[#FBBF24] px-2 py-0.5 border border-[#03140C] font-bold">
                    10 OPS
                  </span>
                  {/* Quick minimize button inside sidebar */}
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

              {/* Navigation Options List */}
              <nav className="p-2.5 sm:p-3 space-y-1.5">
                {[
                  { id: 'home', label: 'Home HQ', icon: Home, badge: 'HOME', sub: 'Platform Overview' },
                  { id: 'stats', label: 'My Stats', icon: BarChart3, badge: currentUser ? `LVL ${currentUser.level}` : 'STATS', sub: 'Operative Dossier', highlight: !!currentUser },
                  { id: 'missions', label: 'Expeditions', icon: Compass, badge: '3 Ops', sub: 'Campaign Missions' },
                  { id: 'liveheist', label: 'Live Cockpit', icon: Zap, badge: 'LIVE HUD', sub: 'Real-time Co-op', highlight: true },
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
                        isActive
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

            {/* Bottom Section / Tactical Status in Sidebar */}
            <div className="p-3 border-t-2 border-[#03140C] bg-[#04160E]/90 space-y-2.5 w-72 md:w-60 lg:w-64">
              {/* Radar Live Status */}
              <div className="p-2 bg-[#020B06] border border-[#03140C] flex items-center justify-between text-[11px] font-mono font-bold">
                <div className="flex items-center space-x-1.5 text-[#34D399]">
                  <Radio className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
                  <span>RADAR ACTIVE</span>
                </div>
                <span className="text-[#FBBF24] text-[10px]">4.8K CO-OP</span>
              </div>

              {/* Fast Stage Action */}
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

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 min-w-0 flex flex-col">

        {/* HERO BANNER */}
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

        {/* MAIN CONTAINER */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-14 w-full">
          <AnimatePresence mode="wait" initial={false}>

          {/* TAB 0: MISSION HQ HERO PAGE */}
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

          {/* TAB 1: LIVE HEIST COCKPIT & OPERATION ENGINE */}
          {activeTab === 'liveheist' && (
            <motion.div
              key="liveheist"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="space-y-5 max-w-7xl mx-auto"
            >
              
              {/* Mission Stage Header */}
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

                {/* Tactical Status Counters */}
                <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs self-stretch lg:self-auto justify-between lg:justify-end">
                  
                  {/* Countdown Timer */}
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

                  {/* Security Alert Level */}
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

                  {/* Stage Switcher Pills */}
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

                  {/* Restart Button */}
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

                  {/* End Heist Button */}
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

              {/* Interdependence Pipeline Matrix */}
              <InterdependenceMatrix
                stageData={currentStageData}
                solvedRoles={currentStageSolved}
                roleClues={currentStageClues}
              />

              {/* Role Cockpit Switcher Tabs */}
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

              {/* Cockpit Workspace & Walkie-Talkie Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left 8 Cols: Active Role Cockpit Interactive Component */}
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

                {/* Right 4 Cols: Squad Radio Comms & Bot Simulation Tools */}
                <div className="lg:col-span-4 space-y-4">
                  <RadioComms
                    messages={radioMessages}
                    activeRole={activeCockpitRole}
                    onSendMessage={handleSendMessage}
                  />

                  {/* Co-Op Helper / Bot Simulator */}
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

          {/* TAB 2: EXPEDITIONS / MISSIONS */}
          {activeTab === 'missions' && (
            <motion.div
              key="missions"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 max-w-7xl mx-auto"
            >
              {/* Clean Header Bar */}
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

              {/* Clean Mission Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {missions.map((mission, mIdx) => (
                  <div
                    key={mission.id || mIdx}
                    className="bg-[#051C12] border border-emerald-800/40 rounded-xl overflow-hidden shadow-md flex flex-col justify-between hover:border-[#10B981]/70 hover:bg-[#072418] transition-all group"
                  >
                    <div>
                      {/* Mission Thumbnail */}
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

                      {/* Content */}
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

                    {/* Action Button */}
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

          {/* TAB 3: SQUAD LOBBY WITH VOICE CHAT */}
          {activeTab === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 max-w-7xl mx-auto text-left"
            >
              {/* Lobby Header Card */}
              <div className="bg-[#051C12] border border-emerald-800/40 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/60 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="bg-[#10B981] text-[#02140D] font-mono font-bold text-[10px] px-2.5 py-0.5 rounded uppercase">
                        SQUAD ASSEMBLED
                      </span>
                      <span className="text-xs font-mono text-emerald-300">4-OPERATIVE MULTIPLAYER ROOM</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#F0FDF4] font-game">
                      {lobby.name}
                    </h2>
                    <p className="text-slate-300 text-xs sm:text-sm">
                      Lock in your specialized roles, tune voice frequencies, and launch synchronized extraction.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="bg-[#020B06] px-3.5 py-2 rounded-xl border border-emerald-800/60">
                      <span className="text-[9px] font-mono text-emerald-400 block uppercase font-bold">Invite Code</span>
                      <span className="text-lg font-mono font-bold text-[#FBBF24] tracking-widest">{lobby.code}</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsCustomHeistModalOpen(true);
                        heistAudio.playKeyClick();
                      }}
                      className="bg-[#020B06] text-[#FBBF24] border border-amber-500/60 hover:bg-amber-950/40 font-bold px-3.5 py-2.5 rounded-xl uppercase flex items-center space-x-1.5 text-xs font-game transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Custom Heist</span>
                    </button>
                    <button
                      onClick={() => handleStartHeistStage(0)}
                      className="bg-[#10B981] text-[#02140D] font-bold px-5 py-2.5 rounded-xl hover:bg-[#34D399] uppercase flex items-center space-x-2 text-sm font-game shadow-lg shadow-emerald-950 transition-all"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>LAUNCH HEIST</span>
                    </button>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* SQUAD LIVE VOICE CHAT COMMS DECK */}
                {/* ========================================================================= */}
                <div className="bg-[#020E08] border border-emerald-800/60 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Radio Frequency & Live Waveform */}
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
                        <span>4 Operatives Linked</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Live Audio Equalizer Waves */}
                  {isLobbyVoiceConnected && !isLobbyMicMuted && (
                    <div className="hidden sm:flex items-center space-x-1 px-3 py-1.5 bg-[#020B06] rounded-lg border border-emerald-900/60">
                      <span className="text-[10px] font-mono text-emerald-400 mr-2">MIC AUDIO:</span>
                      {[12, 24, 18, 28, 16, 22, 14, 26].map((h, i) => (
                        <span
                          key={i}
                          style={{ height: `${h}px` }}
                          className="w-1 bg-[#10B981] rounded-full animate-pulse"
                        />
                      ))}
                    </div>
                  )}

                  {/* Right: Interactive Voice Controls */}
                  <div className="flex items-center space-x-2">
                    {/* Microphone Mute Toggle */}
                    <button
                      onClick={() => {
                        setIsLobbyMicMuted(!isLobbyMicMuted);
                        heistAudio.playKeyClick();
                        toast.info(!isLobbyMicMuted ? "🔇 Microphone Muted" : "🎙️ Microphone Live & Transmitting");
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold font-game flex items-center space-x-1.5 transition-all ${
                        isLobbyMicMuted
                          ? 'bg-red-950/80 text-red-300 border border-red-800'
                          : 'bg-[#042416] text-[#34D399] border border-emerald-700 hover:bg-[#073621]'
                      }`}
                      title={isLobbyMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                    >
                      {isLobbyMicMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-[#10B981]" />}
                      <span>{isLobbyMicMuted ? 'Muted' : 'Mic On'}</span>
                    </button>

                    {/* Headphone Deafen Toggle */}
                    <button
                      onClick={() => {
                        setIsLobbyDeafened(!isLobbyDeafened);
                        heistAudio.playKeyClick();
                        toast.info(!isLobbyDeafened ? "🎧 Deafen Active: Audio Muted" : "🔊 Deafen Off: Audio Live");
                      }}
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

                    {/* Test Radio Transmission Ping */}
                    <button
                      onClick={() => {
                        heistAudio.playRadioSquelch();
                        toast.success("📻 Transmitting radio squelch telemetry ping to all 4 squad slots!");
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-bold font-game bg-[#020B06] text-amber-300 border border-amber-900/60 hover:bg-amber-950/40 flex items-center space-x-1.5 transition-all"
                      title="Test Voice Channel Ping"
                    >
                      <Radio className="w-4 h-4" />
                      <span>Radio Ping</span>
                    </button>

                    {/* Connect / Disconnect Voice */}
                    <button
                      onClick={() => {
                        setIsLobbyVoiceConnected(!isLobbyVoiceConnected);
                        heistAudio.playKeyClick();
                        toast.info(!isLobbyVoiceConnected ? "🟢 Connected to Squad Voice Channel" : "🔴 Disconnected from Squad Voice Channel");
                      }}
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

                {/* 4 Ranger Slots Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {lobby.players.map((slot) => {
                    const char = characters.find(c => c.id === slot.characterId);
                    const isSpeaking = isLobbyVoiceConnected && !isLobbyMicMuted && slot.slotId === 1;

                    return (
                      <div
                        key={slot.slotId}
                        className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                          slot.playerName 
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
                            
                            {/* Voice Status Pill */}
                            {slot.playerName && isLobbyVoiceConnected && (
                              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded flex items-center space-x-1 ${
                                isSpeaking
                                  ? 'bg-[#10B981] text-[#02140D] animate-pulse'
                                  : isLobbyMicMuted && slot.slotId === 1
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : 'bg-[#020B06] text-emerald-400 border border-emerald-900'
                              }`}>
                                {isSpeaking ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#02140D] animate-ping" />
                                    <span>SPEAKING</span>
                                  </>
                                ) : isLobbyMicMuted && slot.slotId === 1 ? (
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

                          {slot.playerName ? (
                            <div className="space-y-3 text-center">
                              <div className="relative w-16 h-16 mx-auto">
                                <img 
                                  src={char?.avatar || FALLBACK_AVATAR_IMG} 
                                  alt={slot.playerName} 
                                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_AVATAR_IMG; }}
                                  className={`w-16 h-16 rounded-2xl border-2 object-cover transition-all ${
                                    isSpeaking ? 'border-[#10B981] ring-4 ring-[#10B981]/30 scale-105' : 'border-emerald-800'
                                  }`}
                                />
                                {slot.isHost && (
                                  <span className="absolute -top-1.5 -right-1.5 bg-[#FBBF24] text-[#02140D] text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">
                                    ★ CAP
                                  </span>
                                )}
                              </div>

                              <div>
                                <h4 className="font-bold text-base text-white font-game">{slot.playerName}</h4>
                                <div className="inline-block bg-[#10B981]/20 border border-[#10B981]/40 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase text-[#6EE7B7] mt-1 font-mono">
                                  {slot.role}
                                </div>
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
                          {slot.playerName ? (
                            <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-[#10B981] font-game">
                              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                              <span>SYNCED & READY</span>
                            </div>
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
              </div>
            </motion.div>
          )}

          {/* TAB 4: ROLES & RANGERS */}
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

          {/* TAB 5: DISCIPLINES & GRAPHICAL LEARNING ROADMAP */}
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

          {/* TAB 6: CANOPY ROOM MAP / MIND MAP */}
          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 max-w-7xl mx-auto text-left"
            >
              {/* Header Bar */}
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

              {/* 4 Chamber Cards Grid */}
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
                        {/* Status Header */}
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

                        {/* Question Text */}
                        <p className="text-xs text-slate-200 leading-relaxed font-sans pt-1">
                          {q?.question}
                        </p>

                        {/* Options Buttons */}
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

                      {/* Footer info */}
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

          {/* TAB 7: ARCHITECT WORKSHOP / MISSION BUILDER */}
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

          {/* TAB 8: SYNDICATE PASS / WAITLIST */}
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

          {/* TAB 9: OPERATIVE STATS DOSSIER */}
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

      {/* JOIN LOBBY SLOT MODAL */}
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

      {/* CREATE CUSTOM HEIST MODAL */}
      <CreateCustomHeistModal
        isOpen={isCustomHeistModalOpen}
        onClose={() => setIsCustomHeistModalOpen(false)}
        onSaveHeist={handleSaveCustomHeist}
        onLaunchCustomHeist={handleLaunchCustomHeist}
      />

      {/* SKILL ANALYTICS DEBRIEF MODAL */}
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

      {/* TARGETED FAILURE REMEDIATION & TOPICS ROADMAP MODAL */}
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

      {/* END HEIST CONFIRMATION MODAL */}
      {isEndHeistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020B06]/85 backdrop-blur-md animate-fade-in">
          <div className="forest-card max-w-md w-full p-6 space-y-5 border-[4px] border-[#03140C] bg-[#051811] shadow-[10px_10px_0px_#020C07]">
            <div className="flex justify-between items-center border-b-2 border-[#03140C] pb-3">
              <div className="flex items-center space-x-2 text-[#FF4D6D]">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-xl font-black uppercase text-[#F0FDF4]">END OPERATION EARLY?</h3>
              </div>
              <button 
                onClick={() => setIsEndHeistModalOpen(false)} 
                className="text-slate-400 hover:text-white font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-emerald-100/90 leading-relaxed font-medium">
              You are currently engaged in active operation <strong>{currentStageData.title}</strong>. You can end the mission at any time:
            </p>

            <div className="space-y-3 font-mono">
              {/* Action 1: Conclude & View Analytics */}
              <button
                onClick={() => handleConcludeHeist('debrief')}
                className="w-full bg-[#10B981] text-[#02140D] font-black p-3.5 border-[3px] border-[#03140C] shadow-[3px_3px_0px_#020C07] hover:bg-[#34D399] active:translate-x-0.5 transition-all text-xs uppercase flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-[#02140D]" />
                  <span className="font-bold">END HEIST & VIEW ANALYTICS</span>
                </div>
                <span className="text-[10px] bg-[#02140D] text-[#FBBF24] px-1.5 py-0.5 border border-[#02140D]">CLAIM DEBRIEF</span>
              </button>

              {/* Action 2: Emergency Abort / Return HQ */}
              <button
                onClick={() => handleConcludeHeist('abort')}
                className="w-full bg-[#FF4D6D] text-white font-black p-3.5 border-[3px] border-[#03140C] shadow-[3px_3px_0px_#020C07] hover:bg-[#FF3366] active:translate-x-0.5 transition-all text-xs uppercase flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <LogOut className="w-4 h-4 text-white" />
                  <span className="font-bold">EMERGENCY EXFILTRATE (ABORT)</span>
                </div>
                <span className="text-[10px] bg-black/40 text-white px-1.5 py-0.5">RETURN HQ</span>
              </button>

              {/* Action 3: Cancel and Resume */}
              <button
                onClick={() => setIsEndHeistModalOpen(false)}
                className="w-full bg-[#0A261B] text-emerald-200 font-bold p-2.5 border-2 border-[#03140C] hover:bg-[#0E3526] text-xs uppercase"
              >
                RESUME HEIST OPERATION
              </button>
            </div>
          </div>
        </div>
      )}
      {/* AUTHENTICATION / LOGIN MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
