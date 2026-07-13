'use client'

import CtaButton from '@/components/cta-button'
import GridBackdrop from '@/components/grid-backdrop'
import Icon from '@/components/icon'
import RevealBorder from '@/components/reveal-border'
import SplitText from '@/components/split-text'
import { REALITY } from '@/constants/campaign'
import { useScrubHeading } from '@/hooks/use-scrub-heading'
import { useSectionReveal } from '@/hooks/use-section-reveal'

const Reality = () => {
  const scopeRef = useSectionReveal()
  const headingRef = useScrubHeading()

  return (
    <section
      ref={scopeRef}
      id="reality"
      className="relative isolate overflow-hidden bg-surface py-32"
    >
      <GridBackdrop tone="muted" />

      <div className="relative mx-auto max-w-[1600px] px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-5">
            <div className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-accent">
              <span className="border border-accent px-2 py-0.5 font-mono text-[0.7rem] text-accent">
                03
              </span>
              <span
                className="h-px w-8 bg-accent"
                data-reveal="icon"
                aria-hidden="true"
              />
              <span>{REALITY.eyebrow}</span>
            </div>

            <div className="mt-10 hidden lg:block">
              <div className="relative aspect-[4/5] max-w-[420px] bg-background p-8">
                <RevealBorder tone="accent" />
                <div className="relative flex h-full flex-col justify-between">
                  <Icon
                    name="pulse"
                    className="h-10 w-10 text-accent"
                    strokeWidth={1.5}
                  />
                  <div
                    data-reveal="icon"
                    aria-hidden="true"
                    className="text-[6rem] font-black leading-none tracking-[-0.06em] text-foreground/90"
                  >
                    <span className="text-accent">/</span>03
                  </div>
                  <div
                    aria-hidden="true"
                    className="h-px w-full bg-muted"
                    data-reveal="icon"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7">
            <h2
              ref={headingRef}
              className="text-balance text-[clamp(2.25rem,5vw,4.25rem)] font-black leading-[1] tracking-[-0.02em]"
            >
              <SplitText mode="scrub">{REALITY.heading}</SplitText>
            </h2>

            <div className="relative mt-12 border-l border-accent pl-8">
              <p className="text-lg leading-relaxed text-foreground/80 lg:text-xl">
                <SplitText mode="reveal">{REALITY.body}</SplitText>
              </p>
            </div>

            <div className="mt-12">
              <CtaButton href={REALITY.cta.href} variant="primary">
                {REALITY.cta.label}
              </CtaButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Reality
