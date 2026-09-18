import React, { useState, useEffect } from 'react';
import { Terminal, Play, CheckCircle2, AlertTriangle, RefreshCw, Code, ShieldCheck, XCircle } from 'lucide-react';
import { heistAudio } from './HeistAudioEngine';

export default function HackerTerminal({ puzzle, onSolved, onFail, isSolved }) {
  const [code, setCode] = useState(puzzle?.initialCode || '');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('idle');
  const [caseResults, setCaseResults] = useState([]);

  // Normalize to a list of test cases regardless of which schema the
  // puzzle data uses — old single testCase/expectedOutput puzzles keep
  // working unchanged, new puzzles can supply a `testCases` array for
  // stricter, multi-case grading like a real coding judge.
  const testCases = Array.isArray(puzzle?.testCases) && puzzle.testCases.length > 0
    ? puzzle.testCases
    : [{ input: puzzle?.testCase, expected: puzzle?.expectedOutput }];

  const visibleCases = testCases.filter(tc => !tc.hidden);
  const hiddenCount = testCases.length - visibleCases.length;

  useEffect(() => {
    if (puzzle?.initialCode) {
      setCode(puzzle.initialCode);
      setOutput('Terminal initialized. Awaiting algorithm injection...');
      setStatus('idle');
      setCaseResults([]);
    }
  }, [puzzle]);

  const handleRunCode = () => {
    heistAudio.playKeyClick();
    setStatus('running');
    setOutput('Executing in isolated sandbox...');
    setCaseResults([]);

    setTimeout(() => {
      try {
        const userFunc = new Function(`${code}\nreturn typeof extractPayload !== 'undefined' ? extractPayload : typeof filterPrimeNodes !== 'undefined' ? filterPrimeNodes : typeof reverseToken !== 'undefined' ? reverseToken : null;`)();

        if (typeof userFunc !== 'function') {
          throw new Error('Target function not found. Ensure function definition matches signature.');
        }

        const results = testCases.map((tc, idx) => {
          const inputParam = tc.input;
          const result = userFunc(Array.isArray(inputParam) ? [...inputParam] : inputParam);
          const passed = JSON.stringify(result) === JSON.stringify(tc.expected);
          return { idx, input: inputParam, expected: tc.expected, result, passed, hidden: !!tc.hidden };
        });

        setCaseResults(results);
        const passedCount = results.filter(r => r.passed).length;
        const allPassed = passedCount === results.length;

        if (allPassed) {
          setStatus('success');
          setOutput(`[PASS] ${passedCount}/${results.length} test case${results.length === 1 ? '' : 's'} passed!\nStatus: 200 OK — Firewall bypassed!`);
          heistAudio.playSuccessChime();
          onSolved('hacker', puzzle.clueRevealed);
        } else {
          setStatus('error');
          const firstFail = results.find(r => !r.passed);
          const failDetail = firstFail.hidden
            ? 'A hidden test case failed.'
            : `Input: ${JSON.stringify(firstFail.input)} — Expected: ${JSON.stringify(firstFail.expected)}, Received: ${JSON.stringify(firstFail.result)}`;
          setOutput(`[FAIL] ${passedCount}/${results.length} test case${results.length === 1 ? '' : 's'} passed.\n${failDetail}\nSecurity system detected anomaly!`);
          heistAudio.playAlarmSiren();
          onFail('hacker', `${passedCount}/${results.length} test cases passed.`);
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
    setCaseResults([]);
    heistAudio.playKeyClick();
  };

  return (
    <div className="forest-card p-5 sm:p-6 space-y-4 font-mono text-sm border-[3px] border-[#03140C] bg-[#051811]/90 shadow-[6px_6px_0px_#020C07]">
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

      <div className="bg-[#03140C]/90 p-3 border border-emerald-500/30 text-xs">
        <p className="font-bold text-[#34D399]">🎯 Operational Objective:</p>
        <p className="text-emerald-100 mt-0.5">{puzzle.prompt}</p>
      </div>

      {/* Visible test case examples — like a coding judge's sample cases */}
      {visibleCases.length > 0 && (
        <div className="bg-[#020B06] p-3 border border-[#0d3824] text-xs space-y-1.5">
          <p className="font-bold text-[#10B981] flex items-center space-x-1.5">
            <Code className="w-3.5 h-3.5" />
            <span>Sample Test Case{visibleCases.length === 1 ? '' : 's'}</span>
          </p>
          {visibleCases.map((tc, i) => (
            <div key={i} className="text-emerald-300/80 font-mono text-[11px] pl-1 border-l-2 border-[#0d3824] ml-1">
              Input: <span className="text-emerald-100">{JSON.stringify(tc.input)}</span> → Expected: <span className="text-emerald-100">{JSON.stringify(tc.expected)}</span>
            </div>
          ))}
          {hiddenCount > 0 && (
            <p className="text-[10px] text-amber-400/70 pl-1">
              + {hiddenCount} hidden test case{hiddenCount === 1 ? '' : 's'} used for grading
            </p>
          )}
        </div>
      )}

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

      {/* Per-case pass/fail breakdown, shown once the code has been run */}
      {caseResults.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {caseResults.map(r => (
            <span
              key={r.idx}
              title={r.hidden ? 'Hidden case' : `Input: ${JSON.stringify(r.input)}`}
              className={`text-[10px] font-mono font-bold px-2 py-1 border flex items-center space-x-1 ${
                r.passed
                  ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-600 text-rose-300'
              }`}
            >
              {r.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              <span>Case {r.idx + 1}{r.hidden ? ' (hidden)' : ''}</span>
            </span>
          ))}
        </div>
      )}

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

      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center space-x-3 text-xs">
          {isSolved ? (
            <>
              <span className="flex items-center space-x-1.5 text-[#10B981] font-black">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>FIREWALL BYPASSED</span>
              </span>
              <span className="inline-flex items-center space-x-1 bg-[#FBBF24]/20 border border-[#FBBF24] text-[#FBBF24] font-game font-black text-xs px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.3)] animate-pulse">
                <Sparkles className="w-3 h-3 text-[#FBBF24]" />
                <span>+400 XP GAINED</span>
              </span>
            </>
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
