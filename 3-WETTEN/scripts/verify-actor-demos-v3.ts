/**
 * Verify Actor Demo Playback - Live Site Validation (V3 - Debug)
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function verifyActorDemos() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  
  const page = await context.newPage();
  
  console.log('📍 Navigating to https://www.voices.be...');
  await page.goto('https://www.voices.be', { waitUntil: 'domcontentloaded' });
  
  // Handle cookie consent
  try {
    const acceptButton = await page.waitForSelector('button:has-text("Accepteer")', { timeout: 3000 });
    if (acceptButton) {
      console.log('🍪 Accepting cookies...');
      await acceptButton.click();
      await page.waitForTimeout(1000);
    }
  } catch {}
  
  // Wait for content
  console.log('⏳ Waiting for content...');
  await page.waitForTimeout(5000);
  
  // Scroll down
  console.log('📜 Scrolling...');
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: '3-WETTEN/scripts/screenshots/actor-debug.png', fullPage: true });
  console.log('📸 Screenshot saved');
  
  // Dump HTML
  const html = await page.content();
  writeFileSync('3-WETTEN/scripts/screenshots/page-source.html', html);
  console.log('📄 HTML saved');
  
  // Find all buttons
  const buttons = await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    return allButtons.map(btn => ({
      text: btn.textContent?.trim().substring(0, 50),
      ariaLabel: btn.getAttribute('aria-label'),
      className: btn.className
    })).slice(0, 30); // First 30 buttons
  });
  
  console.log('\n📋 First 30 buttons found:');
  buttons.forEach((btn, i) => {
    console.log(`${i + 1}. Text: "${btn.text}" | Aria: "${btn.ariaLabel}" | Class: "${btn.className}"`);
  });
  
  await browser.close();
}

verifyActorDemos();
