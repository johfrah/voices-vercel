#!/usr/bin/env tsx
/**
 * Final Gate Guardian - Studio Page Live Validation
 * Verifies v2.16.075 deployment on https://www.voices.be/studio/
 */

import { chromium } from 'playwright';

async function validateStudioLive() {
  console.log('🚀 FINAL GATE GUARDIAN - Studio Live Validation\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();
  
  try {
    // Navigate to studio page
    console.log('📍 Navigating to https://www.voices.be/studio/...');
    await page.goto('https://www.voices.be/studio/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    
    // 1. VERSION CHECK
    console.log('\n1️⃣ VERSION CHECK');
    const version = await page.evaluate(() => {
      return (window as any).__VOICES_VERSION__;
    });
    console.log(`   window.__VOICES_VERSION__ = ${version}`);
    
    // Also check API endpoint
    const apiResponse = await page.goto('https://www.voices.be/api/admin/config');
    const apiData = await apiResponse?.json();
    console.log(`   /api/admin/config version = ${apiData?.version}`);
    
    const versionMatch = version === '2.16.075' || apiData?.version === '2.16.075';
    console.log(`   ✅ Version Match: ${versionMatch ? 'YES' : 'NO'}`);
    
    // Navigate back to studio
    await page.goto('https://www.voices.be/studio/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    
    // 2. CONSOLE AUDIT
    console.log('\n2️⃣ CONSOLE AUDIT');
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        consoleErrors.push(text);
      } else if (type === 'warning') {
        consoleWarnings.push(text);
      }
    });
    
    page.on('pageerror', error => {
      consoleErrors.push(`PageError: ${error.message}`);
    });
    
    // Wait for any console messages to appear
    await page.waitForTimeout(3000);
    
    const typeErrors = consoleErrors.filter(e => 
      e.includes('TypeError') || e.includes('ReferenceError') || e.toLowerCase().includes("'tl'")
    );
    
    console.log(`   Total Console Errors: ${consoleErrors.length}`);
    console.log(`   TypeErrors/ReferenceErrors: ${typeErrors.length}`);
    if (typeErrors.length > 0) {
      console.log('   ❌ Critical Errors Found:');
      typeErrors.forEach(e => console.log(`      - ${e}`));
    } else {
      console.log('   ✅ No TypeErrors or ReferenceErrors');
    }
    
    // Check specifically for 'tl' reference error
    const tlError = consoleErrors.find(e => e.includes("'tl'") || e.includes('"tl"'));
    if (tlError) {
      console.log(`   ❌ 'tl' Reference Error Found: ${tlError}`);
    } else {
      console.log(`   ✅ No 'tl' reference errors`);
    }
    
    // 3. UI VERIFICATION
    console.log('\n3️⃣ UI VERIFICATION');
    
    // Check for Workshop Carousel
    const carouselExists = await page.locator('[data-testid="workshop-carousel"], .workshop-carousel, [class*="carousel"]').count() > 0;
    console.log(`   Workshop Carousel Present: ${carouselExists ? '✅ YES' : '❌ NO'}`);
    
    // Check for "Bekijk workshop" buttons
    const workshopButtons = await page.locator('a:has-text("Bekijk workshop"), button:has-text("Bekijk workshop")').count();
    console.log(`   "Bekijk workshop" Buttons: ${workshopButtons > 0 ? `✅ ${workshopButtons} found` : '❌ NONE'}`);
    
    // Check for any workshop-related content
    const workshopContent = await page.locator('[class*="workshop"], [data-workshop]').count();
    console.log(`   Workshop-related Elements: ${workshopContent}`);
    
    // Take screenshot for visual proof
    const screenshotPath = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/reports/studio-live-validation.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`   📸 Screenshot saved: ${screenshotPath}`);
    
    // 4. PERFORMANCE CHECK
    console.log('\n4️⃣ PERFORMANCE CHECK');
    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: Math.round(perf.domContentLoadedEventEnd - perf.fetchStart),
        loadComplete: Math.round(perf.loadEventEnd - perf.fetchStart),
      };
    });
    console.log(`   DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`   Load Complete: ${metrics.loadComplete}ms`);
    
    // FINAL VERDICT
    console.log('\n🏁 FINAL VERDICT');
    const allGreen = versionMatch && typeErrors.length === 0 && !tlError && workshopButtons > 0;
    
    if (allGreen) {
      console.log('✅ VERIFIED LIVE: v2.16.075 - Console Clean - UI Functional');
    } else {
      console.log('❌ VALIDATION FAILED - Issues detected above');
    }
    
  } catch (error) {
    console.error('❌ VALIDATION ERROR:', error);
  } finally {
    await browser.close();
  }
}

validateStudioLive().catch(console.error);
