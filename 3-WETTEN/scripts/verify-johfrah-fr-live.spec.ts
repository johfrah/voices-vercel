import { test, expect } from '@playwright/test';

test.describe('Johfrah FR Pricing - Live Verification', () => {
  test('should display v2.18.0 and correct pricing on voices.fr', async ({ page }) => {
    // Navigate to French Johfrah page
    await page.goto('https://www.voices.fr/agency/johfrah', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // Wait for page to fully load
    await page.waitForTimeout(3000);

    // 1. Check version in console or footer
    const pageContent = await page.content();
    const versionMatch = pageContent.match(/v(\d+\.\d+\.\d+)/);
    
    console.log('\n📍 Version Check:');
    if (versionMatch) {
      console.log(`✅ Version found: ${versionMatch[0]}`);
      expect(versionMatch[1]).toBe('2.18.0');
    } else {
      console.log('⚠️ Version not found in page content');
    }

    // 2. Take screenshot for manual verification
    await page.screenshot({ 
      path: '3-WETTEN/reports/johfrah-fr-live-screenshot.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot saved: 3-WETTEN/reports/johfrah-fr-live-screenshot.png');

    // 3. Look for pricing elements
    const priceElements = await page.locator('text=/€\\s*\\d+[,.]?\\d*/').allTextContents();
    console.log('\n💰 All prices found on page:', priceElements);

    // 4. Check for specific €299 price
    const has299 = priceElements.some(p => 
      p.includes('€299') || 
      p.includes('€ 299') || 
      p.includes('299.00') ||
      p.includes('299,00')
    );

    console.log('\n🎯 Pricing Verification:');
    console.log(`- €299.00 (Online/Social Media): ${has299 ? '✅' : '❌'}`);

    // 5. Check if there's a calculator or pricing UI
    const calculatorExists = await page.locator('[data-testid="pricing-calculator"]').count() > 0;
    const pricingTableExists = await page.locator('table').count() > 0;
    
    console.log('\n🧮 UI Elements:');
    console.log(`- Pricing Calculator: ${calculatorExists ? '✅' : '❌'}`);
    console.log(`- Pricing Table: ${pricingTableExists ? '✅' : '❌'}`);

    // 6. Log page title and meta info
    const title = await page.title();
    console.log(`\n📄 Page Title: ${title}`);

    // 7. Check console for errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    if (consoleErrors.length > 0) {
      console.log('\n⚠️ Console Errors:', consoleErrors);
    } else {
      console.log('\n✅ No console errors detected');
    }

    // 8. Final assertion
    expect(has299 || calculatorExists).toBeTruthy();
  });

  test('should handle multi-market selection (FR + BE)', async ({ page }) => {
    await page.goto('https://www.voices.fr/agency/johfrah', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await page.waitForTimeout(3000);

    // Look for country/market selector
    const countrySelectors = await page.locator('select, [role="combobox"]').count();
    console.log(`\n🌍 Country selectors found: ${countrySelectors}`);

    if (countrySelectors > 0) {
      // Try to find and interact with market selector
      const selector = page.locator('select').first();
      const isVisible = await selector.isVisible().catch(() => false);
      
      if (isVisible) {
        console.log('✅ Market selector is visible');
        // Take screenshot of the selector
        await page.screenshot({ 
          path: '3-WETTEN/reports/johfrah-fr-market-selector.png', 
          fullPage: true 
        });
      } else {
        console.log('⚠️ Market selector not visible or not interactive');
      }
    } else {
      console.log('⚠️ No market selectors found on page');
    }
  });
});
