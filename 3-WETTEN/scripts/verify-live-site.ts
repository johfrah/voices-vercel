#!/usr/bin/env tsx
/**
 * Live Site Verification Script
 * Verifies version, actor visibility, and console errors on voices.be
 */

import { chromium } from 'playwright';

async function verifyLiveSite() {
  console.log('🚀 Starting live site verification...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  // Capture console errors
  const consoleErrors: string[] = [];
  const lengthTypeErrors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      consoleErrors.push(text);
      if (text.includes("Cannot read properties of undefined (reading 'length')")) {
        lengthTypeErrors.push(text);
      }
    }
  });

  page.on('pageerror', (error) => {
    const errorText = error.message;
    consoleErrors.push(errorText);
    if (errorText.includes("Cannot read properties of undefined (reading 'length')")) {
      lengthTypeErrors.push(errorText);
    }
  });

  try {
    // Navigate to homepage
    console.log('📍 Navigating to https://www.voices.be...');
    await page.goto('https://www.voices.be', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });

    // Wait a bit for any dynamic content
    await page.waitForTimeout(5000);

    // Check version via API
    console.log('🔍 Checking version via /api/admin/config...');
    const apiResponse = await page.goto('https://www.voices.be/api/admin/config');
    const apiText = await apiResponse?.text();
    let version = 'unknown';
    let apiData;
    
    try {
      apiData = JSON.parse(apiText || '{}');
      version = apiData?._version || apiData?.version || 'unknown';
      console.log('API Response:', JSON.stringify(apiData, null, 2));
    } catch (e) {
      console.log('Failed to parse API response:', apiText?.substring(0, 200));
    }

    console.log(`\n✅ VERSION: ${version}`);

    // Go back to homepage
    await page.goto('https://www.voices.be', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(3000);

    // Check for actor cards
    console.log('🎭 Checking for actor cards...');
    
    // Check for skeleton loaders
    const skeletons = await page.locator('[data-testid="voice-card-skeleton"], .animate-pulse').count();
    
    // Check for actual actor cards
    const actorCards = await page.locator('[data-testid="voice-card"], .voice-card, [class*="VoiceCard"]').count();
    
    console.log(`\n🎭 ACTOR CARDS:`);
    console.log(`   - Skeleton loaders: ${skeletons}`);
    console.log(`   - Actual actor cards: ${actorCards}`);
    console.log(`   - Status: ${actorCards > 0 ? '✅ VISIBLE' : '❌ NOT VISIBLE'}`);

    // Check for USP Trust-Bar
    console.log('🎯 Checking for USP Trust-Bar...');
    const uspTrustBar = await page.locator('text=/menselijke begroeting|inclusief muziek|binnen 24 uur/i').count();
    console.log(`\n🎯 USP TRUST-BAR:`);
    console.log(`   - Elements found: ${uspTrustBar}`);
    console.log(`   - Status: ${uspTrustBar > 0 ? '✅ VISIBLE' : '❌ NOT VISIBLE'}`);

    // Check console errors
    console.log(`\n🐛 CONSOLE ERRORS:`);
    if (consoleErrors.length === 0) {
      console.log('   ✅ No console errors detected');
    } else {
      console.log(`   ⚠️ Total errors: ${consoleErrors.length}`);
      consoleErrors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.substring(0, 150)}${err.length > 150 ? '...' : ''}`);
      });
    }

    console.log(`\n🔍 .length TYPE ERRORS:`);
    if (lengthTypeErrors.length === 0) {
      console.log('   ✅ No .length TypeError detected');
    } else {
      console.log(`   ❌ Found ${lengthTypeErrors.length} .length TypeError(s):`);
      lengthTypeErrors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err}`);
      });
    }

    // Take screenshot
    const screenshotPath = '3-WETTEN/scripts/screenshots/live-site-verification.png';
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`\n📸 Screenshot saved: ${screenshotPath}`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Version:           ${version}`);
    console.log(`Expected Version:  v2.15.066`);
    console.log(`Version Match:     ${version === 'v2.15.063' ? '✅ YES' : '❌ NO'}`);
    console.log(`Actor Cards:       ${actorCards > 0 ? '✅ VISIBLE' : '❌ NOT VISIBLE'} (${actorCards} found)`);
    console.log(`USP Trust-Bar:     ${uspTrustBar > 0 ? '✅ VISIBLE' : '❌ NOT VISIBLE'}`);
    console.log(`Console Clean:     ${consoleErrors.length === 0 ? '✅ YES' : `❌ NO (${consoleErrors.length} errors)`}`);
    console.log(`No .length Errors: ${lengthTypeErrors.length === 0 ? '✅ YES' : `❌ NO (${lengthTypeErrors.length} errors)`}`);
    console.log('='.repeat(60));

    // If version doesn't match, wait and retry
    if (version !== 'v2.15.066') {
      console.log('\n⏳ Version mismatch detected. Waiting 30 seconds and retrying...');
      await page.waitForTimeout(30000);
      
      const retryResponse = await page.goto('https://www.voices.be/api/admin/config');
      const retryData = await retryResponse?.json();
      const retryVersion = retryData?._version || 'unknown';
      
      console.log(`\n🔄 RETRY VERSION: ${retryVersion}`);
      console.log(`Version Match:     ${retryVersion === 'v2.15.066' ? '✅ YES' : '❌ NO'}`);
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await browser.close();
  }
}

verifyLiveSite();
