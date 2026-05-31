import { useState } from 'react'
import RatingStars from './RatingStars'
import CommentThread from './CommentThread'
import { deletePost } from '../data/posts'
import { useAuth } from '../context/AuthContext'
import type { Post } from '../lib/types'

interface Props {
  post: Post
  onEdit: (post: Post) => void
  onChanged: () => void
}

export default function PostCard({ post, onEdit, onChanged }: Props) {
  const { session } = useAuth()
  const [showThread, setShowThread] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this review?')) return
    await deletePost(post.id)
    onChanged()
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-slate-900">{post.author_name}</span>
        <RatingStars value={post.rating} size="sm" />
      </div>
      <span className="text-xs text-slate-400">
        {new Date(post.created_at).toLocaleDateString()}
      </span>

      {post.notes && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
          {post.notes}
        </p>
      )}

      {post.photo_urls.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.photo_urls.map((url) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer">
              <img
                src={url}
                alt=""
                loading="lazy"
                className="h-24 w-24 rounded-md object-cover"
              />
            </a>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-4 text-sm">
        <button
          type="button"
          onClick={() => setShowThread((s) => !s)}
          className="text-sky-600 hover:underline"
        >
          {showThread ? 'Hide discussion' : 'Reply / discuss'}
        </button>
        {session && (
          <>
            <button
              type="button"
              onClick={() => onEdit(post)}
              className="text-slate-500 hover:text-slate-700"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="text-slate-500 hover:text-red-600"
            >
              Delete
            </button>
          </>
        )}
      </div>

      {showThread && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <CommentThread target={{ postId: post.id }} compact />
        </div>
      )}
    </div>
  )
}
