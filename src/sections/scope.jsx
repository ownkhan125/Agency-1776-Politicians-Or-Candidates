'use client'

import Icon from '@/components/icon'
import RevealBorder from '@/components/reveal-border'
import SplitText from '@/components/split-text'
import { SCOPE } from '@/constants/campaign'
import { useScrubHeading } from '@/hooks/use-scrub-heading'
import { useSectionReveal } from '@/hooks/use-section-reveal'

const Scope = () => {
  const scopeRef = useSectionReveal()
  const headingRef = useScrubHeading()

  return (
    <section
      ref={scopeRef}
      id="solutions"
      className="relative bg-background py-32"
    >
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-8 pb-16">
          <div className="col-span-12 lg:col-span-4">
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
          </div>

          <div className="col-span-12 lg:col-span-8">
            <h2
              ref={headingRef}
              className="text-balance text-[clamp(3.5rem,10vw,8rem)] font-black leading-[0.92] tracking-[-0.04em]"
            >
              <SplitText mode="scrub">{SCOPE.heading}</SplitText>
            </h2>

            <p className="mt-10 max-w-2xl text-base leading-relaxed text-foreground/70 lg:text-lg">
              <SplitText mode="reveal">{SCOPE.body}</SplitText>
            </p>
          </div>
        </div>

        {/* Hairline grid — the 9 campaign types Agency 1776 supports. */}
        <ul className="grid grid-cols-1 gap-px bg-muted md:grid-cols-2 lg:grid-cols-3">
          {SCOPE.items.map((item) => (
            <li
              key={item}
              className="relative flex items-center gap-4 bg-background p-6 lg:p-8"
            >
              <RevealBorder tone="muted" />

              <Icon
                name="star"
                className="h-5 w-5 shrink-0 text-accent"
                strokeWidth={2}
              />

              <span className="text-lg font-bold leading-tight tracking-[-0.01em] lg:text-xl">
                <SplitText mode="reveal">{item}</SplitText>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Scope
