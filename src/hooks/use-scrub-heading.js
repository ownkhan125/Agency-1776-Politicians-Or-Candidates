'use client'

import { useLayoutEffect, useRef } from 'react'

import { gsap } from '@/utils/register-gsap'

/*
 * Scroll-scrub heading reveal — heading progress ties directly to scroll
 * position between `start` and `end`. Use for section headings that should
 * feel like they are being "pulled out of the page" by the reader.
 *
 * Tuned so the heading is ALREADY readable the instant it enters view: it
 * starts at ~40% opacity (not 12%) and finishes resolving high in the
 * viewport, so scrolling isn't a prerequisite for parsing the title.
 *
 * Targets `[data-scrub="word"]` inside the ref. Provide those via
 * <SplitText mode="scrub">.
 */

const DEFAULTS = {
  start: 'top 92%',
  end: 'top 55%',
  scrub: 0.5,
  fromOpacity: 0.4,
  fromY: 18,
  stagger: 0.03,
}

export const useScrubHeading = (options = {}) => {
  const opts = { ...DEFAULTS, ...options }
  const ref = useRef(null)

  useLayoutEffect(() => {
    if (!ref.current) return undefined

    const el = ref.current

    const ctx = gsap.context(() => {
      const words = el.querySelectorAll('[data-scrub="word"]')
      if (!words.length) return

      gsap.set(words, {
        opacity: opts.fromOpacity,
        y: opts.fromY,
        willChange: 'transform, opacity',
      })

      gsap.to(words, {
        opacity: 1,
        y: 0,
        ease: 'none',
        stagger: opts.stagger,
        scrollTrigger: {
          trigger: el,
          start: opts.start,
          end: opts.end,
          scrub: opts.scrub,
        },
      })
    }, el)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.start, opts.end, opts.scrub])

  return ref
}
