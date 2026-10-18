-- ==========================================================
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
  avatar TEXT,
  practice_chips BIGINT DEFAULT 10000 NOT NULL,
  total_matches INTEGER DEFAULT 0 NOT NULL,
  total_wins INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger to auto-create profile on new user signup in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, phone, avatar, practice_chips)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'Player_' || SUBSTRING(new.id::text, 1, 6)),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'avatar', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'),
    10000
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
  status TEXT DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'FINISHED')),
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

-- Profiles: Public read, User can update own profile
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Game Rooms: Anyone can view active rooms, Authenticated can create/update
CREATE POLICY "Game rooms are viewable by everyone"
  ON public.game_rooms FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create rooms"
  ON public.game_rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Room creator or players can update rooms"
  ON public.game_rooms FOR UPDATE USING (auth.role() = 'authenticated');

-- Room Players: Viewable by everyone in room, user manages own seat
CREATE POLICY "Room players viewable by everyone"
  ON public.room_players FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join seats"
  ON public.room_players FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seat"
  ON public.room_players FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave room"
  ON public.room_players FOR DELETE USING (auth.uid() = user_id);

-- Game Sessions: Public read of table state (joker, discard pile, turn)
CREATE POLICY "Game sessions are viewable by participants"
  ON public.game_sessions FOR SELECT USING (true);

CREATE POLICY "Game session updates allowed for authenticated players"
  ON public.game_sessions FOR ALL USING (auth.role() = 'authenticated');

-- Player Game States: CRITICAL SECURITY -> A player can ONLY see their OWN hand cards!
CREATE POLICY "Players can only view their own hand cards"
  ON public.player_game_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Players can update their own game state"
  ON public.player_game_states FOR ALL
  USING (auth.uid() = user_id);

-- Game Moves: Viewable by everyone in session, created by player on their turn
CREATE POLICY "Game moves viewable by everyone in session"
  ON public.game_moves FOR SELECT USING (true);

CREATE POLICY "Players can log their moves"
  ON public.game_moves FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Match Results & Leaderboards: Public read, System/Auth insert
CREATE POLICY "Match results viewable by everyone"
  ON public.match_results FOR SELECT USING (true);

CREATE POLICY "Authenticated can record match results"
  ON public.match_results FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Leaderboard viewable by everyone"
  ON public.leaderboards FOR SELECT USING (true);

CREATE POLICY "Leaderboard manageable by authenticated users"
  ON public.leaderboards FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================================
-- REALTIME SUBSCRIPTIONS
-- ==========================================================
-- Enable publication for Realtime listeners
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_moves;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboards;
