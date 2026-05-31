import { useEffect, useMemo } from 'react'

interface Props {
  /** Newly-selected files to upload. */
  files: File[]
  onFilesChange: (files: File[]) => void
  /** Already-uploaded photo URLs (when editing); can be removed individually. */
  existingUrls?: string[]
  onExistingChange?: (urls: string[]) => void
}

/** Multi-photo picker: add several images, preview them, and remove any. */
export default function PhotosUpload({
  files,
  onFilesChange,
  existingUrls = [],
  onExistingChange,
}: Props) {
  const previews = useMemo(
    () => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [files]
  )

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url))
  }, [previews])

  function addFiles(list: FileList | null) {
    if (!list) return
    onFilesChange([...files, ...Array.from(list)])
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {existingUrls.map((url) => (
          <div key={url} className="relative">
            <img src={url} alt="" className="h-20 w-20 rounded-md object-cover" />
            {onExistingChange && (
              <button
                type="button"
                onClick={() =>
                  onExistingChange(existingUrls.filter((u) => u !== url))
                }
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-xs text-white"
                aria-label="Remove photo"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {previews.map((p, i) => (
          <div key={p.url} className="relative">
            <img
              src={p.url}
              alt=""
              className="h-20 w-20 rounded-md object-cover"
            />
            <button
              type="button"
              onClick={() => onFilesChange(files.filter((_, idx) => idx !== i))}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-xs text-white"
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>
        ))}
        <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-slate-300 text-2xl text-slate-400 hover:bg-slate-50">
          +
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = '' // allow re-picking the same file
            }}
            className="hidden"
          />
        </label>
      </div>
      <span className="text-xs text-slate-400">
        Add one or more photos (tap + to choose).
      </span>
    </div>
  )
}
