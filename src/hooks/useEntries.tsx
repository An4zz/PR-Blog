import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Entry } from '../lib/types'
import { fetchEntries } from '../data/entries'

interface EntriesState {
  entries: Entry[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  /** Optimistically add/replace an entry locally without a full refetch. */
  upsertLocal: (entry: Entry) => void
  removeLocal: (id: string) => void
}

const EntriesContext = createContext<EntriesState | undefined>(undefined)

/**
 * Loads all entries once and shares them across the Map and List views.
 * The dataset is small (a family blog), so filtering/sorting happens
 * client-side and switching views never refetches.
 */
export function EntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setEntries(await fetchEntries())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load entries')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load. State is only updated in async callbacks (after the await),
  // never synchronously in the effect body.
  useEffect(() => {
    let active = true
    fetchEntries()
      .then((data) => {
        if (active) setEntries(data)
      })
      .catch((e) => {
        if (active)
          setError(e instanceof Error ? e.message : 'Failed to load entries')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const upsertLocal = useCallback((entry: Entry) => {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === entry.id)
      if (idx === -1) return [entry, ...prev]
      const next = [...prev]
      next[idx] = entry
      return next
    })
  }, [])

  const removeLocal = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return (
    <EntriesContext.Provider
      value={{ entries, loading, error, reload, upsertLocal, removeLocal }}
    >
      {children}
    </EntriesContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEntries(): EntriesState {
  const ctx = useContext(EntriesContext)
  if (!ctx) throw new Error('useEntries must be used within an EntriesProvider')
  return ctx
}
