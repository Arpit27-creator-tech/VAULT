import React from 'react';
import { X } from 'lucide-react';
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
  if (!isOpen || !operative) return null;

  const rawAgentId = operative?.agentId || (
    operative?.id 
      ? `VLT-${operative.id.replace(/-/g, '').substring(0, 4).toUpperCase()}-${operative.id.replace(/-/g, '').substring(4, 7).toUpperCase()}` 
      : 'VLT-4827-9QX'
  );

  const isMe = currentUser && (
    currentUser.id === operative.id ||
    (currentUser.agentId && currentUser.agentId.toLowerCase() === rawAgentId.toLowerCase()) ||
    (currentUser.callsign && currentUser.callsign.toLowerCase() === (operative.callsign || '').toLowerCase()) ||
    (currentUser.username && currentUser.username.toLowerCase() === (operative.username || '').toLowerCase())
  );

  const handleInvite = async (op) => {
    if (currentLobbyCode && onInviteToLobby) {
      onInviteToLobby(op || operative);
      toast.success(`🎮 Squad invite dispatched to ${operative.callsign || 'operative'}!`);
      return;
    }
    try {
      const res = await friendAPI.sendRequest(operative.callsign || rawAgentId);
      heistAudio.playSuccessChime();
      toast.success(res?.message || `🤝 Friend request sent to ${operative.callsign}!`);
    } catch (err) {
      toast.error(err.message || 'Failed to send invite');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative max-w-4xl w-full flex flex-col items-center my-auto">
        
        {/* Floating Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-11 right-1 sm:right-2 p-2 text-emerald-300 hover:text-white bg-[#061D13] hover:bg-[#0B3020] border-2 border-[#134830] rounded-2xl transition-all shadow-[2px_2px_0px_#020C07] z-30"
          title="Close ID Card"
        >
          <X className="w-5 h-5" />
        </button>

        {/* The Exact Target Gamified ID Card */}
        <OperativeIdCard 
          operative={operative} 
          isMe={isMe}
          onClose={onClose}
          onInvite={handleInvite}
          onOpenCustomizer={onOpenCustomizer}
        />

      </div>
    </div>
  );
}
