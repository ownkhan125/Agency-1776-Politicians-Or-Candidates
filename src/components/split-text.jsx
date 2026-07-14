import { cn } from '@/utils/cn'

/*
 * Split-text primitives.
 *
 *   mode="words"  — premium word-by-word reveal for main section headings.
 *                    Each word wraps in a span carrying `data-reveal="word-line"`;
 *                    real spaces between words so line-break behaviour stays
 *                    natural. The section-reveal hook animates y + opacity +
 *                    blur clear + a very subtle rotation from below.
 *
 *   mode="chars"  — per-character split (`data-reveal="char"`). Reserved for
 *                    hero H1s and other display headlines where the per-glyph
 *                    cascade reads better than per-word.
 *
 *   mode="block"  — no split. Wraps the entire string in a single
 *                    `data-reveal="line"` span for whole-paragraph fades.
 *
 *   mode="scrub"  — legacy per-word split with `data-scrub="word"` for the
 *                    scroll-scrub headings driven by `useScrubHeading`.
 *                    Retained so pre-migration markup keeps working; the
 *                    canonical main-heading behaviour is now `words`.
 *
 *   mode="reveal" — legacy per-word mask animation (`data-reveal="word"`).
 *                    Kept for backward compatibility.
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

  if (mode === 'words') {
    // Preserve real whitespace between word spans so wrapping still lines up
    // exactly where a browser would break the string naturally. Each word
    // stays `inline-block` so it can transform without disturbing siblings,
    // and `whitespace-nowrap` inside the word keeps punctuation glued.
    const tokens = text.split(/(\s+)/)
    return (
      <Comp aria-label={text} className={cn('inline-block', className)}>
        {tokens.map((token, ti) => {
          if (token === '') return null
          if (/^\s+$/.test(token)) {
            return (
              <span key={`s-${ti}`} aria-hidden="true">
                {' '}
              </span>
            )
          }
          return (
            <span
              key={`w-${ti}`}
              data-reveal="word-line"
              className={cn(
                'inline-block whitespace-nowrap will-change-[transform,opacity,filter]',
                wordClassName,
              )}
            >
              {token}
            </span>
          )
        })}
      </Comp>
    )
  }

  if (mode === 'chars') {
    const tokens = text.split(/(\s+)/)
    return (
      <Comp aria-label={text} className={cn('inline-block', className)}>
        {tokens.map((token, ti) => {
          if (token === '') return null
          if (/^\s+$/.test(token)) {
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
