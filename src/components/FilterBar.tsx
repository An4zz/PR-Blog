import { CATEGORIES } from '../data/categories'
import { useFilters } from '../hooks/useFilters'
import type { SortKey } from '../lib/types'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'rating_desc', label: 'Highest rated' },
  { value: 'rating_asc', label: 'Lowest rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name', label: 'Name (A–Z)' },
]

/** Shared filter/sort toolbar used by both the Map and List views. */
export default function FilterBar({ showSort = true }: { showSort?: boolean }) {
  const {
    categories,
    minRating,
    sort,
    q,
    active,
    toggleCategory,
    setMinRating,
    setSort,
    setQuery,
    clear,
  } = useFilters()

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search places by name…"
          className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => {
          const on = categories.includes(cat.id)
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors ${
                on
                  ? 'border-transparent text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              style={on ? { backgroundColor: cat.color } : undefined}
              aria-pressed={on}
            >
              <span aria-hidden>{cat.emoji}</span>
              {cat.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-slate-600">Min rating</span>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="rounded-md border border-slate-300 bg-white px-2 py-1"
          >
            <option value={0}>Any</option>
            <option value={3}>3★ +</option>
            <option value={4}>4★ +</option>
            <option value={5}>5★ only</option>
          </select>
        </label>

        {showSort && (
          <label className="flex items-center gap-2">
            <span className="text-slate-600">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {active && (
          <button
            type="button"
            onClick={clear}
            className="text-slate-500 underline hover:text-slate-700"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
