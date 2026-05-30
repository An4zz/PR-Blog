import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { PR_CENTER, PR_ZOOM } from '../lib/leaflet'

interface Props {
  value: { lat: number; lng: number } | null
  onChange: (coords: { lat: number; lng: number }) => void
}

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
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
  const [results, setResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  // Debounced Nominatim search, restricted to Puerto Rico. Respects the OSM
  // usage policy (one request per pause in typing, never per keystroke).
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = query.trim()
    // All state updates happen inside the (async) timeout callback, never
    // synchronously in the effect body.
    debounceRef.current = setTimeout(
      async () => {
        if (q.length < 3) {
          setResults([])
          return
        }
        setSearching(true)
        try {
          const url =
            'https://nominatim.openstreetmap.org/search?format=json&countrycodes=pr&limit=5&q=' +
            encodeURIComponent(q)
          const res = await fetch(url, {
            headers: { Accept: 'application/json' },
          })
          setResults(res.ok ? await res.json() : [])
        } catch {
          setResults([])
        } finally {
          setSearching(false)
        }
      },
      q.length < 3 ? 0 : 1000
    )
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  function pickResult(r: NominatimResult) {
    onChange({ lat: Number(r.lat), lng: Number(r.lon) })
    setResults([])
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
        {(results.length > 0 || searching) && (
          <ul className="absolute z-[1000] mt-1 max-h-48 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
            {searching && (
              <li className="px-3 py-2 text-sm text-slate-400">Searching…</li>
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
