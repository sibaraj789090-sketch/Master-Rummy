// Supabase Backend Admin Reference Data, Schema Migrations & Scripts

export const CORE_MULTIPLAYER_SQL = `-- ==========================================================
-- MASTER RUMMY MULTIPLAYER ENGINE: SUPABASE SCHEMA MIGRATION
-- Tables: profiles, game_rooms, room_players, game_sessions,
--         player_game_states, game_moves, match_results, leaderboards
-- Includes Row Level Security (RLS) & Realtime Replication
-- ==========================================================

-- 1. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  phone TEXT,
  whatsapp_number TEXT,
  avatar TEXT,
  practice_chips BIGINT DEFAULT 10000 NOT NULL,
  total_matches INTEGER DEFAULT 0 NOT NULL,
  total_wins INTEGER DEFAULT 0 NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE NOT NULL,
  role TEXT DEFAULT 'player' NOT NULL,
  is_kyc_verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger to auto-create profile on new user signup in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, phone, avatar, practice_chips, is_admin, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'Player_' || SUBSTRING(new.id::text, 1, 6)),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'avatar', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'),
    10000,
    CASE WHEN LOWER(new.email) IN ('ranidas784170@gmail.com', 'admin@masterrummy.com') THEN TRUE ELSE FALSE END,
    CASE WHEN LOWER(new.email) IN ('ranidas784170@gmail.com', 'admin@masterrummy.com') THEN 'admin' ELSE 'player' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Game Rooms Table
CREATE TABLE IF NOT EXISTS public.game_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  variant TEXT DEFAULT 'Points' NOT NULL, -- Points, Pool, Deals
  max_players INTEGER NOT NULL CHECK (max_players IN (2, 6)),
  entry_chips INTEGER DEFAULT 100 NOT NULL,
  point_value INTEGER DEFAULT 50 NOT NULL,
  status TEXT DEFAULT 'WAITING' NOT NULL CHECK (status IN ('WAITING', 'COUNTDOWN', 'IN_PLAY', 'COMPLETED', 'ABANDONED')),
  created_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Room Players Table (Seats allocation & Presence)
CREATE TABLE IF NOT EXISTS public.room_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.game_rooms ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  avatar TEXT,
  seat_index INTEGER NOT NULL CHECK (seat_index >= 0 AND seat_index < 6),
  status TEXT DEFAULT 'READY' NOT NULL CHECK (status IN ('WAITING', 'READY', 'PLAYING', 'DROPPED', 'DISCONNECTED')),
  is_dealer BOOLEAN DEFAULT FALSE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_room_seat UNIQUE (room_id, seat_index),
  CONSTRAINT unique_room_user UNIQUE (room_id, user_id)
);

-- 4. Game Sessions Table (Authoritative Game State)
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.game_rooms ON DELETE CASCADE NOT NULL,
  round_number INTEGER DEFAULT 1 NOT NULL,
  wild_joker_card JSONB NOT NULL,
  closed_deck JSONB NOT NULL, -- Array of PlayingCard objects
  discard_pile JSONB NOT NULL, -- Array of PlayingCard objects
  current_turn_seat INTEGER NOT NULL DEFAULT 0,
  turn_timer INTEGER DEFAULT 30 NOT NULL,
  turn_start_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  winner_user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  status TEXT DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'ROUND_FINISHED', 'FINISHED')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Player Game States (Secures opponent private cards!)
CREATE TABLE IF NOT EXISTS public.player_game_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.game_sessions ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  seat_index INTEGER NOT NULL,
  hand_cards JSONB NOT NULL, -- Actual private cards
  card_groups JSONB NOT NULL, -- Meld groups
  has_drawn BOOLEAN DEFAULT FALSE NOT NULL,
  score INTEGER DEFAULT 80 NOT NULL,
  status TEXT DEFAULT 'PLAYING' NOT NULL CHECK (status IN ('PLAYING', 'DROPPED', 'SHOW', 'WON')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_session_user UNIQUE (session_id, user_id)
);

-- 6. Game Moves Table (Audit & Event Log)
CREATE TABLE IF NOT EXISTS public.game_moves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.game_sessions ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  seat_index INTEGER NOT NULL,
  move_type TEXT NOT NULL CHECK (move_type IN ('DRAW_CLOSED', 'DRAW_OPEN', 'DISCARD', 'DROP', 'DECLARE', 'TIMEOUT')),
  card_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Match Results Table
CREATE TABLE IF NOT EXISTS public.match_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.game_rooms ON DELETE SET NULL,
  session_id UUID REFERENCES public.game_sessions ON DELETE SET NULL,
  winner_id UUID REFERENCES auth.users ON DELETE SET NULL,
  winner_username TEXT NOT NULL,
  players_count INTEGER NOT NULL,
  chips_pool BIGINT NOT NULL,
  summary JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Leaderboards Table
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar TEXT,
  wins INTEGER DEFAULT 0 NOT NULL,
  matches_played INTEGER DEFAULT 0 NOT NULL,
  practice_chips BIGINT DEFAULT 10000 NOT NULL,
  win_rate NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Game Rooms
CREATE POLICY "Game rooms are viewable by everyone"
  ON public.game_rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create rooms"
  ON public.game_rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Room creator or players can update rooms"
  ON public.game_rooms FOR UPDATE USING (auth.role() = 'authenticated');

-- Room Players
CREATE POLICY "Room players viewable by everyone"
  ON public.room_players FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join seats"
  ON public.room_players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own seat"
  ON public.room_players FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can leave room"
  ON public.room_players FOR DELETE USING (auth.uid() = user_id);

-- Game Sessions
CREATE POLICY "Game sessions are viewable by participants"
  ON public.game_sessions FOR SELECT USING (true);
CREATE POLICY "Game session updates allowed for authenticated players"
  ON public.game_sessions FOR ALL USING (auth.role() = 'authenticated');

-- Player Game States: Opponent cards protected!
CREATE POLICY "Players can only view their own hand cards"
  ON public.player_game_states FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Players can update their own game state"
  ON public.player_game_states FOR ALL
  USING (auth.uid() = user_id);

-- Game Moves
CREATE POLICY "Game moves viewable by everyone in session"
  ON public.game_moves FOR SELECT USING (true);
CREATE POLICY "Players can log their moves"
  ON public.game_moves FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Match Results & Leaderboards
CREATE POLICY "Match results viewable by everyone"
  ON public.match_results FOR SELECT USING (true);
CREATE POLICY "Authenticated can record match results"
  ON public.match_results FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Leaderboard viewable by everyone"
  ON public.leaderboards FOR SELECT USING (true);
CREATE POLICY "Leaderboard manageable by authenticated users"
  ON public.leaderboards FOR ALL USING (auth.role() = 'authenticated');

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms, public.room_players, public.game_sessions, public.game_moves, public.leaderboards;`;

