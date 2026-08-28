// ============================================================
// V.A.U.L.T — Socket.io Client Service
// Singleton Socket.io connection with event handlers
// ============================================================

import { io } from 'socket.io-client';
import { authAPI } from './api.js';

// Resolve socket URL dynamically (local dev vs production)
const getDefaultSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5001';
    }
    return window.location.origin;
  }
  return 'http://localhost:5001';
};

const SOCKET_URL = getDefaultSocketUrl();

let socket = null;
let eventHandlers = {};

// ─────────────────────────────────────────────────────────────
// Connection Management
// ─────────────────────────────────────────────────────────────

/**
 * Connect to the Socket.io server with JWT auth or Guest profile.
 * @param {object} [overrideAuth]
 * @returns {import('socket.io-client').Socket} the socket instance
 */
export function connectSocket(overrideAuth = {}) {
  if (socket?.connected) {
    return socket;
  }

  const token = authAPI.getToken();
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem('vault_current_user') || 'null');
  } catch (e) {
    currentUser = null;
  }

  let guestId = localStorage.getItem('vault_guest_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('vault_guest_id', guestId);
  }

  let guestName = localStorage.getItem('vault_guest_name');
  if (!guestName) {
    guestName = `Ranger_${Math.floor(100 + Math.random() * 900)}`;
    localStorage.setItem('vault_guest_name', guestName);
  }

  const authPayload = {
    token: token || undefined,
    userId: currentUser?.id || overrideAuth.userId || guestId,
    username: currentUser?.username || currentUser?.callsign || overrideAuth.username || guestName,
    ...overrideAuth
  };

  socket = io(SOCKET_URL, {
    auth: authPayload,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1500,
    timeout: 10000
  });

  // ─── Connection Events ──────────────────────────────────
  socket.on('connect', () => {
    console.log(`[SOCKET] Connected to V.A.U.L.T server (ID: ${socket.id})`);
    triggerHandler('connected', { socketId: socket.id });
  });

  socket.on('disconnect', (reason) => {
    console.log('[SOCKET] Disconnected:', reason);
    triggerHandler('disconnected', { reason });
  });

  socket.on('connect_error', (err) => {
    console.error('[SOCKET] Connection error:', err.message);
    triggerHandler('error', { message: err.message });
  });

  // ─── Lobby Events ──────────────────────────────────────
  socket.on('lobby:state', (data) => triggerHandler('lobbyState', data));
  socket.on('lobby:player-joined', (data) => triggerHandler('lobbyPlayerJoined', data));
  socket.on('lobby:player-left', (data) => triggerHandler('lobbyPlayerLeft', data));
  socket.on('lobby:player-ready', (data) => triggerHandler('lobbyPlayerReady', data));
  socket.on('lobby:role-changed', (data) => triggerHandler('lobbyRoleChanged', data));
  socket.on('lobby:host-changed', (data) => triggerHandler('lobbyHostChanged', data));
  socket.on('lobby:kicked', (data) => triggerHandler('lobbyKicked', data));
  socket.on('lobby:starting', (data) => triggerHandler('lobbyStarting', data));
  socket.on('lobby:voice-update', (data) => triggerHandler('lobbyVoiceUpdate', data));
  socket.on('lobby:error', (data) => triggerHandler('lobbyError', data));

  // ─── Heist Events ──────────────────────────────────────
  socket.on('heist:started', (data) => triggerHandler('heistStarted', data));
  socket.on('heist:state', (data) => triggerHandler('heistState', data));
  socket.on('heist:stage-synced', (data) => triggerHandler('heistStageSynced', data));
  socket.on('heist:timer-tick', (data) => triggerHandler('heistTimerTick', data));
  socket.on('heist:alarm-update', (data) => triggerHandler('heistAlarmUpdate', data));
  socket.on('heist:puzzle-solved', (data) => triggerHandler('heistPuzzleSolved', data));
  socket.on('heist:puzzle-failed', (data) => triggerHandler('heistPuzzleFailed', data));
  socket.on('heist:radio-message', (data) => triggerHandler('heistRadioMessage', data));
  socket.on('heist:stage-complete', (data) => triggerHandler('heistStageComplete', data));
  socket.on('heist:timeout', (data) => triggerHandler('heistTimeout', data));
  socket.on('heist:aborted', (data) => triggerHandler('heistAborted', data));
  socket.on('heist:concluded', (data) => triggerHandler('heistConcluded', data));

  // ─── Presence Events ───────────────────────────────────
  socket.on('presence:friend-update', (data) => triggerHandler('presenceFriendUpdate', data));

  return socket;
}

