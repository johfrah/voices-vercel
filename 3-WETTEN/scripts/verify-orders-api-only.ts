#!/usr/bin/env tsx
/**
 * CHRIS - SIMPLIFIED API VERIFICATION
 * Focus: Verify the /api/admin/orders endpoint returns 200 OK
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

const AUTO_LOGIN_URL = 'https://www.voices.be/?auto_login=b2dda905e581e6cea1daec513fe68bfebbefb1cfbc685f4ca8cade424fad0500';
const ORDERS_URL = 'https://www.voices.be/admin/orders';

async function verifyOrdersAPI() {
  console.log('🚀 CHRIS - API VERIFICATION (Simplified)\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const apiCalls: Array<{url: string, status: number, statusText: string, data?: any}> = [];
  const consoleMessages: Array<{type: string, text: string}> = [];
  
  // Capture all API calls
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/admin/')) {
      const status = response.status();
      const statusText = response.statusText();
      
      console.log(`   📡 ${status} ${url.split('/api/')[1]}`);
      
      let data = null;
      if (status === 200 && response.headers()['content-type']?.includes('application/json')) {
        try {
          data = await response.json();
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      apiCalls.push({ url, status, statusText, data });
    }
  });
  
  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });
    
    if (type === 'error') {
      console.log(`   ❌ Console Error: ${text}`);
    }
  });
  
  try {
    console.log('📍 Step 1: Auto-login...');
    await page.goto(AUTO_LOGIN_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    console.log('📍 Step 2: Navigate to /admin/orders...');
    await page.goto(ORDERS_URL, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for API calls to complete
    await page.waitForTimeout(5000);
    
    console.log('\n📍 Step 3: Checking version...');
    const version = await page.evaluate(() => {
      return (window as any).__VOICES_VERSION__ || 
             document.querySelector('meta[name="version"]')?.getAttribute('content') ||
             'unknown';
    });
    console.log(`   Version: ${version}`);
    
    console.log('\n📍 Step 4: Taking screenshot...');
    const screenshotPath = join(process.cwd(), '3-WETTEN', 'reports', `orders-api-verification-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`   📸 ${screenshotPath}`);
    
    // Analyze results
    console.log('\n' + '='.repeat(80));
    console.log('🎯 VERIFICATION REPORT');
    console.log('='.repeat(80));
    console.log(`Version: ${version}`);
    console.log(`\nAPI Calls Captured: ${apiCalls.length}`);
    
    const ordersCall = apiCalls.find(call => call.url.includes('/api/admin/orders'));
    
    if (ordersCall) {
      console.log(`\n📡 /api/admin/orders:`);
      console.log(`   Status: ${ordersCall.status} ${ordersCall.statusText}`);
      
      if (ordersCall.status === 200) {
        console.log(`   ✅ SUCCESS - API returned 200 OK`);
        
        if (ordersCall.data) {
          const orderCount = ordersCall.data.orders?.length || 0;
          console.log(`   Orders returned: ${orderCount}`);
          
          if (orderCount > 0) {
            const firstOrder = ordersCall.data.orders[0];
            console.log(`\n   First Order:`);
            console.log(`   - Order #: ${firstOrder.order_number || firstOrder.id}`);
            console.log(`   - Date: ${firstOrder.created_at}`);
            console.log(`   - World: ${firstOrder.world_id || 'N/A'}`);
            console.log(`   - Customer: ${firstOrder.customer_name || firstOrder.billing_first_name + ' ' + firstOrder.billing_last_name}`);
          }
        }
      } else {
        console.log(`   ❌ FAILED - Expected 200, got ${ordersCall.status}`);
      }
    } else {
      console.log(`\n⚠️  WARNING: /api/admin/orders call not detected`);
      console.log(`   Captured API calls:`);
      apiCalls.forEach(call => {
        console.log(`   - ${call.status} ${call.url.split('/api/')[1]}`);
      });
    }
    
    const errorCount = consoleMessages.filter(m => m.type === 'error').length;
    console.log(`\nConsole Errors: ${errorCount}`);
    
    if (errorCount > 0) {
      console.log(`\nError Messages:`);
      consoleMessages.filter(m => m.type === 'error').slice(0, 5).forEach(m => {
        console.log(`   - ${m.text}`);
      });
    }
    
    console.log('='.repeat(80));
    
    // Write report
    const reportPath = join(process.cwd(), '3-WETTEN', 'reports', `orders-api-verification-${Date.now()}.json`);
    writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      version,
      apiCalls: apiCalls.map(c => ({ url: c.url, status: c.status, dataKeys: c.data ? Object.keys(c.data) : [] })),
      ordersCall: ordersCall ? {
        status: ordersCall.status,
        orderCount: ordersCall.data?.orders?.length || 0,
        sampleOrder: ordersCall.data?.orders?.[0]
      } : null,
      consoleErrors: consoleMessages.filter(m => m.type === 'error').map(m => m.text),
      screenshotPath
    }, null, 2));
    
    console.log(`\n📄 Full report: ${reportPath}`);
    
    if (ordersCall?.status === 200) {
      console.log('\n✅ VERIFIED: Orders API is working on production!');
      process.exit(0);
    } else {
      console.log('\n❌ VERIFICATION FAILED: Orders API did not return 200 OK');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error);
    
    const errorScreenshotPath = join(process.cwd(), '3-WETTEN', 'reports', `orders-api-error-${Date.now()}.png`);
    await page.screenshot({ path: errorScreenshotPath, fullPage: true });
    console.log(`📸 Error screenshot: ${errorScreenshotPath}`);
    
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyOrdersAPI();
