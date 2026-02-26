import { chromium } from 'playwright';

(async () => {
  console.log('🔍 Starting Voices.be Console Audit...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const consoleMessages: Array<{ type: string; text: string; location?: string }> = [];
  const errors: string[] = [];
  
  // Capture all console messages
  page.on('console', (msg) => {
    const text = msg.text();
    consoleMessages.push({
      type: msg.type(),
      text: text,
      location: msg.location()?.url
    });
    
    console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${text}`);
  });
  
  // Capture page errors
  page.on('pageerror', (err) => {
    const errorMsg = err.message;
    errors.push(errorMsg);
    console.log(`[PAGE ERROR] ${errorMsg}`);
    console.log(`[STACK] ${err.stack}`);
  });
  
  try {
    console.log('📍 Navigating to https://www.voices.be...\n');
    await page.goto('https://www.voices.be', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // Wait a bit for any delayed console logs
    await page.waitForTimeout(5000);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 AUDIT RESULTS');
    console.log('='.repeat(80) + '\n');
    
    // Check for version log
    const versionLog = consoleMessages.find(msg => 
      msg.text.includes('Version:') || msg.text.includes('v2.15')
    );
    
    console.log('1️⃣  VERSION CHECK:');
    if (versionLog) {
      console.log(`   ✅ Found: ${versionLog.text}`);
    } else {
      console.log(`   ⚠️  Version log not found in console`);
    }
    
    // Check for the specific TypeError
    const typeError = errors.find(err => 
      err.includes("Cannot read properties of undefined (reading 'length')")
    );
    
    console.log('\n2️⃣  TYPEERROR CHECK:');
    if (typeError) {
      console.log(`   ❌ FOUND: ${typeError}`);
    } else {
      console.log(`   ✅ No "Cannot read properties of undefined (reading 'length')" error detected`);
    }
    
    // Check for voice actor grid
    console.log('\n3️⃣  VOICE ACTOR GRID CHECK:');
    const actorGrid = await page.locator('[data-testid="actor-grid"], .actor-grid, [class*="grid"]').first().isVisible().catch(() => false);
    const actorCards = await page.locator('[data-actor-id], [class*="actor-card"]').count();
    
    console.log(`   Grid visible: ${actorGrid ? '✅ Yes' : '⚠️  No'}`);
    console.log(`   Actor cards found: ${actorCards}`);
    
    // List all console errors
    console.log('\n4️⃣  ALL CONSOLE ERRORS:');
    const allErrors = consoleMessages.filter(msg => msg.type === 'error');
    if (allErrors.length === 0) {
      console.log('   ✅ No console errors detected');
    } else {
      allErrors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.text}`);
      });
    }
    
    // List all page errors
    console.log('\n5️⃣  ALL PAGE ERRORS:');
    if (errors.length === 0) {
      console.log('   ✅ No page errors detected');
    } else {
      errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err}`);
      });
    }
    
    // Take a screenshot
    await page.screenshot({ 
      path: '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/scripts/voices-console-audit.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved to: 3-WETTEN/scripts/voices-console-audit.png');
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ AUDIT COMPLETE');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error during audit:', error);
  } finally {
    await browser.close();
  }
})();
