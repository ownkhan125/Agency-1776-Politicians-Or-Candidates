'use client'

import Icon from '@/components/icon'
import RevealBorder from '@/components/reveal-border'
import SplitText from '@/components/split-text'
import { FORWARD } from '@/constants/campaign'
import { useScrubHeading } from '@/hooks/use-scrub-heading'
import { useSectionReveal } from '@/hooks/use-section-reveal'

const Forward = () => {
  const scopeRef = useSectionReveal()
  const headingRef = useScrubHeading()

  return (
    <section
      ref={scopeRef}
      id="forward"
      className="relative bg-background py-32"
    >
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-8 pb-16">
          <div className="col-span-12 lg:col-span-4">
            <div className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-foreground/60">
              <span className="border border-muted px-2 py-0.5 font-mono text-[0.7rem] text-foreground/80">
                02
              </span>
              <span
                className="h-px w-8 bg-muted"
                data-reveal="icon"
                aria-hidden="true"
              />
            </div>

            <p className="mt-10 max-w-md text-base leading-relaxed text-foreground/70 lg:text-lg">
              <SplitText mode="reveal">{FORWARD.tagline}</SplitText>
            </p>
          </div>
          <div className="col-span-12 lg:col-span-8">
            <h2
              ref={headingRef}
              className="text-balance text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.95] tracking-[-0.02em]"
            >
              <SplitText mode="scrub">{FORWARD.heading}</SplitText>
            </h2>
          </div>
        </div>

        {/* Hairline 3-column grid of the sections a campaign site needs. */}
        <ul className="grid grid-cols-1 gap-px bg-muted md:grid-cols-2 lg:grid-cols-3">
          {FORWARD.items.map((item) => (
            <li
              key={item.label}
              className="relative flex min-h-[180px] flex-col justify-between gap-8 bg-background p-8 lg:p-10"
            >
              <RevealBorder tone="muted" />

              <Icon
                name={item.icon}
                className="h-9 w-9 text-accent"
                strokeWidth={1.5}
              />

              <h3 className="text-xl font-black leading-tight tracking-[-0.01em] lg:text-2xl">
                <SplitText mode="reveal">{item.label}</SplitText>
              </h3>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Forward
