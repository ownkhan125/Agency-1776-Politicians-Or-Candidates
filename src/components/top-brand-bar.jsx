'use client'

import { motion } from 'motion/react'

import { cn } from '@/utils/cn'

/*
 * Sits above the main navbar. Three brand tabs advertising the wider
 * Agency 1776 network. Only "Business" is wired — the other two are visually
 * interactive but inert until real routes exist.
 */

const TABS = [
  {
    id: 'business',
    label: 'Business',
    shortLabel: 'Business',
    active: true,
    href: null,
  },
  {
    id: 'politicians',
    label: 'Politicians or Candidates',
    shortLabel: 'Politicians',
    active: false,
    href: null,
  },
  {
    id: 'nonprofit',
    label: 'Nonprofit',
    shortLabel: 'Nonprofit',
    active: false,
    href: null,
  },
]

const TopBrandBar = () => {
  return (
    <div
      role="tablist"
      aria-label="Agency 1776 network"
      className="fixed inset-x-0 top-0 z-50 border-b border-muted/50 bg-background/95 backdrop-blur-md"
    >
      <div className="mx-auto flex h-10 max-w-[1600px] items-center px-3 sm:px-6 lg:px-10">
        <div className="flex h-full items-stretch overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => (
            <BrandTab key={tab.id} {...tab} />
          ))}
        </div>
        <div className="ml-auto hidden font-mono text-[0.65rem] uppercase tracking-[0.28em] text-foreground/40 lg:block">
          Agency 1776 Network
        </div>
      </div>
    </div>
  )
}

const BrandTab = ({ label, shortLabel, active, href }) => {
  const base =
    'group relative flex items-center gap-2 px-3 sm:px-4 lg:px-5 text-[0.65rem] sm:text-[0.7rem] font-bold uppercase tracking-[0.2em] sm:tracking-[0.22em] transition-colors'

  const state = active
    ? 'text-accent'
    : 'text-foreground/50 hover:text-foreground/80 cursor-not-allowed'

  const inner = (
    <>
      {active && (
        <motion.span
          layoutId="brand-tab-underline"
          className="absolute inset-0 -z-10 bg-surface"
          transition={{ duration: 0.4, ease: [0.85, 0, 0, 1] }}
        />
      )}
      {active && (
        <span
          aria-hidden="true"
          className="block h-2 w-[3px] bg-accent"
        />
      )}
      <span className="hidden md:inline">{label}</span>
      <span className="md:hidden">{shortLabel}</span>
    </>
  )

  if (active && href) {
    return (
      <a
        href={href}
        role="tab"
        aria-selected="true"
        className={cn(base, state)}
      >
        {inner}
      </a>
    )
  }

  return (
    <span
      role="tab"
      aria-selected={active}
      aria-disabled={!active && !href}
      className={cn(base, state)}
    >
      {inner}
    </span>
  )
}

export default TopBrandBar
