import type { Entry } from '../lib/types'

/**
 * Read-only demo data shown when Supabase is not yet configured, so the app is
 * explorable out of the box. Once VITE_SUPABASE_* env vars are set, real data
 * from the database is used instead and this is ignored.
 */
export const SAMPLE_ENTRIES: Entry[] = [
  {
    id: 'sample-1',
    name: 'Flamenco Beach',
    category: 'beach',
    rating: 5,
    description:
      'Crystal-clear water and white sand on Culebra. Get there early to beat the crowds and bring your own shade — kiosks sell great empanadillas.',
    latitude: 18.3275,
    longitude: -65.3175,
    photo_url: null,
    gmaps_url: 'https://www.google.com/maps?q=18.3275,-65.3175',
    website_url: null,
    author_name: 'Sample',
    created_at: '2026-01-15T12:00:00Z',
  },
  {
    id: 'sample-2',
    name: 'El Yunque National Forest',
    category: 'hike',
    rating: 5,
    description:
      'The only tropical rainforest in the US forest system. La Mina trail to the waterfall is a family favorite — reserve a vehicle pass online in advance.',
    latitude: 18.2956,
    longitude: -65.7872,
    photo_url: null,
    gmaps_url: 'https://www.google.com/maps?q=18.2956,-65.7872',
    website_url: 'https://www.fs.usda.gov/elyunque',
    author_name: 'Sample',
    created_at: '2026-02-02T12:00:00Z',
  },
  {
    id: 'sample-3',
    name: 'La Factoría',
    category: 'bar',
    rating: 4,
    description:
      'Maze of rooms in Old San Juan, each with its own vibe. Famous for craft cocktails — the Lavender Mule is a must. Gets busy after 10pm.',
    latitude: 18.4663,
    longitude: -66.1163,
    photo_url: null,
    gmaps_url: 'https://www.google.com/maps?q=18.4663,-66.1163',
    website_url: null,
    author_name: 'Sample',
    created_at: '2026-03-10T12:00:00Z',
  },
  {
    id: 'sample-4',
    name: 'Castillo San Felipe del Morro',
    category: 'landmark',
    rating: 5,
    description:
      '16th-century citadel guarding San Juan Bay. Bring a kite — the lawn out front is perfect for it. Tickets are cheap and cover Castillo San Cristóbal too.',
    latitude: 18.4709,
    longitude: -66.1241,
    photo_url: null,
    gmaps_url: 'https://www.google.com/maps?q=18.4709,-66.1241',
    website_url: 'https://www.nps.gov/saju',
    author_name: 'Sample',
    created_at: '2026-04-01T12:00:00Z',
  },
]
