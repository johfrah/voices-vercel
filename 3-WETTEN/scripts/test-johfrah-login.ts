#!/usr/bin/env tsx
/**
 * 🧪 JOHFRAH LOGIN TEST
 * 
 * Tests the magic link login with johfrah@voices.be
 */

import { chromium } from 'playwright';

async function testJohfrahLogin() {
  console.log('🚀 Starting browser...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const consoleLogs: string[] = [];
  const consoleErrors: string[] = [];
  
  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    console.log(`[Console] ${text}`);
  });
  
  // Capture console errors
  page.on('pageerror', error => {
    consoleErrors.push(error.message);
    console.error(`[Error] ${error.message}`);
  });
  
  // Capture network requests
  let apiResponse: any = null;
  let apiStatus: number | null = null;
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/auth/send-magic-link')) {
      apiStatus = response.status();
      console.log(`\n📡 API Response: Status ${apiStatus}`);
      
      try {
        apiResponse = await response.json();
        console.log(`📡 API Body:`, JSON.stringify(apiResponse, null, 2));
      } catch (e) {
        console.log('⚠️  Could not parse API response');
      }
    }
  });
  
  try {
    console.log('📍 STEP 1: Navigating to https://www.voices.be/account/\n');
    await page.goto('https://www.voices.be/account/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('⏳ Waiting for page to fully load...\n');
    await page.waitForTimeout(3000);
    
    console.log('📍 STEP 2: Filling email field with johfrah@voices.be\n');
    const emailInput = await page.locator('input[type="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 5000 });
    await emailInput.fill('johfrah@voices.be');
    console.log('✅ Email filled\n');
    
    console.log('📍 STEP 3: Clicking "Stuur Magische Link" button\n');
    const submitButton = await page.locator('button[type="submit"]').first();
    await submitButton.click();
    console.log('✅ Button clicked\n');
    
    console.log('📍 STEP 4: Waiting for visual response...\n');
    await page.waitForTimeout(5000);
    
    console.log('📍 STEP 5: Checking for success or error message\n');
    
    // Check for success message
    const successElement = await page.locator('text=/Check je inbox/i').first();
    const successVisible = await successElement.isVisible().catch(() => false);
    
    // Check for error message
    const errorElement = await page.locator('.bg-red-50').first();
    const errorVisible = await errorElement.isVisible().catch(() => false);
    
    let messageText = '';
    let messageType = '';
    
    if (successVisible) {
      messageType = 'SUCCESS';
      const parent = await page.locator('text=/Check je inbox/i').first().locator('xpath=ancestor::div[contains(@class, "animate-in")]').first();
      messageText = await parent.textContent() || await successElement.textContent() || '';
      console.log('✅ SUCCESS MESSAGE DETECTED');
    } else if (errorVisible) {
      messageType = 'ERROR';
      messageText = await errorElement.textContent() || '';
      console.log('❌ ERROR MESSAGE DETECTED');
    } else {
      messageType = 'NONE';
      messageText = 'No message detected';
      console.log('⚠️  NO MESSAGE DETECTED');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL RESULTS\n');
    console.log(`Message Type: ${messageType}`);
    console.log(`Message Text: ${messageText.trim()}`);
    console.log(`API Status: ${apiStatus || 'N/A'}`);
    
    if (apiResponse) {
      console.log(`API Response:`, JSON.stringify(apiResponse, null, 2));
    }
    
    console.log('\n📝 Console Logs:');
    if (consoleLogs.length > 0) {
      consoleLogs.forEach(log => console.log(`  - ${log}`));
    } else {
      console.log('  (none)');
    }
    
    console.log('\n🔴 Console Errors:');
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('  (none)');
    }
    
    console.log('\n📍 STEP 6: Taking screenshot\n');
    const screenshotPath = '/tmp/johfrah-login-result.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    
    console.log('\n✅ Test complete. Browser will stay open for 10 seconds...');
    await page.waitForTimeout(10000);
    
    console.log('='.repeat(80));
    
  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message);
    
    const screenshotPath = '/tmp/johfrah-login-error.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Error screenshot: ${screenshotPath}`);
  } finally {
    await browser.close();
  }
}

testJohfrahLogin().catch(console.error);
