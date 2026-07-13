'use client'

import { useMagnetic } from '@/hooks/use-magnetic'
import { cn } from '@/utils/cn'

/*
 * Bento tile with pointer-attractor motion. The outer element captures the
 * pointer; the inner `[data-magnet-child]` span is the one that translates,
 * so the hit zone is unchanged and layout never shifts.
 */

const MagneticCard = ({
  as: Comp = 'div',
  children,
  className,
  innerClassName,
  strength = 0.14,
  ...rest
}) => {
  const ref = useMagnetic({
    strength,
    childSelector: '[data-magnet-child]',
  })

  return (
    <Comp ref={ref} className={cn('relative', className)} {...rest}>
      <div
        data-magnet-child
        className={cn('relative h-full w-full will-change-transform', innerClassName)}
      >
        {children}
      </div>
    </Comp>
  )
}

export default MagneticCard
