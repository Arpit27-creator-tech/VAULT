// ============================================================
// V.A.U.L.T — Friends Routes (Social System)
// ============================================================

import { Router } from 'express';
import { query } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ─────────────────────────────────────────────────────────────
// GET /api/friends — List all friends (accepted + pending)
// ─────────────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT f.id, f.status, f.created_at,
              CASE 
                WHEN f.user_id = $1 THEN f.friend_id
                ELSE f.user_id
              END AS other_id,
              CASE 
                WHEN f.user_id = $1 THEN 'sent'
                ELSE 'received'
              END AS direction,
              u.username, u.callsign, u.avatar_url, u.role, u.level
       FROM friends f
       JOIN users u ON u.id = CASE 
                                WHEN f.user_id = $1 THEN f.friend_id
                                ELSE f.user_id
                              END
       WHERE (f.user_id = $1 OR f.friend_id = $1)
       ORDER BY f.status ASC, f.created_at DESC`,
      [req.user.id]
    );

    const friends = result.rows.map(f => ({
      id: f.id,
      userId: f.other_id,
      username: f.username,
      callsign: f.callsign,
      avatar: f.avatar_url,
      role: f.role,
      level: f.level,
      status: f.status,
      direction: f.direction,
      createdAt: f.created_at
    }));

    // Separate into categories
    const accepted = friends.filter(f => f.status === 'accepted');
    const pendingReceived = friends.filter(f => f.status === 'pending' && f.direction === 'received');
    const pendingSent = friends.filter(f => f.status === 'pending' && f.direction === 'sent');

    res.json({
      friends: accepted,
      pendingReceived,
      pendingSent,
      totalFriends: accepted.length
    });

  } catch (err) {
    console.error('[FRIENDS] List error:', err);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/friends/request — Send a friend request by callsign or username
// ─────────────────────────────────────────────────────────────
router.post('/request', authenticate, async (req, res) => {
  try {
    const { callsign } = req.body;

    if (!callsign || !callsign.trim()) {
      return res.status(400).json({ error: 'Callsign or username is required' });
    }

    // Find the target user
    const targetResult = await query(
      `SELECT id, callsign, username FROM users WHERE LOWER(callsign) = $1 OR LOWER(username) = $1`,
      [callsign.trim().toLowerCase()]
    );

    if (targetResult.rows.length === 0) {
      return res.status(404).json({ error: `No operative found with callsign "${callsign}"` });
    }

    const targetUser = targetResult.rows[0];

    if (targetUser.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot add yourself as a friend' });
    }

    // Check if friendship already exists (in either direction)
    const existing = await query(
      `SELECT id, status FROM friends
       WHERE (user_id = $1 AND friend_id = $2)
          OR (user_id = $2 AND friend_id = $1)`,
      [req.user.id, targetUser.id]
    );

    if (existing.rows.length > 0) {
      const status = existing.rows[0].status;
      if (status === 'accepted') {
        return res.status(409).json({ error: 'You are already friends' });
      }
      if (status === 'pending') {
        return res.status(409).json({ error: 'Friend request already pending' });
      }
    }

    // Create friend request
    await query(
      `INSERT INTO friends (user_id, friend_id, status) VALUES ($1, $2, 'pending')`,
      [req.user.id, targetUser.id]
    );

    res.status(201).json({
      message: `Friend request sent to ${targetUser.callsign || targetUser.username}`,
      targetUser: { id: targetUser.id, callsign: targetUser.callsign }
    });

  } catch (err) {
    console.error('[FRIENDS] Request error:', err);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/friends/:id/accept — Accept a friend request
// ─────────────────────────────────────────────────────────────
router.put('/:id/accept', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify this is a pending request sent TO the current user
    const request = await query(
      `SELECT * FROM friends WHERE id = $1 AND friend_id = $2 AND status = 'pending'`,
      [id, req.user.id]
    );

    if (request.rows.length === 0) {
      return res.status(404).json({ error: 'Friend request not found or already handled' });
    }

    await query(
      `UPDATE friends SET status = 'accepted' WHERE id = $1`,
      [id]
    );

    res.json({ message: 'Friend request accepted!' });

  } catch (err) {
    console.error('[FRIENDS] Accept error:', err);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/friends/:id — Remove a friend or decline a request
// ─────────────────────────────────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM friends 
       WHERE id = $1 AND (user_id = $2 OR friend_id = $2)
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    res.json({ message: 'Friend removed successfully' });

  } catch (err) {
    console.error('[FRIENDS] Remove error:', err);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

export default router;
