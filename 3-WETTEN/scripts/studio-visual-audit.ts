/**
 * Studio Visual & Functional Audit
 * Verifies the Studio world on https://www.voices.be
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = join(process.cwd(), '3-WETTEN', 'scripts', 'screenshots');

async function auditStudio() {
  console.log('🎭 Starting Studio Visual & Functional Audit...\n');
  
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
    // TEST 1: Quiz Page
    // ========================================
    console.log('📍 Test 1: Navigating to /studio/quiz...');
    await page.goto('https://www.voices.be/studio/quiz', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000); // Wait for video to potentially start
    
    // Check if page loaded (not white screen)
    const bodyContent = await page.textContent('body');
    if (!bodyContent || bodyContent.trim().length < 100) {
      errors.push('❌ Quiz page appears to be empty (white screen)');
    } else {
      console.log('✅ Quiz page loaded successfully');
    }
    
    // Check for video background
    const videoElement = await page.locator('video').count();
    if (videoElement > 0) {
      console.log('✅ Video background element found');
      
      // Check if video is playing
      const isPlaying = await page.evaluate(() => {
        const video = document.querySelector('video') as HTMLVideoElement;
        return video && !video.paused && !video.ended && video.readyState > 2;
      });
      
      if (isPlaying) {
        console.log('✅ Video is playing');
      } else {
        console.log('⚠️  Video element exists but may not be playing yet');
      }
    } else {
      errors.push('❌ No video background element found on quiz page');
    }
    
    // Check for quiz buttons
    const buttons = await page.locator('button').count();
    if (buttons > 0) {
      console.log(`✅ Found ${buttons} button(s) on quiz page`);
      
      // Check if buttons are interactive
      const firstButton = page.locator('button').first();
      const isVisible = await firstButton.isVisible();
      const isEnabled = await firstButton.isEnabled();
      
      if (isVisible && isEnabled) {
        console.log('✅ Quiz buttons are visible and enabled');
      } else {
        errors.push('❌ Quiz buttons are not interactive');
      }
    } else {
      errors.push('❌ No quiz buttons found');
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: join(SCREENSHOTS_DIR, 'quiz-page.png'),
      fullPage: true 
    });
    console.log('📸 Screenshot saved: quiz-page.png\n');
    
    // ========================================
    // TEST 2: Workshops Page
    // ========================================
    console.log('📍 Test 2: Navigating to /studio/doe-je-mee...');
    await page.goto('https://www.voices.be/studio/doe-je-mee', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // Check if workshops are loaded
    await page.waitForTimeout(1000);
    const workshopItems = await page.locator('[class*="grid"] > *').count();
    const allCards = await page.locator('[class*="card"], article, [role="article"]').count();
    
    if (workshopItems > 0) {
      console.log(`✅ Found ${workshopItems} workshop item(s) in grid`);
    } else if (allCards > 0) {
      console.log(`✅ Found ${allCards} card/article element(s)`);
    } else {
      console.log('⚠️  No workshop items detected - checking page content...');
      const hasContent = await page.evaluate(() => {
        return document.body.textContent && document.body.textContent.length > 500;
      });
      if (hasContent) {
        console.log('✅ Page has content loaded');
      } else {
        errors.push('❌ No workshop items found and page appears empty');
      }
    }
    
    // Check for Raleway font
    const fontFamily = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).fontFamily;
    });
    
    if (fontFamily.toLowerCase().includes('raleway')) {
      console.log('✅ Raleway font detected');
    } else {
      console.log(`⚠️  Font family: ${fontFamily} (expected Raleway)`);
    }
    
    // Check for Natural Capitalization (no ALL CAPS)
    const allCapsElements = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, button'));
      const allCaps = headings.filter(el => {
        const text = el.textContent || '';
        const style = window.getComputedStyle(el);
        return style.textTransform === 'uppercase' && text.length > 3;
      });
      return allCaps.length;
    });
    
    if (allCapsElements === 0) {
      console.log('✅ No ALL CAPS elements found (Natural Capitalization confirmed)');
    } else {
      console.log(`⚠️  Found ${allCapsElements} element(s) with text-transform: uppercase`);
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: join(SCREENSHOTS_DIR, 'workshops-page.png'),
      fullPage: true 
    });
    console.log('📸 Screenshot saved: workshops-page.png\n');
    
    // ========================================
    // TEST 3: Version Check
    // ========================================
    console.log('📍 Test 3: Checking version...');
    
    // Try API endpoint first
    try {
      const apiResponse = await page.goto('https://www.voices.be/api/admin/config', {
        timeout: 10000
      });
      const apiData = await apiResponse?.json();
      const apiVersion = apiData?._version;
      
      if (apiVersion) {
        console.log(`✅ Version from API: ${apiVersion}`);
        
        // Check if version is >= v2.14.770
        const [major, minor, patch] = apiVersion.replace('v', '').split('.').map(Number);
        if (major > 2 || (major === 2 && minor > 14) || (major === 2 && minor === 14 && patch >= 770)) {
          console.log('✅ Version is v2.14.770 or higher');
        } else {
          errors.push(`❌ Version ${apiVersion} is lower than v2.14.770`);
        }
      } else {
        errors.push('❌ Could not retrieve version from API');
      }
    } catch (versionError) {
      console.log('⚠️  Could not fetch version from API');
      errors.push('❌ Version check failed');
    }
    
    // ========================================
    // FINAL REPORT
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 AUDIT SUMMARY');
    console.log('='.repeat(60));
    
    if (errors.length === 0) {
      console.log('✅ ALL TESTS PASSED - Studio world is functioning correctly');
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
auditStudio().catch(console.error);
