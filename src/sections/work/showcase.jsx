'use client'

import CampaignPreview from '@/components/campaign-preview'
import CtaButton from '@/components/cta-button'
import Icon from '@/components/icon'
import MagneticCard from '@/components/magnetic-card'
import RevealBorder from '@/components/reveal-border'
import SplitText from '@/components/split-text'
import { WORK } from '@/constants/campaign'
import { useScrubHeading } from '@/hooks/use-scrub-heading'
import { useSectionReveal } from '@/hooks/use-section-reveal'

const PREVIEW_VARIANTS = ['a', 'b', 'c', 'd', 'a', 'b']

/*
 * Explicit column-span layout — index by array position matches the order in
 * WORK.showcase.projects. The result is an editorial staggered grid, not a
 * uniform tile matrix:
 *   row 1: [wide 2/3] [compact 1/3]
 *   row 2: [compact 1/3] [compact 1/3] [compact 1/3]
 *   row 3: [compact 1/3] [wide 2/3]
 */
const CELL_SPANS = [
  'lg:col-span-8',
  'lg:col-span-4',
  'lg:col-span-4',
  'lg:col-span-4',
  'lg:col-span-4',
  'lg:col-span-8',
]

const Showcase = () => {
  const scopeRef = useSectionReveal()
  const headingRef = useScrubHeading()

  return (
    <section
      ref={scopeRef}
      id="work-showcase"
      className="relative isolate overflow-hidden bg-background py-32"
    >
      <div className="relative mx-auto max-w-[1600px] px-6 lg:px-10">
        {/* Header row — eyebrow, H2, body on the left; CTA anchored bottom-right
            for balance instead of the usual "below the body" position. */}
        <header className="grid grid-cols-12 gap-8 pb-16 lg:gap-10">
          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-foreground/60">
              <span className="border border-muted px-2 py-0.5 font-mono text-[0.7rem] text-foreground/80">
                02
              </span>
              <span
                className="h-px w-8 bg-muted"
                data-reveal="icon"
                aria-hidden="true"
              />
              <span>{WORK.showcase.eyebrow}</span>
            </div>

            <h2
              ref={headingRef}
              className="mt-8 text-balance text-[clamp(2.75rem,6.5vw,5.75rem)] leading-[0.92] tracking-[0.005em]"
            >
              <SplitText mode="words">{WORK.showcase.heading}</SplitText>
            </h2>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-foreground/80 lg:text-xl">
              <SplitText mode="block">{WORK.showcase.body}</SplitText>
            </p>
          </div>

          <div className="col-span-12 flex items-end lg:col-span-4 lg:justify-end">
            <CtaButton href={WORK.showcase.cta.href} variant="primary">
              {WORK.showcase.cta.label}
            </CtaButton>
          </div>
        </header>

        {/* Staggered showcase grid. Each card is a clickable anchor routing to
            /work/[slug]; every card renders a `<CampaignPreview />` placeholder
            with a distinct variant so the grid doesn't read as repeated tiles. */}
        <ul className="grid grid-cols-1 gap-px bg-muted md:grid-cols-2 lg:grid-cols-12">
          {WORK.showcase.projects.map((project, i) => (
            <li
              key={project.slug}
              className={`relative flex bg-background ${CELL_SPANS[i]}`}
            >
              <MagneticCard
                as="a"
                href={`/work/${project.slug}`}
                data-cursor="view"
                strength={0.07}
                className="group block h-full w-full"
                innerClassName="flex h-full flex-col gap-6 p-6 lg:p-8"
              >
                <RevealBorder tone="muted" />

                {/* Preview mockup — aspect-ratio wrapper so cards line up
                    even though the compositions inside differ. */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface">
                  <RevealBorder tone="foreground" />
                  <CampaignPreview
                    variant={PREVIEW_VARIANTS[i]}
                    className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />

                  {/* Hover overlay — subtle accent tint + "View" tag that
                      slides in from the bottom on hover. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-accent/0 transition-colors duration-500 group-hover:bg-accent/[0.08]"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-4 left-4 flex translate-y-1 items-center gap-2 border border-accent bg-background/90 px-3 py-1.5 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-accent">
                      View
                    </span>
                    <Icon
                      name="arrow"
                      className="h-3 w-3 text-accent"
                      strokeWidth={2}
                    />
                  </span>
                </div>

                {/* Meta row — index + accent leader + arrow. No project name
                    (none supplied); this is intentionally placeholder chrome. */}
                <div className="flex items-center gap-4">
                  <span
                    data-reveal="icon"
                    aria-hidden="true"
                    className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-accent"
                  >
                    {String(i + 1).padStart(2, '0')} / 06
                  </span>
                  <span
                    data-reveal="icon"
                    aria-hidden="true"
                    className="h-px w-10 bg-accent transition-all duration-500 group-hover:w-24"
                  />
                  <Icon
                    name="arrow"
                    className="ml-auto h-4 w-4 text-foreground/60 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-accent"
                    strokeWidth={1.75}
                  />
                </div>
              </MagneticCard>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Showcase
