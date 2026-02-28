import { chromium } from 'playwright';

async function testAutoLoginOrders() {
  console.log('🚀 Starting auto-login orders dashboard test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // Navigate to auto-login URL
    console.log('📍 Navigating to auto-login URL...');
    await page.goto('https://www.voices.be/?auto_login=b2dda905e581e6cea1daec513fe68bfebbefb1cfbc685f4ca8cade424fad0500&page=dashboard-orders', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for loading to finish
    console.log('⏳ Waiting for "Voices laden..." to finish...');
    await page.waitForTimeout(3000);

    // Check for loading spinner
    const loadingSpinner = page.locator('text=Voices laden...');
    if (await loadingSpinner.isVisible().catch(() => false)) {
      console.log('   Waiting for spinner to disappear...');
      await loadingSpinner.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {
        console.log('   Spinner still visible, continuing anyway...');
      });
    }

    // Wait a bit more for data to load
    await page.waitForTimeout(2000);

    // Check current URL
    const currentUrl = page.url();
    console.log(`\n✅ Current URL: ${currentUrl}`);

    // Check for version in console or UI
    console.log('\n🔍 Checking version...');
    
    // Try multiple methods to get version
    const versionChecks = await page.evaluate(() => {
      // Check window object
      const windowVersion = (window as any).__VOICES_VERSION__ || (window as any).VOICES_VERSION;
      
      // Check meta tags
      const metaVersion = document.querySelector('meta[name="version"]')?.getAttribute('content');
      
      // Check data attributes
      const dataVersion = document.querySelector('[data-version]')?.getAttribute('data-version');
      
      // Check localStorage
      const localVersion = localStorage.getItem('voices_version');
      
      return {
        window: windowVersion,
        meta: metaVersion,
        data: dataVersion,
        local: localVersion
      };
    });
    
    console.log(`   Version checks:`, JSON.stringify(versionChecks, null, 2));
    
    const detectedVersion = versionChecks.window || versionChecks.meta || versionChecks.data || versionChecks.local;
    if (detectedVersion) {
      console.log(`   ✅ Detected version: ${detectedVersion}`);
    } else {
      console.log(`   ⚠️  No version found in standard locations`);
    }

    // Check for orders list
    console.log('\n🔍 Checking for orders list...');
    
    // Look for common order list indicators
    const orderSelectors = [
      '[data-testid="order-list"]',
      '[class*="order"]',
      'table tbody tr',
      '[role="table"]',
      'text=#'
    ];

    let ordersFound = false;
    let orderDetail = '';

    for (const selector of orderSelectors) {
      const elements = await page.locator(selector).all();
      if (elements.length > 0) {
        console.log(`   Found ${elements.length} elements matching: ${selector}`);
        
        // Try to get specific order details
        const firstElement = elements[0];
        const text = await firstElement.textContent().catch(() => '');
        if (text && text.includes('#')) {
          orderDetail = text.substring(0, 100);
          ordersFound = true;
          break;
        }
      }
    }

    if (ordersFound) {
      console.log(`   ✅ Orders visible! Detail: "${orderDetail}"`);
    } else {
      console.log('   ⚠️  No orders found with standard selectors');
    }

    // Check for 500 errors in network
    console.log('\n🔍 Checking for API errors...');
    let has500Error = false;
    
    page.on('response', response => {
      if (response.url().includes('/api/admin/orders') && response.status() === 500) {
        has500Error = true;
        console.log(`   ❌ 500 error detected on ${response.url()}`);
      }
    });

    // Trigger a fresh API call
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    if (!has500Error) {
      console.log('   ✅ No 500 errors detected on /api/admin/orders');
    }

    // Take screenshot
    await page.screenshot({ path: '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/scripts/test-screenshot.png', fullPage: true });
    console.log('\n📸 Screenshot saved to 3-WETTEN/scripts/test-screenshot.png');

    // Get actual order data from the page
    const orderData = await page.evaluate(() => {
      // Try to find order rows in table
      const rows = Array.from(document.querySelectorAll('tr[data-order-id], [class*="order-row"], tbody tr'));
      
      const orders = rows.slice(0, 5).map(row => {
        const text = row.textContent || '';
        // Look for order number pattern
        const orderMatch = text.match(/#(\d{4,})/);
        // Look for company/client name (usually after order number)
        const parts = text.split(/\s+/).filter(p => p.length > 2);
        return {
          orderNumber: orderMatch ? orderMatch[0] : null,
          snippet: parts.slice(0, 10).join(' ').substring(0, 100)
        };
      }).filter(o => o.orderNumber);
      
      return orders;
    });
    
    if (orderData.length > 0) {
      console.log(`\n✅ FOUND ${orderData.length} ORDERS:`);
      orderData.forEach(order => {
        console.log(`   ${order.orderNumber}: ${order.snippet}`);
      });
    } else {
      console.log(`\n⚠️  No orders found in table structure`);
      
      // Fallback: get raw text
      const pageText = await page.textContent('body').catch(() => '');
      const orderMatches = pageText.match(/#\d{4,}/g);
      if (orderMatches && orderMatches.length > 0) {
        console.log(`   Found order numbers in page: ${[...new Set(orderMatches)].slice(0, 5).join(', ')}`);
      }
    }

    console.log('\n✅ Test completed successfully!');
    console.log('\n⏸️  Browser will remain open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await page.screenshot({ path: '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/scripts/test-error-screenshot.png' });
  } finally {
    await browser.close();
    console.log('\n🏁 Browser closed.');
  }
}

testAutoLoginOrders();
