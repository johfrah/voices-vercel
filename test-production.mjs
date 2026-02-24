import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  console.log('🌐 Navigating to https://www.voices.be...');
  await page.goto('https://www.voices.be', { waitUntil: 'networkidle' });
  
  console.log('🔄 Performing hard refresh...');
  await page.reload({ waitUntil: 'networkidle' });
  
  // Wait for page to fully load
  await page.waitForTimeout(3000);
  
  console.log('📸 Taking screenshot...');
  await page.screenshot({ path: '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/test-screenshot.png', fullPage: true });
  
  console.log('🔍 Checking for Voicy chat widget...');
  const voicyButton = await page.locator('[data-voicy], [class*="voicy"], [id*="voicy"], button:has-text("Chat")').first();
  const voicyExists = await voicyButton.count() > 0;
  console.log(`Voicy widget found: ${voicyExists}`);
  
  if (voicyExists) {
    const voicyVisible = await voicyButton.isVisible();
    console.log(`Voicy widget visible: ${voicyVisible}`);
    
    // Get the element details
    const voicyHTML = await voicyButton.evaluate(el => el.outerHTML).catch(() => 'Unable to get HTML');
    console.log(`Voicy HTML: ${voicyHTML.substring(0, 200)}...`);
  }
  
  console.log('🔍 Checking API endpoint for version...');
  const apiResponse = await page.goto('https://www.voices.be/api/admin/config?type=general');
  const apiData = await apiResponse.json();
  console.log(`API Version: ${apiData._version}`);
  
  // Go back to main page
  await page.goto('https://www.voices.be', { waitUntil: 'networkidle' });
  
  console.log('🔍 Checking console logs for version...');
  const logs = [];
  page.on('console', msg => {
    logs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  // Check for version in page content
  const pageContent = await page.content();
  const versionMatch = pageContent.match(/version["\s:]+(\d+\.\d+\.\d+)/i);
  if (versionMatch) {
    console.log(`Version found in page: ${versionMatch[1]}`);
  }
  
  console.log('❌ Checking for console errors...');
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Wait a bit to collect any errors
  await page.waitForTimeout(2000);
  
  console.log('\n📊 FINAL REPORT:');
  console.log('================');
  console.log(`✅ Version (API): ${apiData._version}`);
  console.log(`${voicyExists ? '✅' : '❌'} Voicy Widget: ${voicyExists ? 'Found' : 'Not Found'}`);
  console.log(`❌ Console Errors: ${errors.length > 0 ? errors.length : 'None'}`);
  
  if (errors.length > 0) {
    console.log('\nErrors found:');
    errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
  }
  
  // Get footer version if exists
  const footerVersion = await page.locator('footer').textContent().catch(() => '');
  if (footerVersion.includes('v')) {
    const footerMatch = footerVersion.match(/v(\d+\.\d+\.\d+)/);
    if (footerMatch) {
      console.log(`✅ Footer Version: ${footerMatch[1]}`);
    }
  }
  
  console.log('\n✅ Test complete! Screenshot saved to test-screenshot.png');
  
  await browser.close();
})();
