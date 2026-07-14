const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const TARGET_URL = 'http://localhost:3000'
const OUT_DIR = path.join(process.env.TEMP || '/tmp', 'ui-audit')
fs.mkdirSync(OUT_DIR, { recursive: true })

const ROUTES = ['/', '/about', '/solutions', '/work', '/pricing', '/contact']
const VIEWPORTS = [
  { name: 'mobile-sm', w: 320, h: 640 },
  { name: 'mobile', w: 480, h: 800 },
  { name: 'tablet', w: 768, h: 1024 },
  { name: 'laptop', w: 1024, h: 720 },
  { name: 'desktop', w: 1440, h: 900 },
]

// Console noise we intentionally tolerate (known library deprecation, hot reload).
const IGNORED_CONSOLE = [/THREE\.Clock: This module has been deprecated/i, /HMR/i, /Fast Refresh/i, /\[Fast Refresh\]/i]

const shouldIgnore = (txt) => IGNORED_CONSOLE.some((re) => re.test(txt))

;(async () => {
  const browser = await chromium.launch({ headless: false })

  // ------------------------------------------------------------------
  // 1) Footer link routing check — HEAD every unique href on Home footer.
  // ------------------------------------------------------------------
  console.log('=== Footer link routing ===')
  const ctx0 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const p0 = await ctx0.newPage()
  await p0.goto(`${TARGET_URL}/`, { waitUntil: 'domcontentloaded' })
  await p0.waitForTimeout(500)

  const footerHrefs = await p0.evaluate(() => {
    const footer = document.querySelector('footer')
    if (!footer) return []
    return Array.from(footer.querySelectorAll('a[href]'))
      .map((a) => a.getAttribute('href'))
      .filter((h) => h && !h.startsWith('mailto:') && !h.startsWith('tel:'))
  })

  const uniqueHrefs = Array.from(new Set(footerHrefs))
  const linkResults = []
  for (const href of uniqueHrefs) {
    const url = href.startsWith('http') ? href : `${TARGET_URL}${href}`
    try {
      const resp = await p0.request.get(url, { maxRedirects: 3 })
      linkResults.push({ href, status: resp.status(), ok: resp.ok() })
    } catch (e) {
      linkResults.push({ href, status: 'ERR', ok: false, error: e.message })
    }
  }
  console.log('Footer unique hrefs:', uniqueHrefs.length)
  linkResults.forEach((r) => console.log(`  ${r.ok ? '[OK]' : '[FAIL]'} ${r.status}  ${r.href}`))
  await p0.close()
  await ctx0.close()

  // ------------------------------------------------------------------
  // 2) Responsive sweep: for every route × viewport
  //    - horizontal overflow?
  //    - hero (first section) visible height sensible?
  //    - navbar visible and inside viewport?
  //    - footer bottom padding ok?
  //    - console errors of concern?
  // ------------------------------------------------------------------
  console.log('\n=== Responsive sweep ===')
  const rows = []
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 })
    for (const route of ROUTES) {
      const page = await ctx.newPage()
      const consoleErrs = []
      page.on('console', (msg) => {
        if (msg.type() !== 'error' && msg.type() !== 'warning') return
        const t = msg.text()
        if (!shouldIgnore(t)) consoleErrs.push(`${msg.type()}: ${t.slice(0, 200)}`)
      })
      page.on('pageerror', (err) => consoleErrs.push(`pageerror: ${err.message}`))

      const row = { vp: vp.name, w: vp.w, route, verdict: 'PENDING' }
      try {
        await page.goto(`${TARGET_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
        await page.waitForSelector('section', { timeout: 15000 })
        await page.waitForTimeout(900)

        const stats = await page.evaluate(() => {
          const doc = document.documentElement
          const body = document.body
          const section = document.querySelector('main > section')
          const secRect = section ? section.getBoundingClientRect() : null
          const nav = document.querySelector('nav[aria-label="Primary"]')
          // navbar wrapper (fixed div containing nav) — find element with class containing "fixed" and "top-10"
          const fixedNav = document.querySelector('div.fixed.inset-x-0.top-10')
          const brandBar = document.querySelector('div.fixed.inset-x-0.top-0')
          const footer = document.querySelector('footer')
          const footerRect = footer ? footer.getBoundingClientRect() : null

          const h1 = section ? section.querySelector('h1') : null
          const h1Rect = h1 ? h1.getBoundingClientRect() : null
          const h1Style = h1 ? getComputedStyle(h1) : null

          // Horizontal overflow — any element wider than viewport is a smell.
          const viewportW = window.innerWidth
          const scrollW = Math.max(doc.scrollWidth, body.scrollWidth)
          const horizOverflow = scrollW > viewportW + 1

          // Find widest offending elements to help debug overflow
          const wideElements = []
          if (horizOverflow) {
            const all = document.querySelectorAll('body *')
            for (const el of all) {
              const r = el.getBoundingClientRect()
              if (r.right > viewportW + 2 && r.width > viewportW * 0.5) {
                wideElements.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 80), right: Math.round(r.right), width: Math.round(r.width) })
                if (wideElements.length > 5) break
              }
            }
          }

          // Hero centering — compare h1 midpoint to visible viewport midpoint (after chrome)
          const chromeH = (brandBar ? brandBar.getBoundingClientRect().height : 0) + (fixedNav ? fixedNav.getBoundingClientRect().height : 0)
          const visibleCenter = chromeH + (window.innerHeight - chromeH) / 2
          const h1Center = h1Rect ? h1Rect.top + h1Rect.height / 2 : null

          return {
            viewportW,
            scrollW,
            horizOverflow,
            wideElements,
            sec: secRect ? { top: Math.round(secRect.top), h: Math.round(secRect.height), w: Math.round(secRect.width) } : null,
            navVisible: !!fixedNav && fixedNav.getBoundingClientRect().bottom > 0,
            brandBarVisible: !!brandBar,
            footerBottom: footerRect ? Math.round(footerRect.bottom) : null,
            h1Center: h1Center !== null ? Math.round(h1Center) : null,
            visibleCenter: Math.round(visibleCenter),
            heroSlackTop: h1Rect && secRect ? Math.round(h1Rect.top - secRect.top - chromeH) : null,
          }
        })

        row.stats = stats
        row.consoleErrs = consoleErrs

        const fails = []
        if (stats.horizOverflow) fails.push(`horizontal overflow: scrollW=${stats.scrollW} vs vw=${stats.viewportW} (offenders: ${stats.wideElements.map((w) => `${w.tag}.${w.cls}=${w.width}`).join(' | ')})`)
        if (!stats.navVisible) fails.push('navbar missing/hidden')
        if (!stats.brandBarVisible) fails.push('brand bar missing')
        if (route !== '/' && stats.sec && stats.h1Center !== null) {
          const deltaVsCenter = Math.abs(stats.h1Center - stats.visibleCenter)
          // heading may sit slightly above true center on tall content; allow generous tolerance
          if (deltaVsCenter > vp.h * 0.35) fails.push(`hero heading far from visible center (delta=${deltaVsCenter}, vh=${vp.h})`)
        }
        if (consoleErrs.length) fails.push(`console: ${consoleErrs.slice(0, 2).join(' | ')}`)
        row.verdict = fails.length ? `FAIL: ${fails.join(' ; ')}` : 'PASS'

        // Only snapshot desktop + mobile to save time
        if (vp.name === 'mobile-sm' || vp.name === 'desktop') {
          const shotName = `${route.replace(/\//g, '_') || '_home'}__${vp.name}.png`
          await page.screenshot({ path: path.join(OUT_DIR, shotName), fullPage: true })
        }
      } catch (err) {
        row.verdict = `ERROR: ${err.message}`
      } finally {
        await page.close()
      }

      rows.push(row)
      const tag = row.verdict.startsWith('PASS') ? '[PASS]' : '[FAIL]'
      console.log(`${tag} ${vp.name.padEnd(9)} ${route.padEnd(11)} -> ${row.verdict.slice(0, 200)}`)
    }
    await ctx.close()
  }

  // ------------------------------------------------------------------
  // 3) Hero height consistency across internal pages (desktop)
  // ------------------------------------------------------------------
  console.log('\n=== Hero height consistency @ desktop (1440x900) ===')
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const heroSizes = []
  for (const r of ROUTES) {
    const page = await ctx2.newPage()
    await page.goto(`${TARGET_URL}${r}`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('section', { timeout: 10000 })
    await page.waitForTimeout(400)
    const h = await page.evaluate(() => {
      const s = document.querySelector('main > section')
      return s ? Math.round(s.getBoundingClientRect().height) : null
    })
    heroSizes.push({ route: r, h })
    console.log(`  ${r.padEnd(11)} hero height = ${h}px`)
    await page.close()
  }
  await ctx2.close()

  await browser.close()

  // ------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------
  console.log('\n=== SUMMARY ===')
  console.log(`Total combinations: ${rows.length}`)
  const failed = rows.filter((r) => !r.verdict.startsWith('PASS'))
  console.log(`Failed: ${failed.length}`)
  if (failed.length) {
    console.log('\nFAILURES:')
    for (const f of failed) console.log(`  [${f.vp}] ${f.route}: ${f.verdict}`)
  }
  console.log(`\nScreenshots: ${OUT_DIR}`)
  console.log(`Footer link failures: ${linkResults.filter((r) => !r.ok).length}`)

  // Consistency check
  const internalHeroes = heroSizes.filter((h) => h.route !== '/')
  const heights = internalHeroes.map((h) => h.h)
  const spread = Math.max(...heights) - Math.min(...heights)
  console.log(`Internal hero height spread: ${spread}px (${heights.join(', ')})`)

  process.exit(failed.length || linkResults.some((r) => !r.ok) ? 1 : 0)
})()
