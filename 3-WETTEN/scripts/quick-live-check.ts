import { chromium } from 'playwright';

async function quickCheck() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔍 Navigating to https://www.voices.be...');
  
  // Navigate with more lenient wait
  await page.goto('https://www.voices.be', { waitUntil: 'domcontentloaded', timeout: 15000 });
  
  // Hard refresh
  console.log('🔄 Performing hard refresh...');
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
  
  // Capture console logs BEFORE navigation
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
  });

  // Wait a bit for any dynamic content
  await page.waitForTimeout(5000);

  // Check for version in console
  const versionLog = await page.evaluate(() => {
    const logs = (window as any).__consoleLogs || [];
    return logs.find((log: string) => log.includes('Version')) || 'No version log found';
  });

  // Check for TypeErrors in console
  const hasTypeError = consoleLogs.some(log => log.includes('TypeError') && log.includes('.length'));

  // Check for actor cards
  const actorCardsVisible = await page.evaluate(() => {
    const cards = document.querySelectorAll('[data-actor-card], .actor-card, [class*="ActorCard"]');
    const images = document.querySelectorAll('img[alt*="voice"], img[src*="actors"]');
    return cards.length > 0 || images.length > 3;
  });

  // Get console errors
  const errors = consoleLogs.filter(log => log.includes('[error]') || log.includes('TypeError'));

  // Take screenshot
  await page.screenshot({ path: '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/scripts/live-check-screenshot.png', fullPage: false });

  console.log('\n📊 QUICK CHECK RESULTS:');
  console.log('Version Log:', versionLog);
  console.log('TypeError present:', hasTypeError ? 'YES' : 'NO');
  console.log('Actor cards visible:', actorCardsVisible ? 'YES' : 'NO');
  console.log('Console Errors:', errors.length > 0 ? errors.join('\n') : 'None');
  console.log('\nStatus:', (hasTypeError || !actorCardsVisible) ? '❌ BROKEN' : '✅ FIXED');

  await browser.close();
}

quickCheck().catch(console.error);
