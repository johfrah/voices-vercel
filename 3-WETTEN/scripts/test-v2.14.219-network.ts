#!/usr/bin/env tsx
/**
 * 🧪 TEST v2.14.219 - Network Analysis
 * 
 * Detailed network monitoring for magic link request
 */

import { chromium } from 'playwright';

async function testNetworkBehavior() {
  console.log('🚀 Starting network analysis test for v2.14.219\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  let detectedVersion = '';
  const networkRequests: Array<{url: string, method: string, status?: number, timing: number}> = [];
  const consoleLogs: string[] = [];
  let testStartTime = Date.now();
  
  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    const elapsed = Date.now() - testStartTime;
    consoleLogs.push(`[${elapsed}ms] ${text}`);
    
    if (text.includes('Nuclear Version:')) {
      const match = text.match(/v([\d.]+)/);
      if (match) {
        detectedVersion = match[1];
        console.log(`✅ Version detected: v${detectedVersion}`);
      }
    }
    
    if (text.includes('LoginPage') || text.includes('API') || text.includes('auth')) {
      console.log(`[${elapsed}ms] ${text}`);
    }
    
    if (text.includes('timeout') || text.includes('10') || text.includes('second')) {
      console.log(`⏰ TIMEOUT MESSAGE: ${text}`);
    }
  });
  
  // Capture ALL network requests
  page.on('request', request => {
    const url = request.url();
    const method = request.method();
    const elapsed = Date.now() - testStartTime;
    
    if (url.includes('/api/auth/send-magic-link')) {
      console.log(`\n📤 [${elapsed}ms] REQUEST: ${method} ${url}`);
      console.log(`   Headers:`, request.headers());
      networkRequests.push({ url, method, timing: elapsed });
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    const elapsed = Date.now() - testStartTime;
    
    if (url.includes('/api/auth/send-magic-link')) {
      console.log(`\n📥 [${elapsed}ms] RESPONSE: ${status} ${url}`);
      
      // Update the request with status
      const req = networkRequests.find(r => r.url === url);
      if (req) req.status = status;
      
      try {
        const body = await response.json();
        console.log(`   Body:`, JSON.stringify(body, null, 2));
      } catch (e) {
        console.log(`   Body: (not JSON or empty)`);
      }
      
      console.log(`   Headers:`, response.headers());
    }
  });
  
  try {
    console.log('📍 Step 1: Navigating to https://www.voices.be/account/\n');
    testStartTime = Date.now();
    
    await page.goto('https://www.voices.be/account/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('⏳ Waiting for page to fully load...\n');
    await page.waitForTimeout(3000);
    
    console.log('📍 Step 2: Verifying version\n');
    if (detectedVersion === '2.14.219') {
      console.log(`✅ Version CORRECT: v${detectedVersion}\n`);
    } else {
      console.log(`⚠️  Version MISMATCH: Expected v2.14.219, got v${detectedVersion}\n`);
    }
    
    console.log('📍 Step 3: Filling email johfrah@voices.be\n');
    await page.locator('input[type="email"]').fill('johfrah@voices.be');
    console.log('✅ Email filled\n');
    
    console.log('📍 Step 4: Clicking "Stuur Magische Link"\n');
    console.log('⏱️  Starting timer for request observation...\n');
    
    const clickTime = Date.now();
    await page.locator('button[type="submit"]').click();
    console.log('✅ Button clicked\n');
    
    console.log('📍 Step 5: Observing network and console for 15 seconds...\n');
    
    // Wait and observe
    for (let i = 1; i <= 15; i++) {
      await page.waitForTimeout(1000);
      
      // Check for success message
      const successVisible = await page.locator('text=/Check je inbox/i').isVisible().catch(() => false);
      if (successVisible && i <= 10) {
        console.log(`✅ [${i}s] SUCCESS MESSAGE APPEARED!`);
        break;
      }
      
      // Check for error message
      const errorVisible = await page.locator('.bg-red-50').isVisible().catch(() => false);
      if (errorVisible) {
        const errorText = await page.locator('.bg-red-50').textContent();
        console.log(`❌ [${i}s] ERROR MESSAGE: ${errorText}`);
        break;
      }
      
      // Check for spinner
      const spinnerVisible = await page.locator('svg.animate-spin').isVisible().catch(() => false);
      if (spinnerVisible && i >= 10) {
        console.log(`⚠️  [${i}s] SPINNER STILL VISIBLE (possible hang)`);
      }
      
      if (i % 5 === 0) {
        console.log(`⏳ [${i}s] Still waiting...`);
      }
    }
    
    console.log('\n📍 Step 6 & 7: Final Report\n');
    console.log('='.repeat(80));
    
    // Analyze network requests
    console.log('\n🌐 NETWORK ANALYSIS:');
    if (networkRequests.length === 0) {
      console.log('❌ NO requests to /api/auth/send-magic-link detected!');
    } else {
      console.log(`✅ Found ${networkRequests.length} request(s):\n`);
      networkRequests.forEach((req, idx) => {
        console.log(`Request ${idx + 1}:`);
        console.log(`  URL: ${req.url}`);
        console.log(`  Method: ${req.method}`);
        console.log(`  Status: ${req.status || 'pending'}`);
        console.log(`  Timing: ${req.timing}ms after page load`);
        
        // Check for trailing slash
        if (req.url.endsWith('/send-magic-link/')) {
          console.log(`  ✅ Has trailing slash: /send-magic-link/`);
        } else if (req.url.endsWith('/send-magic-link')) {
          console.log(`  ⚠️  NO trailing slash: /send-magic-link`);
        }
        console.log('');
      });
    }
    
    // Check final state
    const successVisible = await page.locator('text=/Check je inbox/i').isVisible().catch(() => false);
    const errorVisible = await page.locator('.bg-red-50').isVisible().catch(() => false);
    const spinnerVisible = await page.locator('svg.animate-spin').isVisible().catch(() => false);
    
    console.log('\n📊 FINAL STATE:');
    console.log(`Version: v${detectedVersion}`);
    console.log(`Success Message: ${successVisible ? '✅ YES' : '❌ NO'}`);
    console.log(`Error Message: ${errorVisible ? '✅ YES' : '❌ NO'}`);
    console.log(`Spinner Stuck: ${spinnerVisible ? '🚨 YES' : '✅ NO'}`);
    console.log(`API Requests Made: ${networkRequests.length}`);
    
    // Check for timeout message in console
    const timeoutLogs = consoleLogs.filter(log => 
      log.toLowerCase().includes('timeout') || 
      log.toLowerCase().includes('10') && log.toLowerCase().includes('second')
    );
    
    if (timeoutLogs.length > 0) {
      console.log('\n⏰ TIMEOUT MESSAGES DETECTED:');
      timeoutLogs.forEach(log => console.log(`  ${log}`));
    } else {
      console.log('\n✅ No timeout messages detected');
    }
    
    console.log('='.repeat(80));
    
    const screenshotPath = '/tmp/v2.14.219-network-test.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 Screenshot: ${screenshotPath}`);
    
    // Save console logs to file
    const fs = require('fs');
    fs.writeFileSync('/tmp/v2.14.219-console.log', consoleLogs.join('\n'));
    console.log(`📝 Console logs saved: /tmp/v2.14.219-console.log`);
    
    console.log('\n✅ Test complete. Browser will stay open for 10 seconds...');
    await page.waitForTimeout(10000);
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    
    const screenshotPath = '/tmp/v2.14.219-error.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Error screenshot: ${screenshotPath}`);
  } finally {
    await browser.close();
  }
}

testNetworkBehavior().catch(console.error);
