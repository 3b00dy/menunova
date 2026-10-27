'use client'

import { useRef, useState, type DragEvent } from 'react'
import { ImagePlus, Link2, RefreshCw, Trash2 } from 'lucide-react'
import { useI18n } from '@/shared/i18n/I18nProvider'
import { cloudinaryEnabled, uploadImage, UploadError } from '@/shared/media/cloudinary'
import { cn } from '@/shared/utils/cn'
import { Input, Label } from './Input'
import { Spinner } from './Spinner'

/**
 * Image picker for logos, covers and item photos: choose or drag a file and it
 * uploads (see `shared/media/cloudinary.ts`), with a live preview, Replace and
 * Remove. "Paste a link instead" stays available. When uploads aren't
 * configured it is just the link field, so forms keep working.
 */
export function ImageUpload({
  label,
  hint,
  value,
  onChange,
  folder,
  shape = 'square',
  disabled,
}: {
  label: string
  hint?: string
  value: string
  onChange: (url: string) => void
  /** Cloudinary folder, e.g. `menunova/<slug>`. */
  folder?: string
  /** Preview frame: a square tile (logo, dish) or a wide banner (cover). */
  shape?: 'square' | 'wide'
  disabled?: boolean
}) {
  const { dictionary } = useI18n()
  const u = dictionary.upload
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [linkMode, setLinkMode] = useState(!cloudinaryEnabled)
  const [dragging, setDragging] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    setBusy(true)
    try {
      onChange(await uploadImage(file, { folder }))
    } catch (e) {
      const code = e instanceof UploadError ? e.code : 'failed'
      setError(code === 'too_large' ? u.tooLarge : code === 'not_image' ? u.notImage : u.failed)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (!disabled && !busy) void handleFile(e.dataTransfer.files?.[0])
  }

  const frame = shape === 'wide' ? 'aspect-[3/1] w-full' : 'h-28 w-28'

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>

      {linkMode ? (
        <Input
          dir="ltr"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
        />
      ) : (
        <div className={cn('flex gap-3', shape === 'wide' ? 'flex-col' : 'items-center')}>
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              'relative shrink-0 overflow-hidden rounded-[var(--radius-active)] border-2 border-dashed transition-colors',
              frame,
              dragging
                ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/5'
                : 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]',
            )}
          >
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element -- user/tenant asset
              <img src={value} alt="" className="h-full w-full object-cover" />
            ) : (
              <button
                type="button"
                disabled={disabled || busy}
                onClick={() => inputRef.current?.click()}
                className="grid h-full w-full place-items-center text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))]"
                aria-label={u.upload}
              >
                <ImagePlus className="h-7 w-7" />
              </button>
            )}
            {busy && (
              <div className="absolute inset-0 grid place-items-center bg-black/40 text-white">
                <Spinner className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={disabled || busy}
                onClick={() => inputRef.current?.click()}
                className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] px-3 text-sm font-medium text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface))] disabled:opacity-50"
              >
                {value ? <RefreshCw className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
                {busy ? u.uploading : value ? u.replace : u.upload}
              </button>
              {value && !busy && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange('')}
                  className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-active)] px-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {u.remove}
                </button>
              )}
            </div>
            <p className="text-xs text-[rgb(var(--color-muted))]">{hint ?? u.dropHint}</p>
          </div>
        </div>
      )}

      {cloudinaryEnabled && (
        <button
          type="button"
          onClick={() => setLinkMode((v) => !v)}
          className="inline-flex w-fit items-center gap-1 text-xs text-[rgb(var(--color-muted))] underline hover:text-[rgb(var(--color-text))]"
        >
          {linkMode ? <ImagePlus className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
          {linkMode ? u.useUpload : u.pasteLink}
        </button>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
