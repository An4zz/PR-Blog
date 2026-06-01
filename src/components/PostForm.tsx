import { useState, type FormEvent } from 'react'
import RatingStars from './RatingStars'
import PhotosUpload from './PhotosUpload'
import { insertPost, updatePost, uploadPhotos } from '../data/posts'
import { useAuth } from '../context/AuthContext'
import { friendlyError } from '../lib/errors'
import type { NewPost, Post } from '../lib/types'

interface Props {
  locationId: string
  existing?: Post
  onSaved: () => void
  onCancel: () => void
}

/** Create or edit a post (one person's visit/review of a location). */
export default function PostForm({ locationId, existing, onSaved, onCancel }: Props) {
  const { user } = useAuth()
  const [rating, setRating] = useState(existing?.rating ?? 5)
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [authorName, setAuthorName] = useState(
    existing?.author_name ??
      (user?.user_metadata?.name as string | undefined) ??
      user?.email?.split('@')[0] ??
      ''
  )
  const [files, setFiles] = useState<File[]>([])
  const [keptUrls, setKeptUrls] = useState<string[]>(existing?.photo_urls ?? [])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!authorName.trim()) return setError('Please enter your name.')
    setBusy(true)
    try {
      const uploaded = files.length ? await uploadPhotos(files) : []
      const payload: NewPost = {
        location_id: locationId,
        rating,
        notes: notes.trim() || null,
        photo_urls: [...keptUrls, ...uploaded],
        author_name: authorName.trim(),
      }
      if (existing) await updatePost(existing.id, payload)
      else await insertPost(payload)
      onSaved()
    } catch (err) {
      setError(friendlyError(err))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Your rating</span>
        <RatingStars value={rating} onChange={setRating} size="lg" />
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">
          Notes &amp; tips
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="What did you think? Best time to go, what to order, parking tips…"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Photos</span>
        <PhotosUpload
          files={files}
          onFilesChange={setFiles}
          existingUrls={keptUrls}
          onExistingChange={setKeptUrls}
        />
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Your name</span>
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
          {busy ? 'Saving…' : existing ? 'Save changes' : 'Post review'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-5 py-2 text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
