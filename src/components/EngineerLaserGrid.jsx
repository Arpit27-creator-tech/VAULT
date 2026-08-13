import React, { useState, useEffect } from 'react';
import { Compass, Zap, CheckCircle2, RotateCw, Sparkles, Activity } from 'lucide-react';
import { heistAudio } from './HeistAudioEngine';

export default function EngineerLaserGrid({ puzzle, onSolved, onFail, isSolved }) {
  const [angleA, setAngleA] = useState(15);
  const [angleB, setAngleB] = useState(90);
  const [isHittingTarget, setIsHittingTarget] = useState(false);

  const reqA = puzzle.requiredAngleA || 45;
  const reqB = puzzle.requiredAngleB || 135;

  useEffect(() => {
    // Check if user set angles within ±3 degrees of required
    const matchA = Math.abs(angleA - reqA) <= 3;
    const matchB = Math.abs(angleB - reqB) <= 3;

    if (matchA && matchB) {
      setIsHittingTarget(true);
    } else {
      setIsHittingTarget(false);
    }
  }, [angleA, angleB, reqA, reqB]);

  const handleAngleAChange = (val) => {
    setAngleA(parseInt(val, 10));
    heistAudio.playKeyClick();
  };

  const handleAngleBChange = (val) => {
    setAngleB(parseInt(val, 10));
    heistAudio.playKeyClick();
  };

  const handleEngageBeam = () => {
    heistAudio.playLaserHum();
    if (isHittingTarget) {
      heistAudio.playSuccessChime();
      onSolved('engineer', puzzle.clueRevealed);
    } else {
      heistAudio.playAlarmSiren();
      onFail('engineer', `Laser beam deflected off-target! Sensor misaligned.`);
    }
  };

  // Calculate beam coordinates for SVG rendering
  // Source: (15, 75)
  // Mirror A: (40, 35)
  // Mirror B: (70, 70)
  // Target: (88, 38)
  const mirrorAX = 38;
  const mirrorAY = 35;
  const mirrorBX = 70;
  const mirrorBY = 68;
  const targetX = puzzle.sensorTargetX || 88;
  const targetY = puzzle.sensorTargetY || 38;

  return (
    <div className="forest-card p-5 sm:p-6 space-y-4 font-sans text-sm border-[3px] border-[#03140C] bg-[#051811]/90 shadow-[6px_6px_0px_#020C07]">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b-2 border-[#03140C] pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#10B981] animate-ping"></div>
          <span className="text-xs font-black uppercase text-[#FBBF24] tracking-wider flex items-center space-x-1 font-mono">
            <Compass className="w-4 h-4 text-[#FBBF24]" />
            <span>THE ENGINEER COCKPIT — {puzzle.title}</span>
          </span>
        </div>
        <span className="text-[11px] font-bold text-[#10B981] bg-[#03140C] px-2 py-0.5 border border-[#10B981]/40 font-mono">
          DISCIPLINE: {puzzle.discipline}
        </span>
      </div>

      {/* Mission Prompt */}
      <div className="bg-[#03140C]/90 p-3 border border-emerald-500/30 text-xs">
        <p className="font-bold text-[#FBBF24]">📐 Applied Geometry & Trajectory Goal:</p>
        <p className="text-emerald-100 mt-0.5">{puzzle.prompt}</p>
      </div>

      {/* SVG Interactive Laser Canvas */}
      <div className="relative w-full h-56 bg-[#020B06] border-2 border-[#03140C] overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Laser Source */}
          <circle cx="12" cy="78" r="3.5" fill="#FF4D6D" stroke="#03140C" strokeWidth="1" />
          <text x="7" y="90" fill="#FF4D6D" fontSize="3.5" fontWeight="bold" fontFamily="monospace">EMITTER</text>

          {/* Mirror A (Pivot) */}
          <g transform={`translate(${mirrorAX}, ${mirrorAY}) rotate(${angleA - 45})`}>
            <line x1="-7" y1="0" x2="7" y2="0" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
            <circle cx="0" cy="0" r="1.5" fill="#FFF" />
          </g>
          <text x={mirrorAX - 6} y={mirrorAY - 4} fill="#FBBF24" fontSize="3" fontFamily="monospace">MIRROR A ({angleA}°)</text>

          {/* Mirror B (Pivot) */}
          <g transform={`translate(${mirrorBX}, ${mirrorBY}) rotate(${angleB - 45})`}>
            <line x1="-7" y1="0" x2="7" y2="0" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
            <circle cx="0" cy="0" r="1.5" fill="#FFF" />
          </g>
          <text x={mirrorBX - 6} y={mirrorBY + 7} fill="#FBBF24" fontSize="3" fontFamily="monospace">MIRROR B ({angleB}°)</text>

          {/* Target Sensor */}
          <rect 
            x={targetX - 4} 
            y={targetY - 4} 
            width="8" 
            height="8" 
            fill={isHittingTarget ? "#10B981" : "#334155"} 
            stroke={isHittingTarget ? "#34D399" : "#03140C"} 
            strokeWidth="1"
          />
          <text x={targetX - 6} y={targetY - 6} fill={isHittingTarget ? "#10B981" : "#94A3B8"} fontSize="3" fontWeight="bold" fontFamily="monospace">
            SENSOR {isHittingTarget ? "[LOCKED]" : "[OFFLINE]"}
          </text>

          {/* Dynamic Laser Beam Lines */}
          {/* Segment 1: Source to Mirror A */}
          <line x1="12" y1="78" x2={mirrorAX} y2={mirrorAY} stroke="#FF4D6D" strokeWidth="1.5" opacity="0.9" />

          {/* Segment 2: Mirror A to Mirror B (Appears when Mirror A is close) */}
          {Math.abs(angleA - reqA) <= 12 && (
            <line 
              x1={mirrorAX} 
              y1={mirrorAY} 
              x2={mirrorBX} 
              y2={mirrorBY} 
              stroke="#FBBF24" 
              strokeWidth="1.5" 
              strokeDasharray={isHittingTarget ? "none" : "2,2"}
              opacity="0.9" 
            />
          )}

          {/* Segment 3: Mirror B to Sensor */}
          {isHittingTarget && (
            <line 
              x1={mirrorBX} 
              y1={mirrorBY} 
              x2={targetX} 
              y2={targetY} 
              stroke="#10B981" 
              strokeWidth="2.5" 
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Live Alignment HUD */}
        <div className="absolute top-2 right-2 bg-[#020B06]/90 border border-emerald-500/40 px-2 py-1 text-[10px] font-mono text-emerald-300">
          BEAM ALIGNMENT: <span className={isHittingTarget ? "text-[#10B981] font-black" : "text-amber-400"}>
            {isHittingTarget ? "100% (COAXIAL)" : `${Math.max(10, 100 - Math.abs(angleA - reqA) * 2 - Math.abs(angleB - reqB) * 2)}%`}
          </span>
        </div>
      </div>

      {/* Precision Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mirror A Slider */}
        <div className="bg-[#03140C] p-3 border border-emerald-900/60 space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-[#FBBF24] font-bold">Mirror A Angle (θ₁):</span>
            <span className="text-white font-black">{angleA}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="180"
            disabled={isSolved}
            value={angleA}
            onChange={(e) => handleAngleAChange(e.target.value)}
            className="w-full accent-[#FBBF24] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0°</span>
            <span>Target: {reqA}°</span>
            <span>180°</span>
          </div>
        </div>

        {/* Mirror B Slider */}
        <div className="bg-[#03140C] p-3 border border-emerald-900/60 space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-[#FBBF24] font-bold">Mirror B Angle (θ₂):</span>
            <span className="text-white font-black">{angleB}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="180"
            disabled={isSolved}
            value={angleB}
            onChange={(e) => handleAngleBChange(e.target.value)}
            className="w-full accent-[#10B981] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0°</span>
            <span>Target: {reqB}°</span>
            <span>180°</span>
          </div>
        </div>
      </div>

      {/* Engagement Action */}
      <div className="flex justify-between items-center pt-2">
        <div>
          {isSolved ? (
            <span className="flex items-center space-x-1.5 text-[#10B981] font-black text-xs font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>REFRACTION LOCKED & SENSOR ACTIVATED</span>
            </span>
          ) : (
            <span className="text-xs font-mono text-emerald-300">
              {isHittingTarget ? "⚡ Sensor target acquired!" : "Align both mirrors to complete beam"}
            </span>
          )}
        </div>

        <button
          onClick={handleEngageBeam}
          disabled={isSolved}
          className={`px-5 py-2.5 font-black uppercase text-xs border-[2px] border-[#03140C] shadow-[3px_3px_0px_#020C07] transition-all flex items-center space-x-2 ${
            isSolved
              ? 'bg-[#0A3020] text-emerald-300 cursor-default'
              : 'bg-[#FBBF24] text-[#02140D] hover:bg-[#F59E0B] active:translate-x-0.5'
          }`}
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>{isSolved ? 'Locked' : 'Engage Laser Beam'}</span>
        </button>
      </div>
    </div>
  );
}
