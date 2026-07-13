'use client'

import CtaButton from '@/components/cta-button'
import GridBackdrop from '@/components/grid-backdrop'
import Icon from '@/components/icon'
import RevealBorder from '@/components/reveal-border'
import SplitText from '@/components/split-text'
import { AGENCY, CONTACT } from '@/constants/campaign'
import { useScrubHeading } from '@/hooks/use-scrub-heading'
import { useSectionReveal } from '@/hooks/use-section-reveal'

const Contact = () => {
  const scopeRef = useSectionReveal()
  const headingRef = useScrubHeading()

  return (
    <section
      ref={scopeRef}
      id="contact"
      className="relative isolate overflow-hidden bg-background py-40"
    >
      <GridBackdrop />

      <div className="relative mx-auto max-w-[1600px] px-6 lg:px-10">
        <div className="relative bg-surface p-10 lg:p-20">
          <RevealBorder tone="accent" />

          <div className="grid grid-cols-12 items-end gap-8">
            <div className="col-span-12 lg:col-span-8">
              <div className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-foreground/60">
                <span className="border border-muted px-2 py-0.5 font-mono text-[0.7rem] text-foreground/80">
                  06
                </span>
                <span
                  className="h-px w-8 bg-muted"
                  data-reveal="icon"
                  aria-hidden="true"
                />
                <span>{AGENCY.brand}</span>
              </div>

              <h2
                ref={headingRef}
                className="mt-10 text-balance text-[clamp(2.75rem,7.5vw,6.5rem)] font-black leading-[0.95] tracking-[-0.03em]"
              >
                <SplitText mode="scrub">{CONTACT.heading}</SplitText>
              </h2>

              <div className="mt-12">
                <CtaButton href={CONTACT.cta.href} variant="primary">
                  {CONTACT.cta.label}
                </CtaButton>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="col-span-12 hidden lg:col-span-4 lg:flex lg:justify-end"
            >
              <div className="relative aspect-square w-full max-w-[280px] border border-accent p-6">
                <div className="flex h-full items-center justify-center">
                  <Icon
                    name="arrow"
                    className="h-24 w-24 text-accent"
                    strokeWidth={1.25}
                  />
                </div>
                <div
                  data-reveal="icon"
                  className="absolute right-6 top-6 h-2 w-2 rounded-full bg-accent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
