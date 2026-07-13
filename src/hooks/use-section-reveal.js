'use client'

import { useLayoutEffect, useRef } from 'react'

import { gsap } from '@/utils/register-gsap'

/*
 * Canonical section entrance timeline:
 *   1. Border/outline draws in    (data-reveal="border")   — clip-path expansion
 *   2. Icons / SVG elements       (data-reveal="icon")     — scale + fade + rise
 *   3. Text words                 (data-reveal="word")     — masked stagger
 *
 * Timing tokens are exposed via `options` so each section can dial in its own
 * feel. The whole timeline is bound to a ScrollTrigger with `toggleActions`
 * (play on enter, reverse on leave-back) so it is scroll-driven, not on load.
 *
 * All animation is wrapped in a `gsap.context` scoped to the section — on
 * unmount `ctx.revert()` disposes tweens, ScrollTriggers, and inline styles.
 */

const DEFAULTS = {
  start: 'top 78%',
  toggleActions: 'play none none reverse',

  borderDuration: 1.1,
  borderEase: 'power2.out',
  borderStagger: 0.08,

  iconDuration: 0.6,
  iconStagger: 0.08,
  iconEase: 'power3.out',

  wordDuration: 0.75,
  wordStagger: 0.035,
  wordEase: 'expo.out',

  overlap: 0.35,
}

export const useSectionReveal = (options = {}) => {
  const opts = { ...DEFAULTS, ...options }
  const scopeRef = useRef(null)

  useLayoutEffect(() => {
    if (!scopeRef.current) return undefined

    const scope = scopeRef.current

    const ctx = gsap.context(() => {
      const borders = scope.querySelectorAll('[data-reveal="border"]')
      const icons = scope.querySelectorAll('[data-reveal="icon"]')
      const words = scope.querySelectorAll('[data-reveal="word"]')

      gsap.set(borders, {
        clipPath: 'inset(0 100% 0 0)',
        willChange: 'clip-path',
      })
      gsap.set(icons, {
        opacity: 0,
        y: 28,
        scale: 0.92,
        transformOrigin: 'center',
        willChange: 'transform, opacity',
      })
      gsap.set(words, {
        yPercent: 110,
        opacity: 0,
        willChange: 'transform, opacity',
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope,
          start: opts.start,
          toggleActions: opts.toggleActions,
        },
      })

      if (borders.length) {
        tl.to(borders, {
          clipPath: 'inset(0 0% 0 0)',
          duration: opts.borderDuration,
          ease: opts.borderEase,
          stagger: opts.borderStagger,
        })
      }

      if (icons.length) {
        tl.to(
          icons,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: opts.iconDuration,
            ease: opts.iconEase,
            stagger: opts.iconStagger,
          },
          borders.length ? `-=${opts.overlap}` : 0,
        )
      }

      if (words.length) {
        tl.to(
          words,
          {
            yPercent: 0,
            opacity: 1,
            duration: opts.wordDuration,
            ease: opts.wordEase,
            stagger: opts.wordStagger,
          },
          `-=${opts.overlap * 0.85}`,
        )
      }
    }, scope)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.start, opts.toggleActions])

  return scopeRef
}