export const MULTI_MODE_SQL = `-- ==========================================================
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

-- 3. Update status checks to allow ROUND_FINISHED state
ALTER TABLE public.game_sessions
  DROP CONSTRAINT IF EXISTS game_sessions_status_check;

ALTER TABLE public.game_sessions
  ADD CONSTRAINT game_sessions_status_check
  CHECK (status IN ('ACTIVE', 'ROUND_FINISHED', 'FINISHED'));`;

export const UNIFIED_MASTER_SQL = `-- ==========================================================
-- COMPLETE UNIFIED MASTER RUMMY SCHEMA (ALL TABLES & MODES)
-- Points Rummy | Pool Rummy (101 & 201) | Deals Rummy (2 & 3 Deals)
-- Run this in Supabase Dashboard -> SQL Editor -> New Query
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  phone TEXT,
  whatsapp_number TEXT,
  avatar TEXT,
  practice_chips BIGINT DEFAULT 10000 NOT NULL,
  total_matches INTEGER DEFAULT 0 NOT NULL,
  total_wins INTEGER DEFAULT 0 NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE NOT NULL,
  role TEXT DEFAULT 'player' NOT NULL,
  is_kyc_verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger to auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, phone, whatsapp_number, avatar, practice_chips, is_admin, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'Player_' || SUBSTRING(new.id::text, 1, 6)),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'whatsapp_number', ''),
    COALESCE(new.raw_user_meta_data->>'avatar', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'),
    10000,
    CASE WHEN LOWER(new.email) IN ('ranidas784170@gmail.com', 'admin@masterrummy.com') THEN TRUE ELSE FALSE END,
    CASE WHEN LOWER(new.email) IN ('ranidas784170@gmail.com', 'admin@masterrummy.com') THEN 'admin' ELSE 'player' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. GAME ROOMS TABLE (ALL VARIANTS)
CREATE TABLE IF NOT EXISTS public.game_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  variant TEXT DEFAULT 'Points' NOT NULL, -- Points, Pool, Deals
  game_type_detail TEXT DEFAULT '101', -- 'Classic', '101', '201', '2', '3'
  elimination_threshold INTEGER DEFAULT 101, -- 101 or 201 for Pool
  total_deals INTEGER DEFAULT 2, -- 2 or 3 for Deals
  max_players INTEGER NOT NULL CHECK (max_players IN (2, 6)),
  entry_chips INTEGER DEFAULT 100 NOT NULL,
  point_value INTEGER DEFAULT 50 NOT NULL,
  status TEXT DEFAULT 'WAITING' NOT NULL CHECK (status IN ('WAITING', 'COUNTDOWN', 'IN_PLAY', 'COMPLETED', 'ABANDONED')),
  created_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. ROOM PLAYERS TABLE
CREATE TABLE IF NOT EXISTS public.room_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.game_rooms ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  avatar TEXT,
  seat_index INTEGER NOT NULL CHECK (seat_index >= 0 AND seat_index < 6),
  status TEXT DEFAULT 'READY' NOT NULL CHECK (status IN ('WAITING', 'READY', 'PLAYING', 'DROPPED', 'DISCONNECTED')),
  is_dealer BOOLEAN DEFAULT FALSE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_room_seat UNIQUE (room_id, seat_index),
  CONSTRAINT unique_room_user UNIQUE (room_id, user_id)
);

-- 4. GAME SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.game_rooms ON DELETE CASCADE NOT NULL,
  round_number INTEGER DEFAULT 1 NOT NULL,
  deal_number INTEGER DEFAULT 1 NOT NULL,
  total_deals INTEGER DEFAULT 2,
  elimination_threshold INTEGER DEFAULT 101,
  cumulative_scores JSONB DEFAULT '{}'::jsonb,
  eliminated_user_ids JSONB DEFAULT '[]'::jsonb,
  round_history JSONB DEFAULT '[]'::jsonb,
  is_table_completed BOOLEAN DEFAULT FALSE,
  wild_joker_card JSONB NOT NULL,
  closed_deck JSONB NOT NULL,
  discard_pile JSONB NOT NULL,
  current_turn_seat INTEGER NOT NULL DEFAULT 0,
  turn_timer INTEGER DEFAULT 30 NOT NULL,
  turn_start_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  winner_user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  status TEXT DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'ROUND_FINISHED', 'FINISHED')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. PLAYER GAME STATES (Private Hand Cards Protection)
CREATE TABLE IF NOT EXISTS public.player_game_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.game_sessions ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  seat_index INTEGER NOT NULL,
  hand_cards JSONB NOT NULL,
  card_groups JSONB NOT NULL,
  has_drawn BOOLEAN DEFAULT FALSE NOT NULL,
  score INTEGER DEFAULT 80 NOT NULL,
  status TEXT DEFAULT 'PLAYING' NOT NULL CHECK (status IN ('PLAYING', 'DROPPED', 'SHOW', 'WON')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_session_user UNIQUE (session_id, user_id)
);

-- 6. GAME MOVES AUDIT LOG
CREATE TABLE IF NOT EXISTS public.game_moves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.game_sessions ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  seat_index INTEGER NOT NULL,
  move_type TEXT NOT NULL CHECK (move_type IN ('DRAW_CLOSED', 'DRAW_OPEN', 'DISCARD', 'DROP', 'DECLARE', 'TIMEOUT')),
  card_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. MATCH RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.match_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.game_rooms ON DELETE SET NULL,
  session_id UUID REFERENCES public.game_sessions ON DELETE SET NULL,
  winner_id UUID REFERENCES auth.users ON DELETE SET NULL,
  winner_username TEXT NOT NULL,
  players_count INTEGER NOT NULL,
  chips_pool BIGINT NOT NULL,
  summary JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. LEADERBOARDS TABLE
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar TEXT,
  wins INTEGER DEFAULT 0 NOT NULL,
  matches_played INTEGER DEFAULT 0 NOT NULL,
  practice_chips BIGINT DEFAULT 10000 NOT NULL,
  win_rate NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Game rooms are viewable by everyone" ON public.game_rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create rooms" ON public.game_rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Room creator or players can update rooms" ON public.game_rooms FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Room players viewable by everyone" ON public.room_players FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join seats" ON public.room_players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own seat" ON public.room_players FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can leave room" ON public.room_players FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Game sessions are viewable by participants" ON public.game_sessions FOR SELECT USING (true);
CREATE POLICY "Game session updates allowed for authenticated players" ON public.game_sessions FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Players can only view their own hand cards" ON public.player_game_states FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Players can update their own game state" ON public.player_game_states FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Game moves viewable by everyone in session" ON public.game_moves FOR SELECT USING (true);
CREATE POLICY "Players can log their moves" ON public.game_moves FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Match results viewable by everyone" ON public.match_results FOR SELECT USING (true);
CREATE POLICY "Authenticated can record match results" ON public.match_results FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Leaderboard viewable by everyone" ON public.leaderboards FOR SELECT USING (true);
CREATE POLICY "Leaderboard manageable by authenticated users" ON public.leaderboards FOR ALL USING (auth.role() = 'authenticated');

-- REALTIME REPLICATION PUBLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms, public.room_players, public.game_sessions, public.game_moves, public.leaderboards;`;

