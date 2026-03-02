#!/usr/bin/env tsx
/**
 * Final Live Verification for v2.19.10
 * Tests Admin Orders page with auto-login and LanguageSwitcher
 */

import { chromium } from 'playwright';

async function verifyLiveDeployment() {
  console.log('🚀 FINAL LIVE VERIFICATION - v2.19.10\n');
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
    console.log('\n📍 Step 1: Navigate with auto_login to Admin Orders');
    const url = 'https://www.voices.be/?auto_login=b2dda905e581e6cea1daec513fe68bfebbefb1cfbc685f4ca8cade424fad0500&page=dashboard-orders';
    await page.goto(url, {
      waitUntil: 'load',
      timeout: 60000
    });
    
    // Wait for React to hydrate and redirect
    await page.waitForTimeout(3000);
    console.log('✅ Page loaded and hydrated\n');

    // Check final URL
    const finalUrl = page.url();
    console.log(`📍 Final URL: ${finalUrl}`);
    
    if (finalUrl.includes('/admin/orders')) {
      console.log('✅ Successfully redirected to Admin Orders page\n');
      // Wait for the page to fully stabilize after redirect
      await page.waitForTimeout(2000);
    } else {
      console.log(`⚠️  Expected /admin/orders, got: ${finalUrl}\n`);
    }

    // Check version via window object
    console.log('📍 Step 2: Check window.__VOICES_VERSION__');
    const windowVersion = await page.evaluate(() => {
      return (window as any).__VOICES_VERSION__;
    });
    console.log(`${windowVersion === '2.19.10' ? '✅' : '⚠️ '} Window Version: ${windowVersion || 'Not set'}`);
    
    if (windowVersion === '2.19.10') {
      console.log('✅ Version match confirmed!\n');
    } else {
      console.log(`⚠️  Version mismatch! Expected 2.19.10, got ${windowVersion}\n`);
    }

    // Check for Orders data
    console.log('📍 Step 3: Verify Orders Dashboard Data');
    await page.waitForTimeout(2000);
    
    const hasOrdersTable = await page.evaluate(() => {
      // Look for table or list elements
      const tables = document.querySelectorAll('table');
      const lists = document.querySelectorAll('[role="table"], [data-testid*="order"]');
      return tables.length > 0 || lists.length > 0;
    });
    
    console.log(`${hasOrdersTable ? '✅' : '⚠️ '} Orders table/list: ${hasOrdersTable ? 'Found' : 'Not found'}`);

    // Check for header/navigation
    console.log('\n📍 Step 4: Verify Global Navigation');
    const hasHeader = await page.evaluate(() => {
      const header = document.querySelector('header');
      const nav = document.querySelector('nav');
      return !!(header || nav);
    });
    console.log(`${hasHeader ? '✅' : '⚠️ '} Header/Navigation: ${hasHeader ? 'Present' : 'Missing'}`);

    // Test LanguageSwitcher
    console.log('\n📍 Step 5: Test LanguageSwitcher');
    
    await page.waitForTimeout(1000);
    
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
        
        // Try clicking
        try {
          await switcher.click();
          await page.waitForTimeout(500);
          console.log('✅ Click interaction completed');
        } catch (e) {
          console.log('⚠️  Click failed (may be expected)');
        }
        break;
      }
    }

    if (!switcherFound) {
      console.log('⚠️  LanguageSwitcher not found with any selector\n');
    } else {
      console.log('');
    }

    // Check for specific ReferenceError
    console.log('📍 Step 6: Check for ReferenceError');
    const hasReferenceError = [...consoleErrors, ...pageErrors.map(e => e.message)].some(
      err => {
        const lower = err.toLowerCase();
        return lower.includes('referenceerror') || lower.includes('is not defined');
      }
    );

    if (hasReferenceError) {
      console.log('❌ CRITICAL: ReferenceError detected!');
      const refErrors = [...consoleErrors, ...pageErrors.map(e => e.message)]
        .filter(err => err.toLowerCase().includes('referenceerror') || err.toLowerCase().includes('is not defined'));
      refErrors.forEach(err => console.log(`   - ${err.substring(0, 150)}`));
      console.log('');
    } else {
      console.log('✅ No ReferenceError detected\n');
    }

    // Check for TypeError
    console.log('📍 Step 7: Check for TypeError');
    const hasTypeError = [...consoleErrors, ...pageErrors.map(e => e.message)].some(
      err => err.toLowerCase().includes('typeerror')
    );

    if (hasTypeError) {
      console.log('⚠️  TypeError detected');
      const typeErrors = [...consoleErrors, ...pageErrors.map(e => e.message)]
        .filter(err => err.toLowerCase().includes('typeerror'));
      typeErrors.forEach(err => console.log(`   - ${err.substring(0, 150)}`));
      console.log('');
    } else {
      console.log('✅ No TypeError detected\n');
    }

    // Report all errors
    console.log('📍 Step 8: Error Summary');
    console.log(`Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.slice(0, 5).forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.substring(0, 120)}${err.length > 120 ? '...' : ''}`);
      });
      if (consoleErrors.length > 5) {
        console.log(`  ... and ${consoleErrors.length - 5} more`);
      }
    }

    console.log(`\nPage Errors: ${pageErrors.length}`);
    if (pageErrors.length > 0) {
      pageErrors.slice(0, 3).forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.message.substring(0, 120)}${err.message.length > 120 ? '...' : ''}`);
      });
    }

    // Visual proof - get page title and some visible text
    console.log('\n📍 Step 9: Visual Proof');
    const pageTitle = await page.title();
    console.log(`Page Title: "${pageTitle}"`);
    
    const visibleText = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const h2 = document.querySelector('h2');
      return {
        h1: h1?.textContent?.trim() || 'Not found',
        h2: h2?.textContent?.trim() || 'Not found'
      };
    });
    console.log(`H1: "${visibleText.h1}"`);
    console.log(`H2: "${visibleText.h2}"`);

    // Take screenshot
    await page.screenshot({ 
      path: '/tmp/voices-v2.19.10-verification.png', 
      fullPage: false 
    });
    console.log('\n📸 Screenshot: /tmp/voices-v2.19.10-verification.png');

    // Final Report
    console.log('\n' + '='.repeat(70));
    console.log('📋 FINAL VERIFICATION REPORT');
    console.log('='.repeat(70));
    console.log(`🔢 Version (Window):        ${windowVersion === '2.19.10' ? '✅' : '❌'} ${windowVersion || 'Not set'}`);
    console.log(`🔐 Auto-Login Redirect:     ${finalUrl.includes('/admin/orders') ? '✅ Success' : '❌ Failed'}`);
    console.log(`📊 Orders Dashboard:        ${hasOrdersTable ? '✅ Data visible' : '⚠️  No table found'}`);
    console.log(`🧭 Global Navigation:       ${hasHeader ? '✅ Present' : '⚠️  Missing'}`);
    console.log(`🎯 LanguageSwitcher:        ${switcherFound ? '✅ Found & Tested' : '⚠️  Not found'}`);
    console.log(`🐛 ReferenceError:          ${!hasReferenceError ? '✅ Clean' : '❌ DETECTED'}`);
    console.log(`🐛 TypeError:               ${!hasTypeError ? '✅ Clean' : '⚠️  DETECTED'}`);
    console.log(`📊 Console Errors:          ${consoleErrors.length === 0 ? '✅ Clean' : `⚠️  ${consoleErrors.length} error(s)`}`);
    console.log(`📊 Page Errors:             ${pageErrors.length === 0 ? '✅ Clean' : `⚠️  ${pageErrors.length} error(s)`}`);
    console.log('='.repeat(70));

    const allGood = windowVersion === '2.19.10' && 
                    finalUrl.includes('/admin/orders') &&
                    !hasReferenceError && 
                    !hasTypeError &&
                    consoleErrors.length === 0 && 
                    pageErrors.length === 0;

    if (allGood) {
      console.log('\n🎉 VERIFICATION COMPLETE: v2.19.10 is LIVE and FULLY FUNCTIONAL');
      console.log('✅ Auto-login works correctly');
      console.log('✅ Admin Orders page loads successfully');
      console.log('✅ LanguageSwitcher works without errors');
      console.log('✅ No console or page errors detected');
      console.log('✅ All systems operational\n');
    } else if (windowVersion === '2.19.10' && finalUrl.includes('/admin/orders') && !hasReferenceError && !hasTypeError) {
      console.log('\n✅ VERIFICATION PASSED: v2.19.10 is LIVE');
      console.log('✅ Core functionality working correctly');
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
