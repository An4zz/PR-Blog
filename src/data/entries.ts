import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Entry, NewEntry } from '../lib/types'
import { SAMPLE_ENTRIES } from './sampleEntries'

const TABLE = 'entries'
const BUCKET = 'photos'

/** Fetch all entries, newest first. Falls back to sample data when unconfigured. */
export async function fetchEntries(): Promise<Entry[]> {
  if (!isSupabaseConfigured) return SAMPLE_ENTRIES

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Entry[]
}

/** Insert a new entry. Requires an authenticated session (enforced by RLS). */
export async function insertEntry(entry: NewEntry): Promise<Entry> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(entry)
    .select()
    .single()

  if (error) throw error
  return data as Entry
}

/** Update an existing entry. Requires an authenticated session. */
export async function updateEntry(
  id: string,
  patch: Partial<NewEntry>
): Promise<Entry> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Entry
}

/** Delete an entry. Requires an authenticated session. */
export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

/**
 * Upload a photo to the public `photos` bucket and return its public URL.
 * Requires an authenticated session (enforced by storage RLS).
 */
export async function uploadPhoto(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
