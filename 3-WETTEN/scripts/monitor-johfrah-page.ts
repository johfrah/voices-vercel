#!/usr/bin/env tsx

/**
 * Monitor Johfrah Portfolio Page for Errors
 * 
 * This script:
 * 1. Opens https://www.voices.be/johfrah/ in a browser
 * 2. Monitors console for TypeErrors, 404s, 500s
 * 3. Tracks network requests to /api/admin/config and other periodic endpoints
 * 4. Reports any crashes or freezes
 * 5. Stays on page for 2+ minutes
 */

import { chromium, type Browser, type Page, type ConsoleMessage, type Request, type Response } from 'playwright';

interface ErrorLog {
  timestamp: string;
  type: 'console' | 'network' | 'pageerror';
  severity: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  url?: string;
  status?: number;
}

const errors: ErrorLog[] = [];
const networkLogs: { url: string; status: number; timestamp: string }[] = [];

async function monitorPage() {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log('🚀 Starting browser...');
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();

    // Monitor console messages
    page.on('console', (msg: ConsoleMessage) => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        errors.push({
          timestamp: new Date().toISOString(),
          type: 'console',
          severity: 'error',
          message: text,
        });
        console.error(`❌ Console Error: ${text}`);
      } else if (type === 'warning') {
        console.warn(`⚠️  Console Warning: ${text}`);
      }
    });

    // Monitor page errors (uncaught exceptions)
    page.on('pageerror', (error: Error) => {
      errors.push({
        timestamp: new Date().toISOString(),
        type: 'pageerror',
        severity: 'error',
        message: error.message,
        stack: error.stack,
      });
      console.error(`💥 Page Error: ${error.message}`);
      if (error.stack) {
        console.error(`Stack: ${error.stack}`);
      }
    });

    // Monitor network requests
    page.on('request', (request: Request) => {
      const url = request.url();
      if (url.includes('/api/admin/config') || url.includes('/api/')) {
        console.log(`📡 API Request: ${url}`);
      }
    });

    page.on('response', async (response: Response) => {
      const url = response.url();
      const status = response.status();
      
      networkLogs.push({
        url,
        status,
        timestamp: new Date().toISOString(),
      });

      // Log API calls specifically
      if (url.includes('/api/')) {
        console.log(`📡 API Response: ${url} - ${status}`);
      }

      // Track 404s and 500s
      if (status === 404) {
        errors.push({
          timestamp: new Date().toISOString(),
          type: 'network',
          severity: 'error',
          message: `404 Not Found: ${url}`,
          url,
          status,
        });
        console.error(`❌ 404 Not Found: ${url}`);
      } else if (status >= 500) {
        errors.push({
          timestamp: new Date().toISOString(),
          type: 'network',
          severity: 'error',
          message: `${status} Server Error: ${url}`,
          url,
          status,
        });
        console.error(`❌ ${status} Server Error: ${url}`);
      }
    });

    // Navigate to the page
    console.log('🌐 Navigating to https://www.voices.be/johfrah/...');
    await page.goto('https://www.voices.be/johfrah/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    console.log('✅ Page loaded successfully');
    console.log('⏱️  Monitoring for 2 minutes...');
    console.log('👀 Watch for:');
    console.log('   - TypeErrors in console');
    console.log('   - 404/500 network errors');
    console.log('   - Periodic API calls (VersionGuard, etc.)');
    console.log('   - Page freezes or crashes');
    console.log('');

    // Wait for 2 minutes (120 seconds)
    const monitorDuration = 120000;
    const startTime = Date.now();
    
    // Check page responsiveness every 10 seconds
    const checkInterval = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.ceil((monitorDuration - elapsed) / 1000);
      
      if (remaining > 0) {
        console.log(`⏳ ${remaining}s remaining...`);
        
        // Test if page is still responsive
        try {
          await page!.evaluate(() => document.title);
          console.log('✓ Page is responsive');
        } catch (error) {
          errors.push({
            timestamp: new Date().toISOString(),
            type: 'pageerror',
            severity: 'error',
            message: 'Page became unresponsive',
          });
          console.error('❌ Page is FROZEN or UNRESPONSIVE');
        }
      }
    }, 10000);

    await page.waitForTimeout(monitorDuration);
    clearInterval(checkInterval);

    console.log('\n✅ Monitoring complete!');
    console.log('\n📊 REPORT:');
    console.log('='.repeat(60));

    // Report errors
    if (errors.length === 0) {
      console.log('✅ NO ERRORS DETECTED');
    } else {
      console.log(`❌ ${errors.length} ERROR(S) DETECTED:\n`);
      errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.timestamp}] ${error.type.toUpperCase()}`);
        console.log(`   Message: ${error.message}`);
        if (error.url) console.log(`   URL: ${error.url}`);
        if (error.status) console.log(`   Status: ${error.status}`);
        if (error.stack) console.log(`   Stack: ${error.stack}`);
        console.log('');
      });
    }

    // Report API calls to /api/admin/config
    const configCalls = networkLogs.filter(log => log.url.includes('/api/admin/config'));
    if (configCalls.length > 0) {
      console.log(`\n📡 /api/admin/config calls: ${configCalls.length}`);
      configCalls.forEach((call, index) => {
        console.log(`   ${index + 1}. [${call.timestamp}] Status: ${call.status}`);
      });
    }

    // Report all API calls
    const apiCalls = networkLogs.filter(log => log.url.includes('/api/'));
    console.log(`\n📡 Total API calls: ${apiCalls.length}`);

    console.log('='.repeat(60));

  } catch (error) {
    console.error('💥 FATAL ERROR:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

monitorPage();
