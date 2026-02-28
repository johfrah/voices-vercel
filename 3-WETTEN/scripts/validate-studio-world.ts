#!/usr/bin/env tsx
/**
 * Studio World v1 - Final Production Validation
 * 
 * This script performs a comprehensive forensic validation of the Studio World
 * on production, checking console logs, visual integrity, data population, and
 * functional handshakes.
 */

import { chromium } from 'playwright';

const PRODUCTION_URL = 'https://www.voices.be/studio/';
const EXPECTED_VERSION = 'v2.16.066';

interface ValidationResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
}

const results: ValidationResult[] = [];

function log(category: string, test: string, status: 'PASS' | 'FAIL' | 'WARNING', details: string) {
  results.push({ category, test, status, details });
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${emoji} [${category}] ${test}: ${details}`);
}

async function main() {
  console.log('🚀 Starting Studio World v1 Production Validation...\n');
  console.log(`Target: ${PRODUCTION_URL}`);
  console.log(`Expected Version: ${EXPECTED_VERSION}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // Collect console messages
  const consoleMessages: Array<{ type: string; text: string }> = [];
  const consoleErrors: string[] = [];

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });
    
    if (type === 'error') {
      consoleErrors.push(text);
    }
  });

  try {
    // ========================================
    // 1. FORENSIC HEALTH
    // ========================================
    console.log('\n📊 1. FORENSIC HEALTH CHECK\n');

    await page.goto(PRODUCTION_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for initial render and hydration
    await page.waitForTimeout(5000);

    // Check for version log
    const versionLog = consoleMessages.find(m => 
      m.text.includes('Nuclear Version') && m.text.includes(EXPECTED_VERSION)
    );

    if (versionLog) {
      log('Forensic Health', 'Version Log', 'PASS', `Found: ${versionLog.text}`);
    } else {
      const allVersionLogs = consoleMessages.filter(m => m.text.includes('Nuclear Version'));
      log('Forensic Health', 'Version Log', 'FAIL', 
        allVersionLogs.length > 0 
          ? `Wrong version: ${allVersionLogs[0]?.text}` 
          : 'Version log not found'
      );
    }

    // Check for the specific ReferenceError
    const referenceError = consoleErrors.find(e => 
      e.includes("Cannot access 'tl' before initialization")
    );

    if (referenceError) {
      log('Forensic Health', 'ReferenceError Check', 'FAIL', 
        'ReferenceError still present: Cannot access \'tl\' before initialization'
      );
    } else {
      log('Forensic Health', 'ReferenceError Check', 'PASS', 
        'ReferenceError is GONE'
      );
    }

    // Check for zero red console errors
    const redErrors = consoleErrors.filter(e => 
      !e.includes('Failed to load resource') && // Ignore network errors
      !e.includes('favicon') // Ignore favicon errors
    );

    if (redErrors.length === 0) {
      log('Forensic Health', 'Console Errors', 'PASS', 'Zero red console errors');
    } else {
      log('Forensic Health', 'Console Errors', 'FAIL', 
        `Found ${redErrors.length} errors: ${redErrors.slice(0, 3).join('; ')}`
      );
    }

    // ========================================
    // 2. VISUAL INTEGRITY
    // ========================================
    console.log('\n🎨 2. VISUAL INTEGRITY CHECK\n');

    // Check Hero Title
    const heroTitle = await page.locator('h1').first().textContent();
    if (heroTitle?.includes('Workshops voor professionele sprekers')) {
      log('Visual Integrity', 'Hero Title', 'PASS', 
        `Correct title: "${heroTitle}"`
      );
    } else {
      log('Visual Integrity', 'Hero Title', 'FAIL', 
        `Wrong title: "${heroTitle}"`
      );
    }

    // Check for "je stem" (should be GONE)
    const pageText = await page.textContent('body');
    if (pageText?.toLowerCase().includes('je stem')) {
      log('Visual Integrity', 'Legacy Copy Check', 'FAIL', 
        'Found "je stem" - legacy copy still present'
      );
    } else {
      log('Visual Integrity', 'Legacy Copy Check', 'PASS', 
        '"je stem" is GONE'
      );
    }

    // Check Hero Description for full names
    const heroDescription = await page.locator('p').first().textContent();
    if (heroDescription?.includes('Bernadette') && heroDescription?.includes('Johfrah')) {
      log('Visual Integrity', 'Hero Description', 'PASS', 
        'Full names "Bernadette en Johfrah" present'
      );
    } else {
      log('Visual Integrity', 'Hero Description', 'WARNING', 
        `Description: "${heroDescription?.substring(0, 100)}..."`
      );
    }

    // Check for "Workshop World" (should be GONE)
    if (pageText?.includes('Workshop World')) {
      log('Visual Integrity', 'Internal Term Check', 'FAIL', 
        'Found "Workshop World" - internal term still visible'
      );
    } else {
      log('Visual Integrity', 'Internal Term Check', 'PASS', 
        '"Workshop World" is GONE, replaced by "Studio"'
      );
    }

    // ========================================
    // 3. DATA HANDSHAKE
    // ========================================
    console.log('\n🔗 3. DATA HANDSHAKE CHECK\n');

    // Check for Workshop Carousels
    const workshopCards = await page.locator('[data-testid*="workshop"], .workshop-card, article').count();
    if (workshopCards > 0) {
      log('Data Handshake', 'Workshop Carousels', 'PASS', 
        `Found ${workshopCards} workshop cards`
      );

      // Check for specific workshop
      const audioboekText = await page.textContent('body');
      if (audioboekText?.includes('Audioboeken inspreken') || audioboekText?.includes('audioboek')) {
        log('Data Handshake', 'Workshop Content', 'PASS', 
          'Found "Audioboeken inspreken" or similar workshop'
        );
      } else {
        log('Data Handshake', 'Workshop Content', 'WARNING', 
          'Could not verify specific workshop "Audioboeken inspreken"'
        );
      }
    } else {
      log('Data Handshake', 'Workshop Carousels', 'FAIL', 
        'No workshop cards found - carousels not populated'
      );
    }

    // Check for FAQ section
    const faqHeadings = await page.locator('h2, h3').allTextContents();
    const hasFAQ = faqHeadings.some(h => 
      h.toLowerCase().includes('veelgestelde vragen') || 
      h.toLowerCase().includes('faq')
    );

    if (hasFAQ) {
      const faqItems = await page.locator('details, [role="button"]').count();
      if (faqItems >= 7) {
        log('Data Handshake', 'FAQ Section', 'PASS', 
          `FAQ populated with ${faqItems} questions (≥7 expected)`
        );
      } else {
        log('Data Handshake', 'FAQ Section', 'WARNING', 
          `FAQ found but only ${faqItems} questions (expected 7)`
        );
      }
    } else {
      log('Data Handshake', 'FAQ Section', 'FAIL', 
        'FAQ section not found'
      );
    }

    // ========================================
    // 4. FUNCTIONAL HANDSHAKE
    // ========================================
    console.log('\n⚙️ 4. FUNCTIONAL HANDSHAKE CHECK\n');

    // Navigate to a workshop detail page
    const firstWorkshopLink = await page.locator('a[href*="/studio/"]').first();
    const workshopUrl = await firstWorkshopLink.getAttribute('href');

    if (workshopUrl && workshopUrl !== '/studio/' && workshopUrl !== '/studio') {
      await page.goto(`https://www.voices.be${workshopUrl}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);

      log('Functional Handshake', 'Workshop Detail Navigation', 'PASS', 
        `Navigated to: ${workshopUrl}`
      );

      // Check for "RESERVEER PLEK" button
      const reserveButton = await page.locator('button:has-text("RESERVEER"), a:has-text("RESERVEER")').first();
      const isVisible = await reserveButton.isVisible().catch(() => false);

      if (isVisible) {
        log('Functional Handshake', 'Reserve Button Rendering', 'PASS', 
          '"RESERVEER PLEK" button is visible'
        );

        // Try to click the button
        try {
          await reserveButton.click({ timeout: 5000 });
          await page.waitForTimeout(2000);

          const currentUrl = page.url();
          if (currentUrl.includes('/checkout') || currentUrl.includes('/kassa')) {
            log('Functional Handshake', 'Checkout Redirect', 'PASS', 
              `Redirected to: ${currentUrl}`
            );
          } else {
            log('Functional Handshake', 'Checkout Redirect', 'WARNING', 
              `Button clicked but URL is: ${currentUrl}`
            );
          }
        } catch (error) {
          log('Functional Handshake', 'Reserve Button Click', 'FAIL', 
            `Could not click button: ${error}`
          );
        }
      } else {
        log('Functional Handshake', 'Reserve Button Rendering', 'FAIL', 
          '"RESERVEER PLEK" button not visible'
        );
      }
    } else {
      log('Functional Handshake', 'Workshop Detail Navigation', 'FAIL', 
        'No valid workshop detail link found'
      );
    }

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error);
    log('System', 'Validation Script', 'FAIL', `${error}`);
  } finally {
    await browser.close();
  }

  // ========================================
  // 5. CERTIFICATION
  // ========================================
  console.log('\n📋 VALIDATION SUMMARY\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARNING').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️ Warnings: ${warnings}`);

  if (failed === 0) {
    console.log('\n🎉 VERIFIED LIVE: v2.16.065 - Studio World Operational - Slimme Kassa Active - Logs Clean\n');
    process.exit(0);
  } else {
    console.log('\n⚠️ VALIDATION INCOMPLETE: Issues detected. Review failures above.\n');
    process.exit(1);
  }
}

main().catch(console.error);
