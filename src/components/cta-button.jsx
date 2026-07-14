'use client'

import Link from 'next/link'
import { motion } from 'motion/react'

import { useMagnetic } from '@/hooks/use-magnetic'
import { cn } from '@/utils/cn'

// Animated variant of Next.js Link so href-driven CTAs keep the motion
// treatment (hover lift, tap scale) while using client-side navigation.
const MotionLink = motion.create(Link)

const isInternalHref = (href) =>
  typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')

const CtaButton = ({
  children,
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  className,
  magnetic = true,
}) => {
  const magneticRef = useMagnetic({
    strength: magnetic ? 0.28 : 0,
    childSelector: '[data-magnet-child]',
  })

  const base =
    'group relative inline-flex items-center gap-3 px-6 py-4 font-display text-base uppercase tracking-[0.16em] leading-none transition-colors'

  const styles =
    variant === 'primary'
      ? 'bg-accent text-on-accent hover:bg-foreground hover:text-background'
      : 'border border-foreground text-foreground hover:bg-foreground hover:text-background'

  const content = (
    <span data-magnet-child className="inline-flex items-center gap-3">
      <span>{children}</span>
      <motion.span
        aria-hidden="true"
        className="inline-block h-[1px] w-6 bg-current"
        initial={false}
        whileHover={{ scaleX: 1.35 }}
      />
    </span>
  )

  const motionProps = {
    whileHover: { y: -2 },
    whileTap: { scale: 0.97 },
    transition: { duration: 0.22, ease: [0.85, 0, 0, 1] },
    className: cn(base, styles, className),
  }

  if (href) {
    if (isInternalHref(href)) {
      return (
        <MotionLink
          ref={magneticRef}
          href={href}
          onClick={onClick}
          {...motionProps}
        >
          {content}
        </MotionLink>
      )
    }
    return (
      <motion.a
        ref={magneticRef}
        href={href}
        onClick={onClick}
        {...motionProps}
      >
        {content}
      </motion.a>
    )
  }

  return (
    <motion.button
      ref={magneticRef}
      type={type}
      onClick={onClick}
      {...motionProps}
    >
      {content}
    </motion.button>
  )
}

export default CtaButton
