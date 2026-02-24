#!/usr/bin/env tsx
/**
 * 🧪 SIMPLE MAGIC LINK TEST
 * 
 * Tests the basic magic link flow and reports the success message color
 */

import { chromium } from 'playwright';

async function testMagicLink() {
  console.log('🚀 Starting browser...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Capture console for version and errors
  let version = '';
  const consoleLogs: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    
    if (text.includes('Nuclear Version:')) {
      const match = text.match(/v([\d.]+)/);
      if (match) {
        version = match[1];
      }
    }
    
    // Log important messages
    if (text.includes('API Error') || text.includes('LoginPage') || text.includes('auth')) {
      console.log(`   [Console] ${text}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log(`   [Error] ${error.message}`);
  });
  
  console.log('📍 STEP 1: Navigating to https://www.voices.be/account/...');
  await page.goto('https://www.voices.be/account/', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  await page.waitForTimeout(3000);
  console.log(`✅ Page loaded (Version: ${version || 'detecting...'})\n`);
  
  console.log('📍 STEP 2: Filling email field with "test-audit@voices.be"...');
  const emailInput = await page.locator('input[type="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 5000 });
  await emailInput.fill('test-audit@voices.be');
  console.log('✅ Email filled\n');
  
  console.log('📍 STEP 3: Clicking "Stuur Magische Link" button...');
  const submitButton = await page.locator('button[type="submit"]').first();
  await submitButton.click();
  console.log('✅ Button clicked\n');
  
  console.log('📍 STEP 4: Waiting for response (8 seconds)...');
  await page.waitForTimeout(8000);
  
  // Check if button is still loading
  const spinner = await page.locator('svg.animate-spin').first();
  const isSpinning = await spinner.isVisible().catch(() => false);
  if (isSpinning) {
    console.log('   ⚠️  Spinner still visible - waiting longer...');
    await page.waitForTimeout(5000);
  }
  
  // Check for success message
  const successMessageLocator = page.locator('text=/Check je inbox/i').first();
  const isSuccessVisible = await successMessageLocator.isVisible().catch(() => false);
  
  if (isSuccessVisible) {
    // Get the parent container to check its styling
    const parentContainer = successMessageLocator.locator('xpath=ancestor::div[contains(@class, "bg-")]').first();
    const parentClasses = await parentContainer.getAttribute('class').catch(() => '');
    
    console.log('✅ SUCCESS MESSAGE FOUND!\n');
    console.log('📊 ANALYSIS:');
    console.log(`   Message: "Check je inbox!"`);
    console.log(`   Container classes: ${parentClasses}`);
    
    // Check if it's green
    const isGreen = parentClasses.includes('bg-green') || parentClasses.includes('text-green');
    console.log(`   Color: ${isGreen ? '🟢 GREEN (Success)' : '⚠️  NOT GREEN'}`);
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/magic-link-success.png', fullPage: true });
    console.log(`\n📸 Screenshot saved: /tmp/magic-link-success.png`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST PASSED: Success message is displayed');
    console.log(`   Version: v${version}`);
    console.log(`   Message Color: ${isGreen ? 'GREEN ✅' : 'NOT GREEN ⚠️'}`);
    console.log('='.repeat(60));
    
  } else {
    // Check for error message
    const errorMessage = await page.locator('.bg-red-50').first();
    const isErrorVisible = await errorMessage.isVisible().catch(() => false);
    
    if (isErrorVisible) {
      const errorText = await errorMessage.textContent();
      console.log('❌ ERROR MESSAGE DISPLAYED:');
      console.log(`   ${errorText}`);
    } else {
      console.log('⚠️  NO SUCCESS OR ERROR MESSAGE FOUND');
    }
    
    await page.screenshot({ path: '/tmp/magic-link-failed.png', fullPage: true });
    console.log(`\n📸 Screenshot saved: /tmp/magic-link-failed.png`);
  }
  
  console.log('\n🔍 Keeping browser open for 10 seconds for inspection...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('\n✅ Test complete!');
}

testMagicLink().catch(console.error);
