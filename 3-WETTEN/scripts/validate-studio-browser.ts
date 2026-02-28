#!/usr/bin/env tsx
/**
 * 🎓 Studio Browser Validation Script
 * 
 * Comprehensive browser-based validation of the Studio landing page:
 * 1. Console error checking (ReferenceError: tl)
 * 2. Version verification (v2.16.066)
 * 3. Hero content validation
 * 4. Workshop carousel visibility
 * 5. CTA button functionality
 */

import { chromium, Browser, Page } from 'playwright';

const STUDIO_URL = 'https://www.voices.be/studio/';
const EXPECTED_VERSION = 'v2.16.066';

interface ValidationResult {
  test: string;
  passed: boolean;
  details: string;
}

async function validateStudioPage(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log('\n🎓 STUDIO BROWSER VALIDATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Launch browser
    console.log('🚀 Launching browser...');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    page = await context.newPage();

    // Collect console messages
    const consoleMessages: string[] = [];
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });

    // Navigate to Studio page
    console.log(`📍 Navigating to ${STUDIO_URL}...`);
    try {
      await page.goto(STUDIO_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
      console.log('✅ Page loaded (DOM ready)\n');
    } catch (error) {
      console.log('⚠️  Page load timeout, continuing with partial load...\n');
    }

    // Wait for hydration and dynamic content
    await page.waitForTimeout(3000);

    // TEST 1: Check for 'tl' ReferenceError
    console.log('1️⃣ Checking for ReferenceError: tl...');
    const hasTlError = consoleErrors.some(err => 
      err.includes('ReferenceError') && err.includes('tl') && err.includes('before initialization')
    );
    results.push({
      test: 'Console ReferenceError: tl',
      passed: !hasTlError,
      details: hasTlError 
        ? '❌ FOUND: ReferenceError: Cannot access \'tl\' before initialization' 
        : '✅ No ReferenceError for \'tl\' found'
    });
    console.log(results[results.length - 1].details);

    // TEST 2: Verify Nuclear Version
    console.log('\n2️⃣ Checking Nuclear Version...');
    const versionLog = consoleMessages.find(msg => 
      msg.includes('[Voices] Nuclear Version:')
    );
    const hasCorrectVersion = versionLog?.includes(EXPECTED_VERSION);
    results.push({
      test: 'Nuclear Version',
      passed: hasCorrectVersion || false,
      details: versionLog 
        ? (hasCorrectVersion 
            ? `✅ Found: ${versionLog}` 
            : `⚠️  Found version but not ${EXPECTED_VERSION}: ${versionLog}`)
        : '❌ Version log not found in console'
    });
    console.log(results[results.length - 1].details);

    // TEST 3: Verify Hero Title
    console.log('\n3️⃣ Checking Hero Title...');
    const heroTitle = await page.textContent('h1').catch(() => null);
    const expectedTitle = 'Workshops voor professionele sprekers.';
    const titleMatches = heroTitle?.includes('Workshops voor professionele sprekers');
    results.push({
      test: 'Hero Title',
      passed: titleMatches || false,
      details: heroTitle 
        ? (titleMatches 
            ? `✅ Found: "${heroTitle}"` 
            : `⚠️  Found different title: "${heroTitle}"`)
        : '❌ Hero title (h1) not found'
    });
    console.log(results[results.length - 1].details);

    // TEST 4: Verify Description mentions 'Bernadette en Johfrah'
    console.log('\n4️⃣ Checking Hero Description...');
    const pageText = await page.textContent('body').catch(() => '');
    const hasBernadetteJohfrah = pageText.includes('Bernadette') && pageText.includes('Johfrah');
    results.push({
      test: 'Hero Description (Bernadette en Johfrah)',
      passed: hasBernadetteJohfrah,
      details: hasBernadetteJohfrah 
        ? '✅ Found: Bernadette en Johfrah mentioned' 
        : '❌ Missing: Bernadette and/or Johfrah not found in page text'
    });
    console.log(results[results.length - 1].details);

    // TEST 5: Check Workshop Carousels
    console.log('\n5️⃣ Checking Workshop Carousels...');
    
    // Check for "Vaste Waarden" section
    const vasteWaardenVisible = pageText.includes('Vaste Waarden') || pageText.includes('vaste waarden');
    
    // Check for "Specialisaties" section
    const specialisatiesVisible = pageText.includes('Specialisaties') || pageText.includes('specialisaties');
    
    // Check for workshop cards (look for common workshop-related elements)
    const workshopCards = await page.locator('[class*="workshop"], [class*="card"], [data-workshop]').count();
    
    const carouselsPopulated = workshopCards > 0 && (vasteWaardenVisible || specialisatiesVisible);
    
    results.push({
      test: 'Workshop Carousels',
      passed: carouselsPopulated,
      details: carouselsPopulated 
        ? `✅ Found: ${workshopCards} workshop cards, sections visible` 
        : `⚠️  Found ${workshopCards} workshop cards. Vaste Waarden: ${vasteWaardenVisible}, Specialisaties: ${specialisatiesVisible}`
    });
    console.log(results[results.length - 1].details);

    // TEST 6: Check 'RESERVEER PLEK' button
    console.log('\n6️⃣ Checking CTA Button...');
    const ctaButton = await page.locator('button, a').filter({ hasText: /RESERVEER PLEK|Reserveer plek/i }).first();
    const ctaExists = await ctaButton.count() > 0;
    
    let ctaFunctional = false;
    if (ctaExists) {
      // Check if button has onClick or href
      const hasHref = await ctaButton.evaluate(el => {
        if (el.tagName === 'A') return !!(el as HTMLAnchorElement).href;
        return false;
      }).catch(() => false);
      
      const hasOnClick = await ctaButton.evaluate(el => {
        return !!(el as HTMLElement).onclick || el.hasAttribute('data-checkout');
      }).catch(() => false);
      
      ctaFunctional = hasHref || hasOnClick;
    }
    
    results.push({
      test: 'RESERVEER PLEK Button',
      passed: ctaExists && ctaFunctional,
      details: ctaExists 
        ? (ctaFunctional 
            ? '✅ Button present and functional (has href or onClick)' 
            : '⚠️  Button present but may not be functional')
        : '❌ Button not found'
    });
    console.log(results[results.length - 1].details);

    // TEST 7: Check for empty sections
    console.log('\n7️⃣ Checking for Empty Sections...');
    const emptySections = await page.locator('section:empty, div[class*="empty"], div:has-text("Geen workshops")').count();
    results.push({
      test: 'Empty Sections',
      passed: emptySections === 0,
      details: emptySections === 0 
        ? '✅ No empty sections detected' 
        : `⚠️  Found ${emptySections} potentially empty sections`
    });
    console.log(results[results.length - 1].details);

    // Additional: Log all console errors
    if (consoleErrors.length > 0) {
      console.log('\n⚠️  CONSOLE ERRORS DETECTED:');
      consoleErrors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err}`);
      });
    } else {
      console.log('\n✅ No console errors detected');
    }

  } catch (error) {
    console.error('\n❌ Validation failed:', error);
    results.push({
      test: 'Script Execution',
      passed: false,
      details: `Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }

  return results;
}

async function main() {
  const results = await validateStudioPage();

  // Print summary
  console.log('\n\n📋 VALIDATION SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(0);

  results.forEach(r => {
    console.log(`${r.passed ? '✅' : '❌'} ${r.test}`);
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📊 Score: ${passed}/${total} tests passed (${passRate}%)`);

  if (passed === total) {
    console.log('\n🎉 VERIFIED LIVE: Studio page fully operational\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  PARTIAL SUCCESS: Some issues detected, review above\n');
    process.exit(1);
  }
}

main();
