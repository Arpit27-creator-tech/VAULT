import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Compass, Terminal, FlaskConical, Key, Sparkles, 
  CheckCircle2, RotateCcw, Lightbulb, ChevronRight, Check,
  AlertTriangle
} from 'lucide-react';
import { heistAudio } from './HeistAudioEngine';
import { generateRemediationPlan } from '../data/remediationData';

export default function RemediationRoadmapModal({
  isOpen,
  onClose,
  stageData,
  solvedRoles = {},
  alarmFails = 0,
  onRetryWithHints
}) {
  const [activeTab, setActiveTab] = useState('concepts'); // 'concepts' | 'pathway'
  const [drillAnswers, setDrillAnswers] = useState({});
  const [drillSubmitted, setDrillSubmitted] = useState({});
  const [masteredTopics, setMasteredTopics] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const plan = generateRemediationPlan(stageData, solvedRoles, alarmFails);

  const roleMeta = {
    hacker: { name: 'Hacker', icon: Terminal, color: '#10B981' },
    engineer: { name: 'Engineer', icon: Compass, color: '#FBBF24' },
    scientist: { name: 'Scientist', icon: FlaskConical, color: '#60A5FA' },
    cryptographer: { name: 'Cryptographer', icon: Key, color: '#C084FC' }
  };

  const handleSelectDrillOption = (topicId, optIdx) => {
    if (drillSubmitted[topicId]) return;
    setDrillAnswers(prev => ({ ...prev, [topicId]: optIdx }));
    heistAudio.playKeyClick();
  };

  const handleCheckDrill = (topicId, correctIdx) => {
    setDrillSubmitted(prev => ({ ...prev, [topicId]: true }));
    const isCorrect = drillAnswers[topicId] === correctIdx;
    if (isCorrect) {
      heistAudio.playSuccessChime();
      setMasteredTopics(prev => ({ ...prev, [topicId]: true }));
    } else {
      heistAudio.playErrorTone();
    }
  };

  const masteredCount = Object.values(masteredTopics).filter(Boolean).length;
  const totalTopics = plan.recommendedTopics.length || 1;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#051C12] border-2 border-[#134830] rounded-[28px] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-[8px_8px_0px_#020C07] overflow-hidden my-auto text-left">
        
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#134830]/80 bg-[#061D13]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#10B981] border-2 border-black flex items-center justify-center text-black font-black shadow-[2px_2px_0px_#000000]">
              <Compass className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-[#FBBF24]/20 text-[#FBBF24] border border-amber-500/40 text-[9px] font-mono font-black px-2 py-0.5 rounded-full uppercase">
                  Diagnostic Briefing
                </span>
                <span className="text-xs font-mono text-[#6EE7B7]">
                  {plan.estimatedStudyTime} Quick Review
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-game font-black uppercase text-white tracking-wide mt-0.5">
                {plan.stageTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {onRetryWithHints && (
              <button
                onClick={onRetryWithHints}
                className="bg-[#10B981] hover:bg-[#34D399] text-[#02140D] font-game font-black text-xs uppercase px-3.5 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center space-x-1.5 transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry (+60s Hints)</span>
              </button>
            )}

            <button 
              onClick={onClose}
              className="p-2 text-emerald-300 hover:text-white bg-[#0B3020] hover:bg-[#0E3D29] border border-[#134830] rounded-xl transition-all"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Diagnostic Snapshot Box */}
        <div className="p-4 sm:p-5 bg-[#03140C] border-b border-[#134830]/60 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-[#FBBF24] flex-shrink-0" />
              <p className="text-xs text-slate-200 font-mono">
                <strong className="text-[#FBBF24]">Diagnosis:</strong> {plan.diagnosticSummary}
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#34D399] bg-[#0A3020] px-2.5 py-1 rounded-lg border border-emerald-700/50 flex-shrink-0">
              Drills Cleared: {masteredCount} / {totalTopics}
            </span>
          </div>

          {/* 4 Roles Health Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['hacker', 'engineer', 'scientist', 'cryptographer'].map(roleKey => {
              const meta = roleMeta[roleKey];
              const Icon = meta.icon;
              const isFailed = plan.failedRoles.includes(roleKey);
              const isCleared = plan.passedRoles.includes(roleKey) || !isFailed;

              return (
                <div 
                  key={roleKey}
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    isFailed 
                      ? 'bg-red-950/40 border-red-500/50 text-red-200' 
                      : 'bg-[#062417] border-emerald-600/40 text-[#6EE7B7]'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: meta.color }} />
                    <span className="text-xs font-mono font-bold truncate">{meta.name}</span>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                    isFailed ? 'bg-red-900/60 text-red-300' : 'bg-emerald-900/60 text-emerald-300'
                  }`}>
                    {isFailed ? '⚠️ Gap' : '✓ Pass'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs (2 Simple Tabs) */}
        <div className="flex bg-[#04160E] p-1.5 gap-2 border-b border-[#134830]/80">
          <button
            onClick={() => {
              setActiveTab('concepts');
              heistAudio.playKeyClick();
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-game text-xs font-bold transition-all text-center flex items-center justify-center space-x-2 ${
              activeTab === 'concepts'
                ? 'bg-[#34D399] text-[#020C07] shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#072418]'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Key Concepts & Practice Drills ({plan.recommendedTopics.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('pathway');
              heistAudio.playKeyClick();
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-game text-xs font-bold transition-all text-center flex items-center justify-center space-x-2 ${
              activeTab === 'pathway'
                ? 'bg-[#34D399] text-[#020C07] shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#072418]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>4-Phase Learning Pathway</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: CONCEPTS & QUICK DRILLS */}
          {activeTab === 'concepts' && (
            <div className="space-y-4">
              {plan.recommendedTopics.map((topic, tIdx) => {
                const isMastered = !!masteredTopics[topic.id];
                const drill = topic.practiceDrill;
                const currentAnswer = drillAnswers[topic.id];
                const isSubmitted = !!drillSubmitted[topic.id];
                const isCorrect = currentAnswer === drill?.correct;

                return (
                  <div 
                    key={topic.id}
                    className="bg-[#041C12] border-2 border-[#134830] rounded-2xl p-4 sm:p-5 shadow-md space-y-3.5 hover:border-emerald-500/60 transition-all"
                  >
                    {/* Concept Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#134830]/80 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold text-[#FBBF24] uppercase">
                            Concept #{tIdx + 1} • {topic.roleName}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400/80">
                            • {topic.discipline}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-game font-bold text-white uppercase mt-0.5">
                          {topic.title}
                        </h3>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isMastered && (
                          <span className="bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40 font-mono text-xs font-bold px-2.5 py-1 rounded-xl flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mastered</span>
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-slate-400 bg-black/40 px-2 py-1 rounded-lg border border-[#134830]">
                          ⏱️ {topic.duration}
                        </span>
                      </div>
                    </div>

                    {/* Simple Analogy & Formula */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-[#020D08] p-3 rounded-xl border border-emerald-900/60 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-[#34D399] uppercase block">
                          💡 In Plain English
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed font-sans">
                          {topic.summary}
                        </p>
                      </div>

                      <div className="bg-[#020D08] p-3 rounded-xl border border-emerald-900/60 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-[#FBBF24] uppercase block">
                          📐 The Core Formula / Rule
                        </span>
                        <code className="text-xs font-mono font-bold text-[#34D399] block bg-black/50 p-1.5 rounded border border-emerald-950">
                          {topic.formula}
                        </code>
                        <p className="text-[11px] text-slate-400 font-mono mt-1">
                          {topic.keyTakeaway}
                        </p>
                      </div>
                    </div>

                    {/* Inline Quick Drill */}
                    {drill && (
                      <div className="bg-[#020B06] border border-[#134830] rounded-xl p-3.5 sm:p-4 space-y-3">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-[#FBBF24] font-bold flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Quick Practice Check:</span>
                          </span>
                          <span className="text-slate-400 text-[11px]">Instant 1-Click Verification</span>
                        </div>

                        <p className="text-xs sm:text-sm font-medium text-white font-sans">
                          {drill.question}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {drill.options.map((opt, optIdx) => {
                            const isSelected = currentAnswer === optIdx;
                            const isOptionCorrect = optIdx === drill.correct;

                            let btnStyle = "bg-[#061D13] text-slate-200 border-[#134830] hover:bg-[#0A2E1F] hover:border-emerald-500/50";
                            if (isSubmitted) {
                              if (isOptionCorrect) {
                                btnStyle = "bg-[#10B981] text-[#02140D] font-bold border-white shadow-[0_0_12px_#10B981]";
                              } else if (isSelected && !isOptionCorrect) {
                                btnStyle = "bg-red-950 text-red-200 border-red-700";
                              }
                            } else if (isSelected) {
                              btnStyle = "bg-[#FBBF24] text-[#02140D] font-bold border-amber-400";
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectDrillOption(topic.id, optIdx)}
                                disabled={isSubmitted}
                                className={`p-2.5 text-xs text-left rounded-xl border transition-all ${btnStyle}`}
                              >
                                <span className="font-mono font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Submit / Feedback */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1 border-t border-emerald-950">
                          {isSubmitted ? (
                            <div className="text-xs font-mono">
                              {isCorrect ? (
                                <span className="text-[#34D399] font-bold flex items-center space-x-1.5">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Correct! {drill.explanation}</span>
                                </span>
                              ) : (
                                <span className="text-[#FF4D6D] font-bold flex items-center space-x-1.5">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span>Incorrect. {drill.explanation}</span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleCheckDrill(topic.id, drill.correct)}
                              disabled={currentAnswer === undefined}
                              className="bg-[#34D399] hover:bg-[#2DD4BF] disabled:opacity-40 text-[#020C07] font-game font-bold text-xs uppercase px-4 py-1.5 rounded-xl border-2 border-black transition-all"
                            >
                              Check Answer
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: 4-PHASE PATHWAY */}
          {activeTab === 'pathway' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plan.milestones.map((m, idx) => (
                  <div 
                    key={m.step}
                    className={`p-4 rounded-2xl border-2 relative flex flex-col justify-between space-y-3 ${
                      idx === 0 
                        ? 'bg-[#0A2E1F] border-[#10B981] shadow-lg' 
                        : idx === 1
                        ? 'bg-[#062417] border-[#FBBF24]/60'
                        : 'bg-[#04160E] border-[#134830]'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#FBBF24] bg-black/50 px-2 py-0.5 rounded-md border border-amber-500/30">
                          Step 0{m.step}
                        </span>
                        {idx === 0 ? (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-[#34D399]" />
                        )}
                      </div>
                      <h4 className="text-sm font-game font-bold text-white uppercase">{m.title}</h4>
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">{m.desc}</p>
                    </div>

                    <button
                      onClick={() => {
                        if (idx === 1) setActiveTab('concepts');
                        if (idx === 2) setActiveTab('concepts');
                        if (idx === 3 && onRetryWithHints) onRetryWithHints();
                        heistAudio.playKeyClick();
                      }}
                      className="w-full bg-black/40 hover:bg-[#10B981] text-emerald-300 hover:text-black border border-[#134830] font-mono text-xs font-bold py-2 rounded-xl transition-all"
                    >
                      {idx === 0 ? "Diagnosed ✓" : idx === 1 ? "Review Concepts →" : idx === 2 ? "Solve Drills →" : "Launch Mission Retry →"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#061D13] border-t border-[#134830]/80 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            Status: <strong className="text-[#34D399]">{masteredCount === totalTopics ? "✨ All Drills Cleared!" : "Reviewing Key Formulas"}</strong>
          </span>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-[#134830] hover:bg-[#0B3020] text-xs font-mono text-[#6EE7B7] hover:text-white transition-all"
            >
              Close Briefing
            </button>

            {onRetryWithHints && (
              <button
                onClick={onRetryWithHints}
                className="flex-1 sm:flex-none bg-[#34D399] hover:bg-[#2DD4BF] text-[#020C07] font-game font-black text-xs uppercase px-5 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center space-x-1.5 transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Launch Retry</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
