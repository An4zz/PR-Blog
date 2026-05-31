import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Comment, NewComment } from '../lib/types'
import { SAMPLE_COMMENTS } from './sampleData'

type Target = { locationId: string } | { postId: string }

/** Fetch the comment thread for a location or a post (oldest first). */
export async function fetchComments(target: Target): Promise<Comment[]> {
  if (!isSupabaseConfigured) {
    return (SAMPLE_COMMENTS as Comment[]).filter((c) =>
      'locationId' in target
        ? c.location_id === target.locationId
        : c.post_id === target.postId
    )
  }

  const column = 'locationId' in target ? 'location_id' : 'post_id'
  const value = 'locationId' in target ? target.locationId : target.postId
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq(column, value)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as Comment[]
}

export async function insertComment(comment: NewComment): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select()
    .single()
  if (error) throw error
  return data as Comment
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) throw error
}
