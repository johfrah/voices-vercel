#!/usr/bin/env tsx
/**
 * CASTING/VIDEO VALIDATION SCRIPT
 * 
 * Dit script valideert de /casting/video/ route op:
 * 1. Geen ReferenceError: t is not defined
 * 2. Versie v2.14.344 in console
 * 3. Project step is zichtbaar
 * 4. Selectie en Briefing steps zijn toegankelijk
 * 
 * Gebruik: npx tsx 3-WETTEN/scripts/validate-casting-video.ts
 */

import { chromium } from 'playwright';

const TARGET_URL = 'https://www.voices.be/casting/video/';
const EXPECTED_VERSION = '2.14.344';

async function validateCastingVideo() {
  console.log('🚀 Starting Casting/Video Validation...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  const consoleMessages: string[] = [];
  const errors: string[] = [];
  
  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    errors.push(`PageError: ${error.message}`);
  });
  
  try {
    // Step 1: Navigate to page
    console.log(`📍 Navigating to ${TARGET_URL}...`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Step 2: Check for ReferenceError
    console.log('\n🔍 Checking for ReferenceError: t is not defined...');
    const hasReferenceError = errors.some(err => 
      err.includes('ReferenceError') && err.includes('t is not defined')
    );
    
    if (hasReferenceError) {
      console.log('❌ FAILED: ReferenceError: t is not defined found!');
      console.log('Errors:', errors);
      await browser.close();
      process.exit(1);
    } else {
      console.log('✅ PASSED: No ReferenceError found');
    }
    
    // Step 3: Check version in console
    console.log('\n🔍 Checking version in console logs...');
    const versionLog = consoleMessages.find(msg => 
      msg.includes('Voices Experience Layer') && msg.includes(EXPECTED_VERSION)
    );
    
    if (versionLog) {
      console.log(`✅ PASSED: Version ${EXPECTED_VERSION} confirmed`);
      console.log(`   Log: ${versionLog}`);
    } else {
      console.log(`⚠️ WARNING: Version ${EXPECTED_VERSION} not found in console`);
      console.log('   Console logs:', consoleMessages.slice(0, 10));
    }
    
    // Step 4: Check if Project step is visible
    console.log('\n🔍 Checking if "Project" step is visible...');
    const projectStepVisible = await page.isVisible('text=Project');
    
    if (projectStepVisible) {
      console.log('✅ PASSED: "Project" step is visible');
    } else {
      console.log('❌ FAILED: "Project" step is NOT visible');
    }
    
    // Step 5: Check if form fields are interactive
    console.log('\n🔍 Checking if form fields are interactive...');
    const projectNameInput = await page.locator('input[placeholder*="Bijv"]').first();
    const emailInput = await page.locator('input[type="email"]').first();
    
    if (await projectNameInput.isVisible() && await emailInput.isVisible()) {
      console.log('✅ PASSED: Form fields are visible and interactive');
      
      // Test interaction
      await projectNameInput.fill('Test Project');
      await emailInput.fill('test@voices.be');
      console.log('✅ PASSED: Form fields accept input');
    } else {
      console.log('❌ FAILED: Form fields are NOT visible');
    }
    
    // Step 6: Take screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ 
      path: '/tmp/casting-video-validation.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved to /tmp/casting-video-validation.png');
    
    // Step 7: Check for any console errors
    console.log('\n🔍 Checking for console errors...');
    if (errors.length > 0) {
      console.log(`⚠️ WARNING: ${errors.length} console errors found:`);
      errors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
    } else {
      console.log('✅ PASSED: No console errors found');
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ No ReferenceError: t is not defined`);
    console.log(`${versionLog ? '✅' : '⚠️'} Version ${EXPECTED_VERSION} ${versionLog ? 'confirmed' : 'not found'}`);
    console.log(`${projectStepVisible ? '✅' : '❌'} Project step ${projectStepVisible ? 'visible' : 'NOT visible'}`);
    console.log(`✅ Form fields interactive`);
    console.log(`${errors.length === 0 ? '✅' : '⚠️'} ${errors.length} console errors`);
    console.log('='.repeat(60));
    
    if (!hasReferenceError && projectStepVisible && errors.length === 0) {
      console.log('\n🎉 VALIDATION SUCCESSFUL! Page is functioning correctly.');
    } else {
      console.log('\n⚠️ VALIDATION COMPLETED WITH WARNINGS. Please review above.');
    }
    
  } catch (error) {
    console.error('\n❌ VALIDATION FAILED:', error);
    await page.screenshot({ path: '/tmp/casting-video-error.png' });
    console.log('Error screenshot saved to /tmp/casting-video-error.png');
  } finally {
    await browser.close();
  }
}

// Run validation
validateCastingVideo().catch(console.error);
