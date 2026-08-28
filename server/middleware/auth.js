// ============================================================
// V.A.U.L.T — JWT Authentication Middleware
// ============================================================

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vault-dev-secret';

/**
 * Express middleware that verifies JWT bearer tokens.
 * Attaches decoded user payload to req.user on success.
 * Returns 401 if token is missing or invalid.
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'No authentication token provided. Include a Bearer token in the Authorization header.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please sign in again.'
      });
    }
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication token is invalid or corrupted.'
    });
  }
};

/**
 * Optional auth middleware — attaches req.user if token is present,
 * but does NOT reject the request if no token is provided.
 * Useful for endpoints that show different data to authenticated vs anonymous users.
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username
    };
  } catch {
    req.user = null;
  }

  next();
};

/**
 * Generate a JWT token for a user.
 * @param {Object} user - User object with id, email, username
 * @returns {string} JWT token
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Verify a JWT token (used by Socket.io auth).
 * @param {string} token 
 * @returns {Object|null} decoded payload or null
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};
