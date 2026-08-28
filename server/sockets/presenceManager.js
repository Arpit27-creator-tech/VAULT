// ============================================================
// V.A.U.L.T — Presence Manager (Online Status & Activity)
// Tracks who is online and broadcasts presence to friends
// ============================================================

import { query } from '../db/index.js';

// In-memory presence store: userId -> { socketId, status, activity, lastSeen }
const onlineUsers = new Map();

/**
 * Setup presence tracking socket events.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
export function setupPresenceManager(io, socket) {

  // ─── Mark user as online on connection ────────────────────
  onlineUsers.set(socket.userId, {
    socketId: socket.id,
    username: socket.username,
    status: 'ONLINE',
    activity: 'In the Lobby',
    connectedAt: Date.now(),
    lastSeen: Date.now()
  });

  // Notify friends that this user is now online
  broadcastPresenceToFriends(io, socket.userId, 'ONLINE', 'Connected to V.A.U.L.T');

  // ─────────────────────────────────────────────────────────
  // presence:update — Player updates their activity status
  // ─────────────────────────────────────────────────────────
  socket.on('presence:update', (data) => {
    const { status, activity } = data;

    const presence = onlineUsers.get(socket.userId);
    if (presence) {
      presence.status = status || 'ONLINE';
      presence.activity = activity || 'In the Lobby';
      presence.lastSeen = Date.now();
    }

    broadcastPresenceToFriends(io, socket.userId, status, activity);
  });

  // ─────────────────────────────────────────────────────────
  // presence:get-friends — Get online status of all friends
  // ─────────────────────────────────────────────────────────
  socket.on('presence:get-friends', async (data, callback) => {
    try {
      // Fetch friend list from DB
      const friendsResult = await query(
        `SELECT 
           CASE 
             WHEN f.user_id = $1 THEN f.friend_id
             ELSE f.user_id
           END AS friend_id,
           u.username, u.callsign, u.avatar_url, u.role
         FROM friends f
         JOIN users u ON u.id = CASE 
                                  WHEN f.user_id = $1 THEN f.friend_id
                                  ELSE f.user_id
                                END
         WHERE (f.user_id = $1 OR f.friend_id = $1) AND f.status = 'accepted'`,
        [socket.userId]
      );

      const friendPresence = friendsResult.rows.map(f => {
        const online = onlineUsers.get(f.friend_id);
        return {
          userId: f.friend_id,
          username: f.username,
          callsign: f.callsign,
          avatar: f.avatar_url,
          role: f.role,
          status: online ? online.status : 'OFFLINE',
          activity: online ? online.activity : `Last seen recently`,
          isOnline: !!online
        };
      });

      callback?.({ friends: friendPresence });

    } catch (err) {
      console.error('[PRESENCE] Get friends error:', err);
      callback?.({ error: 'Failed to fetch friend presence' });
    }
  });

  // ─── Handle disconnect — mark as offline ──────────────────
  socket.on('disconnect', () => {
    onlineUsers.delete(socket.userId);
    broadcastPresenceToFriends(io, socket.userId, 'OFFLINE', 'Disconnected');
  });
}

/**
 * Broadcast a user's presence update to all their online friends.
 */
async function broadcastPresenceToFriends(io, userId, status, activity) {
  try {
    const friendsResult = await query(
      `SELECT 
         CASE 
           WHEN f.user_id = $1 THEN f.friend_id
           ELSE f.user_id
         END AS friend_id
       FROM friends f
       WHERE (f.user_id = $1 OR f.friend_id = $1) AND f.status = 'accepted'`,
      [userId]
    );

    const userPresence = onlineUsers.get(userId);

    for (const row of friendsResult.rows) {
      const friendOnline = onlineUsers.get(row.friend_id);
      if (friendOnline) {
        io.to(`user:${row.friend_id}`).emit('presence:friend-update', {
          userId,
          username: userPresence?.username || 'Unknown',
          status,
          activity
        });
      }
    }
  } catch (err) {
    console.error('[PRESENCE] Broadcast error:', err);
  }
}

/**
 * Get the count of currently online users.
 * @returns {number}
 */
export function getOnlineCount() {
  return onlineUsers.size;
}
