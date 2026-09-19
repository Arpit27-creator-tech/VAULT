import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Lock, Unlock, CheckCircle2, AlertTriangle, 
  RotateCw, RotateCcw, Zap, Sparkles, Clock, Radio, 
  ChevronRight, Volume2, ShieldCheck, Flame, Users
} from 'lucide-react';
import { heistAudio } from './HeistAudioEngine';
import { heistSocket, onSocketEvent, offSocketEvent } from '../services/socket';

// ── Roles Configuration for the 4 Concentric Rings ───────────────────────────
const EXTRACTION_ROLES = [
  {
    role: 'scientist',
    title: 'Scientist',
    label: 'Chem Resonance',
    color: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    radius: 168,
    strokeWidth: 16,
    defaultTarget: 140,
    clueTag: 'pH Buffer Density'
  },
  {
    role: 'engineer',
    title: 'Engineer',
    label: 'Laser Optics',
    color: '#FBBF24',
    glowColor: 'rgba(251, 191, 36, 0.5)',
    radius: 134,
    strokeWidth: 16,
    defaultTarget: 45,
    clueTag: 'Snell Refraction'
  },
  {
    role: 'hacker',
    title: 'Hacker',
    label: 'Kernel Slice',
    color: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    radius: 100,
    strokeWidth: 16,
    defaultTarget: 220,
    clueTag: 'Array Memory Offset'
  },
  {
    role: 'cryptographer',
    title: 'Cryptographer',
    label: 'Cipher Carrier',
    color: '#C084FC',
    glowColor: 'rgba(192, 132, 252, 0.5)',
    radius: 66,
    strokeWidth: 16,
    defaultTarget: 315,
    clueTag: 'VHF Master Modulation'
  }
];

const ALIGN_TOLERANCE = 7; // ±7 degrees is aligned

