'use client'

import { useLayoutEffect, useRef } from 'react'

import { gsap } from '@/utils/register-gsap'
import { cn } from '@/utils/cn'

/*
 * Ambient animated-line backdrop. Purely decorative — pointer-events none,
 * aria-hidden. Renders vertical hairlines with GSAP-animated accent pulses
 * that drift downward, plus a single accent tracer that eases across the
 * width. No gradients, no grids, no blur blooms.
 *
 * `tone`:
 *   default   — foreground-toned hairlines (dark sections)
 *   muted     — same hairlines with an accent tracer (surface sections)
 *   contrast  — brighter hairlines for the deepest surfaces (contact/footer)
 */

/*
 * `color-mix` lets us drive the ambient hairline colours from theme tokens.
 * In dark the foreground is cream — we want faint cream rails on black. In
 * light the foreground is near-black — we want faint dark rails on white.
 * By blending the theme foreground with `transparent`, both themes get the
 * correct low-opacity chrome for free.
 */
const TONE = {
  default: {
    line: 'color-mix(in srgb, var(--color-foreground) 6%, transparent)',
    pulse: 'color-mix(in srgb, var(--color-accent) 85%, transparent)',
    tracer: 'color-mix(in srgb, var(--color-foreground) 35%, transparent)',
  },
  muted: {
    line: 'color-mix(in srgb, var(--color-foreground) 5%, transparent)',
    pulse: 'color-mix(in srgb, var(--color-accent) 70%, transparent)',
    tracer: 'color-mix(in srgb, var(--color-accent) 60%, transparent)',
  },
  contrast: {
    line: 'color-mix(in srgb, var(--color-foreground) 9%, transparent)',
    pulse: 'color-mix(in srgb, var(--color-accent) 95%, transparent)',
    tracer: 'color-mix(in srgb, var(--color-foreground) 50%, transparent)',
  },
}

const LineBackdrop = ({
  className,
  tone = 'default',
  columns = 12,
  pulses = 3,
}) => {
  const rootRef = useRef(null)
  const colors = TONE[tone] ?? TONE.default

  useLayoutEffect(() => {
    if (!rootRef.current) return undefined
    const root = rootRef.current

    const ctx = gsap.context(() => {
      // Vertical hairline pulses — accent squares drifting down each column,
      // random start delay so they never sync.
      const dots = root.querySelectorAll('[data-line="pulse"]')
      dots.forEach((el) => {
        gsap.set(el, { yPercent: -20, opacity: 0 })
        gsap.to(el, {
          yPercent: 1200,
          opacity: 1,
          duration: gsap.utils.random(9, 16),
          repeat: -1,
          ease: 'none',
          delay: gsap.utils.random(0, 8),
          keyframes: [
            { opacity: 0, duration: 0 },
            { opacity: 1, duration: 0.15 },
            { opacity: 1, duration: 0.7 },
            { opacity: 0, duration: 0.15 },
          ],
        })
      })

      // Horizontal tracer — thin accent line that sweeps left-to-right.
      const tracer = root.querySelector('[data-line="tracer"]')
      if (tracer) {
        gsap.set(tracer, { xPercent: -100, opacity: 0 })
        gsap.to(tracer, {
          xPercent: 100,
          opacity: 1,
          duration: 6,
          delay: 1.4,
          repeat: -1,
          repeatDelay: 4,
          ease: 'power2.inOut',
          keyframes: [
            { opacity: 0, duration: 0 },
            { opacity: 0.9, duration: 0.15 },
            { opacity: 0.9, duration: 0.7 },
            { opacity: 0, duration: 0.15 },
          ],
        })
      }

      // Static hairlines gently breathe in opacity so the field feels alive
      // without being distracting.
      const lines = root.querySelectorAll('[data-line="rail"]')
      lines.forEach((line, i) => {
        gsap.fromTo(
          line,
          { opacity: 0.4 },
          {
            opacity: 1,
            duration: gsap.utils.random(3.5, 6),
            delay: i * 0.05,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          },
        )
      })
    }, root)

    return () => ctx.revert()
  }, [columns, pulses])

  const railIndices = Array.from({ length: columns })
  const pulseIndices = Array.from({ length: pulses })

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
    >
      {/* Vertical hairlines. Positioned by percentage so they scale with the
          container without needing a resize listener. */}
      {railIndices.map((_, i) => {
        const left = ((i + 0.5) / columns) * 100
        return (
          <span
            key={`rail-${i}`}
            data-line="rail"
            className="absolute top-0 h-full w-px"
            style={{ left: `${left}%`, background: colors.line }}
          />
        )
      })}

      {/* Column pulses — a square dot drifts down inside a random column. */}
      {pulseIndices.map((_, i) => {
        const col = (i * 5 + 2) % columns
        const left = ((col + 0.5) / columns) * 100
        return (
          <span
            key={`pulse-${i}`}
            data-line="pulse"
            className="absolute top-0 h-6 w-px will-change-transform"
            style={{ left: `${left}%`, background: colors.pulse }}
          />
        )
      })}

      {/* Horizontal accent tracer. */}
      <span
        data-line="tracer"
        className="absolute left-0 top-1/2 h-px w-1/3 will-change-transform"
        style={{ background: colors.tracer }}
      />
    </div>
  )
}

export default LineBackdrop
