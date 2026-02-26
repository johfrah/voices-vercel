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
    await page.goto(artistUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // 1. Verify page title contains "Youssef Zaki"
    console.log('✅ Step 1: Verifying page title...');
    const title = await page.title();
    console.log(`   Page Title: "${title}"`);
    expect(title.toLowerCase()).toContain('youssef');

    // 2. Verify donation goal of "€10500" is visible
    console.log('✅ Step 2: Verifying donation goal...');
    const donationGoal = page.getByText('€10500', { exact: false });
    await expect(donationGoal).toBeVisible({ timeout: 10000 });
    console.log('   ✓ Donation goal €10500 is visible');

    // 3. Verify "Donate" button is present
    console.log('✅ Step 3: Verifying Donate button...');
    const donateButton = page.getByRole('button', { name: /donate|doneer/i });
    await expect(donateButton).toBeVisible({ timeout: 10000 });
    console.log('   ✓ Donate button is present and visible');

    // 4. Additional verification: Check for artist name in heading
    console.log('✅ Step 4: Verifying artist name in content...');
    const artistHeading = page.getByRole('heading', { name: /youssef/i });
    await expect(artistHeading).toBeVisible({ timeout: 10000 });
    console.log('   ✓ Artist name "Youssef" found in heading');

    // 5. Take screenshot for visual verification
    console.log('📸 Taking screenshot for visual integrity...');
    await page.screenshot({ 
      path: '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/scripts/youssef-artist-page-screenshot.png',
      fullPage: true 
    });
    console.log('   ✓ Screenshot saved to: 3-WETTEN/scripts/youssef-artist-page-screenshot.png');

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
