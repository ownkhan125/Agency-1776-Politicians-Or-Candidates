'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

/*
 * Adaptive premium cursor. Two layers:
 *   - Inner dot: precise, low latency (light spring)
 *   - Outer ring: chases the dot with a slower spring — gives depth
 *
 * Mode is derived from the element under the pointer:
 *   default → dot + minimal ring
 *   button  → ring expands, becomes filled accent capsule
 *   link    → ring grows, dot fades slightly
 *   card    → ring inflates to a larger contour
 *   media   → ring stretches into a wide contextual pill
 *
 * Hidden entirely on touch / coarse-pointer devices via a media query on
 * the root wrapper — no CSS override to fight the native cursor there.
 */

const MODE_STYLES = {
  default: { ringSize: 40, ringOpacity: 1, ringFill: 0, dotOpacity: 1 },
  button: { ringSize: 66, ringOpacity: 1, ringFill: 1, dotOpacity: 0 },
  link: { ringSize: 56, ringOpacity: 1, ringFill: 0, dotOpacity: 0.4 },
  card: { ringSize: 96, ringOpacity: 0.8, ringFill: 0, dotOpacity: 0.6 },
  media: { ringSize: 120, ringOpacity: 0.7, ringFill: 0, dotOpacity: 0 },
}

const CustomCursor = () => {
  const [mode, setMode] = useState('default')
  const [visible, setVisible] = useState(false)
  const [fine, setFine] = useState(false)

  const dotX = useMotionValue(-100)
  const dotY = useMotionValue(-100)
  const ringX = useSpring(dotX, { stiffness: 320, damping: 32, mass: 0.7 })
  const ringY = useSpring(dotY, { stiffness: 320, damping: 32, mass: 0.7 })

  useEffect(() => {
    // fine-pointer gate
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mq = window.matchMedia('(pointer: fine)')
    const handleChange = () => setFine(mq.matches)
    handleChange()
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (!fine) return undefined

    const resolveMode = (target) => {
      if (!(target instanceof Element)) return 'default'
      if (target.closest('[data-cursor="media"]')) return 'media'
      if (target.closest('[data-cursor="card"]')) return 'card'
      if (target.closest('button, [role="button"], [data-cursor="button"]'))
        return 'button'
      if (target.closest('a, [data-cursor="link"]')) return 'link'
      return 'default'
    }

    const handleMove = (event) => {
      dotX.set(event.clientX)
      dotY.set(event.clientY)
      if (!visible) setVisible(true)
      setMode(resolveMode(event.target))
    }
    const handleLeave = () => setVisible(false)
    const handleEnter = () => setVisible(true)

    window.addEventListener('mousemove', handleMove, { passive: true })
    window.addEventListener('mouseleave', handleLeave)
    window.addEventListener('mouseenter', handleEnter)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseleave', handleLeave)
      window.removeEventListener('mouseenter', handleEnter)
    }
  }, [fine, visible, dotX, dotY])

  if (!fine) return null

  const style = MODE_STYLES[mode] ?? MODE_STYLES.default
  const spring = { type: 'spring', stiffness: 380, damping: 30, mass: 0.6 }

  return (
    <>
      {/* Outer ring — chases via spring */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full border border-foreground/70 mix-blend-difference"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: style.ringSize,
          height: style.ringSize,
          opacity: visible ? style.ringOpacity : 0,
          backgroundColor: style.ringFill
            ? 'var(--color-accent)'
            : 'rgba(0,0,0,0)',
          borderColor: style.ringFill
            ? 'var(--color-accent)'
            : 'rgba(240,237,230,0.7)',
        }}
        transition={spring}
      />

      {/* Inner dot — precise */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[101] h-1.5 w-1.5 rounded-full bg-foreground mix-blend-difference"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{ opacity: visible ? style.dotOpacity : 0 }}
        transition={{ duration: 0.18 }}
      />
    </>
  )
}

export default CustomCursor