export interface SupabaseTableMeta {
  name: string;
  description: string;
  columnsCount: number;
  primaryKey: string;
  hasRls: boolean;
  hasRealtime: boolean;
  keyColumns: string[];
}

export const SUPABASE_TABLES_META: SupabaseTableMeta[] = [
  {
    name: 'profiles',
    description: 'User profiles linked to auth.users with chips, avatar, WhatsApp, and Admin role flags',
    columnsCount: 12,
    primaryKey: 'id (UUID)',
    hasRls: true,
    hasRealtime: false,
    keyColumns: ['id', 'username', 'phone', 'whatsapp_number', 'practice_chips', 'is_admin', 'role', 'is_kyc_verified'],
  },
  {
    name: 'game_rooms',
    description: 'Active game lobby rooms for Points, 101/201 Pool, and 2/3 Deals variants (2P & 6P)',
    columnsCount: 12,
    primaryKey: 'id (UUID)',
    hasRls: true,
    hasRealtime: true,
    keyColumns: ['id', 'room_code', 'variant', 'game_type_detail', 'max_players', 'entry_chips', 'status'],
  },
  {
    name: 'room_players',
    description: 'Real-time player seat allocations (Seat 0 to 5) with presence & ready flags',
    columnsCount: 9,
    primaryKey: 'id (UUID)',
    hasRls: true,
    hasRealtime: true,
    keyColumns: ['id', 'room_id', 'user_id', 'username', 'seat_index', 'status', 'is_dealer'],
  },
  {
    name: 'game_sessions',
    description: 'Live table game state with wild joker, closed deck, discard pile, turn timer, and round scores',
    columnsCount: 18,
    primaryKey: 'id (UUID)',
    hasRls: true,
    hasRealtime: true,
    keyColumns: ['id', 'room_id', 'wild_joker_card', 'current_turn_seat', 'turn_timer', 'status', 'cumulative_scores'],
  },
  {
    name: 'player_game_states',
    description: 'Private 13-card hands & melds with strict RLS policy preventing opponents from reading cards',
    columnsCount: 9,
    primaryKey: 'id (UUID)',
    hasRls: true,
    hasRealtime: false,
    keyColumns: ['id', 'session_id', 'user_id', 'hand_cards', 'card_groups', 'score', 'status'],
  },
  {
    name: 'game_moves',
    description: 'Audit log of all in-game actions: draw closed, draw open, discard, drop, and declare',
    columnsCount: 6,
    primaryKey: 'id (UUID)',
    hasRls: true,
    hasRealtime: true,
    keyColumns: ['id', 'session_id', 'user_id', 'move_type', 'card_data', 'created_at'],
  },
  {
    name: 'match_results',
    description: 'Completed matches history, winner summaries, player counts, and chips distribution',
    columnsCount: 8,
    primaryKey: 'id (UUID)',
    hasRls: true,
    hasRealtime: false,
    keyColumns: ['id', 'room_id', 'winner_id', 'winner_username', 'chips_pool', 'created_at'],
  },
  {
    name: 'leaderboards',
    description: 'Global leaderboard rankings calculated by total wins, win rate, and chips won',
    columnsCount: 7,
    primaryKey: 'user_id (UUID)',
    hasRls: true,
    hasRealtime: true,
    keyColumns: ['user_id', 'username', 'wins', 'matches_played', 'win_rate'],
  },
];

