import { useEffect } from 'react'

interface Props {
  photos: string[]
  index: number
  onClose: () => void
  onIndex: (i: number) => void
}

/** Full-screen, in-page photo viewer. Click the backdrop, press Esc, or hit ×
 *  to close; arrow keys / on-screen arrows page through multiple photos. */
export default function Lightbox({ photos, index, onClose, onIndex }: Props) {
  const count = photos.length
  const prev = () => onIndex((index - 1 + count) % count)
  const next = () => onIndex((index + 1) % count)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (count > 1 && e.key === 'ArrowRight') next()
      else if (count > 1 && e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    // Prevent the page behind from scrolling while open.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, count])

  const stop = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25"
      >
        ×
      </button>

      {count > 1 && (
        <button
          type="button"
          onClick={(e) => {
            stop(e)
            prev()
          }}
          aria-label="Previous photo"
          className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-3xl text-white hover:bg-white/25"
        >
          ‹
        </button>
      )}

      <img
        src={photos[index]}
        alt=""
        onClick={stop}
        className="max-h-[90vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
      />

      {count > 1 && (
        <button
          type="button"
          onClick={(e) => {
            stop(e)
            next()
          }}
          aria-label="Next photo"
          className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-3xl text-white hover:bg-white/25"
        >
          ›
        </button>
      )}

      {count > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-sm text-white">
          {index + 1} / {count}
        </div>
      )}
    </div>
  )
}
