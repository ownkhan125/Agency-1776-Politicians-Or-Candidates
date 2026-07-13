import { cn } from '@/utils/cn'

/*
 * Split-text primitives — matches the reference reveal pattern.
 *
 *   mode="chars"  — per-character split. Each char is its own <span> with
 *                    `data-reveal="char"`. Preserves whitespace as
 *                    non-breaking spaces so wrapping stays natural.
 *                    Use this on headings.
 *
 *   mode="block"  — no split. Wraps the entire string in a single span with
 *                    `data-reveal="line"`, which the section-reveal hook
 *                    fades + slides as one unit. Use this on paragraphs.
 *
 *   mode="scrub"  — legacy per-word split with `data-scrub="word"` for the
 *                    scroll-scrub headings driven by `useScrubHeading`.
 *
 *   mode="reveal" — legacy per-word mask animation (`data-reveal="word"`).
 *                    Preserved so existing markup that hasn't been migrated
 *                    to chars/block keeps working.
 */

const SplitText = ({
  children,
  as: Comp = 'span',
  mode = 'reveal',
  className,
  wordClassName,
}) => {
  const text = String(children)

  if (mode === 'block') {
    return (
      <Comp aria-label={text} className={cn('inline-block', className)}>
        <span
          data-reveal="line"
          className={cn('inline-block will-change-[transform,opacity,filter]', wordClassName)}
        >
          {text}
        </span>
      </Comp>
    )
  }

  if (mode === 'chars') {
    // Split into word-sized clusters so we can insert real breaks between
    // words while still animating one character at a time. Each cluster
    // stays `inline-block` so a full word never breaks mid-character.
    const tokens = text.split(/(\s+)/)
    return (
      <Comp aria-label={text} className={cn('inline-block', className)}>
        {tokens.map((token, ti) => {
          if (token === '') return null
          if (/^\s+$/.test(token)) {
            // Whitespace between words — real space so line-breaks land here.
            return (
              <span key={`s-${ti}`} aria-hidden="true">
                {' '}
              </span>
            )
          }
          const chars = Array.from(token)
          return (
            <span
              key={`w-${ti}`}
              aria-hidden="true"
              className="inline-block whitespace-nowrap"
            >
              {chars.map((ch, ci) => (
                <span
                  key={`c-${ti}-${ci}`}
                  data-reveal="char"
                  className={cn(
                    'inline-block will-change-[transform,opacity,filter]',
                    wordClassName,
                  )}
                >
                  {ch}
                </span>
              ))}
            </span>
          )
        })}
      </Comp>
    )
  }

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
