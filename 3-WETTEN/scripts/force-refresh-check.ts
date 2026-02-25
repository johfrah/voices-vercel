import { chromium } from 'playwright';

async function forceRefreshCheck() {
  console.log('🔄 Force Refresh Check...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    // Disable cache
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  // Capture console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  try {
    console.log('📍 Loading https://www.ademing.be with cache bypass...');
    
    // Add cache-busting query param
    const timestamp = Date.now();
    await page.goto(`https://www.ademing.be?_=${timestamp}`, { 
      waitUntil: 'domcontentloaded', 
      timeout: 30000 
    });
    
    // Force hard reload
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    // Check for error page
    const errorText = await page.locator('text=Oeps, even geduld').count();
    
    if (errorText > 0) {
      console.log('❌ STILL SHOWING ERROR PAGE');
    } else {
      console.log('✅ NO ERROR PAGE - SITE LOADED!');
    }

    // Check for main content
    const heroTitle = await page.locator('h1').first().textContent();
    console.log(`\n📝 Hero Title: "${heroTitle?.trim()}"`);

    // Check for navigation
    const navExists = await page.locator('nav').count();
    const hamburgerExists = await page.locator('nav button').count();
    console.log(`🧭 Navigation: ${navExists > 0 ? '✅ Found' : '❌ Not found'}`);
    console.log(`🍔 Hamburger: ${hamburgerExists > 0 ? '✅ Found' : '❌ Not found'}`);

    // Console errors
    console.log(`\n🐛 Console Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.slice(0, 2).forEach((err, i) => {
        const shortErr = err.split('\n')[0].substring(0, 150);
        console.log(`   ${i + 1}. ${shortErr}`);
      });
    } else {
      console.log('   ✅ NO ERRORS!');
    }

    // Take screenshot
    await page.screenshot({ 
      path: '3-WETTEN/docs/FORENSIC-REPORTS/force-refresh-check.png',
      fullPage: false 
    });
    console.log('\n📸 Screenshot saved');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

forceRefreshCheck();
