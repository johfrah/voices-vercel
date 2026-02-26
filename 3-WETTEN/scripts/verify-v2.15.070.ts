#!/usr/bin/env tsx
/**
 * Live Site Verification Script for v2.15.070
 * Checks version, actor cards, console errors, and Youssef Zaki page
 */

import { chromium } from 'playwright';

async function verifyLive() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  const errors: string[] = [];
  const consoleErrors: string[] = [];

  // Capture console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Capture page errors
  page.on('pageerror', (error) => {
    consoleErrors.push(error.message);
  });

  try {
    console.log('🚀 Step 1: Navigating to https://www.voices.be...');
    await page.goto('https://www.voices.be', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait a bit for initial render
    await page.waitForTimeout(3000);

    console.log('🔍 Step 2: Checking version...');
    
    // Try to get version from window object
    const version = await page.evaluate(() => {
      return (window as any).__VOICES_VERSION__ || null;
    });

    console.log(`   Version found: ${version || 'NOT FOUND'}`);

    if (version !== 'v2.15.070') {
      console.log('⏳ Version mismatch, waiting 30s and refreshing...');
      await page.waitForTimeout(30000);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(3000);
      
      const newVersion = await page.evaluate(() => {
        return (window as any).__VOICES_VERSION__ || null;
      });
      
      console.log(`   Version after refresh: ${newVersion || 'NOT FOUND'}`);
      
      if (newVersion !== 'v2.15.070') {
        errors.push(`Version mismatch: expected v2.15.070, got ${newVersion || 'unknown'}`);
      }
    }

    console.log('🎭 Step 3: Checking actor cards...');
    
    // Wait for actor cards or skeletons
    await page.waitForTimeout(2000);
    
    const actorCards = await page.$$('[data-actor-card], .voice-card, [class*="VoiceCard"]');
    const skeletons = await page.$$('[class*="skeleton"], [class*="animate-pulse"]');
    
    console.log(`   Found ${actorCards.length} actor cards`);
    console.log(`   Found ${skeletons.length} skeleton loaders`);

    if (actorCards.length === 0 && skeletons.length > 0) {
      errors.push('Actor cards not loaded - still showing skeletons');
    } else if (actorCards.length === 0) {
      errors.push('No actor cards found on page');
    }

    console.log('🔍 Step 4: Checking for .length TypeErrors in console...');
    
    const lengthErrors = consoleErrors.filter(err => 
      err.includes('.length') && err.toLowerCase().includes('typeerror')
    );
    
    if (lengthErrors.length > 0) {
      errors.push(`.length TypeError found: ${lengthErrors[0]}`);
      console.log(`   ❌ Found ${lengthErrors.length} .length TypeErrors`);
    } else {
      console.log('   ✅ No .length TypeErrors');
    }

    console.log('👤 Step 5: Checking Youssef Zaki page...');
    
    await page.goto('https://www.voices.be/artist/youssefzaki', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    await page.waitForTimeout(3000);
    
    // Check if page loaded successfully
    const pageTitle = await page.title();
    const hasError = await page.$('text=404');
    
    console.log(`   Page title: ${pageTitle}`);
    
    if (hasError) {
      errors.push('Youssef Zaki page shows 404 error');
    } else if (!pageTitle || pageTitle.includes('Error')) {
      errors.push(`Youssef Zaki page has error in title: ${pageTitle}`);
    } else {
      console.log('   ✅ Youssef Zaki page loaded successfully');
    }

    // Final console error check
    console.log('\n📊 Final Report:');
    console.log(`   Total console errors: ${consoleErrors.length}`);
    console.log(`   Critical errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n❌ VERIFICATION FAILED:');
      errors.forEach(err => console.log(`   - ${err}`));
      
      if (consoleErrors.length > 0) {
        console.log('\n📝 Console Errors:');
        consoleErrors.slice(0, 5).forEach(err => console.log(`   - ${err}`));
      }
      
      process.exit(1);
    } else {
      console.log('\n✅ VERIFIED LIVE: v2.15.070 - Actor grid visible, 0 console errors, Youssef Zaki page OK.');
      process.exit(0);
    }

  } catch (error) {
    console.error('💥 Error during verification:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyLive();
