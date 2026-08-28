// ============================================================
// V.A.U.L.T — Heist Engine (Server-Authoritative Game State)
// Manages active heist timers, puzzle validation, alarm states
// ============================================================

import { query, transaction } from '../db/index.js';

// In-memory active heist state
const activeHeists = new Map();

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
      const { roomCode, stageIdx, timeLimit, puzzles, selectedRoles } = data;

      const heistRoom = `heist:${roomCode}`;

      const state = {
        roomCode,
        stageIdx: stageIdx || 0,
        timeLimit: timeLimit || 180,
        timeLeft: timeLimit || 180,
        alarmLevel: 'LOW_SECURITY',
        alarmFails: 0,
        solvedRoles: {},
        clues: {},
        selectedRoles: selectedRoles || { hacker: true, engineer: true, scientist: true, cryptographer: true },
        startedAt: Date.now(),
        status: 'active'
      };

      activeHeists.set(roomCode, state);

      // Join all socket members to the heist room
      socket.join(heistRoom);

      // Start server-authoritative timer
      startHeistTimer(io, roomCode);

      console.log(`[HEIST] Heist started: ${roomCode} (Stage ${stageIdx}, ${timeLimit}s)`);

      io.to(heistRoom).emit('heist:state', state);

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
    const { roomCode } = data;
    socket.join(`heist:${roomCode}`);

    const state = activeHeists.get(roomCode);
    if (state) {
      socket.emit('heist:state', state);
    }
  });

  // ─────────────────────────────────────────────────────────
  // heist:submit-answer — Player submits a puzzle answer
  // Server validates and broadcasts result
  // ─────────────────────────────────────────────────────────
  socket.on('heist:submit-answer', (data, callback) => {
    const { roomCode, role, answer, puzzleType } = data;
    const state = activeHeists.get(roomCode);

    if (!state || state.status !== 'active') {
      return callback?.({ error: 'No active heist found' });
    }

    if (state.solvedRoles[role]) {
      return callback?.({ error: `${role} puzzle is already solved` });
    }

    // Validate the answer based on puzzle type
    const isCorrect = validatePuzzleAnswer(puzzleType, answer, data.expected);

    if (isCorrect) {
      handlePuzzleSolved(io, roomCode, role, data.clue || `${role} puzzle solved!`, socket);
      callback?.({ success: true, correct: true });
    } else {
      handlePuzzleFailed(io, roomCode, role, data.reason || 'Incorrect answer', socket);
      callback?.({ success: true, correct: false });
    }
  });

  // ─────────────────────────────────────────────────────────
  // heist:puzzle-solved — Direct solve notification (trusted client)
  // Used when puzzle validation happens client-side (code execution, etc.)
  // ─────────────────────────────────────────────────────────
  socket.on('heist:puzzle-solved', (data) => {
    const { roomCode, role, clue } = data;
    handlePuzzleSolved(io, roomCode, role, clue, socket);
  });

  // ─────────────────────────────────────────────────────────
  // heist:puzzle-failed — Direct fail notification
  // ─────────────────────────────────────────────────────────
  socket.on('heist:puzzle-failed', (data) => {
    const { roomCode, role, reason } = data;
    handlePuzzleFailed(io, roomCode, role, reason, socket);
  });

  // ─────────────────────────────────────────────────────────
  // heist:radio-message — Broadcast a chat message to squad
  // ─────────────────────────────────────────────────────────
  socket.on('heist:radio-message', (data) => {
    const { roomCode, text, role } = data;
    const state = activeHeists.get(roomCode);
    if (!state) return;

    const timeElapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    const timeStr = `${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}`;

    const message = {
      sender: `${socket.username} (${role.toUpperCase()})`,
      role,
      text,
      time: timeStr,
      userId: socket.userId
    };

    io.to(`heist:${roomCode}`).emit('heist:radio-message', message);
  });

  // ─────────────────────────────────────────────────────────
  // heist:abort — Abort the current heist
  // ─────────────────────────────────────────────────────────
  socket.on('heist:abort', (data) => {
    const { roomCode } = data;
    const state = activeHeists.get(roomCode);
    if (!state) return;

    state.status = 'aborted';
    clearHeistTimer(roomCode);

    io.to(`heist:${roomCode}`).emit('heist:aborted', {
      message: `Heist aborted by ${socket.username}`
    });

    activeHeists.delete(roomCode);
    console.log(`[HEIST] Heist aborted: ${roomCode}`);
  });

  // ─────────────────────────────────────────────────────────
  // heist:conclude — End the heist with a debrief
  // ─────────────────────────────────────────────────────────
  socket.on('heist:conclude', (data) => {
    const { roomCode } = data;
    const state = activeHeists.get(roomCode);
    if (!state) return;

    state.status = 'concluded';
    clearHeistTimer(roomCode);

    io.to(`heist:${roomCode}`).emit('heist:concluded', {
      state,
      message: 'Heist concluded — generating debrief.'
    });

    activeHeists.delete(roomCode);
  });
}

