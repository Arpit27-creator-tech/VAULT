import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

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

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative max-w-4xl w-full flex flex-col items-center my-auto pt-10 pb-6">
        
        {/* Floating Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-0 right-1 sm:right-2 p-2 text-emerald-300 hover:text-white bg-[#061D13] hover:bg-[#0B3020] border-2 border-[#134830] rounded-2xl transition-all shadow-[2px_2px_0px_#020C07] z-30 flex items-center space-x-1.5 px-3 py-1.5 font-mono text-xs font-bold"
          title="Close ID Card"
        >
          <X className="w-4 h-4" />
          <span>Close</span>
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

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
