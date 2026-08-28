import React, { useState, useEffect } from 'react';
import { Search, Users, Copy, Check, X, Zap, Radio, Shield, Sparkles, UserPlus } from 'lucide-react';
import { userAPI, friendAPI } from '../services/api';
import { heistAudio } from './HeistAudioEngine';
import { toast } from 'sonner';

export default function OperativeDirectoryModal({ 
  isOpen, 
  onClose, 
  currentUser,
  currentLobbyCode,
  onInviteToLobby 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [operatives, setOperatives] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [sentFriendIds, setSentFriendIds] = useState(new Set());

  // Only registered accounts get a unique Agent ID
  const myAgentId = currentUser?.agentId || (
    currentUser?.id 
      ? `VAULT-${currentUser.id.replace(/-/g, '').substring(0, 8).toUpperCase()}`
      : null
  );

  useEffect(() => {
    if (!isOpen) return;

    const fetchOperatives = async () => {
      setIsLoading(true);
      try {
        const res = await userAPI.search(searchQuery);
        if (res?.users) {
          setOperatives(res.users);
        } else {
          setOperatives([]);
        }
      } catch (err) {
        console.error('[FIND AGENT] Error searching operatives:', err);
        setOperatives([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchOperatives, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  const handleCopyAgentId = (id) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      heistAudio.playKeyClick();
      toast.success(`📋 Copied Agent ID: ${id}`);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleSendFriendRequest = async (op) => {
    try {
      const res = await friendAPI.sendRequest(op.callsign || op.agentId);
      heistAudio.playSuccessChime();
      toast.success(res?.message || `🤝 Friend request sent to ${op.callsign}!`);
      setSentFriendIds(prev => new Set([...prev, op.agentId || op.id]));
    } catch (err) {
      toast.error(err.message || 'Failed to send request');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="bg-[#041a12]/75 backdrop-blur-2xl border border-emerald-500/30 rounded-[28px] sm:rounded-[32px] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(16,185,129,0.15)] overflow-hidden transition-all">
        
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-emerald-500/20 bg-gradient-to-b from-white/[0.04] to-transparent">
          <div className="flex items-center space-x-3">
            <div className="bg-[#10B981]/20 text-[#34D399] p-2.5 rounded-2xl border border-[#10B981]/40 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black uppercase text-white font-mono tracking-wider">
                  FIND AGENT
                </h2>
                <span className="bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/40 text-[9px] font-mono font-black px-2 py-0.5 rounded-full uppercase">
                  Radar
                </span>
              </div>
              <p className="text-xs text-emerald-200/70 mt-0.5">
                Search syndicate operatives by Unique Agent ID or Callsign
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-white/[0.05] hover:bg-[#FF4D6D]/30 border border-white/10 hover:border-[#FF4D6D]/50 rounded-2xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* My ID Pill (if registered) */}
        {myAgentId && (
          <div className="bg-emerald-950/40 border-b border-emerald-500/20 px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-emerald-300/80 font-bold">Your Agent ID:</span>
              <span className="bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40 font-black px-2.5 py-0.5 rounded-xl font-mono">
                {myAgentId}
              </span>
            </div>
            <button
              onClick={() => handleCopyAgentId(myAgentId)}
              className="text-xs font-mono font-bold text-[#FBBF24] hover:text-white flex items-center space-x-1.5 transition-colors bg-black/30 px-3 py-1 rounded-xl border border-amber-500/30 hover:border-amber-400"
            >
              {copiedId === myAgentId ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === myAgentId ? 'Copied!' : 'Copy My ID'}</span>
            </button>
          </div>
        )}

        {/* Rounded Transparent Search Input */}
        <div className="p-5 sm:p-6 py-4 border-b border-emerald-500/15">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10B981]" />
            <input 
              type="text"
              autoFocus
              placeholder="Search by Agent ID (e.g. VAULT-C1F01A1F) or Callsign..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-20 py-3 bg-[#020d08]/60 backdrop-blur-md border border-emerald-500/30 focus:border-[#10B981] text-[#F0FDF4] placeholder-slate-400 font-mono text-xs sm:text-sm outline-none transition-all rounded-2xl shadow-inner focus:ring-2 focus:ring-[#10B981]/20"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-white/[0.08] hover:bg-white/[0.15] px-2.5 py-1 rounded-xl transition-colors font-mono"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Operatives List */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-2.5 bg-black/20">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs animate-pulse flex items-center justify-center space-x-2.5">
              <Radio className="w-4 h-4 text-[#10B981] animate-spin" />
              <span>Scanning syndicate database...</span>
            </div>
          ) : operatives.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-slate-500 flex items-center justify-center mx-auto">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-amber-300 font-bold">
                {searchQuery ? `No operatives found matching "${searchQuery}"` : 'No operatives registered yet'}
              </p>
              <p className="text-slate-500 text-[11px]">
                Enter an exact Agent ID (e.g. VAULT-C1F01A1F) or Callsign to locate operative
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {operatives.map((op) => {
                const opTag = op.agentId || `VAULT-${op.id.substring(0, 8).toUpperCase()}`;
                const isMe = currentUser && (
                  currentUser.id === op.id || 
                  (currentUser.agentId && currentUser.agentId.toLowerCase() === opTag.toLowerCase()) ||
                  (currentUser.callsign && currentUser.callsign.toLowerCase() === (op.callsign || '').toLowerCase()) ||
                  (currentUser.username && currentUser.username.toLowerCase() === (op.username || '').toLowerCase())
                );
                const hasSent = sentFriendIds.has(opTag) || sentFriendIds.has(op.id);

                return (
                  <div 
                    key={op.id || op.agentId}
                    className="bg-[#020d08]/50 hover:bg-[#031c12]/60 backdrop-blur-md border border-emerald-500/25 hover:border-[#10B981]/60 p-3.5 sm:p-4 rounded-2xl transition-all flex items-center justify-between gap-3 shadow-md hover:shadow-emerald-950/50 group"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={op.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"}
                          alt={op.callsign || op.username}
                          className="w-11 h-11 rounded-2xl object-cover border border-emerald-500/40 group-hover:border-[#10B981] transition-colors"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#020B06] bg-[#10B981]" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 truncate">
                          <span className="font-mono font-bold text-sm text-white truncate group-hover:text-[#10B981] transition-colors">
                            {op.callsign || op.username}
                          </span>
                          <span className="bg-[#10B981]/20 text-[#34D399] font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#10B981]/30">
                            LVL {op.level || 1}
                          </span>
                          {isMe && (
                            <span className="bg-[#FBBF24]/20 text-[#FBBF24] font-mono text-[9px] font-bold px-1.5 py-0.2 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="font-mono text-xs font-black text-[#FBBF24] bg-black/40 px-2 py-0.5 rounded-lg border border-amber-500/20">
                            {opTag}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono truncate">• {op.role || 'Specialist'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleCopyAgentId(opTag)}
                        className="bg-black/40 hover:bg-[#10B981]/20 text-slate-300 hover:text-white border border-emerald-500/30 hover:border-[#10B981]/60 font-mono text-xs px-2.5 py-1.5 rounded-xl transition-all flex items-center space-x-1"
                        title="Copy Agent ID"
                      >
                        {copiedId === opTag ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#10B981]" />
                            <span className="text-[#10B981] font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy ID</span>
                          </>
                        )}
                      </button>

                      {/* Add Friend Button */}
                      {!isMe && currentUser && (
                        <button
                          disabled={hasSent}
                          onClick={() => handleSendFriendRequest(op)}
                          className={`font-mono font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 border shadow-sm ${
                            hasSent 
                              ? 'bg-emerald-950/60 text-[#34D399] border-emerald-600/40 cursor-default' 
                              : 'bg-[#10B981] hover:bg-[#34D399] text-[#02140D] border-[#10B981]'
                          }`}
                          title={hasSent ? "Request already dispatched" : "Send persistent friend request"}
                        >
                          {hasSent ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Sent</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Add Friend</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Squad Room Invite Button (if in a lobby) */}
                      {currentLobbyCode && onInviteToLobby && !isMe && (
                        <button
                          onClick={() => {
                            onInviteToLobby(op);
                            toast.success(`Invited ${op.callsign} to squad room!`);
                          }}
                          className="bg-[#020B06] hover:bg-[#07281A] text-[#FBBF24] border border-amber-500/40 font-mono font-bold text-xs px-2.5 py-1.5 rounded-xl transition-all flex items-center space-x-1"
                          title="Invite to active match lobby"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>Squad</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 px-6 border-t border-emerald-500/20 bg-gradient-to-t from-white/[0.04] to-transparent flex items-center justify-between text-xs font-mono text-emerald-200/60">
          <span>{operatives.length} operatives indexed</span>
          <button 
            onClick={onClose}
            className="bg-[#10B981] text-[#02140D] font-bold px-5 py-1.5 rounded-xl hover:bg-[#34D399] text-xs font-mono transition-all shadow-md"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
