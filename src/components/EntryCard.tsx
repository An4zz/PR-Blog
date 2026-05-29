import { Link } from 'react-router-dom'
import type { Entry } from '../lib/types'
import RatingStars from './RatingStars'
import CategoryBadge from './CategoryBadge'

export default function EntryCard({ entry }: { entry: Entry }) {
  return (
    <Link
      to={`/entry/${entry.id}`}
      className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {entry.photo_url ? (
        <img
          src={entry.photo_url}
          alt={entry.name}
          loading="lazy"
          className="h-28 w-28 flex-shrink-0 object-cover"
        />
      ) : (
        <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center bg-slate-100 text-3xl">
          📍
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold text-slate-900">{entry.name}</h3>
          <RatingStars value={entry.rating} size="sm" />
        </div>
        <CategoryBadge category={entry.category} />
        {entry.description && (
          <p className="line-clamp-2 text-sm text-slate-600">
            {entry.description}
          </p>
        )}
        <span className="mt-auto text-xs text-slate-400">
          by {entry.author_name}
        </span>
      </div>
    </Link>
  )
}
