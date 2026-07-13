import { cn } from '@/utils/cn'

/*
 * Absolute-positioned border overlay animated in via clip-path expansion.
 * Drop this INSIDE a `relative` container. `useSectionReveal` picks up
 * `data-reveal="border"` and wipes it from left to right (customizable).
 *
 * Uses CSS border (GPU-composited) rather than SVG stroke — no path math
 * required, works with any rectangular container.
 */

const RevealBorder = ({ className, tone = 'muted' }) => {
  const toneClass =
    tone === 'accent' ? 'border-accent' : tone === 'foreground' ? 'border-foreground/30' : 'border-muted'

  return (
    <span
      aria-hidden="true"
      data-reveal="border"
      className={cn(
        'pointer-events-none absolute inset-0 border',
        toneClass,
        className,
      )}
    />
  )
}

export default RevealBorder
