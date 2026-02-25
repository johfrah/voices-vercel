#!/usr/bin/env tsx
/**
 * Live Johfrah Route Validation Script
 * Tests the live deployment of the Johfrah actor page
 */

import https from 'https';

const LIVE_URL = 'https://www.voices.be/johfrah?v=541';
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

async function fetchUrl(url: string, followRedirects = true): Promise<{ body: string; statusCode: number }> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
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
      res.on('end', () => resolve({ body, statusCode: res.statusCode || 0 }));
    }).on('error', reject);
  });
}

async function main() {
  console.log('🚀 LIVE JOHFRAH ROUTE VALIDATION\n');
  console.log('═'.repeat(60));
  
  // Test 1: Check API version
  try {
    const { body } = await fetchUrl(API_URL);
    const config = JSON.parse(body);
    const version = config._version;
    
    if (version === '2.14.541') {
      addResult('API Version', 'PASS', `Version ${version} is live`);
    } else {
      addResult('API Version', 'FAIL', `Expected 2.14.541, got ${version}`);
    }
  } catch (err: any) {
    addResult('API Version', 'FAIL', `API check failed: ${err.message}`);
  }

  // Test 2: Check Johfrah page loads
  try {
    const { body, statusCode } = await fetchUrl(LIVE_URL);
    
    if (statusCode === 200) {
      addResult('Page Load', 'PASS', `HTTP ${statusCode} OK`);
    } else {
      addResult('Page Load', 'FAIL', `HTTP ${statusCode}`);
    }

    // Test 3: Check for Johfrah content
    const johfrahCount = (body.match(/johfrah/gi) || []).length;
    if (johfrahCount > 0) {
      addResult('Johfrah Content', 'PASS', `Found ${johfrahCount} mentions of "johfrah"`);
    } else {
      addResult('Johfrah Content', 'FAIL', 'No "johfrah" mentions found in HTML');
    }

    // Test 4: Check page title
    const titleMatch = body.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) {
      const title = titleMatch[1];
      addResult('Page Title', 'PASS', `Title: "${title}"`);
    } else {
      addResult('Page Title', 'WARN', 'No title tag found');
    }

    // Test 5: Check for React hydration
    const hasReactRoot = body.includes('__NEXT_DATA__');
    if (hasReactRoot) {
      addResult('React Hydration', 'PASS', 'Next.js data found');
    } else {
      addResult('React Hydration', 'WARN', 'No Next.js hydration data found');
    }

    // Test 6: Check for errors in HTML
    const hasError = body.match(/(error|Error|ERROR)/gi);
    if (!hasError || hasError.length === 0) {
      addResult('Error Check', 'PASS', 'No visible errors in HTML');
    } else {
      addResult('Error Check', 'WARN', `Found ${hasError.length} potential error mentions`);
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
    console.log('❌ VALIDATION FAILED');
    process.exit(1);
  } else if (warned > 0) {
    console.log('⚠️ VALIDATION PASSED WITH WARNINGS');
    process.exit(0);
  } else {
    console.log('✅ ALL TESTS PASSED');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('💥 Script failed:', err);
  process.exit(1);
});
