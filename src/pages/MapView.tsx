import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import FilterBar from '../components/FilterBar'
import RatingStars from '../components/RatingStars'
import CategoryBadge from '../components/CategoryBadge'
import { useEntries } from '../hooks/useEntries'
import { applyFilters, useFilters } from '../hooks/useFilters'
import { categoryIcon, PR_CENTER, PR_ZOOM } from '../lib/leaflet'
import type { Entry } from '../lib/types'

/** Pans/zooms the map to fit the currently-visible pins when filters narrow
 *  the results, so searching on the map jumps to what you searched for. */
function FitToResults({ entries, active }: { entries: Entry[]; active: boolean }) {
  const map = useMap()
  // A stable key of the visible set so we only refit when it actually changes.
  const key = entries.map((e) => e.id).join(',')
  useEffect(() => {
    if (!active || entries.length === 0) return
    const bounds = L.latLngBounds(
      entries.map((e) => [e.latitude, e.longitude] as [number, number])
    )
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
  }, [key, active, map, entries])
  return null
}

export default function MapView() {
  const { entries, loading } = useEntries()
  const { categories, minRating, sort, q, active } = useFilters()

  const visible = useMemo(
    () => applyFilters(entries, { categories, minRating, sort, q }),
    [entries, categories, minRating, sort, q]
  )

  return (
    <div className="flex h-full flex-col">
      {/* Sort is irrelevant on a map, so hide it here. */}
      <FilterBar showSort={false} />
      <div className="relative flex-1">
        {loading && (
          <div className="absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-full bg-white px-4 py-1 text-sm text-slate-500 shadow">
            Loading…
          </div>
        )}
        <MapContainer center={PR_CENTER} zoom={PR_ZOOM} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitToResults entries={visible} active={active} />
          {visible.map((entry) => (
            <Marker
              key={entry.id}
              position={[entry.latitude, entry.longitude]}
              icon={categoryIcon(entry.category)}
            >
              <Popup>
                <div className="flex flex-col gap-1">
                  <strong className="text-sm">{entry.name}</strong>
                  <CategoryBadge category={entry.category} />
                  <RatingStars value={entry.rating} size="sm" />
                  <Link
                    to={`/entry/${entry.id}`}
                    className="text-sm font-medium text-sky-600 hover:underline"
                  >
                    View details →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
