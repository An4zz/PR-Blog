/** Turn a raw error into a friendly, actionable message for the UI. */
export function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (/bucket not found/i.test(msg)) {
    return 'Photo storage isn’t set up: create a public bucket named “photos” in Supabase → Storage (or remove the photos and try again).'
  }
  if (/row-level security|not authorized|permission/i.test(msg)) {
    return 'You don’t have permission to do that — make sure you’re logged in.'
  }
  return msg || 'Something went wrong.'
}
