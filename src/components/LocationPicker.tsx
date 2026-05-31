import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { PR_CENTER, PR_ZOOM } from '../lib/leaflet'

interface Props {
  value: { lat: number; lng: number } | null
  onChange: (coords: { lat: number; lng: number }) => void
}

interface SearchResult {
  display_name: string
  lat: number
  lon: number
}

/** Build a readable label from a Photon GeoJSON feature's properties. */
function labelFor(props: Record<string, unknown>): string {
  const parts = [
    props.name,
    props.street,
    props.city ?? props.county,
    props.state,
    props.country,
  ].filter(Boolean) as string[]
  // De-duplicate consecutive repeats (e.g. name === city).
  return parts.filter((p, i) => p !== parts[i - 1]).join(', ')
}

/** Drops/moves the marker when the user clicks the map. */
function ClickHandler({ onChange }: Pick<Props, 'onChange'>) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

/** Recenters the map imperatively when coords change via search. */
function Recenter({ coords }: { coords: { lat: number; lng: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.setView([coords.lat, coords.lng], Math.max(map.getZoom(), 14))
  }, [coords, map])
  return null
}

export default function LocationPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  function useCurrentLocation() {
    setGeoError(null)
    if (!('geolocation' in navigator)) {
      setGeoError('Your browser does not support location.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      (err) => {
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied — allow it or pick on the map.'
            : 'Could not get your location — pick on the map instead.'
        )
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Debounced geocoding via Photon (komoot) — a free, no-key, CORS-friendly
  // geocoder built for browser autocomplete. Results are biased toward Puerto
  // Rico but not restricted, so any place can be found.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = query.trim()
    debounceRef.current = setTimeout(
      async () => {
        if (q.length < 3) {
          setResults([])
          setSearched(false)
          return
        }
        setSearching(true)
        try {
          const url =
            'https://photon.komoot.io/api/?limit=5&lang=en' +
            `&lat=${PR_CENTER[0]}&lon=${PR_CENTER[1]}` +
            '&q=' +
            encodeURIComponent(q)
          const res = await fetch(url)
          const data = res.ok ? await res.json() : { features: [] }
          const features = (data.features ?? []) as Array<{
            geometry: { coordinates: [number, number] }
            properties: Record<string, unknown>
          }>
          setResults(
            features.map((f) => ({
              display_name: labelFor(f.properties),
              lon: f.geometry.coordinates[0],
              lat: f.geometry.coordinates[1],
            }))
          )
        } catch {
          setResults([])
        } finally {
          setSearching(false)
          setSearched(true)
        }
      },
      q.length < 3 ? 0 : 500
    )
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  function pickResult(r: SearchResult) {
    onChange({ lat: r.lat, lng: r.lon })
    setResults([])
    setSearched(false)
    setQuery(r.display_name.split(',')[0])
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search an address or place in Puerto Rico…"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {(results.length > 0 || searching || searched) && (
          <ul className="absolute z-[1000] mt-1 max-h-48 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
            {searching && (
              <li className="px-3 py-2 text-sm text-slate-400">Searching…</li>
            )}
            {!searching && searched && results.length === 0 && (
              <li className="px-3 py-2 text-sm text-slate-400">
                No matches — try a different name, or tap the map to drop a pin.
              </li>
            )}
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => pickResult(r)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  {r.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={locating}
        className="inline-flex w-fit items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        📍 {locating ? 'Locating…' : 'Use my current location'}
      </button>
      {geoError && <p className="text-xs text-red-600">{geoError}</p>}

      <div className="h-64 overflow-hidden rounded-md border border-slate-300">
        <MapContainer center={PR_CENTER} zoom={PR_ZOOM} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onChange={onChange} />
          <Recenter coords={value} />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              draggable
              ref={markerRef}
              eventHandlers={{
                dragend() {
                  const m = markerRef.current
                  if (m) {
                    const p = m.getLatLng()
                    onChange({ lat: p.lat, lng: p.lng })
                  }
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <p className="text-xs text-slate-500">
        {value
          ? `📍 ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)} — click the map or drag the pin to adjust.`
          : 'Click the map to drop a pin, or search above.'}
      </p>
    </div>
  )
}
