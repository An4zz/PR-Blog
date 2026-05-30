import { useEffect, useMemo } from 'react'

interface Props {
  file: File | null
  /** Existing photo URL (when editing), shown if no new file is selected. */
  existingUrl?: string | null
  onChange: (file: File | null) => void
}

export default function PhotoUpload({ file, existingUrl, onChange }: Props) {
  // Derive the object URL from the file rather than storing it in state.
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  )

  // Revoke the object URL when it changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const shown = preview ?? existingUrl ?? null

  return (
    <div className="flex items-center gap-4">
      {shown ? (
        <img
          src={shown}
          alt="Preview"
          className="h-24 w-24 rounded-md object-cover"
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-md bg-slate-100 text-3xl text-slate-300">
          📷
        </div>
      )}
      <div className="flex flex-col gap-1">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        {(preview || existingUrl) && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="self-start text-xs text-slate-500 underline hover:text-slate-700"
          >
            Remove selected photo
          </button>
        )}
      </div>
    </div>
  )
}
