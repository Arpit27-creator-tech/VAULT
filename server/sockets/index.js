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
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // ─── JWT Authentication Middleware ─────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication required: No token provided'));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Authentication failed: Invalid or expired token'));
    }

    // Attach user info to socket
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    socket.username = decoded.username;

    next();
  });

  // ─── Connection Handler ───────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`[SOCKET] User connected: ${socket.username} (${socket.userId})`);

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

  console.log('[SOCKET] Socket.io initialized with JWT auth');
  return io;
}
