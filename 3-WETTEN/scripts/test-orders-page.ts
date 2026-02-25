#!/usr/bin/env tsx
/**
 * Live Orders Page Validation Script
 * Tests the admin orders page with auto_login
 */

import https from 'https';

const ORDERS_URL = 'https://www.voices.be/admin/orders?auto_login=b2dda905e581e6cea1daec513fe68bfebbefb1cfbc685f4ca8cade424fad0500';
const API_URL = 'https://www.voices.be/api/admin/config?type=general';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details: string;
}

const results: TestResult[] = [];

function addResult(test: string, status: 'PASS' | 'FAIL' | 'WARN', details: string) {
  results.push({ test, status, details });
}

async function fetchUrl(url: string, followRedirects = true): Promise<{ body: string; statusCode: number; headers: any }> {
  return new Promise((resolve, reject) => {
    https.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html,application/json'
      } 
    }, (res) => {
      // Follow redirects
      if (followRedirects && res.statusCode && [301, 302, 307, 308].includes(res.statusCode)) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          const fullUrl = redirectUrl.startsWith('http') ? redirectUrl : `https://www.voices.be${redirectUrl}`;
          return fetchUrl(fullUrl, followRedirects).then(resolve).catch(reject);
        }
      }
      
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ body, statusCode: res.statusCode || 0, headers: res.headers }));
    }).on('error', reject);
  });
}

async function main() {
  console.log('🚀 LIVE ORDERS PAGE VALIDATION\n');
  console.log('═'.repeat(60));
  
  // Test 1: Check API version
  try {
    const { body } = await fetchUrl(API_URL);
    const config = JSON.parse(body);
    const version = config._version;
    
    if (version === '2.14.540') {
      addResult('API Version', 'PASS', `Version ${version} is live`);
    } else {
      addResult('API Version', 'WARN', `Expected 2.14.540, got ${version}`);
    }
  } catch (err: any) {
    addResult('API Version', 'FAIL', `API check failed: ${err.message}`);
  }

  // Test 2: Check Orders page loads
  try {
    const { body, statusCode } = await fetchUrl(ORDERS_URL);
    
    if (statusCode === 200) {
      addResult('Page Load', 'PASS', `HTTP ${statusCode} OK`);
    } else {
      addResult('Page Load', 'FAIL', `HTTP ${statusCode}`);
    }

    // Test 3: Check for "Geen bestellingen gevonden" empty state
    const hasEmptyState = body.includes('Geen bestellingen gevonden');
    if (hasEmptyState) {
      addResult('Empty State Check', 'FAIL', 'Empty state "Geen bestellingen gevonden" is still visible');
    } else {
      addResult('Empty State Check', 'PASS', 'No empty state detected');
    }

    // Test 4: Check for orders table
    const hasTable = body.includes('table') || body.includes('orders-table') || body.includes('data-table');
    if (hasTable) {
      addResult('Orders Table', 'PASS', 'Table element detected in HTML');
    } else {
      addResult('Orders Table', 'WARN', 'No table element found in HTML');
    }

    // Test 5: Check for React hydration
    const hasReactRoot = body.includes('__NEXT_DATA__');
    if (hasReactRoot) {
      addResult('React Hydration', 'PASS', 'Next.js data found');
      
      // Try to extract orders count from Next.js data
      try {
        const nextDataMatch = body.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
        if (nextDataMatch) {
          const nextData = JSON.parse(nextDataMatch[1]);
          // This is a rough check - actual structure may vary
          const dataStr = JSON.stringify(nextData);
          const ordersMatches = dataStr.match(/"order_id"/g);
          if (ordersMatches && ordersMatches.length > 0) {
            addResult('Orders Data', 'PASS', `Found ${ordersMatches.length} order references in hydration data`);
          } else {
            addResult('Orders Data', 'WARN', 'No order data found in Next.js hydration');
          }
        }
      } catch (e) {
        addResult('Orders Data', 'WARN', 'Could not parse Next.js data');
      }
    } else {
      addResult('React Hydration', 'WARN', 'No Next.js hydration data found');
    }

    // Test 6: Check for 500 errors in HTML
    const has500Error = body.includes('500') || body.includes('Internal Server Error');
    if (has500Error) {
      addResult('500 Error Check', 'FAIL', 'Found 500 error indicators in HTML');
    } else {
      addResult('500 Error Check', 'PASS', 'No 500 errors detected in HTML');
    }

    // Test 7: Check for console errors (in HTML comments or script tags)
    const hasConsoleError = body.match(/console\.error|TypeError|ReferenceError/gi);
    if (hasConsoleError && hasConsoleError.length > 0) {
      addResult('Console Errors', 'WARN', `Found ${hasConsoleError.length} potential console error patterns`);
    } else {
      addResult('Console Errors', 'PASS', 'No console error patterns detected');
    }

  } catch (err: any) {
    addResult('Page Load', 'FAIL', `Failed to fetch page: ${err.message}`);
  }

  // Print results
  console.log('\n📊 TEST RESULTS:\n');
  console.log('═'.repeat(60));
  
  results.forEach((result, idx) => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} [${result.status}] ${result.test}`);
    console.log(`   ${result.details}\n`);
  });

  console.log('═'.repeat(60));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  
  console.log(`\n📈 SUMMARY: ${passed} passed, ${failed} failed, ${warned} warnings\n`);

  if (failed > 0) {
    console.log('❌ VALIDATION FAILED - Orders page has issues');
    process.exit(1);
  } else if (warned > 0) {
    console.log('⚠️ VALIDATION PASSED WITH WARNINGS');
    process.exit(0);
  } else {
    console.log('✅ ALL TESTS PASSED - Orders page is working correctly');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('💥 Script failed:', err);
  process.exit(1);
});
