-- Vía Conmigo — Supabase setup (Locations + Posts + Comments model).
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY guards.
--
-- Model:
--   locations  — a physical place (name, pin, category). Has its own comment thread.
--   posts      — one person's visit/review of a location (stars, photos, notes).
--                A location's overall rating is the average of its posts' stars.
--   comments   — attached to EITHER a location or a post (a discussion thread).

-- 1. Locations ---------------------------------------------------------------
create table if not exists public.locations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null,            -- beach|restaurant|bar|hike|landmark|hotel|shop|activity|other
  latitude    double precision not null,
  longitude   double precision not null,
  gmaps_url   text,
  website_url text,
  user_id     uuid references auth.users on delete set null,
  author_name text not null,
  created_at  timestamptz not null default now()
);
create index if not exists locations_category_idx on public.locations (category);

-- 2. Posts (a visit/review of a location) ------------------------------------
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  notes       text,
  photo_urls  text[] not null default '{}',
  user_id     uuid references auth.users on delete set null,
  author_name text not null,
  created_at  timestamptz not null default now()
);
create index if not exists posts_location_idx on public.posts (location_id);

-- 3. Comments (thread on a location OR a post) -------------------------------
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  location_id uuid references public.locations on delete cascade,
  post_id     uuid references public.posts on delete cascade,
  body        text not null,
  user_id     uuid references auth.users on delete set null,
  author_name text not null,
  created_at  timestamptz not null default now(),
  -- A comment targets exactly one of: a location or a post.
  constraint comment_target_chk check (
    (location_id is not null)::int + (post_id is not null)::int = 1
  )
);
create index if not exists comments_location_idx on public.comments (location_id);
create index if not exists comments_post_idx     on public.comments (post_id);

-- 4. Row Level Security: public read, logged-in write ------------------------
do $$
declare t text;
begin
  foreach t in array array['locations', 'posts', 'comments'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('drop policy if exists "auth insert" on public.%I', t);
    execute format('drop policy if exists "auth update" on public.%I', t);
    execute format('drop policy if exists "auth delete" on public.%I', t);
    execute format('create policy "public read" on public.%I for select using (true)', t);
    execute format('create policy "auth insert" on public.%I for insert to authenticated with check (true)', t);
    execute format('create policy "auth update" on public.%I for update to authenticated using (true) with check (true)', t);
    execute format('create policy "auth delete" on public.%I for delete to authenticated using (true)', t);
  end loop;
end $$;

-- 4b. Feedback (bug reports + suggestions) -----------------------------------
-- Anyone (even anonymous visitors) can submit; only logged-in users can read
-- and manage submissions.
create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('bug', 'suggestion')),
  message     text not null,
  page        text,
  author_name text,
  status      text not null default 'open' check (status in ('open', 'resolved')),
  created_at  timestamptz not null default now()
);

alter table public.feedback enable row level security;
drop policy if exists "anyone insert feedback" on public.feedback;
drop policy if exists "auth read feedback"    on public.feedback;
drop policy if exists "auth update feedback"  on public.feedback;
drop policy if exists "auth delete feedback"  on public.feedback;

create policy "anyone insert feedback" on public.feedback
  for insert with check (true);
create policy "auth read feedback" on public.feedback
  for select to authenticated using (true);
create policy "auth update feedback" on public.feedback
  for update to authenticated using (true) with check (true);
create policy "auth delete feedback" on public.feedback
  for delete to authenticated using (true);

-- 5. Storage policies for the `photos` bucket --------------------------------
-- First create a PUBLIC bucket named `photos` in Dashboard → Storage, then run:
drop policy if exists "public read photos" on storage.objects;
drop policy if exists "auth upload photos" on storage.objects;
drop policy if exists "auth modify photos" on storage.objects;
drop policy if exists "auth delete photos" on storage.objects;

create policy "public read photos" on storage.objects
  for select using (bucket_id = 'photos');
create policy "auth upload photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'photos');
create policy "auth modify photos" on storage.objects
  for update to authenticated using (bucket_id = 'photos');
create policy "auth delete photos" on storage.objects
  for delete to authenticated using (bucket_id = 'photos');

-- 6. (Optional) remove the old flat table from the previous version ----------
-- drop table if exists public.entries;
