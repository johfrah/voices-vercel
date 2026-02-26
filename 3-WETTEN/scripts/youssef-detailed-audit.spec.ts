import { test, expect } from '@playwright/test';

test.describe('Youssef Zaki Artist Page - Detailed Audit', () => {
  const artistUrl = 'https://www.voices.be/artist/youssef/';

  test('Complete Page Audit with Element Detection', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    console.log('🚀 Navigating to Youssef artist page...');
    try {
      await page.goto(artistUrl, { waitUntil: 'commit', timeout: 30000 });
      console.log('   ✓ Initial navigation committed');
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      console.log('   ✓ DOM content loaded');
    } catch (error) {
      console.error('   ❌ Navigation error:', error.message);
      // Take screenshot of error state
      await page.screenshot({ 
        path: '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/scripts/youssef-error-screenshot.png',
        fullPage: false 
      });
      throw error;
    }
    
    // Wait for React to hydrate
    await page.waitForTimeout(3000);

    console.log('\n📸 Taking initial screenshot...');
    await page.screenshot({ 
      path: '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/scripts/youssef-detailed-screenshot.png',
      fullPage: true 
    });

    // 1. Check page title and meta
    console.log('\n✅ Step 1: Page Metadata');
    const title = await page.title();
    console.log(`   Title: "${title}"`);
    
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    console.log(`   OG Title: "${ogTitle || 'NOT SET'}"`);

    // 2. Check for main heading
    console.log('\n✅ Step 2: Main Heading');
    const h1Elements = await page.locator('h1').all();
    console.log(`   Found ${h1Elements.length} h1 elements`);
    for (const h1 of h1Elements) {
      const text = await h1.textContent();
      console.log(`   - "${text?.trim()}"`);
    }

    // 3. Check for donation goal specifically
    console.log('\n✅ Step 3: Donation Goal Detection');
    const bodyHTML = await page.locator('body').innerHTML();
    
    // Check various patterns
    const patterns = ['10500', '€10500', '€10.500', 'donation_goal', 'crowdfunding'];
    for (const pattern of patterns) {
      if (bodyHTML.includes(pattern)) {
        console.log(`   ✓ Found pattern: "${pattern}"`);
      }
    }

    // Try to find the support section
    const supportSection = page.locator('#support');
    const supportExists = await supportSection.count() > 0;
    console.log(`   Support section exists: ${supportExists}`);
    
    if (supportExists) {
      const supportText = await supportSection.textContent();
      console.log(`   Support section text (first 200 chars): "${supportText?.substring(0, 200)}"`);
    }

    // 4. Check for specific donation elements
    console.log('\n✅ Step 4: Donation UI Elements');
    
    // Check for the goal text
    const goalElements = await page.locator('text=/goal|doel/i').all();
    console.log(`   Found ${goalElements.length} elements with "goal/doel"`);
    for (const el of goalElements.slice(0, 3)) {
      const text = await el.textContent();
      console.log(`   - "${text?.trim()}"`);
    }

    // Check for amount displays
    const amountElements = await page.locator('text=/€\\d+/').all();
    console.log(`   Found ${amountElements.length} elements with currency amounts`);
    for (const el of amountElements.slice(0, 5)) {
      const text = await el.textContent();
      console.log(`   - "${text?.trim()}"`);
    }

    // 5. Check for donate/support buttons
    console.log('\n✅ Step 5: Action Buttons');
    const buttons = await page.locator('button').all();
    console.log(`   Found ${buttons.length} total buttons`);
    
    for (const button of buttons) {
      const text = await button.textContent();
      const textLower = text?.toLowerCase() || '';
      if (textLower.includes('donate') || textLower.includes('doneer') || textLower.includes('support') || textLower.includes('steun')) {
        console.log(`   ✓ Found action button: "${text?.trim()}"`);
      }
    }

    // 6. Check for video player
    console.log('\n✅ Step 6: Video Player');
    const videoElements = await page.locator('video').all();
    console.log(`   Found ${videoElements.length} video elements`);
    
    for (const video of videoElements) {
      const src = await video.getAttribute('src');
      const poster = await video.getAttribute('poster');
      console.log(`   - Video src: ${src || 'NOT SET'}`);
      console.log(`   - Poster: ${poster || 'NOT SET'}`);
    }

    // 7. Check for donor list
    console.log('\n✅ Step 7: Donor List');
    const donorText = await page.locator('text=/supporter|donor|steun/i').first();
    const donorExists = await donorText.count() > 0;
    console.log(`   Donor section exists: ${donorExists}`);

    // 8. Console errors
    console.log('\n🔍 Step 8: Console & Page Errors');
    if (consoleErrors.length > 0) {
      console.log('   ⚠️  Console Errors:');
      consoleErrors.forEach(err => console.log(`     - ${err}`));
    } else {
      console.log('   ✅ No console errors');
    }

    if (pageErrors.length > 0) {
      console.log('   ⚠️  Page Errors:');
      pageErrors.forEach(err => console.log(`     - ${err}`));
    } else {
      console.log('   ✅ No page errors');
    }

    // 9. Final summary
    console.log('\n📋 AUDIT SUMMARY:');
    console.log('   ✅ Page loaded successfully');
    console.log(`   ✅ Title: ${title}`);
    console.log(`   ✅ H1 elements: ${h1Elements.length}`);
    console.log(`   ✅ Video elements: ${videoElements.length}`);
    console.log(`   ✅ Total buttons: ${buttons.length}`);
    console.log(`   ✅ Support section: ${supportExists ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`   ✅ Console errors: ${consoleErrors.length}`);
    console.log(`   ✅ Page errors: ${pageErrors.length}`);

    // Take final screenshot
    await page.screenshot({ 
      path: '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/scripts/youssef-detailed-final.png',
      fullPage: true 
    });

    // No hard assertions - this is an audit
    expect(h1Elements.length).toBeGreaterThan(0);
  });
});
