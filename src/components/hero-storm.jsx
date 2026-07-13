'use client'

import { useLayoutEffect, useRef } from 'react'

import { gsap, ScrollTrigger } from '@/utils/register-gsap'
import { cn } from '@/utils/cn'

/*
 * Cinematic storm atmosphere for the hero.
 *
 *   layer 1 (bottom canvas)  — soft volumetric cloud puffs, three depth bands
 *                              drifting at different speeds + directions.
 *                              CSS `filter: blur(28px)` composites the puffs
 *                              into wispy volumetric shapes without paying
 *                              per-frame filter cost.
 *   layer 2 (top canvas)     — lightning strikes (procedural jagged path with
 *                              perpendicular midpoint displacement + branches)
 *                              plus the cloud-glow layer that briefly floods
 *                              the frame with a soft accent tint during flash.
 *
 * Every timing decision runs through GSAP:
 *   - Strikes are scheduled via `gsap.delayedCall` with `gsap.utils.random`
 *     so intervals feel weather-like, never on a loop.
 *   - Each strike is a `gsap.timeline` with a 4-step flicker envelope
 *     (bright → dim → bright → fade) that drives both bolt intensity and
 *     cloud-glow intensity in lockstep.
 *   - Scroll parallax is driven by a `ScrollTrigger.create({ scrub })` so
 *     layers shift on the same eased scroll curve as ScrollSmoother.
 *
 * Performance safeguards:
 *   - devicePixelRatio capped at 1.5 (blur mask absorbs the resolution loss).
 *   - IntersectionObserver pauses everything when the hero is off-screen.
 *   - `visibilitychange` pauses when the tab is hidden.
 *   - `prefers-reduced-motion` renders one static frame and skips strikes.
 */

