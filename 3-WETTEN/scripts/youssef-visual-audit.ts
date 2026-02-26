/**
 * Youssef Zaki Visual & Functional Audit
 * Verifies the Artist world on https://www.youssefzaki.eu
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = join(process.cwd(), '3-WETTEN', 'scripts', 'screenshots', 'youssef');

async function auditYoussef() {
  console.log('🎭 Starting Youssef Zaki Visual & Functional Audit...\n');
  
  if (!existsSync(SCREENSHOTS_DIR)) {
    mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  const errors: string[] = [];
  const consoleErrors: string[] = [];
  
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(`Page Error: ${error.message}`);
  });

  try {
    // ========================================
    // TEST 1: Home Page (youssefzaki.eu)
    // ========================================
    console.log('📍 Test 1: Navigating to https://www.youssefzaki.eu...');
    await page.goto('https://www.youssefzaki.eu', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    await page.waitForTimeout(2000);
    
    // Check if page loaded
    const title = await page.title();
    console.log(`✅ Page title: ${title}`);
    
    // Check for theme-youssef (Black background)
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`✅ Background color: ${bgColor}`);
    
    // Check for Video Player
    const videoCount = await page.locator('video').count();
    if (videoCount > 0) {
      console.log(`✅ Found ${videoCount} video element(s)`);
    } else {
      errors.push('❌ No video elements found on home page');
    }
    
    // Check for Crowdfunding/Donation Section
    const donationCta = await page.locator('button:has-text("Donate"), button:has-text("Support")').count();
    if (donationCta > 0) {
      console.log('✅ Donation/Support CTA found');
    } else {
      errors.push('❌ No Donation/Support CTA found');
    }

    // Check for Raleway font
    const fontFamily = await page.evaluate(() => {
      const heading = document.querySelector('h1');
      return heading ? window.getComputedStyle(heading).fontFamily : '';
    });
    if (fontFamily.toLowerCase().includes('raleway')) {
      console.log('✅ Raleway font detected on headings');
    } else {
      console.log(`⚠️  Heading font family: ${fontFamily} (expected Raleway)`);
    }

    // Take screenshot
    await page.screenshot({ 
      path: join(SCREENSHOTS_DIR, 'home-page.png'),
      fullPage: true 
    });
    console.log('📸 Screenshot saved: home-page.png\n');

    // ========================================
    // TEST 2: Story Page
    // ========================================
    console.log('📍 Test 2: Navigating to /story...');
    await page.goto('https://www.youssefzaki.eu/story', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    const storyContent = await page.textContent('body');
    if (storyContent && storyContent.length > 500) {
      console.log('✅ Story page has content');
    } else {
      errors.push('❌ Story page appears empty or failed to load');
    }

    await page.screenshot({ 
      path: join(SCREENSHOTS_DIR, 'story-page.png'),
      fullPage: true 
    });
    console.log('📸 Screenshot saved: story-page.png\n');

    // ========================================
    // TEST 3: Music Page
    // ========================================
    console.log('📍 Test 3: Navigating to /music...');
    await page.goto('https://www.youssefzaki.eu/music', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    const musicTracks = await page.locator('[class*="track"], [class*="album"]').count();
    if (musicTracks > 0) {
      console.log(`✅ Found ${musicTracks} music/track elements`);
    } else {
      console.log('⚠️  No specific track elements found, checking for content...');
      const hasMusicContent = await page.evaluate(() => document.body.textContent?.includes('Music') || document.body.textContent?.includes('EP'));
      if (hasMusicContent) {
        console.log('✅ Music page has relevant text content');
      } else {
        errors.push('❌ Music page appears to lack content');
      }
    }

    await page.screenshot({ 
      path: join(SCREENSHOTS_DIR, 'music-page.png'),
      fullPage: true 
    });
    console.log('📸 Screenshot saved: music-page.png\n');

    // ========================================
    // FINAL REPORT
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 YOUSSEF ZAKI AUDIT SUMMARY');
    console.log('='.repeat(60));
    
    if (errors.length === 0) {
      console.log('✅ ALL TESTS PASSED - Youssef Zaki world is functioning correctly');
    } else {
      console.log('❌ ISSUES FOUND:');
      errors.forEach(error => console.log(`   ${error}`));
    }
    
    if (consoleErrors.length > 0) {
      console.log('\n⚠️  CONSOLE ERRORS DETECTED:');
      consoleErrors.forEach(error => console.log(`   ${error}`));
    } else {
      console.log('\n✅ No console errors detected');
    }
    
    console.log('='.repeat(60));
    
    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      url: 'https://www.youssefzaki.eu',
      errors,
      consoleErrors,
      status: errors.length === 0 ? 'PASS' : 'FAIL'
    };
    
    writeFileSync(
      join(SCREENSHOTS_DIR, 'audit-report.json'),
      JSON.stringify(report, null, 2)
    );
    
  } catch (error) {
    console.error('❌ Fatal error during audit:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run audit
auditYoussef().catch(console.error);
