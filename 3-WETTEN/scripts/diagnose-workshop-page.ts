#!/usr/bin/env tsx
/**
 * 🔍 Workshop Page Diagnostic Tool
 * 
 * Deep dive into what's actually rendering on workshop pages
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';

const WORKSHOP_URL = 'https://www.voices.be/studio/perfect-spreken';

async function diagnoseWorkshopPage() {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log('\n🔍 WORKSHOP PAGE DIAGNOSTIC');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📍 URL: ${WORKSHOP_URL}\n`);

    // Launch browser
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    page = await context.newPage();

    // Collect console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Collect page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // Navigate
    console.log('🚀 Loading page...');
    try {
      await page.goto(WORKSHOP_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
    } catch (error) {
      console.log('⚠️  Timeout on domcontentloaded, continuing...');
    }

    // Wait for any dynamic content
    await page.waitForTimeout(8000);
    console.log('✅ Page loaded\n');

    // 1. Check page title
    console.log('1️⃣ PAGE METADATA');
    const title = await page.title();
    console.log(`   Title: ${title}`);
    
    const url = page.url();
    console.log(`   URL: ${url}\n`);

    // 2. Get body text content
    console.log('2️⃣ BODY TEXT CONTENT (first 500 chars)');
    const bodyText = await page.textContent('body').catch(() => '');
    console.log(`   Length: ${bodyText.length} characters`);
    console.log(`   Preview: ${bodyText.substring(0, 500).replace(/\s+/g, ' ').trim()}...\n`);

    // 3. Check main structural elements
    console.log('3️⃣ STRUCTURAL ELEMENTS');
    const main = await page.locator('main').count();
    const sections = await page.locator('section').count();
    const articles = await page.locator('article').count();
    const divs = await page.locator('div').count();
    
    console.log(`   <main>: ${main}`);
    console.log(`   <section>: ${sections}`);
    console.log(`   <article>: ${articles}`);
    console.log(`   <div>: ${divs}\n`);

    // 4. Check for headings
    console.log('4️⃣ HEADINGS');
    const h1s = await page.locator('h1').allTextContents();
    const h2s = await page.locator('h2').allTextContents();
    const h3s = await page.locator('h3').allTextContents();
    
    console.log(`   H1 (${h1s.length}): ${h1s.join(' | ')}`);
    console.log(`   H2 (${h2s.length}): ${h2s.slice(0, 3).join(' | ')}${h2s.length > 3 ? '...' : ''}`);
    console.log(`   H3 (${h3s.length}): ${h3s.slice(0, 3).join(' | ')}${h3s.length > 3 ? '...' : ''}\n`);

    // 5. Check for buttons and links
    console.log('5️⃣ INTERACTIVE ELEMENTS');
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    
    console.log(`   Buttons: ${buttons}`);
    console.log(`   Links: ${links}`);
    
    // Get button texts
    const buttonTexts = await page.locator('button').allTextContents();
    if (buttonTexts.length > 0) {
      console.log(`   Button texts: ${buttonTexts.slice(0, 5).join(' | ')}${buttonTexts.length > 5 ? '...' : ''}`);
    }
    console.log('');

    // 6. Check for specific workshop-related content
    console.log('6️⃣ WORKSHOP-SPECIFIC CONTENT');
    const hasPrice = bodyText.includes('€') || bodyText.includes('EUR');
    const hasReserveer = bodyText.toLowerCase().includes('reserveer');
    const hasMeldAan = bodyText.toLowerCase().includes('meld je aan');
    const hasBoekNu = bodyText.toLowerCase().includes('boek nu');
    const hasSkills = bodyText.toLowerCase().includes('skill') || bodyText.toLowerCase().includes('vaardigheid');
    const hasDagindeling = bodyText.toLowerCase().includes('dagindeling') || bodyText.toLowerCase().includes('programma');
    const hasInstructor = bodyText.toLowerCase().includes('docent') || bodyText.toLowerCase().includes('coach');
    
    console.log(`   Price (€): ${hasPrice ? '✅' : '❌'}`);
    console.log(`   "Reserveer": ${hasReserveer ? '✅' : '❌'}`);
    console.log(`   "Meld je aan": ${hasMeldAan ? '✅' : '❌'}`);
    console.log(`   "Boek nu": ${hasBoekNu ? '✅' : '❌'}`);
    console.log(`   Skills/Vaardigheden: ${hasSkills ? '✅' : '❌'}`);
    console.log(`   Dagindeling/Programma: ${hasDagindeling ? '✅' : '❌'}`);
    console.log(`   Docent/Coach: ${hasInstructor ? '✅' : '❌'}\n`);

    // 7. Check for data attributes (Island markers)
    console.log('7️⃣ DATA ATTRIBUTES (Island Markers)');
    const dataIslands = await page.locator('[data-island]').count();
    const dataComponents = await page.locator('[data-component]').count();
    const dataTestIds = await page.locator('[data-testid]').count();
    
    console.log(`   [data-island]: ${dataIslands}`);
    console.log(`   [data-component]: ${dataComponents}`);
    console.log(`   [data-testid]: ${dataTestIds}`);
    
    if (dataIslands > 0) {
      const islandTypes = await page.locator('[data-island]').evaluateAll(elements => 
        elements.map(el => el.getAttribute('data-island'))
      );
      console.log(`   Island types: ${[...new Set(islandTypes)].join(', ')}`);
    }
    console.log('');

    // 8. Console messages
    console.log('8️⃣ CONSOLE MESSAGES');
    console.log(`   Total messages: ${consoleMessages.length}`);
    console.log(`   Page errors: ${pageErrors.length}`);
    
    if (consoleMessages.length > 0) {
      console.log('\n   Recent console messages:');
      consoleMessages.slice(-10).forEach((msg, i) => {
        console.log(`   ${i + 1}. ${msg.substring(0, 100)}${msg.length > 100 ? '...' : ''}`);
      });
    }
    
    if (pageErrors.length > 0) {
      console.log('\n   Page errors:');
      pageErrors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.substring(0, 100)}${err.length > 100 ? '...' : ''}`);
      });
    }
    console.log('');

    // 9. Get HTML structure (first 2000 chars)
    console.log('9️⃣ HTML STRUCTURE (first 2000 chars)');
    const html = await page.content();
    console.log(html.substring(0, 2000));
    console.log('...\n');

    // 10. Take full page screenshot
    console.log('🔟 SCREENSHOTS');
    const screenshotPath = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/reports/workshop-diagnostic-full.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`   Full page: ${screenshotPath}`);
    
    const viewportPath = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/reports/workshop-diagnostic-viewport.png';
    await page.screenshot({ path: viewportPath, fullPage: false });
    console.log(`   Viewport: ${viewportPath}\n`);

    // 11. Check network requests
    console.log('1️⃣1️⃣ NETWORK STATUS');
    const response = await page.goto(WORKSHOP_URL, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);
    if (response) {
      console.log(`   Status: ${response.status()}`);
      console.log(`   OK: ${response.ok()}`);
      console.log(`   URL: ${response.url()}\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DIAGNOSTIC COMPLETE\n');

  } catch (error) {
    console.error(`❌ Diagnostic failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

diagnoseWorkshopPage();
