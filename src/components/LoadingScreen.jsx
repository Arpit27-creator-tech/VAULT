import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

const MESSAGES = [
  'Establishing secure channel...',
  'Authenticating operative credentials...',
  'Syncing squad roster...',
  'Decrypting mission archive...'
];

export default function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % MESSAGES.length);
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020B06] overflow-hidden">
      {/* faint ambient glow, matching the app's forest/tactical palette */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(16,185,129,0.12), transparent 55%), radial-gradient(ellipse at 75% 80%, rgba(251,191,36,0.08), transparent 55%)'
        }}
      />

      {/* scanning horizontal line sweeping down, tactical radar feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute left-0 right-0 h-24"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(16,185,129,0.08), transparent)',
            animation: 'vault-scan 2.4s linear infinite'
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-5 px-6">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-[#10B981]/30 rounded-full" />
          <div
            className="absolute inset-0 border-2 border-transparent border-t-[#10B981] rounded-full"
            style={{ animation: 'vault-spin 1.1s linear infinite' }}
          />
          <div
            className="absolute inset-2 border border-transparent border-t-[#FBBF24]/70 rounded-full"
            style={{ animation: 'vault-spin-rev 1.6s linear infinite' }}
          />
          <ShieldAlert className="w-8 h-8 text-[#10B981]" />
        </div>

        <div className="text-center space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-[3px] text-[#FBBF24] font-mono">
            V.A.U.L.T
          </p>
          <p className="text-xs font-mono text-emerald-300/80 min-h-[16px] transition-opacity duration-300">
            {MESSAGES[msgIndex]}
          </p>
        </div>

        <div className="w-48 h-1 bg-[#03140C] border border-[#0d3824] overflow-hidden rounded-full">
          <div
            className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399]"
            style={{ animation: 'vault-loading-bar 1.8s ease-in-out infinite' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes vault-spin { to { transform: rotate(360deg); } }
        @keyframes vault-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes vault-scan { 0% { top: -20%; } 100% { top: 120%; } }
        @keyframes vault-loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
