// ============================================================
// V.A.U.L.T — Socket.io Initialization & Auth
// ============================================================

import { Server } from 'socket.io';
import { verifyToken } from '../middleware/auth.js';
import { setupLobbyManager } from './lobbyManager.js';
import { setupHeistEngine } from './heistEngine.js';
import { setupPresenceManager } from './presenceManager.js';

/**
 * Initialize Socket.io on the given HTTP server.
 * Sets up JWT authentication middleware and all event handlers.
 * 
 * @param {import('http').Server} httpServer
 * @returns {Server} the Socket.io server instance
 */
export function initializeSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow all origins for dev/production flex (web, mobile, tunnels)
        callback(null, true);
      },
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // ─── Authentication Middleware (JWT + Guest Support) ──────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        // Authenticated user from JWT
        socket.userId = decoded.id;
        socket.userEmail = decoded.email;
        socket.username = decoded.username || decoded.callsign || 'Operative';
        socket.isGuest = false;
        return next();
      }
    }

    // Guest / Anonymous operative fallback
    const guestUsername = socket.handshake.auth?.username || socket.handshake.query?.username || `Ranger_${Math.floor(100 + Math.random() * 900)}`;
    const guestId = socket.handshake.auth?.userId || socket.handshake.query?.userId || `guest_${Math.random().toString(36).substring(2, 9)}`;

    socket.userId = guestId;
    socket.userEmail = `${guestUsername.toLowerCase().replace(/\s+/g, '')}@guest.vault`;
    socket.username = guestUsername;
    socket.isGuest = true;

    next();
  });

  // ─── Connection Handler ───────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`[SOCKET] User connected: ${socket.username} (${socket.userId})${socket.isGuest ? ' [GUEST]' : ''}`);

    // Join a personal room for direct messages
    socket.join(`user:${socket.userId}`);

    // Setup all event handlers
    setupLobbyManager(io, socket);
    setupHeistEngine(io, socket);
    setupPresenceManager(io, socket);

    // ─── Disconnect ─────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`[SOCKET] User disconnected: ${socket.username} (${reason})`);
    });

    // ─── Error Handler ──────────────────────────────────────
    socket.on('error', (err) => {
      console.error(`[SOCKET] Error for ${socket.username}:`, err.message);
    });
  });

  console.log('[SOCKET] Socket.io initialized with JWT auth & Guest support');
  return io;
}
