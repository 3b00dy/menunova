import clsx from 'clsx'

/**
 * MenuNova brand assets — the single source of truth for the platform mark.
 *
 * The "Nova-M" icon is the geometric construction from the brand guideline
 * (12×12 grid): two structural pillars — the letter **M** / a dashboard nav
 * rail — bridged by a floating central "sync node" rendered in the Emerald
 * accent (#16A34A). Pillars use `currentColor` so the mark inherits its
 * surrounding text color (white on the navy badge, navy on light surfaces).
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Pillar A + Pillar B */}
      <rect x="0" y="0" width="3" height="12" rx="0.75" fill="currentColor" />
      <rect x="9" y="0" width="3" height="12" rx="0.75" fill="currentColor" />
      {/* Central sync node (0.5-unit gutters keep it separated from the pillars) */}
      <rect x="3.5" y="3.5" width="5" height="3" rx="0.75" fill="#16A34A" />
    </svg>
  )
}

const BADGE_SIZES = {
  sm: 'h-7 w-7 rounded-lg',
  md: 'h-8 w-8 rounded-lg',
  lg: 'h-11 w-11 rounded-xl',
} as const

/** The Nova-M mark on the Dark Navy squircle badge (app-icon lockup). */
export function BrandBadge({
  size = 'md',
  className,
}: {
  size?: keyof typeof BADGE_SIZES
  className?: string
}) {
  return (
    <span
      className={clsx(
        'grid place-items-center bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-fg))]',
        BADGE_SIZES[size],
        className,
      )}
    >
      <BrandMark className="h-1/2 w-1/2" />
    </span>
  )
}

/**
 * The "MenuNova" wordmark. Per the brand typography rules: "Menu" is Bold
 * (700) with compressed −0.02em tracking; "Nova" is Medium (500) aired out to
 * +0.04em. Sentence case, always — never MENUNOVA or menunova.
 */
export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={clsx('inline-flex items-baseline', className)}>
      <span className="font-bold tracking-[-0.02em]">Menu</span>
      <span className="font-medium tracking-[0.04em]">Nova</span>
    </span>
  )
}

/** Horizontal lockup: badge + wordmark. The default platform logo. */
export function BrandLogo({
  size = 'md',
  className,
}: {
  size?: keyof typeof BADGE_SIZES
  className?: string
}) {
  return (
    <span className={clsx('flex items-center gap-2', className)}>
      <BrandBadge size={size} />
      <BrandWordmark />
    </span>
  )
}
