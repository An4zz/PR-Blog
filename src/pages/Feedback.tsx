import { useEffect, useState } from 'react'
import {
  deleteFeedback,
  fetchFeedback,
  setFeedbackStatus,
} from '../data/feedback'
import type { Feedback } from '../lib/types'

export default function FeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'open' | 'all'>('open')

  useEffect(() => {
    let active = true
    fetchFeedback()
      .then((d) => active && setItems(d))
      .catch((e) => active && setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  async function toggle(item: Feedback) {
    const status = item.status === 'open' ? 'resolved' : 'open'
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status } : i))
    )
    await setFeedbackStatus(item.id, status)
  }

  async function remove(id: string) {
    if (!confirm('Delete this feedback?')) return
    setItems((prev) => prev.filter((i) => i.id !== id))
    await deleteFeedback(id)
  }

  const visible = items.filter((i) => filter === 'all' || i.status === 'open')

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Feedback</h1>
          <div className="flex gap-1 text-sm">
            {(['open', 'all'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1 capitalize ${
                  filter === f
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-center text-slate-400">Loading…</p>}
        {error && (
          <p className="rounded-md bg-red-50 p-3 text-center text-red-700">
            {error}
          </p>
        )}
        {!loading && !error && visible.length === 0 && (
          <p className="py-12 text-center text-slate-500">
            No {filter === 'open' ? 'open ' : ''}feedback yet.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {visible.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border p-4 ${
                item.status === 'resolved'
                  ? 'border-slate-200 bg-slate-50 opacity-70'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold">
                  {item.type === 'bug' ? '🐞 Bug' : '💡 Suggestion'}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {item.message}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 text-xs text-slate-400">
                {item.author_name && <span>by {item.author_name}</span>}
                {item.page && <span>on {item.page}</span>}
                {item.status === 'resolved' && (
                  <span className="font-medium text-emerald-600">resolved</span>
                )}
              </div>
              <div className="mt-3 flex gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => toggle(item)}
                  className="text-sky-600 hover:underline"
                >
                  {item.status === 'open'
                    ? 'Mark resolved'
                    : 'Reopen'}
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="text-slate-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
