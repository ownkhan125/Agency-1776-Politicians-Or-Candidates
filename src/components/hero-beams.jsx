'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { cn } from '@/utils/cn'

/*
 * HeroBeams — React Three Fiber port of the "Beams" light-bars effect,
 * repalletted to the site's red accent and rebalanced per theme.
 *
 * A single fullscreen quad renders every beam through one custom shader —
 * parallel light bars swept diagonally across the view, brightness FBM-noise
 * modulated over time, with a soft radial falloff so edges bleed into the
 * surface rather than cutting off at the canvas boundary.
 *
 * Theme tuning (each mode is designed, not inverted):
 *   Dark mode  — luminous red beams on black.
 *                blending  = AdditiveBlending  (glow adds to background)
 *                intensity ≈ 1.15
 *                alpha ramp deep + saturated, secondary tint = cream
 *                foreground for a subtle warm hue at the noise crests.
 *
 *   Light mode — soft rose-haze washes on white.
 *                blending  = NormalBlending    (source-over composites cleanly)
 *                intensity ≈ 0.60
 *                shader blends TOWARDS white (not TO accent) so beams read as
 *                pink light on paper rather than red paint on a wall.
 *                alpha is capped low so the accent never overpowers content.
 *
 * Theme changes push through:
 *   - `uAccent` / `uSecondary` colour uniforms (via MutationObserver)
 *   - `uThemeLight` flag (0 / 1) toggles the two shader branches
 *   - `blending` mode swapped on the material with `needsUpdate = true`,
 *     so the swap lands within a single frame — no reload, no remount.
 *
 * Performance safeguards:
 *   - devicePixelRatio clamped to [1, 1.5] via r3f's `dpr` prop.
 *   - IntersectionObserver pauses the render loop when the hero is off-screen.
 *   - `prefers-reduced-motion` freezes at t = 0 (single paint).
 *   - r3f's `frameloop` toggled between `always` and `never` so paused
 *     frames are truly idle, not throttled.
 */

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3  uAccent;
  uniform vec3  uSecondary;
  uniform float uIntensity;
  uniform float uBeamCount;
  uniform float uAspect;
  uniform float uThemeLight;   // 0 = dark, 1 = light

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.0 + vec2(3.0, 1.0);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= uAspect;

    float rot = 0.55 + sin(uTime * 0.07) * 0.06 + cos(uTime * 0.11) * 0.04;
    float c = cos(rot);
    float s = sin(rot);
    vec2 p = mat2(c, -s, s, c) * uv;

    float phase = uTime * 0.35;
    float bar   = sin(p.x * uBeamCount + phase);
    float beam  = smoothstep(0.55, 0.98, bar * 0.5 + 0.5);

    float bar2  = sin(p.x * (uBeamCount * 1.55) + phase * 1.3 + 2.1);
    float beam2 = smoothstep(0.65, 0.99, bar2 * 0.5 + 0.5) * 0.55;

    float n = fbm(vec2(p.y * 1.5, p.x * 0.6 + uTime * 0.12));

    float longFade = smoothstep(0.95, 0.15, abs(p.y));
    float radial   = smoothstep(1.35, 0.15, length(p));

    float energy = (beam + beam2) * (0.35 + n * 0.85) * longFade * radial;

    vec3 col;
    float alpha;

    if (uThemeLight > 0.5) {
      // ---------------- LIGHT MODE ----------------
      // Beams tint pure white toward the accent — never darker than the paper
      // surface, so we never introduce muddy patches. Light Mode picks up
      // more of the accent at the noise crests, so the field reads as pink
      // sunbeams instead of red paint.
      vec3 baseWhite = vec3(1.0);
      vec3 tinted = mix(baseWhite, uAccent, 0.55 + n * 0.25);
      col = tinted;
      // Alpha ramp deliberately soft: the strongest crests only hit ~0.32 so
      // the accent never dominates the content sitting in front.
      alpha = smoothstep(0.05, 0.85, energy) * 0.32 * uIntensity;
    } else {
      // ---------------- DARK MODE -----------------
      // Accent × energy × intensity → luminous red glow. Secondary (cream)
      // mixes in slightly at the noise crests for warmth. AdditiveBlending on
      // the material amplifies these values against the black surface.
      vec3 tinted = mix(uAccent, uSecondary, n * 0.25);
      col = tinted * energy * uIntensity;
      alpha = smoothstep(0.0, 0.6, energy) * 0.9;
    }

    gl_FragColor = vec4(col, alpha);
  }
