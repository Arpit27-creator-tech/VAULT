// ============================================================
// V.A.U.L.T — Leaderboard Routes
// ============================================================

import { Router } from 'express';
import { query } from '../db/index.js';

const router = Router();

// ─────────────────────────────────────────────────────────────
// GET /api/leaderboard — Global top 50 leaderboard
// ─────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    const result = await query(
      `SELECT l.total_xp, l.weekly_xp, l.streak,
              u.id, u.username, u.callsign, u.avatar_url, u.role, u.level, u.rank
       FROM leaderboard l
       JOIN users u ON u.id = l.user_id
       ORDER BY l.total_xp DESC
       LIMIT $1`,
      [limit]
    );

    const leaderboard = result.rows.map((entry, idx) => ({
      position: idx + 1,
      userId: entry.id,
      username: entry.username,
      callsign: entry.callsign,
      avatar: entry.avatar_url,
      role: entry.role,
      level: entry.level,
      rank: entry.rank,
      totalXp: entry.total_xp,
      weeklyXp: entry.weekly_xp,
      streak: entry.streak
    }));

    res.json({ leaderboard });

  } catch (err) {
    console.error('[LEADERBOARD] Global error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/leaderboard/weekly — Weekly top performers
// ─────────────────────────────────────────────────────────────
router.get('/weekly', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    const result = await query(
      `SELECT l.total_xp, l.weekly_xp, l.streak,
              u.id, u.username, u.callsign, u.avatar_url, u.role, u.level, u.rank
       FROM leaderboard l
       JOIN users u ON u.id = l.user_id
       WHERE l.weekly_xp > 0
       ORDER BY l.weekly_xp DESC
       LIMIT $1`,
      [limit]
    );

    const leaderboard = result.rows.map((entry, idx) => ({
      position: idx + 1,
      userId: entry.id,
      username: entry.username,
      callsign: entry.callsign,
      avatar: entry.avatar_url,
      role: entry.role,
      level: entry.level,
      weeklyXp: entry.weekly_xp,
      streak: entry.streak
    }));

    res.json({ leaderboard });

  } catch (err) {
    console.error('[LEADERBOARD] Weekly error:', err);
    res.status(500).json({ error: 'Failed to fetch weekly leaderboard' });
  }
});

export default router;
