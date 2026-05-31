import type { Location, Post } from '../lib/types'

/**
 * Read-only demo data shown when Supabase is not configured, so the app is
 * explorable out of the box. Once the VITE_SUPABASE_* env vars are set, real
 * data is used instead and this is ignored.
 */

export const SAMPLE_LOCATIONS: Location[] = [
  {
    id: 'loc-1',
    name: 'Flamenco Beach',
    category: 'beach',
    latitude: 18.3275,
    longitude: -65.3175,
    gmaps_url: 'https://www.google.com/maps?q=18.3275,-65.3175',
    website_url: null,
    author_name: 'Sample',
    created_at: '2026-01-15T12:00:00Z',
  },
  {
    id: 'loc-2',
    name: 'El Yunque National Forest',
    category: 'hike',
    latitude: 18.2956,
    longitude: -65.7872,
    gmaps_url: 'https://www.google.com/maps?q=18.2956,-65.7872',
    website_url: 'https://www.fs.usda.gov/elyunque',
    author_name: 'Sample',
    created_at: '2026-02-02T12:00:00Z',
  },
  {
    id: 'loc-3',
    name: 'La Factoría',
    category: 'bar',
    latitude: 18.4663,
    longitude: -66.1163,
    gmaps_url: 'https://www.google.com/maps?q=18.4663,-66.1163',
    website_url: null,
    author_name: 'Sample',
    created_at: '2026-03-10T12:00:00Z',
  },
]

export const SAMPLE_POSTS: Post[] = [
  {
    id: 'post-1',
    location_id: 'loc-1',
    rating: 5,
    notes: 'Crystal-clear water and white sand. Get there early to beat the crowds and bring your own shade.',
    photo_urls: [],
    author_name: 'Mom',
    created_at: '2026-01-15T12:00:00Z',
  },
  {
    id: 'post-2',
    location_id: 'loc-1',
    rating: 4,
    notes: 'Loved it but it was packed by noon. The kiosk empanadillas are great.',
    photo_urls: [],
    author_name: 'Drew',
    created_at: '2026-01-20T12:00:00Z',
  },
  {
    id: 'post-3',
    location_id: 'loc-2',
    rating: 5,
    notes: 'La Mina trail to the waterfall is a family favorite — reserve a vehicle pass online in advance.',
    photo_urls: [],
    author_name: 'Dad',
    created_at: '2026-02-02T12:00:00Z',
  },
  {
    id: 'post-4',
    location_id: 'loc-3',
    rating: 4,
    notes: 'Maze of rooms, each a different vibe. The Lavender Mule is a must. Busy after 10pm.',
    photo_urls: [],
    author_name: 'Drew',
    created_at: '2026-03-10T12:00:00Z',
  },
]

export const SAMPLE_COMMENTS = [
  {
    id: 'cmt-1',
    location_id: 'loc-1',
    post_id: null,
    body: 'Is there parking nearby or should we take a cab?',
    author_name: 'Aunt Rosa',
    created_at: '2026-01-16T09:00:00Z',
  },
]
