# 🌴 Vía Conmigo

A family-run travel guide to the best (and worst) places to visit — beaches,
restaurants, hikes, bars, landmarks and more — with ratings, photos, local
tips, and a filterable map. (Currently centered on Puerto Rico.)

- **Locations & reviews**: each place is a **location** that anyone can review.
  Multiple people add their own **posts** (star rating, several photos, notes);
  the location shows the **average rating**.
- **Discussion threads** on both locations and individual posts.
- **Duplicate detection**: adding a place near/like an existing one suggests
  joining it instead of creating a duplicate.
- **Map view** with colored pins filterable by type; **list view** sortable by
  rating, date, or name; **text search** across both.
- **Add form** with current-location / address-search / click-on-map pin,
  multiple photo uploads, and optional Google Maps / website links.
- **Public to browse**; anyone with an account can add/review/comment.
- **100% free** to run: Supabase free tier + GitHub Pages.

The site runs out of the box with sample data. To make it live and editable by
your family, do the one-time setup below.

## Tech stack

Vite + React 19 + TypeScript · Tailwind CSS v4 · Leaflet + OpenStreetMap ·
Supabase (Postgres + Storage + Auth) · deployed to GitHub Pages via GitHub
Actions.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase values (see below)
npm run dev                  # http://localhost:5173
```

Without `.env.local`, the app still runs using read-only sample data.

## One-time setup (≈10 minutes)

### 1. Create a Supabase project
Sign up at [supabase.com](https://supabase.com) (free tier) and create a
project. From **Project Settings → API**, copy the **Project URL** and the
**anon / public** API key.

### 2. Create the database schema
Open **SQL Editor → New query**, paste the contents of
[`supabase/setup.sql`](supabase/setup.sql), and run it. This creates the
`entries` table and the Row Level Security policies (public read,
authenticated write).

### 3. Create the photos storage bucket
Go to **Storage → New bucket**, name it `photos`, and mark it **Public**. Then
re-run `supabase/setup.sql` (or just its storage section) so the bucket's
access policies are applied.

### 4. Enable accounts (open sign-up)
Anyone can browse without an account; logging in is only needed to add or edit
places. In **Authentication → Providers → Email**:

- Turn **on** "Enable sign-ups" so people can create their own accounts.
- For frictionless onboarding, turn **off** "Confirm email" — new accounts work
  instantly. (Leave it **on** if you want to verify email addresses; the app
  then shows a "check your email" message after sign-up. Note Supabase's
  built-in email is rate-limited, so configure custom SMTP for real volume.)

> Heads up: with open sign-up, the current RLS policies let any logged-in user
> edit/delete any entry. To restrict edits to each author later, add a
> `user_id` column and tighten the update/delete policies.

### 5. Wire up environment variables
- **Locally:** put the values in `.env.local`:
  ```
  VITE_SUPABASE_URL=https://your-project-ref.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-public-key
  ```
- **For deployment:** in GitHub, go to **Settings → Secrets and variables →
  Actions** and add two repository secrets with the same names and values:
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### 6. Enable GitHub Pages
**Settings → Pages → Build and deployment → Source: GitHub Actions.**

### 7. Deploy
Push to the `main` branch (or run the **Deploy to GitHub Pages** workflow
manually). The site goes live at:

```
https://an4zz.github.io/PR-Blog/
```

> The Vite `base` is set to `'./'` (relative) in `vite.config.ts`, so assets
> resolve no matter the repo-name casing in the URL. This works because the app
> uses a HashRouter (the document is always served from the base directory).

## How it works

- **Data model**: `locations` → many `posts` (reviews) → `comments`; comments
  can also attach directly to a location. A location's rating is the average of
  its posts' stars (computed client-side).
- **Filtering/search** lives in the URL (`?cat=beach,hike&minRating=4&q=…`), so
  it's shared between the Map and List views and is shareable/bookmarkable.
- **Photos** upload to the public `photos` Supabase Storage bucket; each post
  stores an array of public photo URLs.
- **Security**: the anon key in the bundle is public by design — all writes are
  gated by Row Level Security, which only permits authenticated (logged-in)
  users.

## Project structure

```
src/
  components/   FilterBar, LocationCard, LocationForm, PostForm, PostCard,
                CommentThread, LocationPicker, PhotosUpload, RatingStars, …
  pages/        MapView, ListView, AddLocation, LocationDetail, Login
  hooks/        useLocations (shared data), useFilters (URL-backed filters)
  context/      AuthContext
  data/         locations / posts / comments (Supabase access), categories, sample data
  lib/          supabase client, types, geo (duplicate detection), leaflet setup
supabase/setup.sql            # locations + posts + comments tables, RLS, storage
.github/workflows/deploy.yml  # GitHub Pages deploy
```
