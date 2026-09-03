-- ============================================================
-- V.A.U.L.T — PostgreSQL Database Schema
-- Virtual Academic Underground Learning Team
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS — Core accounts & profiles
-- ============================================================
DROP TABLE IF EXISTS heist_history CASCADE;
DROP TABLE IF EXISTS heist_participants CASCADE;
DROP TABLE IF EXISTS heist_sessions CASCADE;
DROP TABLE IF EXISTS custom_heist_stages CASCADE;
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS email_verifications CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS heist_status CASCADE;
DROP TYPE IF EXISTS alarm_level CASCADE;
DROP TYPE IF EXISTS friend_status CASCADE;

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username      VARCHAR(50)  UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  callsign      VARCHAR(100) NOT NULL,
  avatar_url    TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  role          VARCHAR(50)  DEFAULT 'Canopy Hacker',
  level         INTEGER      DEFAULT 1,
  xp            INTEGER      DEFAULT 0,
  rank          VARCHAR(50)  DEFAULT 'Forest Explorer',
  badges        JSONB        DEFAULT '["Forest Ranger"]'::jsonb,
  notification_prefs JSONB   DEFAULT '{"heistInvites": true, "weeklySummary": true, "friendRequests": true}'::jsonb,
  equipped_theme VARCHAR(50) DEFAULT 'default',
  is_verified   BOOLEAN      DEFAULT FALSE,
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ============================================================
-- EMAIL_VERIFICATIONS — 6-digit OTP verification codes
-- ============================================================
CREATE TABLE IF NOT EXISTS email_verifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       VARCHAR(255) NOT NULL,
  code        VARCHAR(10)  NOT NULL,
  expires_at  TIMESTAMPTZ  NOT NULL,
  is_used     BOOLEAN      DEFAULT FALSE,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);

-- ============================================================
-- PASSWORD_RESETS — Password reset tokens & codes
-- ============================================================
CREATE TABLE IF NOT EXISTS password_resets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       VARCHAR(255) NOT NULL,
  token       VARCHAR(255) NOT NULL,
  code        VARCHAR(10)  NOT NULL,
  expires_at  TIMESTAMPTZ  NOT NULL,
  is_used     BOOLEAN      DEFAULT FALSE,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);

-- ============================================================
-- USER_STATS — Per-user skill metrics & analytics
-- ============================================================
CREATE TABLE user_stats (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  missions_completed  INTEGER DEFAULT 0,
  vaults_cracked      INTEGER DEFAULT 0,
  alarms_tripped      INTEGER DEFAULT 0,
  win_rate            REAL    DEFAULT 100.0,
  fastest_time        VARCHAR(20) DEFAULT '--',
  total_time_played   INTEGER DEFAULT 0,  -- seconds
  cs_mastery          INTEGER DEFAULT 50,
  physics_mastery     INTEGER DEFAULT 50,
  chem_mastery        INTEGER DEFAULT 50,
  math_mastery        INTEGER DEFAULT 50,
  crypto_mastery      INTEGER DEFAULT 50,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MISSIONS — Built-in + user-created custom missions
-- ============================================================
CREATE TABLE missions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         VARCHAR(200) NOT NULL,
  category      VARCHAR(100) NOT NULL,
  difficulty    VARCHAR(50)  NOT NULL DEFAULT 'Medium',
  reward        VARCHAR(100) DEFAULT '5,000 XP',
  description   TEXT,
  image_url     TEXT,
  rooms_count   INTEGER DEFAULT 1,
  featured      BOOLEAN DEFAULT FALSE,
  is_custom     BOOLEAN DEFAULT FALSE,
  rooms_data    JSONB   DEFAULT '[]'::jsonb,
  creator_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_missions_featured ON missions(featured);
CREATE INDEX idx_missions_creator  ON missions(creator_id);

-- ============================================================
-- CUSTOM_HEIST_STAGES — Full puzzle definitions for custom heists
-- ============================================================
CREATE TABLE custom_heist_stages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id  UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  stage_data  JSONB NOT NULL,
  creator_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HEIST_SESSIONS — Active / completed heist runs
-- ============================================================
CREATE TYPE heist_status AS ENUM ('lobby', 'active', 'victory', 'defeat', 'aborted');
CREATE TYPE alarm_level  AS ENUM ('LOW_SECURITY', 'MEDIUM_ALERT', 'HIGH_LOCKDOWN', 'BUSTED');

CREATE TABLE heist_sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id    UUID REFERENCES missions(id) ON DELETE SET NULL,
  room_code     VARCHAR(20) UNIQUE NOT NULL,
  stage_idx     INTEGER     DEFAULT 0,
  alarm_level   alarm_level DEFAULT 'LOW_SECURITY',
  alarm_fails   INTEGER     DEFAULT 0,
  time_limit    INTEGER     DEFAULT 180,
  time_left     INTEGER     DEFAULT 180,
  status        heist_status DEFAULT 'lobby',
  host_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  stage_data    JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  started_at    TIMESTAMPTZ,
  ended_at      TIMESTAMPTZ
);

