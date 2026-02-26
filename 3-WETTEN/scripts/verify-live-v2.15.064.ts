import { chromium } from 'playwright';
import path from 'path';

async function verifyLive() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const logs: string[] = [];
  const errors: string[] = [];
  const typeErrors: string[] = [];

  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    logs.push(`[${type}] ${text}`);
    if (type === 'error') {
      errors.push(text);
      if (text.includes('.length') || text.includes('TypeError')) {
        typeErrors.push(text);
      }
    }
  });

  page.on('pageerror', (error) => {
    const errMsg = `PAGE ERROR: ${error.message}`;
    errors.push(errMsg);
    if (error.message.includes('.length') || error.message.includes('TypeError')) {
      typeErrors.push(errMsg);
    }
  });

  try {
    console.log('🚀 Opening https://www.voices.be...');
    await page.goto('https://www.voices.be', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for hydration
    await page.waitForTimeout(5000);

    // Extract version from console logs
    const versionLog = logs.find(log => log.includes('Nuclear Version') || log.includes('v2.15'));
    let version = 'unknown';
    if (versionLog) {
      const match = versionLog.match(/v?(\d+\.\d+\.\d+)/);
      if (match) version = match[1];
    }

    // Check actor cards visibility
    const pageState = await page.evaluate(() => {
      const grid = document.querySelector('[data-component="VoiceActorGrid"]');
      const actorCards = document.querySelectorAll('[data-actor-card]');
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      
      return {
        gridExists: grid !== null,
        actorCount: actorCards.length,
        skeletonCount: skeletons.length,
        hasActors: actorCards.length > 0,
        bodySnippet: document.body.innerText.substring(0, 300)
      };
    });

    // Take screenshot
    const screenshotPath = path.join(process.cwd(), '3-WETTEN', 'scripts', 'screenshots', 'live-site-verification.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });

    console.log('\n📊 ===== VERIFICATION RESULTS =====');
    console.log(`Version: v${version}`);
    console.log(`Actor Grid Exists: ${pageState.gridExists}`);
    console.log(`Actor Cards Visible: ${pageState.actorCount}`);
    console.log(`Skeletons Remaining: ${pageState.skeletonCount}`);
    console.log(`Console Errors: ${errors.length}`);
    console.log(`TypeErrors (.length): ${typeErrors.length}`);
    console.log(`Screenshot: ${screenshotPath}`);

    if (versionLog) {
      console.log(`\n🔍 Version Log: ${versionLog}`);
    }

    if (typeErrors.length > 0) {
      console.log('\n❌ TYPE ERRORS DETECTED:');
      typeErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }

    if (errors.length > 0 && typeErrors.length === 0) {
      console.log('\n⚠️  OTHER CONSOLE ERRORS:');
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }

    console.log('\n📄 Page Snippet:');
    console.log(pageState.bodySnippet);

    // Final verdict
    console.log('\n🎯 ===== FINAL VERDICT =====');
    if (version === '2.15.064' && pageState.hasActors && typeErrors.length === 0) {
      console.log('✅ VERIFIED LIVE: v2.15.064 - Actor grid visible, 0 console errors.');
      process.exit(0);
    } else {
      console.log('❌ VERIFICATION FAILED:');
      if (version !== '2.15.064') console.log(`  - Expected v2.15.064, got v${version}`);
      if (!pageState.hasActors) console.log(`  - Actor cards not visible (${pageState.actorCount} found)`);
      if (typeErrors.length > 0) console.log(`  - ${typeErrors.length} TypeErrors detected`);
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Error:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyLive();
