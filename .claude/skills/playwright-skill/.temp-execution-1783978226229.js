const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3000';
const OUT = 'C:/Users/General/AppData/Local/Temp/';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push('PageError: ' + e.message));

  const viewports = [
    { name: 'mobile', w: 375, h: 812, expectHamburger: true },
    { name: 'phone-lg', w: 480, h: 900, expectHamburger: true },
    { name: 'tablet', w: 768, h: 1024, expectHamburger: true },
    { name: 'tablet-lg', w: 900, h: 1024, expectHamburger: true },
    { name: 'small-laptop', w: 1024, h: 800, expectHamburger: false },
    { name: 'desktop', w: 1440, h: 900, expectHamburger: false },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Check hamburger visibility
    const hamburgerVisible = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-controls="primary-mobile-menu"]');
      if (!btn) return { present: false };
      const cs = getComputedStyle(btn);
      const rect = btn.getBoundingClientRect();
      return {
        present: true,
        display: cs.display,
        visible: rect.width > 0 && rect.height > 0,
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      };
    });
    console.log(`[${vp.name} ${vp.w}px] hamburger:`, JSON.stringify(hamburgerVisible), 'expect visible:', vp.expectHamburger);

    // Check desktop nav visibility
    const desktopNav = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="Primary"]');
      if (!nav) return { present: false };
      const cs = getComputedStyle(nav);
      return { present: true, display: cs.display };
    });
    console.log(`[${vp.name}] desktop-nav display:`, JSON.stringify(desktopNav));

    // Overflow
    const overflow = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    console.log(`[${vp.name}] overflow:`, JSON.stringify(overflow));

    if (vp.expectHamburger) {
      // Open the menu
      await page.locator('button[aria-controls="primary-mobile-menu"]').click();
      await page.waitForTimeout(500);
      const menu = await page.evaluate(() => {
        const dlg = document.querySelector('#primary-mobile-menu');
        if (!dlg) return { present: false };
        const cs = getComputedStyle(dlg);
        const rect = dlg.getBoundingClientRect();
        const links = dlg.querySelectorAll('a').length;
        const focused = document.activeElement && document.activeElement.tagName === 'A';
        const focusText = document.activeElement ? (document.activeElement.textContent || '').trim().slice(0, 20) : null;
        return {
          present: true,
          role: dlg.getAttribute('role'),
          ariaModal: dlg.getAttribute('aria-modal'),
          opacity: cs.opacity,
          fullscreen: rect.width === document.documentElement.clientWidth && rect.height === document.documentElement.clientHeight,
          links,
          focused,
          focusText,
        };
      });
      console.log(`[${vp.name}] menu OPEN:`, JSON.stringify(menu));

      // Body scroll should be locked
      const scrollLock = await page.evaluate(() => ({
        html: getComputedStyle(document.documentElement).overflow,
        body: getComputedStyle(document.body).overflow,
      }));
      console.log(`[${vp.name}] scroll lock:`, JSON.stringify(scrollLock));

      // Screenshot menu open
      await page.screenshot({ path: `${OUT}navbar-${vp.name}-open.png`, fullPage: false });

      // Close via ESC
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      const afterEsc = await page.evaluate(() => {
        const dlg = document.querySelector('#primary-mobile-menu');
        return { present: !!dlg };
      });
      console.log(`[${vp.name}] after ESC (menu should be gone):`, JSON.stringify(afterEsc));

      // Reopen, click a link — menu should auto-close
      await page.locator('button[aria-controls="primary-mobile-menu"]').click();
      await page.waitForTimeout(400);
      const forwardLink = page.locator('#primary-mobile-menu a', { hasText: 'Forward' }).first();
      await forwardLink.click({ noWaitAfter: true });
      await page.waitForTimeout(600);
      const afterLinkClick = await page.evaluate(() => {
        const dlg = document.querySelector('#primary-mobile-menu');
        return { present: !!dlg };
      });
      console.log(`[${vp.name}] after link click (menu should be gone):`, JSON.stringify(afterLinkClick));
    } else {
      // Desktop — screenshot navbar
      await page.screenshot({ path: `${OUT}navbar-${vp.name}.png`, fullPage: false });
    }
  }

  // Also verify About link works from mobile menu on /about
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(TARGET_URL + '/about', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const hasHamburgerOnAbout = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-controls="primary-mobile-menu"]');
    return !!btn && getComputedStyle(btn).display !== 'none';
  });
  console.log('\n/about mobile hamburger present:', hasHamburgerOnAbout);

  console.log('\nCONSOLE ERRORS:', errors.length);
  if (errors.length) console.log(JSON.stringify(errors, null, 2));

  await browser.close();
})();
