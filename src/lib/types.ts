/** A physical place. Mirrors the `locations` table. */
export interface Location {
  id: string
  name: string
  category: CategoryId
  latitude: number
  longitude: number
  gmaps_url: string | null
  website_url: string | null
  author_name: string
  created_at: string
}

/** One person's visit/review of a location. Mirrors the `posts` table. */
export interface Post {
  id: string
  location_id: string
  rating: number // 1-5
  notes: string | null
  photo_urls: string[]
  author_name: string
  created_at: string
}

/** A comment on either a location or a post. Mirrors the `comments` table. */
export interface Comment {
  id: string
  location_id: string | null
  post_id: string | null
  body: string
  author_name: string
  created_at: string
}

/** A location with its posts and derived stats, used by the map/list/detail. */
export interface LocationWithStats extends Location {
  posts: Post[]
  avgRating: number // 0 when there are no posts yet
  postCount: number
  photos: string[] // all photos across posts (first is used as the thumbnail)
}

export type NewLocation = Omit<Location, 'id' | 'created_at'>
export type NewPost = Omit<Post, 'id' | 'created_at'>
export type NewComment = Omit<Comment, 'id' | 'created_at'>

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