export const ADMIN_SQL_SNIPPETS = [
  {
    title: 'Promote User to Admin',
    description: 'Grants full admin rights to a player account in Supabase Database',
    sql: `-- Replace 'YOUR_USERNAME' or email with the user's username
UPDATE public.profiles
SET is_admin = TRUE, role = 'admin'
WHERE username = 'YOUR_USERNAME';`,
  },
  {
    title: 'Gift 50,000 Practice Chips to Player',
    description: 'Increases chip balance for instant high-roller play testing',
    sql: `UPDATE public.profiles
SET practice_chips = practice_chips + 50000
WHERE username = 'Player_Alpha_1';`,
  },
  {
    title: 'Clean Up Abandoned Rooms',
    description: 'Removes empty or abandoned game rooms older than 2 hours',
    sql: `DELETE FROM public.game_rooms
WHERE status IN ('WAITING', 'ABANDONED')
  AND created_at < NOW() - INTERVAL '2 hours';`,
  },
  {
    title: 'Verify All Active Multiplayer Tables',
    description: 'Quick check of active rooms, player counts and current session statuses',
    sql: `SELECT
  gr.room_code,
  gr.variant,
  gr.status AS room_status,
  COUNT(rp.id) AS active_players,
  gs.status AS game_status,
  gs.current_turn_seat
FROM public.game_rooms gr
LEFT JOIN public.room_players rp ON rp.room_id = gr.id
LEFT JOIN public.game_sessions gs ON gs.room_id = gr.id
GROUP BY gr.id, gs.id
ORDER BY gr.created_at DESC;`,
  },
];

export const REALTIME_CHANNELS_DOC = [
  {
    topic: 'realtime:room:${room_code}',
    type: 'Presence & Broadcast',
    events: ['ROOM_UPDATE', 'PLAYER_JOINED', 'PLAYER_LEFT', 'PLAYER_READY', 'SEAT_CHANGED'],
    description: 'Synchronizes lobby seats, countdown timers, and player presence before cards are dealt.',
  },
  {
    topic: 'realtime:game:${session_id}',
    type: 'Broadcast & Postgres Changes',
    events: ['GAME_STARTED', 'CARD_DRAWN', 'CARD_DISCARDED', 'TURN_TIMEOUT', 'SHOW_DECLARED', 'MATCH_CONCLUDED'],
    description: 'Dispatches turn signals, timer ticks, discard pile updates, and instant win declarations.',
  },
];
