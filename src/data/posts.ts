import { supabase } from '../lib/supabase'
import type { NewPost, Post } from '../lib/types'

const BUCKET = 'photos'

/** Upload one photo to the public bucket and return its public URL. */
export async function uploadPhoto(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

/** Upload several photos in parallel, returning their public URLs in order. */
export async function uploadPhotos(files: File[]): Promise<string[]> {
  return Promise.all(files.map(uploadPhoto))
}

export async function insertPost(post: NewPost): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single()
  if (error) throw error
  return data as Post
}

export async function updatePost(
  id: string,
  patch: Partial<NewPost>
): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Post
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}
