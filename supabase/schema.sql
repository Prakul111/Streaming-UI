-- ==============================================================================
-- Streaming UI: Community & Global Streaming Servers Schema
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create streaming_servers table
CREATE TABLE IF NOT EXISTS public.streaming_servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    badge TEXT NOT NULL DEFAULT '1080p • Fast',
    quality TEXT NOT NULL DEFAULT '1080p',
    speed TEXT NOT NULL DEFAULT 'Fast',
    description TEXT DEFAULT '',
    movie_url_pattern TEXT NOT NULL,
    tv_url_pattern TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'offline'
    submitter_name TEXT DEFAULT 'Anonymous',
    submitter_note TEXT DEFAULT '',
    latency_ms INTEGER,
    last_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_streaming_servers_status ON public.streaming_servers(status);
CREATE INDEX IF NOT EXISTS idx_streaming_servers_created_at ON public.streaming_servers(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.streaming_servers ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Anyone can read approved servers for video streaming in the frontend
DROP POLICY IF EXISTS "Public can view approved servers" ON public.streaming_servers;
CREATE POLICY "Public can view approved servers"
ON public.streaming_servers
FOR SELECT
TO public
USING (status = 'approved');

-- 5. Policy: Public visitors can submit candidate servers for review
DROP POLICY IF EXISTS "Public can submit servers for review" ON public.streaming_servers;
CREATE POLICY "Public can submit servers for review"
ON public.streaming_servers
FOR INSERT
TO public
WITH CHECK (
    status = 'pending' AND 
    length(name) >= 2 AND 
    length(movie_url_pattern) > 10 AND 
    length(tv_url_pattern) > 10
);

-- 6. Policy: Service Role (Backend automated health check bot) has full management access
DROP POLICY IF EXISTS "Service role full access" ON public.streaming_servers;
CREATE POLICY "Service role full access"
ON public.streaming_servers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 7. Seed verified starter servers
INSERT INTO public.streaming_servers (name, display_name, badge, quality, speed, description, movie_url_pattern, tv_url_pattern, status)
VALUES 
(
  'AutoEmbed Prime',
  'AutoEmbed Prime',
  '4K • Ultra',
  '4K',
  'Ultra',
  'High speed multi-region CDN player',
  'https://player.autoembed.app/embed/movie/{tmdbId}',
  'https://player.autoembed.app/embed/tv/{tmdbId}/{season}/{episode}',
  'approved'
),
(
  'CineSRC Pro',
  'CineSRC Pro',
  '1080p • Fast',
  '1080p',
  'Fast',
  'Clean fast streaming player',
  'https://cinesrc.st/embed/movie/{tmdbId}',
  'https://cinesrc.st/embed/tv/{tmdbId}?s={season}&e={episode}',
  'approved'
)
ON CONFLICT DO NOTHING;
