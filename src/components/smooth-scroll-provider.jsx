'use client'

import { useLayoutEffect, useRef } from 'react'
import { ScrollSmoother } from 'gsap/ScrollSmoother'

import { gsap, ScrollTrigger } from '@/utils/register-gsap'

if (typeof window !== 'undefined' && !gsap.core.globals().ScrollSmoother) {
  gsap.registerPlugin(ScrollSmoother)
}

/*
 * GSAP ScrollSmoother wrapper. Requires the child DOM to sit inside a
 * two-tier wrapper/content pair. Fixed-position elements (top bar, navbar,
 * custom cursor) MUST live OUTSIDE this provider — ScrollSmoother uses a
 * translate on `#smooth-content`, and any `position: fixed` inside would
 * silently become `position: absolute` relative to the transformed parent.
 *
 * After creation we `ScrollTrigger.refresh()` so all pre-existing triggers
 * from sections (mounted before this parent effect ran) re-associate with the
 * smoothed scroller.
 */

const SmoothScrollProvider = ({ children }) => {
  const wrapperRef = useRef(null)
  const contentRef = useRef(null)

  useLayoutEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return undefined

    const smoother = ScrollSmoother.create({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      smooth: 1.2,
      effects: true,
      normalizeScroll: true,
      ignoreMobileResize: true,
      smoothTouch: 0,
    })

    ScrollTrigger.refresh()

    return () => {
      smoother.kill()
    }
  }, [])

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  )
}

export default SmoothScrollProvider
