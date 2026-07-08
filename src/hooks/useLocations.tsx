import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { LocationWithStats } from '../lib/types'
import { fetchLocations } from '../data/locations'
import { friendlyError } from '../lib/errors'

interface LocationsState {
  locations: LocationWithStats[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

const LocationsContext = createContext<LocationsState | undefined>(undefined)

/**
 * Loads all locations (with their posts) once and shares them across the Map,
 * List, and Detail views. The dataset is small, so filtering/sorting happens
 * client-side. After any add/edit/delete, callers should call reload().
 */
export function LocationsProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<LocationWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    try {
      setLocations(await fetchLocations())
    } catch (e) {
      setError(friendlyError(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchLocations()
      .then((data) => {
        if (active) setLocations(data)
      })
      .catch((e) => {
        if (active)
          setError(friendlyError(e))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <LocationsContext.Provider value={{ locations, loading, error, reload }}>
      {children}
    </LocationsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLocations(): LocationsState {
  const ctx = useContext(LocationsContext)
  if (!ctx)
    throw new Error('useLocations must be used within a LocationsProvider')
  return ctx
}
