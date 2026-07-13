'use client'

import { useLayoutEffect, useRef } from 'react'

import { gsap } from '@/utils/register-gsap'

/*
 * Magnetic pointer attractor. The element the ref is attached to becomes the
 * "hit zone"; when the pointer enters, the child selector (or the element
 * itself if not provided) tweens toward the cursor within `strength`.
 *
 * - Skipped on coarse pointers (touch) — no benefit, unwanted lag.
 * - Uses gsap.quickTo for GPU-composited transforms with minimal overhead.
 * - Cleans up on unmount via gsap.context.
 */

export const useMagnetic = ({
  strength = 0.3,
  radius = 1.4,
  childSelector,
} = {}) => {
  const ref = useRef(null)

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (window.matchMedia('(pointer: coarse)').matches) return undefined
    if (!ref.current) return undefined

    const host = ref.current
    const target = childSelector ? host.querySelector(childSelector) : host
    if (!target) return undefined

    const ctx = gsap.context(() => {
      gsap.set(target, { x: 0, y: 0, willChange: 'transform' })

      const xTo = gsap.quickTo(target, 'x', {
        duration: 0.55,
        ease: 'expo.out',
      })
      const yTo = gsap.quickTo(target, 'y', {
        duration: 0.55,
        ease: 'expo.out',
      })

      const handleMove = (event) => {
        const rect = host.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = event.clientX - cx
        const dy = event.clientY - cy

        // Optional soft-cutoff: pointer within `radius` * half-diag counts.
        const maxDist = Math.max(rect.width, rect.height) * radius
        const dist = Math.hypot(dx, dy)
        const falloff = dist > maxDist ? 0 : 1

        xTo(dx * strength * falloff)
        yTo(dy * strength * falloff)
      }

      const handleLeave = () => {
        xTo(0)
        yTo(0)
      }

      host.addEventListener('pointermove', handleMove)
      host.addEventListener('pointerleave', handleLeave)

      return () => {
        host.removeEventListener('pointermove', handleMove)
        host.removeEventListener('pointerleave', handleLeave)
      }
    }, host)

    return () => ctx.revert()
  }, [strength, radius, childSelector])

  return ref
}
