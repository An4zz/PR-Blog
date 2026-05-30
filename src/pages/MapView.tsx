import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import FilterBar from '../components/FilterBar'
import RatingStars from '../components/RatingStars'
import CategoryBadge from '../components/CategoryBadge'
import { useEntries } from '../hooks/useEntries'
import { applyFilters, useFilters } from '../hooks/useFilters'
import { categoryIcon, PR_CENTER, PR_ZOOM } from '../lib/leaflet'

export default function MapView() {
  const { entries, loading } = useEntries()
  const { categories, minRating, sort } = useFilters()

  const visible = useMemo(
    () => applyFilters(entries, { categories, minRating, sort }),
    [entries, categories, minRating, sort]
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
