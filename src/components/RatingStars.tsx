interface Props {
  value: number
  /** When provided, renders an interactive star input. */
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' }

export default function RatingStars({ value, onChange, size = 'md' }: Props) {
  const interactive = Boolean(onChange)
  const stars = [1, 2, 3, 4, 5]

  return (
    <div
      className={`inline-flex ${SIZES[size]} leading-none`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`Rating: ${value} out of 5`}
    >
      {stars.map((n) => {
        const filled = n <= value
        const star = (
          <span className={filled ? 'text-amber-400' : 'text-slate-300'}>★</span>
        )
        if (!interactive) return <span key={n}>{star}</span>
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange?.(n)}
            className="cursor-pointer px-0.5 transition-transform hover:scale-110"
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            aria-checked={value === n}
            role="radio"
          >
            {star}
          </button>
        )
      })}
    </div>
  )
}
