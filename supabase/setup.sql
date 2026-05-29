-- Puerto Rico Family Travel Guide — Supabase setup.
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: it uses IF NOT EXISTS / DROP POLICY guards.

-- 1. Entries table -----------------------------------------------------------
create table if not exists public.entries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null,            -- beach|restaurant|bar|hike|landmark|hotel|shop|activity|other
  rating      smallint not null check (rating between 1 and 5),
  description text,
  latitude    double precision not null,
  longitude   double precision not null,
  photo_url   text,
  gmaps_url   text,
  website_url text,
  author_name text not null,
  created_at  timestamptz not null default now()
);

create index if not exists entries_category_idx on public.entries (category);
create index if not exists entries_rating_idx   on public.entries (rating);

-- 2. Row Level Security: public read, family-only write ----------------------
alter table public.entries enable row level security;

drop policy if exists "public read"  on public.entries;
drop policy if exists "auth insert"   on public.entries;
drop policy if exists "auth update"   on public.entries;
drop policy if exists "auth delete"   on public.entries;

create policy "public read" on public.entries
  for select using (true);
create policy "auth insert" on public.entries
  for insert to authenticated with check (true);
create policy "auth update" on public.entries
  for update to authenticated using (true) with check (true);
create policy "auth delete" on public.entries
  for delete to authenticated using (true);

-- 3. Storage policies for the `photos` bucket --------------------------------
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
