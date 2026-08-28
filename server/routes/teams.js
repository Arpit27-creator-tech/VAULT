// ============================================================
// V.A.U.L.T — Team / Squad Routes
// ============================================================

import { Router } from 'express';
import { query, transaction } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * Generate a team invite code like "SYNDICATE-A7B3"
 */
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SYNDICATE-';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ─────────────────────────────────────────────────────────────
// POST /api/teams — Create a new team
// ─────────────────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, motto, emblem } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Team name must be at least 2 characters' });
    }

    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await query(`SELECT id FROM teams WHERE invite_code = $1`, [inviteCode]);
      if (existing.rows.length === 0) break;
      inviteCode = generateInviteCode();
      attempts++;
    }

    const result = await transaction(async (client) => {
      // Create team
      const teamResult = await client.query(
        `INSERT INTO teams (name, motto, emblem, invite_code, leader_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [name.trim(), motto || '', emblem || '🌲', inviteCode, req.user.id]
      );

      const team = teamResult.rows[0];

      // Add creator as first member
      await client.query(
        `INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)`,
        [team.id, req.user.id]
      );

      return team;
    });

    res.status(201).json({
      team: {
        id: result.id,
        name: result.name,
        motto: result.motto,
        emblem: result.emblem,
        inviteCode: result.invite_code
      }
    });

  } catch (err) {
    console.error('[TEAMS] Create error:', err);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/teams/:id — Get team details + members
// ─────────────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const teamResult = await query(
      `SELECT t.*, u.username AS leader_name, u.callsign AS leader_callsign
       FROM teams t
       JOIN users u ON u.id = t.leader_id
       WHERE t.id = $1`,
      [id]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const team = teamResult.rows[0];

    // Get members
    const membersResult = await query(
      `SELECT u.id, u.username, u.callsign, u.avatar_url, u.role, u.level, u.xp,
              tm.joined_at,
              CASE WHEN u.id = $2 THEN TRUE ELSE FALSE END AS is_leader
       FROM team_members tm
       JOIN users u ON u.id = tm.user_id
       WHERE tm.team_id = $1
       ORDER BY tm.joined_at ASC`,
      [id, team.leader_id]
    );

    res.json({
      team: {
        id: team.id,
        name: team.name,
        motto: team.motto,
        emblem: team.emblem,
        inviteCode: team.invite_code,
        leader: { username: team.leader_name, callsign: team.leader_callsign },
        members: membersResult.rows.map(m => ({
          userId: m.id,
          username: m.username,
          callsign: m.callsign,
          avatar: m.avatar_url,
          role: m.role,
          level: m.level,
          isLeader: m.is_leader,
          joinedAt: m.joined_at
        }))
      }
    });

  } catch (err) {
    console.error('[TEAMS] Get error:', err);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/teams/join — Join a team by invite code
// ─────────────────────────────────────────────────────────────
router.post('/join', authenticate, async (req, res) => {
  try {
    const { invite_code } = req.body;

    if (!invite_code) {
      return res.status(400).json({ error: 'Invite code is required' });
    }

    const teamResult = await query(
      `SELECT id, name FROM teams WHERE invite_code = $1`,
      [invite_code.toUpperCase()]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'No team found with that invite code' });
    }

    const team = teamResult.rows[0];

    // Check if already a member
    const existing = await query(
      `SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2`,
      [team.id, req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You are already a member of this team' });
    }

    // Check team size (max 8 members)
    const memberCount = await query(
      `SELECT COUNT(*) AS count FROM team_members WHERE team_id = $1`,
      [team.id]
    );

    if (parseInt(memberCount.rows[0].count) >= 8) {
      return res.status(409).json({ error: 'Team is full (8/8 members)' });
    }

    await query(
      `INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)`,
      [team.id, req.user.id]
    );

    res.json({ message: `Joined team "${team.name}" successfully`, teamId: team.id });

  } catch (err) {
    console.error('[TEAMS] Join error:', err);
    res.status(500).json({ error: 'Failed to join team' });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/teams/:id/members — Leave a team
// ─────────────────────────────────────────────────────────────
router.delete('/:id/members', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if leader (leaders can't leave, they must transfer or delete the team)
    const team = await query(`SELECT leader_id FROM teams WHERE id = $1`, [id]);
    if (team.rows.length > 0 && team.rows[0].leader_id === req.user.id) {
      return res.status(400).json({ error: 'Team leader cannot leave. Transfer leadership or delete the team.' });
    }

    await query(
      `DELETE FROM team_members WHERE team_id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    res.json({ message: 'Left the team successfully' });

  } catch (err) {
    console.error('[TEAMS] Leave error:', err);
    res.status(500).json({ error: 'Failed to leave team' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/teams/my/teams — Get all teams the current user belongs to
// ─────────────────────────────────────────────────────────────
router.get('/my/teams', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT t.id, t.name, t.motto, t.emblem, t.invite_code,
              (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) AS member_count
       FROM teams t
       JOIN team_members tm ON tm.team_id = t.id
       WHERE tm.user_id = $1
       ORDER BY tm.joined_at DESC`,
      [req.user.id]
    );

    res.json({
      teams: result.rows.map(t => ({
        id: t.id,
        name: t.name,
        motto: t.motto,
        emblem: t.emblem,
        inviteCode: t.invite_code,
        memberCount: parseInt(t.member_count)
      }))
    });

  } catch (err) {
    console.error('[TEAMS] My teams error:', err);
    res.status(500).json({ error: 'Failed to fetch your teams' });
  }
});

export default router;
