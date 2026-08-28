// ============================================================
// V.A.U.L.T — Serverless API Entry Point (Vercel)
// Routes all /api/* requests to the Express application
// ============================================================

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Database
import { testConnection } from '../server/db/index.js';

// Routes
import authRoutes from '../server/routes/auth.js';
import userRoutes from '../server/routes/users.js';
import missionRoutes from '../server/routes/missions.js';
import heistRoutes from '../server/routes/heists.js';
import leaderboardRoutes from '../server/routes/leaderboard.js';
import teamRoutes from '../server/routes/teams.js';
import friendRoutes from '../server/routes/friends.js';

const app = express();
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes — mount with both `/api` prefix and without prefix
const routeList = [
  ['/auth', authRoutes],
  ['/users', userRoutes],
  ['/missions', missionRoutes],
  ['/heists', heistRoutes],
  ['/leaderboard', leaderboardRoutes],
  ['/teams', teamRoutes],
  ['/friends', friendRoutes],
];

routeList.forEach(([path, router]) => {
  app.use(`/api${path}`, router);
  app.use(path, router);
});

// Health Check
const healthHandler = async (req, res) => {
  try {
    const dbConnected = await testConnection().catch(() => false);
    res.json({
      status: 'ok',
      service: 'V.A.U.L.T Serverless API',
      version: '1.0.0',
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);
app.get('/api', (req, res) => res.json({ status: 'online', service: 'V.A.U.L.T Protocol API' }));
app.get('/', (req, res) => res.json({ status: 'online', service: 'V.A.U.L.T Protocol API' }));


// Error handling
app.use((err, req, res, next) => {
  console.error('[API Error]:', err);
  res.status(err.status || 500).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred'
  });
});

// Export for Vercel Serverless Function
export default function handler(req, res) {
  return app(req, res);
}

