import { test, expect } from '@playwright/test';

test.describe('Ademing.be Quality & Functionality Audit', () => {
  const baseUrl = 'https://www.ademing.be';

  test('1. Visual Identity & Branding', async ({ page }) => {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    
    // Check Favicon (Green/Leaf)
    const favicon = await page.locator('link[rel="icon"], link[rel="shortcut icon"]').first();
    const faviconHref = await favicon.getAttribute('href');
    console.log(`Favicon Href: ${faviconHref}`);
    expect(faviconHref).toContain('ademing');

    // Check Theme Color (Green)
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    });
    console.log(`Primary Theme Color (HSL): ${primaryColor}`);
    // Expected: 160 28% 48% (Green)
    expect(primaryColor).toContain('160');
  });

  test('2. Navigation & Sidebar', async ({ page }) => {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    
    // Check Hamburger Menu
    const menuButton = page.locator('button').filter({ has: page.locator('svg.lucide-menu') });
    await expect(menuButton).toBeVisible();
    
    // Open Sidebar
    await menuButton.click();
    const sidebar = page.locator('[role="dialog"]'); // SheetContent usually has role dialog
    await expect(sidebar).toBeVisible();
    
    // Check Navigation Items
    await expect(sidebar.getByText('Home')).toBeVisible();
    await expect(sidebar.getByText('Bibliotheek')).toBeVisible();
    await expect(sidebar.getByText('Favorieten')).toBeVisible();
    await expect(sidebar.getByText('Mijn Ademing')).toBeVisible();
  });

  test('3. Page Routing (Sub-pages)', async ({ page }) => {
    // Test Bibliotheek
    await page.goto(`${baseUrl}/bibliotheek`, { waitUntil: 'networkidle' });
    await expect(page.getByText('Bibliotheek')).toBeVisible();
    
    // Test Favorieten
    await page.goto(`${baseUrl}/favorieten`, { waitUntil: 'networkidle' });
    await expect(page.getByText('Favorieten')).toBeVisible();

    // Test Mijn Ademing (Persistence Check)
    await page.goto(`${baseUrl}/mijn-ademing`, { waitUntil: 'networkidle' });
    await expect(page.getByText('Mijn Ademing')).toBeVisible();
    expect(page.url()).not.toContain('voices.be/account');
  });

  test('4. Breathing Instrument & Animations', async ({ page }) => {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    
    // Scroll to Breathing Instrument
    const breathingSection = page.locator('section').filter({ hasText: 'Neem even een bewuste adem' });
    await breathingSection.scrollIntoViewIfNeeded();
    
    // Check for animations (breathe-glow)
    const glowElement = page.locator('.animate-breathe-glow').first();
    await expect(glowElement).toBeVisible();
  });

  test('5. Console Errors & Performance', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    
    if (errors.length > 0) {
      console.log('Detected Console Errors:');
      errors.forEach(err => console.log(`- ${err}`));
    }
    
    // We expect 0 critical ReferenceErrors (User/SectionInstrument fixes)
    const criticalErrors = errors.filter(err => err.includes('is not defined'));
    expect(criticalErrors.length).toBe(0);
  });
});