CREATE INDEX idx_heist_room_code ON heist_sessions(room_code);
CREATE INDEX idx_heist_status    ON heist_sessions(status);
CREATE INDEX idx_heist_host      ON heist_sessions(host_id);

-- ============================================================
-- HEIST_PARTICIPANTS — Players in each heist session
-- ============================================================
CREATE TABLE heist_participants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  heist_id        UUID NOT NULL REFERENCES heist_sessions(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            VARCHAR(50) NOT NULL DEFAULT 'hacker',
  slot_id         INTEGER NOT NULL DEFAULT 1,
  is_host         BOOLEAN DEFAULT FALSE,
  is_ready        BOOLEAN DEFAULT FALSE,
  xp_earned       INTEGER DEFAULT 0,
  puzzles_solved  JSONB   DEFAULT '{}'::jsonb,
  joined_at       TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(heist_id, slot_id),
  UNIQUE(heist_id, user_id)
);

CREATE INDEX idx_participants_heist ON heist_participants(heist_id);
CREATE INDEX idx_participants_user  ON heist_participants(user_id);

-- ============================================================
-- HEIST_HISTORY — Permanent record of completed matches
-- ============================================================
CREATE TABLE heist_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  heist_id        UUID REFERENCES heist_sessions(id) ON DELETE SET NULL,
  mission_title   VARCHAR(200),
  role            VARCHAR(50),
  result          VARCHAR(20) DEFAULT 'CONCLUDED',  -- VICTORY / CONCLUDED / DEFEAT
  xp_earned       INTEGER DEFAULT 0,
  time_elapsed    VARCHAR(20),
  accuracy        VARCHAR(10),
  alarms_tripped  INTEGER DEFAULT 0,
  completed_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_history_user ON heist_history(user_id);

-- ============================================================
-- TEAMS — Squads / Crews
-- ============================================================
CREATE TABLE teams (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  motto       TEXT,
  emblem      VARCHAR(10) DEFAULT '🌲',
  invite_code VARCHAR(30) UNIQUE NOT NULL,
  leader_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teams_invite ON teams(invite_code);

CREATE TABLE team_members (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id   UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(team_id, user_id)
);

-- ============================================================
-- FRIENDS — Social connections
-- ============================================================
CREATE TYPE friend_status AS ENUM ('pending', 'accepted', 'blocked');

CREATE TABLE friends (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      friend_status DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, friend_id),
  CHECK(user_id != friend_id)
);

CREATE INDEX idx_friends_user   ON friends(user_id);
CREATE INDEX idx_friends_friend ON friends(friend_id);

-- ============================================================
-- LEADERBOARD — Global & weekly rankings
-- ============================================================
CREATE TABLE leaderboard (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_xp      INTEGER DEFAULT 0,
  weekly_xp     INTEGER DEFAULT 0,
  streak        INTEGER DEFAULT 0,
  rank_position INTEGER DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_xp   ON leaderboard(total_xp DESC);
CREATE INDEX idx_leaderboard_week ON leaderboard(weekly_xp DESC);

-- ============================================================
-- Helper function: auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_leaderboard_updated_at
  BEFORE UPDATE ON leaderboard
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
