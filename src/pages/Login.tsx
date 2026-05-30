import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Mode = 'signin' | 'signup'

export default function Login() {
  const { signIn, signUp, configured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)
    try {
      if (mode === 'signup') {
        const loggedIn = await signUp(email, password, name.trim())
        if (loggedIn) {
          navigate(from, { replace: true })
        } else {
          // Email confirmation is enabled in Supabase.
          setNotice(
            'Account created! Check your email for a confirmation link, then come back and sign in.'
          )
          setMode('signin')
        }
      } else {
        await signIn(email, password)
        navigate(from, { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const isSignup = mode === 'signup'

  return (
    <div className="flex h-full items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-xl font-bold text-slate-900">
          {isSignup ? 'Create an account' : 'Log in'}
        </h1>
        <p className="text-sm text-slate-500">
          {isSignup
            ? 'Sign up to add and review places. Anyone can browse without an account.'
            : 'Log in to add and edit places. Everyone else can browse without an account.'}
        </p>

        {!configured && (
          <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            Supabase isn’t configured yet, so accounts are disabled. Add the
            VITE_SUPABASE_* environment variables to enable them.
          </p>
        )}

        {notice && (
          <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
            {notice}
          </p>
        )}

        {isSignup && (
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Your name</span>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2"
              placeholder="Shown as the author of your posts"
              required
            />
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
            minLength={6}
            required
          />
          {isSignup && (
            <span className="text-xs text-slate-400">At least 6 characters.</span>
          )}
        </label>

        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy || !configured}
          className="rounded-md bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {busy
            ? 'Please wait…'
            : isSignup
              ? 'Create account'
              : 'Sign in'}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(isSignup ? 'signin' : 'signup')
            setError(null)
            setNotice(null)
          }}
          className="text-sm text-sky-600 hover:underline"
        >
          {isSignup
            ? 'Already have an account? Log in'
            : "New here? Create an account"}
        </button>
      </form>
    </div>
  )
}
