/**
 * Verification Script: Ademing.be v2.15.085
 * Verifies that the hero cleanup is live
 */

import { chromium } from 'playwright';

async function verifyAdeminglive() {
  console.log('🔍 Starting verification of ademing.be v2.15.085...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });

  const page = await context.newPage();

  try {
    // Navigate with hard refresh (bypass cache)
    await page.goto('https://www.ademing.be', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Wait for page to be fully loaded
    await page.waitForTimeout(3000);

    // 1. Check version
    const version = await page.evaluate(() => {
      return (window as any).__VOICES_VERSION__;
    });
    console.log(`✅ Version check: ${version}`);
    const expectedVersion = 'v2.15.085';
    const versionMatch = version === expectedVersion || version === expectedVersion.substring(1);
    if (!versionMatch) {
      console.log(`⚠️  Expected ${expectedVersion}, got ${version}`);
    } else {
      console.log(`✅ Version matches (${version})`);
    }

    // 2. Check for social proof elements (should be GONE)
    const socialProofTexts = ['500 mensen', '50+ meditaties', '500+ mensen'];
    for (const text of socialProofTexts) {
      const element = await page.locator(`text=${text}`).count();
      if (element > 0) {
        console.log(`❌ FOUND "${text}" - should be removed!`);
      } else {
        console.log(`✅ "${text}" is removed`);
      }
    }

    // 3. Check for Julie quote (should be GONE)
    const julieQuote = await page.locator('text="Julie"').count();
    if (julieQuote > 0) {
      console.log(`❌ FOUND Julie quote - should be removed!`);
    } else {
      console.log(`✅ Julie quote is removed`);
    }

    // 4. Check for "Jouw eerste meditatie" section (should be GONE)
    const eersteMediatieSections = await page.locator('text=/jouw eerste meditatie/i').count();
    if (eersteMediatieSections > 0) {
      console.log(`❌ FOUND "Jouw eerste meditatie" section - should be removed!`);
    } else {
      console.log(`✅ "Jouw eerste meditatie" section is removed`);
    }

    // 5. Check for footer elements (should be GONE)
    const footerTexts = ['Contact', 'Copyright', '©'];
    for (const text of footerTexts) {
      const footerElement = await page.locator(`footer:has-text("${text}")`).count();
      if (footerElement > 0) {
        console.log(`❌ FOUND footer with "${text}" - should be removed!`);
      } else {
        console.log(`✅ Footer with "${text}" is removed`);
      }
    }

    // 6. Check what IS visible
    const heroVisible = await page.locator('[class*="Hero"]').count();
    const evenAdemenVisible = await page.locator('text=/even ademen/i').count();
    
    console.log(`\n📊 Visible sections:`);
    console.log(`   Hero section: ${heroVisible > 0 ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    console.log(`   "Even ademen" section: ${evenAdemenVisible > 0 ? '✅ VISIBLE' : '❌ NOT FOUND'}`);

    // Take screenshot for evidence
    await page.screenshot({
      path: '3-WETTEN/scripts/screenshots/ademing-v2.15.085-verification.png',
      fullPage: true,
    });
    console.log(`\n📸 Screenshot saved to 3-WETTEN/scripts/screenshots/ademing-v2.15.085-verification.png`);

    // Get page HTML for inspection
    const bodyHTML = await page.locator('body').innerHTML();
    const hasAdemingBento = bodyHTML.includes('AdemingBento');
    const hasAdemingHero = bodyHTML.includes('AdemingHero');
    
    console.log(`\n🔍 Component check:`);
    console.log(`   AdemingHero: ${hasAdemingHero ? '✅ PRESENT' : '❌ NOT FOUND'}`);
    console.log(`   AdemingBento: ${hasAdemingBento ? '✅ PRESENT' : '❌ NOT FOUND'}`);

  } catch (error) {
    console.error('❌ Verification failed:', error);
    await page.screenshot({
      path: '3-WETTEN/scripts/screenshots/ademing-error.png',
      fullPage: true,
    });
  } finally {
    await browser.close();
  }
}

verifyAdeminglive();
