import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import RatingStars from '../components/RatingStars'
import CategoryBadge from '../components/CategoryBadge'
import PostCard from '../components/PostCard'
import PostForm from '../components/PostForm'
import CommentThread from '../components/CommentThread'
import { useLocations } from '../hooks/useLocations'
import { useAuth } from '../context/AuthContext'
import { deleteLocation } from '../data/locations'
import type { Post } from '../lib/types'

export default function LocationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { locations, loading, reload } = useLocations()
  const { session } = useAuth()

  const [addingReview, setAddingReview] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  const location = locations.find((l) => l.id === id)

  if (loading && !location) {
    return <p className="p-8 text-center text-slate-400">Loading…</p>
  }
  if (!location) {
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
    location.gmaps_url ||
    `https://www.google.com/maps?q=${location.latitude},${location.longitude}`

  async function handleDeleteLocation() {
    if (!location) return
    if (!confirm(`Delete "${location.name}" and all its reviews? This cannot be undone.`))
      return
    await deleteLocation(location.id)
    await reload()
    navigate('/list')
  }

  async function afterPostSaved() {
    setAddingReview(false)
    setEditingPost(null)
    await reload()
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

        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl font-bold text-slate-900">{location.name}</h1>
          {location.postCount > 0 && (
            <span className="flex items-center gap-1 whitespace-nowrap">
              <RatingStars value={Math.round(location.avgRating)} />
              <span className="text-sm text-slate-500">
                {location.avgRating.toFixed(1)} ({location.postCount})
              </span>
            </span>
          )}
        </div>

        <div className="mt-2">
          <CategoryBadge category={location.category} />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={gmaps}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            🧭 Open in Google Maps
          </a>
          {location.website_url && (
            <a
              href={location.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              🔗 Website
            </a>
          )}
        </div>

        <p className="mt-3 text-sm text-slate-400">
          Added by {location.author_name} on{' '}
          {new Date(location.created_at).toLocaleDateString()}
        </p>

        {session && (
          <div className="mt-3 flex gap-3 text-sm">
            <Link
              to={`/location/${location.id}/edit`}
              className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
            >
              ✏️ Edit place
            </Link>
            <button
              type="button"
              onClick={handleDeleteLocation}
              className="rounded-md border border-red-300 px-3 py-1.5 text-red-600 hover:bg-red-50"
            >
              🗑️ Delete place
            </button>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Reviews</h2>
            {session && !addingReview && !editingPost && (
              <button
                type="button"
                onClick={() => setAddingReview(true)}
                className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                ➕ Add your review
              </button>
            )}
          </div>

          {!session && (
            <p className="mb-3 text-sm text-slate-400">
              <Link to="/login" className="text-sky-600 underline">
                Log in
              </Link>{' '}
              to add your own review.
            </p>
          )}

          {addingReview && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <PostForm
                locationId={location.id}
                onSaved={afterPostSaved}
                onCancel={() => setAddingReview(false)}
              />
            </div>
          )}

          <div className="flex flex-col gap-3">
            {location.posts.map((post) =>
              editingPost?.id === post.id ? (
                <div
                  key={post.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <PostForm
                    locationId={location.id}
                    existing={post}
                    onSaved={afterPostSaved}
                    onCancel={() => setEditingPost(null)}
                  />
                </div>
              ) : (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={setEditingPost}
                  onChanged={reload}
                />
              )
            )}
            {location.postCount === 0 && !addingReview && (
              <p className="text-sm text-slate-400">No reviews yet.</p>
            )}
          </div>
        </div>

        {/* Location-level discussion thread */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <CommentThread target={{ locationId: location.id }} />
        </div>
      </div>
    </div>
  )
}
