import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { CategoryId, LocationWithStats, SortKey } from '../lib/types'

const DEFAULT_SORT: SortKey = 'rating_desc'

/**
 * Filter + sort state backed by the URL search params, so it is shared between
 * the Map and List views and is shareable/bookmarkable.
 * Example: ?cat=beach,hike&minRating=4&sort=rating_desc
 */
export function useFilters() {
  const [params, setParams] = useSearchParams()

  const categories = useMemo<CategoryId[]>(() => {
    const raw = params.get('cat')
    return raw ? (raw.split(',').filter(Boolean) as CategoryId[]) : []
  }, [params])

  const minRating = Number(params.get('minRating') ?? '0')
  const sort = (params.get('sort') as SortKey) ?? DEFAULT_SORT
  const q = params.get('q') ?? ''

  const update = useCallback(
    (
      next: Partial<{
        categories: CategoryId[]
        minRating: number
        sort: SortKey
        q: string
      }>
    ) => {
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          if (next.categories !== undefined) {
            if (next.categories.length) p.set('cat', next.categories.join(','))
            else p.delete('cat')
          }
          if (next.minRating !== undefined) {
            if (next.minRating > 0) p.set('minRating', String(next.minRating))
            else p.delete('minRating')
          }
          if (next.sort !== undefined) {
            if (next.sort !== DEFAULT_SORT) p.set('sort', next.sort)
            else p.delete('sort')
          }
          if (next.q !== undefined) {
            if (next.q.trim()) p.set('q', next.q)
            else p.delete('q')
          }
          return p
        },
        { replace: true }
      )
    },
    [setParams]
  )

  const toggleCategory = useCallback(
    (id: CategoryId) => {
      const set = new Set(categories)
      if (set.has(id)) set.delete(id)
      else set.add(id)
      update({ categories: [...set] })
    },
    [categories, update]
  )

  const clear = useCallback(() => {
    update({ categories: [], minRating: 0, sort: DEFAULT_SORT, q: '' })
  }, [update])

  const active = categories.length > 0 || minRating > 0 || q.trim().length > 0

  return {
    categories,
    minRating,
    sort,
    q,
    active,
    setCategories: (c: CategoryId[]) => update({ categories: c }),
    setMinRating: (r: number) => update({ minRating: r }),
    setSort: (s: SortKey) => update({ sort: s }),
    setQuery: (text: string) => update({ q: text }),
    toggleCategory,
    clear,
  }
}

/** Apply the current filters + sort to a list of locations. Searches the
 *  location name and the text of its posts; rating filtering uses the average. */
export function applyFilters(
  locations: LocationWithStats[],
  filters: { categories: CategoryId[]; minRating: number; sort: SortKey; q: string }
): LocationWithStats[] {
  const { categories, minRating, sort, q } = filters
  const needle = q.trim().toLowerCase()
  const filtered = locations.filter((l) => {
    if (categories.length && !categories.includes(l.category)) return false
    if (l.avgRating < minRating) return false
    if (
      needle &&
      !l.name.toLowerCase().includes(needle) &&
      !l.posts.some((p) => (p.notes ?? '').toLowerCase().includes(needle))
    )
      return false
    return true
  })

  const sorted = [...filtered]
  switch (sort) {
    case 'rating_desc':
      sorted.sort((a, b) => b.avgRating - a.avgRating)
      break
    case 'rating_asc':
      sorted.sort((a, b) => a.avgRating - b.avgRating)
      break
    case 'newest':
      sorted.sort((a, b) => b.created_at.localeCompare(a.created_at))
      break
    case 'oldest':
      sorted.sort((a, b) => a.created_at.localeCompare(b.created_at))
      break
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name))
      break
  }
  return sorted
}
