'use client'

import CtaButton from '@/components/cta-button'
import GridBackdrop from '@/components/grid-backdrop'
import Icon from '@/components/icon'
import RevealBorder from '@/components/reveal-border'
import SplitText from '@/components/split-text'
import { AGENCY, HERO } from '@/constants/campaign'
import { useSectionReveal } from '@/hooks/use-section-reveal'

const Hero = () => {
  // Above the fold — pack the border → icon → text sequence tight so the
  // display headline lands within ~1s of first paint, not 2s.
  const scopeRef = useSectionReveal({
    start: 'top 95%',
    borderDuration: 0.55,
    iconDuration: 0.4,
    iconStagger: 0.05,
    wordDuration: 0.55,
    wordStagger: 0.02,
    overlap: 0.35,
  })

  return (
    <section
      ref={scopeRef}
      id="home"
      className="relative isolate flex h-[100dvh] min-h-[720px] flex-col overflow-hidden bg-background pt-[7rem]"
    >
      <GridBackdrop />

      <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-6 pb-10 lg:px-10">
        <div className="grid flex-1 grid-cols-12 content-center items-center gap-8">
          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-foreground/60">
              <span className="border border-muted px-2 py-0.5 font-mono text-[0.7rem] text-foreground/80">
                01
              </span>
              <span
                className="h-px w-8 bg-muted"
                data-reveal="icon"
                aria-hidden="true"
              />
              <span>{AGENCY.brand}</span>
            </div>

            <h1 className="mt-8 text-balance text-[clamp(2.5rem,7.2vw,6rem)] font-black leading-[0.95] tracking-[-0.03em]">
              <SplitText mode="reveal">{HERO.heading}</SplitText>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-foreground/70 lg:text-xl">
              <SplitText mode="reveal">{HERO.tagline}</SplitText>
            </p>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              {HERO.ctas.map((c) => (
                <CtaButton key={c.label} href={c.href} variant={c.variant}>
                  {c.label}
                </CtaButton>
              ))}
            </div>
          </div>

          {/* Right rail: purely decorative monogram frame. Hidden below lg so
              copy owns the viewport on tablet / mobile. No text is rendered
              here beyond the brand name that already appears elsewhere. */}
          <div
            aria-hidden="true"
            className="hidden lg:col-span-4 lg:block"
            data-cursor="card"
          >
            <div className="relative aspect-[4/5] max-h-[62vh] bg-surface p-8">
              <RevealBorder tone="accent" />

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <Icon
                    name="star"
                    className="h-10 w-10 text-accent"
                    strokeWidth={1.25}
                  />
                  <span
                    data-reveal="icon"
                    className="h-2 w-2 rounded-full bg-accent"
                  />
                </div>

                <div className="pointer-events-none flex flex-1 items-center justify-center">
                  <div
                    data-reveal="icon"
                    className="text-[7rem] font-black leading-none tracking-[-0.06em] text-foreground/90"
                  >
                    17
                    <span className="text-accent">76</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-muted pt-4">
                  <Icon name="scroll" className="h-4 w-4" strokeWidth={1.5} />
                  <span className="text-[0.72rem] uppercase tracking-[0.24em] text-foreground/70">
                    {AGENCY.brand}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
