#!/usr/bin/env tsx
/**
 * 🧪 LOGIN FLOW TEST SCRIPT
 * 
 * Tests the magic link login flow on voices.be
 * 
 * Usage: npx tsx 3-WETTEN/scripts/test-login-flow.ts
 */

import { chromium, Browser, Page } from 'playwright';

interface TestResult {
  success: boolean;
  version?: string;
  message?: string;
  error?: string;
  screenshot?: string;
  consoleLogs: string[];
  consoleErrors: string[];
  apiResponse?: any;
  networkRequests: Array<{ url: string; status: number; method: string }>;
}

async function testLoginFlow(): Promise<TestResult> {
  let browser: Browser | null = null;
  let page: Page | null = null;
  
  const result: TestResult = {
    success: false,
    consoleLogs: [],
    consoleErrors: [],
    networkRequests: []
  };

  try {
    console.log('🚀 Starting browser...');
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    
    page = await context.newPage();

    // Capture console logs
    page.on('console', msg => {
      const text = msg.text();
      result.consoleLogs.push(text);
      
      // Check for version
      if (text.includes('Nuclear Version:')) {
        const match = text.match(/v([\d.]+)/);
        if (match) {
          result.version = match[1];
        }
      }
    });

    // Capture console errors
    page.on('pageerror', error => {
      result.consoleErrors.push(error.message);
    });

    // Capture network requests
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/auth/send-magic-link')) {
        result.networkRequests.push({
          url,
          status: response.status(),
          method: 'POST'
        });
        
        try {
          const responseBody = await response.json();
          result.apiResponse = responseBody;
          console.log('📡 API Response:', JSON.stringify(responseBody, null, 2));
        } catch (e) {
          console.log('⚠️  Could not parse API response as JSON');
        }
      }
    });

    console.log('📍 Navigating to https://www.voices.be/account/...');
    try {
      await page.goto('https://www.voices.be/account/', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      console.log('✅ Page loaded successfully');
    } catch (navError: any) {
      console.log('⚠️  Navigation timeout, but continuing (page may still be usable)');
    }

    // Wait for the page to be fully rendered
    await page.waitForTimeout(3000);

    // Check if version is displayed
    console.log('🔍 Checking for Nuclear Version...');
    if (result.version) {
      console.log(`✅ Found version: v${result.version}`);
    } else {
      console.log('⚠️  Version not found in console logs');
    }

    // Find and fill the email input
    console.log('📧 Looking for email input...');
    const emailInput = await page.locator('input[type="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 5000 });
    
    console.log('✍️  Filling email: test-audit@voices.be');
    await emailInput.fill('test-audit@voices.be');

    // Find and click the submit button
    console.log('🔘 Looking for submit button...');
    const submitButton = await page.locator('button[type="submit"]').first();
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    
    console.log('👆 Clicking "Stuur Magische Link" button...');
    await submitButton.click();

    // Wait for response
    console.log('⏳ Waiting for response...');
    await page.waitForTimeout(5000);

    // Check for success or error message (more specific selectors)
    const successMessage = await page.locator('text=/Check je inbox/i').first();
    const errorMessage = await page.locator('.bg-red-50').first();

    if (await successMessage.isVisible().catch(() => false)) {
      result.success = true;
      result.message = await successMessage.textContent() || 'Success message found';
      console.log('✅ SUCCESS MESSAGE:', result.message);
    } else if (await errorMessage.isVisible().catch(() => false)) {
      result.success = false;
      result.error = await errorMessage.textContent() || 'Error message found';
      console.log('❌ ERROR MESSAGE:', result.error);
    } else {
      result.success = false;
      result.error = 'No success or error message found';
      console.log('⚠️  No clear success or error message detected');
    }

    // Take screenshot
    const screenshotPath = '/tmp/voices-login-test.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    result.screenshot = screenshotPath;
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

  } catch (error: any) {
    console.error('❌ Test failed with error:', error.message);
    result.success = false;
    result.error = error.message;
    
    if (page) {
      try {
        const screenshotPath = '/tmp/voices-login-test-error.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });
        result.screenshot = screenshotPath;
        console.log(`📸 Error screenshot saved to: ${screenshotPath}`);
      } catch (screenshotError) {
        console.error('Failed to take error screenshot:', screenshotError);
      }
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return result;
}

// Run the test
(async () => {
  console.log('🧪 VOICES LOGIN FLOW TEST\n');
  console.log('=' .repeat(60));
  
  const result = await testLoginFlow();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS:\n');
  console.log(`Version Found: ${result.version || 'NOT FOUND'}`);
  console.log(`Test Success: ${result.success ? '✅ YES' : '❌ NO'}`);
  
  if (result.message) {
    console.log(`\n✅ Success Message:\n${result.message}`);
  }
  
  if (result.error) {
    console.log(`\n❌ Error Message:\n${result.error}`);
  }
  
  if (result.consoleLogs.length > 0) {
    console.log(`\n📝 Console Logs (${result.consoleLogs.length}):`);
    result.consoleLogs.forEach(log => console.log(`  - ${log}`));
  }
  
  if (result.consoleErrors.length > 0) {
    console.log(`\n🔴 Console Errors (${result.consoleErrors.length}):`);
    result.consoleErrors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (result.apiResponse) {
    console.log(`\n📡 API Response:`);
    console.log(JSON.stringify(result.apiResponse, null, 2));
  }
  
  if (result.networkRequests.length > 0) {
    console.log(`\n🌐 Network Requests (${result.networkRequests.length}):`);
    result.networkRequests.forEach(req => console.log(`  - ${req.method} ${req.url} (${req.status})`));
  }
  
  if (result.screenshot) {
    console.log(`\n📸 Screenshot: ${result.screenshot}`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  process.exit(result.success ? 0 : 1);
})();
