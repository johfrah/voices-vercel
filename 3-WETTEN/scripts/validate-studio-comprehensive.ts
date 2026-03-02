#!/usr/bin/env tsx
/**
 * 🎓 Comprehensive Studio Browser Validation
 * 
 * Validates:
 * 1. Version (v2.24.7 or higher)
 * 2. Studio navigation menu
 * 3. Workshop Carousel visibility
 * 4. Workshop Calendar visibility
 * 5. Console errors (especially React #419 hydration errors)
 * 6. 'Boek nu' or 'Bekijk workshop' buttons
 * 7. Specific workshop titles
 */

import { chromium, Browser, Page } from 'playwright';

const STUDIO_URL = 'https://www.voices.be/studio/';
const MIN_VERSION = 'v2.24.7';

interface ValidationResult {
  test: string;
  passed: boolean;
  details: string;
  data?: any;
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.replace('v', '').split('.').map(Number);
  const parts2 = v2.replace('v', '').split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  return 0;
}

async function validateStudioPage(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log('\n🎓 COMPREHENSIVE STUDIO VALIDATION');
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
    const consoleWarnings: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(text);
      }
    });

    // Collect page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // Navigate to Studio page
    console.log(`📍 Navigating to ${STUDIO_URL}...`);
    try {
      await page.goto(STUDIO_URL, { waitUntil: 'networkidle', timeout: 20000 });
      console.log('✅ Page loaded\n');
    } catch (error) {
      console.log('⚠️  Page load timeout, continuing...\n');
      try {
        await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
      } catch {}
    }

    // Wait for hydration and dynamic content
    await page.waitForTimeout(5000);

    // TEST 1: Check Version
    console.log('1️⃣ Checking Version...');
    let foundVersion = '';
    
    // Try to find version in console
    const versionLog = consoleMessages.find(msg => 
      msg.includes('[Voices] Nuclear Version:') || msg.includes('Version:')
    );
    if (versionLog) {
      const match = versionLog.match(/v?\d+\.\d+\.\d+/);
      if (match) foundVersion = match[0].startsWith('v') ? match[0] : `v${match[0]}`;
    }
    
    // Try to find version in footer
    if (!foundVersion) {
      const footerText = await page.locator('footer').textContent().catch(() => '');
      const match = footerText.match(/v?\d+\.\d+\.\d+/);
      if (match) foundVersion = match[0].startsWith('v') ? match[0] : `v${match[0]}`;
    }
    
    // Try to find version in meta tags or data attributes
    if (!foundVersion) {
      foundVersion = await page.evaluate(() => {
        const versionMeta = document.querySelector('[data-version]');
        return versionMeta?.getAttribute('data-version') || '';
      });
    }
    
    const versionOk = foundVersion && compareVersions(foundVersion, MIN_VERSION) >= 0;
    results.push({
      test: 'Version Check',
      passed: versionOk,
      details: foundVersion 
        ? (versionOk 
            ? `✅ Version ${foundVersion} (>= ${MIN_VERSION})` 
            : `⚠️  Version ${foundVersion} (< ${MIN_VERSION})`)
        : '❌ Version not found',
      data: { foundVersion, minVersion: MIN_VERSION }
    });
    console.log(results[results.length - 1].details);

    // TEST 2: Check Studio Navigation Menu
    console.log('\n2️⃣ Checking Studio Navigation Menu...');
    const navText = await page.locator('nav, header').textContent().catch(() => '');
    const hasWorkshops = navText.includes('Workshops') || navText.includes('workshops');
    const hasTarieven = navText.includes('Tarieven') || navText.includes('tarieven');
    const hasStudioMenu = hasWorkshops || hasTarieven;
    
    // Get all navigation links
    const navLinks = await page.locator('nav a, header a').allTextContents().catch(() => []);
    
    results.push({
      test: 'Studio Navigation Menu',
      passed: hasStudioMenu,
      details: hasStudioMenu 
        ? `✅ Studio menu found (Workshops: ${hasWorkshops}, Tarieven: ${hasTarieven})` 
        : '❌ Studio menu not found',
      data: { navLinks: navLinks.slice(0, 10) }
    });
    console.log(results[results.length - 1].details);
    if (navLinks.length > 0) {
      console.log(`   Navigation links: ${navLinks.slice(0, 5).join(', ')}${navLinks.length > 5 ? '...' : ''}`);
    }

    // TEST 3: Check Workshop Carousel
    console.log('\n3️⃣ Checking Workshop Carousel...');
    const pageText = await page.textContent('body').catch(() => '');
    
    // Look for carousel indicators
    const hasCarouselText = pageText.includes('Vaste Waarden') || 
                           pageText.includes('Specialisaties') ||
                           pageText.includes('Workshop');
    
    // Count workshop-related elements
    const workshopElements = await page.locator('[data-workshop], [class*="workshop"], [class*="carousel"]').count();
    
    // Try to find workshop titles
    const workshopTitles: string[] = [];
    const headings = await page.locator('h2, h3, h4').allTextContents();
    for (const heading of headings) {
      if (heading.length > 5 && heading.length < 100 && 
          (heading.includes('Workshop') || heading.includes('workshop') || 
           /^[A-Z]/.test(heading))) {
        workshopTitles.push(heading.trim());
      }
    }
    
    const carouselVisible = workshopElements > 0 || hasCarouselText;
    
    results.push({
      test: 'Workshop Carousel',
      passed: carouselVisible,
      details: carouselVisible 
        ? `✅ Carousel visible (${workshopElements} elements, ${workshopTitles.length} titles)` 
        : '❌ Workshop carousel not visible',
      data: { workshopTitles: workshopTitles.slice(0, 5), workshopElements }
    });
    console.log(results[results.length - 1].details);
    if (workshopTitles.length > 0) {
      console.log(`   Workshop titles found: ${workshopTitles.slice(0, 3).join(', ')}${workshopTitles.length > 3 ? '...' : ''}`);
    }

    // TEST 4: Check Workshop Calendar
    console.log('\n4️⃣ Checking Workshop Calendar...');
    const hasCalendarText = pageText.includes('Kalender') || 
                           pageText.includes('Agenda') ||
                           pageText.includes('Planning');
    const calendarElements = await page.locator('[class*="calendar"], [class*="agenda"], [data-calendar]').count();
    const calendarVisible = calendarElements > 0 || hasCalendarText;
    
    results.push({
      test: 'Workshop Calendar',
      passed: calendarVisible,
      details: calendarVisible 
        ? `✅ Calendar visible (${calendarElements} elements)` 
        : '❌ Workshop calendar not visible',
      data: { calendarElements }
    });
    console.log(results[results.length - 1].details);

    // TEST 5: Check for Console Errors (especially React #419)
    console.log('\n5️⃣ Checking Console Errors...');
    const hasHydrationError = consoleErrors.some(err => 
      err.includes('Hydration') || 
      err.includes('hydration') ||
      err.includes('#419') ||
      err.includes('Text content does not match')
    );
    
    const hasServerError = consoleErrors.some(err =>
      err.includes('Server Components render') ||
      err.includes('digest')
    );
    
    const errorCount = consoleErrors.length + pageErrors.length;
    const noErrors = errorCount === 0;
    
    results.push({
      test: 'Console Errors',
      passed: noErrors,
      details: noErrors 
        ? '✅ No console errors' 
        : `⚠️  ${errorCount} errors (Hydration: ${hasHydrationError}, Server: ${hasServerError})`,
      data: { 
        consoleErrors: consoleErrors.slice(0, 3), 
        pageErrors: pageErrors.slice(0, 3),
        hasHydrationError,
        hasServerError
      }
    });
    console.log(results[results.length - 1].details);

    // TEST 6: Check for CTA Buttons
    console.log('\n6️⃣ Checking CTA Buttons...');
    const boekNuButton = await page.locator('button, a').filter({ 
      hasText: /Boek nu|boek nu|BOEK NU/i 
    }).count();
    
    const bekijkButton = await page.locator('button, a').filter({ 
      hasText: /Bekijk workshop|bekijk workshop|BEKIJK WORKSHOP/i 
    }).count();
    
    const reserveerButton = await page.locator('button, a').filter({ 
      hasText: /Reserveer|reserveer|RESERVEER/i 
    }).count();
    
    const totalButtons = boekNuButton + bekijkButton + reserveerButton;
    const hasButtons = totalButtons > 0;
    
    results.push({
      test: 'CTA Buttons',
      passed: hasButtons,
      details: hasButtons 
        ? `✅ Found ${totalButtons} buttons (Boek nu: ${boekNuButton}, Bekijk: ${bekijkButton}, Reserveer: ${reserveerButton})` 
        : '❌ No CTA buttons found',
      data: { boekNuButton, bekijkButton, reserveerButton }
    });
    console.log(results[results.length - 1].details);

    // TEST 7: Page State Check
    console.log('\n7️⃣ Checking Page State...');
    const hasErrorState = pageText.includes('Oeps') || 
                         pageText.includes('even geduld') ||
                         pageText.includes('Error') ||
                         pageText.includes('error');
    
    const hasContent = pageText.length > 500;
    const pageHealthy = !hasErrorState && hasContent;
    
    results.push({
      test: 'Page State',
      passed: pageHealthy,
      details: pageHealthy 
        ? `✅ Page healthy (${pageText.length} chars)` 
        : `⚠️  Page in error state or empty (Error: ${hasErrorState}, Length: ${pageText.length})`,
      data: { hasErrorState, contentLength: pageText.length }
    });
    console.log(results[results.length - 1].details);

    // Additional diagnostics
    console.log('\n📊 ADDITIONAL DIAGNOSTICS:');
    console.log(`   Console messages: ${consoleMessages.length}`);
    console.log(`   Console errors: ${consoleErrors.length}`);
    console.log(`   Console warnings: ${consoleWarnings.length}`);
    console.log(`   Page errors: ${pageErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('\n⚠️  CONSOLE ERRORS:');
      consoleErrors.slice(0, 5).forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.substring(0, 150)}${err.length > 150 ? '...' : ''}`);
      });
    }
    
    if (pageErrors.length > 0) {
      console.log('\n⚠️  PAGE ERRORS:');
      pageErrors.slice(0, 5).forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.substring(0, 150)}${err.length > 150 ? '...' : ''}`);
      });
    }

    // Take a screenshot for debugging
    try {
      const screenshotPath = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/reports/studio-validation-screenshot.png';
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`\n📸 Screenshot saved: ${screenshotPath}`);
    } catch (error) {
      console.log('\n⚠️  Could not save screenshot');
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
    console.log(`${r.passed ? '✅' : '❌'} ${r.test}: ${r.details}`);
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📊 Score: ${passed}/${total} tests passed (${passRate}%)`);

  if (passed === total) {
    console.log('\n🎉 VERIFIED LIVE: Studio page fully operational\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  ISSUES DETECTED: Review above for details\n');
    process.exit(1);
  }
}

main();
