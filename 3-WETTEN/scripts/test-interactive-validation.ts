#!/usr/bin/env tsx
/**
 * 🧪 INTERACTIVE VALIDATION TEST
 * 
 * Uses actual DOM inspection to find and interact with elements
 * 
 * Usage: npx tsx 3-WETTEN/scripts/test-interactive-validation.ts
 */

import { chromium, Browser, Page } from 'playwright';

interface TestResult {
  success: boolean;
  tests: {
    languageFilter: {
      success: boolean;
      message: string;
      details: string[];
    };
    magicLink: {
      success: boolean;
      message: string;
      statusCode: number | null;
      details: string[];
    };
    consoleErrors: {
      success: boolean;
      errors: string[];
    };
  };
  screenshots: string[];
}

async function runInteractiveValidation(): Promise<TestResult> {
  let browser: Browser | null = null;
  let page: Page | null = null;
  
  const result: TestResult = {
    success: false,
    tests: {
      languageFilter: {
        success: false,
        message: '',
        details: []
      },
      magicLink: {
        success: false,
        message: '',
        statusCode: null,
        details: []
      },
      consoleErrors: {
        success: true,
        errors: []
      }
    },
    screenshots: []
  };

  try {
    console.log('🚀 Launching browser...');
    browser = await chromium.launch({ 
      headless: false,  // Run in visible mode for better debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    
    page = await context.newPage();

    // Capture console errors
    page.on('pageerror', error => {
      result.tests.consoleErrors.errors.push(error.message);
      result.tests.consoleErrors.success = false;
    });

    // Track magic link API
    let magicLinkStatusCode: number | null = null;
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/auth/send-magic-link')) {
        magicLinkStatusCode = response.status();
        result.tests.magicLink.statusCode = response.status();
        result.tests.magicLink.details.push(`API called: ${url}`);
        result.tests.magicLink.details.push(`Status: ${response.status()}`);
        
        try {
          const body = await response.text();
          result.tests.magicLink.details.push(`Response: ${body.substring(0, 200)}`);
        } catch (e) {
          result.tests.magicLink.details.push('Could not read response body');
        }
      }
    });

    // ========================================
    // TEST 1: LANGUAGE FILTER
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TEST 1: LANGUAGE FILTER');
    console.log('='.repeat(60));
    
    console.log('📍 Navigating to https://www.voices.be/...');
    await page.goto('https://www.voices.be/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    
    const homepageScreenshot = '/tmp/voices-interactive-homepage.png';
    await page.screenshot({ path: homepageScreenshot, fullPage: true });
    result.screenshots.push(homepageScreenshot);
    console.log(`📸 Screenshot: ${homepageScreenshot}`);

    // Strategy 1: Look for any element containing "Frans" or "French"
    console.log('\n🔍 Strategy 1: Looking for language options...');
    const frenchElements = await page.locator('text=/frans|french|français/i').all();
    console.log(`   Found ${frenchElements.length} elements with French-related text`);
    
    if (frenchElements.length > 0) {
      result.tests.languageFilter.details.push(`Found ${frenchElements.length} French-related elements`);
      
      // Try clicking the first one
      try {
        console.log('   Attempting to click first French element...');
        await frenchElements[0].click();
        await page.waitForTimeout(3000);
        
        const afterClickScreenshot = '/tmp/voices-interactive-french-clicked.png';
        await page.screenshot({ path: afterClickScreenshot, fullPage: true });
        result.screenshots.push(afterClickScreenshot);
        
        // Check if actors are visible
        const actorElements = await page.locator('[data-actor], [class*="actor"], [class*="voice"]').all();
        console.log(`   Found ${actorElements.length} potential actor elements`);
        
        if (actorElements.length > 0) {
          result.tests.languageFilter.success = true;
          result.tests.languageFilter.message = `Successfully filtered to French. Found ${actorElements.length} actors.`;
          result.tests.languageFilter.details.push(`Clicked French filter`);
          result.tests.languageFilter.details.push(`${actorElements.length} actors displayed`);
        } else {
          result.tests.languageFilter.message = 'Clicked French filter but no actors found';
          result.tests.languageFilter.details.push('No actors visible after filter');
        }
      } catch (error: any) {
        result.tests.languageFilter.details.push(`Error clicking: ${error.message}`);
      }
    }
    
    // Strategy 2: Look for filter buttons or dropdowns
    if (!result.tests.languageFilter.success) {
      console.log('\n🔍 Strategy 2: Looking for filter UI elements...');
      const filterButtons = await page.locator('button, [role="button"]').all();
      console.log(`   Found ${filterButtons.length} buttons/clickable elements`);
      
      for (let i = 0; i < Math.min(filterButtons.length, 50); i++) {
        const text = await filterButtons[i].textContent();
        const cleanText = text?.trim().toLowerCase() || '';
        
        if (cleanText.includes('filter') || cleanText.includes('taal') || cleanText.includes('language')) {
          console.log(`   Found potential filter button: "${text?.trim()}"`);
          result.tests.languageFilter.details.push(`Found filter button: "${text?.trim()}"`);
          
          try {
            await filterButtons[i].click();
            await page.waitForTimeout(2000);
            
            // Now look for French option
            const frenchOption = await page.locator('text=/frans|french/i').first();
            if (await frenchOption.isVisible({ timeout: 2000 }).catch(() => false)) {
              console.log('   Found French option in dropdown!');
              await frenchOption.click();
              await page.waitForTimeout(3000);
              
              const filterAppliedScreenshot = '/tmp/voices-interactive-filter-applied.png';
              await page.screenshot({ path: filterAppliedScreenshot, fullPage: true });
              result.screenshots.push(filterAppliedScreenshot);
              
              result.tests.languageFilter.success = true;
              result.tests.languageFilter.message = 'Successfully applied French language filter';
              result.tests.languageFilter.details.push('Filter applied successfully');
              break;
            }
          } catch (error: any) {
            result.tests.languageFilter.details.push(`Error with filter button: ${error.message}`);
          }
        }
      }
    }
    
    if (!result.tests.languageFilter.success) {
      result.tests.languageFilter.message = 'Could not find or interact with language filter';
      result.tests.languageFilter.details.push('All strategies failed');
    }

    // ========================================
    // TEST 2: MAGIC LINK LOGIN
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TEST 2: MAGIC LINK LOGIN');
    console.log('='.repeat(60));
    
    console.log('📍 Navigating to /account/...');
    await page.goto('https://www.voices.be/account/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    
    const accountScreenshot = '/tmp/voices-interactive-account.png';
    await page.screenshot({ path: accountScreenshot, fullPage: true });
    result.screenshots.push(accountScreenshot);

    try {
      // Find email input
      console.log('📧 Looking for email input...');
      const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
      
      if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('✅ Found email input');
        await emailInput.fill('test-interactive@voices.be');
        result.tests.magicLink.details.push('Email input found and filled');
        
        // Find submit button
        console.log('🔘 Looking for submit button...');
        const submitButton = await page.locator('button[type="submit"], button:has-text("verstuur"), button:has-text("verzend"), button:has-text("login")').first();
        
        if (await submitButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          console.log('✅ Found submit button');
          const buttonText = await submitButton.textContent();
          result.tests.magicLink.details.push(`Submit button: "${buttonText?.trim()}"`);
          
          console.log('👆 Clicking submit...');
          await submitButton.click();
          
          // Wait for API response
          await page.waitForTimeout(5000);
          
          const afterSubmitScreenshot = '/tmp/voices-interactive-after-submit.png';
          await page.screenshot({ path: afterSubmitScreenshot, fullPage: true });
          result.screenshots.push(afterSubmitScreenshot);
          
          // Evaluate result
          if (magicLinkStatusCode === 200) {
            result.tests.magicLink.success = true;
            result.tests.magicLink.message = '✅ Magic link API returned 200 (SUCCESS)';
          } else if (magicLinkStatusCode === 308) {
            result.tests.magicLink.success = false;
            result.tests.magicLink.message = '⚠️  Magic link API returned 308 (REDIRECT) - should be 200';
          } else if (magicLinkStatusCode === 500) {
            result.tests.magicLink.success = false;
            result.tests.magicLink.message = '❌ Magic link API returned 500 (SERVER ERROR)';
          } else if (magicLinkStatusCode) {
            result.tests.magicLink.success = false;
            result.tests.magicLink.message = `⚠️  Magic link API returned ${magicLinkStatusCode}`;
          } else {
            result.tests.magicLink.success = false;
            result.tests.magicLink.message = '❌ No API response detected';
          }
        } else {
          result.tests.magicLink.message = 'Submit button not found';
          result.tests.magicLink.details.push('Submit button not visible');
        }
      } else {
        result.tests.magicLink.message = 'Email input not found';
        result.tests.magicLink.details.push('Email input not visible');
      }
    } catch (error: any) {
      result.tests.magicLink.message = `Error: ${error.message}`;
      result.tests.magicLink.details.push(`Exception: ${error.message}`);
    }

    // Final evaluation
    result.success = 
      result.tests.languageFilter.success &&
      result.tests.magicLink.success &&
      result.tests.consoleErrors.success;

  } catch (error: any) {
    console.error('❌ Test suite failed:', error.message);
  } finally {
    if (browser) {
      console.log('\n⏳ Keeping browser open for 10 seconds for manual inspection...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      await browser.close();
    }
  }

  return result;
}

// Run the test
(async () => {
  console.log('🧪 VOICES INTERACTIVE VALIDATION TEST\n');
  console.log('=' .repeat(60));
  
  const result = await runInteractiveValidation();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL RESULTS:\n');
  
  console.log('1️⃣  LANGUAGE FILTER:');
  console.log(`   Status: ${result.tests.languageFilter.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Message: ${result.tests.languageFilter.message}`);
  if (result.tests.languageFilter.details.length > 0) {
    console.log('   Details:');
    result.tests.languageFilter.details.forEach(d => console.log(`     - ${d}`));
  }
  
  console.log('\n2️⃣  MAGIC LINK LOGIN:');
  console.log(`   Status: ${result.tests.magicLink.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Message: ${result.tests.magicLink.message}`);
  console.log(`   Status Code: ${result.tests.magicLink.statusCode || 'N/A'}`);
  if (result.tests.magicLink.details.length > 0) {
    console.log('   Details:');
    result.tests.magicLink.details.forEach(d => console.log(`     - ${d}`));
  }
  
  console.log('\n3️⃣  CONSOLE ERRORS:');
  console.log(`   Status: ${result.tests.consoleErrors.success ? '✅ PASS' : '❌ FAIL'}`);
  if (result.tests.consoleErrors.errors.length > 0) {
    console.log(`   Errors (${result.tests.consoleErrors.errors.length}):`);
    result.tests.consoleErrors.errors.forEach(e => console.log(`     - ${e}`));
  } else {
    console.log('   No console errors detected');
  }
  
  console.log('\n📸 SCREENSHOTS:');
  result.screenshots.forEach(path => console.log(`   - ${path}`));
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n🎯 OVERALL: ${result.success ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`);
  console.log('='.repeat(60));
  
  process.exit(result.success ? 0 : 1);
})();
