#!/usr/bin/env tsx
/**
 * Artist Page Test Suite - Black World DNA & UX Validation
 * Tests scenarios 16-20 as requested by Chris
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  scenario: string;
  status: 'PASS' | 'FAIL';
  errors: string[];
  consoleErrors: string[];
  screenshotPath?: string;
  details: string[];
}

const LIVE_URL = 'https://www.voices.be';
const ARTIST_SLUG = 'johfrah';
const SCREENSHOT_DIR = path.join(__dirname, '../test-results/artist-page');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function captureScreenshot(page: Page, name: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

async function test16_BlackWorldDNA(page: Page): Promise<TestResult> {
  const result: TestResult = {
    scenario: '16. Artist Page (Black World) DNA',
    status: 'PASS',
    errors: [],
    consoleErrors: [],
    details: []
  };

  try {
    console.log('\n🎭 Test 16: Black World DNA Verification');
    
    await page.goto(`${LIVE_URL}/${ARTIST_SLUG}`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait for page to be fully loaded
    await page.waitForTimeout(2000);

    result.screenshotPath = await captureScreenshot(page, 'test16-black-world-dna');

    // Check for dark background (Black World DNA)
    const bodyBg = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      return {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color
      };
    });

    result.details.push(`Body background: ${bodyBg.backgroundColor}`);
    result.details.push(`Body color: ${bodyBg.color}`);

    // Check for specific Black World styling elements
    const hasBlackWorldClass = await page.evaluate(() => {
      const body = document.body;
      const main = document.querySelector('main');
      return {
        bodyClasses: body.className,
        mainClasses: main?.className || 'not found',
        hasDarkBg: body.className.includes('bg-black') || 
                   body.className.includes('bg-gray-900') ||
                   main?.className.includes('bg-black') ||
                   main?.className.includes('bg-gray-900')
      };
    });

    result.details.push(`Body classes: ${hasBlackWorldClass.bodyClasses}`);
    result.details.push(`Main classes: ${hasBlackWorldClass.mainClasses}`);
    result.details.push(`Has dark background: ${hasBlackWorldClass.hasDarkBg}`);

    if (!hasBlackWorldClass.hasDarkBg) {
      result.errors.push('Black World DNA not detected: No dark background classes found');
      result.status = 'FAIL';
    }

    // Check for artist-specific styling
    const artistElements = await page.evaluate(() => {
      const heroSection = document.querySelector('[data-world="artist"]') || 
                         document.querySelector('.artist-hero');
      return {
        hasArtistWorld: !!document.querySelector('[data-world="artist"]'),
        hasHeroSection: !!heroSection,
        heroClasses: heroSection?.className || 'not found'
      };
    });

    result.details.push(`Artist world marker: ${artistElements.hasArtistWorld}`);
    result.details.push(`Hero section found: ${artistElements.hasHeroSection}`);

  } catch (error) {
    result.status = 'FAIL';
    result.errors.push(`Test execution failed: ${error}`);
  }

  return result;
}

async function test17_DemoPlayerFunctionality(page: Page): Promise<TestResult> {
  const result: TestResult = {
    scenario: '17. Demo Player Functionaliteit',
    status: 'PASS',
    errors: [],
    consoleErrors: [],
    details: []
  };

  try {
    console.log('\n🎵 Test 17: Demo Player Functionality');

    // Check for demo player presence
    const playerInfo = await page.evaluate(() => {
      const audioElements = document.querySelectorAll('audio');
      const playButtons = document.querySelectorAll('[data-audio-player], [aria-label*="play"], button[class*="play"]');
      const demoSections = document.querySelectorAll('[data-demos], .demos, [class*="demo"]');
      
      return {
        audioCount: audioElements.length,
        playButtonCount: playButtons.length,
        demoSectionCount: demoSections.length,
        audioSources: Array.from(audioElements).map(a => a.src || a.querySelector('source')?.src)
      };
    });

    result.details.push(`Audio elements found: ${playerInfo.audioCount}`);
    result.details.push(`Play buttons found: ${playerInfo.playButtonCount}`);
    result.details.push(`Demo sections found: ${playerInfo.demoSectionCount}`);
    result.details.push(`Audio sources: ${playerInfo.audioSources.join(', ')}`);

    if (playerInfo.audioCount === 0 && playerInfo.playButtonCount === 0) {
      result.errors.push('No demo player or audio elements found on artist page');
      result.status = 'FAIL';
    }

    // Try to find and click a play button if present
    if (playerInfo.playButtonCount > 0) {
      try {
        const playButton = await page.locator('[data-audio-player], [aria-label*="play"], button[class*="play"]').first();
        await playButton.click({ timeout: 5000 });
        await page.waitForTimeout(1000);
        
        result.details.push('Play button clicked successfully');

        // Check if audio is playing
        const isPlaying = await page.evaluate(() => {
          const audio = document.querySelector('audio');
          return audio ? !audio.paused : false;
        });

        result.details.push(`Audio playing: ${isPlaying}`);
      } catch (error) {
        result.errors.push(`Could not interact with play button: ${error}`);
      }
    }

    result.screenshotPath = await captureScreenshot(page, 'test17-demo-player');

  } catch (error) {
    result.status = 'FAIL';
    result.errors.push(`Test execution failed: ${error}`);
  }

  return result;
}

async function test18_ContactButtonIsolation(page: Page): Promise<TestResult> {
  const result: TestResult = {
    scenario: '18. Contact/Boekingsknop Isolatie',
    status: 'PASS',
    errors: [],
    consoleErrors: [],
    details: []
  };

  try {
    console.log('\n🎯 Test 18: Casting Elements Isolation');

    const castingElements = await page.evaluate(() => {
      const castingDock = document.querySelector('[data-casting-dock], .casting-dock, [class*="casting"]');
      const globalCTA = document.querySelector('[data-global-cta]');
      const bookingButtons = document.querySelectorAll('[data-booking], button[class*="booking"]');
      
      return {
        hasCastingDock: !!castingDock,
        castingDockVisible: castingDock ? window.getComputedStyle(castingDock).display !== 'none' : false,
        hasGlobalCTA: !!globalCTA,
        bookingButtonCount: bookingButtons.length,
        castingDockClasses: castingDock?.className || 'not found'
      };
    });

    result.details.push(`Casting dock found: ${castingElements.hasCastingDock}`);
    result.details.push(`Casting dock visible: ${castingElements.castingDockVisible}`);
    result.details.push(`Global CTA found: ${castingElements.hasGlobalCTA}`);
    result.details.push(`Booking buttons: ${castingElements.bookingButtonCount}`);

    // On artist pages, global casting elements should be hidden
    if (castingElements.castingDockVisible) {
      result.errors.push('Casting dock is visible on artist page - should be hidden for focus isolation');
      result.status = 'FAIL';
    }

    // Check for artist-specific contact options
    const artistContact = await page.evaluate(() => {
      const contactButtons = document.querySelectorAll('a[href*="mailto"], a[href*="contact"], button[class*="contact"]');
      return {
        contactButtonCount: contactButtons.length,
        contactLinks: Array.from(contactButtons).map(b => ({
          text: b.textContent?.trim(),
          href: (b as HTMLAnchorElement).href
        }))
      };
    });

    result.details.push(`Artist contact buttons: ${artistContact.contactButtonCount}`);
    result.details.push(`Contact options: ${JSON.stringify(artistContact.contactLinks)}`);

    result.screenshotPath = await captureScreenshot(page, 'test18-contact-isolation');

  } catch (error) {
    result.status = 'FAIL';
    result.errors.push(`Test execution failed: ${error}`);
  }

  return result;
}

async function test19_SEOSchemaValidation(page: Page): Promise<TestResult> {
  const result: TestResult = {
    scenario: '19. SEO & Schema.org Validatie',
    status: 'PASS',
    errors: [],
    consoleErrors: [],
    details: []
  };

  try {
    console.log('\n🔍 Test 19: SEO & Schema.org Validation');

    const schemaData = await page.evaluate(() => {
      const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      const parsed = schemas.map(s => {
        try {
          return JSON.parse(s.textContent || '{}');
        } catch {
          return null;
        }
      }).filter(Boolean);

      return {
        schemaCount: schemas.length,
        schemas: parsed,
        types: parsed.map(p => p['@type']).filter(Boolean)
      };
    });

    result.details.push(`Schema.org scripts found: ${schemaData.schemaCount}`);
    result.details.push(`Schema types: ${schemaData.types.join(', ')}`);

    // Check for Person or Service schema
    const hasPersonSchema = schemaData.types.includes('Person');
    const hasServiceSchema = schemaData.types.includes('Service');

    result.details.push(`Has Person schema: ${hasPersonSchema}`);
    result.details.push(`Has Service schema: ${hasServiceSchema}`);

    if (!hasPersonSchema && !hasServiceSchema) {
      result.errors.push('No Person or Service schema found on artist page');
      result.status = 'FAIL';
    }

    // Check meta tags
    const metaTags = await page.evaluate(() => {
      const title = document.title;
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
      const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
      const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');

      return {
        title,
        description,
        ogTitle,
        ogDescription,
        ogImage,
        canonical
      };
    });

    result.details.push(`Page title: ${metaTags.title}`);
    result.details.push(`Meta description: ${metaTags.description}`);
    result.details.push(`Canonical URL: ${metaTags.canonical}`);
    result.details.push(`OG Image: ${metaTags.ogImage}`);

    if (!metaTags.canonical?.startsWith('https://www.voices.be/')) {
      result.errors.push(`Canonical URL does not match mandate: ${metaTags.canonical}`);
      result.status = 'FAIL';
    }

    result.screenshotPath = await captureScreenshot(page, 'test19-seo-schema');

  } catch (error) {
    result.status = 'FAIL';
    result.errors.push(`Test execution failed: ${error}`);
  }

  return result;
}

async function test20_MobileThumbZone(page: Page): Promise<TestResult> {
  const result: TestResult = {
    scenario: '20. Mobile Thumb-Zone Check',
    status: 'PASS',
    errors: [],
    consoleErrors: [],
    details: []
  };

  try {
    console.log('\n📱 Test 20: Mobile Thumb-Zone Validation');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.waitForTimeout(1000);

    result.screenshotPath = await captureScreenshot(page, 'test20-mobile-thumb-zone');

    const thumbZoneAnalysis = await page.evaluate(() => {
      const viewportHeight = window.innerHeight;
      const thumbZoneStart = viewportHeight * 0.5; // Bottom 50% is thumb-friendly
      const thumbZoneEnd = viewportHeight;

      const actionButtons = document.querySelectorAll(
        'button[class*="cta"], a[class*="cta"], button[class*="primary"], a[class*="primary"], [data-action]'
      );

      const buttonPositions = Array.from(actionButtons).map(btn => {
        const rect = btn.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const inThumbZone = centerY >= thumbZoneStart && centerY <= thumbZoneEnd;

        return {
          text: btn.textContent?.trim().substring(0, 30),
          top: rect.top,
          centerY,
          inThumbZone,
          classes: btn.className
        };
      });

      return {
        viewportHeight,
        thumbZoneStart,
        thumbZoneEnd,
        totalButtons: actionButtons.length,
        buttonPositions,
        buttonsInThumbZone: buttonPositions.filter(b => b.inThumbZone).length
      };
    });

    result.details.push(`Viewport height: ${thumbZoneAnalysis.viewportHeight}px`);
    result.details.push(`Thumb-zone range: ${thumbZoneAnalysis.thumbZoneStart}px - ${thumbZoneAnalysis.thumbZoneEnd}px`);
    result.details.push(`Total action buttons: ${thumbZoneAnalysis.totalButtons}`);
    result.details.push(`Buttons in thumb-zone: ${thumbZoneAnalysis.buttonsInThumbZone}`);

    thumbZoneAnalysis.buttonPositions.forEach((btn, idx) => {
      result.details.push(
        `Button ${idx + 1}: "${btn.text}" at ${btn.centerY.toFixed(0)}px - ${btn.inThumbZone ? '✅ IN ZONE' : '❌ OUT OF ZONE'}`
      );
    });

    if (thumbZoneAnalysis.totalButtons > 0 && thumbZoneAnalysis.buttonsInThumbZone === 0) {
      result.errors.push('No primary action buttons found in mobile thumb-zone');
      result.status = 'FAIL';
    }

  } catch (error) {
    result.status = 'FAIL';
    result.errors.push(`Test execution failed: ${error}`);
  }

  return result;
}

async function runAllTests() {
  console.log('🚀 Starting Artist Page Test Suite');
  console.log(`Target: ${LIVE_URL}/${ARTIST_SLUG}`);
  console.log('=' .repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // Collect console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const results: TestResult[] = [];

  try {
    // Run all tests
    results.push(await test16_BlackWorldDNA(page));
    results.push(await test17_DemoPlayerFunctionality(page));
    results.push(await test18_ContactButtonIsolation(page));
    results.push(await test19_SEOSchemaValidation(page));
    results.push(await test20_MobileThumbZone(page));

    // Add console errors to all results
    results.forEach(r => r.consoleErrors = [...consoleErrors]);

  } finally {
    await browser.close();
  }

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));

  results.forEach(result => {
    console.log(`\n${result.scenario}`);
    console.log(`Status: ${result.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    
    if (result.details.length > 0) {
      console.log('\nDetails:');
      result.details.forEach(d => console.log(`  - ${d}`));
    }

    if (result.errors.length > 0) {
      console.log('\n🚨 Errors:');
      result.errors.forEach(e => console.log(`  - ${e}`));
    }

    if (result.screenshotPath) {
      console.log(`\n📸 Screenshot: ${result.screenshotPath}`);
    }
  });

  if (consoleErrors.length > 0) {
    console.log('\n🚨 Console Errors Detected:');
    consoleErrors.forEach(e => console.log(`  - ${e}`));
  }

  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;

  console.log('\n' + '='.repeat(60));
  console.log(`FINAL SCORE: ${passCount} PASS / ${failCount} FAIL`);
  console.log('='.repeat(60));

  // Exit with error code if any tests failed
  process.exit(failCount > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
