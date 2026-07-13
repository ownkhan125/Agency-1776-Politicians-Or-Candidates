import { cn } from '@/utils/cn'

/*
 * Splits text into per-word spans wrapped in a mask (`overflow-hidden`) so the
 * inner span can rise from below its baseline. The inner span carries either
 * `data-reveal="word"` (for one-shot entrance) or `data-scrub="word"` (for
 * scroll-scrub reveals) — the two hooks target the corresponding attribute.
 */

const SplitText = ({
  children,
  as: Comp = 'span',
  mode = 'reveal',
  className,
  wordClassName,
}) => {
  const text = String(children)
  const words = text.split(/\s+/).filter(Boolean)
  const attr =
    mode === 'scrub' ? { 'data-scrub': 'word' } : { 'data-reveal': 'word' }

  return (
    <Comp aria-label={text} className={cn('inline-block', className)}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden="true"
          className="inline-block overflow-hidden align-bottom pr-[0.22em] last:pr-0"
        >
          <span
            {...attr}
            className={cn('inline-block will-change-transform', wordClassName)}
          >
            {word}
          </span>
        </span>
      ))}
    </Comp>
  )
}

export default SplitText
