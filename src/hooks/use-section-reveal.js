'use client'

import { useLayoutEffect, useRef } from 'react'

import { gsap } from '@/utils/register-gsap'

/*
 * Canonical section entrance timeline. Ported to match the reference site's
 * text-reveal motion curve:
 *
 *   t = 0.00   heading characters rise + fade + un-blur   (data-reveal="char")
 *   t = 0.06   borders begin clip-path draw               (data-reveal="border")
 *   t = 0.12   paragraph blocks rise + fade + un-blur     (data-reveal="line")
 *   t = 0.18   icons scale + fade + rise                  (data-reveal="icon")
 *
 * Characters and paragraph lines animate with `autoAlpha` (opacity +
 * visibility together) so hidden state matches the reference fingerprint
 * (`visibility: hidden; opacity: 0`), and the reveal removes a small
 * `filter: blur()` for the "slight blur removal during reveal" feel.
 *
 * Legacy word-mask reveals (`data-reveal="word"`) are still honoured for any
 * markup that has not been migrated to chars/lines yet — they animate on the
 * same beats as the heading/body tracks used to.
 *
 * The timeline is bound to a ScrollTrigger with `toggleActions` (play on
 * enter, reverse on leave-back) — scroll-driven, not on load. All animation
 * is wrapped in a `gsap.context` scoped to the section — on unmount
 * `ctx.revert()` disposes tweens, ScrollTriggers, and inline styles.
 */

const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6'

const DEFAULTS = {
  // Fires when ~22% of the section has entered the viewport — matches the
  // "20–30%" trigger point in the brief and the perceived pace of the ref.
  start: 'top 78%',
  toggleActions: 'play none none reverse',

  borderDuration: 0.85,
  borderEase: 'power2.out',
  borderStagger: 0.05,
  borderPosition: 0.06,

  iconDuration: 0.5,
  iconStagger: 0.05,
  iconEase: 'power3.out',
  iconPosition: 0.18,

  // Word-by-word heading reveal — SCROLL-SCRUBBED. Every heading on the
  // page (h1–h6, plus any non-heading `SplitText mode="words"` block that
  // renders as display type) gets its own ScrollTrigger, so headings reveal
  // exactly as they enter the viewport rather than sharing a section-wide
  // trigger. Tuned for a slower, more cinematic pace: the scrub range is
  // wider, the stagger between words is longer, and the ease favours a
  // long tail so the last words settle rather than snap.
  wordLineStagger: 0.11,
  wordLineEase: 'power3.out',
  wordLineY: 30,
  wordLineBlur: 6,
  wordLineRotate: -2.5,
  wordLineScrubStart: 'top 88%',
  wordLineScrubEnd: 'top 34%',
  wordLineScrub: 0.85,

  // Character-level heading reveal — the reference's signature curve.
  // Reserved for hero H1s.
  charDuration: 0.7,
  charStagger: 0.018,
  charEase: 'power3.out',
  charY: 16,
  charBlur: 4,
  charPosition: 0,

  // Paragraph / block reveal — starts just after the heading begins so the
  // reader is not left staring at a headline before body copy shows up.
  lineDuration: 0.7,
  lineStagger: 0.06,
  lineEase: 'power3.out',
  lineY: 12,
  lineBlur: 3,
  linePosition: 0.18,

  // Legacy word/heading/body tokens — preserved for pre-migration callers.
  headingDuration: 0.55,
  headingStagger: 0.02,
  headingEase: 'expo.out',
  headingPosition: 0,

  bodyDuration: 0.55,
  bodyStagger: 0.02,
  bodyEase: 'expo.out',
  bodyPosition: 0.08,
}

/*
 * Translate legacy `wordDuration` / `wordStagger` / `wordEase` tokens onto the
 * new char/line tokens as well as the legacy heading/body tokens, so
 * pre-existing callers keep their tuning without changes.
 */
const normalizeOptions = (options) => {
  const merged = { ...DEFAULTS, ...options }
  if (options.wordDuration !== undefined) {
    merged.headingDuration = options.wordDuration
    merged.bodyDuration = options.wordDuration
    merged.charDuration = options.wordDuration
    merged.lineDuration = options.wordDuration
  }
  if (options.wordStagger !== undefined) {
    merged.headingStagger = options.wordStagger
    merged.bodyStagger = options.wordStagger
    merged.charStagger = options.wordStagger
    merged.wordLineStagger = options.wordStagger
  }
  if (options.wordEase !== undefined) {
    merged.headingEase = options.wordEase
    merged.bodyEase = options.wordEase
    merged.charEase = options.wordEase
    merged.lineEase = options.wordEase
    merged.wordLineEase = options.wordEase
  }
  return merged
}

const partitionWords = (scope) => {
  const all = Array.from(scope.querySelectorAll('[data-reveal="word"]'))
  const heading = []
  const body = []
  for (const node of all) {
    if (node.closest(HEADING_SELECTOR)) heading.push(node)
    else body.push(node)
  }
  return { heading, body }
}

