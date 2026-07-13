'use client'

import { useLayoutEffect, useRef } from 'react'

import { cn } from '@/utils/cn'

/*
 * Hero background particle field. Ports the reference behaviour — particles
 * rise from the bottom of the canvas, sway on a sine wave, repel from the
 * pointer, and draw thin connective lines to the pointer while it hovers —
 * but drives every colour from the site's theme tokens (`--color-foreground`
 * for the particle fill, `--color-accent` for the ambient bloom) so both dark
 * and light themes look native.
 *
 * Performance safeguards:
 *   - devicePixelRatio capped at 2 so retina renders are crisp without
 *     doubling paint cost on 3× displays.
 *   - Particle count scales down on narrow viewports.
 *   - rAF loop pauses when the hero is off-screen (IntersectionObserver) or
 *     the tab is hidden (visibilitychange).
 *   - `prefers-reduced-motion: reduce` freezes the field in a static state.
 *
 * The mounted DOM is `<div><canvas/></div>` with `pointer-events: none` so
 * every hit still lands on the hero content sitting above it.
 */

const HeroParticles = ({ className }) => {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return undefined

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return undefined

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    // Pointer state kept in module scope so the tight rAF loop doesn't
    // re-allocate an object on every frame.
    const mouse = { x: -9999, y: -9999, radius: 180, active: false }
    let particles = []
    let width = 0
    let height = 0
    let dpr = 1
    let rafId = null
    let running = false
    let colors = readThemeColors()

    function readThemeColors() {
      const cs = getComputedStyle(document.documentElement)
      const foreground =
        cs.getPropertyValue('--color-foreground').trim() || '#f0ede6'
      const accent =
        cs.getPropertyValue('--color-accent').trim() || '#bf0a30'
      return {
        particle: foreground,
        glow: accent,
        // Connective lines pick up the accent at very low alpha; we build
        // them via rgba() using the same accent hex so theme swap flows
        // through automatically on the next frame.
        lineAccent: accent,
      }
    }

    function particleTarget() {
      if (width < 640) return 55
      if (width < 1024) return 95
      if (width < 1600) return 130
      return 160
    }

    function makeParticle(spawnAtBottom = false) {
      return {
        x: Math.random() * width,
        y: spawnAtBottom
          ? height + Math.random() * 120
          : Math.random() * height,
        size: Math.random() * 2 + 1.2,
        speed: Math.random() * 0.9 + 0.55,
        swaySpeed: Math.random() * 0.035 + 0.018,
        swayAmount: Math.random() * 1.7 + 1.0,
        angle: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.45 + 0.35,
      }
    }

    function initParticles() {
      const target = particleTarget()
      particles = new Array(target)
      for (let i = 0; i < target; i++) {
        // Scatter the initial field across the full canvas height so the
        // hero doesn't start empty.
        particles[i] = makeParticle(false)
      }
    }

    function sizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = container.getBoundingClientRect()
      width = Math.max(1, Math.floor(rect.width))
      height = Math.max(1, Math.floor(rect.height))
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function step() {
      ctx.clearRect(0, 0, width, height)

      // Connective lines to the pointer — drawn first so particles paint on top.
      if (mouse.active) {
        ctx.save()
        ctx.strokeStyle = colors.lineAccent
        ctx.globalAlpha = 0.14
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.hypot(dx, dy)
          if (dist < 160) {
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(mouse.x, mouse.y)
          }
        }
        ctx.stroke()
        ctx.restore()
      }

      // Particles — update then draw. Single loop keeps the branch predictor
      // happy and avoids two full passes over the array.
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.y -= p.speed
        p.angle += p.swaySpeed
        p.x += Math.sin(p.angle) * p.swayAmount

        if (mouse.active) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.hypot(dx, dy)
          if (dist < mouse.radius && dist > 0) {
            const force = (mouse.radius - dist) / mouse.radius
            const invDist = 1 / dist
            p.x += dx * invDist * force * 5
            p.y += dy * invDist * force * 5
          }
        }

        if (p.y + p.size < 0) {
          Object.assign(p, makeParticle(true))
        }

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.shadowBlur = 10
        ctx.shadowColor = colors.glow
        ctx.fillStyle = colors.particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      if (running) rafId = requestAnimationFrame(step)
    }

    function start() {
      if (running || prefersReduced) return
      running = true
      rafId = requestAnimationFrame(step)
    }

    function stop() {
      running = false
      if (rafId != null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    }

    // --- Pointer -------------------------------------------------------------
    const handleMove = (event) => {
      const rect = container.getBoundingClientRect()
      const clientX =
        event.clientX ?? event.touches?.[0]?.clientX ?? null
      const clientY =
        event.clientY ?? event.touches?.[0]?.clientY ?? null
      if (clientX == null || clientY == null) return
      const x = clientX - rect.left
      const y = clientY - rect.top
      // Only mark active when the pointer is actually over the hero — that way
      // we skip pointer-based work when the user has scrolled past.
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        mouse.x = x
        mouse.y = y
        mouse.active = true
      } else {
        mouse.active = false
      }
    }
    const handleLeave = () => {
      mouse.active = false
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    window.addEventListener('touchmove', handleMove, { passive: true })
    window.addEventListener('mouseout', handleLeave)
    window.addEventListener('touchend', handleLeave)

    // --- Resize --------------------------------------------------------------
    const ro = new ResizeObserver(() => {
      const prevCount = particles.length
      sizeCanvas()
      const nextCount = particleTarget()
      if (Math.abs(prevCount - nextCount) > 10) initParticles()
    })
    ro.observe(container)

    // --- Theme ---------------------------------------------------------------
    const mo = new MutationObserver(() => {
      colors = readThemeColors()
    })
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    })

    // --- Visibility ----------------------------------------------------------
    const handleVis = () => {
      if (document.hidden) stop()
      else start()
    }
    document.addEventListener('visibilitychange', handleVis)

    // --- Intersection --------------------------------------------------------
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) start()
          else stop()
        }
      },
      { threshold: 0 },
    )
    io.observe(container)

    // --- Bootstrap -----------------------------------------------------------
    sizeCanvas()
    initParticles()
    if (prefersReduced) {
      // One static paint so the hero isn't completely empty for reduced-motion.
      step()
    } else {
      start()
    }

    return () => {
      stop()
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('mouseout', handleLeave)
      window.removeEventListener('touchend', handleLeave)
      document.removeEventListener('visibilitychange', handleVis)
      ro.disconnect()
      mo.disconnect()
      io.disconnect()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}

export default HeroParticles
