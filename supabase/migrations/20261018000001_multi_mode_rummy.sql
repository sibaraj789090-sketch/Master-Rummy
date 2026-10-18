-- ==========================================================
-- MASTER RUMMY MULTI-MODE UPGRADE MIGRATION
-- Supports: Points Rummy, 101/201 Pool Rummy, 2/3 Deals Rummy
-- ==========================================================

-- 1. Add game mode configuration columns to game_rooms
ALTER TABLE public.game_rooms
  ADD COLUMN IF NOT EXISTS game_type_detail TEXT DEFAULT '101',
  ADD COLUMN IF NOT EXISTS elimination_threshold INTEGER DEFAULT 101,
  ADD COLUMN IF NOT EXISTS total_deals INTEGER DEFAULT 2;

-- 2. Add cumulative state columns to game_sessions for multi-round tracking
ALTER TABLE public.game_sessions
  ADD COLUMN IF NOT EXISTS deal_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_deals INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS elimination_threshold INTEGER DEFAULT 101,
  ADD COLUMN IF NOT EXISTS cumulative_scores JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS eliminated_user_ids JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS round_history JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_table_completed BOOLEAN DEFAULT FALSE;

-- 3. Update status checks to allow ROUND_FINISHED state if needed
ALTER TABLE public.game_sessions
  DROP CONSTRAINT IF EXISTS game_sessions_status_check;

ALTER TABLE public.game_sessions
  ADD CONSTRAINT game_sessions_status_check
  CHECK (status IN ('ACTIVE', 'ROUND_FINISHED', 'FINISHED'));
