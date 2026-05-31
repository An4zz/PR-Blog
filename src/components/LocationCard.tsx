import { Link } from 'react-router-dom'
import RatingStars from './RatingStars'
import CategoryBadge from './CategoryBadge'
import type { LocationWithStats } from '../lib/types'

export default function LocationCard({ location }: { location: LocationWithStats }) {
  const thumb = location.photos[0]
  return (
    <Link
      to={`/location/${location.id}`}
      className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {thumb ? (
        <img
          src={thumb}
          alt={location.name}
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
          <h3 className="truncate font-semibold text-slate-900">
            {location.name}
          </h3>
          {location.postCount > 0 ? (
            <span className="flex items-center gap-1 whitespace-nowrap">
              <RatingStars value={Math.round(location.avgRating)} size="sm" />
              <span className="text-xs text-slate-500">
                {location.avgRating.toFixed(1)}
              </span>
            </span>
          ) : (
            <span className="text-xs text-slate-400">No reviews yet</span>
          )}
        </div>
        <CategoryBadge category={location.category} />
        <span className="mt-auto text-xs text-slate-400">
          {location.postCount}{' '}
          {location.postCount === 1 ? 'review' : 'reviews'} · added by{' '}
          {location.author_name}
        </span>
      </div>
    </Link>
  )
}