export default function ExtractionProtocolModal({
  isOpen,
  activeRole = 'hacker',
  stageData = {},
  solvedRoles = {},
  roleClues = {},
  currentUser,
  lobby,
  onExtractionSuccess,
  onExtractionFail,
  onClose
}) {
  if (!isOpen) return null;

  const roomCode = lobby?.code || null;
  const isMultiplayer = Boolean(roomCode && lobby?.players?.length > 1);

  // Target angles for each ring
  const targetAngles = useMemo(() => {
    return {
      scientist: 140,
      engineer: 45,
      hacker: 220,
      cryptographer: 315
    };
  }, []);

  // Ring angles (0 - 359)
  const [angles, setAngles] = useState({
    scientist: 0,
    engineer: 180,
    hacker: 90,
    cryptographer: 270
  });

  // Locked pins state
  const [lockedPins, setLockedPins] = useState({
    scientist: false,
    engineer: false,
    hacker: false,
    cryptographer: false
  });

  // Which ring is currently selected for touch/drag/buttons (defaults to player's active role)
  const [selectedRole, setSelectedRole] = useState(activeRole);

  // Master Extraction Timer (45 seconds)
  const [timeLeft, setTimeLeft] = useState(45.0);
  const [isBreached, setIsBreached] = useState(false);
  const [desyncCount, setDesyncCount] = useState(0);

  // 5-Second Synchronization Window state
  const [syncWindowActive, setSyncWindowActive] = useState(false);
  const [syncTimeLeft, setSyncTimeLeft] = useState(5.0);

  // Radio log
  const [radioLog, setRadioLog] = useState([
    { sender: 'DISPATCH', text: '⚠️ Core Extraction protocol active! All 4 rings must align.', color: '#FBBF24' }
  ]);

  const svgRef = useRef(null);
  const isDraggingRef = useRef(false);

  // ── Helper to check if a ring is aligned ─────────────────────────────────
  const isRingAligned = useCallback((role) => {
    const angle = angles[role] || 0;
    const target = targetAngles[role];
    const diff = Math.abs((angle - target + 360) % 360);
    return diff <= ALIGN_TOLERANCE || diff >= (360 - ALIGN_TOLERANCE);
  }, [angles, targetAngles]);

  // Count aligned and locked
  const alignedCount = EXTRACTION_ROLES.filter(r => isRingAligned(r.role)).length;
  const lockedCount = EXTRACTION_ROLES.filter(r => lockedPins[r.role]).length;

  // ── Master 45s Countdown Timer ───────────────────────────────────────────
  useEffect(() => {
    if (isBreached) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(interval);
          heistAudio.playAlarmSiren();
          onExtractionFail?.('Extraction timer expired before synchronized breach!');
          return 0;
        }
        return +(prev - 0.1).toFixed(1);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isBreached, onExtractionFail]);

  // ── 5-Second Synchronization Window Countdown ────────────────────────────
  useEffect(() => {
    if (!syncWindowActive || isBreached) return;

    const interval = setInterval(() => {
      setSyncTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(interval);
          // Desynchronization!
          handleDesync();
          return 5.0;
        }
        return +(prev - 0.1).toFixed(1);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [syncWindowActive, isBreached]);

  // ── Check for Successful 4-Way Breach ─────────────────────────────────────
  useEffect(() => {
    if (lockedCount === 4 && !isBreached) {
      setIsBreached(true);
      setSyncWindowActive(false);
      heistAudio.playCoreBreachBlast();

      setRadioLog(prev => [
        ...prev,
        { sender: 'SYNDICATE CORE', text: '💥 4-WAY SYNCHRONIZED BREACH CONFIRMED! VAULT UNSEALED!', color: '#10B981' }
      ]);

      // Broadcast breach if in multiplayer
      if (roomCode) {
        try {
          heistSocket.completeExtraction(roomCode);
        } catch (e) {}
      }

      // Delay victory trigger slightly for cinematic explosion
      const timeout = setTimeout(() => {
        onExtractionSuccess?.(250, 45.0 - timeLeft);
      }, 1600);

      return () => clearTimeout(timeout);
    }
  }, [lockedCount, isBreached, roomCode, timeLeft, onExtractionSuccess]);

  // ── Handle Desynchronization (Window expired without all 4 locked) ────────
  const handleDesync = () => {
    heistAudio.playHydraulicHiss(0.45);
    setSyncWindowActive(false);
    setSyncTimeLeft(5.0);
    setLockedPins({
      scientist: false,
      engineer: false,
      hacker: false,
      cryptographer: false
    });
    setDesyncCount(c => c + 1);
    setTimeLeft(t => Math.max(5, +(t - 4.0).toFixed(1))); // 4s penalty

    setRadioLog(prev => [
      ...prev,
      { sender: 'LOCK FAULT', text: '⚠️ DESYNCHRONIZATION! Pins reset. -4s time penalty.', color: '#FF4D6D' }
    ]);
  };

  // ── Autonomous Squadmate Bot AI (Solo or partial squad) ───────────────────
  useEffect(() => {
    if (isMultiplayer) return; // In multiplayer, real players control their roles

    // For any role that isn't the active player's role, simulate bot alignment over 4-10 seconds
    const otherRoles = EXTRACTION_ROLES.filter(r => r.role !== activeRole);

    const timeouts = otherRoles.map((r, idx) => {
      const delay = (idx + 1) * 2200 + Math.random() * 800;
      return setTimeout(() => {
        setAngles(prev => ({
          ...prev,
          [r.role]: targetAngles[r.role]
        }));
        heistAudio.playVaultTumblerClick(idx * 80);

        setRadioLog(prev => [
          ...prev,
          { 
            sender: r.title.toUpperCase(), 
            text: `🎯 ${r.label} ring aligned at ${targetAngles[r.role]}°! Ready to pin.`, 
            color: r.color 
          }
        ]);
      }, delay);
    });

    return () => timeouts.forEach(t => clearTimeout(t));
  }, [activeRole, isMultiplayer, targetAngles]);

  // Auto-pin bot teammates when sync window begins
  useEffect(() => {
    if (isMultiplayer || !syncWindowActive || isBreached) return;

    // When the human player locks their pin, bot teammates quickly lock theirs within 1-2.5s
    const otherRoles = EXTRACTION_ROLES.filter(r => r.role !== activeRole && !lockedPins[r.role]);
    
    otherRoles.forEach((r, idx) => {
      const botPinDelay = 600 + idx * 650;
      setTimeout(() => {
        setLockedPins(prev => ({ ...prev, [r.role]: true }));
        heistAudio.playPinEngagedTone(r.color);
        setRadioLog(prev => [
          ...prev,
          { sender: r.title.toUpperCase(), text: `🔒 Pin engaged at ${targetAngles[r.role]}°!`, color: r.color }
        ]);
      }, botPinDelay);
    });
  }, [syncWindowActive, activeRole, isMultiplayer, isBreached, targetAngles]);

  // ── Multiplayer Socket Event Listeners ────────────────────────────────────
  useEffect(() => {
    if (!roomCode) return;

    const handleRemoteRing = (data) => {
      if (data?.role && data?.angle !== undefined) {
        setAngles(prev => ({ ...prev, [data.role]: data.angle }));
      }
    };

    const handleRemotePin = (data) => {
      if (data?.role) {
        setLockedPins(prev => ({ ...prev, [data.role]: true }));
        heistAudio.playPinEngagedTone();
        if (!syncWindowActive) {
          setSyncWindowActive(true);
          setSyncTimeLeft(5.0);
        }
      }
    };

    const handleRemoteBreached = () => {
      setIsBreached(true);
      heistAudio.playCoreBreachBlast();
      setTimeout(() => {
        onExtractionSuccess?.(250, 45.0 - timeLeft);
      }, 1600);
    };

    onSocketEvent('heistExtractionRingUpdate', handleRemoteRing);
    onSocketEvent('heistExtractionPinLocked', handleRemotePin);
    onSocketEvent('heistExtractionBreached', handleRemoteBreached);

    return () => {
      offSocketEvent('heistExtractionRingUpdate', handleRemoteRing);
      offSocketEvent('heistExtractionPinLocked', handleRemotePin);
      offSocketEvent('heistExtractionBreached', handleRemoteBreached);
    };
  }, [roomCode, syncWindowActive, timeLeft, onExtractionSuccess]);

  // ── Rotate Angle Handler ──────────────────────────────────────────────────
  const rotateRole = (role, delta) => {
    if (lockedPins[role] || isBreached) return;

    setAngles(prev => {
      const next = (prev[role] + delta + 360) % 360;
      heistAudio.playVaultTumblerClick((next % 40) * 8);

      if (roomCode) {
        try {
          const aligned = Math.abs((next - targetAngles[role] + 360) % 360) <= ALIGN_TOLERANCE;
          heistSocket.updateExtractionRing(roomCode, role, next, aligned);
        } catch (e) {}
      }

      return { ...prev, [role]: next };
    });
  };

  // ── Pin Lock Handler ──────────────────────────────────────────────────────
  const handleLockPin = (role) => {
    if (lockedPins[role] || isBreached) return;
    if (!isRingAligned(role)) {
      heistAudio.playAlarmChime?.();
      return;
    }

    setLockedPins(prev => ({ ...prev, [role]: true }));
    heistAudio.playPinEngagedTone(EXTRACTION_ROLES.find(r => r.role === role)?.color);

    setRadioLog(prev => [
      ...prev,
      { sender: 'PIN ENGAGED', text: `🔒 ${role.toUpperCase()} pin locked! Sync window opened.`, color: '#10B981' }
    ]);

    // Start 5s sync window on first pin lock
    if (!syncWindowActive) {
      setSyncWindowActive(true);
      setSyncTimeLeft(5.0);
    }

    if (roomCode) {
      try {
        heistSocket.lockExtractionPin(roomCode, role);
      } catch (e) {}
    }
  };

  // ── Quick Squad Auto-Sync (Solo accessibility helper) ─────────────────────
  const handleAutoSyncSquad = () => {
    if (isBreached) return;
    EXTRACTION_ROLES.forEach((r, idx) => {
      setTimeout(() => {
        setAngles(prev => ({ ...prev, [r.role]: targetAngles[r.role] }));
        setLockedPins(prev => ({ ...prev, [r.role]: true }));
        heistAudio.playPinEngagedTone(r.color);
      }, idx * 180);
    });
    setSyncWindowActive(true);
  };

  // ── SVG Drag-To-Rotate Handler ────────────────────────────────────────────
  const handleSvgPointerDown = (e) => {
    if (lockedPins[selectedRole] || isBreached) return;
    isDraggingRef.current = true;
    updateAngleFromPointer(e);
  };

  const handleSvgPointerMove = (e) => {
    if (!isDraggingRef.current || lockedPins[selectedRole] || isBreached) return;
    updateAngleFromPointer(e);
  };

  const handleSvgPointerUp = () => {
    isDraggingRef.current = false;
  };

  const updateAngleFromPointer = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    if (clientX === undefined || clientY === undefined) return;

    const dx = clientX - cx;
    const dy = clientY - cy;
    let rad = Math.atan2(dy, dx);
    let deg = Math.round((rad * 180) / Math.PI);
    deg = (deg + 90 + 360) % 360; // 0 at 12 o'clock

    setAngles(prev => {
      const current = prev[selectedRole];
      if (Math.abs(current - deg) > 2) {
        heistAudio.playVaultTumblerClick();
      }
      return { ...prev, [selectedRole]: deg };
    });
  };

  const activeRoleConfig = EXTRACTION_ROLES.find(r => r.role === selectedRole) || EXTRACTION_ROLES[0];
  const isCurrentRoleAligned = isRingAligned(selectedRole);
  const isCurrentRoleLocked = lockedPins[selectedRole];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#020B06]/92 backdrop-blur-xl animate-fade-in overflow-y-auto">
      
      {/* Breached Massive Flash Overlay */}
      <AnimatePresence>
        {isBreached && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gradient-to-b from-[#10B981]/30 via-black/80 to-[#FBBF24]/30 pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.15, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center p-8 bg-[#020C07]/95 border-4 border-[#10B981] rounded-2xl shadow-[0_0_80px_rgba(16,185,129,0.8)]"
            >
              <div className="w-20 h-20 bg-[#10B981]/20 border-2 border-[#10B981] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Unlock className="w-10 h-10 text-[#10B981]" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-black font-game text-[#F0FDF4] uppercase tracking-wider">
                VAULT CORE BREACHED!
              </h2>
              <p className="text-amber-300 font-mono font-bold text-sm sm:text-base mt-2">
                4-WAY EXTRACTION SYNCHRONIZATION SUCCESSFUL (+250 XP BONUS)
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tactical Chassis */}
      <div className="forest-card max-w-4xl w-full border-[3px] border-[#10B981]/70 bg-[#04160E] rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.3)] relative overflow-hidden flex flex-col my-auto text-left">
        
        {/* Top Warning Hazard Banner */}
        <div className="bg-gradient-to-r from-[#FF4D6D] via-[#FBBF24] to-[#10B981] h-1.5 w-full" />

        {/* ── Modal Header ────────────────────────────────────────────── */}
        <div className="p-4 sm:p-5 border-b border-emerald-900/60 bg-[#020B06]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#07281A] border-2 border-[#10B981] text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white font-game">
                  EXTRACTION PROTOCOL
                </h2>
                <span className="bg-[#10B981]/20 text-[#34D399] font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-[#10B981]/40 uppercase">
                  FINAL STAGE
                </span>
              </div>
              <p className="text-xs font-mono text-emerald-300/80">
                Synchronize all 4 tumbler rings within 5.0 seconds of each other to pop the vault.
              </p>
            </div>
          </div>

          {/* Master 45s Countdown HUD */}
          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <div className="bg-[#020B06] border-2 border-emerald-800 px-3.5 py-1.5 rounded-xl flex items-center space-x-2 shadow-inner">
              <Clock className={`w-4 h-4 ${timeLeft < 15 ? 'text-[#FF4D6D] animate-ping' : 'text-[#FBBF24]'}`} />
              <div className="text-right">
                <span className="text-[9px] font-mono text-slate-400 block leading-none">TIME TO LOCKDOWN</span>
                <span className={`text-base sm:text-lg font-black font-mono tracking-wider ${
                  timeLeft < 15 ? 'text-[#FF4D6D]' : 'text-[#FBBF24]'
                }`}>
                  00:{timeLeft < 10 ? `0${timeLeft.toFixed(1)}` : timeLeft.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5-Second Synchronization Window Banner ──────────────────── */}
        {syncWindowActive && (
          <div className="bg-[#0A261B] border-b-2 border-amber-500/80 p-2.5 sm:px-6 flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />
              <span className="text-xs font-black font-mono text-[#FBBF24] uppercase tracking-wider">
                SYNCHRONIZATION WINDOW ENGAGED! ALL OPERATIVES LOCK PINS NOW:
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-[#020B06] h-2.5 rounded-full overflow-hidden border border-amber-500">
                <div 
                  className="bg-[#FBBF24] h-full transition-all duration-100 ease-linear"
                  style={{ width: `${(syncTimeLeft / 5.0) * 100}%` }}
                />
              </div>
              <span className="text-sm font-black font-mono text-white">
                {syncTimeLeft.toFixed(1)}s
              </span>
            </div>
          </div>
        )}

        {/* ── Main Body: Concentric SVG Core (Left) + Cockpit Controls (Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6 items-center">
          
          {/* LEFT: The 4-Ring Concentric SVG Dial (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
            
            <div 
              ref={svgRef}
              onPointerDown={handleSvgPointerDown}
              onPointerMove={handleSvgPointerMove}
              onPointerUp={handleSvgPointerUp}
              className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] cursor-grab active:cursor-grabbing select-none"
              title="Click and drag to rotate the selected ring"
            >
              <svg 
                viewBox="-200 -200 400 400" 
                className="w-full h-full filter drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
              >
                {/* Background Core Circle */}
                <circle cx="0" cy="0" r="190" fill="#020B06" stroke="#062217" strokeWidth="4" />

                {/* Concentric Calibration Tracks & Rotating Arcs */}
                {EXTRACTION_ROLES.map((r) => {
                  const angle = angles[r.role] || 0;
                  const target = targetAngles[r.role];
                  const aligned = isRingAligned(r.role);
                  const isLocked = lockedPins[r.role];
                  const isSelected = selectedRole === r.role;
                  const circ = 2 * Math.PI * r.radius;

                  return (
                    <g key={r.role}>
                      {/* Static Track Guide */}
                      <circle 
                        cx="0" cy="0" r={r.radius}
                        fill="none"
                        stroke="#031A10"
                        strokeWidth={r.strokeWidth}
                      />

                      {/* Target Alignment Notch Marker (Stationary Gate at Target Angle) */}
                      <g transform={`rotate(${target})`}>
                        <line 
                          x1="0" y1={-r.radius - (r.strokeWidth / 2) - 3} 
                          x2="0" y2={-r.radius + (r.strokeWidth / 2) + 3} 
                          stroke={aligned ? '#10B981' : r.color}
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <polygon 
                          points={`-4,${-r.radius + 12} 4,${-r.radius + 12} 0,${-r.radius + 6}`}
                          fill={r.color}
                        />
                      </g>

                      {/* Rotating Ring Indicator Group */}
                      <g transform={`rotate(${angle})`}>
                        {/* Ring Arc (colored) */}
                        <circle 
                          cx="0" cy="0" r={r.radius}
                          fill="none"
                          stroke={isLocked ? '#10B981' : isSelected ? r.color : `${r.color}90`}
                          strokeWidth={isSelected ? r.strokeWidth + 2 : r.strokeWidth}
                          strokeDasharray={`${circ * 0.45} ${circ * 0.55}`}
                          strokeLinecap="round"
                          style={{
                            filter: aligned 
                              ? 'drop-shadow(0 0 6px #10B981)' 
                              : isSelected 
                              ? `drop-shadow(0 0 8px ${r.glowColor})` 
                              : 'none'
                          }}
                        />

                        {/* Tumbler Pin Lock Head */}
                        <circle 
                          cx="0" cy={-r.radius} 
                          r={isLocked ? 6 : 5}
                          fill={isLocked ? '#10B981' : '#F0FDF4'}
                          stroke="#020B06"
                          strokeWidth="2"
                        />
                      </g>
                    </g>
                  );
                })}

                {/* Central Core Hydraulic Hub */}
                <circle cx="0" cy="0" r="46" fill="#020C07" stroke={isBreached ? '#10B981' : '#10B981'} strokeWidth="3" />
                <circle cx="0" cy="0" r="38" fill="#041E13" />

                {/* Center Icon */}
                <g className="transition-all duration-300">
                  {isBreached ? (
                    <text x="0" y="8" textAnchor="middle" fill="#10B981" fontSize="26" fontWeight="bold" fontFamily="monospace">
                      🔓
                    </text>
                  ) : (
                    <text x="0" y="8" textAnchor="middle" fill="#FBBF24" fontSize="22" fontWeight="bold" fontFamily="monospace">
                      {lockedCount}/4
                    </text>
                  )}
                </g>
              </svg>

              {/* Angle Readout Pill in Corner */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-[#020B06]/90 border border-emerald-800/80 px-3 py-1 rounded-full font-mono text-xs flex items-center space-x-2 shadow-lg">
                <span style={{ color: activeRoleConfig.color }} className="font-black uppercase">
                  {activeRoleConfig.title}:
                </span>
                <span className="text-white font-bold">{angles[selectedRole]}°</span>
                <span className="text-slate-400">/ Target: {targetAngles[selectedRole]}°</span>
                {isCurrentRoleAligned && (
                  <span className="text-[#10B981] font-black flex items-center space-x-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ALIGNED</span>
                  </span>
                )}
              </div>
            </div>

            <p className="text-[10px] font-mono text-slate-400 mt-2 text-center">
              Drag dial directly, or use precision step buttons on the right to align rings.
            </p>
          </div>

          {/* RIGHT: Role Selection Tabs & Controls Cockpit (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* 4 Role Selector Buttons */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                SELECT OPERATIVE TUMBLER RING:
              </span>

              <div className="grid grid-cols-2 gap-2">
                {EXTRACTION_ROLES.map(r => {
                  const isSelected = selectedRole === r.role;
                  const aligned = isRingAligned(r.role);
                  const isLocked = lockedPins[r.role];

                  return (
                    <button
                      key={r.role}
                      onClick={() => {
                        setSelectedRole(r.role);
                        heistAudio.playKeyClick();
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between relative overflow-hidden ${
                        isSelected
                          ? 'bg-[#0A2E1E] border-[#10B981] shadow-md ring-1 ring-[#10B981]'
                          : 'bg-[#020B06] border-emerald-900/60 hover:border-emerald-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs font-game" style={{ color: r.color }}>
                          {r.title}
                        </span>
                        {isLocked ? (
                          <span className="text-[9px] font-mono font-bold bg-[#10B981]/20 text-[#10B981] px-1 rounded border border-[#10B981]/50">
                            LOCKED
                          </span>
                        ) : aligned ? (
                          <span className="text-[9px] font-mono font-bold bg-[#FBBF24]/20 text-[#FBBF24] px-1 rounded border border-[#FBBF24]/50">
                            READY
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-slate-500">
                            {angles[r.role]}°
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400 truncate">{r.label}</span>
                        <span className={aligned ? 'text-[#10B981]' : 'text-slate-500'}>
                          {targetAngles[r.role]}°
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Precision Angle Calibration Controls */}
            <div className="bg-[#020B06] p-3.5 rounded-xl border border-emerald-900/60 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                <span className="text-xs font-mono font-bold text-white uppercase flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeRoleConfig.color }} />
                  <span>{activeRoleConfig.title} Calibrator</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  Target: {targetAngles[selectedRole]}° (±{ALIGN_TOLERANCE}°)
                </span>
              </div>

              {/* Stepper Buttons */}
              <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
                <button
                  disabled={isCurrentRoleLocked || isBreached}
                  onClick={() => rotateRole(selectedRole, -15)}
                  className="bg-[#051C12] hover:bg-[#072418] disabled:opacity-40 text-emerald-300 font-bold py-2 rounded border border-emerald-900 transition-colors"
                >
                  -15°
                </button>
                <button
                  disabled={isCurrentRoleLocked || isBreached}
                  onClick={() => rotateRole(selectedRole, -2)}
                  className="bg-[#051C12] hover:bg-[#072418] disabled:opacity-40 text-emerald-300 font-bold py-2 rounded border border-emerald-900 transition-colors"
                >
                  -2°
                </button>
                <button
                  disabled={isCurrentRoleLocked || isBreached}
                  onClick={() => rotateRole(selectedRole, 2)}
                  className="bg-[#051C12] hover:bg-[#072418] disabled:opacity-40 text-emerald-300 font-bold py-2 rounded border border-emerald-900 transition-colors"
                >
                  +2°
                </button>
                <button
                  disabled={isCurrentRoleLocked || isBreached}
                  onClick={() => rotateRole(selectedRole, 15)}
                  className="bg-[#051C12] hover:bg-[#072418] disabled:opacity-40 text-emerald-300 font-bold py-2 rounded border border-emerald-900 transition-colors"
                >
                  +15°
                </button>
              </div>

              {/* Lock Pin Action Button */}
              <button
                disabled={!isCurrentRoleAligned || isCurrentRoleLocked || isBreached}
                onClick={() => handleLockPin(selectedRole)}
                className={`w-full py-3 rounded-xl font-game font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg ${
                  isCurrentRoleLocked
                    ? 'bg-[#10B981]/20 text-[#10B981] border-2 border-[#10B981]/60 cursor-not-allowed'
                    : isCurrentRoleAligned
                    ? 'bg-[#10B981] hover:bg-[#34D399] text-[#02140D] border-2 border-[#10B981] shadow-[#10B981]/30 animate-pulse'
                    : 'bg-[#051811] text-slate-500 border border-emerald-950 cursor-not-allowed'
                }`}
              >
                {isCurrentRoleLocked ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    <span>PIN ENGAGED (LOCKED)</span>
                  </>
                ) : isCurrentRoleAligned ? (
                  <>
                    <Lock className="w-4 h-4 text-[#02140D]" />
                    <span>ENGAGE {activeRoleConfig.title.toUpperCase()} PIN NOW!</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span>ALIGN WITH TARGET FIRST ({angles[selectedRole]}° → {targetAngles[selectedRole]}°)</span>
                  </>
                )}
              </button>
            </div>

            {/* Solo Accessibility: Quick Squad Auto-Sync */}
            {!isMultiplayer && (
              <div className="flex items-center justify-between bg-[#051C12]/80 px-3 py-2 rounded-xl border border-emerald-900/60">
                <span className="text-[10px] font-mono text-slate-300">
                  Solo Assistance:
                </span>
                <button
                  onClick={handleAutoSyncSquad}
                  className="bg-[#020B06] hover:bg-[#10B981] text-[#34D399] hover:text-[#02140D] font-mono text-[10px] font-bold px-3 py-1 rounded border border-[#10B981]/50 transition-all uppercase"
                >
                  ⚡ Auto-Sync All Squad Pins
                </button>
              </div>
            )}

            {/* Tactical Radio Log */}
            <div className="bg-[#020B06] p-3 rounded-xl border border-emerald-950 space-y-1.5 font-mono text-[10px] max-h-24 overflow-y-auto">
              <div className="text-[9px] font-bold text-slate-500 uppercase border-b border-emerald-950 pb-1 flex items-center space-x-1">
                <Radio className="w-3 h-3 text-[#10B981]" />
                <span>EXTRACTION TELEMETRY</span>
              </div>
              {radioLog.slice(-3).map((m, i) => (
                <div key={i} className="leading-tight">
                  <span style={{ color: m.color || '#34D399' }} className="font-bold">
                    [{m.sender}]:
                  </span>{' '}
                  <span className="text-slate-300">{m.text}</span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
