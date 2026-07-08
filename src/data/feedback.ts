import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Feedback, FeedbackStatus, NewFeedback } from '../lib/types'

/** Submit a bug report / suggestion. Allowed for anyone (even anonymous). */
export async function submitFeedback(feedback: NewFeedback): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Feedback needs Supabase configured.')
  }
  const { error } = await supabase.from('feedback').insert(feedback)
  if (error) throw error
}

/** List all feedback, newest first (logged-in only, enforced by RLS). */
export async function fetchFeedback(): Promise<Feedback[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Feedback[]
}

export async function setFeedbackStatus(
  id: string,
  status: FeedbackStatus
): Promise<void> {
  const { error } = await supabase
    .from('feedback')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

export async function deleteFeedback(id: string): Promise<void> {
  const { error } = await supabase.from('feedback').delete().eq('id', id)
  if (error) throw error
}
