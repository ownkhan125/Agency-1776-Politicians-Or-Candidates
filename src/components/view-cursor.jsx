'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

/*
 * ViewCursor — a scoped "View" pill that follows the pointer, but only while
 * it is over an element tagged `data-cursor="view"` (or the legacy
 * `data-cursor="media"`). The native OS cursor is never hidden — this bubble
 * sits alongside it, offering the "view" affordance without stripping the
 * user's normal pointer, I-beam, or link hand.
 *
 * Hidden entirely on:
 *   - coarse-pointer devices (touch)
 *   - text-editing surfaces (inputs, textareas, contenteditable), so the
 *     browser's I-beam takes over cleanly
 *
 * Fully theme-adaptive:
 *   - Pill background       = `--color-accent`
 *   - Label colour           = `--color-on-accent`
 *   - Contrast holds in both themes since the on-accent token stays cream.
 */

const POS_SPRING = { damping: 28, stiffness: 340, mass: 0.55 }
const SCALE_SPRING = { damping: 22, stiffness: 260, mass: 0.5 }

const VIEW_SELECTOR =
  '[data-cursor="view"], [data-cursor="media"]'

const INPUT_MATCHER =
  'input, textarea, select, [contenteditable="true"]'

const ViewCursor = () => {
  const [fine, setFine] = useState(false)
  const [active, setActive] = useState(false)

  const x = useMotionValue(-200)
  const y = useMotionValue(-200)
  const sx = useSpring(x, POS_SPRING)
  const sy = useSpring(y, POS_SPRING)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mq = window.matchMedia('(pointer: fine)')
    const check = () => setFine(mq.matches)
    check()
    mq.addEventListener('change', check)
    return () => mq.removeEventListener('change', check)
  }, [])

  useEffect(() => {
    if (!fine) return undefined
    const handleMove = (event) => {
      x.set(event.clientX)
      y.set(event.clientY)
      const target = event.target
      if (!(target instanceof Element)) {
        setActive(false)
        return
      }
      if (target.closest(INPUT_MATCHER)) {
        setActive(false)
        return
      }
      setActive(!!target.closest(VIEW_SELECTOR))
    }
    const handleLeave = () => setActive(false)

    window.addEventListener('mousemove', handleMove, { passive: true })
    document.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseleave', handleLeave)
    }
  }, [fine, x, y])

  if (!fine) return null

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] h-0 w-0"
      style={{ x: sx, y: sy }}
    >
      <motion.span
        initial={false}
        animate={{
          opacity: active ? 1 : 0,
          scale: active ? 1 : 0.86,
        }}
        transition={{ type: 'spring', ...SCALE_SPRING }}
        className="font-display absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-accent px-5 py-2.5 text-sm uppercase tracking-[0.22em] text-on-accent shadow-[0_10px_40px_-8px_rgba(0,0,0,0.55)]"
      >
        View
      </motion.span>
    </motion.div>
  )
}

export default ViewCursor