`

const readThemeColors = () => {
  const cs = getComputedStyle(document.documentElement)
  const accent = cs.getPropertyValue('--color-accent').trim() || '#bf0a30'
  const foreground =
    cs.getPropertyValue('--color-foreground').trim() || '#f0ede6'
  return { accent, foreground }
}

const readThemeMode = () => {
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'light' ? 'light' : 'dark'
}

const BeamsScene = ({ colors, themeMode, prefersReduced }) => {
  const materialRef = useRef(null)
  const { size } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color(colors.accent) },
      uSecondary: { value: new THREE.Color(colors.foreground) },
      uIntensity: { value: themeMode === 'light' ? 0.6 : 1.15 },
      uBeamCount: { value: 5.5 },
      uAspect: { value: 1 },
      uThemeLight: { value: themeMode === 'light' ? 1 : 0 },
    }),
    // Colours and theme flag intentionally omitted from deps so the material
    // stays stable — updates are pushed imperatively below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // Push theme-token swap into uniforms without rebuilding material.
  useEffect(() => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uAccent.value.set(colors.accent)
    materialRef.current.uniforms.uSecondary.value.set(colors.foreground)
  }, [colors.accent, colors.foreground])

  // Push theme mode: swap the shader branch AND the material's blending mode.
  // `needsUpdate = true` gets the renderer to re-compile shader state for the
  // new blend function on the very next frame — the swap lands live.
  useEffect(() => {
    if (!materialRef.current) return
    const mat = materialRef.current
    mat.uniforms.uThemeLight.value = themeMode === 'light' ? 1 : 0
    mat.uniforms.uIntensity.value = themeMode === 'light' ? 0.6 : 1.15
    mat.blending =
      themeMode === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending
    mat.needsUpdate = true
  }, [themeMode])

  useEffect(() => {
    if (!materialRef.current || size.height === 0) return
    materialRef.current.uniforms.uAspect.value = size.width / size.height
  }, [size.width, size.height])

  useFrame((state) => {
    if (prefersReduced) return
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={
          themeMode === 'light'
            ? THREE.NormalBlending
            : THREE.AdditiveBlending
        }
      />
    </mesh>
  )
}

const HeroBeams = ({ className }) => {
  const containerRef = useRef(null)
  const [visible, setVisible] = useState(true)
  const [colors, setColors] = useState(() => ({
    accent: '#bf0a30',
    foreground: '#f0ede6',
  }))
  const [themeMode, setThemeMode] = useState('dark')

  useEffect(() => {
    setColors(readThemeColors())
    setThemeMode(readThemeMode())
    const mo = new MutationObserver(() => {
      setColors(readThemeColors())
      setThemeMode(readThemeMode())
    })
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    })
    return () => mo.disconnect()
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setVisible(entry.isIntersecting)
      },
      { threshold: 0 },
    )
    io.observe(containerRef.current)
    return () => io.disconnect()
  }, [])

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const frameloop = !visible || prefersReduced ? 'never' : 'always'

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
    >
      <Canvas
        orthographic
        camera={{
          left: -1,
          right: 1,
          top: 1,
          bottom: -1,
          near: -1,
          far: 1,
          position: [0, 0, 0],
        }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        frameloop={frameloop}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      >
        <BeamsScene
          colors={colors}
          themeMode={themeMode}
          prefersReduced={prefersReduced}
        />
      </Canvas>
    </div>
  )
}

export default HeroBeams
