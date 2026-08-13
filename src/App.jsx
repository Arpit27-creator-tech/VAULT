import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { 
  ShieldAlert, Sparkles, Users, MapPin, BookOpen, Rocket, Scroll, Zap, 
  Lock, Unlock, Play, CheckCircle2, Trophy, Clock, UserPlus, Compass, 
  Radio, Terminal, ChevronRight, Award, Star, AlertTriangle, Flame, RefreshCw, Volume2, VolumeX,
  Video, VideoOff, Eye, Sliders, Sun, Trees, Flower2, Leaf, FlaskConical, Key, Activity, Send, ArrowRight, Plus
} from 'lucide-react';
import bgVideo from './assets/nature.mp4';
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

export default function App() {
  const [activeTab, setActiveTab] = useState('missions');
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
    <div className="relative min-h-screen bg-[#051811] text-[#F0FDF4] selection:bg-[#10B981] selection:text-[#02140D] font-sans antialiased overflow-x-hidden">
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
        {/* Dynamic Translucent Dimmer Overlay */}
        <div 
          className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
          style={{
            backgroundColor: '#051811',
            opacity: bgDimMode === 'cinema' ? 0.08 : bgDimMode === 'focus' ? 0.42 : 0.22
          }}
        />
        {/* Alarm lockdown flasher overlay */}
        {alarmLevel === 'HIGH_LOCKDOWN' && (
          <div className="absolute inset-0 bg-red-900/25 pointer-events-none animate-pulse" />
        )}
      </div>

      {/* FOREGROUND APPLICATION (z-10) */}
      <div className="relative z-10">

        {/* HEADER / NAVIGATION */}
        <header className="sticky top-0 z-50 bg-[#071E14]/85 backdrop-blur-xl border-b-[3px] border-[#03140C] px-4 sm:px-6 py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Brand Logo */}
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('missions')}>
                <div className="bg-[#10B981] border-[3px] border-[#03140C] p-2 shadow-[3px_3px_0px_#020C07] group-hover:rotate-6 transition-transform rotate-[-2deg]">
                  <Leaf className="w-6 h-6 text-[#02140D]" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-black tracking-widest uppercase font-mono bg-[#FBBF24] text-[#02140D] px-2.5 py-0.5 border-2 border-[#03140C] shadow-[2px_2px_0px_#020C07]">
                      V.A.U.L.T
                    </span>
                    <span className="hidden sm:inline-block bg-[#10B981]/20 text-[#34D399] text-[10px] font-mono font-bold px-2 py-0.5 border border-[#10B981]/40 uppercase tracking-widest">
                      v3.5 CO-OP
                    </span>
                  </div>
                  <span className="text-xs block font-bold text-[#6EE7B7] tracking-widest mt-0.5">
                    VIRTUAL ACADEMIC UNDERGROUND LEARNING TEAM
                  </span>
                </div>
              </div>

              {/* Mobile controls */}
              <div className="flex items-center space-x-2 md:hidden">
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 border-2 border-[#03140C] bg-[#0A2D1F] text-xs font-black text-[#FBBF24] shadow-[2px_2px_0px_#020C07]"
                  title={soundEnabled ? "Mute SFX" : "Enable SFX"}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-[#10B981]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto w-full md:w-auto py-1 max-w-full">
              {[
                { id: 'missions', label: 'Expeditions', icon: Compass },
                { id: 'liveheist', label: 'Live Cockpit', icon: Zap, highlight: true },
                { id: 'lobby', label: 'Squad Lobby', icon: Users },
                { id: 'characters', label: '4 Roles', icon: Sparkles },
                { id: 'topics', label: 'Disciplines', icon: BookOpen },
                { id: 'map', label: 'Canopy Map', icon: MapPin },
                { id: 'builder', label: 'Architect', icon: Terminal },
                { id: 'waitlist', label: 'Syndicate Pass', icon: Rocket }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      heistAudio.playKeyClick();
                      if (tab.id === 'liveheist' && !isTimerRunning) {
                        setIsTimerRunning(true);
                      }
                    }}
                    className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-none font-black text-xs sm:text-sm transition-all border-[3px] border-[#03140C] shadow-[3px_3px_0px_#020C07] active:translate-x-0.5 active:translate-y-0.5 whitespace-nowrap ${
                      isActive 
                        ? 'bg-[#10B981] text-[#02140D] -translate-y-0.5 shadow-[3px_3px_0px_#FBBF24]' 
                        : tab.highlight
                        ? 'bg-[#FBBF24] text-[#02140D] hover:bg-[#F59E0B] animate-pulse'
                        : 'bg-[#0A261B]/80 text-[#E2FBEA] hover:bg-[#10B981]/30 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Desktop Action & Visibility Controls */}
            <div className="hidden md:flex items-center space-x-2.5">
              
              {/* Background Preset Selector */}
              <div className="flex items-center bg-[#051811] border-[2px] border-[#03140C] p-0.5 shadow-[2px_2px_0px_#020C07]">
                {[
                  { id: 'cinema', label: '100% Video' },
                  { id: 'vivid', label: 'Vivid' },
                  { id: 'focus', label: 'Focus' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setBgDimMode(mode.id);
                      heistAudio.playKeyClick();
                      toast.info(`Background: ${mode.label}`);
                    }}
                    className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider transition-all ${
                      bgDimMode === mode.id 
                        ? 'bg-[#FBBF24] text-[#02140D]' 
                        : 'text-emerald-300 hover:text-white hover:bg-emerald-900/40'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Sound Toggle */}
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 border-[2px] border-[#03140C] bg-[#0A261B] text-[#34D399] font-black shadow-[2px_2px_0px_#020C07] hover:bg-[#0E3526]"
                title={soundEnabled ? "Mute SFX" : "Enable SFX"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-[#10B981]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>

              {/* Create Custom Heist Action */}
              <button
                onClick={() => {
                  setIsCustomHeistModalOpen(true);
                  heistAudio.playKeyClick();
                }}
                className="bg-[#FBBF24] text-[#02140D] font-black px-3.5 sm:px-4 py-2 border-[3px] border-[#03140C] shadow-[3px_3px_0px_#020C07] hover:bg-[#F59E0B] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-1.5 text-xs sm:text-sm"
                title="Create a custom multi-role heist with selected roles"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>CUSTOM HEIST</span>
              </button>

              {/* Start Expedition Action */}
              <button
                onClick={() => handleStartHeistStage(0)}
                className="bg-[#FF4D6D] text-white font-black px-4 sm:px-5 py-2 border-[3px] border-[#03140C] shadow-[3px_3px_0px_#020C07] hover:bg-[#FF3366] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-2 text-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>LAUNCH STAGE 1</span>
              </button>
            </div>

          </div>
        </header>

        {/* HERO BANNER */}
        {activeTab === 'missions' && (
          <section className="bg-gradient-to-r from-[#062417]/85 via-[#093522]/80 to-[#052115]/85 backdrop-blur-md text-white border-b-[3px] border-[#03140C] py-12 sm:py-16 px-6 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:20px_20px]"></div>
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center space-x-2 bg-[#FBBF24] text-[#02140D] font-black text-xs uppercase px-3.5 py-1.5 border-2 border-[#03140C] shadow-[2px_2px_0px_#020C07] rotate-[-1deg]">
                  <Trees className="w-4 h-4" />
                  <span>🌲 REAL-TIME MULTIPLAYER LEARNING HEIST</span>
                </div>
                
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none uppercase drop-shadow-[4px_4px_0px_#020C07]">
                  EDUCATION IS A <span className="bg-[#10B981] text-[#02140D] px-3 py-1 border-[3px] border-[#03140C]">TEAM SPORT!</span>
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

          {/* TAB 1: LIVE HEIST COCKPIT & OPERATION ENGINE */}
          {activeTab === 'liveheist' && (
            <div className="space-y-6">
              
              {/* Mission Stage Header & Realtime HUD */}
              <div className="forest-glass p-5 border-[3px] border-[#03140C] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#FF4D6D] text-white font-mono font-black text-xs px-2.5 py-0.5 border border-[#03140C] uppercase">
                      ACTIVE OPERATION
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-300">
                      TARGET: {currentStageData.targetFacility}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#F0FDF4] mt-1">
                    {currentStageData.title}
                  </h2>
                  <p className="text-xs text-emerald-200 font-medium">{currentStageData.description}</p>
                </div>

                {/* Tactical HUD Counters */}
                <div className="flex flex-wrap items-center gap-3 font-mono">
                  
                  {/* Countdown Timer */}
                  <div className={`p-2.5 border-2 border-[#03140C] text-center min-w-[120px] shadow-[2px_2px_0px_#020C07] ${
                    timeLeft <= 30 ? 'bg-red-900/90 text-white animate-bounce' : 'bg-[#020B06] text-[#FBBF24]'
                  }`}>
                    <div className="flex items-center justify-center space-x-1 text-[10px] uppercase font-bold text-slate-400">
                      <Clock className="w-3 h-3 text-[#FBBF24]" />
                      <span>EXTRACTION TIMER</span>
                    </div>
                    <p className="text-2xl font-black">
                      {Math.floor(timeLeft / 60)}:{((timeLeft % 60)).toString().padStart(2, '0')}
                    </p>
                  </div>

                  {/* Alarm Level Meter */}
                  <div className={`p-2.5 border-2 border-[#03140C] text-center min-w-[140px] shadow-[2px_2px_0px_#020C07] ${
                    alarmLevel === 'HIGH_LOCKDOWN' 
                      ? 'bg-red-900 text-white animate-pulse' 
                      : alarmLevel === 'MEDIUM_ALERT'
                      ? 'bg-amber-900/90 text-amber-200'
                      : 'bg-[#020B06] text-[#10B981]'
                  }`}>
                    <div className="flex items-center justify-center space-x-1 text-[10px] uppercase font-bold text-slate-300">
                      <ShieldAlert className="w-3 h-3" />
                      <span>SECURITY LEVEL</span>
                    </div>
                    <p className="text-xs font-black uppercase mt-1">
                      {alarmLevel.replace('_', ' ')} ({alarmFails} FAILS)
                    </p>
                  </div>

                  {/* Stage Switcher Controls */}
                  <div className="flex bg-[#03140C] border-2 border-[#03140C] p-0.5">
                    {allStages.map((stg, sIdx) => (
                      <button
                        key={stg.stageId || sIdx}
                        onClick={() => handleStartHeistStage(sIdx)}
                        className={`px-3 py-2 text-xs font-black uppercase transition-all ${
                          currentStageIdx === sIdx 
                            ? 'bg-[#10B981] text-[#02140D]' 
                            : 'text-emerald-300 hover:text-white'
                        }`}
                      >
                        {stg.isCustom ? `CUSTOM` : `STAGE 0${stg.stageId}`}
                      </button>
                    ))}
                  </div>

                </div>
              </div>

              {/* Interdependence Pipeline Matrix */}
              <InterdependenceMatrix
                stageData={currentStageData}
                solvedRoles={currentStageSolved}
                roleClues={currentStageClues}
              />

              {/* Role Cockpit Switcher Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'hacker', name: 'The Hacker', icon: Terminal, color: '#10B981', discipline: 'Data Structures / Code' },
                  { id: 'engineer', name: 'The Engineer', icon: Compass, color: '#FBBF24', discipline: 'Physics / Geometry' },
                  { id: 'scientist', name: 'The Scientist', icon: FlaskConical, color: '#06B6D4', discipline: 'Chemistry / Biology' },
                  { id: 'cryptographer', name: 'The Cryptographer', icon: Key, color: '#C084FC', discipline: 'Ciphers / Languages' }
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
                      className={`p-3.5 border-[3px] border-[#03140C] text-left transition-all flex flex-col justify-between ${
                        isActive
                          ? 'bg-[#0A3020] shadow-[4px_4px_0px_#FBBF24] -translate-y-1'
                          : 'bg-[#051811]/90 shadow-[2px_2px_0px_#020C07] hover:bg-[#08281A]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" style={{ color: roleItem.color }} />
                          <span className="font-mono text-xs font-black uppercase" style={{ color: roleItem.color }}>
                            {roleItem.name}
                          </span>
                        </div>
                        {isRoleSolved && (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        )}
                      </div>
                      <p className="text-[10px] text-emerald-300 font-mono mt-2">{roleItem.discipline}</p>
                    </button>
                  );
                })}
              </div>

              {/* Cockpit Workspace & Walkie-Talkie Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
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
                  <div className="forest-card p-4 border-[2px] border-[#03140C] bg-[#051811]/90 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-[#FBBF24]" />
                      <span className="text-xs font-mono font-black uppercase text-emerald-300">
                        Solo / Co-Op Simulator
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-200">
                      Playing solo or missing a squadmate? Simulate an AI teammate solving one of the other pending roles.
                    </p>
                    <button
                      onClick={handleSimulateBotTeammates}
                      className="w-full bg-[#0A2D1F] text-[#FBBF24] font-black text-xs py-2.5 border-2 border-[#03140C] shadow-[2px_2px_0px_#020C07] hover:bg-[#10B981] hover:text-[#02140D] transition-colors uppercase"
                    >
                      🤖 Request Bot Squadmate Input
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: EXPEDITIONS / MISSIONS */}
          {activeTab === 'missions' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#03140C] pb-4 bg-[#071E14]/70 p-4 backdrop-blur-md">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight flex items-center space-x-2 text-[#F0FDF4]">
                    <Compass className="w-8 h-8 text-[#10B981]" />
                    <span>Active STEM Expeditions & Custom Heists</span>
                  </h2>
                  <p className="text-emerald-200 font-medium">Select a multidisciplinary vault target, craft custom operations, and assemble your squad.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setIsCustomHeistModalOpen(true);
                      heistAudio.playKeyClick();
                    }}
                    className="bg-[#FBBF24] text-[#02140D] font-black text-xs px-4 py-2 border-2 border-[#03140C] shadow-[3px_3px_0px_#020C07] hover:bg-[#F59E0B] active:translate-x-0.5 uppercase flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Create Custom Heist</span>
                  </button>
                  <span className="bg-[#10B981] text-[#02140D] border-2 border-[#03140C] font-black text-xs px-3 py-2 shadow-[2px_2px_0px_#020C07]">
                    {missions.length} EXPEDITIONS READY
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {missions.map((mission, mIdx) => (
                  <motion.div
                    key={mission.id}
                    whileHover={{ y: -4, x: -2 }}
                    className="forest-card flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      <div className="relative h-56 border-b-[3px] border-[#03140C] overflow-hidden bg-[#03140C]">
                        <img 
                          src={mission.image} 
                          alt={mission.title} 
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_SUBJECT_IMG; }}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-[#FBBF24] text-[#02140D] font-black text-xs px-3 py-1 border-2 border-[#03140C] shadow-[2px_2px_0px_#020C07] uppercase">
                            {mission.category}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className={`font-black text-xs px-3 py-1 border-2 border-[#03140C] shadow-[2px_2px_0px_#020C07] uppercase ${
                            mission.difficulty.includes('Master') 
                              ? 'bg-[#FF4D6D] text-white' 
                              : 'bg-[#10B981] text-[#02140D]'
                          }`}>
                            {mission.difficulty}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-[#071E14]/90 text-[#FBBF24] font-black text-xs px-3 py-1 border-2 border-[#03140C] shadow-[2px_2px_0px_#020C07]">
                          🎁 {mission.reward}
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-black text-[#F0FDF4] uppercase tracking-tight">{mission.title}</h3>
                          <span className="text-xs font-mono font-bold text-emerald-300 bg-[#0A261B] px-2.5 py-1 border border-emerald-500/30">
                            {mission.customStageData ? `${Object.values(mission.customStageData.selectedRoles || {}).filter(Boolean).length} ROLES` : '3 STAGES'}
                          </span>
                        </div>

                        <p className="text-emerald-200/90 text-sm leading-relaxed font-medium">
                          {mission.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-[#0E3A28]/50 mt-4 flex items-center justify-between">
                      <button
                        onClick={() => {
                          if (mission.customStageData) {
                            handleLaunchCustomHeist(mission.customStageData);
                          } else {
                            handleStartHeistStage(mIdx % allStages.length);
                          }
                        }}
                        className="w-full bg-[#10B981] text-[#02140D] font-black py-3 px-6 border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#34D399] active:translate-x-0.5 uppercase flex items-center justify-center space-x-2 text-sm"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>INFILTRATE TARGET VAULT</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SQUAD LOBBY */}
          {activeTab === 'lobby' && (
            <div className="space-y-8">
              <div className="forest-card p-6 sm:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#03140C] pb-5">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-[#10B981] text-[#02140D] font-black text-xs px-2.5 py-0.5 border border-[#03140C] uppercase">
                        SQUAD ASSEMBLED
                      </span>
                      <span className="text-xs font-mono text-emerald-300">MULTIPLAYER ROOM</span>
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight mt-1 text-[#F0FDF4]">{lobby.name}</h2>
                    <p className="text-emerald-200 text-sm">Lock in your specialized roles and launch simultaneous synchronized extraction.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-[#020B06] px-4 py-2 border-2 border-[#03140C] shadow-[2px_2px_0px_#020C07]">
                      <span className="text-[10px] font-mono text-emerald-400 block uppercase font-bold">Invite Code</span>
                      <span className="text-xl font-mono font-black text-[#FBBF24] tracking-widest">{lobby.code}</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsCustomHeistModalOpen(true);
                        heistAudio.playKeyClick();
                      }}
                      className="bg-[#FBBF24] text-[#02140D] font-black px-4 py-3.5 border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#F59E0B] active:translate-x-0.5 uppercase flex items-center space-x-1.5 text-sm"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Custom Heist</span>
                    </button>
                    <button
                      onClick={() => handleStartHeistStage(0)}
                      className="bg-[#10B981] text-[#02140D] font-black px-6 py-3.5 border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#34D399] active:translate-x-0.5 uppercase flex items-center space-x-2 text-base"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      <span>LAUNCH OPERATION</span>
                    </button>
                  </div>
                </div>

                {/* 4 Ranger Slots */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {lobby.players.map((slot) => {
                    const char = characters.find(c => c.id === slot.characterId);
                    return (
                      <div
                        key={slot.slotId}
                        className={`p-5 border-[3px] border-[#03140C] relative flex flex-col justify-between ${
                          slot.playerName 
                            ? 'bg-[#071E14] shadow-[4px_4px_0px_#10B981]' 
                            : 'bg-[#031209]/80 border-dashed shadow-[2px_2px_0px_#020C07]'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="bg-[#03140C] text-emerald-300 font-mono text-xs font-black px-2 py-0.5">
                              SLOT 0{slot.slotId}
                            </span>
                            {slot.isHost && (
                              <span className="bg-[#FBBF24] text-[#02140D] text-xs font-black px-2 py-0.5 border border-[#03140C]">
                                SQUAD LEADER
                              </span>
                            )}
                          </div>

                          {slot.playerName ? (
                            <div className="space-y-3">
                              <img 
                                src={char?.avatar || FALLBACK_AVATAR_IMG} 
                                alt={slot.playerName} 
                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_AVATAR_IMG; }}
                                className="w-16 h-16 rounded-none border-2 border-[#03140C] object-cover mx-auto"
                              />
                              <div className="text-center">
                                <h4 className="font-black text-lg text-[#F0FDF4]">{slot.playerName}</h4>
                                <div className="inline-block bg-[#10B981]/30 border border-[#10B981] px-2 py-0.5 text-xs font-bold uppercase text-[#6EE7B7] mt-1">
                                  {slot.role}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="py-8 text-center space-y-2">
                              <UserPlus className="w-8 h-8 text-emerald-600 mx-auto" />
                              <p className="text-xs font-bold text-emerald-400">Empty Ranger Slot</p>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t-2 border-[#03140C]">
                          {slot.playerName ? (
                            <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-emerald-400">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>READY FOR DROP</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleClaimSlot(slot.slotId)}
                              className="w-full bg-[#FBBF24] text-[#02140D] font-black text-xs py-2 border-2 border-[#03140C] shadow-[2px_2px_0px_#020C07] hover:bg-[#F59E0B] active:translate-x-0.5 uppercase"
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
            </div>
          )}

          {/* TAB 4: ROLES & RANGERS */}
          {activeTab === 'characters' && (
            <div className="space-y-8">
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
            </div>
          )}

          {/* TAB 5: DISCIPLINES & TOPICS */}
          {activeTab === 'topics' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#03140C] pb-4 bg-[#071E14]/70 p-4 backdrop-blur-md">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight flex items-center space-x-2 text-[#F0FDF4]">
                    <BookOpen className="w-8 h-8 text-[#10B981]" />
                    <span>Cross-Disciplinary Subject Matrix & Roadmaps</span>
                  </h2>
                  <p className="text-emerald-200 font-medium">Applied problem solving across computer science, physics, chemistry, and cryptography.</p>
                </div>
                <button
                  onClick={() => {
                    setIsRoadmapModalOpen(true);
                    heistAudio.playKeyClick();
                  }}
                  className="bg-[#FBBF24] text-[#02140D] font-black px-4 py-2.5 border-[3px] border-[#03140C] shadow-[3px_3px_0px_#020C07] hover:bg-[#F59E0B] active:translate-x-0.5 uppercase flex items-center space-x-2 text-xs sm:text-sm flex-shrink-0"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Interactive STEM Learning Roadmap</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topics.map(topic => (
                  <div key={topic.id} className="forest-card p-6 space-y-4">
                    <div className="bg-[#10B981] p-3 w-fit border-2 border-[#03140C]">
                      <Sparkles className="w-6 h-6 text-[#02140D]" />
                    </div>
                    <h3 className="text-xl font-black text-[#F0FDF4] uppercase">{topic.name}</h3>
                    <p className="text-xs text-emerald-200 leading-relaxed font-medium">{topic.description}</p>
                    <div className="pt-2 border-t border-[#0E3A28] flex justify-between items-center text-xs font-mono">
                      <span className="text-[#FBBF24] font-bold">Active Heists:</span>
                      <span className="text-emerald-300 font-black">{topic.activeHeists}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CANOPY ROOM MAP */}
          {activeTab === 'map' && (
            <div className="forest-card p-6 sm:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#03140C] pb-4">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight text-[#F0FDF4]">Canopy Grove Map</h2>
                  <p className="text-emerald-200 text-sm">Interactive chamber overview of the World Tree sanctuary.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-[#10B981] text-[#02140D] font-mono font-black text-xs px-3 py-1.5 border border-[#03140C]">
                    XP: {xp}
                  </span>
                  <span className="bg-[#FBBF24] text-[#02140D] font-mono font-black text-xs px-3 py-1.5 border border-[#03140C]">
                    STREAK: {streak} 🔥
                  </span>
                </div>
              </div>

              {/* Trivia / Gate question */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(roomNum => {
                  const q = triviaQuestions[roomNum];
                  const isUnlocked = unlockedRooms.includes(roomNum);
                  const isDone = !!roomSolved[roomNum];

                  return (
                    <div 
                      key={roomNum}
                      className={`p-4 border-2 border-[#03140C] space-y-3 ${
                        isDone 
                          ? 'bg-[#0A3020] shadow-[3px_3px_0px_#10B981]' 
                          : isUnlocked 
                          ? 'bg-[#071E14] shadow-[3px_3px_0px_#FBBF24]' 
                          : 'bg-[#031209] opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs font-black text-[#FBBF24]">CHAMBER 0{roomNum}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        ) : isUnlocked ? (
                          <Unlock className="w-4 h-4 text-[#FBBF24]" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-500" />
                        )}
                      </div>

                      <p className="text-xs text-emerald-100 font-bold leading-snug">{q?.question}</p>

                      <div className="space-y-1.5 pt-2">
                        {q?.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            disabled={!isUnlocked || isDone}
                            onClick={() => {
                              if (oIdx === q.correct) {
                                heistAudio.playSuccessChime();
                                setRoomSolved(prev => ({ ...prev, [roomNum]: true }));
                                setUnlockedRooms(prev => [...new Set([...prev, roomNum + 1])]);
                                setXp(prev => prev + 250);
                                toast.success(`Chamber 0${roomNum} Unlocked! +250 XP`);
                              } else {
                                heistAudio.playAlarmSiren();
                                toast.error("Incorrect answer! Security gate locked.");
                              }
                            }}
                            className={`w-full text-left px-2.5 py-1.5 text-[11px] font-mono border transition-colors ${
                              isDone && oIdx === q.correct
                                ? 'bg-[#10B981] text-[#02140D] font-bold border-[#10B981]'
                                : 'bg-[#03140C] text-emerald-300 border-[#03140C] hover:bg-[#10B981]/20'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: ARCHITECT WORKSHOP / MISSION BUILDER */}
          {activeTab === 'builder' && (
            <div className="forest-card p-6 sm:p-8 space-y-6">
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
            </div>
          )}

          {/* TAB 8: SYNDICATE PASS / WAITLIST */}
          {activeTab === 'waitlist' && (
            <div className="forest-card p-6 sm:p-8 space-y-6 max-w-2xl mx-auto text-center">
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
            </div>
          )}

        </main>
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
    </div>
  );
}
