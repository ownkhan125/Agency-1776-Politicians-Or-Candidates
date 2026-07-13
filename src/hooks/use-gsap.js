'use client'

import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

export const useGsap = (setup, deps = []) => {
  const scopeRef = useRef(null)

  useLayoutEffect(() => {
    if (!scopeRef.current) return undefined

    const ctx = gsap.context(() => {
      setup?.(scopeRef.current)
    }, scopeRef)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return scopeRef
}