// ─────────────────────────────────────────────────────────────
// Timer Management
// ─────────────────────────────────────────────────────────────
const heistTimers = new Map();

function startHeistTimer(io, roomCode) {
  // Clear any existing timer
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
    } else if (state.timeLeft <= 60 && state.alarmLevel === 'LOW_SECURITY') {
      state.alarmLevel = 'MEDIUM_ALERT';
      io.to(`heist:${roomCode}`).emit('heist:alarm-update', {
        alarmLevel: 'MEDIUM_ALERT',
        timeLeft: state.timeLeft
      });
    }

    // Broadcast tick
    io.to(`heist:${roomCode}`).emit('heist:timer-tick', {
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

function handlePuzzleSolved(io, roomCode, role, clue, socket) {
  const state = activeHeists.get(roomCode);
  if (!state) return;

  state.solvedRoles[role] = true;
  state.clues[role] = clue;

  const timeElapsed = Math.floor((Date.now() - state.startedAt) / 1000);
  const timeStr = `${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}`;

  // Broadcast to all squad members
  io.to(`heist:${roomCode}`).emit('heist:puzzle-solved', {
    role,
    clue,
    solvedBy: socket.username,
    time: timeStr,
    solvedRoles: state.solvedRoles
  });

  // Check if all active roles are solved
  const activeRoles = Object.keys(state.selectedRoles).filter(k => state.selectedRoles[k]);
  const allSolved = activeRoles.every(r => state.solvedRoles[r]);

  if (allSolved) {
    handleStageVictory(io, roomCode);
  }
}

function handlePuzzleFailed(io, roomCode, role, reason, socket) {
  const state = activeHeists.get(roomCode);
  if (!state) return;

  state.alarmFails += 1;
  state.timeLeft = Math.max(5, state.timeLeft - 12); // -12s penalty

  // Escalate alarm
  if (state.alarmFails >= 4) {
    state.alarmLevel = 'HIGH_LOCKDOWN';
  } else if (state.alarmFails >= 2) {
    state.alarmLevel = 'MEDIUM_ALERT';
  }

  io.to(`heist:${roomCode}`).emit('heist:puzzle-failed', {
    role,
    reason,
    failedBy: socket.username,
    alarmFails: state.alarmFails,
    alarmLevel: state.alarmLevel,
    timeLeft: state.timeLeft,
    penalty: 12
  });

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

  io.to(`heist:${roomCode}`).emit('heist:stage-complete', {
    stageIdx: state.stageIdx,
    timeElapsed: timeStr,
    alarmFails: state.alarmFails,
    solvedRoles: state.solvedRoles,
    clues: state.clues
  });

  activeHeists.delete(roomCode);
  console.log(`[HEIST] Stage victory: ${roomCode} (${timeStr})`);
}

function handleHeistTimeout(io, roomCode) {
  const state = activeHeists.get(roomCode);
  if (!state) return;

  state.status = 'timeout';
  state.alarmLevel = 'BUSTED';
  clearHeistTimer(roomCode);

  io.to(`heist:${roomCode}`).emit('heist:timeout', {
    message: 'FACILITY LOCKDOWN! Time limit expired.',
    alarmFails: state.alarmFails,
    solvedRoles: state.solvedRoles
  });

  activeHeists.delete(roomCode);
  console.log(`[HEIST] Timeout: ${roomCode}`);
}

// ─────────────────────────────────────────────────────────────
// Puzzle Validation
// ─────────────────────────────────────────────────────────────

function validatePuzzleAnswer(puzzleType, answer, expected) {
  switch (puzzleType) {
    case 'scientist-reagents': {
      // Check if all coefficients match
      if (!Array.isArray(answer) || !Array.isArray(expected)) return false;
      return answer.every((val, idx) => val === expected[idx]);
    }

    case 'engineer-laser': {
      // Check if angles match required
      const { angleA, angleB } = answer;
      return angleA === expected.angleA && angleB === expected.angleB;
    }

    case 'hacker-code': {
      // Compare output arrays/strings
      const ansStr = JSON.stringify(answer);
      const expStr = JSON.stringify(expected);
      return ansStr === expStr;
    }

    case 'cryptographer-cipher': {
      // Compare decrypted text (case insensitive, trimmed)
      if (typeof answer !== 'string' || typeof expected !== 'string') return false;
      return answer.trim().toUpperCase() === expected.trim().toUpperCase();
    }

    default:
      // Generic equality check
      return JSON.stringify(answer) === JSON.stringify(expected);
  }
}
