/** Best-effort message string from any thrown value (Error, Supabase object, …). */
function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object') {
    const o = err as Record<string, unknown>
    return (
      [o.message, o.details, o.hint].filter(Boolean).join(' — ') ||
      JSON.stringify(o)
    )
  }
  return String(err)
}

/** Turn a raw error (including Supabase's non-Error objects) into a friendly,
 *  actionable message for the UI. */
export function friendlyError(err: unknown): string {
  const msg = extractMessage(err)

  if (/bucket not found/i.test(msg)) {
    return 'Photo storage isn’t set up: create a public bucket named “photos” in Supabase → Storage (or remove the photos and try again).'
  }
  if (/relation .* does not exist|could not find the table|schema cache/i.test(msg)) {
    return 'The database tables aren’t set up yet — run supabase/setup.sql in the Supabase SQL editor.'
  }
  if (/row-level security|not authorized|permission denied/i.test(msg)) {
    return 'You don’t have permission to do that — make sure you’re logged in.'
  }
  if (/failed to fetch|networkerror|load failed|fetch failed/i.test(msg)) {
    return 'Couldn’t reach the database. Your Supabase project may be paused (free tier auto-pauses after inactivity) — open the Supabase dashboard and restore it, then reload.'
  }
  return msg || 'Something went wrong.'
}
