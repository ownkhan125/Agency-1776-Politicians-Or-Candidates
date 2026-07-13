'use client'

import CtaButton from '@/components/cta-button'
import RevealBorder from '@/components/reveal-border'
import SplitText from '@/components/split-text'
import { PROCESS } from '@/constants/campaign'
import { useScrubHeading } from '@/hooks/use-scrub-heading'
import { useSectionReveal } from '@/hooks/use-section-reveal'

const Process = () => {
  const scopeRef = useSectionReveal()
  const headingRef = useScrubHeading()

  return (
    <section
      ref={scopeRef}
      id="process"
      className="relative bg-surface py-32"
    >
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-8 pb-16">
          <div className="col-span-12 lg:col-span-4">
            <div className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-foreground/60">
              <span className="border border-muted px-2 py-0.5 font-mono text-[0.7rem] text-foreground/80">
                05
              </span>
              <span
                className="h-px w-8 bg-muted"
                data-reveal="icon"
                aria-hidden="true"
              />
            </div>
          </div>
          <div className="col-span-12 lg:col-span-8">
            <h2
              ref={headingRef}
              className="text-balance text-[clamp(3rem,8vw,6.5rem)] font-black leading-[0.92] tracking-[-0.03em]"
            >
              <SplitText mode="scrub">{PROCESS.heading}</SplitText>
            </h2>
          </div>
        </div>

        {/* 5-step timeline. Each row is a hairline-topped grid; the accent
            impact block on the right carries the step number in monospace. */}
        <ol className="flex flex-col">
          {PROCESS.steps.map((step, i) => (
            <li
              key={step.num}
              className="relative grid grid-cols-12 items-start gap-6 border-t border-muted py-12 last:border-b"
            >
              <div className="col-span-12 lg:col-span-2">
                <div className="flex items-center gap-3">
                  <span
                    data-reveal="icon"
                    className="h-2 w-2 rounded-full bg-accent"
                  />
                  <span className="font-mono text-sm text-foreground/70">
                    0{step.num}
                  </span>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-7">
                <h3 className="text-2xl font-black tracking-[-0.01em] lg:text-4xl">
                  <SplitText mode="reveal">{step.title}</SplitText>
                </h3>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/70 lg:text-lg">
                  <SplitText mode="reveal">{step.body}</SplitText>
                </p>
              </div>

              <div className="col-span-12 lg:col-span-3">
                <div className="relative border border-muted p-6 text-right">
                  <RevealBorder tone="accent" />
                  <div
                    aria-hidden="true"
                    className="font-mono text-[4rem] font-black leading-none text-accent"
                  >
                    0{step.num}
                  </div>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="absolute right-0 top-12 hidden font-mono text-[0.7rem] text-foreground/40 lg:block"
              >
                / 0{i + 1}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-16 flex justify-center lg:justify-start">
          <CtaButton href={PROCESS.cta.href} variant="primary">
            {PROCESS.cta.label}
          </CtaButton>
        </div>
      </div>
    </section>
  )
}

export default Process
