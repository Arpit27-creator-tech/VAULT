// ============================================================
// V.A.U.L.T — Auth Routes (Register / Login / Me)
// ============================================================

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query, transaction } from '../db/index.js';
import { authenticate, generateToken } from '../middleware/auth.js';
import { 
  generateVerificationCode, 
  sendVerificationEmail,
  sendPasswordResetEmail
} from '../services/emailService.js';

const router = Router();

// ─────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// Generates password reset token + code and dispatches email
// ─────────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email address is required.'
      });
    }

    // Check if user exists
    const userCheck = await query('SELECT id, username, email FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (userCheck.rows.length === 0) {
      return res.json({
        success: true,
        message: 'If an account exists with that email, a password reset link and code have been sent.'
      });
    }

    // Invalidate existing reset codes for this email
    await query('DELETE FROM password_resets WHERE email = $1', [email.toLowerCase().trim()]);

    const code = generateVerificationCode();
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await query(
      'INSERT INTO password_resets (email, token, code, expires_at) VALUES ($1, $2, $3, $4)',
      [email.toLowerCase().trim(), token, code, expiresAt]
    );

    const clientOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
    const resetUrl = `${clientOrigin}?resetToken=${token}&email=${encodeURIComponent(email.toLowerCase().trim())}`;

    try {
      await sendPasswordResetEmail(email.toLowerCase().trim(), code, resetUrl);
    } catch (mailErr) {
      console.error(`[AUTH] Reset email delivery error:`, mailErr.message);
    }

    res.json({
      success: true,
      message: 'Password reset code has been sent to your email.'
    });
  } catch (err) {
    console.error('[AUTH] Forgot password error:', err);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to process password reset request.'
    });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// Validates code/token and updates user password
// ─────────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, token, newPassword } = req.body;

    if (!email || (!code && !token) || !newPassword) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'Email, verification code/token, and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Weak password',
        message: 'Password must be at least 6 characters.'
      });
    }

    let resetRecord;
    if (token) {
      const resToken = await query(
        `SELECT * FROM password_resets 
         WHERE email = $1 AND token = $2 AND is_used = FALSE AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [email.toLowerCase().trim(), token.trim()]
      );
      resetRecord = resToken.rows[0];
    } else if (code) {
      const resCode = await query(
        `SELECT * FROM password_resets 
         WHERE email = $1 AND code = $2 AND is_used = FALSE AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [email.toLowerCase().trim(), code.trim()]
      );
      resetRecord = resCode.rows[0];
    }

    if (!resetRecord) {
      return res.status(400).json({
        error: 'Invalid or expired reset code',
        message: 'The reset code or link is invalid or has expired. Please request a new one.'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user password and invalidate reset token
    await transaction(async (client) => {
      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2',
        [passwordHash, email.toLowerCase().trim()]
      );
      await client.query('UPDATE password_resets SET is_used = TRUE WHERE id = $1', [resetRecord.id]);
    });

    res.json({
      success: true,
      message: 'Password has been reset successfully! You can now sign in with your new password.'
    });
  } catch (err) {
    console.error('[AUTH] Reset password error:', err);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to reset password.'
    });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/auth/send-verification
// Generates and sends a 6-digit OTP code to the user's email
// ─────────────────────────────────────────────────────────────
router.post('/send-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email address is required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address.'
      });
    }

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: 'User exists',
        message: 'An account with this email already exists. Please sign in instead.'
      });
    }

    // Invalidate prior codes for this email
    await query('DELETE FROM email_verifications WHERE email = $1', [email.toLowerCase()]);

    // Generate 6-digit code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save to database
    await query(
      'INSERT INTO email_verifications (email, code, expires_at) VALUES ($1, $2, $3)',
      [email.toLowerCase(), code, expiresAt]
    );

    // Dispatch email (awaited so serverless execution keeps connection open)
    try {
      await sendVerificationEmail(email.toLowerCase(), code);
    } catch (mailErr) {
      console.error(`[AUTH] Email delivery error for ${email}:`, mailErr.message);
    }

    res.json({
      success: true,
      message: `6-digit verification code sent to ${email}`,
      previewCode: code
    });
  } catch (err) {
    console.error('[AUTH] Send verification error:', err);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to send verification code.'
    });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/auth/verify-code