/**
 * Disconnect from the Socket.io server.
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Get the current socket instance (may be null).
 */
export function getSocket() {
  return socket;
}

// ─────────────────────────────────────────────────────────────
// Event Handler Registry
// ─────────────────────────────────────────────────────────────

/**
 * Register an event handler callback.
 * @param {string} event - Event name (e.g., 'lobbyState', 'heistTimerTick')
 * @param {Function} handler - Callback function
 */
export function onSocketEvent(event, handler) {
  if (!eventHandlers[event]) {
    eventHandlers[event] = [];
  }
  eventHandlers[event].push(handler);
}

/**
 * Remove an event handler callback.
 */
export function offSocketEvent(event, handler) {
  if (eventHandlers[event]) {
    eventHandlers[event] = eventHandlers[event].filter(h => h !== handler);
  }
}

/**
 * Remove all handlers for an event (or all events).
 */
export function clearSocketHandlers(event) {
  if (event) {
    delete eventHandlers[event];
  } else {
    eventHandlers = {};
  }
}

function triggerHandler(event, data) {
  if (eventHandlers[event]) {
    eventHandlers[event].forEach(handler => {
      try {
        handler(data);
      } catch (err) {
        console.error(`[SOCKET] Handler error for ${event}:`, err);
      }
    });
  }
}

// ─────────────────────────────────────────────────────────────
// Lobby Emitters
// ─────────────────────────────────────────────────────────────
export const lobbySocket = {
  create(heistId, roomCode, missionTitle, role, characterId, callback) {
    socket?.emit('lobby:create', { heistId, roomCode, missionTitle, role, characterId }, callback);
  },

  join(roomCode, role, characterId, playerName, callback) {
    socket?.emit('lobby:join', { roomCode, role, characterId, playerName }, callback);
  },

  get(roomCode, callback) {
    socket?.emit('lobby:get', { roomCode }, callback);
  },

  setReady(roomCode, isReady) {
    socket?.emit('lobby:ready', { roomCode, isReady });
  },

  selectRole(roomCode, role) {
    socket?.emit('lobby:select-role', { roomCode, role });
  },

  kick(roomCode, targetSlotId) {
    socket?.emit('lobby:kick', { roomCode, targetSlotId });
  },

  start(roomCode, callback) {
    socket?.emit('lobby:start', { roomCode }, callback);
  },

  updateVoiceState(roomCode, connected, muted, deafened) {
    socket?.emit('lobby:voice-state', { roomCode, connected, muted, deafened });
  },

  sendRadioMessage(roomCode, text, role) {
    socket?.emit('lobby:radio-message', { roomCode, text, role });
  },

  leave(roomCode) {
    socket?.emit('lobby:leave', { roomCode });
  }
};

// ─────────────────────────────────────────────────────────────
// Heist Emitters
// ─────────────────────────────────────────────────────────────
export const heistSocket = {
  start(roomCode, stageIdx, timeLimit, puzzles, selectedRoles, callback) {
    socket?.emit('heist:start', { roomCode, stageIdx, timeLimit, puzzles, selectedRoles }, callback);
  },

  joinRoom(roomCode) {
    socket?.emit('heist:join-room', { roomCode });
  },

  submitAnswer(roomCode, role, answer, expected, puzzleType, clue, reason, solvedBy, callback) {
    socket?.emit('heist:submit-answer', { roomCode, role, answer, expected, puzzleType, clue, reason, solvedBy }, callback);
  },

  puzzleSolved(roomCode, role, clue, solvedBy) {
    socket?.emit('heist:puzzle-solved', { roomCode, role, clue, solvedBy });
  },

  puzzleFailed(roomCode, role, reason, failedBy) {
    socket?.emit('heist:puzzle-failed', { roomCode, role, reason, failedBy });
  },

  sendRadioMessage(roomCode, text, role, sender) {
    socket?.emit('heist:radio-message', { roomCode, text, role, sender });
  },

  syncStage(roomCode, stageIdx, timeLimit, selectedRoles) {
    socket?.emit('heist:sync-stage', { roomCode, stageIdx, timeLimit, selectedRoles });
  },

  abort(roomCode) {
    socket?.emit('heist:abort', { roomCode });
  },

  conclude(roomCode) {
    socket?.emit('heist:conclude', { roomCode });
  }
};

// ─────────────────────────────────────────────────────────────
// Presence Emitters
// ─────────────────────────────────────────────────────────────
export const presenceSocket = {
  updateStatus(status, activity) {
    socket?.emit('presence:update', { status, activity });
  },

  getFriends(callback) {
    socket?.emit('presence:get-friends', {}, callback);
  }
};
