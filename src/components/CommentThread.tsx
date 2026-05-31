import { useEffect, useState, type FormEvent } from 'react'
import { fetchComments, insertComment, deleteComment } from '../data/comments'
import { useAuth } from '../context/AuthContext'
import type { Comment } from '../lib/types'

type Target = { locationId: string } | { postId: string }

/** A flat comment thread for a location or a post: lists comments and, when
 *  logged in, lets you add or delete them. */
export default function CommentThread({
  target,
  compact = false,
}: {
  target: Target
  compact?: boolean
}) {
  const { session, user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)

  const key = 'locationId' in target ? target.locationId : target.postId

  useEffect(() => {
    let active = true
    fetchComments(target)
      .then((c) => active && setComments(c))
      .catch(() => active && setComments([]))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  async function add(e: FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setBusy(true)
    try {
      const authorName =
        (user?.user_metadata?.name as string | undefined) ??
        user?.email?.split('@')[0] ??
        'Anonymous'
      const created = await insertComment({
        location_id: 'locationId' in target ? target.locationId : null,
        post_id: 'postId' in target ? target.postId : null,
        body: body.trim(),
        author_name: authorName,
      })
      setComments((prev) => [...prev, created])
      setBody('')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    setComments((prev) => prev.filter((c) => c.id !== id))
    try {
      await deleteComment(id)
    } catch {
      // reload on failure to resync
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className={compact ? 'text-sm font-semibold' : 'font-semibold'}>
        💬 Discussion {comments.length > 0 && `(${comments.length})`}
      </h3>

      {loading ? (
        <p className="text-sm text-slate-400">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-400">No comments yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {comments.map((c) => (
            <li key={c.id} className="rounded-md bg-slate-50 px-3 py-2 text-sm">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium text-slate-800">
                  {c.author_name}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-slate-700">{c.body}</p>
              {session && (
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  className="mt-1 text-xs text-slate-400 hover:text-red-600"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {session ? (
        <form onSubmit={add} className="flex flex-col gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            placeholder="Add a comment…"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={busy || !body.trim()}
            className="self-start rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {busy ? 'Posting…' : 'Comment'}
          </button>
        </form>
      ) : (
        <p className="text-xs text-slate-400">Log in to join the discussion.</p>
      )}
    </div>
  )
}
