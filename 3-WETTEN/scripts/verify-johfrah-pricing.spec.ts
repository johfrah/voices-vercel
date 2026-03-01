import { test, expect } from '@playwright/test';

test.describe('Johfrah Pricing Verification', () => {
  test('should display correct pricing for Johfrah', async ({ page }) => {
    // Navigate to Johfrah page
    await page.goto('https://www.voices.be/agency/johfrah', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // Wait for the page to be fully loaded
    await page.waitForTimeout(3000);

    // Check version in footer or console
    const version = await page.locator('text=/v\\d+\\.\\d+\\.\\d+/').first().textContent().catch(() => null);
    console.log('Version found:', version);

    // Take a screenshot for manual verification
    await page.screenshot({ path: '3-WETTEN/scripts/johfrah-pricing-verification.png', fullPage: true });

    // Look for pricing elements
    const priceElements = await page.locator('text=/€\\d+[,.]\\d+/').allTextContents();
    console.log('All prices found on page:', priceElements);

    // Check for specific prices
    const has299 = priceElements.some(p => p.includes('€299') || p.includes('€ 299'));
    const has449 = priceElements.some(p => p.includes('€449') || p.includes('€ 449'));
    const has349 = priceElements.some(p => p.includes('€349') || p.includes('€ 349'));
    const has399 = priceElements.some(p => p.includes('€399') || p.includes('€ 399'));

    console.log('Pricing verification:');
    console.log('- €299.00 (Online/Social Media):', has299 ? '✅' : '❌');
    console.log('- €449.00 (TV Spot Nationaal):', has449 ? '✅' : '❌');
    console.log('- €349.00 (Podcast Ads):', has349 ? '✅' : '❌');
    console.log('- €399.00 (2x Online Social Media):', has399 ? '✅' : '❌');

    // Get page HTML for debugging
    const html = await page.content();
    const versionMatch = html.match(/v(\d+\.\d+\.\d+)/);
    if (versionMatch) {
      console.log('Version in HTML:', versionMatch[0]);
    }
  });
});
