'use client'

import { useLayoutEffect, useRef, useState } from 'react'

import CtaButton from '@/components/cta-button'
import Icon from '@/components/icon'
import { AGENCY, HERO } from '@/constants/campaign'
import { gsap, ScrollTrigger } from '@/utils/register-gsap'
import { cn } from '@/utils/cn'

const LINKS = [
  { id: 'forward', label: 'Forward', href: '#forward' },
  { id: 'reality', label: 'Reality', href: '#reality' },
  { id: 'solutions', label: 'Solutions', href: '#solutions' },
  { id: 'process', label: 'Process', href: '#process' },
  { id: 'contact', label: 'Contact', href: '#contact' },
]

/*
 * Fixed primary navbar. Sits directly below the TopBrandBar.
 * - GSAP-powered text-mask swap on hover (top word rises out, bottom word
 *   rises into place) + a subtle accent glow.
 * - Small accent dot marks the "current section" — driven by ScrollTrigger.
 */

const Navbar = () => {
  const rootRef = useRef(null)
  const [activeId, setActiveId] = useState(null)
  const heroCta = HERO.ctas[0]

  useLayoutEffect(() => {
    if (!rootRef.current) return undefined

    const triggers = LINKS.map((link) => {
      const section = document.getElementById(link.id)
      if (!section) return null
      return ScrollTrigger.create({
        trigger: section,
        start: 'top 40%',
        end: 'bottom 40%',
        onEnter: () => setActiveId(link.id),
        onEnterBack: () => setActiveId(link.id),
      })
    }).filter(Boolean)

    // When the hero is back in view, no nav link should read as active.
    const hero = document.getElementById('home')
    if (hero) {
      triggers.push(
        ScrollTrigger.create({
          trigger: hero,
          start: 'top top',
          end: 'bottom 60%',
          onEnter: () => setActiveId(null),
          onEnterBack: () => setActiveId(null),
        }),
      )
    }

    return () => triggers.forEach((t) => t.kill())
  }, [])

  return (
    <div
      ref={rootRef}
      className="fixed inset-x-0 top-10 z-40 border-b border-muted/50 bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-[68px] max-w-[1600px] items-center px-6 lg:px-10">
        {/* Brand mark */}
        <a
          href="#home"
          className="group flex items-center gap-3"
          data-cursor="link"
        >
          <Icon name="star" className="h-6 w-6 text-accent" strokeWidth={2} />
          <span className="text-sm font-black uppercase tracking-[0.24em]">
            {AGENCY.brand}
          </span>
        </a>

        {/* Links */}
        <nav
          aria-label="Primary"
          className="ml-auto mr-auto hidden items-center gap-10 xl:gap-14 lg:flex"
        >
          {LINKS.map((link) => (
            <NavLink
              key={link.id}
              label={link.label}
              href={link.href}
              active={activeId === link.id}
            />
          ))}
        </nav>

        {/* CTA — reuses the hero primary CTA label; provided content only. */}
        <div className="ml-auto lg:ml-0">
          <CtaButton
            href={heroCta.href}
            variant="primary"
            className="!py-3 !px-5 text-xs"
          >
            {heroCta.label}
          </CtaButton>
        </div>
      </div>
    </div>
  )
}

const NavLink = ({ label, href, active }) => {
  const anchorRef = useRef(null)

  const handleEnter = () => {
    const el = anchorRef.current
    if (!el) return
    const top = el.querySelector('[data-nav="top"]')
    const bot = el.querySelector('[data-nav="bot"]')
    const glow = el.querySelector('[data-nav="glow"]')
    gsap.to(top, {
      yPercent: -110,
      duration: 0.45,
      ease: 'expo.out',
    })
    gsap.to(bot, {
      yPercent: -100,
      duration: 0.45,
      ease: 'expo.out',
    })
    gsap.to(glow, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: 'power2.out',
    })
  }

  const handleLeave = () => {
    const el = anchorRef.current
    if (!el) return
    const top = el.querySelector('[data-nav="top"]')
    const bot = el.querySelector('[data-nav="bot"]')
    const glow = el.querySelector('[data-nav="glow"]')
    gsap.to(top, {
      yPercent: 0,
      duration: 0.5,
      ease: 'expo.out',
    })
    gsap.to(bot, {
      yPercent: 0,
      duration: 0.5,
      ease: 'expo.out',
    })
    gsap.to(glow, {
      opacity: 0,
      scale: 0.6,
      duration: 0.5,
      ease: 'power2.out',
    })
  }

  return (
    <a
      ref={anchorRef}
      href={href}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      data-cursor="link"
      className="group relative flex items-center gap-2 py-1"
    >
      {/* active dot */}
      <span
        aria-hidden="true"
        className={cn(
          'h-1.5 w-1.5 rounded-full transition-all duration-500',
          active
            ? 'scale-100 bg-accent shadow-[0_0_10px_var(--color-accent)]'
            : 'scale-0 bg-transparent',
        )}
      />

      {/* text mask */}
      <span className="relative block overflow-hidden text-[0.72rem] font-black uppercase tracking-[0.24em]">
        {/* subtle accent glow (starts hidden) */}
        <span
          data-nav="glow"
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-1/2 top-1/2 -z-10 h-8 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 opacity-0 blur-xl will-change-transform"
          style={{ transform: 'translate(-50%, -50%) scale(0.6)' }}
        />
        <span
          data-nav="top"
          className={cn(
            'block will-change-transform',
            active ? 'text-foreground' : 'text-foreground/75',
          )}
        >
          {label}
        </span>
        <span
          data-nav="bot"
          aria-hidden="true"
          className="absolute inset-0 block translate-y-full text-accent will-change-transform"
        >
          {label}
        </span>
      </span>
    </a>
  )
}

export default Navbar
