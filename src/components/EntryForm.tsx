import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import LocationPicker from './LocationPicker'
import PhotoUpload from './PhotoUpload'
import RatingStars from './RatingStars'
import { CATEGORIES } from '../data/categories'
import { insertEntry, updateEntry, uploadPhoto } from '../data/entries'
import { useEntries } from '../hooks/useEntries'
import { useAuth } from '../context/AuthContext'
import type { CategoryId, Entry, NewEntry } from '../lib/types'

export default function EntryForm({ existing }: { existing?: Entry }) {
  const navigate = useNavigate()
  const { upsertLocal } = useEntries()
  const { user } = useAuth()

  const [name, setName] = useState(existing?.name ?? '')
  const [category, setCategory] = useState<CategoryId>(
    existing?.category ?? 'beach'
  )
  const [rating, setRating] = useState(existing?.rating ?? 5)
  const [description, setDescription] = useState(existing?.description ?? '')
  const [authorName, setAuthorName] = useState(
    existing?.author_name ??
      (user?.user_metadata?.name as string | undefined) ??
      user?.email?.split('@')[0] ??
      ''
  )
  const [websiteUrl, setWebsiteUrl] = useState(existing?.website_url ?? '')
  const [gmapsUrl, setGmapsUrl] = useState(existing?.gmaps_url ?? '')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    existing ? { lat: existing.latitude, lng: existing.longitude } : null
  )
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) return setError('Please enter a name.')
    if (!coords) return setError('Please set the location on the map.')
    if (!authorName.trim()) return setError('Please enter your name.')

    setSubmitting(true)
    try {
      let photo_url = existing?.photo_url ?? null
      if (photoFile) photo_url = await uploadPhoto(photoFile)

      const payload: NewEntry = {
        name: name.trim(),
        category,
        rating,
        description: description.trim() || null,
        latitude: coords.lat,
        longitude: coords.lng,
        photo_url,
        gmaps_url:
          gmapsUrl.trim() ||
          `https://www.google.com/maps?q=${coords.lat},${coords.lng}`,
        website_url: websiteUrl.trim() || null,
        author_name: authorName.trim(),
      }

      const saved = existing
        ? await updateEntry(existing.id, payload)
        : await insertEntry(payload)

      upsertLocal(saved)
      navigate(`/entry/${saved.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6"
    >
      <h1 className="text-2xl font-bold text-slate-900">
        {existing ? 'Edit place' : 'Add a place'}
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

      <div className="flex flex-wrap gap-5">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Type *</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryId)}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Rating *</span>
          <RatingStars value={rating} onChange={setRating} size="lg" />
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">
          Notes &amp; local tips
        </span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="What did you love or hate? Best time to go, what to order, parking tips…"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Location *</span>
        <LocationPicker value={coords} onChange={setCoords} />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Photo</span>
        <PhotoUpload
          file={photoFile}
          existingUrl={existing?.photo_url}
          onChange={setPhotoFile}
        />
      </div>

      <div className="flex flex-wrap gap-5">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Website</span>
          <input
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://…"
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">
            Google Maps link
          </span>
          <input
            value={gmapsUrl}
            onChange={(e) => setGmapsUrl(e.target.value)}
            placeholder="Auto-generated from the pin if left blank"
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

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
          disabled={submitting}
          className="rounded-md bg-sky-600 px-5 py-2 font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : existing ? 'Save changes' : 'Add place'}
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
