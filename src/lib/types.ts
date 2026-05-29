/** A single place documented by the family. Mirrors the `entries` table in Supabase. */
export interface Entry {
  id: string
  name: string
  category: CategoryId
  rating: number // 1-5
  description: string | null
  latitude: number
  longitude: number
  photo_url: string | null
  gmaps_url: string | null
  website_url: string | null
  author_name: string
  created_at: string
}

/** Fields the user fills in when creating an entry (before the row exists). */
export type NewEntry = Omit<Entry, 'id' | 'created_at'>

export type CategoryId =
  | 'beach'
  | 'restaurant'
  | 'bar'
  | 'hike'
  | 'landmark'
  | 'hotel'
  | 'shop'
  | 'activity'
  | 'other'

export type SortKey = 'rating_desc' | 'rating_asc' | 'newest' | 'oldest' | 'name'
