import React, { useState, useEffect, useRef } from 'react';
import { Radio, Send, Mic, Volume2, Sparkles, MessageSquare } from 'lucide-react';
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
    <div className="forest-card p-4 space-y-3 font-mono text-xs border-[3px] border-[#03140C] bg-[#051811]/90 shadow-[4px_4px_0px_#020C07]">
      <div className="flex justify-between items-center border-b border-[#03140C] pb-2">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-[#10B981] animate-pulse" />
          <span className="font-black uppercase text-[#F0FDF4] tracking-wider text-[11px]">
            SQUAD WALKIE-TALKIE (VHF CH-04)
          </span>
        </div>
        <span className="text-[10px] text-[#FBBF24] bg-[#03140C] px-2 py-0.5 border border-emerald-800">
          ENCRYPTED MESH
        </span>
      </div>

      {/* Message Feed */}
      <div className="h-44 overflow-y-auto space-y-2 bg-[#020B06] p-3 border border-[#03140C] font-mono text-[11px] rounded-none">
        {messages.map((msg, i) => (
          <div key={i} className="leading-snug">
            <span className="text-slate-500 font-mono text-[10px] mr-1.5">[{msg.time}]</span>
            <span className={`font-black uppercase mr-1.5 ${
              msg.role === 'hacker' ? 'text-[#10B981]' :
              msg.role === 'engineer' ? 'text-[#FBBF24]' :
              msg.role === 'scientist' ? 'text-[#06B6D4]' :
              msg.role === 'cryptographer' ? 'text-[#C084FC]' : 'text-emerald-400'
            }`}>
              {msg.sender}:
            </span>
            <span className="text-emerald-100">{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Comms Macros */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => handleQuickMacro("Transmitting clue to your cockpit now!")}
          className="bg-[#03140C] text-emerald-300 text-[10px] px-2 py-1 border border-emerald-800 hover:bg-[#10B981] hover:text-[#02140D] transition-colors"
        >
          📢 Transmitting Clue
        </button>
        <button
          type="button"
          onClick={() => handleQuickMacro("Checking my calculations, hold the lock!")}
          className="bg-[#03140C] text-emerald-300 text-[10px] px-2 py-1 border border-emerald-800 hover:bg-[#10B981] hover:text-[#02140D] transition-colors"
        >
          ⏳ Recalibrating
        </button>
        <button
          type="button"
          onClick={() => handleQuickMacro("Target frequency locked on receiver!")}
          className="bg-[#03140C] text-emerald-300 text-[10px] px-2 py-1 border border-emerald-800 hover:bg-[#10B981] hover:text-[#02140D] transition-colors"
        >
          📡 Signal Locked
        </button>
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Radio message as ${activeRole.toUpperCase()}...`}
          className="flex-1 bg-[#020B06] border border-[#03140C] px-3 py-2 text-emerald-300 placeholder-slate-600 text-xs focus:border-[#10B981] outline-none"
        />
        <button
          type="submit"
          className="bg-[#10B981] text-[#02140D] font-black px-4 py-2 text-xs border border-[#03140C] hover:bg-[#34D399] flex items-center space-x-1"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Radio</span>
        </button>
      </form>
    </div>
  );
}
