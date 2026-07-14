'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import Icon from '@/components/icon'
import { cn } from '@/utils/cn'

/*
 * Fully custom dropdown. The native `<select>` element hands the popup off to
 * the OS renderer, which produces the mismatched white-on-black artefact you
 * saw against the dark theme — impossible to fix with CSS. This component
 * replaces the whole thing:
 *
 *   - Trigger is a real `<button role="combobox">` styled identically to the
 *     text inputs in the contact form (underline-only, no boxed background).
 *   - Panel is a `<ul role="listbox">` positioned below the trigger; every
 *     colour comes from theme tokens so light and dark modes both look
 *     native without any per-theme override.
 *   - Motion library handles the open/close (fade + subtle drop) and the
 *     arrow rotation.
 *   - Keyboard: Enter/Space/ArrowDown to open, Arrow{Up|Down|Home|End} to
 *     navigate, Enter to commit, Escape to close. Focus returns to the
 *     trigger on close.
 *   - Emits `onChange({ target: { name, value } })` so it drops into the
 *     existing form's `update(name)` handler without changes.
 */

const Combobox = ({
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  invalid = false,
  className,
}) => {
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const listRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const listId = useId()

  // Sync focused index to the current value each time the panel opens, so
  // keyboard nav starts at "your current selection" rather than the top.
  useEffect(() => {
    if (open) {
      const idx = options.indexOf(value)
      setFocusedIndex(idx >= 0 ? idx : 0)
    }
  }, [open, value, options])

  // Click outside → close.
  useEffect(() => {
    if (!open) return undefined
    const handleDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleDown)
    return () => document.removeEventListener('mousedown', handleDown)
  }, [open])

  // Ensure the focused option scrolls into view on keyboard nav.
  useEffect(() => {
    if (!open || focusedIndex < 0) return
    const el = listRef.current?.children[focusedIndex]
    el?.scrollIntoView({ block: 'nearest' })
  }, [focusedIndex, open])

  const commit = (option) => {
    onChange({ target: { name, value: option } })
    setOpen(false)
    // Return focus to trigger — same pattern as the SmoothCursor/menu drawers.
    requestAnimationFrame(() => buttonRef.current?.focus())
  }

  const handleKeyDown = (event) => {
    if (disabled) return

    if (event.key === 'Escape') {
      if (open) {
        event.preventDefault()
        setOpen(false)
        buttonRef.current?.focus()
      }
      return
    }

    if (!open) {
      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault()
        setOpen(true)
      }
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setFocusedIndex((i) => Math.min(options.length - 1, i + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setFocusedIndex((i) => Math.max(0, i - 1))
    } else if (event.key === 'Home') {
      event.preventDefault()
      setFocusedIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setFocusedIndex(options.length - 1)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (focusedIndex >= 0) commit(options[focusedIndex])
    } else if (event.key === 'Tab') {
      // Tab out closes the panel but lets focus continue naturally.
      setOpen(false)
    }
  }

  const hasValue = Boolean(value)

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        name={name}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        data-cursor="button"
        className={cn(
          'group flex w-full items-center justify-between gap-3 border-0 border-b border-muted bg-transparent py-3 text-left text-base leading-tight transition-colors',
          'hover:border-foreground/60 focus:border-accent focus:outline-none',
          invalid && 'border-accent',
          disabled && 'cursor-not-allowed opacity-60',
          hasValue ? 'text-foreground' : 'text-foreground/40',
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <motion.span
          aria-hidden="true"
          className="flex h-5 w-5 items-center justify-center text-accent"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.28, ease: [0.85, 0, 0, 1] }}
        >
          {/* Base icon points right; rotate-90 makes it point down at rest,
              and the parent motion rotates 180° on open so it points up. */}
          <Icon name="arrow" className="h-4 w-4 rotate-90" strokeWidth={2} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            key="panel"
            id={listId}
            role="listbox"
            ref={listRef}
            aria-activedescendant={
              focusedIndex >= 0
                ? `${listId}-option-${focusedIndex}`
                : undefined
            }
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.85, 0, 0, 1] }}
            /*
             * Panel styling — every colour is a theme token, so light + dark
             * both look native without any per-theme override:
             *   - `bg-background` — pure white in light, near-black in dark
             *   - `border-muted`  — light-gray in light, dark-gray in dark
             *   - shadow uses a soft accent-tinted drop so it reads premium
             *     against both light paper and dark surfaces
             */
            className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto border border-muted/80 bg-background py-2 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.35),0_0_0_1px_rgba(191,10,48,0.06)]"
          >
            {options.map((option, i) => {
              const selected = option === value
              const focused = i === focusedIndex
              return (
                <li
                  key={option}
                  id={`${listId}-option-${i}`}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setFocusedIndex(i)}
                  onMouseDown={(event) => {
                    // Use mousedown so the button doesn't lose focus first,
                    // which would close the panel before the click lands.
                    event.preventDefault()
                    commit(option)
                  }}
                  data-cursor="button"
                  className={cn(
                    'group/option flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                    focused
                      ? 'bg-accent/15 text-foreground'
                      : 'text-foreground/85 hover:bg-accent/10 hover:text-foreground',
                    selected && 'text-foreground',
                  )}
                >
                  {/* Selection marker — a small accent bar to the left of the
                      chosen option, matching the rectangular language the rest
                      of the site uses instead of a checkmark. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'block h-3 w-[3px] shrink-0 transition-all duration-300',
                      selected
                        ? 'bg-accent'
                        : focused
                        ? 'bg-accent/40'
                        : 'bg-transparent',
                    )}
                  />
                  <span className={cn('truncate', selected && 'font-medium')}>
                    {option}
                  </span>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Combobox
