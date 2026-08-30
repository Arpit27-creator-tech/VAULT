// ============================================================
// V.A.U.L.T — Heist Session Routes
// ============================================================

import { Router } from 'express';
import { query, transaction } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * Generate a heist room code like "HEIST-A7B3"
 */
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'HEIST-';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ─────────────────────────────────────────────────────────────
// POST /api/heists — Create a new heist session
// ─────────────────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { mission_id, stage_data, time_limit } = req.body;

    // Generate unique room code
    let roomCode = generateRoomCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await query(`SELECT id FROM heist_sessions WHERE room_code = $1`, [roomCode]);
      if (existing.rows.length === 0) break;
      roomCode = generateRoomCode();
      attempts++;
    }

    const result = await transaction(async (client) => {
      // Create heist session
      const heistResult = await client.query(
        `INSERT INTO heist_sessions (mission_id, room_code, time_limit, time_left, host_id, stage_data)
         VALUES ($1, $2, $3, $3, $4, $5)
         RETURNING *`,
        [mission_id || null, roomCode, time_limit || 180, req.user.id, JSON.stringify(stage_data || {})]
      );

      const heist = heistResult.rows[0];

      // Add host as first participant
      await client.query(
        `INSERT INTO heist_participants (heist_id, user_id, role, slot_id, is_host, is_ready)
         VALUES ($1, $2, $3, 1, TRUE, TRUE)`,
        [heist.id, req.user.id, 'hacker']
      );

      return heist;
    });

    res.status(201).json({
      heist: {
        id: result.id,
        roomCode: result.room_code,
        status: result.status,
        timeLimit: result.time_limit,
        missionId: result.mission_id
      }
    });

  } catch (err) {
    console.error('[HEISTS] Create error:', err);
    res.status(500).json({ error: 'Failed to create heist session' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/heists/:id — Get heist session state
// ─────────────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const heistResult = await query(
      `SELECT h.*, m.title AS mission_title, m.category AS mission_category
       FROM heist_sessions h
       LEFT JOIN missions m ON m.id = h.mission_id
       WHERE h.id = $1`,
      [id]
    );

    if (heistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Heist session not found' });
    }

    const heist = heistResult.rows[0];

    // Get participants
    const participantsResult = await query(
      `SELECT hp.*, u.username, u.callsign, u.avatar_url
       FROM heist_participants hp
       JOIN users u ON u.id = hp.user_id
       WHERE hp.heist_id = $1
       ORDER BY hp.slot_id`,
      [id]
    );

    res.json({
      heist: {
        id: heist.id,
        roomCode: heist.room_code,
        missionId: heist.mission_id,
        missionTitle: heist.mission_title,
        missionCategory: heist.mission_category,
        stageIdx: heist.stage_idx,
        alarmLevel: heist.alarm_level,
        alarmFails: heist.alarm_fails,
        timeLimit: heist.time_limit,
        timeLeft: heist.time_left,
        status: heist.status,
        stageData: heist.stage_data,
        participants: participantsResult.rows.map(p => ({
          userId: p.user_id,
          username: p.username,
          callsign: p.callsign,
          avatar: p.avatar_url,
          role: p.role,
          slotId: p.slot_id,
          isHost: p.is_host,
          isReady: p.is_ready,
          xpEarned: p.xp_earned,
          puzzlesSolved: p.puzzles_solved
        }))
      }
    });

  } catch (err) {
    console.error('[HEISTS] Get error:', err);
    res.status(500).json({ error: 'Failed to fetch heist session' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/heists/join — Join a heist by room code
// ─────────────────────────────────────────────────────────────
router.post('/join', authenticate, async (req, res) => {
  try {
    const { room_code, role } = req.body;

    if (!room_code) {
      return res.status(400).json({ error: 'Room code is required' });
    }

    const heistResult = await query(
      `SELECT * FROM heist_sessions WHERE room_code = $1 AND status = 'lobby'`,
      [room_code.toUpperCase()]
    );

    if (heistResult.rows.length === 0) {
      return res.status(404).json({ error: 'No active lobby found with that room code' });
    }

    const heist = heistResult.rows[0];

    // Check if already joined
    const existingParticipant = await query(
      `SELECT id FROM heist_participants WHERE heist_id = $1 AND user_id = $2`,
      [heist.id, req.user.id]
    );

    if (existingParticipant.rows.length > 0) {
      return res.status(409).json({ error: 'You are already in this heist lobby' });
    }

    // Find next available slot
    const participantsResult = await query(
      `SELECT slot_id FROM heist_participants WHERE heist_id = $1 ORDER BY slot_id`,
      [heist.id]
    );

    const takenSlots = participantsResult.rows.map(p => p.slot_id);
    const nextSlot = [1, 2, 3, 4].find(s => !takenSlots.includes(s));

    if (!nextSlot) {
      return res.status(409).json({ error: 'Lobby is full (4/4 players)' });
    }

    await query(
      `INSERT INTO heist_participants (heist_id, user_id, role, slot_id, is_host, is_ready)
       VALUES ($1, $2, $3, $4, FALSE, FALSE)`,
      [heist.id, req.user.id, role || 'hacker', nextSlot]
    );

    res.json({
      message: 'Joined heist lobby',
      heistId: heist.id,
      slotId: nextSlot
    });

  } catch (err) {
    console.error('[HEISTS] Join error:', err);
    res.status(500).json({ error: 'Failed to join heist' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/heists/complete — Record results for a heist that
// ran entirely over Socket.io (no heist_sessions row exists).
// Persists XP, level, stats, and heist history to the database
// so progress is consistent across every device the user logs
// into, instead of being trapped in one browser's localStorage.
// ─────────────────────────────────────────────────────────────
router.post('/complete', authenticate, async (req, res) => {
  try {
    const { result, xp_earned, time_elapsed, accuracy, alarms_tripped, role, mission_title, vaults_cracked } = req.body;
    const xpGained = Number.isFinite(xp_earned) ? xp_earned : 0;

    const updatedUser = await transaction(async (client) => {
      await client.query(
        `INSERT INTO heist_history (user_id, heist_id, mission_title, role, result, xp_earned, time_elapsed, accuracy, alarms_tripped)
         VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8)`,
        [req.user.id, mission_title || 'Unknown Mission', role, result || 'CONCLUDED', xpGained, time_elapsed || '0s', accuracy || '0%', alarms_tripped || 0]
      );

      const userResult = await client.query(
        `UPDATE users SET xp = xp + $1, level = GREATEST(1, CAST(FLOOR((xp + $1) / 1000.0) AS INTEGER) + 1)
         WHERE id = $2
         RETURNING id, username, callsign, avatar_url, role, level, xp, rank, badges`,
        [xpGained, req.user.id]
      );

      await client.query(
        `UPDATE user_stats SET
           missions_completed = missions_completed + 1,
           vaults_cracked = vaults_cracked + $1,
           alarms_tripped = alarms_tripped + $2
         WHERE user_id = $3`,
        [vaults_cracked || 0, alarms_tripped || 0, req.user.id]
      );

      await client.query(
        `UPDATE leaderboard SET total_xp = total_xp + $1, weekly_xp = weekly_xp + $1,
                streak = CASE WHEN $2 = 'VICTORY' THEN streak + 1 ELSE 0 END
         WHERE user_id = $3`,
        [xpGained, result, req.user.id]
      );

      return userResult.rows[0];
    });

    res.json({
      message: 'Heist results recorded successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        callsign: updatedUser.callsign,
        avatar: updatedUser.avatar_url,
        role: updatedUser.role,
        level: updatedUser.level,
        xp: updatedUser.xp,
        rank: updatedUser.rank,
        badges: updatedUser.badges
      }
    });
  } catch (err) {
    console.error('[HEISTS] Complete error:', err);
    res.status(500).json({ error: 'Failed to record heist results' });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/heists/:id/results — Submit heist results
// Updates user XP, stats, and creates history entries
// ─────────────────────────────────────────────────────────────
router.put('/:id/results', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { result, xp_earned, time_elapsed, accuracy, alarms_tripped, role, mission_title, puzzles_solved } = req.body;

    await transaction(async (client) => {
      // Update heist session status
      const newStatus = result === 'VICTORY' ? 'victory' : 'defeat';
      await client.query(
        `UPDATE heist_sessions SET status = $1, ended_at = NOW() WHERE id = $2`,
        [newStatus, id]
      );

      // Update participant record
      await client.query(
        `UPDATE heist_participants 
         SET xp_earned = $1, puzzles_solved = $2
         WHERE heist_id = $3 AND user_id = $4`,
        [xp_earned || 0, JSON.stringify(puzzles_solved || {}), id, req.user.id]
      );

      // Add to heist history
      await client.query(
        `INSERT INTO heist_history (user_id, heist_id, mission_title, role, result, xp_earned, time_elapsed, accuracy, alarms_tripped)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [req.user.id, id, mission_title || 'Unknown Mission', role, result || 'CONCLUDED', xp_earned || 0, time_elapsed || '0s', accuracy || '0%', alarms_tripped || 0]
      );

      // Update user XP and level
      const xpGained = xp_earned || 0;
      await client.query(
        `UPDATE users SET xp = xp + $1, level = GREATEST(1, CAST(FLOOR((xp + $1) / 1000.0) AS INTEGER) + 1) WHERE id = $2`,
        [xpGained, req.user.id]
      );

      // Update user stats
      await client.query(
        `UPDATE user_stats SET 
           missions_completed = missions_completed + 1,
           vaults_cracked = vaults_cracked + $1,
           alarms_tripped = alarms_tripped + $2
         WHERE user_id = $3`,
        [
          result === 'VICTORY' ? (puzzles_solved ? Object.keys(puzzles_solved).length : 1) : 0,
          alarms_tripped || 0,
          req.user.id
        ]
      );

      // Update leaderboard
      await client.query(
        `UPDATE leaderboard SET total_xp = total_xp + $1, weekly_xp = weekly_xp + $1,
                streak = CASE WHEN $2 = 'VICTORY' THEN streak + 1 ELSE 0 END
         WHERE user_id = $3`,
        [xpGained, result, req.user.id]
      );
    });

    res.json({ message: 'Results recorded successfully' });

  } catch (err) {
    console.error('[HEISTS] Results error:', err);
    res.status(500).json({ error: 'Failed to record results' });
  }
});

export default router;
