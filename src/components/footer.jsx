'use client'

import Link from 'next/link'

import Icon from '@/components/icon'
import RevealBorder from '@/components/reveal-border'
import SplitText from '@/components/split-text'
import { AGENCY } from '@/constants/campaign'
import { useSectionReveal } from '@/hooks/use-section-reveal'
import { scrollToTop } from '@/utils/scroll-to'

/*
 * Every entry routes to a real page. Home-section anchors (Forward / Reality
 * / Process → `/#foo`) were removed as part of the site-wide navigation
 * audit — they violated the "page routes only" rule.
 */
const NAV = [
  { label: 'About', href: '/about' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Work', href: '/work' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
]

/*
 * Capability labels — every one lives inside the Solutions page (the "What
 * We Build for Political Campaigns." bento), so all four route there instead
 * of the removed `/#forward` hash.
 */
const CAPABILITIES = [
  { label: 'Candidate story', href: '/solutions' },
  { label: 'Issues & priorities', href: '/solutions' },
  { label: 'Donation path', href: '/solutions' },
  { label: 'Volunteer signup', href: '/solutions' },
]

const YEAR = new Date().getFullYear()

const Footer = () => {
  const scopeRef = useSectionReveal({
    start: 'top 92%',
    borderDuration: 0.6,
    wordDuration: 0.55,
    wordStagger: 0.02,
    overlap: 0.3,
  })

  return (
    <footer
      ref={scopeRef}
      className="relative isolate overflow-hidden border-t border-muted bg-background pb-10 pt-24"
    >
      <div className="relative mx-auto max-w-[1600px] px-6 lg:px-10">
        {/* Big wordmark up top acts as a visual signature. */}
        <div className="grid grid-cols-12 gap-8 border-b border-muted pb-16">
          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-foreground/50">
              <span
                data-reveal="icon"
                aria-hidden="true"
                className="h-px w-10 bg-accent"
              />
              <span>Sign-off / 07</span>
            </div>

            <p className="font-display mt-8 text-[clamp(3rem,7.5vw,6.5rem)] leading-[0.9] tracking-[0.005em]">
              <SplitText mode="words">{AGENCY.brand}</SplitText>
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/60">
              <SplitText mode="block">
                Digital foundations for campaigns that need to move.
              </SplitText>
            </p>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="relative border border-muted p-8">
              <RevealBorder tone="accent" />
              <div className="flex items-start justify-between">
                <Icon
                  name="star"
                  className="h-10 w-10 text-accent"
                  strokeWidth={1.25}
                />
                <span
                  data-reveal="icon"
                  aria-hidden="true"
                  className="block h-2 w-2 bg-accent"
                />
              </div>
              <div
                data-reveal="icon"
                aria-hidden="true"
                className="font-display mt-8 text-6xl leading-none tracking-[0.005em] text-foreground/90"
              >
                17<span className="text-accent">76</span>
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-muted pt-4 text-[0.65rem] uppercase tracking-[0.28em] text-foreground/50">
                <Icon name="scroll" className="h-4 w-4" strokeWidth={1.5} />
                <span>Est. 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Link groups — hairline three-column set. */}
        <div className="grid grid-cols-1 gap-10 py-16 md:grid-cols-3 lg:gap-16">
          <FooterGroup
            title="Navigate"
            index="A"
            items={NAV}
          />
          <FooterGroup
            title="What we build"
            index="B"
            items={CAPABILITIES}
          />
          <div>
            <FooterGroupHeader title="Get in touch" index="C" />
            <ul className="mt-6 space-y-3">
              {/* Every link routes to a real page. `Back to top` is a scroll
                  action, not a route — rendered as a `<button>` so no hash
                  href ever ships to the DOM. `See the process` used to point
                  at the removed home `#process` anchor and had no
                  page destination, so it was dropped rather than left as a
                  dead link. */}
              <li>
                <FooterLink href="/contact" label="Start the conversation" />
              </li>
              <li>
                <FooterLink onClick={scrollToTop} label="Back to top" />
              </li>
            </ul>
          </div>
        </div>

        {/* Meta rail — copyright, year plate, brand mark. */}
        <div className="flex flex-col gap-6 border-t border-muted pt-8 text-[0.68rem] uppercase tracking-[0.28em] text-foreground/50 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span
              data-reveal="icon"
              aria-hidden="true"
              className="block h-2 w-[3px] bg-accent"
            />
            <span>© {YEAR} {AGENCY.brand}. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <span
              aria-hidden="true"
              className="hidden font-mono text-foreground/40 md:inline"
            >
              Politicians / Candidates
            </span>
            <span
              data-reveal="icon"
              aria-hidden="true"
              className="hidden h-px w-16 bg-muted md:block"
            />
            <span className="font-mono text-foreground/40">v.01</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

const FooterGroupHeader = ({ title, index }) => (
  <div className="flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.28em] text-foreground/50">
    <span className="border border-muted px-2 py-0.5 font-mono text-[0.65rem] text-foreground/70">
      {index}
    </span>
    <span
      data-reveal="icon"
      aria-hidden="true"
      className="h-px w-8 bg-muted"
    />
    <span>{title}</span>
  </div>
)

const FooterGroup = ({ title, index, items }) => (
  <div>
    <FooterGroupHeader title={title} index={index} />
    <ul className="mt-6 space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <FooterLink href={item.href} label={item.label} />
        </li>
      ))}
    </ul>
  </div>
)

/*
 * Renders as an `<a>` when a route href is provided, or a `<button>` for
 * on-page scroll actions (e.g. Back to top). No component ever ships a
 * hash href — see the site-wide navigation audit.
 */
const FooterLink = ({ href, label, onClick }) => {
  const className =
    'group inline-flex items-baseline gap-3 text-left text-base font-medium text-foreground/80 transition-colors hover:text-foreground'

  const content = (
    <>
      {/* Accent leader dash — grows on hover. */}
      <span
        aria-hidden="true"
        className="mb-[0.3em] h-px w-4 origin-left scale-x-100 bg-accent transition-transform duration-500 ease-out group-hover:scale-x-[2]"
      />
      {/* Label + underline living inside a reserved padding band so descenders
          never overlap the underline. */}
      <span className="relative inline-block pb-3 leading-[1.15]">
        {label}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-x-100"
        />
      </span>
    </>
  )

  if (href) {
    return (
      <Link href={href} data-cursor="link" className={className}>
        {content}
      </Link>
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="button"
      className={className}
    >
      {content}
    </button>
  )
}

export default Footer
