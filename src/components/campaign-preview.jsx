import { cn } from '@/utils/cn'

/*
 * Stylised campaign-website preview. Deliberately abstract — a series of
 * hairline shapes hinting at the shape of a real website (nav bar, big
 * headline block, body columns, CTA plate) without pretending to be a
 * screenshot of a real client site. That keeps the "no invented content"
 * rule honest while still giving the showcase visual weight.
 *
 * `variant` picks which of a few compositions we render, so a grid of these
 * doesn't look identical tile-to-tile.
 */

const CampaignPreview = ({ variant = 'a', className }) => {
  const previews = {
    a: (
      <>
        {/* Nav bar */}
        <span className="absolute left-6 right-6 top-6 flex items-center gap-2">
          <span className="block h-2 w-2 bg-accent" />
          <span className="block h-[3px] w-16 bg-foreground/70" />
          <span className="ml-auto flex gap-2">
            <span className="block h-[3px] w-5 bg-foreground/40" />
            <span className="block h-[3px] w-5 bg-foreground/40" />
            <span className="block h-[3px] w-5 bg-foreground/40" />
            <span className="block h-3 w-10 bg-accent" />
          </span>
        </span>
        {/* Headline block */}
        <span className="absolute left-6 top-16 flex flex-col gap-2">
          <span className="block h-6 w-40 bg-foreground/85" />
          <span className="block h-6 w-56 bg-foreground/85" />
          <span className="block h-6 w-24 bg-foreground/85" />
        </span>
        {/* Body */}
        <span className="absolute left-6 top-36 flex flex-col gap-1.5">
          <span className="block h-1.5 w-48 bg-foreground/45" />
          <span className="block h-1.5 w-40 bg-foreground/45" />
          <span className="block h-1.5 w-44 bg-foreground/45" />
        </span>
        {/* CTA */}
        <span className="absolute left-6 bottom-6 flex items-center gap-3">
          <span className="block h-6 w-24 bg-accent" />
          <span className="block h-6 w-24 border border-foreground/70" />
        </span>
        {/* Right decorative plate */}
        <span className="absolute right-6 top-16 bottom-6 w-24 border border-accent/70" />
      </>
    ),
    b: (
      <>
        {/* Nav */}
        <span className="absolute left-6 right-6 top-6 flex items-center justify-between">
          <span className="block h-3 w-16 bg-foreground/70" />
          <span className="block h-3 w-16 bg-accent" />
        </span>
        {/* Big centered numeric plate */}
        <span className="absolute inset-6 top-16 flex flex-col items-center justify-center gap-3">
          <span className="font-display text-[3rem] leading-none tracking-[0.005em] text-foreground/90">
            17<span className="text-accent">76</span>
          </span>
          <span className="block h-[2px] w-16 bg-accent" />
        </span>
        {/* Bottom row */}
        <span className="absolute left-6 right-6 bottom-6 flex items-center gap-3">
          <span className="block h-2 w-2 bg-accent" />
          <span className="block h-1.5 w-full max-w-[60%] bg-foreground/45" />
          <span className="ml-auto block h-5 w-20 bg-accent" />
        </span>
      </>
    ),
    c: (
      <>
        {/* Split-column layout */}
        <span className="absolute left-6 top-6 bottom-6 w-[42%] bg-surface" />
        <span className="absolute left-10 top-12 flex flex-col gap-2">
          <span className="block h-4 w-24 bg-foreground/80" />
          <span className="block h-4 w-28 bg-foreground/80" />
          <span className="block h-4 w-20 bg-foreground/80" />
          <span className="mt-3 block h-1.5 w-24 bg-foreground/50" />
          <span className="block h-1.5 w-28 bg-foreground/50" />
          <span className="mt-3 block h-5 w-24 bg-accent" />
        </span>
        <span className="absolute right-6 top-6 bottom-6 w-[46%] border border-accent" />
        <span className="absolute right-8 top-10 flex flex-col gap-1.5">
          <span className="block h-2 w-16 bg-accent" />
          <span className="block h-1.5 w-24 bg-foreground/50" />
        </span>
      </>
    ),
    d: (
      <>
        {/* Timeline mock */}
        <span className="absolute left-6 top-6 flex items-center gap-3">
          <span className="block h-2 w-2 bg-accent" />
          <span className="block h-1.5 w-24 bg-foreground/70" />
        </span>
        <span className="absolute left-6 top-14 flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="flex items-center gap-3">
              <span className="block h-[3px] w-8 bg-accent" />
              <span
                className="block h-2 bg-foreground/70"
                style={{ width: `${40 + ((i * 17) % 60)}%` }}
              />
            </span>
          ))}
        </span>
        <span className="absolute right-6 bottom-6 flex items-center gap-2">
          <span className="block h-5 w-16 bg-accent" />
          <span className="block h-5 w-16 border border-foreground/60" />
        </span>
      </>
    ),
  }

  const composition = previews[variant] ?? previews.a

  /*
   * Outer wrapper accepts whatever positioning the caller passes (typically
   * `absolute inset-0` inside an aspect-ratio parent). Inner wrapper is
   * always `relative` so the mockup's absolute-positioned children anchor
   * correctly regardless of what the outer positioning does.
   */
  return (
    <div
      aria-hidden="true"
      className={cn('overflow-hidden', className)}
    >
      <div className="relative h-full w-full bg-background">
        {/* Faint grid guides so the mockup reads as a "wire" preview and never
            gets mistaken for a real screenshot. */}
        <span
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {composition}
      </div>
    </div>
  )
}

export default CampaignPreview
