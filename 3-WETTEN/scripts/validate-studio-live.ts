#!/usr/bin/env tsx
/**
 * Studio Page Live Validation Script
 * Validates the live status of https://www.voices.be/studio/
 */

import { chromium } from 'playwright';

async function validateStudioPage() {
  console.log('🚀 Starting Studio Page Validation...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  // Collect console messages and errors
  const consoleMessages: string[] = [];
  const consoleErrors: string[] = [];
  
  page.on('console', (msg) => {
    const text = msg.text();
    consoleMessages.push(text);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });
  
  page.on('pageerror', (error) => {
    consoleErrors.push(`PAGE ERROR: ${error.message}`);
  });
  
  try {
    console.log('📍 Navigating to https://www.voices.be/studio/');
    await page.goto('https://www.voices.be/studio/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('🔄 Performing hard refresh...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // Wait a bit for all scripts to load
    await page.waitForTimeout(3000);
    
    console.log('\n📊 VALIDATION RESULTS:\n');
    
    // 1. Check version
    console.log('1️⃣ Checking version...');
    const versionCheck = await page.evaluate(() => {
      const versionEl = document.querySelector('[data-version]');
      return versionEl?.getAttribute('data-version') || 'NOT FOUND';
    });
    console.log(`   Version: ${versionCheck}`);
    
    // Also check via API
    const apiResponse = await page.goto('https://www.voices.be/api/admin/config');
    const configData = await apiResponse?.json();
    console.log(`   API Version: ${configData?._version || 'NOT FOUND'}`);
    
    // Go back to studio page
    await page.goto('https://www.voices.be/studio/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // 2. Check for 'tl' ReferenceError
    console.log('\n2️⃣ Checking for "tl" ReferenceError...');
    const hasTlError = consoleErrors.some(err => err.includes('tl is not defined'));
    if (hasTlError) {
      console.log('   ❌ FOUND: "tl is not defined" error');
    } else {
      console.log('   ✅ NO "tl" ReferenceError detected');
    }
    
    // 3. Check Workshop Carousel
    console.log('\n3️⃣ Checking Workshop Carousel...');
    const carouselVisible = await page.isVisible('[data-testid="workshop-carousel"], .workshop-carousel, [class*="carousel"]', { timeout: 5000 }).catch(() => false);
    console.log(`   Carousel visible: ${carouselVisible ? '✅ YES' : '❌ NO'}`);
    
    // 4. Check RESERVEER PLEK CTA
    console.log('\n4️⃣ Checking "RESERVEER PLEK" CTA...');
    const ctaVisible = await page.locator('text=/RESERVEER.*PLEK/i').first().isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`   CTA visible: ${ctaVisible ? '✅ YES' : '❌ NO'}`);
    
    // 5. Console Errors Summary
    console.log('\n5️⃣ Console Errors Summary:');
    if (consoleErrors.length === 0) {
      console.log('   ✅ NO console errors detected');
    } else {
      console.log(`   ❌ Found ${consoleErrors.length} error(s):`);
      consoleErrors.forEach((err, i) => {
        console.log(`      ${i + 1}. ${err}`);
      });
    }
    
    // 6. Page Screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ 
      path: '3-WETTEN/docs/studio-validation-screenshot.png',
      fullPage: true 
    });
    console.log('   Screenshot saved to: 3-WETTEN/docs/studio-validation-screenshot.png');
    
    console.log('\n✅ Validation complete!');
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
  } finally {
    await browser.close();
  }
}

validateStudioPage().catch(console.error);
