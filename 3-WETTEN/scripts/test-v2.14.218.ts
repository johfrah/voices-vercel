#!/usr/bin/env tsx
/**
 * 🧪 TEST v2.14.218 - Johfrah Login
 */

import { chromium } from 'playwright';

async function testLogin() {
  console.log('🚀 Starting test for v2.14.218\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  let detectedVersion = '';
  let apiCalled = false;
  let apiResponse: any = null;
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Nuclear Version:')) {
      const match = text.match(/v([\d.]+)/);
      if (match) detectedVersion = match[1];
      console.log(`✅ ${text}`);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/auth/send-magic-link')) {
      apiCalled = true;
      const status = response.status();
      console.log(`\n📡 API Called: Status ${status}`);
      try {
        apiResponse = await response.json();
        console.log(`📡 Response:`, JSON.stringify(apiResponse, null, 2));
      } catch (e) {
        console.log('⚠️  Could not parse response');
      }
    }
  });
  
  try {
    console.log('📍 Step 1: Navigating to https://www.voices.be/account/\n');
    await page.goto('https://www.voices.be/account/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    console.log('📍 Step 2: Verifying version\n');
    if (detectedVersion === '2.14.218') {
      console.log(`✅ Version correct: v${detectedVersion}\n`);
    } else {
      console.log(`⚠️  Version mismatch: Expected v2.14.218, got v${detectedVersion}\n`);
    }
    
    console.log('📍 Step 3: Filling email johfrah@voices.be\n');
    await page.locator('input[type="email"]').fill('johfrah@voices.be');
    console.log('✅ Email filled\n');
    
    console.log('📍 Step 4: Clicking "Stuur Magische Link"\n');
    await page.locator('button[type="submit"]').click();
    console.log('✅ Button clicked\n');
    
    console.log('📍 Step 5: Waiting for success message...\n');
    await page.waitForTimeout(5000);
    
    const successVisible = await page.locator('text=/Check je inbox/i').isVisible().catch(() => false);
    const errorVisible = await page.locator('.bg-red-50').isVisible().catch(() => false);
    
    console.log('📍 Step 6: Reporting result\n');
    console.log('='.repeat(80));
    
    if (successVisible) {
      const messageElement = page.locator('text=/Check je inbox/i').first();
      const fullMessage = await messageElement.locator('xpath=ancestor::div[contains(@class, "animate-in")]').textContent().catch(() => '');
      
      console.log('✅ SUCCESS MESSAGE DETECTED:');
      console.log(fullMessage || 'Check je inbox!');
      console.log('\n✅ Magic link request successful!');
    } else if (errorVisible) {
      const errorText = await page.locator('.bg-red-50').textContent();
      console.log('❌ ERROR MESSAGE:');
      console.log(errorText);
    } else {
      console.log('⚠️  No clear message detected');
    }
    
    console.log('\n📊 Summary:');
    console.log(`Version: v${detectedVersion}`);
    console.log(`API Called: ${apiCalled ? 'Yes' : 'No'}`);
    console.log(`Result: ${successVisible ? '✅ Success' : errorVisible ? '❌ Error' : '⚠️  Unknown'}`);
    
    if (apiResponse) {
      console.log(`API Response:`, apiResponse);
    }
    
    console.log('='.repeat(80));
    
    const screenshotPath = '/tmp/v2.14.218-test.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 Screenshot: ${screenshotPath}`);
    
    console.log('\n✅ Test complete. Browser will close in 10 seconds...');
    await page.waitForTimeout(10000);
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testLogin().catch(console.error);
