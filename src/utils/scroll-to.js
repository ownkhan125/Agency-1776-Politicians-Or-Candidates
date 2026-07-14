'use client'

/*
 * Same-page scroll helper. Prefers ScrollSmoother when it's active (all the
 * pages wrap content in `#smooth-content`), otherwise falls back to native
 * smooth scroll. Meant as a click handler for same-page-scroll buttons — we
 * never use hash `href` attributes for these (per site-wide "no section-based
 * links" rule); the buttons are real `<button>` elements without navigation.
 */

export const scrollToId = (id) => {
  if (typeof window === 'undefined' || !id) return
  const el = document.getElementById(id)
  if (!el) return
  const smoother =
    window.ScrollSmoother &&
    window.ScrollSmoother.get &&
    window.ScrollSmoother.get()
  if (smoother) {
    // Account for the fixed navbar (~7rem) so the target isn't hidden behind
    // the fixed chrome after the smoother finishes.
    const rect = el.getBoundingClientRect()
    const target = rect.top + smoother.scrollTop() - 96
    smoother.scrollTo(Math.max(0, target), true)
  } else {
    const rect = el.getBoundingClientRect()
    const target = rect.top + window.scrollY - 96
    window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
  }
}

export const scrollToTop = () => {
  if (typeof window === 'undefined') return
  const smoother =
    window.ScrollSmoother &&
    window.ScrollSmoother.get &&
    window.ScrollSmoother.get()
  if (smoother) smoother.scrollTo(0, true)
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}
