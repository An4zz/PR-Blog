import type { CategoryId } from '../lib/types'

export interface Category {
  id: CategoryId
  label: string
  emoji: string
  /** Marker / badge color (hex). */
  color: string
}

export const CATEGORIES: Category[] = [
  { id: 'beach', label: 'Beach', emoji: '🏖️', color: '#0ea5e9' },
  { id: 'restaurant', label: 'Restaurant', emoji: '🍽️', color: '#ef4444' },
  { id: 'bar', label: 'Bar / Nightlife', emoji: '🍹', color: '#d946ef' },
  { id: 'hike', label: 'Hike / Nature', emoji: '🥾', color: '#16a34a' },
  { id: 'landmark', label: 'Landmark', emoji: '🏛️', color: '#a16207' },
  { id: 'hotel', label: 'Stay', emoji: '🏨', color: '#7c3aed' },
  { id: 'shop', label: 'Shop', emoji: '🛍️', color: '#db2777' },
  { id: 'activity', label: 'Activity', emoji: '🤿', color: '#f59e0b' },
  { id: 'other', label: 'Other', emoji: '📍', color: '#64748b' },
]

const CATEGORY_MAP: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<CategoryId, Category>

export function getCategory(id: CategoryId): Category {
  return CATEGORY_MAP[id] ?? CATEGORY_MAP.other
}
