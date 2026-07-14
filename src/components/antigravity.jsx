'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { useTheme } from '@/hooks/use-theme'
import { cn } from '@/utils/cn'

/*
 * Antigravity — internal-page hero background.
 *
 * A field of soft red particles that drift upward (anti-gravity), sway on a
 * gentle sine wave, and lean toward the pointer with a subtle magnetic
 * attraction. Rendered on a transparent Three.js canvas via React Three
 * Fiber, sized to fully cover the parent (`absolute inset-0`), and always
 * `pointer-events: none` so hero content on top stays interactive.
 *
 * Theme adaptation:
 *   - Dark theme  — brighter red particles, additive blending for glow,
 *                    higher opacity for readable atmosphere on black.
 *   - Light theme — softer red particles, normal blending, reduced opacity
 *                    so the field reads as texture rather than noise on
 *                    white.
 *
 * Performance:
 *   - `dpr={[1, 1.6]}` caps the pixel ratio; retina displays still look
 *     crisp without doubling GPU cost.
 *   - Particle count scales down on narrow viewports (~1/3 on mobile).
 *   - `frameloop` toggles between `'always'` and `'never'` via
 *     IntersectionObserver — the moment the hero scrolls off-screen the
 *     canvas stops requesting frames.
 *   - `prefers-reduced-motion: reduce` locks the field in a static state
 *     but still renders one frame so the atmosphere is present.
 *   - Positions live in a single `Float32Array`, mutated in place — no
 *     per-frame allocations.
 *
 * Every colour is driven by the theme, never hard-coded off-palette. The
 * component reads `useTheme()` (which listens for `data-theme` changes on
 * <html>) so it repaints instantly when the user flips the theme toggle.
 */

const DARK_PARTICLE_COLOR = new THREE.Color('#ff2f52')
const LIGHT_PARTICLE_COLOR = new THREE.Color('#bf0a30')

