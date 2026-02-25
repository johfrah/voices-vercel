import { chromium } from 'playwright';

async function quickCheck() {
  console.log('🔍 Quick Ademing Check...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  try {
    console.log('📍 Loading https://www.ademing.be...');
    await page.goto('https://www.ademing.be', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Check for error page
    const errorText = await page.locator('text=Oeps, even geduld').count();
    const diagnosticInfo = await page.locator('text=Diagnostic Info').count();
    
    if (errorText > 0 || diagnosticInfo > 0) {
      console.log('❌ ERROR PAGE DETECTED');
      console.log(`   Error message visible: ${errorText > 0 ? 'YES' : 'NO'}`);
      console.log(`   Diagnostic info visible: ${diagnosticInfo > 0 ? 'YES' : 'NO'}`);
    } else {
      console.log('✅ NO ERROR PAGE');
    }

    // Check for main content
    const heroTitle = await page.locator('h1').first().textContent();
    console.log(`\n📝 Hero Title: "${heroTitle?.trim()}"`);

    // Check for navigation
    const navExists = await page.locator('nav').count();
    console.log(`🧭 Navigation: ${navExists > 0 ? '✅ Found' : '❌ Not found'}`);

    // Console errors
    console.log(`\n🐛 Console Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log('\nFirst 3 errors:');
      errors.slice(0, 3).forEach((err, i) => {
        const shortErr = err.split('\n')[0].substring(0, 100);
        console.log(`   ${i + 1}. ${shortErr}...`);
      });
    }

    // Take screenshot
    await page.screenshot({ 
      path: '3-WETTEN/docs/FORENSIC-REPORTS/quick-check.png',
      fullPage: false 
    });
    console.log('\n📸 Screenshot: 3-WETTEN/docs/FORENSIC-REPORTS/quick-check.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

quickCheck();
