// ============================================================
// V.A.U.L.T — Heist Engine (Server-Authoritative Game State)
// Manages active heist timers, puzzle validation, alarm states
// ============================================================
// ============================================================
import { getLobbyState } from './lobbyManager.js';

// In-memory active heist state
const activeHeists = new Map();
const heistTimers = new Map();

function normCode(code) {
  return (code || '').toString().trim().toUpperCase();
}

/**
 * Setup heist game engine socket events.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
export function setupHeistEngine(io, socket) {

  // ─────────────────────────────────────────────────────────
  // heist:start — Initialize the heist stage with server timer
  // ─────────────────────────────────────────────────────────
  socket.on('heist:start', async (data, callback) => {
    try {
      const roomCode = normCode(data.roomCode);
      const stageIdx = data.stageIdx || 0;
      const timeLimit = data.timeLimit || 180;
      const selectedRoles = data.selectedRoles || { hacker: true, engineer: true, scientist: true, cryptographer: true };

      const state = {
        roomCode,
        stageIdx,
        timeLimit,
        timeLeft: timeLimit,
        alarmLevel: 'LOW_SECURITY',
        alarmFails: 0,
        solvedRoles: {},
        clues: {},
        selectedRoles,
        startedAt: Date.now(),
        status: 'active'
      };

      activeHeists.set(roomCode, state);

      // Join socket to heist room
      socket.join(`heist:${roomCode}`);
      socket.join(`lobby:${roomCode}`);

      // Start server-authoritative timer
      startHeistTimer(io, roomCode);

      console.log(`[HEIST] Heist started: ${roomCode} (Stage ${stageIdx}, ${timeLimit}s)`);

      io.to(`heist:${roomCode}`).emit('heist:state', state);
      io.to(`lobby:${roomCode}`).emit('heist:state', state);

      callback?.({ success: true, state });

    } catch (err) {
      console.error('[HEIST] Start error:', err);
      callback?.({ error: 'Failed to start heist' });
    }
  });

  // ─────────────────────────────────────────────────────────
  // heist:join-room — Player joins the heist room for updates
  // ─────────────────────────────────────────────────────────
  socket.on('heist:join-room', (data) => {
    const roomCode = normCode(data.roomCode);
    socket.join(`heist:${roomCode}`);
    socket.join(`lobby:${roomCode}`);

    const state = activeHeists.get(roomCode);
    if (state) {
      socket.emit('heist:state', state);
    }
  });

  // ─────────────────────────────────────────────────────────
  // heist:sync-stage — Advance to next stage in multiplayer
  // ─────────────────────────────────────────────────────────
  socket.on('heist:sync-stage', (data) => {
    const roomCode = normCode(data.roomCode);
    const stageIdx = data.stageIdx || 0;
    const timeLimit = data.timeLimit || 180;

    let state = activeHeists.get(roomCode);
    if (state) {
      state.stageIdx = stageIdx;
      state.timeLimit = timeLimit;
      state.timeLeft = timeLimit;
      state.alarmLevel = 'LOW_SECURITY';
      state.alarmFails = 0;
      state.solvedRoles = {};
      state.clues = {};
      state.startedAt = Date.now();
      state.status = 'active';
    } else {
      state = {
        roomCode,
        stageIdx,
        timeLimit,
        timeLeft: timeLimit,
        alarmLevel: 'LOW_SECURITY',
        alarmFails: 0,
        solvedRoles: {},
        clues: {},
        selectedRoles: data.selectedRoles || { hacker: true, engineer: true, scientist: true, cryptographer: true },
        startedAt: Date.now(),
        status: 'active'
      };
      activeHeists.set(roomCode, state);
    }

    startHeistTimer(io, roomCode);

    io.to(`heist:${roomCode}`).emit('heist:stage-synced', state);
    io.to(`lobby:${roomCode}`).emit('heist:stage-synced', state);
  });

  // ─────────────────────────────────────────────────────────
  // heist:submit-answer — Player submits a puzzle answer
  // ─────────────────────────────────────────────────────────
  socket.on('heist:submit-answer', (data, callback) => {
    const roomCode = normCode(data.roomCode);
    const { role, answer, puzzleType } = data;
    const state = activeHeists.get(roomCode);

    if (!state || state.status !== 'active') {
      return callback?.({ error: 'No active heist found' });
    }

    if (state.solvedRoles[role]) {
      return callback?.({ error: `${role} puzzle is already solved` });
    }

    const isCorrect = validatePuzzleAnswer(puzzleType, answer, data.expected);

    if (isCorrect) {
      handlePuzzleSolved(io, roomCode, role, data.clue || `${role} puzzle solved!`, socket, data.solvedBy);
      callback?.({ success: true, correct: true });
    } else {
      handlePuzzleFailed(io, roomCode, role, data.reason || 'Incorrect answer', socket, data.failedBy);
      callback?.({ success: true, correct: false });
    }
  });

  // ─────────────────────────────────────────────────────────
  // heist:propose-end — Propose to end the heist (multiplayer vote)
  // ─────────────────────────────────────────────────────────
  socket.on('heist:propose-end', (data, callback) => {
    const roomCode = normCode(data.roomCode);
    const directive = data.directive; // 'abort' or 'debrief'
    const proposedBy = data.proposedBy || 'A teammate';

    const state = activeHeists.get(roomCode);
    if (!state || state.status !== 'active') {
      return callback?.({ error: 'No active heist found' });
    }

    const lobby = getLobbyState(roomCode);
    const totalPlayers = lobby?.players?.length || 1;

    const requiredVotes = Math.floor(totalPlayers / 2) + 1;

    state.activeVote = {
      directive,
      proposedBy,
      yesVotes: [],
      noVotes: [],
      requiredVotes,
      totalPlayers
    };

    io.to(`heist:${roomCode}`).emit('heist:vote-state', state.activeVote);
    callback?.({ success: true });
  });

  // ─────────────────────────────────────────────────────────
  // heist:vote-end — Vote on an active end-heist proposal
  // ─────────────────────────────────────────────────────────
  socket.on('heist:vote-end', (data, callback) => {
    const roomCode = normCode(data.roomCode);
    const vote = data.vote; // 'yes' or 'no'
    const voterId = data.voterId || socket.id;

    const state = activeHeists.get(roomCode);
    if (!state || state.status !== 'active' || !state.activeVote) {
      return callback?.({ error: 'No active vote found' });
    }

    const v = state.activeVote;
    if (v.yesVotes.includes(voterId) || v.noVotes.includes(voterId)) {
      return callback?.({ error: 'Already voted' });
    }

    if (vote === 'yes') {
      v.yesVotes.push(voterId);
    } else {
      v.noVotes.push(voterId);
    }

    io.to(`heist:${roomCode}`).emit('heist:vote-state', v);

    // Check if majority reached
    if (v.yesVotes.length >= v.requiredVotes) {
      io.to(`heist:${roomCode}`).emit('heist:end-voted', { directive: v.directive });
      state.activeVote = null; // Clear vote
    } else {
      // Check if majority is impossible
      const remainingVotes = v.totalPlayers - (v.yesVotes.length + v.noVotes.length);
      if (v.yesVotes.length + remainingVotes < v.requiredVotes) {
        // Vote failed
        io.to(`heist:${roomCode}`).emit('heist:vote-failed');
        state.activeVote = null;
      }
    }
    
    callback?.({ success: true });
  });

  // ─────────────────────────────────────────────────────────
  // heist:puzzle-solved — Direct solve notification (client validated)
  // ─────────────────────────────────────────────────────────
  socket.on('heist:puzzle-solved', (data) => {
    const roomCode = normCode(data.roomCode);
    const { role, clue, solvedBy } = data;
    handlePuzzleSolved(io, roomCode, role, clue, socket, solvedBy);
  });

  // ─────────────────────────────────────────────────────────
  // heist:puzzle-failed — Direct fail notification
  // ─────────────────────────────────────────────────────────
  socket.on('heist:puzzle-failed', (data) => {
    const roomCode = normCode(data.roomCode);
    const { role, reason, failedBy } = data;
    handlePuzzleFailed(io, roomCode, role, reason, socket, failedBy);
  });

  // ─────────────────────────────────────────────────────────
  // heist:radio-message — Broadcast a chat message to squad
  // ─────────────────────────────────────────────────────────
  socket.on('heist:radio-message', (data) => {
    const roomCode = normCode(data.roomCode);
    const { text, role, sender } = data;
    const state = activeHeists.get(roomCode);

    let timeStr;
    if (state?.startedAt) {
      const timeElapsed = Math.floor((Date.now() - state.startedAt) / 1000);
      timeStr = `${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}`;
    } else {
      const now = new Date();
      timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }

    const message = {
      sender: sender || `${socket.username} (${(role || 'OPERATIVE').toUpperCase()})`,
      role: role || 'hacker',
      text,
      time: timeStr,
      userId: socket.userId
    };

    io.to(`heist:${roomCode}`).emit('heist:radio-message', message);
    io.to(`lobby:${roomCode}`).emit('lobby:radio-message', message);
  });

  // ─────────────────────────────────────────────────────────
  // heist:abort — Abort the current heist
  // ─────────────────────────────────────────────────────────
  socket.on('heist:abort', (data) => {
    const roomCode = normCode(data.roomCode);
    const state = activeHeists.get(roomCode);
    if (!state) return;

    state.status = 'aborted';
    clearHeistTimer(roomCode);

    io.to(`heist:${roomCode}`).emit('heist:aborted', {
      message: `Heist aborted by ${socket.username}`
    });
    io.to(`lobby:${roomCode}`).emit('heist:aborted', {
      message: `Heist aborted by ${socket.username}`
    });

    activeHeists.delete(roomCode);
    console.log(`[HEIST] Heist aborted: ${roomCode}`);
  });

  // ─────────────────────────────────────────────────────────
  // heist:conclude — End the heist with a debrief
  // ─────────────────────────────────────────────────────────
  socket.on('heist:conclude', (data) => {
    const roomCode = normCode(data.roomCode);
    const state = activeHeists.get(roomCode);
    if (!state) return;

    state.status = 'concluded';
    clearHeistTimer(roomCode);

    io.to(`heist:${roomCode}`).emit('heist:concluded', {
      state,
      message: 'Heist concluded — generating debrief.'
    });
    io.to(`lobby:${roomCode}`).emit('heist:concluded', {
      state,
      message: 'Heist concluded — generating debrief.'
    });

    activeHeists.delete(roomCode);
  });
}

// ─────────────────────────────────────────────────────────────
// Timer Management
// ─────────────────────────────────────────────────────────────

function startHeistTimer(io, roomCode) {
  clearHeistTimer(roomCode);

  const interval = setInterval(() => {
    const state = activeHeists.get(roomCode);
    if (!state || state.status !== 'active') {
      clearHeistTimer(roomCode);
      return;
    }

    state.timeLeft -= 1;

    // Alarm level escalation
    if (state.timeLeft <= 30 && state.alarmLevel !== 'HIGH_LOCKDOWN') {
      state.alarmLevel = 'HIGH_LOCKDOWN';
      io.to(`heist:${roomCode}`).emit('heist:alarm-update', {
        alarmLevel: 'HIGH_LOCKDOWN',
        timeLeft: state.timeLeft
      });
      io.to(`lobby:${roomCode}`).emit('heist:alarm-update', {
        alarmLevel: 'HIGH_LOCKDOWN',
        timeLeft: state.timeLeft
      });
    } else if (state.timeLeft <= 60 && state.alarmLevel === 'LOW_SECURITY') {
      state.alarmLevel = 'MEDIUM_ALERT';
      io.to(`heist:${roomCode}`).emit('heist:alarm-update', {
        alarmLevel: 'MEDIUM_ALERT',
        timeLeft: state.timeLeft
      });
      io.to(`lobby:${roomCode}`).emit('heist:alarm-update', {
        alarmLevel: 'MEDIUM_ALERT',
        timeLeft: state.timeLeft
      });
    }

    // Broadcast tick
    io.to(`heist:${roomCode}`).emit('heist:timer-tick', {
      timeLeft: state.timeLeft,
      alarmLevel: state.alarmLevel
    });
    io.to(`lobby:${roomCode}`).emit('heist:timer-tick', {
      timeLeft: state.timeLeft,
      alarmLevel: state.alarmLevel
    });

    // Time expired
    if (state.timeLeft <= 0) {
      handleHeistTimeout(io, roomCode);
    }

  }, 1000);

  heistTimers.set(roomCode, interval);
}

function clearHeistTimer(roomCode) {
  const timer = heistTimers.get(roomCode);
  if (timer) {
    clearInterval(timer);
    heistTimers.delete(roomCode);
  }
}

// ─────────────────────────────────────────────────────────────
// Game Logic Handlers
// ─────────────────────────────────────────────────────────────

function handlePuzzleSolved(io, roomCode, role, clue, socket, solvedByName) {
  let state = activeHeists.get(roomCode);
  if (!state) {
    state = {
      roomCode,
      stageIdx: 0,
      timeLimit: 180,
      timeLeft: 180,
      alarmLevel: 'LOW_SECURITY',
      alarmFails: 0,
      solvedRoles: {},
      clues: {},
      selectedRoles: { hacker: true, engineer: true, scientist: true, cryptographer: true },
      startedAt: Date.now(),
      status: 'active'
    };
    activeHeists.set(roomCode, state);
  }

  state.solvedRoles[role] = true;
  state.clues[role] = clue;

  const timeElapsed = Math.floor((Date.now() - state.startedAt) / 1000);
  const timeStr = `${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}`;
  const solver = solvedByName || socket.username || 'Specialist';

  // Broadcast to all squad members
  const payload = {
    role,
    clue,
    solvedBy: solver,
    time: timeStr,
    solvedRoles: state.solvedRoles
  };

  io.to(`heist:${roomCode}`).emit('heist:puzzle-solved', payload);
  io.to(`lobby:${roomCode}`).emit('heist:puzzle-solved', payload);

  // Check if all active roles are solved
  const activeRoles = Object.keys(state.selectedRoles).filter(k => state.selectedRoles[k]);
  const allSolved = activeRoles.every(r => state.solvedRoles[r]);

  if (allSolved) {
    handleStageVictory(io, roomCode);
  }
}

function handlePuzzleFailed(io, roomCode, role, reason, socket, failedByName) {
  let state = activeHeists.get(roomCode);
  if (!state) {
    state = {
      roomCode,
      stageIdx: 0,
      timeLimit: 180,
      timeLeft: 180,
      alarmLevel: 'LOW_SECURITY',
      alarmFails: 0,
      solvedRoles: {},
      clues: {},
      selectedRoles: { hacker: true, engineer: true, scientist: true, cryptographer: true },
      startedAt: Date.now(),
      status: 'active'
    };
    activeHeists.set(roomCode, state);
  }

  state.alarmFails += 1;
  state.timeLeft = Math.max(5, state.timeLeft - 12); // -12s penalty
  const failer = failedByName || socket.username || 'Specialist';

  // Escalate alarm
  if (state.alarmFails >= 4) {
    state.alarmLevel = 'HIGH_LOCKDOWN';
  } else if (state.alarmFails >= 2) {
    state.alarmLevel = 'MEDIUM_ALERT';
  }

  const payload = {
    role,
    reason,
    failedBy: failer,
    alarmFails: state.alarmFails,
    alarmLevel: state.alarmLevel,
    timeLeft: state.timeLeft,
    penalty: 12
  };

  io.to(`heist:${roomCode}`).emit('heist:puzzle-failed', payload);
  io.to(`lobby:${roomCode}`).emit('heist:puzzle-failed', payload);

  // 6+ failures = auto-bust
  if (state.alarmFails >= 6) {
    handleHeistTimeout(io, roomCode);
  }
}

function handleStageVictory(io, roomCode) {
  const state = activeHeists.get(roomCode);
  if (!state) return;

  state.status = 'victory';
  clearHeistTimer(roomCode);

  const totalTime = Math.floor((Date.now() - state.startedAt) / 1000);
  const timeStr = `${Math.floor(totalTime / 60)}m ${totalTime % 60}s`;

  const payload = {
    stageIdx: state.stageIdx,
    timeElapsed: timeStr,
    alarmFails: state.alarmFails,
    solvedRoles: state.solvedRoles,
    clues: state.clues
  };

  io.to(`heist:${roomCode}`).emit('heist:stage-complete', payload);
  io.to(`lobby:${roomCode}`).emit('heist:stage-complete', payload);

  activeHeists.delete(roomCode);
  console.log(`[HEIST] Stage victory: ${roomCode} (${timeStr})`);
}

function handleHeistTimeout(io, roomCode) {
  const state = activeHeists.get(roomCode);
  if (!state) return;

  state.status = 'timeout';
  state.alarmLevel = 'BUSTED';
  clearHeistTimer(roomCode);

  const payload = {
    message: 'FACILITY LOCKDOWN! Time limit expired.',
    alarmFails: state.alarmFails,
    solvedRoles: state.solvedRoles
  };

  io.to(`heist:${roomCode}`).emit('heist:timeout', payload);
  io.to(`lobby:${roomCode}`).emit('heist:timeout', payload);

  activeHeists.delete(roomCode);
  console.log(`[HEIST] Timeout: ${roomCode}`);
}

// ─────────────────────────────────────────────────────────────
// Puzzle Validation
// ─────────────────────────────────────────────────────────────

function validatePuzzleAnswer(puzzleType, answer, expected) {
  switch (puzzleType) {
    case 'scientist-reagents': {
      if (!Array.isArray(answer) || !Array.isArray(expected)) return false;
      return answer.every((val, idx) => val === expected[idx]);
    }

    case 'engineer-laser': {
      const { angleA, angleB } = answer;
      return angleA === expected.angleA && angleB === expected.angleB;
    }

    case 'hacker-code': {
      const ansStr = JSON.stringify(answer);
      const expStr = JSON.stringify(expected);
      return ansStr === expStr;
    }

    case 'cryptographer-cipher': {
      if (typeof answer !== 'string' || typeof expected !== 'string') return false;
      return answer.trim().toUpperCase() === expected.trim().toUpperCase();
    }

    default:
      return JSON.stringify(answer) === JSON.stringify(expected);
  }
}
