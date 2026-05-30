import { Link, useNavigate, useParams } from 'react-router-dom'
import RatingStars from '../components/RatingStars'
import CategoryBadge from '../components/CategoryBadge'
import { useEntries } from '../hooks/useEntries'
import { useAuth } from '../context/AuthContext'
import { deleteEntry } from '../data/entries'

export default function EntryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { entries, loading, removeLocal } = useEntries()
  const { session } = useAuth()

  const entry = entries.find((e) => e.id === id)

  if (loading && !entry) {
    return <p className="p-8 text-center text-slate-400">Loading…</p>
  }
  if (!entry) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>That place could not be found.</p>
        <Link to="/list" className="mt-2 inline-block text-sky-600 underline">
          ← Back to list
        </Link>
      </div>
    )
  }

  const gmaps =
    entry.gmaps_url ||
    `https://www.google.com/maps?q=${entry.latitude},${entry.longitude}`

  async function handleDelete() {
    if (!entry) return
    if (!confirm(`Delete "${entry.name}"? This cannot be undone.`)) return
    try {
      await deleteEntry(entry.id)
      removeLocal(entry.id)
      navigate('/list')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete.')
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back
        </button>

        {entry.photo_url && (
          <img
            src={entry.photo_url}
            alt={entry.name}
            className="mb-4 max-h-80 w-full rounded-xl object-cover"
          />
        )}

        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl font-bold text-slate-900">{entry.name}</h1>
          <RatingStars value={entry.rating} size="lg" />
        </div>

        <div className="mt-2">
          <CategoryBadge category={entry.category} />
        </div>

        {entry.description && (
          <p className="mt-4 whitespace-pre-wrap text-slate-700">
            {entry.description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={gmaps}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            🧭 Open in Google Maps
          </a>
          {entry.website_url && (
            <a
              href={entry.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              🔗 Website
            </a>
          )}
        </div>

        <p className="mt-6 text-sm text-slate-400">
          Added by {entry.author_name} on{' '}
          {new Date(entry.created_at).toLocaleDateString()}
        </p>

        {session && (
          <div className="mt-4 flex gap-3 border-t border-slate-200 pt-4">
            <Link
              to={`/entry/${entry.id}/edit`}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              ✏️ Edit
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