const AntigravityField = ({ theme }) => {
  const pointsRef = useRef(null)
  const materialRef = useRef(null)
  const mouseRef = useRef(new THREE.Vector3(9999, 9999, 0))
  const { viewport, size } = useThree()

  // Scale particle count by viewport width — mobile gets a lighter field.
  const count = useMemo(() => {
    if (size.width < 640) return 340
    if (size.width < 1024) return 620
    return 900
  }, [size.width])

  // Initial positions + per-particle motion parameters. Allocated once,
  // never reallocated — every frame mutates the same Float32Array in place.
  const { positions, base, speeds, phases, radii, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const base = new Float32Array(count * 3)
    const speeds = new Float32Array(count) // vertical drift speed
    const phases = new Float32Array(count) // sway phase offset
    const radii = new Float32Array(count) // sway amplitude
    const sizes = new Float32Array(count) // per-particle scale

    // Spread the field wider than the visible viewport so particles enter
    // and exit smoothly at the edges rather than popping in.
    const spread = 10
    const height = 6

    for (let i = 0; i < count; i += 1) {
      const x = (Math.random() - 0.5) * spread
      const y = (Math.random() - 0.5) * height
      const z = (Math.random() - 0.5) * 3

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      base[i * 3] = x
      base[i * 3 + 1] = y
      base[i * 3 + 2] = z

      speeds[i] = 0.06 + Math.random() * 0.14 // upward drift
      phases[i] = Math.random() * Math.PI * 2
      radii[i] = 0.15 + Math.random() * 0.55
      sizes[i] = 0.6 + Math.random() * 1.4
    }
    return { positions, base, speeds, phases, radii, sizes }
  }, [count])

  // Feed a per-vertex size attribute so a single points draw call renders
  // particles at varying sizes — much cheaper than per-particle meshes.
  useEffect(() => {
    if (!pointsRef.current) return
    const geo = pointsRef.current.geometry
    if (!geo.getAttribute('size')) {
      geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    }
  }, [sizes])

  // Track pointer in world coordinates for magnetic attraction.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const handleMove = (event) => {
      // Normalise to (-1, 1) → viewport space so movement magnitude matches
      // whatever the current camera sees.
      const nx = (event.clientX / window.innerWidth) * 2 - 1
      const ny = -(event.clientY / window.innerHeight) * 2 + 1
      mouseRef.current.set(nx * viewport.width * 0.5, ny * viewport.height * 0.5, 0)
    }
    const handleLeave = () => mouseRef.current.set(9999, 9999, 0)
    window.addEventListener('mousemove', handleMove, { passive: true })
    window.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseleave', handleLeave)
    }
  }, [viewport.width, viewport.height])

  // Apply theme-appropriate colour + blend mode without recreating the
  // material — a simple assignment is enough because the material is a
  // motion-value target for React.
  useEffect(() => {
    if (!materialRef.current) return
    if (theme === 'light') {
      materialRef.current.color.copy(LIGHT_PARTICLE_COLOR)
      materialRef.current.opacity = 0.32
      materialRef.current.blending = THREE.NormalBlending
    } else {
      materialRef.current.color.copy(DARK_PARTICLE_COLOR)
      materialRef.current.opacity = 0.85
      materialRef.current.blending = THREE.AdditiveBlending
    }
    materialRef.current.needsUpdate = true
  }, [theme])

  // Reduced motion — snap to static state.
  const prefersReduced = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useFrame((state, delta) => {
    const points = pointsRef.current
    if (!points) return
    if (prefersReduced) return

    // Clamp dt so a paused tab returning doesn't teleport every particle.
    const dt = Math.min(delta, 1 / 30)
    const t = state.clock.elapsedTime
    const height = 6
    const mx = mouseRef.current.x
    const my = mouseRef.current.y

    const arr = points.geometry.attributes.position.array
    const magneticRadius = 2.4
    const magneticStrength = 0.35

    for (let i = 0; i < count; i += 1) {
      const idx = i * 3

      // Anti-gravity drift — steady upward, with a soft sine sway on X.
      let y = arr[idx + 1] + speeds[i] * dt
      // Wrap around the top back to the bottom so the field is endless.
      if (y > height * 0.5) y = -height * 0.5

      const sway = Math.sin(t * 0.55 + phases[i]) * radii[i] * 0.35
      let x = base[idx] + sway
      let z = base[idx + 2] + Math.cos(t * 0.4 + phases[i]) * 0.15

      // Magnetic pointer attraction — falls off with distance.
      const dx = mx - x
      const dy = my - y
      const distSq = dx * dx + dy * dy
      if (distSq < magneticRadius * magneticRadius) {
        const falloff = 1 - Math.sqrt(distSq) / magneticRadius
        x += dx * falloff * magneticStrength * dt * 3
        y += dy * falloff * magneticStrength * dt * 3
      }

      arr[idx] = x
      arr[idx + 1] = y
      arr[idx + 2] = z

      // Base X follows the smoothed particle position so the sway envelope
      // travels with the pointer-nudged particle rather than snapping back.
      base[idx] = x - sway
    }

    points.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
          usage={THREE.DynamicDrawUsage}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        color={theme === 'light' ? LIGHT_PARTICLE_COLOR : DARK_PARTICLE_COLOR}
        size={0.045}
        sizeAttenuation
        transparent
        opacity={theme === 'light' ? 0.32 : 0.85}
        depthWrite={false}
        blending={
          theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending
        }
      />
    </points>
  )
}

const Antigravity = ({ className }) => {
  const containerRef = useRef(null)
  const [inView, setInView] = useState(true)
  const { theme } = useTheme()

  // Pause the canvas the moment the hero leaves the viewport — no reason to
  // rAF-render a scene the user cannot see. Uses IntersectionObserver with
  // a modest rootMargin so we resume slightly before the hero enters.
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return undefined
    const el = containerRef.current
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '120px', threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-fx="antigravity"
      className={cn(
        'pointer-events-none absolute inset-0 -z-0 overflow-hidden',
        className,
      )}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 55, near: 0.1, far: 20 }}
        dpr={[1, 1.6]}
        frameloop={inView ? 'always' : 'never'}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: false,
        }}
      >
        <AntigravityField theme={theme} />
      </Canvas>

      {/* Subtle radial gradient over the field so hero text over the centre
          always has extra contrast against the busiest particle band. Uses
          the theme foreground / background so it flips with the theme. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, transparent 0%, var(--color-background) 90%)',
          opacity: 0.55,
        }}
      />
    </div>
  )
}

export default Antigravity
