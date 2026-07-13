'use client'

import { motion } from 'motion/react'

import { cn } from '@/utils/cn'

const CtaButton = ({
  children,
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  className,
}) => {
  const base =
    'group inline-flex items-center gap-3 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] transition-colors'

  const styles =
    variant === 'primary'
      ? 'bg-accent text-foreground hover:bg-foreground hover:text-background'
      : 'border border-foreground text-foreground hover:bg-foreground hover:text-background'

  const content = (
    <>
      <span>{children}</span>
      <motion.span
        aria-hidden="true"
        className="inline-block h-[1px] w-6 bg-current"
        initial={false}
        whileHover={{ scaleX: 1.35 }}
      />
    </>
  )

  const motionProps = {
    whileHover: { y: -2 },
    whileTap: { scale: 0.97 },
    transition: { duration: 0.22, ease: [0.85, 0, 0, 1] },
    className: cn(base, styles, className),
  }

  if (href) {
    return (
      <motion.a href={href} {...motionProps}>
        {content}
      </motion.a>
    )
  }

  return (
    <motion.button type={type} onClick={onClick} {...motionProps}>
      {content}
    </motion.button>
  )
}

export default CtaButton
