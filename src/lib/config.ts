/**
 * The single shared admin account used to add and edit posts. Security comes
 * from the password (set in Supabase → Authentication → Users) and Row Level
 * Security — this email is just the login identifier, so it isn't sensitive.
 *
 * Override it by setting VITE_ADMIN_EMAIL (locally and as a GitHub secret) if
 * you create the Supabase user with a different email.
 */
export const ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL ?? 'admin@pr-blog.app'
