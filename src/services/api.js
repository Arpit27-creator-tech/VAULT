// ============================================================
// V.A.U.L.T — Frontend API Service Layer
// Wraps all REST API calls with JWT token management
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ─── Token Management ────────────────────────────────────────
function getToken() {
  return localStorage.getItem('vault_jwt_token');
}

function setToken(token) {
  localStorage.setItem('vault_jwt_token', token);
}

function clearToken() {
  localStorage.removeItem('vault_jwt_token');
}

// ─── Base Fetch Helper ───────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  // Handle token expiration
  if (response.status === 401) {
    clearToken();
    localStorage.removeItem('vault_current_user');
    // Optionally trigger a re-auth flow
    window.dispatchEvent(new CustomEvent('vault:auth-expired'));
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || data.error || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ─────────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────────
export const authAPI = {
  /**
   * Send 6-digit verification OTP to email.
   * @param {string} email
   */
  async sendVerification(email) {
    return apiFetch('/auth/send-verification', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  /**
   * Verify the 6-digit OTP code.
   * @param {string} email
   * @param {string} code
   */
  async verifyCode(email, code) {
    return apiFetch('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    });
  },

  /**
   * Register a new account with optional verification code.
   * @returns {{ token: string, user: object }}
   */
  async register(username, email, password, code = '') {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, code })
    });
    if (data.token) setToken(data.token);
    return data;
  },

  /**
   * Request a password reset code/link to email.
   * @param {string} email
   */
  async forgotPassword(email) {
    return apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  /**
   * Reset password with code/token and new password.
   * @param {{ email: string, code?: string, token?: string, newPassword: string }}
   */
  async resetPassword({ email, code, token, newPassword }) {
    return apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, token, newPassword })
    });
  },

  /**
   * Login with email/username + password.
   * @returns {{ token: string, user: object }}
   */
  async login(identifier, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    if (data.token) setToken(data.token);
    return data;
  },

  /**
   * Get current user profile from JWT.
   * @returns {{ user: object }}
   */
  async getMe() {
    return apiFetch('/auth/me');
  },

  /** Logout — clear token */
  logout() {
    clearToken();
    localStorage.removeItem('vault_current_user');
  },

  /** Check if user has a token stored */
  isAuthenticated() {
    return !!getToken();
  },

  /** Get the stored token */
  getToken
};

// ─────────────────────────────────────────────────────────────
// User API
// ─────────────────────────────────────────────────────────────
export const userAPI = {
  async getProfile(userId) {
    return apiFetch(`/users/${userId}`);
  },

  async updateProfile(userId, data) {
    return apiFetch(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async getStats(userId) {
    return apiFetch(`/users/${userId}/stats`);
  },

  async getHistory(userId, page = 1, limit = 20) {
    return apiFetch(`/users/${userId}/history?page=${page}&limit=${limit}`);
  },

  async search(query = '') {
    return apiFetch(`/users/search?q=${encodeURIComponent(query)}`);
  },

  async getByTag(agentId) {
    return apiFetch(`/users/tag/${encodeURIComponent(agentId)}`);
  }
};

// ─────────────────────────────────────────────────────────────
// Mission API
// ─────────────────────────────────────────────────────────────
export const missionAPI = {
  async list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.featured !== undefined) params.set('featured', filters.featured);
    if (filters.custom !== undefined) params.set('custom', filters.custom);
    
    const qs = params.toString();
    return apiFetch(`/missions${qs ? `?${qs}` : ''}`);
  },

  async getById(missionId) {
    return apiFetch(`/missions/${missionId}`);
  },

  async create(missionData) {
    return apiFetch('/missions', {
      method: 'POST',
      body: JSON.stringify(missionData)
    });
  },

  async delete(missionId) {
    return apiFetch(`/missions/${missionId}`, {
      method: 'DELETE'
    });
  }
};

// ─────────────────────────────────────────────────────────────
// Heist API
// ─────────────────────────────────────────────────────────────
export const heistAPI = {
  async create(missionId, stageData, timeLimit) {
    return apiFetch('/heists', {
      method: 'POST',
      body: JSON.stringify({ mission_id: missionId, stage_data: stageData, time_limit: timeLimit })
    });
  },

  async getById(heistId) {
    return apiFetch(`/heists/${heistId}`);
  },

  async join(roomCode, role) {
    return apiFetch('/heists/join', {
      method: 'POST',
      body: JSON.stringify({ room_code: roomCode, role })
    });
  },

  async submitResults(heistId, results) {
    return apiFetch(`/heists/${heistId}/results`, {
      method: 'PUT',
      body: JSON.stringify(results)
    });
  },

  // For heists run entirely over Socket.io, with no heist_sessions row.
  // Persists XP/level/history to the database so progress is consistent
  // across devices, instead of being local-only to one browser.
  async completeHeist(results) {
    return apiFetch('/heists/complete', {
      method: 'POST',
      body: JSON.stringify(results)
    });
  }
};

// ─────────────────────────────────────────────────────────────
// Leaderboard API
// ─────────────────────────────────────────────────────────────
export const leaderboardAPI = {
  async getGlobal(limit = 50) {
    return apiFetch(`/leaderboard?limit=${limit}`);
  },

  async getWeekly(limit = 50) {
    return apiFetch(`/leaderboard/weekly?limit=${limit}`);
  }
};

// ─────────────────────────────────────────────────────────────
// Team API
// ─────────────────────────────────────────────────────────────
export const teamAPI = {
  async create(name, motto, emblem) {
    return apiFetch('/teams', {
      method: 'POST',
      body: JSON.stringify({ name, motto, emblem })
    });
  },

  async getById(teamId) {
    return apiFetch(`/teams/${teamId}`);
  },

  async join(inviteCode) {
    return apiFetch('/teams/join', {
      method: 'POST',
      body: JSON.stringify({ invite_code: inviteCode })
    });
  },

  async leave(teamId) {
    return apiFetch(`/teams/${teamId}/members`, {
      method: 'DELETE'
    });
  },

  async getMyTeams() {
    return apiFetch('/teams/my/teams');
  }
};

// ─────────────────────────────────────────────────────────────
// Friends API
// ─────────────────────────────────────────────────────────────
export const friendAPI = {
  async list() {
    return apiFetch('/friends');
  },

  async sendRequest(callsign) {
    return apiFetch('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ callsign })
    });
  },

  async acceptRequest(friendshipId) {
    return apiFetch(`/friends/${friendshipId}/accept`, {
      method: 'PUT'
    });
  },

  async rejectRequest(friendshipId) {
    return apiFetch(`/friends/${friendshipId}/reject`, {
      method: 'PUT'
    });
  },

  async remove(friendshipId) {
    return apiFetch(`/friends/${friendshipId}`, {
      method: 'DELETE'
    });
  }
};

// ─────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────
export const healthAPI = {
  async check() {
    return apiFetch('/health');
  }
};
