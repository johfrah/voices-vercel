#!/usr/bin/env tsx
/**
 * CHRIS - FORENSIC VERIFICATION SCRIPT
 * Mission: Provide irrefutable proof that Orders API is fixed on production
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

const AUTO_LOGIN_URL = 'https://www.voices.be/?auto_login=b2dda905e581e6cea1daec513fe68bfebbefb1cfbc685f4ca8cade424fad0500&page=dashboard-orders';
const EXPECTED_VERSION = 'v2.16.016';

async function verifyOrdersLive() {
  console.log('🚀 CHRIS - FORENSIC VERIFICATION INITIATED\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📍 Step 1: Navigating to auto-login URL...');
    await page.goto(AUTO_LOGIN_URL, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for page to stabilize
    await page.waitForTimeout(2000);
    
    console.log('📍 Step 2: Checking version...');
    
    // Try to get version from multiple sources
    let version = await page.evaluate(() => {
      // Check window object
      if ((window as any).__VOICES_VERSION__) {
        return (window as any).__VOICES_VERSION__;
      }
      
      // Check meta tag
      const metaVersion = document.querySelector('meta[name="version"]');
      if (metaVersion) {
        return metaVersion.getAttribute('content');
      }
      
      // Check footer or any visible version
      const versionElement = document.querySelector('[data-version]');
      if (versionElement) {
        return versionElement.getAttribute('data-version');
      }
      
      return null;
    });
    
    // If not found in DOM, check via API
    if (!version) {
      console.log('   Version not found in DOM, checking API...');
      const apiResponse = await page.goto('https://www.voices.be/api/admin/config', { waitUntil: 'networkidle' });
      const apiData = await apiResponse?.json();
      version = apiData?._version || apiData?.version;
    }
    
    console.log(`   ✅ Version detected: ${version}`);
    
    if (version !== EXPECTED_VERSION) {
      console.log(`   ⚠️  Version mismatch! Expected ${EXPECTED_VERSION}, got ${version}`);
      console.log('   Waiting 30s for deployment to complete...');
      await page.waitForTimeout(30000);
      await page.reload({ waitUntil: 'networkidle' });
      
      // Re-check version
      version = await page.evaluate(() => (window as any).__VOICES_VERSION__);
      console.log(`   Version after refresh: ${version}`);
    }
    
    console.log('\n📍 Step 3: Monitoring network for /api/admin/orders...');
    
    // Listen for the API call
    let apiStatus = 0;
    let apiResponse: any = null;
    
    page.on('response', async (response) => {
      if (response.url().includes('/api/admin/orders')) {
        apiStatus = response.status();
        console.log(`   📡 API Response: ${apiStatus} ${response.statusText()}`);
        
        if (apiStatus === 200) {
          try {
            apiResponse = await response.json();
          } catch (e) {
            console.log('   ⚠️  Could not parse API response');
          }
        }
      }
    });
    
    // Navigate back to orders page to trigger API call
    await page.goto(AUTO_LOGIN_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    console.log('\n📍 Step 4: Extracting order details from UI...');
    
    // Wait for orders to load
    await page.waitForSelector('[data-testid="orders-list"], .orders-container, table', { timeout: 10000 });
    
    const orderDetails = await page.evaluate(() => {
      // Try multiple selectors to find order data
      const firstRow = document.querySelector('tbody tr:first-child, [data-order-id]:first-child, .order-item:first-child');
      
      if (!firstRow) {
        return { error: 'No orders found in DOM' };
      }
      
      // Extract text content from first row
      const cells = Array.from(firstRow.querySelectorAll('td, [data-cell]'));
      const textContent = cells.map(cell => cell.textContent?.trim()).filter(Boolean);
      
      // Try to find specific data attributes
      const orderId = firstRow.getAttribute('data-order-id') || 
                      firstRow.querySelector('[data-order-id]')?.getAttribute('data-order-id');
      
      return {
        orderId,
        rowText: textContent.join(' | '),
        fullHTML: firstRow.innerHTML.substring(0, 500)
      };
    });
    
    console.log('   📦 First Order Details:');
    console.log(`      Order ID: ${orderDetails.orderId || 'Not found'}`);
    console.log(`      Row Text: ${orderDetails.rowText || 'Not found'}`);
    
    console.log('\n📍 Step 5: Taking screenshot...');
    const screenshotPath = join(process.cwd(), '3-WETTEN', 'reports', `orders-verification-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`   📸 Screenshot saved: ${screenshotPath}`);
    
    // Get console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 VERIFICATION REPORT');
    console.log('='.repeat(80));
    console.log(`Version: ${version}`);
    console.log(`API Status: ${apiStatus} ${apiStatus === 200 ? '✅ OK' : '❌ FAILED'}`);
    console.log(`Orders Found: ${orderDetails.orderId ? '✅ YES' : '❌ NO'}`);
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Screenshot: ${screenshotPath}`);
    
    if (apiResponse?.orders?.length > 0) {
      const firstOrder = apiResponse.orders[0];
      console.log(`\nFirst Order from API:`);
      console.log(`  - Order #: ${firstOrder.order_number || firstOrder.id}`);
      console.log(`  - Date: ${firstOrder.created_at}`);
      console.log(`  - Customer: ${firstOrder.customer_name || firstOrder.billing_first_name + ' ' + firstOrder.billing_last_name}`);
    }
    
    console.log('='.repeat(80));
    
    // Write detailed report
    const reportPath = join(process.cwd(), '3-WETTEN', 'reports', `orders-verification-${Date.now()}.json`);
    writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      version,
      apiStatus,
      apiResponse: apiResponse ? { count: apiResponse.orders?.length, sample: apiResponse.orders?.[0] } : null,
      orderDetails,
      consoleErrors,
      screenshotPath
    }, null, 2));
    
    console.log(`\n📄 Full report: ${reportPath}`);
    
    if (apiStatus === 200 && version === EXPECTED_VERSION) {
      console.log('\n✅ VERIFIED LIVE: Orders API is FIXED on production!');
      process.exit(0);
    } else {
      console.log('\n❌ VERIFICATION FAILED');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ VERIFICATION ERROR:', error);
    
    // Take error screenshot
    const errorScreenshotPath = join(process.cwd(), '3-WETTEN', 'reports', `orders-error-${Date.now()}.png`);
    await page.screenshot({ path: errorScreenshotPath, fullPage: true });
    console.log(`📸 Error screenshot: ${errorScreenshotPath}`);
    
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyOrdersLive();
