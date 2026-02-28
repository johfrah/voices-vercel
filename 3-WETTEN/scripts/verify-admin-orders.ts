import { chromium } from 'playwright';

async function verifyAdminOrders() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🚀 Navigating to https://www.voices.be/admin/orders/...');
  
  try {
    // Navigate to the admin orders page
    const response = await page.goto('https://www.voices.be/admin/orders/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log(`📊 Response status: ${response?.status()}`);
    console.log(`📍 Final URL: ${page.url()}`);

    // Check if we got a 500 error
    if (response?.status() === 500) {
      console.error('❌ FAILED: Page returned 500 error');
      await browser.close();
      return;
    }

    // Wait a bit for the page to load
    await page.waitForTimeout(3000);

    // Get the page HTML to see what's actually there
    const bodyText = await page.locator('body').textContent();
    console.log(`📄 Page content preview: ${bodyText?.substring(0, 200)}...`);

    // Check if we're on a login page
    const isLoginPage = await page.locator('input[type="password"]').count() > 0;
    if (isLoginPage) {
      console.log('🔐 Login required - session not active');
      await browser.close();
      return;
    }

    // Check for loading state
    const loadingText = await page.locator('text=Voices laden').count();
    if (loadingText > 0) {
      console.log('⏳ Waiting for API response...');
      await page.waitForTimeout(8000);
    }

    // Check for error messages
    const errorText = await page.locator('text=/error|Error|500/i').count();
    if (errorText > 0) {
      const errors = await page.locator('text=/error|Error|500/i').allTextContents();
      console.log(`⚠️ Errors found: ${errors.join(', ')}`);
    }

    // Try to find the version in the page
    const versionElement = await page.locator('[data-version]').first();
    const version = await versionElement.getAttribute('data-version').catch(() => null);
    
    if (version) {
      console.log(`📦 Version found: ${version}`);
      if (version === 'v2.16.006') {
        console.log('✅ Version matches v2.16.006');
      } else {
        console.log(`⚠️ Version mismatch: expected v2.16.006, got ${version}`);
      }
    }

    // Check console for version
    page.on('console', msg => {
      if (msg.text().includes('v2.16')) {
        console.log(`🖥️ Console version: ${msg.text()}`);
      }
    });

    // Look for orders in the table
    const ordersTable = await page.locator('table').count();
    console.log(`📋 Tables found: ${ordersTable}`);

    // Try to find order rows
    const orderRows = await page.locator('tr').count();
    console.log(`📊 Table rows found: ${orderRows}`);

    // Try different selectors for order numbers
    const orderNumbers1 = await page.locator('text=/^#\\d+/').allTextContents();
    const orderNumbers2 = await page.locator('text=/#\\d+/').allTextContents();
    const orderNumbers3 = await page.getByText(/#\d+/).allTextContents();
    
    console.log(`🔍 Order pattern 1: ${orderNumbers1.length} matches`);
    console.log(`🔍 Order pattern 2: ${orderNumbers2.length} matches`);
    console.log(`🔍 Order pattern 3: ${orderNumbers3.length} matches`);

    if (orderNumbers2.length > 0) {
      console.log(`✅ Orders visible: ${orderNumbers2.slice(0, 5).join(', ')}`);
    } else {
      console.log('⚠️ No order numbers found');
    }

    // Look for any divs or cards that might contain orders
    const cards = await page.locator('[class*="card"]').count();
    const items = await page.locator('[class*="item"]').count();
    console.log(`📦 Cards found: ${cards}, Items found: ${items}`);

    // Take a screenshot
    await page.screenshot({ path: '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/scripts/admin-orders-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved');

    // Get page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Wait a bit before closing
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

verifyAdminOrders();