// Validates the 6-digit OTP code against the database
// ─────────────────────────────────────────────────────────────
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'Email and verification code are required.'
      });
    }

    const result = await query(
      `SELECT * FROM email_verifications 
       WHERE email = $1 AND code = $2 AND is_used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email.toLowerCase(), code.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: 'Invalid or expired code',
        message: 'The 6-digit verification code is invalid or has expired. Please request a new code.'
      });
    }

    res.json({
      success: true,
      verified: true,
      message: 'Email verified successfully!'
    });
  } catch (err) {
    console.error('[AUTH] Verify code error:', err);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to verify code.'
    });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
// Creates a new user account with hashed password
// ─────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, code } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'Username, email, and password are required.'
      });
    }

    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({
        error: 'Invalid username',
        message: 'Username must be between 3 and 50 characters.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Weak password',
        message: 'Password must be at least 6 characters.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address.'
      });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase(), username.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'User exists',
        message: 'An account with that email or username already exists.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user + stats + leaderboard entry in a transaction
    const result = await transaction(async (client) => {
      // If code was provided, verify and mark code as used
      let isVerified = false;
      if (code) {
        const verifyCheck = await client.query(
          `SELECT id FROM email_verifications 
           WHERE email = $1 AND code = $2 AND is_used = FALSE AND expires_at > NOW()`,
          [email.toLowerCase(), code.trim()]
        );
        if (verifyCheck.rows.length > 0) {
          isVerified = true;
          await client.query('UPDATE email_verifications SET is_used = TRUE WHERE id = $1', [verifyCheck.rows[0].id]);
        }
      }

      // Insert user
      const userResult = await client.query(
        `INSERT INTO users (username, email, password_hash, callsign, xp, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, username, email, callsign, avatar_url, role, level, xp, rank, badges, is_verified, created_at`,
        [username.toLowerCase(), email.toLowerCase(), passwordHash, username, 1500, isVerified]
      );

      const user = userResult.rows[0];

      // Create user stats
      await client.query(
        `INSERT INTO user_stats (user_id, cs_mastery, physics_mastery, chem_mastery, math_mastery, crypto_mastery)
         VALUES ($1, 50, 50, 50, 50, 50)`,
        [user.id]
      );

      // Create leaderboard entry
      await client.query(
        `INSERT INTO leaderboard (user_id, total_xp, weekly_xp, streak)
         VALUES ($1, $2, $2, 0)`,
        [user.id, 1500]
      );

      return user;
    });

    // Generate JWT
    const token = generateToken(result);

    // Build response profile (matches frontend expected shape)
    const profile = buildUserProfile(result);

    res.status(201).json({
      token,
      user: profile
    });

  } catch (err) {
    console.error('[AUTH] Registration error:', err);
    res.status(500).json({
      error: 'Server error',
      message: 'An unexpected error occurred during registration.'
    });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// Authenticates by email/username + password
// ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'Email/username and password are required.'
      });
    }

    // Find user by email or username
    const result = await query(
      `SELECT u.*, 
              s.missions_completed, s.vaults_cracked, s.alarms_tripped, s.win_rate,
              s.fastest_time, s.cs_mastery, s.physics_mastery, s.chem_mastery, s.math_mastery, s.crypto_mastery
       FROM users u
       LEFT JOIN user_stats s ON s.user_id = u.id
       WHERE u.email = $1 OR u.username = $1`,
      [identifier.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'No account found with that email or username.'
      });
    }

    const user = result.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Incorrect password.'
      });
    }

    // Generate JWT
    const token = generateToken(user);

    // Fetch heist history
    const historyResult = await query(
      `SELECT mission_title, role, result, xp_earned, time_elapsed, completed_at
       FROM heist_history
       WHERE user_id = $1
       ORDER BY completed_at DESC
       LIMIT 20`,
      [user.id]
    );

    const profile = buildUserProfile(user, historyResult.rows);

    res.json({
      token,
      user: profile
    });

  } catch (err) {
    console.error('[AUTH] Login error:', err);
    res.status(500).json({
      error: 'Server error',
      message: 'An unexpected error occurred during login.'
    });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/auth/me
// Returns the current user's profile from their JWT
// ─────────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT u.*, 
              s.missions_completed, s.vaults_cracked, s.alarms_tripped, s.win_rate,
              s.fastest_time, s.cs_mastery, s.physics_mastery, s.chem_mastery, s.math_mastery, s.crypto_mastery
       FROM users u
       LEFT JOIN user_stats s ON s.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User account no longer exists.'
      });
    }

    const user = result.rows[0];

    // Fetch history
    const historyResult = await query(
      `SELECT mission_title, role, result, xp_earned, time_elapsed, completed_at
       FROM heist_history
       WHERE user_id = $1
       ORDER BY completed_at DESC
       LIMIT 20`,
      [user.id]
    );

    const profile = buildUserProfile(user, historyResult.rows);

    res.json({ user: profile });

  } catch (err) {
    console.error('[AUTH] /me error:', err);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch user profile.'
    });
  }
});

// ─────────────────────────────────────────────────────────────
// Helper: Build frontend-compatible user profile object
// ─────────────────────────────────────────────────────────────
function buildUserProfile(user, history = []) {
  const shortId = (user.id || '').replace(/-/g, '').substring(0, 8).toUpperCase() || '77418902';
  const agentId = user.agent_id || `VAULT-${shortId}`;
  return {
    id: user.id,
    agentId,
    username: user.username,
    callsign: user.callsign || user.username,
    email: user.email,
    role: user.role || 'Canopy Hacker',
    level: user.level || 1,
    xp: user.xp || 0,
    rank: user.rank || 'Forest Explorer',
    avatar: user.avatar_url,
    badges: user.badges || ['Forest Ranger'],
    stats: {
      missionsCompleted: user.missions_completed || 0,
      winRate: user.win_rate || 100,
      vaultsCracked: user.vaults_cracked || 0,
      alarmsTripped: user.alarms_tripped || 0,
      fastestTime: user.fastest_time || '--',
      csMastery: user.cs_mastery || 50,
      physicsMastery: user.physics_mastery || 50,
      chemMastery: user.chem_mastery || 50,
      mathMastery: user.math_mastery || 50,
      cryptoMastery: user.crypto_mastery || 50
    },
    history: history.map(h => ({
      id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      mission: h.mission_title,
      role: h.role,
      result: h.result,
      xp: `+${h.xp_earned} XP`,
      time: h.time_elapsed,
      date: formatDate(h.completed_at)
    }))
  };
}

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return d.toLocaleDateString();
}

export default router;
