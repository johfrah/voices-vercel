import { chromium } from 'playwright';

async function investigateOrdersAPI() {
  console.log('🔍 Starting Orders API Investigation (V2 - Direct Dashboard Access)...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('orders') || text.includes('Orders') || text.includes('ERROR') || text.includes('500')) {
      console.log(`[CONSOLE ${msg.type()}]:`, text);
    }
  });

  // Capture ALL network requests to orders API
  const networkErrors: any[] = [];
  const networkSuccess: any[] = [];
  
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    
    // Capture ALL admin API calls
    if (url.includes('/api/admin/')) {
      const endpoint = url.split('/api/admin/')[1];
      
      if (status >= 400) {
        console.log(`\n❌ [${status}] /api/admin/${endpoint}`);
        try {
          const body = await response.text();
          networkErrors.push({
            url,
            status,
            body,
            headers: response.headers()
          });
          console.log(`🔥 ERROR BODY:\n${body}\n`);
        } catch (e) {
          console.log('❌ Could not read response body');
        }
      } else if (url.includes('orders')) {
        console.log(`\n✅ [${status}] /api/admin/${endpoint}`);
        try {
          const body = await response.text();
          networkSuccess.push({ url, status, body: body.substring(0, 200) });
        } catch (e) {
          console.log('Could not read response body');
        }
      }
    }
  });

  try {
    // Step 1: Auto-login
    console.log('🔐 Step 1: Auto-login...\n');
    await page.goto('https://www.voices.be/?auto_login=b2dda905e581e6cea1daec513fe68bfebbefb1cfbc685f4ca8cade424fad0500', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Step 2: Navigate to admin dashboard
    console.log('\n📊 Step 2: Navigating to /admin/dashboard/orders...\n');
    await page.goto('https://www.voices.be/admin/dashboard/orders', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for API calls
    await page.waitForTimeout(5000);

    // Check version
    console.log('\n🔢 Checking version...');
    const version = await page.evaluate(() => {
      // Try multiple ways to get version
      const versionElement = document.querySelector('[data-version]');
      const versionFromAttr = versionElement?.getAttribute('data-version');
      
      // Check console logs for version
      const bodyText = document.body.innerText;
      const versionMatch = bodyText.match(/v\d+\.\d+\.\d+/);
      
      return {
        fromDOM: versionFromAttr || 'Not found',
        fromText: versionMatch ? versionMatch[0] : 'Not found',
        url: window.location.href
      };
    });
    console.log('Version Info:', JSON.stringify(version, null, 2));

    // Try to manually trigger orders fetch
    console.log('\n🔄 Step 3: Manually triggering orders fetch...');
    const manualFetch = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/admin/orders/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const status = res.status;
        let body;
        try {
          body = await res.text();
        } catch (e) {
          body = 'Could not read body';
        }
        
        return { status, body, ok: res.ok };
      } catch (error: any) {
        return { error: error.message };
      }
    });
    
    console.log('\n🎯 MANUAL FETCH RESULT:');
    console.log(JSON.stringify(manualFetch, null, 2));

    // Summary
    console.log('\n\n📊 INVESTIGATION SUMMARY');
    console.log('========================');
    console.log(`Network errors captured: ${networkErrors.length}`);
    console.log(`Successful orders calls: ${networkSuccess.length}`);
    
    if (networkErrors.length > 0) {
      console.log('\n🔥 THE SMOKING GUN (Network Errors):');
      networkErrors.forEach((err, idx) => {
        console.log(`\n[${idx + 1}] ${err.url}`);
        console.log(`Status: ${err.status}`);
        console.log(`Body: ${err.body}`);
      });
    }
    
    if (networkSuccess.length > 0) {
      console.log('\n✅ Successful Orders Calls:');
      networkSuccess.forEach((success, idx) => {
        console.log(`\n[${idx + 1}] ${success.url}`);
        console.log(`Status: ${success.status}`);
        console.log(`Body preview: ${success.body}...`);
      });
    }

    // Keep browser open for manual inspection
    console.log('\n⏸️  Browser will stay open for 60 seconds for manual inspection...');
    console.log('💡 Check the Network tab in DevTools for the /api/admin/orders/ call');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('❌ Investigation failed:', error);
  } finally {
    await browser.close();
    console.log('\n✅ Investigation complete.');
  }
}

investigateOrdersAPI().catch(console.error);
