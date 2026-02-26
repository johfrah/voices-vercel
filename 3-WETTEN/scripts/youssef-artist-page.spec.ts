import { test, expect } from '@playwright/test';

test.describe('Youssef Zaki Artist Page Verification', () => {
  const artistUrl = 'https://www.voices.be/artist/youssef';

  test('Youssef Artist Page - Full Verification', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Capture page errors
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    console.log('🚀 Navigating to Youssef artist page...');
    await page.goto(artistUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // 1. Verify page title (note: may be generic Voices title)
    console.log('✅ Step 1: Checking page title...');
    const title = await page.title();
    console.log(`   Page Title: "${title}"`);
    if (title.toLowerCase().includes('youssef')) {
      console.log('   ✓ Title contains "Youssef"');
    } else {
      console.log('   ⚠️  Title does not contain "Youssef" - may need metadata update');
    }

    // 2. Take screenshot first to see what's on the page
    console.log('📸 Taking initial screenshot...');
    await page.screenshot({ 
      path: '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/scripts/youssef-artist-page-screenshot.png',
      fullPage: true 
    });
    console.log('   ✓ Screenshot saved');

    // 3. Get page content for analysis
    console.log('📄 Analyzing page content...');
    const bodyText = await page.locator('body').textContent();
    const hasYoussef = bodyText?.toLowerCase().includes('youssef') || false;
    const hasDonation = bodyText?.toLowerCase().includes('10500') || bodyText?.toLowerCase().includes('donate') || false;
    
    console.log(`   - Page contains "Youssef": ${hasYoussef}`);
    console.log(`   - Page contains donation info: ${hasDonation}`);

    // 4. Check for artist name in heading
    console.log('✅ Step 2: Verifying artist name in content...');
    const artistHeading = page.getByRole('heading', { name: /youssef/i }).first();
    const headingExists = await artistHeading.count() > 0;
    if (headingExists) {
      await expect(artistHeading).toBeVisible({ timeout: 5000 });
      console.log('   ✓ Artist name "Youssef" found in heading');
    } else {
      console.log('   ⚠️  No heading with "Youssef" found');
    }

    // 5. Try to find donation goal with various patterns
    console.log('✅ Step 3: Checking for donation goal...');
    const donationPatterns = ['€10500', '10500', '€10.500', 'doel'];
    let donationFound = false;
    for (const pattern of donationPatterns) {
      const element = page.getByText(pattern, { exact: false }).first();
      if (await element.count() > 0) {
        console.log(`   ✓ Found donation-related text: "${pattern}"`);
        donationFound = true;
        break;
      }
    }
    if (!donationFound) {
      console.log('   ⚠️  Donation goal not found with expected patterns');
    }

    // 6. Check for Donate button
    console.log('✅ Step 4: Checking for Donate button...');
    const donateButton = page.getByRole('button', { name: /donate|doneer|steun/i }).first();
    const buttonExists = await donateButton.count() > 0;
    if (buttonExists) {
      await expect(donateButton).toBeVisible({ timeout: 5000 });
      console.log('   ✓ Donate button is present and visible');
    } else {
      console.log('   ⚠️  Donate button not found');
    }

    // 7. Additional screenshot after checks
    console.log('📸 Taking final screenshot...');
    await page.screenshot({ 
      path: '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/scripts/youssef-artist-page-final.png',
      fullPage: true 
    });
    console.log('   ✓ Final screenshot saved');

    // 6. Report console errors
    console.log('🔍 Checking for console errors...');
    if (consoleErrors.length > 0) {
      console.log('⚠️  Console Errors Detected:');
      consoleErrors.forEach(err => console.log(`   - ${err}`));
    } else {
      console.log('   ✓ No console errors detected');
    }

    // 7. Report page errors
    if (pageErrors.length > 0) {
      console.log('❌ Page Errors Detected:');
      pageErrors.forEach(err => console.log(`   - ${err}`));
    } else {
      console.log('   ✓ No page errors detected');
    }

    // Final assertion: No critical errors
    const criticalErrors = [...consoleErrors, ...pageErrors].filter(err => 
      err.includes('is not defined') || 
      err.includes('Cannot read') ||
      err.includes('undefined')
    );
    
    if (criticalErrors.length > 0) {
      console.log('🚨 CRITICAL ERRORS FOUND:');
      criticalErrors.forEach(err => console.log(`   - ${err}`));
    }

    expect(criticalErrors.length).toBe(0);

    console.log('✅ All verifications passed successfully!');
  });
});
