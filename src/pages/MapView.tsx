import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import FilterBar from '../components/FilterBar'
import RatingStars from '../components/RatingStars'
import CategoryBadge from '../components/CategoryBadge'
import { useLocations } from '../hooks/useLocations'
import { applyFilters, useFilters } from '../hooks/useFilters'
import { categoryIcon, PR_CENTER, PR_ZOOM } from '../lib/leaflet'
import type { LocationWithStats } from '../lib/types'

/** Pans/zooms the map to fit the currently-visible pins when filters narrow
 *  the results, so searching on the map jumps to what you searched for. */
function FitToResults({
  locations,
  active,
}: {
  locations: LocationWithStats[]
  active: boolean
}) {
  const map = useMap()
  const key = locations.map((l) => l.id).join(',')
  useEffect(() => {
    if (!active || locations.length === 0) return
    const bounds = L.latLngBounds(
      locations.map((l) => [l.latitude, l.longitude] as [number, number])
    )
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
  }, [key, active, map, locations])
  return null
}

export default function MapView() {
  const { locations, loading } = useLocations()
  const { categories, minRating, sort, q, active } = useFilters()

  const visible = useMemo(
    () => applyFilters(locations, { categories, minRating, sort, q }),
    [locations, categories, minRating, sort, q]
  )

  return (
    <div className="flex h-full flex-col">
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
          <FitToResults locations={visible} active={active} />
          {visible.map((loc) => (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={categoryIcon(loc.category)}
            >
              <Popup>
                <div className="flex flex-col gap-1">
                  <strong className="text-sm">{loc.name}</strong>
                  <CategoryBadge category={loc.category} />
                  {loc.postCount > 0 ? (
                    <span className="flex items-center gap-1">
                      <RatingStars value={Math.round(loc.avgRating)} size="sm" />
                      <span className="text-xs text-slate-500">
                        {loc.avgRating.toFixed(1)} · {loc.postCount}{' '}
                        {loc.postCount === 1 ? 'review' : 'reviews'}
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">No reviews yet</span>
                  )}
                  <Link
                    to={`/location/${loc.id}`}
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
