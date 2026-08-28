// ============================================================
// V.A.U.L.T — Lobby Manager (Socket.io Events)
// Handles lobby creation, joining, ready states, role selection
// ============================================================

import { query } from '../db/index.js';

// In-memory lobby state (backed by DB for persistence)
const activeLobbies = new Map();

/**
 * Setup lobby-related socket events.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
export function setupLobbyManager(io, socket) {

  // ─────────────────────────────────────────────────────────
  // lobby:create — Host creates a new lobby room
  // ─────────────────────────────────────────────────────────
  socket.on('lobby:create', async (data, callback) => {
    try {
      const { heistId, roomCode } = data;

      if (!heistId || !roomCode) {
        return callback?.({ error: 'heistId and roomCode are required' });
      }

      const lobbyRoom = `lobby:${roomCode}`;

      // Initialize in-memory lobby state
      activeLobbies.set(roomCode, {
        heistId,
        roomCode,
        hostId: socket.userId,
        players: [{
          userId: socket.userId,
          username: socket.username,
          socketId: socket.id,
          slotId: 1,
          role: 'hacker',
          isHost: true,
          isReady: true,
          voiceState: { connected: true, muted: false, deafened: false }
        }],
        status: 'waiting',
        createdAt: Date.now()
      });

      // Join the Socket.io room
      socket.join(lobbyRoom);

      console.log(`[LOBBY] ${socket.username} created lobby ${roomCode}`);

      callback?.({
        success: true,
        lobby: activeLobbies.get(roomCode)
      });

      // Broadcast lobby state
      io.to(lobbyRoom).emit('lobby:state', activeLobbies.get(roomCode));

    } catch (err) {
      console.error('[LOBBY] Create error:', err);
      callback?.({ error: 'Failed to create lobby' });
    }
  });

  // ─────────────────────────────────────────────────────────
  // lobby:join — Player joins an existing lobby by room code
  // ─────────────────────────────────────────────────────────
  socket.on('lobby:join', async (data, callback) => {
    try {
      const { roomCode, role } = data;

      const lobby = activeLobbies.get(roomCode);
      if (!lobby) {
        return callback?.({ error: 'Lobby not found or has expired' });
      }

      if (lobby.players.length >= 4) {
        return callback?.({ error: 'Lobby is full (4/4 players)' });
      }

      if (lobby.players.find(p => p.userId === socket.userId)) {
        return callback?.({ error: 'You are already in this lobby' });
      }

      const takenSlots = lobby.players.map(p => p.slotId);
      const nextSlot = [1, 2, 3, 4].find(s => !takenSlots.includes(s));

      const player = {
        userId: socket.userId,
        username: socket.username,
        socketId: socket.id,
        slotId: nextSlot,
        role: role || 'hacker',
        isHost: false,
        isReady: false,
        voiceState: { connected: true, muted: false, deafened: false }
      };

      lobby.players.push(player);

      const lobbyRoom = `lobby:${roomCode}`;
      socket.join(lobbyRoom);

      console.log(`[LOBBY] ${socket.username} joined lobby ${roomCode} (slot ${nextSlot})`);

      callback?.({ success: true, slotId: nextSlot });

      // Broadcast updated lobby to all members
      io.to(lobbyRoom).emit('lobby:state', lobby);
      io.to(lobbyRoom).emit('lobby:player-joined', {
        username: socket.username,
        slotId: nextSlot,
        role: player.role
      });

    } catch (err) {
      console.error('[LOBBY] Join error:', err);
      callback?.({ error: 'Failed to join lobby' });
    }
  });

  // ─────────────────────────────────────────────────────────
  // lobby:ready — Player toggles ready state
  // ─────────────────────────────────────────────────────────
  socket.on('lobby:ready', (data) => {
    const { roomCode, isReady } = data;
    const lobby = activeLobbies.get(roomCode);
    if (!lobby) return;

    const player = lobby.players.find(p => p.userId === socket.userId);
    if (!player) return;

    player.isReady = isReady;

    const lobbyRoom = `lobby:${roomCode}`;
    io.to(lobbyRoom).emit('lobby:state', lobby);
    io.to(lobbyRoom).emit('lobby:player-ready', {
      username: socket.username,
      slotId: player.slotId,
      isReady
    });
  });

  // ─────────────────────────────────────────────────────────
  // lobby:select-role — Player picks a heist role
  // ─────────────────────────────────────────────────────────
  socket.on('lobby:select-role', (data) => {
    const { roomCode, role } = data;
    const lobby = activeLobbies.get(roomCode);
    if (!lobby) return;

    const player = lobby.players.find(p => p.userId === socket.userId);
    if (!player) return;

    // Check if role is already taken by another player
    const roleTaken = lobby.players.find(p => p.role === role && p.userId !== socket.userId);
    if (roleTaken) {
      socket.emit('lobby:error', { message: `Role "${role}" is already taken by ${roleTaken.username}` });
      return;
    }

    player.role = role;

    const lobbyRoom = `lobby:${roomCode}`;
    io.to(lobbyRoom).emit('lobby:state', lobby);
    io.to(lobbyRoom).emit('lobby:role-changed', {
      username: socket.username,
      slotId: player.slotId,
      role
    });
  });

  // ─────────────────────────────────────────────────────────
  // lobby:kick — Host kicks a player
  // ─────────────────────────────────────────────────────────
  socket.on('lobby:kick', (data) => {
    const { roomCode, targetSlotId } = data;
    const lobby = activeLobbies.get(roomCode);
    if (!lobby) return;

    // Only host can kick
    if (lobby.hostId !== socket.userId) {
      socket.emit('lobby:error', { message: 'Only the host can kick players' });
      return;
    }

    const targetIdx = lobby.players.findIndex(p => p.slotId === targetSlotId);
    if (targetIdx === -1) return;

    const kicked = lobby.players.splice(targetIdx, 1)[0];

    // Remove kicked player from socket room
    const kickedSocket = io.sockets.sockets.get(kicked.socketId);
    if (kickedSocket) {
      kickedSocket.leave(`lobby:${roomCode}`);
      kickedSocket.emit('lobby:kicked', { message: 'You have been removed from the lobby by the host.' });
    }

    const lobbyRoom = `lobby:${roomCode}`;
    io.to(lobbyRoom).emit('lobby:state', lobby);
    io.to(lobbyRoom).emit('lobby:player-left', { username: kicked.username, slotId: targetSlotId });
  });

  // ─────────────────────────────────────────────────────────
  // lobby:start — Host starts the heist (all must be ready)
  // ─────────────────────────────────────────────────────────
  socket.on('lobby:start', (data, callback) => {
    const { roomCode } = data;
    const lobby = activeLobbies.get(roomCode);
    if (!lobby) {
      return callback?.({ error: 'Lobby not found' });
    }

    if (lobby.hostId !== socket.userId) {
      return callback?.({ error: 'Only the host can start the heist' });
    }

    const allReady = lobby.players.every(p => p.isReady);
    if (!allReady) {
      return callback?.({ error: 'All players must be ready before starting' });
    }

    lobby.status = 'starting';

    const lobbyRoom = `lobby:${roomCode}`;
    io.to(lobbyRoom).emit('lobby:starting', {
      countdown: 3,
      heistId: lobby.heistId,
      players: lobby.players
    });

    // After countdown, emit the heist start
    setTimeout(() => {
      lobby.status = 'active';
      io.to(lobbyRoom).emit('heist:started', {
        heistId: lobby.heistId,
        players: lobby.players,
        roomCode
      });
    }, 3000);

    callback?.({ success: true });
  });

  // ─────────────────────────────────────────────────────────
  // lobby:voice-state — Sync mic/deafen status
  // ─────────────────────────────────────────────────────────
  socket.on('lobby:voice-state', (data) => {
    const { roomCode, connected, muted, deafened } = data;
    const lobby = activeLobbies.get(roomCode);
    if (!lobby) return;

    const player = lobby.players.find(p => p.userId === socket.userId);
    if (!player) return;

    player.voiceState = { connected, muted, deafened };

    io.to(`lobby:${roomCode}`).emit('lobby:voice-update', {
      userId: socket.userId,
      username: socket.username,
      voiceState: player.voiceState
    });
  });

  // ─────────────────────────────────────────────────────────
  // lobby:leave — Player leaves the lobby
  // ─────────────────────────────────────────────────────────
  socket.on('lobby:leave', (data) => {
    const { roomCode } = data;
    handlePlayerLeave(io, socket, roomCode);
  });

  // Handle disconnect — clean up lobbies
  socket.on('disconnect', () => {
    for (const [roomCode, lobby] of activeLobbies) {
      const playerIdx = lobby.players.findIndex(p => p.userId === socket.userId);
      if (playerIdx !== -1) {
        handlePlayerLeave(io, socket, roomCode);
      }
    }
  });
}

/**
 * Handle a player leaving a lobby (voluntarily or by disconnect).
 */
function handlePlayerLeave(io, socket, roomCode) {
  const lobby = activeLobbies.get(roomCode);
  if (!lobby) return;

  const playerIdx = lobby.players.findIndex(p => p.userId === socket.userId);
  if (playerIdx === -1) return;

  const player = lobby.players.splice(playerIdx, 1)[0];
  socket.leave(`lobby:${roomCode}`);

  // If the host left, assign a new host or close the lobby
  if (player.isHost && lobby.players.length > 0) {
    lobby.players[0].isHost = true;
    lobby.hostId = lobby.players[0].userId;
    io.to(`lobby:${roomCode}`).emit('lobby:host-changed', {
      newHost: lobby.players[0].username
    });
  }

  // If lobby is now empty, delete it
  if (lobby.players.length === 0) {
    activeLobbies.delete(roomCode);
    console.log(`[LOBBY] Lobby ${roomCode} deleted (empty)`);
    return;
  }

  io.to(`lobby:${roomCode}`).emit('lobby:state', lobby);
  io.to(`lobby:${roomCode}`).emit('lobby:player-left', {
    username: socket.username,
    slotId: player.slotId
  });

  console.log(`[LOBBY] ${socket.username} left lobby ${roomCode}`);
}
