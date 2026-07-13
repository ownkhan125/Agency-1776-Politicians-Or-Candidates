'use client'

import { useLayoutEffect, useRef } from 'react'

import { useTheme } from '@/hooks/use-theme'
import { gsap } from '@/utils/register-gsap'
import { cn } from '@/utils/cn'

/*
 * Premium theme toggle. A rounded pill containing a sun and moon icon; a red
 * accent "thumb" glides between them via GSAP, carrying a soft glow and a
 * gentle bump on tap. Fully keyboard-accessible, respects reduced motion, and
 * sits naturally in the navbar on every viewport (compact on mobile, roomy
 * on desktop).
 */

const THUMB_TRAVEL_PX = 26

const ThemeToggle = ({ className }) => {
  const { theme, toggle, mounted } = useTheme()
  const buttonRef = useRef(null)
  const thumbRef = useRef(null)
  const glowRef = useRef(null)
  const sunRef = useRef(null)
  const moonRef = useRef(null)

  useLayoutEffect(() => {
    if (!thumbRef.current || !sunRef.current || !moonRef.current) return
    const isDark = theme === 'dark'
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const duration = prefersReduced ? 0 : 0.55
    const ease = 'expo.out'

    gsap.to(thumbRef.current, {
      x: isDark ? THUMB_TRAVEL_PX : 0,
      duration,
      ease,
    })
    gsap.to(sunRef.current, {
      opacity: isDark ? 0.35 : 1,
      scale: isDark ? 0.7 : 1,
      rotate: isDark ? -60 : 0,
      duration: prefersReduced ? 0 : 0.45,
      ease: 'power3.out',
    })
    gsap.to(moonRef.current, {
      opacity: isDark ? 1 : 0.35,
      scale: isDark ? 1 : 0.7,
      rotate: isDark ? 0 : 60,
      duration: prefersReduced ? 0 : 0.45,
      ease: 'power3.out',
    })
    gsap.to(glowRef.current, {
      x: isDark ? THUMB_TRAVEL_PX : 0,
      duration,
      ease,
    })
  }, [theme, mounted])

  const handleClick = () => {
    if (thumbRef.current) {
      gsap.fromTo(
        thumbRef.current,
        { scale: 1 },
        {
          scale: 0.86,
          duration: 0.12,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        },
      )
    }
    toggle()
  }

  const label =
    theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      data-cursor="button"
      className={cn(
        'group relative inline-flex h-9 w-[60px] shrink-0 items-center border border-muted/70 bg-surface/70 px-1 transition-colors hover:border-accent/70',
        className,
      )}
    >
      {/* Ambient accent bar behind the thumb — hairline, no blur, no circle */}
      <span
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-7 origin-left bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* Sliding thumb — square, matches the rest of the site's language */}
      <span
        ref={thumbRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1 top-1/2 h-7 w-7 -translate-y-1/2 bg-accent"
      />

      {/* Sun icon */}
      <span
        ref={sunRef}
        aria-hidden="true"
        className="relative z-10 flex h-7 w-7 items-center justify-center text-on-accent"
      >
        <SunIcon />
      </span>

      {/* Moon icon */}
      <span
        ref={moonRef}
        aria-hidden="true"
        className="relative z-10 flex h-7 w-7 items-center justify-center text-on-accent"
      >
        <MoonIcon />
      </span>
    </button>
  )
}

const SunIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[14px] w-[14px]"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 3.5v2" />
    <path d="M12 18.5v2" />
    <path d="M3.5 12h2" />
    <path d="M18.5 12h2" />
    <path d="M5.6 5.6l1.4 1.4" />
    <path d="M17 17l1.4 1.4" />
    <path d="M5.6 18.4l1.4-1.4" />
    <path d="M17 7l1.4-1.4" />
  </svg>
)

const MoonIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[14px] w-[14px]"
    aria-hidden="true"
  >
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </svg>
)

export default ThemeToggle
