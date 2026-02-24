#!/usr/bin/env tsx
/**
 * 🧪 FULL VALIDATION TEST SCRIPT
 * 
 * Tests:
 * 1. Language filter functionality (e.g., Frans (België))
 * 2. Magic link login flow (200 vs 500 status)
 * 3. Console errors during interactions
 * 
 * Usage: npx tsx 3-WETTEN/scripts/test-full-validation.ts
 */

import { chromium, Browser, Page } from 'playwright';

interface TestResult {
  success: boolean;
  tests: {
    languageFilter: {
      success: boolean;
      message: string;
      actorsFound: number;
      filterApplied: boolean;
    };
    magicLink: {
      success: boolean;
      message: string;
      statusCode: number | null;
      apiResponse?: any;
    };
    consoleErrors: {
      success: boolean;
      message: string;
      errors: string[];
    };
  };
  consoleLogs: string[];
  networkRequests: Array<{ url: string; status: number; method: string }>;
  screenshots: string[];
}

async function runFullValidation(): Promise<TestResult> {
  let browser: Browser | null = null;
  let page: Page | null = null;
  
  const result: TestResult = {
    success: false,
    tests: {
      languageFilter: {
        success: false,
        message: '',
        actorsFound: 0,
        filterApplied: false
      },
      magicLink: {
        success: false,
        message: '',
        statusCode: null
      },
      consoleErrors: {
        success: true,
        message: 'No console errors detected',
        errors: []
      }
    },
    consoleLogs: [],
    networkRequests: [],
    screenshots: []
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
    });

    // Capture console errors
    page.on('pageerror', error => {
      result.tests.consoleErrors.errors.push(error.message);
      result.tests.consoleErrors.success = false;
      result.tests.consoleErrors.message = `${result.tests.consoleErrors.errors.length} console error(s) detected`;
    });

    // Capture network requests
    page.on('response', async response => {
      const url = response.url();
      const status = response.status();
      
      result.networkRequests.push({
        url,
        status,
        method: response.request().method()
      });
      
      // Track magic link API call
      if (url.includes('/api/auth/send-magic-link')) {
        result.tests.magicLink.statusCode = status;
        
        try {
          const responseBody = await response.json();
          result.tests.magicLink.apiResponse = responseBody;
          console.log('📡 Magic Link API Response:', JSON.stringify(responseBody, null, 2));
        } catch (e) {
          console.log('⚠️  Could not parse API response as JSON');
        }
      }
    });

    // ========================================
    // TEST 1: LANGUAGE FILTER
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TEST 1: LANGUAGE FILTER');
    console.log('='.repeat(60));
    
    console.log('📍 Navigating to https://voices-os-2026.vercel.app/...');
    await page.goto('https://voices-os-2026.vercel.app/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    console.log('✅ Homepage loaded');

    // Wait for page to be fully rendered
    await page.waitForTimeout(3000);

    // Take screenshot of homepage
    const homepageScreenshot = '/tmp/voices-test-homepage.png';
    await page.screenshot({ path: homepageScreenshot, fullPage: true });
    result.screenshots.push(homepageScreenshot);
    console.log(`📸 Homepage screenshot: ${homepageScreenshot}`);

    // Look for language filter (could be a select, button, or custom dropdown)
    console.log('🔍 Looking for language filter...');
    
    // Try to find and click on language filter
    try {
      // Look for a filter button or dropdown trigger
      const filterButton = page.locator('button, [role="button"]').filter({ hasText: /taal|language|filter/i }).first();
      
      if (await filterButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('✅ Found language filter button');
        await filterButton.click();
        await page.waitForTimeout(1000);
        
        // Look for "Frans (België)" or "Frans" option
        const frenchOption = page.locator('text=/frans.*belgië|frans/i').first();
        
        if (await frenchOption.isVisible({ timeout: 5000 }).catch(() => false)) {
          console.log('✅ Found "Frans (België)" option');
          await frenchOption.click();
          await page.waitForTimeout(2000);
          
          result.tests.languageFilter.filterApplied = true;
          
          // Take screenshot after filter
          const filterScreenshot = '/tmp/voices-test-filter-applied.png';
          await page.screenshot({ path: filterScreenshot, fullPage: true });
          result.screenshots.push(filterScreenshot);
          console.log(`📸 Filter applied screenshot: ${filterScreenshot}`);
          
          // Count actors displayed
          const actorCards = await page.locator('[data-actor-card], .actor-card, [class*="actor"]').count();
          result.tests.languageFilter.actorsFound = actorCards;
          
          if (actorCards > 0) {
            result.tests.languageFilter.success = true;
            result.tests.languageFilter.message = `Filter applied successfully. ${actorCards} actor(s) found.`;
            console.log(`✅ ${actorCards} actor(s) displayed after filter`);
          } else {
            result.tests.languageFilter.success = false;
            result.tests.languageFilter.message = 'Filter applied but no actors found';
            console.log('⚠️  Filter applied but no actors visible');
          }
        } else {
          result.tests.languageFilter.success = false;
          result.tests.languageFilter.message = 'Could not find "Frans (België)" option';
          console.log('❌ Could not find "Frans (België)" option');
        }
      } else {
        result.tests.languageFilter.success = false;
        result.tests.languageFilter.message = 'Could not find language filter button';
        console.log('❌ Could not find language filter button');
      }
    } catch (error: any) {
      result.tests.languageFilter.success = false;
      result.tests.languageFilter.message = `Error: ${error.message}`;
      console.log('❌ Language filter test failed:', error.message);
    }

    // ========================================
    // TEST 2: MAGIC LINK LOGIN
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TEST 2: MAGIC LINK LOGIN');
    console.log('='.repeat(60));
    
    console.log('📍 Navigating to /account/...');
    await page.goto('https://voices-os-2026.vercel.app/account/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    console.log('✅ Account page loaded');

    await page.waitForTimeout(3000);

    try {
      // Find and fill the email input
      console.log('📧 Looking for email input...');
      const emailInput = await page.locator('input[type="email"]').first();
      await emailInput.waitFor({ state: 'visible', timeout: 5000 });
      
      console.log('✍️  Filling email: test-validation@voices.be');
      await emailInput.fill('test-validation@voices.be');

      // Find and click the submit button
      console.log('🔘 Looking for submit button...');
      const submitButton = await page.locator('button[type="submit"]').first();
      await submitButton.waitFor({ state: 'visible', timeout: 5000 });
      
      console.log('👆 Clicking submit button...');
      await submitButton.click();

      // Wait for response
      console.log('⏳ Waiting for API response...');
      await page.waitForTimeout(5000);

      // Take screenshot after submit
      const loginScreenshot = '/tmp/voices-test-login.png';
      await page.screenshot({ path: loginScreenshot, fullPage: true });
      result.screenshots.push(loginScreenshot);
      console.log(`📸 Login screenshot: ${loginScreenshot}`);

      // Check status code
      if (result.tests.magicLink.statusCode === 200) {
        result.tests.magicLink.success = true;
        result.tests.magicLink.message = 'Magic link API returned 200 (success)';
        console.log('✅ Magic link API returned 200');
      } else if (result.tests.magicLink.statusCode === 500) {
        result.tests.magicLink.success = false;
        result.tests.magicLink.message = 'Magic link API returned 500 (server error)';
        console.log('❌ Magic link API returned 500');
      } else if (result.tests.magicLink.statusCode) {
        result.tests.magicLink.success = false;
        result.tests.magicLink.message = `Magic link API returned ${result.tests.magicLink.statusCode}`;
        console.log(`⚠️  Magic link API returned ${result.tests.magicLink.statusCode}`);
      } else {
        result.tests.magicLink.success = false;
        result.tests.magicLink.message = 'No API response detected';
        console.log('❌ No API response detected');
      }

      // Check for success or error message
      const successMessage = await page.locator('text=/check je inbox|email verzonden|magic link/i').first();
      const errorMessage = await page.locator('.bg-red-50, [class*="error"]').first();

      if (await successMessage.isVisible().catch(() => false)) {
        const msgText = await successMessage.textContent() || '';
        console.log('✅ SUCCESS MESSAGE:', msgText);
      } else if (await errorMessage.isVisible().catch(() => false)) {
        const errText = await errorMessage.textContent() || '';
        console.log('❌ ERROR MESSAGE:', errText);
      }

    } catch (error: any) {
      result.tests.magicLink.success = false;
      result.tests.magicLink.message = `Error: ${error.message}`;
      console.log('❌ Magic link test failed:', error.message);
    }

    // ========================================
    // FINAL EVALUATION
    // ========================================
    result.success = 
      result.tests.languageFilter.success &&
      result.tests.magicLink.success &&
      result.tests.consoleErrors.success;

  } catch (error: any) {
    console.error('❌ Test suite failed with error:', error.message);
    
    if (page) {
      try {
        const errorScreenshot = '/tmp/voices-test-error.png';
        await page.screenshot({ path: errorScreenshot, fullPage: true });
        result.screenshots.push(errorScreenshot);
        console.log(`📸 Error screenshot: ${errorScreenshot}`);
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

// Run the test suite
(async () => {
  console.log('🧪 VOICES FULL VALIDATION TEST SUITE\n');
  console.log('=' .repeat(60));
  
  const result = await runFullValidation();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL TEST RESULTS:\n');
  
  console.log('1️⃣  LANGUAGE FILTER:');
  console.log(`   Status: ${result.tests.languageFilter.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Message: ${result.tests.languageFilter.message}`);
  console.log(`   Actors Found: ${result.tests.languageFilter.actorsFound}`);
  console.log(`   Filter Applied: ${result.tests.languageFilter.filterApplied ? 'Yes' : 'No'}`);
  
  console.log('\n2️⃣  MAGIC LINK LOGIN:');
  console.log(`   Status: ${result.tests.magicLink.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Message: ${result.tests.magicLink.message}`);
  console.log(`   Status Code: ${result.tests.magicLink.statusCode || 'N/A'}`);
  if (result.tests.magicLink.apiResponse) {
    console.log(`   API Response: ${JSON.stringify(result.tests.magicLink.apiResponse, null, 2)}`);
  }
  
  console.log('\n3️⃣  CONSOLE ERRORS:');
  console.log(`   Status: ${result.tests.consoleErrors.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Message: ${result.tests.consoleErrors.message}`);
  if (result.tests.consoleErrors.errors.length > 0) {
    console.log(`   Errors (${result.tests.consoleErrors.errors.length}):`);
    result.tests.consoleErrors.errors.forEach(error => console.log(`     - ${error}`));
  }
  
  console.log('\n📸 SCREENSHOTS:');
  result.screenshots.forEach(path => console.log(`   - ${path}`));
  
  console.log('\n🌐 NETWORK REQUESTS:');
  const relevantRequests = result.networkRequests.filter(req => 
    req.url.includes('/api/') || req.url.includes('magic-link')
  );
  if (relevantRequests.length > 0) {
    relevantRequests.forEach(req => console.log(`   - ${req.method} ${req.url} (${req.status})`));
  } else {
    console.log('   No relevant API requests captured');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n🎯 OVERALL: ${result.success ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`);
  console.log('='.repeat(60));
  
  process.exit(result.success ? 0 : 1);
})();
