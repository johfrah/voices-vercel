#!/usr/bin/env tsx
/**
 * Verify SlimmeKassa fix on live site
 * Tests the pricing interaction on an actor page
 */

import { chromium } from 'playwright';

async function verifyLive() {
  console.log('🚀 Starting live verification...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();
  
  const errors: string[] = [];
  
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  try {
    console.log('1️⃣ Navigating to https://www.voices.be/...');
    await page.goto('https://www.voices.be/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    console.log('✅ Homepage loaded\n');
    
    console.log('2️⃣ Navigating to Johfrah page...');
    await page.goto('https://www.voices.be/johfrah', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    console.log('✅ Johfrah page loaded\n');
    
    // Wait a bit for any dynamic content
    await page.waitForTimeout(3000);
    
    console.log('3️⃣ Checking for SlimmeKassa errors...');
    const slimmeKassaErrors = errors.filter(e => 
      e.includes('SlimmeKassa') || e.includes('ReferenceError')
    );
    
    if (slimmeKassaErrors.length > 0) {
      console.log('❌ SlimmeKassa errors found:');
      slimmeKassaErrors.forEach(err => console.log(`   - ${err}`));
    } else {
      console.log('✅ No SlimmeKassa errors detected\n');
    }
    
    console.log('4️⃣ Checking for pricing elements...');
    const hasPricingSection = await page.locator('[data-testid*="pricing"], [class*="pricing"], [class*="kassa"]').count() > 0;
    console.log(`   Pricing elements found: ${hasPricingSection ? 'Yes' : 'No'}\n`);
    
    console.log('5️⃣ Checking page version...');
    const versionElement = await page.locator('text=/v?2\\.\\d+\\.\\d+/').first().textContent().catch(() => null);
    console.log(`   Version detected: ${versionElement || 'Not found'}\n`);
    
    console.log('6️⃣ All console errors:');
    if (errors.length === 0) {
      console.log('   ✅ No console errors!\n');
    } else {
      console.log(`   Found ${errors.length} errors:`);
      errors.slice(0, 5).forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.substring(0, 150)}`);
      });
      if (errors.length > 5) {
        console.log(`   ... and ${errors.length - 5} more`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    if (slimmeKassaErrors.length === 0) {
      console.log('✅ VERIFICATION PASSED: No SlimmeKassa errors on live site!');
    } else {
      console.log('❌ VERIFICATION FAILED: SlimmeKassa errors still present');
    }
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await browser.close();
  }
}

verifyLive();
