#!/usr/bin/env tsx
/**
 * 🏝️ Workshop Islands Deep Validation
 * 
 * Validates specific workshop detail pages for:
 * 1. WorkshopHeroIsland (Title, Price, CTA)
 * 2. SkillDNAIsland (Skills grid)
 * 3. DayScheduleIsland (Timeline)
 * 4. InstructorLocationIsland (Instructor info)
 * 5. Console errors (React #419 hydration)
 * 6. CTA button functionality
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface IslandValidation {
  island: string;
  present: boolean;
  details: string;
  elements?: any;
}

interface WorkshopValidation {
  url: string;
  title: string;
  islands: IslandValidation[];
  consoleErrors: string[];
  hydrationErrors: string[];
  ctaButton: {
    present: boolean;
    text: string;
    clickable: boolean;
    href: string;
  };
  screenshot?: string;
}

const WORKSHOPS = [
  {
    url: 'https://www.voices.be/studio/perfect-spreken',
    title: 'Perfect Spreken'
  },
  {
    url: 'https://www.voices.be/studio/audioboeken-inspreken',
    title: 'Audioboeken Inspreken'
  }
];

async function validateWorkshopPage(workshopUrl: string, workshopTitle: string): Promise<WorkshopValidation> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  const validation: WorkshopValidation = {
    url: workshopUrl,
    title: workshopTitle,
    islands: [],
    consoleErrors: [],
    hydrationErrors: [],
    ctaButton: {
      present: false,
      text: '',
      clickable: false,
      href: ''
    }
  };

  try {
    console.log(`\n🏝️ VALIDATING: ${workshopTitle}`);
    console.log(`📍 URL: ${workshopUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Launch browser
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    page = await context.newPage();

    // Collect console messages
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        validation.consoleErrors.push(text);
        
        // Check for hydration errors
        if (text.includes('Hydration') || 
            text.includes('hydration') ||
            text.includes('#419') ||
            text.includes('Text content does not match')) {
          validation.hydrationErrors.push(text);
        }
      }
    });

    // Collect page errors
    page.on('pageerror', error => {
      validation.consoleErrors.push(error.message);
    });

    // Navigate to workshop page
    console.log('🚀 Loading page...');
    try {
      await page.goto(workshopUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    } catch (error) {
      console.log('⚠️  Initial load timeout, continuing...');
      try {
        await page.goto(workshopUrl, { waitUntil: 'load', timeout: 10000 });
      } catch {}
    }
    
    // Wait for hydration and dynamic content
    await page.waitForTimeout(8000);
    console.log('✅ Page loaded\n');

    // ISLAND 1: WorkshopHeroIsland
    console.log('1️⃣ Checking WorkshopHeroIsland...');
    const heroIsland = await page.locator('[data-island="workshop-hero"], [class*="WorkshopHero"]').first();
    const heroExists = await heroIsland.count() > 0;
    
    let heroDetails = '';
    let heroElements: any = {};
    
    if (heroExists) {
      // Check for title
      const titleElement = await page.locator('h1, [data-element="workshop-title"]').first();
      const titleText = await titleElement.textContent().catch(() => '');
      heroElements.title = titleText.trim();
      
      // Check for price
      const priceElement = await page.locator('[data-element="workshop-price"], [class*="price"]').first();
      const priceText = await priceElement.textContent().catch(() => '');
      heroElements.price = priceText.trim();
      
      // Check for CTA button in hero
      const ctaInHero = await page.locator('button, a').filter({ 
        hasText: /Reserveer|RESERVEER|Meld je aan|MELD JE AAN|Boek nu|BOEK NU/i 
      }).first();
      const ctaExists = await ctaInHero.count() > 0;
      heroElements.ctaButton = ctaExists;
      
      heroDetails = `✅ Present (Title: "${heroElements.title.substring(0, 30)}...", Price: "${heroElements.price}", CTA: ${ctaExists})`;
    } else {
      heroDetails = '❌ Not found';
    }
    
    validation.islands.push({
      island: 'WorkshopHeroIsland',
      present: heroExists,
      details: heroDetails,
      elements: heroElements
    });
    console.log(`   ${heroDetails}\n`);

    // ISLAND 2: SkillDNAIsland
    console.log('2️⃣ Checking SkillDNAIsland...');
    const skillIsland = await page.locator('[data-island="skill-dna"], [class*="SkillDNA"]').first();
    const skillExists = await skillIsland.count() > 0;
    
    let skillDetails = '';
    let skillElements: any = {};
    
    if (skillExists) {
      // Count skill items
      const skillItems = await page.locator('[data-skill], [class*="skill-item"]').count();
      skillElements.skillCount = skillItems;
      
      // Get skill titles
      const skillTitles = await page.locator('[data-skill] h3, [class*="skill-item"] h3, [data-skill] h4, [class*="skill-item"] h4').allTextContents();
      skillElements.skills = skillTitles.slice(0, 5);
      
      skillDetails = `✅ Present (${skillItems} skills found)`;
    } else {
      // Fallback: look for any skills-related content
      const pageText = await page.textContent('body').catch(() => '');
      const hasSkillsSection = pageText.includes('Je leert') || 
                               pageText.includes('Skills') || 
                               pageText.includes('Vaardigheden');
      
      if (hasSkillsSection) {
        skillDetails = '⚠️  Skills section present but island not detected';
      } else {
        skillDetails = '❌ Not found';
      }
    }
    
    validation.islands.push({
      island: 'SkillDNAIsland',
      present: skillExists,
      details: skillDetails,
      elements: skillElements
    });
    console.log(`   ${skillDetails}\n`);

    // ISLAND 3: DayScheduleIsland
    console.log('3️⃣ Checking DayScheduleIsland...');
    const scheduleIsland = await page.locator('[data-island="day-schedule"], [class*="DaySchedule"]').first();
    const scheduleExists = await scheduleIsland.count() > 0;
    
    let scheduleDetails = '';
    let scheduleElements: any = {};
    
    if (scheduleExists) {
      // Count timeline items
      const timelineItems = await page.locator('[data-time], [class*="timeline-item"]').count();
      scheduleElements.timelineCount = timelineItems;
      
      // Get time entries
      const times = await page.locator('[data-time], [class*="time"]').allTextContents();
      scheduleElements.times = times.slice(0, 5);
      
      scheduleDetails = `✅ Present (${timelineItems} timeline items)`;
    } else {
      // Fallback: look for schedule-related content
      const pageText = await page.textContent('body').catch(() => '');
      const hasSchedule = pageText.includes('Programma') || 
                         pageText.includes('Planning') ||
                         pageText.includes('Dagindeling');
      
      if (hasSchedule) {
        scheduleDetails = '⚠️  Schedule section present but island not detected';
      } else {
        scheduleDetails = '❌ Not found';
      }
    }
    
    validation.islands.push({
      island: 'DayScheduleIsland',
      present: scheduleExists,
      details: scheduleDetails,
      elements: scheduleElements
    });
    console.log(`   ${scheduleDetails}\n`);

    // ISLAND 4: InstructorLocationIsland
    console.log('4️⃣ Checking InstructorLocationIsland...');
    const instructorIsland = await page.locator('[data-island="instructor-location"], [class*="InstructorLocation"]').first();
    const instructorExists = await instructorIsland.count() > 0;
    
    let instructorDetails = '';
    let instructorElements: any = {};
    
    if (instructorExists) {
      // Check for instructor name
      const instructorName = await page.locator('[data-element="instructor-name"], [class*="instructor"] h3').first().textContent().catch(() => '');
      instructorElements.instructor = instructorName.trim();
      
      // Check for location
      const location = await page.locator('[data-element="location"], [class*="location"]').first().textContent().catch(() => '');
      instructorElements.location = location.trim();
      
      instructorDetails = `✅ Present (Instructor: "${instructorElements.instructor}", Location: "${instructorElements.location}")`;
    } else {
      // Fallback: look for instructor-related content
      const pageText = await page.textContent('body').catch(() => '');
      const hasInstructor = pageText.includes('Docent') || 
                           pageText.includes('Trainer') ||
                           pageText.includes('Locatie');
      
      if (hasInstructor) {
        instructorDetails = '⚠️  Instructor/Location section present but island not detected';
      } else {
        instructorDetails = '❌ Not found';
      }
    }
    
    validation.islands.push({
      island: 'InstructorLocationIsland',
      present: instructorExists,
      details: instructorDetails,
      elements: instructorElements
    });
    console.log(`   ${instructorDetails}\n`);

    // CHECK 5: CTA Button Functionality
    console.log('5️⃣ Checking CTA Button...');
    const ctaButton = await page.locator('button, a').filter({ 
      hasText: /Reserveer plek|RESERVEER PLEK|Meld je aan|MELD JE AAN|Boek nu|BOEK NU/i 
    }).first();
    
    const ctaExists = await ctaButton.count() > 0;
    
    if (ctaExists) {
      const ctaText = await ctaButton.textContent().catch(() => '');
      const ctaHref = await ctaButton.getAttribute('href').catch(() => '');
      const isClickable = await ctaButton.isVisible() && await ctaButton.isEnabled();
      
      validation.ctaButton = {
        present: true,
        text: ctaText.trim(),
        clickable: isClickable,
        href: ctaHref || 'javascript action'
      };
      
      console.log(`   ✅ CTA Button found: "${ctaText.trim()}"`);
      console.log(`   📍 Target: ${ctaHref || 'javascript action'}`);
      console.log(`   🖱️  Clickable: ${isClickable}\n`);
    } else {
      validation.ctaButton = {
        present: false,
        text: '',
        clickable: false,
        href: ''
      };
      console.log('   ❌ CTA Button not found\n');
    }

    // CHECK 6: Console Errors
    console.log('6️⃣ Checking Console Errors...');
    if (validation.consoleErrors.length === 0) {
      console.log('   ✅ No console errors\n');
    } else {
      console.log(`   ⚠️  ${validation.consoleErrors.length} console errors detected`);
      
      if (validation.hydrationErrors.length > 0) {
        console.log(`   🚨 ${validation.hydrationErrors.length} HYDRATION ERRORS (React #419)`);
        validation.hydrationErrors.slice(0, 2).forEach((err, i) => {
          console.log(`      ${i + 1}. ${err.substring(0, 100)}...`);
        });
      }
      console.log('');
    }

    // Take screenshot for the first workshop (Perfect Spreken)
    if (workshopTitle === 'Perfect Spreken') {
      try {
        const screenshotPath = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/reports/workshop-perfect-spreken-screenshot.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });
        validation.screenshot = screenshotPath;
        console.log(`📸 Screenshot saved: ${screenshotPath}\n`);
      } catch (error) {
        console.log('⚠️  Could not save screenshot\n');
      }
    }

  } catch (error) {
    console.error(`❌ Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }

  return validation;
}

async function main() {
  console.log('\n🏝️ WORKSHOP ISLANDS DEEP VALIDATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const results: WorkshopValidation[] = [];

  // Validate each workshop
  for (const workshop of WORKSHOPS) {
    const result = await validateWorkshopPage(workshop.url, workshop.title);
    results.push(result);
  }

  // Generate final report
  console.log('\n\n📋 FINAL VALIDATION REPORT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let allInGlory = true;

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.title}`);
    console.log(`   URL: ${result.url}`);
    console.log('');
    
    // Island status
    result.islands.forEach(island => {
      console.log(`   ${island.present ? '✅' : '❌'} ${island.island}: ${island.details}`);
    });
    
    // CTA status
    console.log(`   ${result.ctaButton.present ? '✅' : '❌'} CTA Button: ${result.ctaButton.present ? `"${result.ctaButton.text}" → ${result.ctaButton.href}` : 'Not found'}`);
    
    // Console errors
    const errorStatus = result.consoleErrors.length === 0 ? '✅' : '⚠️';
    console.log(`   ${errorStatus} Console Errors: ${result.consoleErrors.length} (${result.hydrationErrors.length} hydration)`);
    
    // Overall status
    const allIslandsPresent = result.islands.every(i => i.present);
    const ctaWorking = result.ctaButton.present && result.ctaButton.clickable;
    const noHydrationErrors = result.hydrationErrors.length === 0;
    
    const inGlory = allIslandsPresent && ctaWorking && noHydrationErrors;
    
    if (!inGlory) allInGlory = false;
    
    console.log('');
    console.log(`   🎭 Status: ${inGlory ? '✨ VOLLE GLORIE ✨' : '⚠️  NEEDS ATTENTION'}`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
  });

  // Final verdict
  if (allInGlory) {
    console.log('🎉 VERIFIED LIVE: All workshop pages in VOLLE GLORIE\n');
    process.exit(0);
  } else {
    console.log('⚠️  ISSUES DETECTED: Some workshops need attention\n');
    process.exit(1);
  }
}

main();
