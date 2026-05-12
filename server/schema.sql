-- Tenali Database Schema
-- Run this in your Supabase SQL Editor

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  total_xp INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Case Studies
CREATE TABLE IF NOT EXISTS case_studies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  core_idea TEXT NOT NULL,
  story_intro TEXT NOT NULL,
  real_world TEXT[] NOT NULL
);

-- Stages
CREATE TABLE IF NOT EXISTS stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id INTEGER REFERENCES case_studies(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL,
  concept_label VARCHAR(255) NOT NULL,
  UNIQUE(case_study_id, stage_number)
);

-- Questions (each stage has 3 question variants per position)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES stages(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer VARCHAR(255) NOT NULL,
  hint TEXT NOT NULL,
  answer_type VARCHAR(20) NOT NULL CHECK (answer_type IN ('text', 'integer')),
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 3),
  variant INTEGER NOT NULL DEFAULT 1 CHECK (variant BETWEEN 1 AND 3)
);

-- User Progress
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  case_study_id INTEGER REFERENCES case_studies(id) ON DELETE CASCADE,
  current_stage INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'mastered')),
  xp_earned INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, case_study_id)
);

-- User Attempts
CREATE TABLE IF NOT EXISTS user_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
  answer_given VARCHAR(255),
  is_correct BOOLEAN NOT NULL,
  attempt_number INTEGER NOT NULL,
  attempted_at TIMESTAMP DEFAULT NOW()
);

-- Increment total XP function
CREATE OR REPLACE FUNCTION increment_total_xp(x_user_id UUID, x_delta INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE users SET total_xp = total_xp + x_delta WHERE id = x_user_id;
END;
$$ LANGUAGE plpgsql;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stages_case_study ON stages(case_study_id);
CREATE INDEX IF NOT EXISTS idx_questions_stage ON questions(stage_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_attempts_user ON user_attempts(user_id);