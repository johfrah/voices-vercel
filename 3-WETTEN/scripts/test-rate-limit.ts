#!/usr/bin/env tsx
/**
 * 🧪 RATE LIMIT TEST SCRIPT
 * 
 * Tests the rate limiting on magic link requests
 * 
 * Usage: npx tsx 3-WETTEN/scripts/test-rate-limit.ts
 */

import { chromium, Browser, Page } from 'playwright';

interface TestResult {
  success: boolean;
  version?: string;
  firstAttempt: {
    success: boolean;
    message?: string;
    apiResponse?: any;
  };
  secondAttempt: {
    success: boolean;
    error?: string;
    apiResponse?: any;
    rateLimitDetected: boolean;
    spinnerStuck: boolean;
  };
  consoleLogs: string[];
  consoleErrors: string[];
  screenshots: {
    firstSuccess?: string;
    rateLimitError?: string;
  };
}

async function testRateLimit(): Promise<TestResult> {
  let browser: Browser | null = null;
  let page: Page | null = null;
  
  const result: TestResult = {
    success: false,
    firstAttempt: { success: false },
    secondAttempt: { success: false, rateLimitDetected: false, spinnerStuck: false },
    consoleLogs: [],
    consoleErrors: [],
    screenshots: {}
  };

  try {
    console.log('🚀 Starting browser...');
    browser = await chromium.launch({ 
      headless: true,  // Headless mode for stability
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
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
      console.log(`[Console] ${text}`);
      
      // Check for version
      if (text.includes('Nuclear Version:')) {
        const match = text.match(/v([\d.]+)/);
        if (match) {
          result.version = match[1];
        }
      }
      
      // Check for API errors
      if (text.includes('API Error') || text.includes('429')) {
        console.log('🚨 RATE LIMIT DETECTED IN CONSOLE!');
      }
    });

    // Capture console errors
    page.on('pageerror', error => {
      result.consoleErrors.push(error.message);
      console.log(`[Error] ${error.message}`);
    });

    // Capture network requests
    let firstApiResponse: any = null;
    let secondApiResponse: any = null;
    let apiCallCount = 0;

    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/auth/send-magic-link')) {
        apiCallCount++;
        const status = response.status();
        console.log(`📡 API Call #${apiCallCount}: Status ${status}`);
        
        try {
          const responseBody = await response.json();
          console.log(`📡 API Response #${apiCallCount}:`, JSON.stringify(responseBody, null, 2));
          
          if (apiCallCount === 1) {
            firstApiResponse = { status, body: responseBody };
          } else if (apiCallCount === 2) {
            secondApiResponse = { status, body: responseBody };
            if (status === 429 || responseBody.error?.includes('rate limit')) {
              result.secondAttempt.rateLimitDetected = true;
            }
          }
        } catch (e) {
          console.log(`⚠️  Could not parse API response #${apiCallCount} as JSON`);
        }
      }
    });

    console.log('\n📍 STEP 1: Navigating to https://www.voices.be/account/...');
    try {
      await page.goto('https://www.voices.be/account/', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      console.log('✅ Page loaded');
    } catch (navError: any) {
      console.log('⚠️  Navigation timeout, continuing anyway');
    }

    await page.waitForTimeout(3000);

    console.log('\n📍 STEP 2: Checking version...');
    if (result.version) {
      console.log(`✅ Found version: v${result.version}`);
      if (result.version === '2.14.214' || result.version === '2.14.213') {
        console.log(`✅ Version found: v${result.version} (testing rate limit functionality)`);
      } else {
        console.log(`⚠️  Unexpected version: v${result.version}`);
      }
    } else {
      console.log('⚠️  Version not found in console logs');
    }

    console.log('\n📍 STEP 3: Finding and filling email input...');
    const emailInput = await page.locator('input[type="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 5000 });
    await emailInput.fill('test-audit@voices.be');
    console.log('✅ Email filled: test-audit@voices.be');

    console.log('\n📍 STEP 4: First attempt - clicking "Stuur Magische Link"...');
    const submitButton = await page.locator('button[type="submit"]').first();
    await submitButton.click();
    console.log('✅ Button clicked (first time)');

    // Wait for first response
    await page.waitForTimeout(4000);

    // Check for success message
    const successMessage = await page.locator('text=/Check je inbox/i').first();
    if (await successMessage.isVisible().catch(() => false)) {
      result.firstAttempt.success = true;
      result.firstAttempt.message = await successMessage.textContent() || 'Success';
      result.firstAttempt.apiResponse = firstApiResponse;
      console.log('✅ First attempt SUCCESS:', result.firstAttempt.message);
      
      // Take screenshot of success
      const screenshotPath = '/tmp/voices-rate-limit-success.png';
      await page.screenshot({ path: screenshotPath, fullPage: true });
      result.screenshots.firstSuccess = screenshotPath;
      console.log(`📸 Success screenshot: ${screenshotPath}`);
    } else {
      console.log('❌ First attempt FAILED - no success message');
      return result;
    }

    console.log('\n📍 STEP 5: Second attempt - clicking AGAIN to trigger rate limit...');
    
    // Try to click the "Opnieuw proberen" button if visible, otherwise find the submit button again
    const retryButton = await page.locator('text=/Opnieuw proberen/i').first();
    if (await retryButton.isVisible().catch(() => false)) {
      console.log('Found "Opnieuw proberen" button, clicking it first...');
      await retryButton.click();
      await page.waitForTimeout(1000);
      
      // Re-fill email
      const emailInput2 = await page.locator('input[type="email"]').first();
      await emailInput2.fill('test-audit@voices.be');
      
      // Click submit again
      const submitButton2 = await page.locator('button[type="submit"]').first();
      await submitButton2.click();
    } else {
      // The form should still be visible, just click submit again
      await submitButton.click();
    }
    
    console.log('✅ Button clicked (second time)');

    // Wait for the API response to complete
    await page.waitForTimeout(3000);
    
    // Check if spinner is still visible (stuck)
    const spinner = await page.locator('svg.animate-spin').first();
    const spinnerVisible = await spinner.isVisible().catch(() => false);
    
    if (spinnerVisible) {
      console.log('⚠️  SPINNER IS STILL VISIBLE after 3s - checking if stuck...');
      result.secondAttempt.spinnerStuck = true;
      
      // Wait even longer to be absolutely sure
      await page.waitForTimeout(5000);
      
      const stillSpinning = await spinner.isVisible().catch(() => false);
      if (stillSpinning) {
        console.log('🚨 SPINNER IS DEFINITELY STUCK after 8s total! This is a bug.');
        
        // Check if error message is also visible (both at the same time = bug)
        const errorVisible = await page.locator('.bg-red-50').first().isVisible().catch(() => false);
        if (errorVisible) {
          console.log('🚨 CRITICAL: Both error message AND spinner are visible simultaneously!');
        }
      } else {
        console.log('✅ Spinner eventually cleared after 8s');
        result.secondAttempt.spinnerStuck = false;
      }
    } else {
      console.log('✅ Spinner not visible - loading state cleared properly');
      result.secondAttempt.spinnerStuck = false;
    }

    // Check for error message
    const errorMessage = await page.locator('.bg-red-50, .border-red-500').first();
    if (await errorMessage.isVisible().catch(() => false)) {
      result.secondAttempt.success = true;
      result.secondAttempt.error = await errorMessage.textContent() || 'Error message found';
      result.secondAttempt.apiResponse = secondApiResponse;
      console.log('✅ Rate limit error message displayed:', result.secondAttempt.error);
      
      // Take screenshot of error
      const screenshotPath = '/tmp/voices-rate-limit-error.png';
      await page.screenshot({ path: screenshotPath, fullPage: true });
      result.screenshots.rateLimitError = screenshotPath;
      console.log(`📸 Error screenshot: ${screenshotPath}`);
    } else {
      console.log('❌ No error message displayed after second attempt');
    }

    // Final check
    result.success = result.firstAttempt.success && 
                     result.secondAttempt.success && 
                     result.secondAttempt.rateLimitDetected &&
                     !result.secondAttempt.spinnerStuck;

  } catch (error: any) {
    console.error('❌ Test failed with error:', error.message);
    
    if (page) {
      try {
        const screenshotPath = '/tmp/voices-rate-limit-crash.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 Crash screenshot: ${screenshotPath}`);
      } catch (screenshotError) {
        console.error('Failed to take crash screenshot:', screenshotError);
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
  console.log('🧪 VOICES RATE LIMIT TEST\n');
  console.log('=' .repeat(80));
  
  const result = await testRateLimit();
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL TEST RESULTS:\n');
  
  console.log(`Version: ${result.version || 'NOT FOUND'}`);
  console.log(`Expected: v2.14.214 (or v2.14.213 until deployed)`);
  console.log(`Valid: ${(result.version === '2.14.214' || result.version === '2.14.213') ? '✅ YES' : '❌ NO'}\n`);
  
  console.log('FIRST ATTEMPT (Should succeed):');
  console.log(`  Success: ${result.firstAttempt.success ? '✅ YES' : '❌ NO'}`);
  console.log(`  Message: ${result.firstAttempt.message || 'N/A'}\n`);
  
  console.log('SECOND ATTEMPT (Should show rate limit error):');
  console.log(`  Error Displayed: ${result.secondAttempt.success ? '✅ YES' : '❌ NO'}`);
  console.log(`  Error Message: ${result.secondAttempt.error || 'N/A'}`);
  console.log(`  Rate Limit Detected: ${result.secondAttempt.rateLimitDetected ? '✅ YES' : '❌ NO'}`);
  console.log(`  Spinner Stuck: ${result.secondAttempt.spinnerStuck ? '🚨 YES (BUG!)' : '✅ NO'}\n`);
  
  console.log(`Overall Test: ${result.success ? '✅ PASSED' : '❌ FAILED'}\n`);
  
  if (result.screenshots.firstSuccess) {
    console.log(`📸 Success Screenshot: ${result.screenshots.firstSuccess}`);
  }
  if (result.screenshots.rateLimitError) {
    console.log(`📸 Error Screenshot: ${result.screenshots.rateLimitError}`);
  }
  
  console.log('\n' + '='.repeat(80));
  
  process.exit(result.success ? 0 : 1);
})();
