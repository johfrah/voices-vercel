import { chromium } from 'playwright';

async function checkLiveConsole() {
  console.log('🔍 Opening https://www.voices.be in browser...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const logs: string[] = [];
  const errors: string[] = [];

  // Capture console messages
  page.on('console', (msg) => {
    const text = msg.text();
    logs.push(`[${msg.type().toUpperCase()}] ${text}`);
    console.log(`[${msg.type().toUpperCase()}] ${text}`);
  });

  // Capture page errors
  page.on('pageerror', (error) => {
    const errorText = error.toString();
    errors.push(errorText);
    console.error('❌ PAGE ERROR:', errorText);
  });

  try {
    // Navigate to the page
    await page.goto('https://www.voices.be', { waitUntil: 'networkidle' });
    
    // Wait a bit for any async logs
    await page.waitForTimeout(3000);

    console.log('\n📊 SUMMARY:\n');
    console.log(`Total console logs: ${logs.length}`);
    console.log(`Total errors: ${errors.length}\n`);

    // Check for specific version log
    const versionLog = logs.find(log => log.includes('Version:'));
    if (versionLog) {
      console.log('✅ Version found:', versionLog);
    } else {
      console.log('❌ Version log NOT found');
    }

    // Check for TypeError
    const typeError = errors.find(err => err.includes("Cannot read properties of undefined (reading 'length')"));
    if (typeError) {
      console.log('❌ TypeError FOUND:', typeError);
    } else {
      console.log('✅ No TypeError about "length" found');
    }

    // Check if voice actor grid is visible
    const gridVisible = await page.locator('[data-testid="voice-actor-grid"], .grid').first().isVisible().catch(() => false);
    console.log(gridVisible ? '✅ Voice actor grid IS visible' : '❌ Voice actor grid NOT visible');

    console.log('\n📋 ALL CONSOLE LOGS:\n');
    logs.forEach(log => console.log(log));

    if (errors.length > 0) {
      console.log('\n🚨 ALL ERRORS:\n');
      errors.forEach(err => console.log(err));
    }

    // Keep browser open for manual inspection
    console.log('\n⏸️  Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Script error:', error);
  } finally {
    await browser.close();
  }
}

checkLiveConsole();
