'use client'

import { useLayoutEffect, useRef } from 'react'

import Icon from '@/components/icon'
import SplitText from '@/components/split-text'
import { SCOPE } from '@/constants/campaign'
import { gsap } from '@/utils/register-gsap'
import { useScrubHeading } from '@/hooks/use-scrub-heading'
import { useSectionReveal } from '@/hooks/use-section-reveal'

/*
 * Editorial directory layout — deliberately NOT a bento or card grid. The
 * nine campaign types render as a full-width, hairline-separated directory:
 * each row is a tall band with a running index, an oversize label, and an
 * arrow that slides in on hover. Feels like a table-of-contents in a printed
 * annual report — quiet, ordered, premium.
 */

const ScopeRow = ({ item, index }) => {
  const rowRef = useRef(null)

  const handleEnter = () => {
    const row = rowRef.current
    if (!row) return
    const label = row.querySelector('[data-row="label"]')
    const arrow = row.querySelector('[data-row="arrow"]')
    const glow = row.querySelector('[data-row="glow"]')
    gsap.to(label, { x: 24, duration: 0.5, ease: 'expo.out' })
    gsap.to(arrow, {
      x: 0,
      opacity: 1,
      duration: 0.45,
      ease: 'expo.out',
    })
    gsap.to(glow, {
      scaleX: 1,
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out',
    })
  }

  const handleLeave = () => {
    const row = rowRef.current
    if (!row) return
    const label = row.querySelector('[data-row="label"]')
    const arrow = row.querySelector('[data-row="arrow"]')
    const glow = row.querySelector('[data-row="glow"]')
    gsap.to(label, { x: 0, duration: 0.5, ease: 'expo.out' })
    gsap.to(arrow, {
      x: -20,
      opacity: 0,
      duration: 0.4,
      ease: 'expo.out',
    })
    gsap.to(glow, {
      scaleX: 0,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
    })
  }

  return (
    <li
      ref={rowRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      data-cursor="link"
      className="group relative border-t border-muted/70 last:border-b"
    >
      {/* Hover glow — a horizontal accent band that scales in from the left */}
      <span
        data-row="glow"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full origin-left bg-accent/[0.03] opacity-0"
        style={{ transform: 'scaleX(0)' }}
      />

      <div className="grid grid-cols-12 items-center gap-6 py-8 lg:py-10">
        {/* Running index */}
        <div className="col-span-2 lg:col-span-1">
          <span
            data-reveal="icon"
            className="font-mono text-[0.75rem] uppercase tracking-[0.28em] text-accent"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Hairline divider */}
        <div className="col-span-1 hidden lg:block">
          <span
            aria-hidden="true"
            data-reveal="icon"
            className="block h-px w-full bg-muted/70"
          />
        </div>

        {/* Label — the item name, oversize and display-weight */}
        <div className="col-span-10 lg:col-span-9">
          <div
            data-row="label"
            className="font-display text-[clamp(1.75rem,3.6vw,3rem)] leading-[1] tracking-[0.005em] will-change-transform"
          >
            <SplitText mode="chars">{item}</SplitText>
          </div>
        </div>

        {/* Arrow — slides in on hover */}
        <div className="col-span-12 flex justify-end lg:col-span-1">
          <span
            data-row="arrow"
            aria-hidden="true"
            className="inline-flex h-9 w-9 items-center justify-center border border-accent text-accent will-change-transform"
            style={{ transform: 'translateX(-20px)', opacity: 0 }}
          >
            <Icon name="arrow" className="h-4 w-4" strokeWidth={1.75} />
          </span>
        </div>
      </div>
    </li>
  )
}

const Scope = () => {
  const scopeRef = useSectionReveal()
  const headingRef = useScrubHeading()
  const railRef = useRef(null)

  // Vertical rail that scrubs from top to bottom of the directory as the
  // reader scrolls through it — a subtle running indicator anchored to the
  // section's left edge.
  useLayoutEffect(() => {
    if (!railRef.current) return undefined
    const ctx = gsap.context(() => {
      gsap.set(railRef.current, { scaleY: 0, transformOrigin: 'top center' })
      gsap.to(railRef.current, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: railRef.current,
          start: 'top 85%',
          end: 'bottom 55%',
          scrub: 0.8,
        },
      })
    }, railRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={scopeRef}
      id="solutions"
      className="relative isolate overflow-hidden bg-background py-32"
    >
      <div className="relative mx-auto max-w-[1600px] px-6 lg:px-10">
        {/* Header — eyebrow → heading → body, top-down so the heading always
            precedes its supporting paragraph. */}
        <header className="max-w-[1180px] pb-20">
          <div className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-foreground/60">
            <span className="border border-muted px-2 py-0.5 font-mono text-[0.7rem] text-foreground/80">
              04
            </span>
            <span
              className="h-px w-8 bg-muted"
              data-reveal="icon"
              aria-hidden="true"
            />
            <span>{SCOPE.eyebrow}</span>
          </div>

          <h2
            ref={headingRef}
            className="mt-8 text-balance text-[clamp(4.5rem,12vw,10rem)] leading-[0.88] tracking-[0.005em]"
          >
            <SplitText mode="scrub">{SCOPE.heading}</SplitText>
          </h2>

          <p className="mt-8 max-w-2xl text-base leading-relaxed text-foreground/70 lg:text-lg">
            <SplitText mode="block">{SCOPE.body}</SplitText>
          </p>
        </header>

        {/* Directory — 9 items as full-width, hairline-separated rows. */}
        <div className="relative">
          {/* Running rail on the far left — scrubs on scroll */}
          <span
            ref={railRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 hidden h-full w-px bg-accent lg:block"
          />

          <ul className="lg:pl-8">
            {SCOPE.items.map((item, i) => (
              <ScopeRow key={item} item={item} index={i} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Scope
