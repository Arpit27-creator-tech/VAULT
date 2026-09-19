import React, { useState } from 'react';
import { X, Copy, Check, UserPlus, Zap, Eye, RotateCw, Share2, Shield, Trophy } from 'lucide-react';
import OperativeIdCard from './OperativeIdCard';
import { heistAudio } from './HeistAudioEngine';
import { friendAPI } from '../services/api';
import { toast } from 'sonner';

export default function OperativeCardModal({
  isOpen,
  onClose,
  operative,
  currentUser,
  currentLobbyCode,
  onInviteToLobby,
  onOpenCustomizer
}) {
  const [copiedId, setCopiedId] = useState(false);
  const [sentFriend, setSentFriend] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen || !operative) return null;

  const rawAgentId = operative?.agentId || (
    operative?.id 
      ? `VAULT-${operative.id.replace(/-/g, '').substring(0, 8).toUpperCase()}` 
      : 'VAULT-00000000'
  );

  const isMe = currentUser && (
    currentUser.id === operative.id ||
    (currentUser.agentId && currentUser.agentId.toLowerCase() === rawAgentId.toLowerCase()) ||
    (currentUser.callsign && currentUser.callsign.toLowerCase() === (operative.callsign || '').toLowerCase()) ||
    (currentUser.username && currentUser.username.toLowerCase() === (operative.username || '').toLowerCase())
  );

  const handleCopyAgentId = () => {
    navigator.clipboard?.writeText(rawAgentId);
    setCopiedId(true);
    heistAudio.playKeyClick();
    toast.success(`📋 Copied Agent ID: ${rawAgentId}`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSendFriendRequest = async () => {
    try {
      const res = await friendAPI.sendRequest(operative.callsign || rawAgentId);
      heistAudio.playSuccessChime();
      toast.success(res?.message || `🤝 Friend request sent to ${operative.callsign}!`);
      setSentFriend(true);
    } catch (err) {
      toast.error(err.message || 'Failed to send friend request');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative max-w-md w-full flex flex-col items-center">
        
        {/* Top Floating Control Bar */}
        <div className="w-full flex items-center justify-between mb-3 px-1 text-xs font-mono">
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
            <span className="font-bold uppercase tracking-wider text-orange-400">
              INMATE RECORD // CELL BLOCK 9
            </span>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-white/[0.08] hover:bg-[#FF4D6D]/30 border border-white/15 hover:border-[#FF4D6D]/50 rounded-xl transition-all"
            title="Close inspection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The Holographic ID Card */}
        <div className="flex justify-center w-full">
          <OperativeIdCard 
            operative={operative} 
            isFlipped={isFlipped}
            onFlip={setIsFlipped}
            interactive={true}
          />
        </div>

        {/* Bottom Inspection Actions */}
        <div className="mt-4 w-[340px] sm:w-[380px] bg-[#0d0703]/90 border border-orange-500/30 backdrop-blur-md rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-2xl">
          
          {/* Flip Card Action */}
          <button
            onClick={() => {
              heistAudio.playKeyClick();
              setIsFlipped(!isFlipped);
            }}
            className="flex-1 py-2 px-3 bg-black/40 hover:bg-white/10 text-slate-300 hover:text-white border border-white/15 rounded-xl font-mono text-xs flex items-center justify-center space-x-1.5 transition-all"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isFlipped ? 'Front View' : 'Flip to Dossier'}</span>
          </button>

          {/* Copy Agent ID */}
          <button
            onClick={handleCopyAgentId}
            className="py-2 px-3 bg-black/40 hover:bg-orange-500/20 text-amber-300 hover:text-white border border-amber-500/30 hover:border-orange-500/50 rounded-xl font-mono text-xs flex items-center space-x-1.5 transition-all"
            title="Copy Booking ID"
          >
            {copiedId ? <Check className="w-3.5 h-3.5 text-orange-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId ? 'Copied' : 'Booking ID'}</span>
          </button>

          {/* If inspecting myself: open customizer button */}
          {isMe && onOpenCustomizer && (
            <button
              onClick={() => {
                onClose();
                onOpenCustomizer();
              }}
              className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-400 text-black font-bold font-mono text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>🔒 Customize Inmate Pass</span>
            </button>
          )}

          {/* If inspecting someone else: Add friend or invite */}
          {!isMe && currentUser && (
            <div className="w-full flex items-center gap-2 pt-1">
              <button
                disabled={sentFriend}
                onClick={handleSendFriendRequest}
                className={`flex-1 py-2 px-3 font-mono font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 border shadow-sm ${
                  sentFriend 
                    ? 'bg-emerald-950/60 text-[#34D399] border-emerald-600/40 cursor-default' 
                    : 'bg-[#10B981] hover:bg-[#34D399] text-[#02140D] border-[#10B981]'
                }`}
              >
                {sentFriend ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Request Sent</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Friend</span>
                  </>
                )}
              </button>

              {currentLobbyCode && onInviteToLobby && (
                <button
                  onClick={() => {
                    onInviteToLobby(operative);
                    toast.success(`Invited ${operative.callsign} to active squad!`);
                  }}
                  className="py-2 px-3 bg-[#020B06] hover:bg-[#07281A] text-[#FBBF24] border border-amber-500/40 font-mono font-bold text-xs rounded-xl transition-all flex items-center space-x-1"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Squad</span>
                </button>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
