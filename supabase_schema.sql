-- =========================================================
-- WOBBLE DATE — Supabase PostgreSQL Schema & Security Rules
-- Run this in Supabase -> SQL Editor -> New query -> Run
-- =========================================================

-- 1. Enable UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL DEFAULT 24,
  gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'other')),
  interested_in TEXT DEFAULT 'female',
  location TEXT DEFAULT 'Mumbai, India',
  city TEXT DEFAULT 'Mumbai',
  bio TEXT DEFAULT '',
  pronouns TEXT DEFAULT '',
  zodiac TEXT DEFAULT '',
  exercise TEXT DEFAULT '',
  cannabis TEXT DEFAULT '',
  pets TEXT DEFAULT '',
  kids TEXT DEFAULT '',
  diet TEXT DEFAULT '',
  religion TEXT DEFAULT '',
  politics TEXT DEFAULT '',
  drinking TEXT DEFAULT '',
  smoking TEXT DEFAULT '',
  job_title TEXT DEFAULT '',
  company TEXT DEFAULT '',
  school TEXT DEFAULT '',
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'lite', 'plus', 'elite')),
  verified BOOLEAN DEFAULT false,
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  prompts JSONB DEFAULT '[]'::JSONB,
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  languages TEXT[] DEFAULT ARRAY[]::TEXT[],
  vitals JSONB DEFAULT '{}'::JSONB,
  voice_prompt JSONB DEFAULT NULL,
  spotify JSONB DEFAULT NULL,
  conversation_slots INTEGER DEFAULT 1,
  daily_likes_remaining INTEGER DEFAULT 10,
  weekly_ends_remaining INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Swipes & Likes Table
CREATE TABLE IF NOT EXISTS public.swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  swiper_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  swiped_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'superlike', 'pass')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

-- 4. Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  chemistry_score INTEGER DEFAULT 35,
  is_active BOOLEAN DEFAULT true,
  active_itinerary JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- 5. Real-Time Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT DEFAULT '',
  media_url TEXT DEFAULT NULL,
  game_data JSONB DEFAULT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Wobble Hour Blind Match Events
CREATE TABLE IF NOT EXISTS public.wobble_hour_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user1_rating INTEGER DEFAULT 0,
  user2_rating INTEGER DEFAULT 0,
  is_unblurred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- Enable Row Level Security (RLS) & Real-Time Sync
-- =========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wobble_hour_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can view verified profiles, users can only edit their own
CREATE POLICY "Public profiles are viewable by authenticated users" 
  ON public.profiles FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Messages: Users can only see and send messages in matches they are part of
CREATE POLICY "Users can view messages for their matches"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages into their matches"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- Enable Realtime for Messages & Matches
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
