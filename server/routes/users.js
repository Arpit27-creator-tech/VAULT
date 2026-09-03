// ============================================================
// V.A.U.L.T — User Routes (Profile, Stats, History)
// ============================================================

import { Router } from 'express';
import { query } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const getAgentId = (user) => {
  const shortId = (user.id || '').replace(/-/g, '').substring(0, 8).toUpperCase() || '77418902';
  return user.agent_id || `VAULT-${shortId}`;
};

// ─────────────────────────────────────────────────────────────
// GET /api/users/search — Search operatives by Unique ID, username, or callsign
// ─────────────────────────────────────────────────────────────
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || req.query.query || '').trim().toLowerCase();
    if (!q) {
      // Return top 15 operatives if query is empty
      const result = await query(
        `SELECT u.id, u.username, u.callsign, u.avatar_url, u.role, u.level, u.xp, u.rank, u.badges,
                s.missions_completed, s.vaults_cracked, s.alarms_tripped, s.win_rate
         FROM users u
         LEFT JOIN user_stats s ON s.user_id = u.id
         ORDER BY u.xp DESC
         LIMIT 15`
      );

      return res.json({
        users: result.rows.map(u => ({
          id: u.id,
          agentId: getAgentId(u),
          username: u.username,
          callsign: u.callsign,
          avatar: u.avatar_url,
          role: u.role,
          level: u.level,
          xp: u.xp,
          rank: u.rank,
          badges: u.badges,
          stats: {
            missionsCompleted: u.missions_completed || 0,
            vaultsCracked: u.vaults_cracked || 0,
            winRate: u.win_rate || 100
          }
        }))
      });
    }

    const cleanHex = q.replace(/^vault-|^agent-|^op-/i, '').replace(/[^a-f0-9]/gi, '');
    const pattern = `%${q}%`;
    const hexPattern = cleanHex ? `%${cleanHex}%` : '%';

    const result = await query(
      `SELECT u.id, u.username, u.callsign, u.avatar_url, u.role, u.level, u.xp, u.rank, u.badges,
              s.missions_completed, s.vaults_cracked, s.alarms_tripped, s.win_rate
       FROM users u
       LEFT JOIN user_stats s ON s.user_id = u.id
       WHERE LOWER(u.username) LIKE $1
          OR LOWER(u.callsign) LIKE $1
          OR REPLACE(LOWER(u.id::text), '-', '') LIKE $2
          OR LOWER('vault-' || SUBSTRING(REPLACE(u.id::text, '-', ''), 1, 6)) LIKE $1
       ORDER BY u.xp DESC
       LIMIT 20`,
      [pattern, hexPattern]
    );

    res.json({
      users: result.rows.map(u => ({
        id: u.id,
        agentId: getAgentId(u),
        username: u.username,
        callsign: u.callsign,
        avatar: u.avatar_url,
        role: u.role,
        level: u.level,
        xp: u.xp,
        rank: u.rank,
        badges: u.badges,
        stats: {
          missionsCompleted: u.missions_completed || 0,
          vaultsCracked: u.vaults_cracked || 0,
          winRate: u.win_rate || 100
        }
      }))
    });

  } catch (err) {
    console.error('[USERS] Search error:', err);
    res.status(500).json({ error: 'Search operation failed' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/users/tag/:agentId — Get user by unique Agent ID (e.g. VAULT-9482)
// ─────────────────────────────────────────────────────────────
router.get('/tag/:agentId', async (req, res) => {
  try {
    const rawTag = req.params.agentId.trim().toUpperCase();
    const hexCode = rawTag.replace(/^VAULT-|^AGENT-|^OP-/i, '').toLowerCase();

    const result = await query(
      `SELECT u.id, u.username, u.callsign, u.avatar_url, u.role, u.level, u.xp, u.rank, u.badges, u.created_at,
              s.missions_completed, s.vaults_cracked, s.alarms_tripped, s.win_rate,
              s.fastest_time, s.cs_mastery, s.physics_mastery, s.chem_mastery, s.math_mastery, s.crypto_mastery
       FROM users u
       LEFT JOIN user_stats s ON s.user_id = u.id
       WHERE REPLACE(LOWER(u.id::text), '-', '') LIKE $1
          OR LOWER(u.username) = LOWER($2)
       LIMIT 1`,
      [`${hexCode}%`, rawTag]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Operative not found with that Agent ID' });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        agentId: getAgentId(user),
        username: user.username,
        callsign: user.callsign,
        avatar: user.avatar_url,
        role: user.role,
        level: user.level,
        xp: user.xp,
        rank: user.rank,
        badges: user.badges,
        createdAt: user.created_at,
        stats: {
          missionsCompleted: user.missions_completed || 0,
          vaultsCracked: user.vaults_cracked || 0,
          alarmsTripped: user.alarms_tripped || 0,
          winRate: user.win_rate || 100,
          fastestTime: user.fastest_time || '--',
          csMastery: user.cs_mastery || 50,
          physicsMastery: user.physics_mastery || 50,
          chemMastery: user.chem_mastery || 50,
          mathMastery: user.math_mastery || 50,
          cryptoMastery: user.crypto_mastery || 50
        }
      }
    });

  } catch (err) {
    console.error('[USERS] Get by tag error:', err);
    res.status(500).json({ error: 'Failed to retrieve operative by Agent ID' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/users/:id — Get a user's public profile
// ─────────────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT u.id, u.username, u.callsign, u.avatar_url, u.role, u.level, u.xp, u.rank, u.badges, u.created_at,
              s.missions_completed, s.vaults_cracked, s.alarms_tripped, s.win_rate,
              s.fastest_time, s.cs_mastery, s.physics_mastery, s.chem_mastery, s.math_mastery, s.crypto_mastery
       FROM users u
       LEFT JOIN user_stats s ON s.user_id = u.id
       WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        agentId: getAgentId(user),
        username: user.username,
        callsign: user.callsign,
        avatar: user.avatar_url,
        role: user.role,
        level: user.level,
        xp: user.xp,
        rank: user.rank,
        badges: user.badges,
        createdAt: user.created_at,
        stats: {
          missionsCompleted: user.missions_completed || 0,
          vaultsCracked: user.vaults_cracked || 0,
          alarmsTripped: user.alarms_tripped || 0,
          winRate: user.win_rate || 100,
          fastestTime: user.fastest_time || '--',
          csMastery: user.cs_mastery || 50,
          physicsMastery: user.physics_mastery || 50,
          chemMastery: user.chem_mastery || 50,
          mathMastery: user.math_mastery || 50,
          cryptoMastery: user.crypto_mastery || 50
        }
      }
    });

  } catch (err) {
    console.error('[USERS] Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/users/:id — Update own profile
// ─────────────────────────────────────────────────────────────
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only update their own profile
    if (req.user.id !== id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You can only update your own profile.' });
    }

    const { callsign, avatar_url, role, notification_prefs, equipped_theme } = req.body;

    const fields = [];
    const values = [];
    let paramIdx = 1;

    if (callsign) {
      fields.push(`callsign = $${paramIdx++}`);
      values.push(callsign);
    }
    if (avatar_url) {
      fields.push(`avatar_url = $${paramIdx++}`);
      values.push(avatar_url);
    }
    if (role) {
      fields.push(`role = $${paramIdx++}`);
      values.push(role);
    }
    if (notification_prefs) {
      fields.push(`notification_prefs = $${paramIdx++}::jsonb`);
      values.push(JSON.stringify(notification_prefs));
    }
    if (equipped_theme) {
      // Validate against real unlock conditions server-side, so equipping
      // a theme can't be spoofed by calling this endpoint directly.
      const VALID_THEMES = ['default', 'ember', 'crimson', 'azure', 'golden'];
      if (!VALID_THEMES.includes(equipped_theme)) {
        return res.status(400).json({ error: 'Unknown theme' });
      }
      if (equipped_theme !== 'default') {
        const userLevelResult = await query('SELECT level FROM users WHERE id = $1', [id]);
        const level = userLevelResult.rows[0]?.level || 1;
        const statsRes = await query('SELECT missions_completed, vaults_cracked FROM user_stats WHERE user_id = $1', [id]);
        const missionsCompleted = statsRes.rows[0]?.missions_completed || 0;
        const vaultsCracked = statsRes.rows[0]?.vaults_cracked || 0;
        const flawlessRes = await query(
          `SELECT EXISTS(SELECT 1 FROM heist_history WHERE user_id = $1 AND result = 'VICTORY' AND alarms_tripped = 0) AS has_flawless`,
          [id]
        );
        const hasFlawless = flawlessRes.rows[0]?.has_flawless || false;

        const conditionsMet = {
          ember: level >= 3,
          crimson: hasFlawless,
          azure: missionsCompleted >= 10,
          golden: vaultsCracked >= 25
        };
        if (!conditionsMet[equipped_theme]) {
          return res.status(403).json({ error: 'Theme not yet unlocked' });
        }
      }
      fields.push(`equipped_theme = $${paramIdx++}`);
      values.push(equipped_theme);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIdx} 
       RETURNING id, username, callsign, avatar_url, role, level, xp, rank, notification_prefs, equipped_theme`,
      values
    );

    res.json({ user: { ...result.rows[0], notificationPrefs: result.rows[0].notification_prefs, equippedTheme: result.rows[0].equipped_theme } });

  } catch (err) {
    console.error('[USERS] Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/users/:id/stats — Detailed skill analytics
// ─────────────────────────────────────────────────────────────
router.get('/:id/stats', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM user_stats WHERE user_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stats not found' });
    }

    const s = result.rows[0];

    res.json({
      stats: {
        missionsCompleted: s.missions_completed,
        vaultsCracked: s.vaults_cracked,
        alarmsTripped: s.alarms_tripped,
        winRate: s.win_rate,
        fastestTime: s.fastest_time,
        totalTimePlayed: s.total_time_played,
        csMastery: s.cs_mastery,
        physicsMastery: s.physics_mastery,
        chemMastery: s.chem_mastery,
        mathMastery: s.math_mastery,
        cryptoMastery: s.crypto_mastery
      }
    });

  } catch (err) {
    console.error('[USERS] Get stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/users/:id/unlocks — Which vault themes this user has
// unlocked, computed from real stats (not stored/faked).
// ─────────────────────────────────────────────────────────────
router.get('/:id/unlocks', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await query('SELECT level FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const level = userResult.rows[0].level || 1;

    const statsResult = await query(
      'SELECT missions_completed, vaults_cracked FROM user_stats WHERE user_id = $1',
      [id]
    );
    const missionsCompleted = statsResult.rows[0]?.missions_completed || 0;
    const vaultsCracked = statsResult.rows[0]?.vaults_cracked || 0;

    const flawlessResult = await query(
      `SELECT EXISTS(
         SELECT 1 FROM heist_history
         WHERE user_id = $1 AND result = 'VICTORY' AND alarms_tripped = 0
       ) AS has_flawless`,
      [id]
    );
    const hasFlawlessVictory = flawlessResult.rows[0]?.has_flawless || false;

    const unlocked = ['default'];
    if (level >= 3) unlocked.push('ember');
    if (hasFlawlessVictory) unlocked.push('crimson');
    if (missionsCompleted >= 10) unlocked.push('azure');
    if (vaultsCracked >= 25) unlocked.push('golden');

    res.json({ unlocked, progress: { level, missionsCompleted, vaultsCracked, hasFlawlessVictory } });
  } catch (err) {
    console.error('[USERS] Get unlocks error:', err);
    res.status(500).json({ error: 'Failed to fetch unlocks' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/users/:id/history — Paginated heist history
// ─────────────────────────────────────────────────────────────
router.get('/:id/history', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT id, mission_title, role, result, xp_earned, time_elapsed, accuracy, alarms_tripped, completed_at
       FROM heist_history
       WHERE user_id = $1
       ORDER BY completed_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) AS total FROM heist_history WHERE user_id = $1`,
      [id]
    );

    res.json({
      history: result.rows.map(h => ({
        id: h.id,
        mission: h.mission_title,
        role: h.role,
        result: h.result,
        xp: `+${h.xp_earned} XP`,
        time: h.time_elapsed,
        accuracy: h.accuracy,
        alarmsTripped: h.alarms_tripped,
        date: h.completed_at
      })),
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      }
    });

  } catch (err) {
    console.error('[USERS] Get history error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
