import React from 'react';
import { ArrowRight, CheckCircle2, Lock, Sparkles, FlaskConical, Compass, Terminal, Key } from 'lucide-react';

export default function InterdependenceMatrix({ stageData, solvedRoles, roleClues }) {
  const allSteps = [
    { role: 'hacker', title: 'Hacker', icon: Terminal, color: '#10B981', label: 'Pointer Offset', discipline: 'CS' },
    { role: 'engineer', title: 'Engineer', icon: Compass, color: '#FBBF24', label: 'Laser Angle', discipline: 'Physics' },
    { role: 'scientist', title: 'Scientist', icon: FlaskConical, color: '#06B6D4', label: 'Buffer pH', discipline: 'Chemistry' },
    { role: 'cryptographer', title: 'Cryptographer', icon: Key, color: '#C084FC', label: 'VHF Cipher', discipline: 'Math' }
  ];

  const steps = stageData?.selectedRoles 
    ? allSteps.filter(s => stageData.selectedRoles[s.role])
    : allSteps;

  const solvedCount = Object.keys(solvedRoles).length;

  return (
    <div className="bg-[#051C12] border border-emerald-800/40 rounded-xl p-3 sm:p-4 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#FBBF24]" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Team Clue Pipeline
          </span>
        </div>
        <span className="text-xs font-mono font-semibold text-emerald-300 bg-[#020B06] px-2.5 py-0.5 rounded border border-emerald-900/60 self-start sm:self-auto">
          {solvedCount} of {steps.length} Roles Locked
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = !!solvedRoles[step.role];
          const clue = roleClues[step.role];

          return (
            <div 
              key={step.role}
              className={`p-2.5 rounded-lg border transition-all ${
                isDone 
                  ? 'bg-[#0A2E1E] border-[#10B981]/50 text-white' 
                  : 'bg-[#03140C]/80 border-emerald-950 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: step.color }} />
                  <span className="text-xs font-semibold truncate" style={{ color: step.color }}>
                    {step.title}
                  </span>
                </div>
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                ) : (
                  <Lock className="w-3 h-3 text-slate-600 flex-shrink-0" />
                )}
              </div>
              <div className="text-[11px] font-mono truncate">
                {isDone && clue ? (
                  <span className="text-[#34D399] font-bold">Clue: {clue}</span>
                ) : (
                  <span className="text-slate-400">{step.label}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