const HeroStorm = ({ className }) => {
  const containerRef = useRef(null)
  const cloudsCanvasRef = useRef(null)
  const stormCanvasRef = useRef(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    const cloudsCanvas = cloudsCanvasRef.current
    const stormCanvas = stormCanvasRef.current
    if (!container || !cloudsCanvas || !stormCanvas) return undefined

    const cctx = cloudsCanvas.getContext('2d', { alpha: true })
    const sctx = stormCanvas.getContext('2d', { alpha: true })
    if (!cctx || !sctx) return undefined

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = 1
    let rafId = null
    let running = false
    let lastTs = 0
    let parallaxY = 0
    let puffs = []
    let activeStrikes = []
    let colors = readTheme()

    // ---------- THEME ------------------------------------------------------
    function readTheme() {
      const cs = getComputedStyle(document.documentElement)
      const accent = cs.getPropertyValue('--color-accent').trim() || '#bf0a30'
      const foreground =
        cs.getPropertyValue('--color-foreground').trim() || '#f0ede6'
      return {
        // Cloud tint — very-slightly warm accent, blurred + low alpha so it
        // reads as an atmospheric red-gray, never a solid red.
        cloudTint: accent,
        cloudHighlight: foreground,
        bolt: accent,
        glow: accent,
      }
    }

    // ---------- SIZING -----------------------------------------------------
    function sizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const rect = container.getBoundingClientRect()
      width = Math.max(1, Math.floor(rect.width))
      height = Math.max(1, Math.floor(rect.height))
      for (const canvas of [cloudsCanvas, stormCanvas]) {
        canvas.width = Math.floor(width * dpr)
        canvas.height = Math.floor(height * dpr)
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
      }
      cctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // ---------- PUFF FIELD -------------------------------------------------
    function puffTarget() {
      // ~28% denser than baseline. Front layer picks up the biggest share so
      // atmospheric depth reads stronger without softening the far bands.
      if (width < 640) return 18
      if (width < 1280) return 28
      return 38
    }

    function makePuff(layer) {
      // Layer 0 (back)  — biggest, slowest, softest
      // Layer 1 (mid)   — medium
      // Layer 2 (front) — smallest, fastest, sharper direction
      //
      // Alphas bumped ~30% vs baseline so the cloud field reads more
      // atmospheric without losing the wispy volumetric feel — the CSS blur
      // still absorbs the extra saturation into soft billows.
      const layerConfig = [
        { rMin: 220, rMax: 360, speed: 0.09, alpha: 0.185, dir: 1 },
        { rMin: 140, rMax: 250, speed: 0.16, alpha: 0.16, dir: -1 },
        { rMin: 85, rMax: 170, speed: 0.24, alpha: 0.135, dir: 1 },
      ][layer]
      return {
        layer,
        x: Math.random() * width,
        y: Math.random() * height,
        r: layerConfig.rMin + Math.random() * (layerConfig.rMax - layerConfig.rMin),
        speed: layerConfig.speed * (Math.random() * 0.5 + 0.75),
        dir: layerConfig.dir,
        alpha: layerConfig.alpha * (Math.random() * 0.6 + 0.7),
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.00015 + Math.random() * 0.0004,
        bob: 10 + Math.random() * 30,
      }
    }

    function initPuffs() {
      const target = puffTarget()
      puffs = new Array(target)
      for (let i = 0; i < target; i++) {
        // Distribute across three depth layers
        const layer = i % 3
        puffs[i] = makePuff(layer)
      }
    }

    function drawClouds(dt, cloudGlow) {
      cctx.clearRect(0, 0, width, height)
      cctx.globalCompositeOperation = 'lighter'

      const layerParallax = [0.15, 0.4, 0.7]
      for (let i = 0; i < puffs.length; i++) {
        const p = puffs[i]
        // Advance
        p.x += p.speed * p.dir * dt * 0.06
        p.phase += p.phaseSpeed * dt
        // Wrap horizontally with a generous margin so puffs never pop in
        if (p.x < -p.r) p.x = width + p.r
        if (p.x > width + p.r) p.x = -p.r

        const y =
          p.y +
          Math.sin(p.phase) * p.bob -
          parallaxY * layerParallax[p.layer]

        // During a lightning flash, all puffs brighten — deeper layers glow
        // less than front layers so the depth reads correctly. Amplified from
        // the baseline (0.4 + 0.35·layer) to (0.55 + 0.45·layer) so a strike
        // reads as a genuine illumination, not just a background tint shift.
        const glowFactor = 1 + cloudGlow * (0.55 + p.layer * 0.45)
        cctx.globalAlpha = Math.min(0.95, p.alpha * glowFactor)

        // Soft radial fill — the CSS blur turns this into a wispy puff. Center
        // stop is fully-opaque tint (parsed to rgb) so the accent hue is
        // present at maximum before alpha drops off through the falloff.
        const grad = cctx.createRadialGradient(p.x, y, 0, p.x, y, p.r)
        grad.addColorStop(0, cssAlpha(colors.cloudTint, 1))
        grad.addColorStop(0.5, cssAlpha(colors.cloudTint, 0.35))
        grad.addColorStop(1, cssAlpha(colors.cloudTint, 0))
        cctx.fillStyle = grad
        cctx.beginPath()
        cctx.arc(p.x, y, p.r, 0, Math.PI * 2)
        cctx.fill()
      }
      cctx.globalCompositeOperation = 'source-over'
    }

    // ---------- LIGHTNING --------------------------------------------------
    function generateBolt(startX, startY, endX, endY, deviation) {
      let segments = [
        [startX, startY],
        [endX, endY],
      ]
      const iterations = 5
      for (let iter = 0; iter < iterations; iter++) {
        const next = [segments[0]]
        for (let i = 0; i < segments.length - 1; i++) {
          const [x1, y1] = segments[i]
          const [x2, y2] = segments[i + 1]
          const mx = (x1 + x2) / 2
          const my = (y1 + y2) / 2
          const dx = x2 - x1
          const dy = y2 - y1
          const len = Math.hypot(dx, dy) || 1
          const off = (Math.random() - 0.5) * deviation
          const nx = -dy / len
          const ny = dx / len
          next.push([mx + nx * off, my + ny * off])
          next.push([x2, y2])
        }
        segments = next
        deviation *= 0.55
      }
      return segments
    }

    function generateBranches(main, count) {
      const branches = []
      for (let i = 0; i < count; i++) {
        const idx = 2 + Math.floor(Math.random() * (main.length - 4))
        const [x, y] = main[idx]
        const angle = (Math.random() - 0.5) * Math.PI * 0.65
        const length = 80 + Math.random() * 180
        const endX = x + Math.sin(angle) * length
        const endY = y + Math.cos(angle) * length * 0.9
        branches.push(generateBolt(x, y, endX, endY, 40))
      }
      return branches
    }

    function drawBolt(segments, intensity) {
      if (segments.length < 2) return
      // Wide accent halo
      sctx.save()
      sctx.strokeStyle = colors.bolt
      sctx.shadowColor = colors.glow
      sctx.lineCap = 'round'
      sctx.lineJoin = 'round'

      // Halo pass — wider glow, higher alpha so the surrounding cloud reads
      // as truly illuminated (rather than just outlined).
      sctx.globalAlpha = intensity * 0.5
      sctx.lineWidth = 12
      sctx.shadowBlur = 52
      sctx.beginPath()
      sctx.moveTo(segments[0][0], segments[0][1])
      for (let i = 1; i < segments.length; i++) {
        sctx.lineTo(segments[i][0], segments[i][1])
      }
      sctx.stroke()

      // Mid pass
      sctx.globalAlpha = intensity * 0.9
      sctx.lineWidth = 4
      sctx.shadowBlur = 26
      sctx.stroke()

      // Bright core — softer accent, not stark white, so it stays in-brand
      sctx.globalAlpha = Math.min(1, intensity * 1.1)
      sctx.strokeStyle = mixColor(colors.bolt, colors.cloudHighlight, 0.65)
      sctx.lineWidth = 1.6
      sctx.shadowBlur = 14
      sctx.stroke()

      sctx.restore()
    }

    function drawStrikes() {
      sctx.clearRect(0, 0, width, height)
      if (!activeStrikes.length) return
      for (let s = 0; s < activeStrikes.length; s++) {
        const strike = activeStrikes[s]
        if (strike.intensity <= 0.005) continue
        drawBolt(strike.main, strike.intensity)
        for (let b = 0; b < strike.branches.length; b++) {
          drawBolt(strike.branches[b], strike.intensity * 0.65)
        }
      }
    }

    function triggerStrike() {
      // Position the bolt anywhere across the top with a dropdown-ish end
      const startX = width * (0.15 + Math.random() * 0.7)
      const startY = -20
      const endX = startX + (Math.random() - 0.5) * width * 0.35
      const endY = height * (0.55 + Math.random() * 0.35)
      const main = generateBolt(startX, startY, endX, endY, 90)
      const branches = generateBranches(main, 2 + Math.floor(Math.random() * 3))

      const strike = { main, branches, intensity: 0, cloudGlow: 0 }
      activeStrikes.push(strike)

      // Realistic flicker envelope — bright → dim → bright → fade.
      // Peak intensity and cloud glow both nudged up so the strike registers
      // as a genuine illumination of the surrounding puffs, and the tail is
      // held a beat longer so the cloud bloom lingers after the bolt has
      // faded — same behaviour as a real strike lighting up a stormfront.
      const tl = gsap.timeline({
        onComplete: () => {
          activeStrikes = activeStrikes.filter((x) => x !== strike)
        },
      })
      tl.to(strike, {
        intensity: 1.15,
        cloudGlow: 1.15,
        duration: 0.06,
        ease: 'power2.out',
      })
        .to(strike, {
          intensity: 0.3,
          cloudGlow: 0.55,
          duration: 0.07,
          ease: 'power1.in',
        })
        .to(strike, {
          intensity: 1,
          cloudGlow: 1.05,
          duration: 0.05,
          ease: 'power1.out',
        })
        .to(strike, {
          intensity: 0,
          cloudGlow: 0,
          duration: 0.55,
          ease: 'power2.out',
        })
    }

    let lightningCall = null
    function scheduleLightning() {
      if (prefersReduced) return
      // Frequency bumped: primary delay window narrowed to 1.4–4.6 s so the
      // sky reads as an active storm rather than a distant one. Roughly one
      // strike in six is followed by a quick "double flash" within 0.35–0.9 s
      // — that's the pattern real weather takes, and it keeps the timing from
      // ever feeling metronomic.
      const doubleFlash = Math.random() < 0.18
      const delay = doubleFlash
        ? gsap.utils.random(0.35, 0.9)
        : gsap.utils.random(1.4, 4.6)
      lightningCall = gsap.delayedCall(delay, () => {
        if (running) triggerStrike()
        scheduleLightning()
      })
    }

    // ---------- LOOP -------------------------------------------------------
    function tick(ts) {
      if (!running) return
      const dt = lastTs ? Math.min(60, ts - lastTs) : 16.7
      lastTs = ts

      // Aggregate cloud glow across all active strikes
      let cloudGlow = 0
      for (let i = 0; i < activeStrikes.length; i++) {
        if (activeStrikes[i].cloudGlow > cloudGlow) {
          cloudGlow = activeStrikes[i].cloudGlow
        }
      }
      drawClouds(dt, cloudGlow)
      drawStrikes()

      rafId = requestAnimationFrame(tick)
    }

    function start() {
      if (running || prefersReduced) return
      running = true
      lastTs = 0
      rafId = requestAnimationFrame(tick)
    }
    function stop() {
      running = false
      if (rafId != null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    }

    // ---------- PARALLAX ---------------------------------------------------
    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        parallaxY = self.progress * 120
      },
    })

    // ---------- OBSERVERS --------------------------------------------------
    const ro = new ResizeObserver(() => {
      sizeCanvas()
      initPuffs()
    })
    ro.observe(container)

    const mo = new MutationObserver(() => {
      colors = readTheme()
    })
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    })

    const handleVis = () => {
      if (document.hidden) stop()
      else start()
    }
    document.addEventListener('visibilitychange', handleVis)

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

    // ---------- BOOTSTRAP --------------------------------------------------
    sizeCanvas()
    initPuffs()
    if (prefersReduced) {
      // Static one-frame render for reduced-motion so the field still tinted
      drawClouds(0, 0)
    } else {
      start()
      scheduleLightning()
      // Fire an opening strike quickly so users landing on the page get a
      // signal that this is a stormy hero.
      gsap.delayedCall(1.2, () => running && triggerStrike())
    }

    return () => {
      stop()
      if (lightningCall) lightningCall.kill()
      st.kill()
      ro.disconnect()
      mo.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', handleVis)
      activeStrikes = []
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
      {/*
       * Cloud canvas — blurred at composite time. The blur is what turns the
       * radial-gradient puffs into wispy volumetric clouds without paying a
       * per-frame filter cost. `mix-blend-mode: screen` keeps the tinted
       * clouds legible on dark backgrounds.
       */}
      <canvas
        ref={cloudsCanvasRef}
        className="absolute inset-0 block h-full w-full"
        style={{
          // Blur radius unchanged so the volumetric feel doesn't shift; the
          // extra saturation deepens the brand-red tint without altering the
          // silhouette. Opacity nudged up to 0.95 to match the denser puff
          // field so density gain translates 1:1 to visual density.
          filter: 'blur(28px) saturate(1.18)',
          mixBlendMode: 'screen',
          opacity: 0.95,
        }}
      />

      {/*
       * Lightning + halo canvas — sharp. No blur, additive blending so red
       * flashes read as luminous accents on dark background.
       */}
      <canvas
        ref={stormCanvasRef}
        className="absolute inset-0 block h-full w-full"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  )
}

