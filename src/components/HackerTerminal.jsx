import React, { useState, useEffect } from 'react';
import { Terminal, Play, CheckCircle2, AlertTriangle, RefreshCw, Code, ShieldCheck } from 'lucide-react';
import { heistAudio } from './HeistAudioEngine';

export default function HackerTerminal({ puzzle, onSolved, onFail, isSolved }) {
  const [code, setCode] = useState(puzzle?.initialCode || '');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'running', 'success', 'error'

  useEffect(() => {
    if (puzzle?.initialCode) {
      setCode(puzzle.initialCode);
      setOutput('Terminal initialized. Awaiting algorithm injection...');
      setStatus('idle');
    }
  }, [puzzle]);

  const handleRunCode = () => {
    heistAudio.playKeyClick();
    setStatus('running');
    setOutput('Executing in isolated sandbox...');

    setTimeout(() => {
      try {
        // Safe evaluation of the user's function
        // The function name is dynamically detected
        const userFunc = new Function(`${code}\nreturn typeof extractPayload !== 'undefined' ? extractPayload : typeof filterPrimeNodes !== 'undefined' ? filterPrimeNodes : typeof reverseToken !== 'undefined' ? reverseToken : null;`)();

        if (typeof userFunc !== 'function') {
          throw new Error('Target function not found. Ensure function definition matches signature.');
        }

        const inputParam = puzzle.testCase;
        const result = userFunc(Array.isArray(inputParam) ? [...inputParam] : inputParam);
        const expected = puzzle.expectedOutput;

        const isMatch = JSON.stringify(result) === JSON.stringify(expected);

        if (isMatch) {
          setStatus('success');
          setOutput(`[PASS] Test Case Passed!\nInput: ${JSON.stringify(inputParam)}\nResult: ${JSON.stringify(result)}\nStatus: 200 OK — Firewall bypassed!`);
          heistAudio.playSuccessChime();
          onSolved('hacker', puzzle.clueRevealed);
        } else {
          setStatus('error');
          setOutput(`[FAIL] Verification Failed.\nExpected: ${JSON.stringify(expected)}\nReceived: ${JSON.stringify(result)}\nSecurity system detected anomaly!`);
          heistAudio.playAlarmSiren();
          onFail('hacker', 'Incorrect code algorithm result.');
        }
      } catch (err) {
        setStatus('error');
        setOutput(`[SYNTAX ERROR] ${err.message}`);
        heistAudio.playAlarmSiren();
        onFail('hacker', `Runtime error: ${err.message}`);
      }
    }, 450);
  };

  const handleReset = () => {
    setCode(puzzle.initialCode);
    setOutput('Terminal reset to baseline code.');
    setStatus('idle');
    heistAudio.playKeyClick();
  };

  return (
    <div className="forest-card p-5 sm:p-6 space-y-4 font-mono text-sm border-[3px] border-[#03140C] bg-[#051811]/90 shadow-[6px_6px_0px_#020C07]">
      {/* Terminal Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b-2 border-[#03140C] pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#FF4D6D]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FBBF24]"></div>
          <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
          <span className="text-xs font-black uppercase text-[#34D399] tracking-wider ml-2 flex items-center space-x-1">
            <Terminal className="w-4 h-4 text-[#10B981]" />
            <span>THE HACKER COCKPIT — {puzzle.title}</span>
          </span>
        </div>
        <span className="text-[11px] font-bold text-[#FBBF24] bg-[#03140C] px-2 py-0.5 border border-[#10B981]/40">
          DISCIPLINE: {puzzle.discipline}
        </span>
      </div>

      {/* Mission Objective */}
      <div className="bg-[#03140C]/90 p-3 border border-emerald-500/30 text-xs">
        <p className="font-bold text-[#34D399]">🎯 Operational Objective:</p>
        <p className="text-emerald-100 mt-0.5">{puzzle.prompt}</p>
      </div>

      {/* Code Editor Area */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs text-emerald-400">
          <span>sandbox.js (JavaScript REPL)</span>
          <button 
            onClick={handleReset} 
            className="flex items-center space-x-1 hover:text-[#FBBF24] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Boilerplate</span>
          </button>
        </div>

        <textarea
          rows={7}
          value={code}
          disabled={isSolved}
          onChange={(e) => setCode(e.target.value)}
          className="w-full bg-[#020B06] border-2 border-[#03140C] p-3 text-[#34D399] font-mono text-xs sm:text-sm focus:border-[#10B981] outline-none rounded-none shadow-inner leading-relaxed resize-y"
          spellCheck="false"
        />
      </div>

      {/* Console Output Log */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-emerald-400">Terminal Telemetry:</span>
        <pre className={`p-3 text-xs rounded-none border border-[#03140C] font-mono overflow-x-auto min-h-[64px] whitespace-pre-wrap ${
          status === 'success' 
            ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500' 
            : status === 'error' 
            ? 'bg-rose-950/80 text-rose-200 border-rose-500' 
            : 'bg-[#031209] text-emerald-300'
        }`}>
          {output}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-2">
        <div className="text-xs">
          {isSolved ? (
            <span className="flex items-center space-x-1.5 text-[#10B981] font-black">
              <CheckCircle2 className="w-4 h-4" />
              <span>FIREWALL BYPASSED & PAYLOAD EXTRACTED</span>
            </span>
          ) : (
            <span className="text-slate-400 text-xs font-mono">Ready to inject payload</span>
          )}
        </div>

        <button
          onClick={handleRunCode}
          disabled={isSolved || status === 'running'}
          className={`px-5 py-2.5 font-black uppercase text-xs border-[2px] border-[#03140C] shadow-[3px_3px_0px_#020C07] transition-all flex items-center space-x-2 ${
            isSolved
              ? 'bg-[#0A3020] text-emerald-300 cursor-default'
              : 'bg-[#10B981] text-[#02140D] hover:bg-[#34D399] active:translate-x-0.5 active:translate-y-0.5'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{status === 'running' ? 'Compiling...' : isSolved ? 'Bypassed' : 'Run Algorithm'}</span>
        </button>
      </div>
    </div>
  );
}
