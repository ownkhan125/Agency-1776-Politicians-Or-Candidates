const { chromium } = require('playwright');

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000';

const readTopBarStyles = async (page) => {
  return page.evaluate(() => {
    const bar = document.querySelector('[data-topbrandbar]');
    if (!bar) return { error: 'top bar not found' };

    const barStyles = getComputedStyle(bar);
    const activeTab = bar.querySelector('[data-topbar-tab="active"]');
    const inactiveTab = bar.querySelector('[data-topbar-tab="inactive"]');
    const metaWrap = bar.querySelector('.hidden.shrink-0');
    const metaChild = metaWrap ? metaWrap.querySelector('span') : null;
    const metaSlash = metaWrap ? metaWrap.querySelectorAll('span') : [];
    const metaSlashLast = metaSlash && metaSlash.length ? metaSlash[metaSlash.length - 2] : null; // "/" is second-to-last

    return {
      background:    barStyles.backgroundColor,
      borderBottom:  barStyles.borderBottomColor,
      borderWidth:   barStyles.borderBottomWidth,
      activeText:    activeTab   ? getComputedStyle(activeTab).color   : null,
      inactiveText:  inactiveTab ? getComputedStyle(inactiveTab).color : null,
      metaWrapText:  metaWrap    ? getComputedStyle(metaWrap).color    : null,
      metaSlashText: metaSlashLast ? getComputedStyle(metaSlashLast).color : null,
    };
  });
};

const eqOrDiff = (label, a, b) => {
  const same = a === b;
  console.log(`  ${same ? '✅' : '❌'} ${label}: ${a}  ${same ? '===' : '!=='}  ${b}`);
  return same;
};

(async () => {
  const consoleErrors = [];
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(`PAGEERROR: ${err.message}`);
  });

  console.log(`▶ Loading ${TARGET_URL}`);
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Force dark first
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: '/tmp/topbar-dark.png', fullPage: false, clip: { x: 0, y: 0, width: 1440, height: 80 } });
  const darkStyles = await readTopBarStyles(page);
  console.log('\n📗 DARK theme styles:');
  console.log(JSON.stringify(darkStyles, null, 2));

  // Switch to light
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: '/tmp/topbar-light.png', fullPage: false, clip: { x: 0, y: 0, width: 1440, height: 80 } });
  const lightStyles = await readTopBarStyles(page);
  console.log('\n📙 LIGHT theme styles:');
  console.log(JSON.stringify(lightStyles, null, 2));

  console.log('\n🔍 Comparison (dark vs light):');
  const checks = [
    eqOrDiff('background',    darkStyles.background,    lightStyles.background),
    eqOrDiff('borderBottom',  darkStyles.borderBottom,  lightStyles.borderBottom),
    eqOrDiff('activeText',    darkStyles.activeText,    lightStyles.activeText),
    eqOrDiff('inactiveText',  darkStyles.inactiveText,  lightStyles.inactiveText),
    eqOrDiff('metaWrapText',  darkStyles.metaWrapText,  lightStyles.metaWrapText),
    eqOrDiff('metaSlashText', darkStyles.metaSlashText, lightStyles.metaSlashText),
  ];

  // Flip back to dark to make sure it's idempotent
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForTimeout(400);
  const darkAgain = await readTopBarStyles(page);
  const roundTrip = darkAgain.background === darkStyles.background
    && darkAgain.borderBottom === darkStyles.borderBottom
    && darkAgain.activeText === darkStyles.activeText;
  console.log(`\n  ${roundTrip ? '✅' : '❌'} Round-trip dark→light→dark stable`);

  const allSame = checks.every(Boolean) && roundTrip;

  console.log(`\n🐛 Console errors captured: ${consoleErrors.length}`);
  consoleErrors.forEach((e, i) => console.log(`   [${i}] ${e}`));

  console.log(`\n${allSame && consoleErrors.length === 0 ? '✅ PASS' : '❌ FAIL'}`);
  console.log('📸 Screenshots: /tmp/topbar-dark.png, /tmp/topbar-light.png');

  await browser.close();
  process.exit(allSame && consoleErrors.length === 0 ? 0 : 1);
})().catch((err) => {
  console.error('FATAL:', err);
  process.exit(2);
});
