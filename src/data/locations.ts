import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type {
  Location,
  LocationWithStats,
  NewLocation,
  Post,
} from '../lib/types'
import { SAMPLE_LOCATIONS, SAMPLE_POSTS } from './sampleData'

/** Combine a location with its posts into the derived stats used by the UI. */
export function withStats(location: Location, posts: Post[]): LocationWithStats {
  const avg =
    posts.length === 0
      ? 0
      : posts.reduce((sum, p) => sum + p.rating, 0) / posts.length
  return {
    ...location,
    posts: [...posts].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    avgRating: Math.round(avg * 10) / 10,
    postCount: posts.length,
    photos: posts.flatMap((p) => p.photo_urls),
  }
}

/** Fetch all locations with their posts. Falls back to sample data. */
export async function fetchLocations(): Promise<LocationWithStats[]> {
  if (!isSupabaseConfigured) {
    return SAMPLE_LOCATIONS.map((loc) =>
      withStats(
        loc,
        SAMPLE_POSTS.filter((p) => p.location_id === loc.id)
      )
    )
  }

  const { data, error } = await supabase
    .from('locations')
    .select('*, posts(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => {
    const { posts, ...location } = row as Location & { posts: Post[] }
    return withStats(location, posts ?? [])
  })
}

export async function insertLocation(location: NewLocation): Promise<Location> {
  const { data, error } = await supabase
    .from('locations')
    .insert(location)
    .select()
    .single()
  if (error) throw error
  return data as Location
}

export async function updateLocation(
  id: string,
  patch: Partial<NewLocation>
): Promise<Location> {
  const { data, error } = await supabase
    .from('locations')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Location
}

export async function deleteLocation(id: string): Promise<void> {
  const { error } = await supabase.from('locations').delete().eq('id', id)
  if (error) throw error
}
