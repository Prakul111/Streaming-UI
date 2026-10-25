-- ==============================================================================
-- Streaming Servers Table & Row Level Security (RLS) Schema
-- Paste and run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Create table
create table if not exists public.streaming_servers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  display_name text not null,
  badge text default '1080p • Fast',
  quality text default '1080p' check (quality in ('4K', '1080p', 'HD')),
  speed text default 'Fast' check (speed in ('Ultra', 'Fast', 'Stable')),
  description text default '',
  movie_url_pattern text not null,
  tv_url_pattern text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'offline')),
  submitter_name text default 'Anonymous',
  submitter_note text default '',
  latency_ms integer default 0,
  last_checked_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- 2. Indexes for fast queries
create index if not exists idx_streaming_servers_status on public.streaming_servers(status);
create index if not exists idx_streaming_servers_created_at on public.streaming_servers(created_at desc);

-- 3. Enable Row Level Security (RLS)
alter table public.streaming_servers enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Allow public read for approved servers" on public.streaming_servers;
drop policy if exists "Allow public to submit pending servers" on public.streaming_servers;
drop policy if exists "Allow service role full access" on public.streaming_servers;

-- 4. Public Read Policy: Anyone (even unauthenticated visitors) can read approved servers
create policy "Allow public read for approved servers"
  on public.streaming_servers
  for select
  using (status = 'approved');

-- 5. Public Submit Policy: Visitors can submit new servers ONLY with 'pending' status
create policy "Allow public to submit pending servers"
  on public.streaming_servers
  for insert
  with check (status = 'pending');

-- 6. Service Role / Admin Policy: Background bot & admin dashboard have full CRUD access
create policy "Allow service role full access"
  on public.streaming_servers
  for all
  using (auth.role() = 'service_role');
