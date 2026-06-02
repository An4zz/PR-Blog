import { useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { submitFeedback } from '../data/feedback'
import { useAuth } from '../context/AuthContext'
import { friendlyError } from '../lib/errors'
import type { FeedbackType } from '../lib/types'

/** A floating button on every page that opens a quick bug/suggestion form. */
export default function FeedbackButton() {
  const { user } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>('bug')
  const [message, setMessage] = useState('')
  const [name, setName] = useState(
    (user?.user_metadata?.name as string | undefined) ??
      user?.email?.split('@')[0] ??
      ''
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  function close() {
    setOpen(false)
    setError(null)
    setDone(false)
    setMessage('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setBusy(true)
    setError(null)
    try {
      await submitFeedback({
        type,
        message: message.trim(),
        page: location.pathname + location.hash,
        author_name: name.trim() || null,
      })
      setDone(true)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[1000] flex items-center gap-1 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-slate-700"
      >
        💬 Feedback
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[1500] flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <span className="text-3xl">🙌</span>
                <p className="font-medium text-slate-800">
                  Thanks! Your {type === 'bug' ? 'bug report' : 'suggestion'} was
                  sent.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">
                    Send feedback
                  </h2>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close"
                    className="text-xl text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                </div>

                <div className="flex gap-2">
                  {(['bug', 'suggestion'] as FeedbackType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                        type === t
                          ? 'border-sky-600 bg-sky-50 text-sky-700'
                          : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t === 'bug' ? '🐞 Bug' : '💡 Suggestion'}
                    </button>
                  ))}
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">
                    {type === 'bug'
                      ? 'What went wrong?'
                      : 'What would make it better?'}
                  </span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    autoFocus
                    placeholder={
                      type === 'bug'
                        ? 'Describe the bug and what you were doing…'
                        : 'Describe your idea…'
                    }
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">
                    Your name (optional)
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                {error && (
                  <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy || !message.trim()}
                  className="rounded-md bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-700 disabled:opacity-50"
                >
                  {busy ? 'Sending…' : 'Send feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