/*
 * Parse a #rrggbb or var-resolved hex string into "rgba(r, g, b, alpha)".
 * The theme tokens resolve to hex strings via `getComputedStyle`, so a small
 * inline parser saves us from bringing in an alpha helper.
 */
function cssAlpha(hex, alpha) {
  const parsed = hexToRgb(hex)
  if (!parsed) return `rgba(191, 10, 48, ${alpha})`
  return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${alpha})`
}

function mixColor(a, b, weight) {
  const ra = hexToRgb(a) || { r: 191, g: 10, b: 48 }
  const rb = hexToRgb(b) || { r: 240, g: 237, b: 230 }
  const w = Math.max(0, Math.min(1, weight))
  const r = Math.round(ra.r * (1 - w) + rb.r * w)
  const g = Math.round(ra.g * (1 - w) + rb.g * w)
  const bl = Math.round(ra.b * (1 - w) + rb.b * w)
  return `rgb(${r}, ${g}, ${bl})`
}

function hexToRgb(hex) {
  if (!hex) return null
  const m = hex
    .trim()
    .match(/^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/)
  if (!m) return null
  let s = m[1]
  if (s.length === 3) s = s.split('').map((c) => c + c).join('')
  return {
    r: parseInt(s.slice(0, 2), 16),
    g: parseInt(s.slice(2, 4), 16),
    b: parseInt(s.slice(4, 6), 16),
  }
}

export default HeroStorm
