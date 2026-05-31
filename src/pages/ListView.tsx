import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import FilterBar from '../components/FilterBar'
import LocationCard from '../components/LocationCard'
import { useLocations } from '../hooks/useLocations'
import { useAuth } from '../context/AuthContext'
import { applyFilters, useFilters } from '../hooks/useFilters'

export default function ListView() {
  const { locations, loading, error } = useLocations()
  const { session } = useAuth()
  const { categories, minRating, sort, q } = useFilters()

  const visible = useMemo(
    () => applyFilters(locations, { categories, minRating, sort, q }),
    [locations, categories, minRating, sort, q]
  )

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <FilterBar />
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-4">
        {loading && <p className="text-center text-slate-400">Loading…</p>}
        {error && (
          <p className="rounded-md bg-red-50 p-3 text-center text-red-700">
            {error}
          </p>
        )}
        {!loading && !error && visible.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            <p className="text-lg">No places match these filters.</p>
            {session && (
              <Link to="/add" className="mt-2 inline-block text-sky-600 underline">
                Add the first one →
              </Link>
            )}
          </div>
        )}
        <div className="flex flex-col gap-3">
          {visible.map((loc) => (
            <LocationCard key={loc.id} location={loc} />
          ))}
        </div>
      </div>
    </div>
  )
}
