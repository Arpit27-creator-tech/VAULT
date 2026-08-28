// ============================================================
// V.A.U.L.T — Main Server Entry Point
// Express REST API + Socket.io Real-Time Engine
// ============================================================

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust multi-path env loading for root and server execution
dotenv.config({ path: path.resolve(__dirname, './.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Database
import { testConnection } from './db/index.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import missionRoutes from './routes/missions.js';
import heistRoutes from './routes/heists.js';
import leaderboardRoutes from './routes/leaderboard.js';
import teamRoutes from './routes/teams.js';
import friendRoutes from './routes/friends.js';

// Socket.io
import { initializeSocketIO } from './sockets/index.js';

// ─── Express App Setup ──────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── Security Middleware ────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for dev; enable in production
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting — 100 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Rate limit exceeded',
    message: 'Too many requests. Please try again in a minute.'
  }
});
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 attempts per 15 min
  message: {
    error: 'Too many auth attempts',
    message: 'Too many login/register attempts. Please try again later.'
  }
});
app.use('/api/auth/', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logging (Dev) ──────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[API] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// ─── API Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/heists', heistRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/friends', friendRoutes);

// ─── Health Check ───────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection().catch(() => false);
  res.json({
    status: 'ok',
    service: 'V.A.U.L.T Backend',
    version: '1.0.0',
    uptime: process.uptime(),
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ─── 404 Handler ────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `No route matches ${req.method} ${req.originalUrl}`
  });
});

// ─── Global Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[SERVER] Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred.'
  });
});

// ─── Initialize Socket.io ───────────────────────────────────
const io = initializeSocketIO(server);

// ─── Start Server ───────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 5000;

server.listen(PORT, async () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║                                                  ║');
  console.log('║   🛡️  V.A.U.L.T Backend Server                   ║');
  console.log('║   Virtual Academic Underground Learning Team      ║');
  console.log('║                                                  ║');
  console.log(`║   🌐 REST API:    http://localhost:${PORT}/api      ║`);
  console.log(`║   🔌 WebSocket:   ws://localhost:${PORT}            ║`);
  console.log(`║   💚 Health:      http://localhost:${PORT}/api/health║`);
  console.log('║                                                  ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');

  // Test database connection
  const dbOk = await testConnection();
  if (!dbOk) {
    console.warn('⚠️  Database connection failed. Server is running but DB operations will fail.');
    console.warn('   Make sure PostgreSQL is running and DATABASE_URL is configured in .env');
  }
});

export default server;
