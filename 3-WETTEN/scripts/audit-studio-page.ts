#!/usr/bin/env tsx
/**
 * Studio Page Forensic Audit
 * Controleert de aanwezigheid van Workshop Carousel, Reviews en console errors
 */

import { chromium } from 'playwright';

async function auditStudioPage() {
  console.log('🔍 Starting Studio Page Forensic Audit...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  // Capture console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // Capture network errors
  const networkErrors: string[] = [];
  page.on('requestfailed', request => {
    networkErrors.push(`${request.url()} - ${request.failure()?.errorText}`);
  });
  
  try {
    console.log('📍 Navigating to: https://voices.be/studio/?wipe=1772074991864\n');
    await page.goto('https://voices.be/studio/?wipe=1772074991864', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    // Wait for page to fully load
    console.log('⏳ Waiting for page to settle...\n');
    await page.waitForTimeout(5000);
    
    console.log('✅ Page loaded successfully\n');
    
    // 1. Check for Workshop Carousel
    console.log('🎠 Checking for Workshop Carousel...');
    const workshopCarousel = await page.locator('[class*="workshop"], [class*="carousel"], video, [data-block-type*="workshop"]').count();
    console.log(`   Found ${workshopCarousel} carousel/video elements\n`);
    
    // Check for specific video elements
    const videoElements = await page.locator('video').count();
    console.log(`   Found ${videoElements} video elements\n`);
    
    // 2. Check for Reviews
    console.log('⭐ Checking for Reviews...');
    const reviewElements = await page.locator('[class*="review"], [class*="testimonial"], [class*="star"], [data-block-type*="review"]').count();
    console.log(`   Found ${reviewElements} review/testimonial elements\n`);
    
    // 3. Check for version
    console.log('🔢 Checking version...');
    const footerVersion = await page.locator('footer').last().textContent();
    console.log(`   Footer content: ${footerVersion?.substring(0, 200)}...\n`);
    
    // Try to fetch version from API
    try {
      const apiResponse = await page.goto('https://voices.be/api/admin/config');
      if (apiResponse) {
        const configData = await apiResponse.json();
        console.log(`   API Version: ${JSON.stringify(configData, null, 2)}\n`);
      }
    } catch (e) {
      console.log(`   Could not fetch API config: ${e}\n`);
    }
    
    // Navigate back to studio page
    await page.goto('https://voices.be/studio/?wipe=1772074991864', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await page.waitForTimeout(3000);
    
    // 4. Check for Smart Router blocks
    console.log('🧩 Checking Smart Router blocks...');
    const dataBlockTypes = await page.locator('[data-block-type]').evaluateAll(elements => 
      elements.map(el => el.getAttribute('data-block-type'))
    );
    console.log(`   Found blocks: ${JSON.stringify(dataBlockTypes, null, 2)}\n`);
    
    // 5. Check page structure
    console.log('🏗️ Checking page structure...');
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    const sectionCount = await page.locator('section').count();
    console.log(`   H1 elements: ${h1Count}`);
    console.log(`   H2 elements: ${h2Count}`);
    console.log(`   Section elements: ${sectionCount}\n`);
    
    // Get all H1 and H2 texts
    const h1Texts = await page.locator('h1').allTextContents();
    const h2Texts = await page.locator('h2').allTextContents();
    console.log(`   H1 texts: ${JSON.stringify(h1Texts)}`);
    console.log(`   H2 texts: ${JSON.stringify(h2Texts)}\n`);
    
    // 6. Take full page screenshot
    console.log('📸 Taking full page screenshot...');
    await page.screenshot({
      path: '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/scripts/studio-page-audit.png',
      fullPage: true
    });
    console.log('   Screenshot saved to: 3-WETTEN/scripts/studio-page-audit.png\n');
    
    // 7. Report console errors
    console.log('🚨 Console Errors:');
    if (consoleErrors.length === 0) {
      console.log('   ✅ No console errors detected\n');
    } else {
      consoleErrors.forEach(err => console.log(`   ❌ ${err}`));
      console.log('');
    }
    
    // 8. Report network errors
    console.log('🌐 Network Errors:');
    if (networkErrors.length === 0) {
      console.log('   ✅ No network errors detected\n');
    } else {
      networkErrors.forEach(err => console.log(`   ❌ ${err}`));
      console.log('');
    }
    
    // 9. Get page HTML for inspection
    console.log('📄 Extracting page HTML structure...');
    const bodyHTML = await page.locator('body').innerHTML();
    const htmlSnippet = bodyHTML.substring(0, 2000);
    console.log(`   Body HTML (first 2000 chars):\n${htmlSnippet}\n`);
    
    console.log('✅ Audit Complete');
    
  } catch (error) {
    console.error('❌ Audit failed:', error);
  } finally {
    await browser.close();
  }
}

auditStudioPage();
