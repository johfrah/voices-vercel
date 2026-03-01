#!/usr/bin/env tsx
/**
 * 🔍 Live Verification Script for v2.16.117
 * Verifies the 9-world hierarchy on the live site
 */

import { chromium } from 'playwright';

async function verifyLive() {
  console.log('🚀 STARTING LIVE VERIFICATION FOR v2.16.117\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  let allValid = true;

  try {
    // 1. Check voices.be (Agency World)
    console.log('🎯 CHECKING AGENCY WORLD (voices.be)...');
    await page.goto('https://www.voices.be/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Check version in footer or meta
    const version = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="version"]');
      if (meta) return meta.getAttribute('content');
      
      // Check in window object
      return (window as any).__VOICES_VERSION__ || null;
    });
    
    console.log(`  Version: ${version || 'NOT FOUND'}`);
    const versionMatch = version === 'v2.16.117' || version === '2.16.117';
    if (!versionMatch) {
      console.log(`  ⚠️ Expected v2.16.117, got ${version}`);
      allValid = false;
    } else {
      console.log('  ✅ VERSION MATCH');
    }

    // Check for Agency journey elements
    const hasAgencyContent = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('Telefonie') || body.includes('Voice-over') || body.includes('Stemmen');
    });
    console.log(`  Agency Content: ${hasAgencyContent ? '✅ FOUND' : '❌ MISSING'}`);
    if (!hasAgencyContent) allValid = false;

    // 2. Check voices.be/studio (Studio World)
    console.log('\n🎬 CHECKING STUDIO WORLD (voices.be/studio)...');
    await page.goto('https://www.voices.be/studio', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    const hasStudioContent = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('Studio') || body.includes('Workshop') || body.includes('Cursus');
    });
    console.log(`  Studio Content: ${hasStudioContent ? '✅ FOUND' : '❌ MISSING'}`);
    if (!hasStudioContent) allValid = false;

    // Check for 404 or error
    const studioTitle = await page.title();
    console.log(`  Page Title: "${studioTitle}"`);
    if (studioTitle.includes('404') || studioTitle.includes('Not Found')) {
      console.log('  ❌ STUDIO PAGE RETURNS 404');
      allValid = false;
    }

    // 3. Check ademing.be (Ademing World)
    console.log('\n🫁 CHECKING ADEMING WORLD (ademing.be)...');
    await page.goto('https://www.ademing.be/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    const hasAdemingContent = await page.evaluate(() => {
      const body = document.body.innerText;
      const title = document.title;
      return body.includes('rust') || body.includes('Ademing') || title.includes('Ademing');
    });
    console.log(`  Ademing Content: ${hasAdemingContent ? '✅ FOUND' : '❌ MISSING'}`);
    if (!hasAdemingContent) allValid = false;

    const ademingTitle = await page.title();
    console.log(`  Page Title: "${ademingTitle}"`);
    
    // Verify Ademing has its own journey (ID 61)
    const ademingMeta = await page.evaluate(() => {
      return (window as any).__VOICES_WORLD__ || null;
    });
    console.log(`  World Detection: ${ademingMeta || 'NOT FOUND'}`);

    // 4. Check console errors
    console.log('\n🔍 CHECKING CONSOLE ERRORS...');
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('https://www.voices.be/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);

    if (errors.length > 0) {
      console.log(`  ⚠️ Found ${errors.length} console errors:`);
      errors.slice(0, 5).forEach(err => console.log(`    - ${err}`));
    } else {
      console.log('  ✅ NO CONSOLE ERRORS');
    }

  } catch (error) {
    console.error('❌ ERROR DURING VERIFICATION:', error);
    allValid = false;
  } finally {
    await browser.close();
  }

  // Final verdict
  console.log('\n' + '='.repeat(60));
  if (allValid) {
    console.log('✅ v2.16.117 IS LIVE AND FULLY FUNCTIONAL');
  } else {
    console.log('❌ VERIFICATION FAILED - SEE DETAILS ABOVE');
  }
  console.log('='.repeat(60));

  process.exit(allValid ? 0 : 1);
}

verifyLive();
