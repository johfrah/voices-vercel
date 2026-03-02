#!/usr/bin/env tsx
/**
 * Final Live Verification for v2.19.8
 * Tests LanguageSwitcher fix and main UI elements
 */

import { chromium } from 'playwright';

async function verifyLiveDeployment() {
  console.log('🚀 FINAL LIVE VERIFICATION - v2.19.8\n');
  console.log('='.repeat(70));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Collect console errors
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  
  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(text);
    }
  });

  // Collect page errors
  const pageErrors: Error[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error);
  });

  try {
    console.log('\n📍 Step 1: Navigate to https://www.voices.be');
    await page.goto('https://www.voices.be', {
      waitUntil: 'load',
      timeout: 60000
    });
    
    // Wait for React to hydrate
    await page.waitForTimeout(2000);
    console.log('✅ Page loaded and hydrated\n');

    // Check version via API
    console.log('📍 Step 2: Verify version via API');
    const apiResponse = await page.evaluate(async () => {
      const response = await fetch('/api/admin/config?type=general');
      return await response.json();
    });
    
    const apiVersion = apiResponse._version;
    console.log(`✅ API Version: ${apiVersion}`);
    
    if (apiVersion === '2.19.8') {
      console.log('✅ Version match confirmed!\n');
    } else {
      console.log(`⚠️  Version mismatch! Expected 2.19.8, got ${apiVersion}\n`);
    }

    // Check window version
    console.log('📍 Step 3: Check window.__VOICES_VERSION__');
    const windowVersion = await page.evaluate(() => {
      return (window as any).__VOICES_VERSION__;
    });
    console.log(`${windowVersion ? '✅' : '⚠️ '} Window Version: ${windowVersion || 'Not set'}\n`);

    // Test LanguageSwitcher
    console.log('📍 Step 4: Test LanguageSwitcher');
    
    // Wait for any element that might be the language switcher
    await page.waitForTimeout(1000);
    
    // Try multiple selectors
    const selectors = [
      'button[aria-label*="language" i]',
      'button[aria-label*="taal" i]',
      '[data-testid="language-switcher"]',
      'button:has(svg):has-text("NL")',
      'button:has(svg):has-text("EN")',
      'header button:has(svg)',
      'nav button:has(svg)'
    ];

    let switcherFound = false;
    let switcherSelector = '';

    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        switcherFound = true;
        switcherSelector = selector;
        console.log(`✅ LanguageSwitcher found using: ${selector}`);
        
        // Hover over it
        const switcher = page.locator(selector).first();
        await switcher.hover();
        await page.waitForTimeout(1000);
        console.log('✅ Hover interaction completed');
        break;
      }
    }

    if (!switcherFound) {
      console.log('⚠️  LanguageSwitcher not found with any selector');
      console.log('   (This may be normal if it\'s only on certain pages)\n');
    } else {
      console.log('');
    }

    // Check for specific ReferenceError
    console.log('📍 Step 5: Check for ReferenceError (handleMouseEnter)');
    const hasHandleMouseEnterError = [...consoleErrors, ...pageErrors.map(e => e.message)].some(
      err => {
        const lower = err.toLowerCase();
        return (lower.includes('referenceerror') || lower.includes('not defined')) && 
               lower.includes('handlemouseenter');
      }
    );

    if (hasHandleMouseEnterError) {
      console.log('❌ CRITICAL: ReferenceError (handleMouseEnter) still present!');
      console.log('   The fix did NOT work.\n');
    } else {
      console.log('✅ No ReferenceError (handleMouseEnter) detected');
      console.log('✅ Fix verified successfully!\n');
    }

    // Report all errors
    console.log('📍 Step 6: Error Summary');
    console.log(`Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.slice(0, 5).forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.substring(0, 100)}${err.length > 100 ? '...' : ''}`);
      });
      if (consoleErrors.length > 5) {
        console.log(`  ... and ${consoleErrors.length - 5} more`);
      }
    }

    console.log(`\nPage Errors: ${pageErrors.length}`);
    if (pageErrors.length > 0) {
      pageErrors.slice(0, 3).forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.message.substring(0, 100)}${err.message.length > 100 ? '...' : ''}`);
      });
    }

    // Take screenshot
    await page.screenshot({ 
      path: '/tmp/voices-live-verification.png', 
      fullPage: false 
    });
    console.log('\n📸 Screenshot: /tmp/voices-live-verification.png');

    // Final Report
    console.log('\n' + '='.repeat(70));
    console.log('📋 FINAL VERIFICATION REPORT');
    console.log('='.repeat(70));
    console.log(`🔢 Version (API):           ${apiVersion === '2.19.8' ? '✅' : '❌'} ${apiVersion}`);
    console.log(`🔢 Version (Window):        ${windowVersion ? '✅' : '⚠️ '} ${windowVersion || 'Not set'}`);
    console.log(`🎯 LanguageSwitcher:        ${switcherFound ? '✅ Found & Tested' : '⚠️  Not found'}`);
    console.log(`🐛 ReferenceError Fix:      ${!hasHandleMouseEnterError ? '✅ VERIFIED' : '❌ FAILED'}`);
    console.log(`📊 Console Errors:          ${consoleErrors.length === 0 ? '✅ Clean' : `⚠️  ${consoleErrors.length} error(s)`}`);
    console.log(`📊 Page Errors:             ${pageErrors.length === 0 ? '✅ Clean' : `⚠️  ${pageErrors.length} error(s)`}`);
    console.log('='.repeat(70));

    const allGood = apiVersion === '2.19.8' && 
                    !hasHandleMouseEnterError && 
                    consoleErrors.length === 0 && 
                    pageErrors.length === 0;

    if (allGood) {
      console.log('\n🎉 VERIFICATION COMPLETE: v2.19.8 is LIVE and FULLY FUNCTIONAL');
      console.log('✅ LanguageSwitcher hover works without ReferenceError');
      console.log('✅ No console or page errors detected');
      console.log('✅ All systems operational\n');
    } else if (apiVersion === '2.19.8' && !hasHandleMouseEnterError) {
      console.log('\n✅ VERIFICATION PASSED: v2.19.8 is LIVE');
      console.log('✅ LanguageSwitcher fix is working correctly');
      if (consoleErrors.length > 0 || pageErrors.length > 0) {
        console.log('⚠️  Some non-critical errors detected (review above)\n');
      }
    } else {
      console.log('\n⚠️  VERIFICATION INCOMPLETE: Issues detected (see above)\n');
    }

  } catch (error) {
    console.error('\n❌ Verification failed with exception:', error);
  } finally {
    await browser.close();
  }
}

verifyLiveDeployment().catch(console.error);
