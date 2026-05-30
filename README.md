# 🌴 Puerto Rico Family Travel Guide

A family-run guide to the best (and worst) places to visit in Puerto Rico —
beaches, restaurants, hikes, bars, landmarks and more — with ratings, photos,
local tips, and a filterable map.

- **Map view** with colored pins you can filter by type.
- **List view** sortable by rating, date, or name.
- **Easy add form** with photo upload, click-on-map location picker, and
  optional Google Maps / website links.
- **Public to browse**, **family-only to add/edit** (Supabase login).
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

### 4. Create the shared admin login
This project uses a single shared admin account to add/edit places (everyone
else just browses). In **Authentication → Users → Add user**, create one user:

- **Email:** `admin@pr-blog.app` (must match `ADMIN_EMAIL` in `src/lib/config.ts`,
  or set a `VITE_ADMIN_EMAIL` secret to use a different one)
- **Password:** your chosen admin password
- Tick **Auto Confirm User** so it's usable immediately.

Then under **Authentication → Providers → Email**, turn **off** "Enable
sign-ups". The login page only asks for the password.

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
https://an4zz.github.io/pr-blog/
```

> The Vite `base` is set to `/pr-blog/` in `vite.config.ts` to match the repo
> name. If you rename the repo, update that value too.

## How it works

- **Filtering** lives in the URL (`?cat=beach,hike&minRating=4`), so it's
  shared between the Map and List views and is shareable/bookmarkable.
- **Photos** upload to the public `photos` Supabase Storage bucket; the public
  URL is stored on the entry row.
- **Security**: the anon key in the bundle is public by design — all writes are
  gated by Row Level Security, which only permits authenticated (logged-in)
  family members.

## Project structure

```
src/
  components/   FilterBar, EntryCard, EntryForm, LocationPicker, PhotoUpload, …
  pages/        MapView, ListView, AddEntry, EntryDetail, Login
  hooks/        useEntries (shared data), useFilters (URL-backed filters)
  context/      AuthContext
  data/         entries (Supabase access), categories, sample data
  lib/          supabase client, types, leaflet setup
supabase/setup.sql            # database + storage policies
.github/workflows/deploy.yml  # GitHub Pages deploy
```
