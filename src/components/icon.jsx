import { cn } from '@/utils/cn'

/*
 * Inline monoline SVG icons. Every icon carries `data-reveal="icon"` so it
 * participates in the section-reveal timeline (scale + rise + fade).
 */

const paths = {
  chart: (
    <>
      <path d="M4 20V6" />
      <path d="M4 20h16" />
      <path d="M8 20V12" />
      <path d="M12 20V9" />
      <path d="M16 20V14" />
      <path d="M20 20V7" />
    </>
  ),
  pulse: (
    <>
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </>
  ),
  book: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2Z" />
      <path d="M4 19a2 2 0 0 1 2-2h12" />
      <path d="M9 7h6" />
      <path d="M9 11h6" />
    </>
  ),
  scroll: (
    <>
      <path d="M6 3h10a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6" />
      <path d="M5 6a2 2 0 1 0 4 0" />
      <path d="M9 9h7" />
      <path d="M9 13h7" />
      <path d="M9 17h5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4 6v6c0 4.5 3.2 8.5 8 9 4.8-.5 8-4.5 8-9V6Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  star: (
    <>
      <path d="M12 3.5 14.5 9l6 .6-4.5 4 1.3 6-5.3-3.1L6.7 19.6 8 13.6l-4.5-4 6-.6Z" />
    </>
  ),
  arrow: (
    <>
      <path d="M4 12h16" />
      <path d="m14 6 6 6-6 6" />
    </>
  ),
}

const Icon = ({ name, className, strokeWidth = 1.5 }) => {
  const path = paths[name] ?? paths.star

  return (
    <svg
      data-reveal="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className={cn('block h-6 w-6', className)}
    >
      {path}
    </svg>
  )
}

export default Icon
