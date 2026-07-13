'use client'

import { Globe } from 'lucide-react'
import { LANGUAGE_CODES, SUPPORTED_LANGUAGES } from '@/shared/i18n/languages'
import { useLanguage } from '@/shared/i18n/useLanguage'
import { cn } from '@/shared/utils/cn'
interface Props {
  /** Restrict the picker to a subset of languages (e.g. restaurant's supported list). */
  supportedCodes?: string[]
  /** Compact variant — icon + native code only. */
  compact?: boolean
  className?: string
}

export function LanguagePicker({ supportedCodes, compact, className }: Props) {
  const { lang, setLang } = useLanguage()
  const codes = (supportedCodes && supportedCodes.length > 0
    ? supportedCodes
    : LANGUAGE_CODES
  ).filter((c) => SUPPORTED_LANGUAGES[c])

  if (codes.length <= 1) return null

  return (
    <label
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] ps-2.5 pe-1 h-9 text-sm hover:bg-[rgb(var(--color-surface))] transition-colors cursor-pointer',
        className,
      )}
    >
      <Globe className="h-4 w-4 text-[rgb(var(--color-muted))]" />
      <span className="sr-only">Language</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="bg-transparent appearance-none cursor-pointer focus:outline-none px-1 py-1 text-sm font-medium"
      >
        {codes.map((code) => {
          const def = SUPPORTED_LANGUAGES[code]
          return (
            <option key={code} value={code}>
              {compact ? def.code.toUpperCase() : `${def.name}`}
            </option>
          )
        })}
      </select>
    </label>
  )
}
