const { chromium } = require('playwright')

const TARGET_URL = 'http://localhost:3000'

;(async () => {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()

  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(1500)

  // Discover the smoothed scroll height. ScrollSmoother inflates document
  // height so window.scrollTo drives the smoother.
  const totalHeight = await page.evaluate(() => document.body.scrollHeight)
  console.log('  Document height:', totalHeight)

  const steps = 12
  for (let i = 1; i <= steps; i++) {
    const y = Math.floor((totalHeight * i) / steps)
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'smooth' }), y)
    await page.waitForTimeout(1200)
  }

  // Ride back to top so we can re-shot the hero cleanly.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(1200)

  // Re-scroll section-by-section, this time from a position BEFORE each
  // section so ScrollTrigger detects the crossing.
  const sections = ['home', 'forward', 'reality', 'solutions', 'process', 'contact']
  for (const id of sections) {
    await page.evaluate((sel) => {
      const el = document.getElementById(sel)
      if (!el) return
      const rect = el.getBoundingClientRect()
      const top = window.scrollY + rect.top - window.innerHeight * 0.9
      window.scrollTo({ top: Math.max(0, top), behavior: 'instant' })
    }, id)
    await page.waitForTimeout(500)
    await page.evaluate((sel) => {
      const el = document.getElementById(sel)
      if (!el) return
      const rect = el.getBoundingClientRect()
      const top = window.scrollY + rect.top
      window.scrollTo({ top, behavior: 'smooth' })
    }, id)
    await page.waitForTimeout(6500)
    const shot = `C:/Users/General/AppData/Local/Temp/final-${id}.png`
    await page.screenshot({ path: shot, fullPage: false })
    console.log(`  ✓ ${id.padEnd(10)} → ${shot}`)
  }

  await browser.close()
})()
