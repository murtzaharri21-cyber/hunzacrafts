import { chromium } from 'playwright';

(async () => {
  const base = 'https://hunzacrafts-12lzuw2od-harry-e06c.vercel.app';
  const browser = await chromium.launch({ headless: true });
  const result = {};
  try {
    // Test 1: direct /admin visit (no cookies)
    const ctx1 = await browser.newContext();
    const page1 = await ctx1.newPage();
    await page1.goto(base + '/admin', { waitUntil: 'networkidle' });
    await page1.waitForTimeout(1000);
    result.directAdminUrl = page1.url();

    // Test 2: visit storefront and click Footer Admin button
    const ctx2 = await browser.newContext();
    const page2 = await ctx2.newPage();
    await page2.goto(base, { waitUntil: 'networkidle' });
    // Try to click the footer Admin button
    try {
      // Prefer a button inside footer
      const footerButton = await page2.locator('footer').locator('button', { hasText: 'Admin' }).first();
      if (await footerButton.count()) {
        await footerButton.click();
      } else {
        // Fallback to any visible Admin text
        await page2.click('text=Admin');
      }
    } catch (e) {
      // fallback
      try { await page2.click('text=Admin'); } catch (err) {}
    }
    // wait for navigation if it happens
    try { await page2.waitForNavigation({ waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    await page2.waitForTimeout(500);
    result.afterClickUrl = page2.url();
    result.cookies = await ctx2.cookies();

    // Test 3: clear cookies (fresh context) and visit /admin again
    const ctx3 = await browser.newContext();
    const page3 = await ctx3.newPage();
    await page3.goto(base + '/admin', { waitUntil: 'networkidle' });
    await page3.waitForTimeout(1000);
    result.directAdminUrlAfter = page3.url();

  } catch (err) {
    result.error = String(err);
  } finally {
    await browser.close();
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }
})();
