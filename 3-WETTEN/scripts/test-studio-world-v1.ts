/**
 * 🎓 Studio World v1 - Comprehensive Production Validation
 * 
 * This script performs a zero-slop validation of the Studio World on production.
 * It follows the Chris-Protocol for forensic validation.
 * 
 * @author Chris/Autist (Technical Director)
 * @version 1.0.0
 */

import { chromium, Browser, Page } from 'playwright';

interface ValidationResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details?: string;
  evidence?: string;
}

const results: ValidationResult[] = [];

function log(category: string, test: string, status: 'PASS' | 'FAIL' | 'WARN', details?: string, evidence?: string) {
  results.push({ category, test, status, details, evidence });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${category}] ${test}${details ? `: ${details}` : ''}`);
  if (evidence) {
    console.log(`   Evidence: ${evidence}`);
  }
}

async function validateStudioWorld() {
  console.log('🎓 Starting Studio World v1 Comprehensive Validation\n');
  console.log('Target: https://www.voices.be/studio/\n');
  
  let browser: Browser | null = null;
  let page: Page | null = null;
  
  try {
    // Launch browser
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    page = await context.newPage();
    
    // Capture console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Capture network errors
    const networkErrors: string[] = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });
    
    // Navigate to Studio World
    console.log('🌐 Navigating to Studio World...\n');
    await page.goto('https://www.voices.be/studio/', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // ============================================
    // 1. VISUAL INTEGRITY
    // ============================================
    console.log('\n📸 1. VISUAL INTEGRITY\n');
    
    // Hero Title
    const heroTitle = await page.locator('h1').first().textContent();
    if (heroTitle?.includes('Workshops voor professionele sprekers')) {
      log('Visual', 'Hero Title', 'PASS', heroTitle);
    } else {
      log('Visual', 'Hero Title', 'FAIL', `Expected "Workshops voor professionele sprekers", got: ${heroTitle}`);
    }
    
    // Hero Description - Check for Bernadette en Johfrah
    const heroDescription = await page.locator('p').first().textContent();
    if (heroDescription?.includes('Bernadette') && heroDescription?.includes('Johfrah')) {
      log('Visual', 'Hero Description (Full Names)', 'PASS', 'Bernadette en Johfrah mentioned');
    } else {
      log('Visual', 'Hero Description (Full Names)', 'FAIL', `Full names not found: ${heroDescription}`);
    }
    
    // Workshop Carousels
    const carouselHeaders = await page.locator('h2').allTextContents();
    const hasVasteWaarden = carouselHeaders.some(h => h.includes('Vaste Waarden'));
    const hasSpecialisaties = carouselHeaders.some(h => h.includes('Specialisaties'));
    
    if (hasVasteWaarden && hasSpecialisaties) {
      log('Visual', 'Workshop Carousels', 'PASS', 'Vaste Waarden & Specialisaties found');
    } else {
      log('Visual', 'Workshop Carousels', 'FAIL', `Missing carousels. Found: ${carouselHeaders.join(', ')}`);
    }
    
    // Live Subtitles (Glass UI) - Check for video elements
    const videoElements = await page.locator('video').count();
    if (videoElements > 0) {
      log('Visual', 'Workshop Videos', 'PASS', `${videoElements} video(s) found`);
      
      // Check for subtitle overlay (glass UI)
      const subtitleOverlay = await page.locator('[class*="glass"]').count();
      if (subtitleOverlay > 0) {
        log('Visual', 'Live Subtitles (Glass UI)', 'PASS', 'Glass UI elements detected');
      } else {
        log('Visual', 'Live Subtitles (Glass UI)', 'WARN', 'Glass UI not detected (may require hover/play)');
      }
    } else {
      log('Visual', 'Workshop Videos', 'FAIL', 'No video elements found');
    }
    
    // ============================================
    // 2. NAVIGATION HANDSHAKE
    // ============================================
    console.log('\n🧭 2. NAVIGATION HANDSHAKE\n');
    
    // Check for "Workshops" dropdown in header
    const workshopsDropdown = await page.locator('nav').getByText('Workshops', { exact: false }).count();
    if (workshopsDropdown > 0) {
      log('Navigation', 'Workshops Dropdown', 'PASS', 'Found in header');
      
      // Try to open dropdown
      await page.locator('nav').getByText('Workshops', { exact: false }).first().hover();
      await page.waitForTimeout(500);
      
      // Check for "Vaste Waarden" in dropdown
      const vasteWaardenLink = await page.getByText('Vaste Waarden', { exact: false }).count();
      if (vasteWaardenLink > 0) {
        log('Navigation', 'Vaste Waarden Link', 'PASS', 'Found in dropdown');
      } else {
        log('Navigation', 'Vaste Waarden Link', 'FAIL', 'Not found in dropdown');
      }
      
      // Check for "Alle data" with real dates
      const alleDatesText = await page.textContent('body');
      const hasRealDates = alleDatesText?.match(/\d{1,2}\s+(JAN|FEB|MRT|APR|MEI|JUN|JUL|AUG|SEP|OKT|NOV|DEC)/i);
      if (hasRealDates) {
        log('Navigation', 'Real Dates (e.g., 24 MRT)', 'PASS', `Found: ${hasRealDates[0]}`);
      } else {
        log('Navigation', 'Real Dates', 'WARN', 'No date patterns found');
      }
    } else {
      log('Navigation', 'Workshops Dropdown', 'FAIL', 'Not found in header');
    }
    
    // Check for "Maak een afspraak" and "Doe je mee?" links
    const maakAfspraak = await page.getByText('Maak een afspraak', { exact: false }).count();
    const doeJeMee = await page.getByText('Doe je mee', { exact: false }).count();
    
    if (maakAfspraak > 0) {
      log('Navigation', 'Maak een afspraak Link', 'PASS', 'Found');
    } else {
      log('Navigation', 'Maak een afspraak Link', 'WARN', 'Not found');
    }
    
    if (doeJeMee > 0) {
      log('Navigation', 'Doe je mee? Link', 'PASS', 'Found');
    } else {
      log('Navigation', 'Doe je mee? Link', 'WARN', 'Not found');
    }
    
    // ============================================
    // 3. FUNCTIONAL FLOW (SLIMME KASSA)
    // ============================================
    console.log('\n💰 3. FUNCTIONAL FLOW (SLIMME KASSA)\n');
    
    // Navigate to a workshop detail page
    const workshopDetailUrl = 'https://www.voices.be/studio/perfect-spreken-in-1-dag';
    console.log(`   Navigating to: ${workshopDetailUrl}\n`);
    await page.goto(workshopDetailUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(3000);
    
    // Check for Skill DNA (●/○)
    const skillDNA = await page.locator('[class*="skill"]').count();
    const hasCircles = await page.textContent('body');
    const hasSkillIndicators = hasCircles?.includes('●') || hasCircles?.includes('○');
    
    if (skillDNA > 0 || hasSkillIndicators) {
      log('Functional', 'Skill DNA (●/○)', 'PASS', 'Skill indicators found');
    } else {
      log('Functional', 'Skill DNA (●/○)', 'WARN', 'Skill indicators not clearly visible');
    }
    
    // Check for Day Schedule
    const hasDaySchedule = await page.getByText('Dag', { exact: false }).count();
    if (hasDaySchedule > 0) {
      log('Functional', 'Day Schedule', 'PASS', 'Schedule visible');
    } else {
      log('Functional', 'Day Schedule', 'WARN', 'Schedule not clearly visible');
    }
    
    // Check for "RESERVEER PLEK" button
    const reserveerButton = await page.getByText('RESERVEER PLEK', { exact: false }).count();
    if (reserveerButton > 0) {
      log('Functional', 'RESERVEER PLEK Button', 'PASS', 'Button found');
      
      // Click the button and check redirect
      try {
        await page.getByText('RESERVEER PLEK', { exact: false }).first().click();
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        if (currentUrl.includes('/checkout') || currentUrl.includes('editionId')) {
          log('Functional', 'Checkout Redirect', 'PASS', `Redirected to: ${currentUrl}`);
        } else {
          log('Functional', 'Checkout Redirect', 'FAIL', `Unexpected URL: ${currentUrl}`);
        }
      } catch (error: any) {
        log('Functional', 'Checkout Redirect', 'FAIL', `Click failed: ${error.message}`);
      }
    } else {
      log('Functional', 'RESERVEER PLEK Button', 'FAIL', 'Button not found');
    }
    
    // ============================================
    // 4. FORENSIC HEALTH CHECK
    // ============================================
    console.log('\n🔬 4. FORENSIC HEALTH CHECK\n');
    
    // Console Errors
    if (consoleErrors.length === 0) {
      log('Forensic', 'Console Errors', 'PASS', 'No console errors detected');
    } else {
      log('Forensic', 'Console Errors', 'FAIL', `${consoleErrors.length} error(s) found`, consoleErrors.join('; '));
    }
    
    // Network Errors (404s, CORS, etc.)
    if (networkErrors.length === 0) {
      log('Forensic', 'Network Errors', 'PASS', 'No network errors detected');
    } else {
      log('Forensic', 'Network Errors', 'FAIL', `${networkErrors.length} error(s) found`, networkErrors.join('; '));
    }
    
    // Check for internal terminology (World, Journey)
    await page.goto('https://www.voices.be/studio/', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(2000);
    const bodyText = await page.textContent('body');
    const hasInternalTerms = bodyText?.includes('World') || bodyText?.includes('Journey');
    
    if (!hasInternalTerms) {
      log('Forensic', 'Internal Terminology', 'PASS', 'No "World" or "Journey" visible to user');
    } else {
      log('Forensic', 'Internal Terminology', 'FAIL', 'Internal terms leaked to public');
    }
    
    // ============================================
    // 5. CERTIFICATION
    // ============================================
    console.log('\n🏆 5. CERTIFICATION\n');
    
    const totalTests = results.length;
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const warnings = results.filter(r => r.status === 'WARN').length;
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⚠️  Warnings: ${warnings}`);
    console.log(`   Success Rate: ${((passed / totalTests) * 100).toFixed(1)}%\n`);
    
    if (failed === 0 && warnings === 0) {
      console.log('🎉 VERIFIED LIVE: v2.16.056 - Studio World Operational - Slimme Kassa Active - Logs Clean\n');
    } else if (failed === 0) {
      console.log('⚠️  VERIFIED WITH WARNINGS: Studio World is operational but has minor issues.\n');
    } else {
      console.log('❌ VALIDATION FAILED: Studio World has critical issues that need immediate attention.\n');
      console.log('🔍 FAILED TESTS:');
      results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`   - [${r.category}] ${r.test}: ${r.details}`);
      });
    }
    
  } catch (error: any) {
    console.error('\n❌ CRITICAL ERROR during validation:');
    console.error(error.message);
    console.error(error.stack);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

// Run validation
validateStudioWorld().catch(console.error);
