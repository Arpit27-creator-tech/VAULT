// ============================================================
// V.A.U.L.T — Lobby Manager (Socket.io Events)
// Handles lobby creation, joining, ready states, role selection
// ============================================================

// In-memory lobby state (backed by DB for persistence)
const activeLobbies = new Map();

/**
 * Helper to normalize room codes
 */
function normCode(code) {
  return (code || '').toString().trim().toUpperCase();
}

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
      const roomCode = normCode(data.roomCode || `HEIST-${Math.floor(100 + Math.random() * 900)}`);
      const heistId = data.heistId || 'm1';
      const missionTitle = data.missionTitle || 'The Quantum Core Strike Squad';
      const role = data.role || 'hacker';
      const characterId = data.characterId || 'c1';

      const lobbyRoom = `lobby:${roomCode}`;

      const initialLobby = {
        heistId,
        roomCode,
        code: roomCode,
        name: missionTitle,
        hostId: socket.userId,
        players: [
          {
            userId: socket.userId,
            username: socket.username,
            socketId: socket.id,
            slotId: 1,
            role,
            characterId,
            isHost: true,
            isReady: true,
            voiceState: { connected: true, muted: false, deafened: false }
          },
          {
            userId: null,
            username: '',
            socketId: null,
            slotId: 2,
            role: 'engineer',
            characterId: 'c2',
            isHost: false,
            isReady: false,
            voiceState: { connected: false, muted: false, deafened: false }
          },
          {
            userId: null,
            username: '',
            socketId: null,
            slotId: 3,
            role: 'scientist',
            characterId: 'c3',
            isHost: false,
            isReady: false,
            voiceState: { connected: false, muted: false, deafened: false }
          },
          {
            userId: null,
            username: '',
            socketId: null,
            slotId: 4,
            role: 'cryptographer',
            characterId: 'c4',
            isHost: false,
            isReady: false,
            voiceState: { connected: false, muted: false, deafened: false }
          }
        ],
        status: 'waiting',
        createdAt: Date.now()
      };

      activeLobbies.set(roomCode, initialLobby);

      // Join the Socket.io room
      socket.join(lobbyRoom);

      console.log(`[LOBBY] ${socket.username} created lobby ${roomCode}`);

      callback?.({
        success: true,
        lobby: initialLobby
      });

      // Broadcast lobby state
      io.to(lobbyRoom).emit('lobby:state', initialLobby);

    } catch (err) {
      console.error('[LOBBY] Create error:', err);
      callback?.({ error: 'Failed to create lobby' });
    }
  });

  // ─────────────────────────────────────────────────────────
  // lobby:list-recruiting — List all active squads recruiting members
  // ─────────────────────────────────────────────────────────
  socket.on('lobby:list-recruiting', (callback) => {
    try {
      const list = [];
      for (const [code, lobby] of activeLobbies) {
        if (lobby.status === 'waiting' || !lobby.status) {
          const host = lobby.players.find(p => p.isHost && p.userId) || lobby.players[0];
          const filled = lobby.players.filter(p => p.userId && p.username);
          const openSlots = lobby.players.filter(p => !p.userId || !p.username);

          list.push({
            roomCode: lobby.roomCode || code,
            name: lobby.name || 'Syndicate Co-op Operation',
            heistId: lobby.heistId || 'm1',
            hostName: host?.username || 'Squad Leader',
            hostRole: host?.role || 'hacker',
            totalMembers: filled.length,
            maxMembers: 4,
            openRoles: openSlots.map(s => s.role),
            filledRoles: filled.map(s => ({ role: s.role, username: s.username })),
            voiceActive: true,
            createdAt: lobby.createdAt || Date.now()
          });
        }
      }
      callback?.({ success: true, squads: list });
    } catch (err) {
      console.error('[LOBBY] List recruiting error:', err);
      callback?.({ error: 'Failed to list recruiting squads' });
    }
  });

  // ─────────────────────────────────────────────────────────
  // lobby:get — Fetch current lobby state
  // ─────────────────────────────────────────────────────────
  socket.on('lobby:get', (data, callback) => {
    const roomCode = normCode(data.roomCode);
    const lobby = activeLobbies.get(roomCode);
    if (!lobby) {
      return callback?.({ error: `Lobby ${roomCode} not found` });
    }
    socket.join(`lobby:${roomCode}`);
    callback?.({ success: true, lobby });
    socket.emit('lobby:state', lobby);
  });

  // ─────────────────────────────────────────────────────────
  // lobby:join — Player joins an existing lobby by room code
  // ─────────────────────────────────────────────────────────
  socket.on('lobby:join', async (data, callback) => {
    try {
      const roomCode = normCode(data.roomCode);
      const role = data.role || 'engineer';
      const characterId = data.characterId || 'c2';
      const playerName = data.playerName || socket.username;

      if (!roomCode) {
        return callback?.({ error: 'Please enter a valid room code.' });
      }

      let lobby = activeLobbies.get(roomCode);

      // If lobby doesn't exist, reject join attempt
      if (!lobby) {
        return callback?.({ error: `Squad room "${roomCode}" not found. Please verify the code or create a new squad.` });
      }

      const lobbyRoom = `lobby:${roomCode}`;
      socket.join(lobbyRoom);

      // Check if player is already seated in a slot
      const existingPlayer = lobby.players.find(p => p.userId === socket.userId);
      if (existingPlayer) {
        existingPlayer.socketId = socket.id;
        existingPlayer.username = playerName;
        if (role) existingPlayer.role = role;
        if (characterId) existingPlayer.characterId = characterId;

        console.log(`[LOBBY] ${socket.username} re-joined lobby ${roomCode} (slot ${existingPlayer.slotId})`);

        callback?.({ success: true, slotId: existingPlayer.slotId, lobby });
        io.to(lobbyRoom).emit('lobby:state', lobby);
        return;
      }

      // Find first empty slot
      const emptySlot = lobby.players.find(p => !p.userId || !p.username);
      if (!emptySlot) {
        return callback?.({ error: 'Squad is full (4/4 operatives assembled)' });
      }

      // Assign to slot
      emptySlot.userId = socket.userId;
      emptySlot.username = playerName;
      emptySlot.socketId = socket.id;
      emptySlot.role = role;
      emptySlot.characterId = characterId;
      emptySlot.isHost = false;
      emptySlot.isReady = true;
      emptySlot.voiceState = { connected: true, muted: false, deafened: false };

      console.log(`[LOBBY] ${socket.username} joined lobby ${roomCode} (slot ${emptySlot.slotId}, role ${role})`);

      callback?.({ success: true, slotId: emptySlot.slotId, lobby });

      // Broadcast updated lobby to all members
      io.to(lobbyRoom).emit('lobby:state', lobby);
      io.to(lobbyRoom).emit('lobby:player-joined', {
        username: playerName,
        slotId: emptySlot.slotId,
        role: emptySlot.role
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
    const roomCode = normCode(data.roomCode);
    const isReady = !!data.isReady;
    const lobby = activeLobbies.get(roomCode);
    if (!lobby) return;

    const player = lobby.players.find(p => p.userId === socket.userId);
    if (!player) return;

    player.isReady = isReady;

    const lobbyRoom = `lobby:${roomCode}`;
    io.to(lobbyRoom).emit('lobby:state', lobby);
    io.to(lobbyRoom).emit('lobby:player-ready', {
      username: player.username,
      slotId: player.slotId,
      isReady
    });
  });

  // ─────────────────────────────────────────────────────────
  // lobby:select-role — Player picks a heist role
  // ─────────────────────────────────────────────────────────
  socket.on('lobby:select-role', (data) => {
    const roomCode = normCode(data.roomCode);
    const role = data.role;
    const lobby = activeLobbies.get(roomCode);
    if (!lobby) return;

    const player = lobby.players.find(p => p.userId === socket.userId);
    if (!player) return;

    player.role = role;

    const lobbyRoom = `lobby:${roomCode}`;
    io.to(lobbyRoom).emit('lobby:state', lobby);
    io.to(lobbyRoom).emit('lobby:role-changed', {
      username: player.username,
      slotId: player.slotId,
      role
    });
  });

  // ─────────────────────────────────────────────────────────
  // lobby:kick — Host kicks a player from slot
  // ─────────────────────────────────────────────────────────
  socket.on('lobby:kick', (data) => {
    const roomCode = normCode(data.roomCode);
    const targetSlotId = parseInt(data.targetSlotId, 10);
    const lobby = activeLobbies.get(roomCode);
    if (!lobby) return;

    // Only host can kick
    if (lobby.hostId !== socket.userId) {
      socket.emit('lobby:error', { message: 'Only the squad host can dismiss operatives' });
      return;
    }

    const targetSlot = lobby.players.find(p => p.slotId === targetSlotId);
    if (!targetSlot || !targetSlot.userId) return;

    const kickedName = targetSlot.username;
    const kickedSocketId = targetSlot.socketId;

    // Reset slot
    targetSlot.userId = null;
    targetSlot.username = '';
    targetSlot.socketId = null;
    targetSlot.isReady = false;

    // Notify kicked player
    if (kickedSocketId) {
      const kickedSocket = io.sockets.sockets.get(kickedSocketId);
      if (kickedSocket) {
        kickedSocket.leave(`lobby:${roomCode}`);
        kickedSocket.emit('lobby:kicked', { message: 'You have been removed from the squad by the host.' });
      }
    }

    const lobbyRoom = `lobby:${roomCode}`;
    io.to(lobbyRoom).emit('lobby:state', lobby);
    io.to(lobbyRoom).emit('lobby:player-left', { username: kickedName, slotId: targetSlotId });
  });

  // ─────────────────────────────────────────────────────────
  // lobby:start — Host starts the heist (synchronized countdown)
  // ─────────────────────────────────────────────────────────
  socket.on('lobby:start', (data, callback) => {
    const roomCode = normCode(data.roomCode);
    const lobby = activeLobbies.get(roomCode);
    if (!lobby) {
      return callback?.({ error: 'Lobby not found' });
    }

    if (lobby.hostId !== socket.userId) {
      return callback?.({ error: 'Only the squad host can launch the heist' });
    }

    lobby.status = 'starting';

    const lobbyRoom = `lobby:${roomCode}`;
    const activePlayers = lobby.players.filter(p => p.userId && p.username);

    // Broadcast synchronized countdown
    io.to(lobbyRoom).emit('lobby:starting', {
      countdown: 3,
      heistId: lobby.heistId,
      roomCode,
      players: activePlayers
    });

    // After countdown, emit live heist start
    setTimeout(() => {
      lobby.status = 'active';
      io.to(lobbyRoom).emit('heist:started', {
        heistId: lobby.heistId,
        players: activePlayers,
        roomCode
      });
    }, 3000);

    callback?.({ success: true });
  });

  // ─────────────────────────────────────────────────────────
  // lobby:voice-state — Sync mic/deafen status
  // ─────────────────────────────────────────────────────────
  socket.on('lobby:voice-state', (data) => {
    const roomCode = normCode(data.roomCode);
    const { connected, muted, deafened } = data;
    const lobby = activeLobbies.get(roomCode);
    if (!lobby) return;

    const player = lobby.players.find(p => p.userId === socket.userId);
    if (!player) return;

    player.voiceState = { connected, muted, deafened };

    io.to(`lobby:${roomCode}`).emit('lobby:voice-update', {
      userId: socket.userId,
      username: player.username,
      slotId: player.slotId,
      voiceState: player.voiceState
    });
    io.to(`lobby:${roomCode}`).emit('lobby:state', lobby);
  });

  // ─────────────────────────────────────────────────────────
  // lobby:radio-message — Chat in the lobby
  // ─────────────────────────────────────────────────────────
  socket.on('lobby:radio-message', (data) => {
    const roomCode = normCode(data.roomCode);
    const { text, role } = data;
    const lobby = activeLobbies.get(roomCode);
    if (!lobby) return;

    const player = lobby.players.find(p => p.userId === socket.userId);
    const sender = player ? `${player.username} (${(player.role || role || 'OPERATIVE').toUpperCase()})` : socket.username;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const message = {
      sender,
      role: player?.role || role || 'hacker',
      text,
      time: timeStr,
      userId: socket.userId
    };

    io.to(`lobby:${roomCode}`).emit('lobby:radio-message', message);
    io.to(`heist:${roomCode}`).emit('heist:radio-message', message);
  });

  // ─────────────────────────────────────────────────────────
  // WebRTC Multi-Peer Real-Time Voice Signaling
  // ─────────────────────────────────────────────────────────
  socket.on('voice:join', async (data, callback) => {
    try {
      const roomCode = normCode(data.roomCode);
      if (!roomCode) return callback?.({ error: 'Room code required' });

      const voiceRoom = `voice:${roomCode}`;

      // Discover existing peers in the voice room BEFORE this socket joins
      const otherSockets = [];
      try {
        const socketsInRoom = await io.in(voiceRoom).fetchSockets();
        socketsInRoom.forEach(s => {
          if (s.id !== socket.id) {
            otherSockets.push({
              socketId: s.id,
              userId: s.userId || s.id,
              username: s.username || 'Operative'
            });
          }
        });
      } catch (e) {
        // Fallback to lobby-based discovery
        const lobby = activeLobbies.get(roomCode);
        if (lobby) {
          lobby.players.forEach(p => {
            if (p.socketId && p.socketId !== socket.id && p.userId) {
              otherSockets.push({
                socketId: p.socketId,
                userId: p.userId,
                username: p.username
              });
            }
          });
        }
      }

      // Now join the voice room
      socket.join(voiceRoom);

      // Notify others in voice room that a new peer has linked
      socket.to(voiceRoom).emit('voice:user-joined', {
        socketId: socket.id,
        userId: socket.userId,
        username: socket.username
      });

      console.log(`[VOICE] ${socket.username} joined voice room ${roomCode} (${otherSockets.length} peers found)`);

      callback?.({
        success: true,
        peers: otherSockets
      });
    } catch (err) {
      console.error('[VOICE] Join error:', err);
      callback?.({ error: 'Failed to join voice channel' });
    }
  });

  socket.on('voice:signal', (data) => {
    const { to, signal } = data;
    if (to && signal) {
      io.to(to).emit('voice:signal', {
        from: socket.id,
        signal,
        username: socket.username
      });
    }
  });

  socket.on('voice:leave', (data) => {
    const roomCode = normCode(data?.roomCode);
    if (roomCode) {
      socket.leave(`voice:${roomCode}`);
      socket.to(`voice:${roomCode}`).emit('voice:user-left', {
        socketId: socket.id,
        userId: socket.userId
      });
    }
  });

  // ─────────────────────────────────────────────────────────
  // lobby:leave — Player leaves the lobby
  // ─────────────────────────────────────────────────────────
  socket.on('lobby:leave', (data) => {
    const roomCode = normCode(data.roomCode);
    handlePlayerLeave(io, socket, roomCode);
  });

  // Handle disconnect — clean up lobbies
  socket.on('disconnect', () => {
    for (const [roomCode, lobby] of activeLobbies) {
      const player = lobby.players.find(p => p.userId === socket.userId || p.socketId === socket.id);
      if (player) {
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

  const player = lobby.players.find(p => p.userId === socket.userId || p.socketId === socket.id);
  if (!player || !player.userId) return;

  const leavingName = player.username;
  const leavingSlotId = player.slotId;
  const wasHost = player.isHost;

  // Reset this slot
  player.userId = null;
  player.username = '';
  player.socketId = null;
  player.isHost = false;
  player.isReady = false;

  socket.leave(`lobby:${roomCode}`);

  const activePlayers = lobby.players.filter(p => p.userId && p.username);

  // If no players left, clean up lobby
  if (activePlayers.length === 0) {
    activeLobbies.delete(roomCode);
    console.log(`[LOBBY] Lobby ${roomCode} deleted (empty)`);
    return;
  }

  // If host left, reassign host to first active player
  if (wasHost && activePlayers.length > 0) {
    activePlayers[0].isHost = true;
    lobby.hostId = activePlayers[0].userId;
    io.to(`lobby:${roomCode}`).emit('lobby:host-changed', {
      newHost: activePlayers[0].username
    });
  }

  io.to(`lobby:${roomCode}`).emit('lobby:state', lobby);
  io.to(`lobby:${roomCode}`).emit('lobby:player-left', {
    username: leavingName,
    slotId: leavingSlotId
  });

  console.log(`[LOBBY] ${socket.username} vacated slot ${leavingSlotId} in lobby ${roomCode}`);
}
