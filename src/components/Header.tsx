import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function navClass({ isActive }: { isActive: boolean }) {
  return `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-sky-600 text-white'
      : 'text-slate-600 hover:bg-slate-100'
  }`
}

export default function Header() {
  const { session, signOut, configured } = useAuth()
  const location = useLocation()

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden>
          🌴
        </span>
        <span className="text-lg font-bold text-slate-900">
          Vía Conmigo
        </span>
      </Link>

      <nav className="flex items-center gap-1">
        <NavLink to="/" end className={navClass}>
          🗺️ Map
        </NavLink>
        <NavLink to="/list" className={navClass}>
          📋 List
        </NavLink>
        {session && (
          <NavLink to="/add" className={navClass}>
            ➕ Add
          </NavLink>
        )}
        {session && (
          <NavLink to="/feedback" className={navClass}>
            💬 Feedback
          </NavLink>
        )}

        {session ? (
          <button
            type="button"
            onClick={() => void signOut()}
            className="ml-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            Log out
          </button>
        ) : (
          configured && (
            <Link
              to="/login"
              state={{ from: location.pathname }}
              className="ml-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Log in
            </Link>
          )
        )}
      </nav>
    </header>
  )
}
