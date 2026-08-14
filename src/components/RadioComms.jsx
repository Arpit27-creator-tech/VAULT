import React, { useState, useEffect, useRef } from 'react';
import { Radio, Send } from 'lucide-react';
import { heistAudio } from './HeistAudioEngine';

export default function RadioComms({ messages, onSendMessage, activeRole }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    heistAudio.playRadioSquelch();
    onSendMessage(inputText.trim(), activeRole);
    setInputText('');
  };

  const handleQuickMacro = (text) => {
    heistAudio.playRadioSquelch();
    onSendMessage(text, activeRole);
  };

  return (
    <div className="bg-[#051C12] border border-emerald-800/40 rounded-xl p-4 space-y-3 shadow-md">
      <div className="flex justify-between items-center pb-2 border-b border-emerald-900/50">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-[#10B981]" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
            Squad Radio Stream
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#34D399] bg-[#020B06] px-2 py-0.5 rounded border border-emerald-900/50">
          Live Mesh
        </span>
      </div>

      <div className="h-40 overflow-y-auto space-y-2 bg-[#020B06] p-3 rounded-lg border border-emerald-950 font-mono text-[11px]">
        {messages.map((msg, i) => (
          <div key={i} className="leading-snug">
            <span className="text-slate-500 text-[10px] mr-1.5">[{msg.time}]</span>
            <span className={`font-semibold mr-1.5 ${
              msg.role === 'hacker' ? 'text-[#10B981]' :
              msg.role === 'engineer' ? 'text-[#FBBF24]' :
              msg.role === 'scientist' ? 'text-[#06B6D4]' :
              msg.role === 'cryptographer' ? 'text-[#C084FC]' : 'text-emerald-400'
            }`}>
              {msg.sender}:
            </span>
            <span className="text-slate-200">{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => handleQuickMacro("Transmitting clue to your cockpit now!")}
          className="bg-[#020B06] text-emerald-300 text-[10px] px-2 py-1 rounded border border-emerald-900/60 hover:bg-[#10B981] hover:text-[#02140D] transition-colors"
        >
          📢 Transmitting Clue
        </button>
        <button
          type="button"
          onClick={() => handleQuickMacro("Recalibrating, hold the lock!")}
          className="bg-[#020B06] text-emerald-300 text-[10px] px-2 py-1 rounded border border-emerald-900/60 hover:bg-[#10B981] hover:text-[#02140D] transition-colors"
        >
          ⏳ Recalibrating
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message as ${activeRole}...`}
          className="flex-1 bg-[#020B06] border border-emerald-900/60 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 text-xs focus:border-[#10B981] outline-none"
        />
        <button
          type="submit"
          className="bg-[#10B981] text-[#02140D] font-bold px-3.5 py-2 rounded-lg text-xs hover:bg-[#34D399] transition-colors flex items-center space-x-1"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
