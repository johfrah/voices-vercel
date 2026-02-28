import { chromium } from 'playwright';

async function investigateOrdersAPI() {
  console.log('🔍 Starting Orders API Investigation...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console logs
  page.on('console', msg => {
    console.log(`[CONSOLE ${msg.type()}]:`, msg.text());
  });

  // Capture network errors
  const networkErrors: any[] = [];
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    
    if (url.includes('/api/admin/orders') || url.includes('/api/admin/config')) {
      console.log(`\n📡 [${status}] ${url}`);
      
      if (status >= 400) {
        try {
          const body = await response.text();
          networkErrors.push({
            url,
            status,
            body,
            headers: response.headers()
          });
          console.log(`❌ ERROR BODY:\n${body}\n`);
        } catch (e) {
          console.log('❌ Could not read response body');
        }
      } else {
        console.log('✅ Success');
      }
    }
  });

  try {
    // Navigate to the auto-login URL
    console.log('🚀 Navigating to auto-login URL...\n');
    await page.goto('https://www.voices.be/?auto_login=b2dda905e581e6cea1daec513fe68bfebbefb1cfbc685f4ca8cade424fad0500&page=dashboard-orders', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait a bit for API calls to complete
    await page.waitForTimeout(3000);

    // Check version
    console.log('\n🔢 Checking version...');
    const version = await page.evaluate(() => {
      const versionElement = document.querySelector('[data-version]');
      return versionElement?.getAttribute('data-version') || 'Not found in DOM';
    });
    console.log(`Version: ${version}`);

    // Try to get version from API
    try {
      const configResponse = await page.evaluate(async () => {
        const res = await fetch('/api/admin/config');
        return {
          status: res.status,
          data: await res.json()
        };
      });
      console.log('\n📋 Config API Response:', JSON.stringify(configResponse, null, 2));
    } catch (e) {
      console.log('❌ Could not fetch config API');
    }

    // Summary
    console.log('\n\n📊 INVESTIGATION SUMMARY');
    console.log('========================');
    console.log(`Total network errors captured: ${networkErrors.length}`);
    
    if (networkErrors.length > 0) {
      console.log('\n🔥 THE SMOKING GUN:');
      networkErrors.forEach((err, idx) => {
        console.log(`\n[${idx + 1}] ${err.url}`);
        console.log(`Status: ${err.status}`);
        console.log(`Body: ${err.body}`);
      });
    }

    // Keep browser open for manual inspection
    console.log('\n⏸️  Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Investigation failed:', error);
  } finally {
    await browser.close();
    console.log('\n✅ Investigation complete.');
  }
}

investigateOrdersAPI().catch(console.error);
