#!/usr/bin/env tsx
/**
 * 🧪 SIMPLE RATE LIMIT TEST
 * 
 * Simpler test that opens two browser tabs and submits from both
 */

import { chromium } from 'playwright';

async function testRateLimitSimple() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500  // Slow down for visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  console.log('🚀 Opening first tab...');
  const page1 = await context.newPage();
  
  // Capture console logs
  page1.on('console', msg => console.log(`[Tab1 Console] ${msg.text()}`));
  
  await page1.goto('https://www.voices.be/account/');
  await page1.waitForTimeout(3000);
  
  console.log('\n📧 Tab 1: Filling email...');
  await page1.locator('input[type="email"]').fill('test-audit@voices.be');
  
  console.log('👆 Tab 1: Clicking submit (first time)...');
  await page1.locator('button[type="submit"]').click();
  
  console.log('⏳ Waiting 4 seconds for response...');
  await page1.waitForTimeout(4000);
  
  // Check for success
  const success1 = await page1.locator('text=/Check je inbox/i').isVisible().catch(() => false);
  console.log(`Result: ${success1 ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (success1) {
    await page1.screenshot({ path: '/tmp/rate-limit-1-success.png' });
    console.log('📸 Screenshot: /tmp/rate-limit-1-success.png');
  }
  
  console.log('\n⏳ Waiting 2 seconds before second attempt...');
  await page1.waitForTimeout(2000);
  
  console.log('\n🚀 Opening second tab (to bypass React state)...');
  const page2 = await context.newPage();
  
  // Capture console logs
  page2.on('console', msg => {
    const text = msg.text();
    console.log(`[Tab2 Console] ${text}`);
    if (text.includes('429') || text.includes('API Error')) {
      console.log('🚨 RATE LIMIT ERROR DETECTED IN CONSOLE!');
    }
  });
  
  await page2.goto('https://www.voices.be/account/');
  await page2.waitForTimeout(3000);
  
  console.log('\n📧 Tab 2: Filling email...');
  await page2.locator('input[type="email"]').fill('test-audit@voices.be');
  
  console.log('👆 Tab 2: Clicking submit (SECOND TIME - should trigger rate limit)...');
  await page2.locator('button[type="submit"]').click();
  
  console.log('⏳ Waiting 8 seconds to check for error...');
  await page2.waitForTimeout(8000);
  
  // Check for error message
  const error2 = await page2.locator('.bg-red-50').isVisible().catch(() => false);
  const errorText = error2 ? await page2.locator('.bg-red-50').textContent() : 'NO ERROR MESSAGE';
  
  // Check for spinner
  const spinnerStuck = await page2.locator('svg.animate-spin').isVisible().catch(() => false);
  
  console.log(`\n📊 RESULTS:`);
  console.log(`Error Message Visible: ${error2 ? '✅ YES' : '❌ NO'}`);
  console.log(`Error Text: ${errorText}`);
  console.log(`Spinner Stuck: ${spinnerStuck ? '🚨 YES (BUG!)' : '✅ NO'}`);
  
  if (error2 || spinnerStuck) {
    await page2.screenshot({ path: '/tmp/rate-limit-2-error.png', fullPage: true });
    console.log('📸 Screenshot: /tmp/rate-limit-2-error.png');
  }
  
  console.log('\n✅ Test complete. Browser will stay open for 10 seconds for inspection...');
  await page2.waitForTimeout(10000);
  
  await browser.close();
}

testRateLimitSimple().catch(console.error);
