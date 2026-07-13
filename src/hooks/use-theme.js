'use client'

import { useCallback, useEffect, useState } from 'react'

/*
 * Reads and writes the active theme via the `data-theme` attribute on <html>.
 * The initial attribute is set by the no-flash inline script in `layout.jsx`
 * so this hook never causes a hydration flash.
 *
 * A MutationObserver keeps every mounted <ThemeToggle> in sync when a theme
 * change originates from anywhere else on the page.
 */

const STORAGE_KEY = 'theme'
const SWAP_CLASS = 'theme-swapping'
const SWAP_DURATION_MS = 460

const readAttr = () => {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.getAttribute('data-theme') === 'light'
    ? 'light'
    : 'dark'
}

export const useTheme = () => {
  const [theme, setThemeState] = useState('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setThemeState(readAttr())
    setMounted(true)

    const observer = new MutationObserver(() => {
      setThemeState(readAttr())
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  const setTheme = useCallback((next) => {
    if (typeof document === 'undefined') return
    if (next !== 'light' && next !== 'dark') return

    const html = document.documentElement
    html.classList.add(SWAP_CLASS)
    html.setAttribute('data-theme', next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* storage unavailable — theme still applies for the session */
    }
    window.setTimeout(() => {
      html.classList.remove(SWAP_CLASS)
    }, SWAP_DURATION_MS)
  }, [])

  const toggle = useCallback(() => {
    setTheme(readAttr() === 'dark' ? 'light' : 'dark')
  }, [setTheme])

  return { theme, setTheme, toggle, mounted }
}
