import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LocationPicker from './LocationPicker'
import PhotosUpload from './PhotosUpload'
import RatingStars from './RatingStars'
import CategoryBadge from './CategoryBadge'
import { CATEGORIES } from '../data/categories'
import { insertLocation, updateLocation } from '../data/locations'
import { insertPost, uploadPhotos } from '../data/posts'
import { useLocations } from '../hooks/useLocations'
import { useAuth } from '../context/AuthContext'
import { distanceMeters } from '../lib/geo'
import type { CategoryId, Location, NewLocation } from '../lib/types'

/** Distance under which a new place is treated as a possible duplicate. */
const DUPLICATE_RADIUS_M = 200

export default function LocationForm({ existing }: { existing?: Location }) {
  const navigate = useNavigate()
  const { locations, reload } = useLocations()
  const { user } = useAuth()
  const isEdit = Boolean(existing)

  const [name, setName] = useState(existing?.name ?? '')
  const [category, setCategory] = useState<CategoryId>(
    existing?.category ?? 'beach'
  )
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    existing ? { lat: existing.latitude, lng: existing.longitude } : null
  )
  const [website, setWebsite] = useState(existing?.website_url ?? '')
  const [gmaps, setGmaps] = useState(existing?.gmaps_url ?? '')
  const [authorName, setAuthorName] = useState(
    existing?.author_name ??
      (user?.user_metadata?.name as string | undefined) ??
      user?.email?.split('@')[0] ??
      ''
  )

  // First review (create mode only).
  const [rating, setRating] = useState(5)
  const [notes, setNotes] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Duplicate suggestions: existing locations that are nearby or name-match.
  const duplicates = useMemo(() => {
    if (isEdit) return []
    const needle = name.trim().toLowerCase()
    return locations
      .filter((l) => {
        const near =
          coords && distanceMeters(coords, { lat: l.latitude, lng: l.longitude }) <
            DUPLICATE_RADIUS_M
        const nameMatch = needle.length >= 3 && l.name.toLowerCase().includes(needle)
        return near || nameMatch
      })
      .slice(0, 5)
  }, [isEdit, locations, coords, name])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) return setError('Please enter a name.')
    if (!coords) return setError('Please set the location on the map.')
    if (!authorName.trim()) return setError('Please enter your name.')

    setBusy(true)
    try {
      const payload: NewLocation = {
        name: name.trim(),
        category,
        latitude: coords.lat,
        longitude: coords.lng,
        website_url: website.trim() || null,
        gmaps_url:
          gmaps.trim() ||
          `https://www.google.com/maps?q=${coords.lat},${coords.lng}`,
        author_name: authorName.trim(),
      }

      if (isEdit && existing) {
        await updateLocation(existing.id, payload)
        await reload()
        navigate(`/location/${existing.id}`)
        return
      }

      const location = await insertLocation(payload)
      // Create the author's first review along with the place.
      const photo_urls = files.length ? await uploadPhotos(files) : []
      await insertPost({
        location_id: location.id,
        rating,
        notes: notes.trim() || null,
        photo_urls,
        author_name: authorName.trim(),
      })
      await reload()
      navigate(`/location/${location.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6"
    >
      <h1 className="text-2xl font-bold text-slate-900">
        {isEdit ? 'Edit place' : 'Add a place'}
      </h1>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Name *</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Flamenco Beach"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
      </label>

      {/* Duplicate suggestions */}
      {duplicates.length > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
          <p className="font-medium text-amber-900">
            Is it one of these existing places? Add your review there instead of
            creating a duplicate:
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {duplicates.map((l) => (
              <li key={l.id}>
                <Link
                  to={`/location/${l.id}`}
                  className="inline-flex items-center gap-2 text-sky-700 hover:underline"
                >
                  📍 {l.name} <CategoryBadge category={l.category} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Type *</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryId)}
          className="w-fit rounded-md border border-slate-300 px-3 py-2"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Location *</span>
        <LocationPicker value={coords} onChange={setCoords} />
      </div>

      <div className="flex flex-wrap gap-5">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Website</span>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://…"
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">
            Google Maps link
          </span>
          <input
            value={gmaps}
            onChange={(e) => setGmaps(e.target.value)}
            placeholder="Auto-filled from the pin if blank"
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      {/* First review (create mode only) */}
      {!isEdit && (
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="font-semibold text-slate-800">Your review</h2>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Rating</span>
            <RatingStars value={rating} onChange={setRating} size="lg" />
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">
              Notes &amp; tips
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="What did you love or hate? Local tips…"
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Photos</span>
            <PhotosUpload files={files} onFilesChange={setFiles} />
          </div>
        </div>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Your name *</span>
        <input
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2"
        />
      </label>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-sky-600 px-5 py-2 font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add place'}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-md border border-slate-300 px-5 py-2 text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
