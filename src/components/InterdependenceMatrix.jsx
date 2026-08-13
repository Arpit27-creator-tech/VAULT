import React from 'react';
import { ArrowRight, CheckCircle2, Lock, ShieldAlert, Sparkles, FlaskConical, Compass, Terminal, Key } from 'lucide-react';

export default function InterdependenceMatrix({ stageData, solvedRoles, roleClues }) {
  const allSteps = [
    {
      role: 'scientist',
      title: 'Scientist',
      icon: FlaskConical,
      color: '#06B6D4',
      label: 'Chemical Reagent',
      discipline: 'Chemistry / Biology'
    },
    {
      role: 'engineer',
      title: 'Engineer',
      icon: Compass,
      color: '#FBBF24',
      label: 'Laser Angle',
      discipline: 'Physics / Geometry'
    },
    {
      role: 'hacker',
      title: 'Hacker',
      icon: Terminal,
      color: '#10B981',
      label: 'Firewall Slice',
      discipline: 'Computer Science'
    },
    {
      role: 'cryptographer',
      title: 'Cryptographer',
      icon: Key,
      color: '#C084FC',
      label: 'VHF Cipher',
      discipline: 'Linguistics / Ciphers'
    }
  ];

  const steps = stageData?.selectedRoles 
    ? allSteps.filter(s => stageData.selectedRoles[s.role])
    : allSteps;

  return (
    <div className="forest-glass p-5 border-[3px] border-[#03140C] space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#FBBF24]" />
          <h3 className="font-mono text-xs sm:text-sm font-black uppercase text-[#F0FDF4] tracking-wider">
            THE INTERDEPENDENCE MATRIX — LIVE DATA PIPELINE
          </h3>
        </div>
        <span className="text-[11px] font-mono font-bold text-emerald-300 bg-[#03140C] px-2 py-0.5 border border-emerald-800">
          STAGE PROGRESS: {Object.keys(solvedRoles).length} / {steps.length} ROLES LOCKED
        </span>
      </div>

      {/* Role Pipeline Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(4, Math.max(1, steps.length))} gap-3`}>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = !!solvedRoles[step.role];
          const clue = roleClues[step.role];

          return (
            <div 
              key={step.role}
              className={`p-3.5 border-2 border-[#03140C] relative transition-all flex flex-col justify-between ${
                isDone 
                  ? 'bg-[#0A3020] shadow-[3px_3px_0px_#10B981]' 
                  : 'bg-[#031209]/80 shadow-[2px_2px_0px_#020C07]'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-1.5">
                    <Icon className="w-4 h-4" style={{ color: step.color }} />
                    <span className="font-mono text-xs font-black uppercase" style={{ color: step.color }}>
                      {step.title}
                    </span>
                  </div>
                  {isDone ? (
                    <span className="flex items-center space-x-1 text-[#10B981] font-mono text-[10px] font-black">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>TRANSMITTED</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-slate-500 font-mono text-[10px]">
                      <Lock className="w-3 h-3" />
                      <span>PENDING</span>
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-emerald-300 font-bold">{step.label}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{step.discipline}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#03140C] text-[10px] font-mono">
                {isDone && clue ? (
                  <span className="text-[#FBBF24] font-bold block truncate" title={clue}>
                    🔑 {clue}
                  </span>
                ) : (
                  <span className="text-slate-600 italic">Awaiting teammate solution...</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
