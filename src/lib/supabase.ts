import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Whether Supabase has been configured via env vars. When false, the app still
 * renders (with sample data) so it is useful before the backend is wired up.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  // Not fatal: the UI falls back to read-only sample data. Logged so the
  // developer notices missing configuration during local dev / build.
  console.warn(
    'Supabase env vars (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) are not set. ' +
      'Running with sample data; adding/editing entries is disabled.'
  )
}

// The anon key is safe to expose in the client bundle — Row Level Security
// gates all writes. A dummy client is created when unconfigured so imports
// never throw; calls simply won't be made (guarded by isSupabaseConfigured).
export const supabase = createClient(
  url ?? 'https://placeholder.supabase.co',
  anonKey ?? 'placeholder-anon-key',
  {
    auth: { persistSession: true, autoRefreshToken: true },
  }
)