export const useSectionReveal = (options = {}) => {
  const opts = normalizeOptions(options)
  const scopeRef = useRef(null)

  useLayoutEffect(() => {
    if (!scopeRef.current) return undefined

    const scope = scopeRef.current

    const ctx = gsap.context(() => {
      const borders = scope.querySelectorAll('[data-reveal="border"]')
      const icons = scope.querySelectorAll('[data-reveal="icon"]')
      const chars = scope.querySelectorAll('[data-reveal="char"]')
      const wordLines = scope.querySelectorAll('[data-reveal="word-line"]')
      const lines = scope.querySelectorAll('[data-reveal="line"]')
      const { heading: headingWords, body: bodyWords } = partitionWords(scope)

      if (borders.length) {
        gsap.set(borders, {
          clipPath: 'inset(0 100% 0 0)',
          willChange: 'clip-path',
        })
      }
      if (icons.length) {
        gsap.set(icons, {
          opacity: 0,
          y: 28,
          scale: 0.92,
          transformOrigin: 'center',
          willChange: 'transform, opacity',
        })
      }
      if (chars.length) {
        gsap.set(chars, {
          autoAlpha: 0,
          y: opts.charY,
          filter: `blur(${opts.charBlur}px)`,
          willChange: 'transform, opacity, filter',
        })
      }
      if (wordLines.length) {
        gsap.set(wordLines, {
          autoAlpha: 0,
          y: opts.wordLineY,
          rotate: opts.wordLineRotate,
          filter: `blur(${opts.wordLineBlur}px)`,
          transformOrigin: '0% 100%',
          willChange: 'transform, opacity, filter',
        })
      }
      if (lines.length) {
        gsap.set(lines, {
          autoAlpha: 0,
          y: opts.lineY,
          filter: `blur(${opts.lineBlur}px)`,
          willChange: 'transform, opacity, filter',
        })
      }
      if (headingWords.length || bodyWords.length) {
        gsap.set([...headingWords, ...bodyWords], {
          yPercent: 110,
          opacity: 0,
          willChange: 'transform, opacity',
        })
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope,
          start: opts.start,
          toggleActions: opts.toggleActions,
        },
      })

      // Heading characters lead at t=0 — reader parses the section title
      // within the first frame of the timeline.
      if (chars.length) {
        tl.to(
          chars,
          {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: opts.charDuration,
            ease: opts.charEase,
            stagger: opts.charStagger,
          },
          opts.charPosition,
        )
      }

      // Legacy heading word-masks — same beat as chars for co-existence.
      if (headingWords.length) {
        tl.to(
          headingWords,
          {
            yPercent: 0,
            opacity: 1,
            duration: opts.headingDuration,
            ease: opts.headingEase,
            stagger: opts.headingStagger,
          },
          opts.headingPosition,
        )
      }

      // Borders draw in parallel with the heading — decorative, non-blocking.
      if (borders.length) {
        tl.to(
          borders,
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: opts.borderDuration,
            ease: opts.borderEase,
            stagger: opts.borderStagger,
          },
          opts.borderPosition,
        )
      }

      // Paragraph blocks — slight beat after the heading so the copy resolves
      // while the last few heading characters are still settling.
      if (lines.length) {
        tl.to(
          lines,
          {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: opts.lineDuration,
            ease: opts.lineEase,
            stagger: opts.lineStagger,
          },
          opts.linePosition,
        )
      }

      // Legacy body word-masks — same beat as lines.
      if (bodyWords.length) {
        tl.to(
          bodyWords,
          {
            yPercent: 0,
            opacity: 1,
            duration: opts.bodyDuration,
            ease: opts.bodyEase,
            stagger: opts.bodyStagger,
          },
          opts.bodyPosition,
        )
      }

      // Icons pop last — a supporting flourish, not a prerequisite.
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
          opts.iconPosition,
        )
      }

      // Per-heading scroll-scrub reveal. Every heading is its own trigger,
      // so each one reveals as it enters the viewport rather than sharing
      // a single section-wide scrub. Word-lines not inside a heading (e.g.
      // the footer wordmark rendered as a <p>) fall back to the section
      // scope as trigger so they still animate consistently.
      if (wordLines.length) {
        const groups = new Map()
        wordLines.forEach((el) => {
          const heading = el.closest(HEADING_SELECTOR) || scope
          if (!groups.has(heading)) groups.set(heading, [])
          groups.get(heading).push(el)
        })

        groups.forEach((els, triggerEl) => {
          gsap.to(els, {
            autoAlpha: 1,
            y: 0,
            rotate: 0,
            filter: 'blur(0px)',
            ease: opts.wordLineEase,
            stagger: opts.wordLineStagger,
            scrollTrigger: {
              trigger: triggerEl,
              start: opts.wordLineScrubStart,
              end: opts.wordLineScrubEnd,
              scrub: opts.wordLineScrub,
            },
          })
        })
      }
    }, scope)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.start, opts.toggleActions])

  return scopeRef
}
