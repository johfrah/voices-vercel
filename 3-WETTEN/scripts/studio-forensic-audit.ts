import { chromium } from 'playwright';
import { join } from 'path';

interface AuditResult {
  section: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  screenshot?: string;
}

async function performForensicAudit() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  const results: AuditResult[] = [];
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];
  
  const screenshotDir = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/reports/screenshots';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // Capture network errors
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push(`${response.status()} - ${response.url()}`);
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    consoleErrors.push(`PageError: ${error.message}`);
  });
  
  try {
    console.log('🚀 Navigating to https://www.voices.be/studio/...');
    await page.goto('https://www.voices.be/studio/', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // Wait for hydration
    await page.waitForTimeout(3000);
    
    // 1. CHECK VERSION
    console.log('\n🔍 1. Checking Version...');
    const version = await page.evaluate(() => {
      return (window as any).__VOICES_VERSION__;
    });
    results.push({
      section: 'Version Check',
      status: version ? 'PASS' : 'FAIL',
      details: `Version: ${version || 'NOT FOUND'}`
    });
    
    // 2. CHECK HERO VIDEO
    console.log('🔍 2. Checking Hero Video...');
    const heroVideoCheck = await page.evaluate(() => {
      const video = document.querySelector('video');
      if (!video) return { found: false, playing: false, src: null, error: 'Video element not found' };
      
      return {
        found: true,
        playing: !video.paused,
        src: video.src || video.querySelector('source')?.src,
        error: video.error ? video.error.message : null,
        readyState: video.readyState,
        networkState: video.networkState
      };
    });
    
    results.push({
      section: 'Hero Video',
      status: heroVideoCheck.found && heroVideoCheck.src ? 'PASS' : 'FAIL',
      details: JSON.stringify(heroVideoCheck, null, 2)
    });
    
    // Take hero screenshot
    const heroPath = join(screenshotDir, `studio-hero-${timestamp}.png`);
    await page.screenshot({ 
      path: heroPath,
      clip: { x: 0, y: 0, width: 1920, height: 800 }
    });
    console.log(`📸 Hero screenshot: ${heroPath}`);
    
    // 3. CHECK WORKSHOP CAROUSEL
    console.log('🔍 3. Checking Workshop Carousel...');
    const carouselCheck = await page.evaluate(() => {
      // Try specific selectors first
      const specificSelectors = [
        '[data-testid="workshop-carousel"]',
        '.workshop-carousel',
        '[class*="carousel"]',
        '#workshop-carousel'
      ];
      
      for (const selector of specificSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const items = element.querySelectorAll('[data-testid*="workshop"], [class*="workshop-item"], [class*="card"]');
          return {
            found: true,
            selector: selector,
            itemCount: items.length,
            html: element.innerHTML.substring(0, 500)
          };
        }
      }
      
      // Then try text-based search
      const sections = Array.from(document.querySelectorAll('section, div[class*="section"]'));
      for (const section of sections) {
        const text = section.textContent?.toLowerCase() || '';
        if (text.includes('workshop')) {
          const items = section.querySelectorAll('[data-testid*="workshop"], [class*="workshop-item"], [class*="card"], article, [class*="item"]');
          return {
            found: true,
            selector: 'text-based search (workshop)',
            itemCount: items.length,
            html: section.innerHTML.substring(0, 500)
          };
        }
      }
      
      return { found: false, selector: null, itemCount: 0 };
    });
    
    results.push({
      section: 'Workshop Carousel',
      status: carouselCheck.found && carouselCheck.itemCount > 0 ? 'PASS' : 'FAIL',
      details: JSON.stringify(carouselCheck, null, 2)
    });
    
    // Take carousel screenshot if found
    if (carouselCheck.found) {
      const carouselElement = await page.$(carouselCheck.selector);
      if (carouselElement) {
        const carouselPath = join(screenshotDir, `studio-carousel-${timestamp}.png`);
        await carouselElement.screenshot({ path: carouselPath });
        console.log(`📸 Carousel screenshot: ${carouselPath}`);
      }
    }
    
    // 4. CHECK CALENDAR SECTION
    console.log('🔍 4. Checking Calendar Section...');
    const calendarCheck = await page.evaluate(() => {
      // First try specific selectors
      const specificSelectors = [
        '[data-testid="calendar"]',
        '.calendar',
        '[class*="calendar"]',
        '#calendar'
      ];
      
      for (const selector of specificSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          return {
            found: true,
            selector: selector,
            visible: element.offsetHeight > 0,
            text: element.textContent?.substring(0, 200)
          };
        }
      }
      
      // Then try text-based search
      const sections = Array.from(document.querySelectorAll('section, div[class*="section"]'));
      for (const section of sections) {
        const text = section.textContent?.toLowerCase() || '';
        if (text.includes('agenda') || text.includes('kalender') || text.includes('calendar')) {
          return {
            found: true,
            selector: 'text-based search',
            visible: section.offsetHeight > 0,
            text: section.textContent?.substring(0, 200)
          };
        }
      }
      
      return { found: false };
    });
    
    results.push({
      section: 'Calendar Section',
      status: calendarCheck.found ? 'PASS' : 'FAIL',
      details: JSON.stringify(calendarCheck, null, 2)
    });
    
    // 5. CHECK FAQ SECTION
    console.log('🔍 5. Checking FAQ Section...');
    const faqCheck = await page.evaluate(() => {
      // First try specific selectors
      const specificSelectors = [
        '[data-testid="faq"]',
        '.faq',
        '[class*="faq"]',
        '#faq'
      ];
      
      for (const selector of specificSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const items = element.querySelectorAll('[data-testid*="faq-item"], details, [class*="accordion"]');
          return {
            found: true,
            selector: selector,
            itemCount: items.length,
            visible: element.offsetHeight > 0
          };
        }
      }
      
      // Then try text-based search
      const sections = Array.from(document.querySelectorAll('section, div[class*="section"]'));
      for (const section of sections) {
        const text = section.textContent?.toLowerCase() || '';
        if (text.includes('faq') || text.includes('veelgestelde') || text.includes('vragen')) {
          const items = section.querySelectorAll('[data-testid*="faq-item"], details, [class*="accordion"]');
          return {
            found: true,
            selector: 'text-based search',
            itemCount: items.length,
            visible: section.offsetHeight > 0
          };
        }
      }
      
      return { found: false };
    });
    
    results.push({
      section: 'FAQ Section',
      status: faqCheck.found ? 'PASS' : 'FAIL',
      details: JSON.stringify(faqCheck, null, 2)
    });
    
    // 6. CHECK REVIEWS SECTION
    console.log('🔍 6. Checking Reviews Section...');
    const reviewsCheck = await page.evaluate(() => {
      // First try specific selectors
      const specificSelectors = [
        '[data-testid="reviews"]',
        '.reviews',
        '[class*="review"]',
        '[class*="testimonial"]',
        '#reviews'
      ];
      
      for (const selector of specificSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const items = element.querySelectorAll('[data-testid*="review"], [class*="review-item"], [class*="testimonial"]');
          return {
            found: true,
            selector: selector,
            itemCount: items.length,
            visible: element.offsetHeight > 0
          };
        }
      }
      
      // Then try text-based search
      const sections = Array.from(document.querySelectorAll('section, div[class*="section"]'));
      for (const section of sections) {
        const text = section.textContent?.toLowerCase() || '';
        if (text.includes('review') || text.includes('getuigenis') || text.includes('testimonial')) {
          const items = section.querySelectorAll('[data-testid*="review"], [class*="review-item"], [class*="testimonial"]');
          return {
            found: true,
            selector: 'text-based search',
            itemCount: items.length,
            visible: section.offsetHeight > 0
          };
        }
      }
      
      return { found: false };
    });
    
    results.push({
      section: 'Reviews Section',
      status: reviewsCheck.found ? 'PASS' : 'FAIL',
      details: JSON.stringify(reviewsCheck, null, 2)
    });
    
    // 7. CHECK GLOBAL NAV LINKS
    console.log('🔍 7. Checking GlobalNav Links...');
    const navCheck = await page.evaluate(() => {
      const nav = document.querySelector('nav, [data-testid="global-nav"], header nav');
      if (!nav) return { found: false };
      
      const links = Array.from(nav.querySelectorAll('a')).map(a => ({
        text: a.textContent?.trim(),
        href: a.getAttribute('href')
      }));
      
      // Determine if these are Agency or Studio links
      const hasStudioLinks = links.some(l => 
        l.href?.includes('/studio') || 
        l.text?.toLowerCase().includes('studio') ||
        l.text?.toLowerCase().includes('workshop')
      );
      
      const hasAgencyLinks = links.some(l => 
        l.href?.includes('/stemmen') || 
        l.href?.includes('/voices') ||
        l.text?.toLowerCase().includes('stemmen') ||
        l.text?.toLowerCase().includes('casting')
      );
      
      return {
        found: true,
        links: links,
        hasStudioLinks,
        hasAgencyLinks,
        type: hasStudioLinks ? 'Studio' : hasAgencyLinks ? 'Agency' : 'Unknown'
      };
    });
    
    results.push({
      section: 'GlobalNav Links',
      status: navCheck.found ? (navCheck.hasStudioLinks ? 'PASS' : 'WARNING') : 'FAIL',
      details: JSON.stringify(navCheck, null, 2)
    });
    
    // 8. CHECK FOR SPECIFIC ERRORS
    console.log('🔍 8. Checking for ReferenceErrors and Hydration Errors...');
    const hasReferenceError = consoleErrors.some(e => e.includes('tl') && e.includes('ReferenceError'));
    const hasHydrationError = consoleErrors.some(e => e.includes('419') || e.includes('Hydration'));
    
    results.push({
      section: 'ReferenceError (tl)',
      status: hasReferenceError ? 'FAIL' : 'PASS',
      details: hasReferenceError ? 'Found "tl" ReferenceError in console' : 'No "tl" ReferenceError detected'
    });
    
    results.push({
      section: 'Hydration Error (#419)',
      status: hasHydrationError ? 'FAIL' : 'PASS',
      details: hasHydrationError ? 'Found Hydration error in console' : 'No Hydration error detected'
    });
    
    // Take full-page screenshot
    console.log('📸 Taking full-page screenshot...');
    const fullPagePath = join(screenshotDir, `studio-forensic-full-${timestamp}.png`);
    await page.screenshot({ 
      path: fullPagePath, 
      fullPage: true 
    });
    console.log(`📸 Full-page screenshot: ${fullPagePath}`);
    
    // FINAL REPORT
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔬 FORENSIC AUDIT REPORT - https://www.voices.be/studio/');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Version: ${version || 'NOT FOUND'}`);
    console.log('');
    
    console.log('📊 SECTION RESULTS:');
    console.log('───────────────────────────────────────────────────────────────');
    results.forEach((result, index) => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
      console.log(`${icon} ${result.section}: ${result.status}`);
      console.log(`   ${result.details.substring(0, 200)}${result.details.length > 200 ? '...' : ''}`);
      console.log('');
    });
    
    console.log('🚨 CONSOLE ERRORS:');
    console.log('───────────────────────────────────────────────────────────────');
    if (consoleErrors.length === 0) {
      console.log('✅ No console errors detected');
    } else {
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    console.log('');
    
    console.log('🌐 NETWORK ERRORS:');
    console.log('───────────────────────────────────────────────────────────────');
    if (networkErrors.length === 0) {
      console.log('✅ No network errors detected');
    } else {
      networkErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    console.log('');
    
    console.log('📸 SCREENSHOTS SAVED:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log(`1. ${fullPagePath}`);
    console.log(`2. ${heroPath}`);
    if (carouselCheck.found) {
      console.log(`3. ${join(screenshotDir, `studio-carousel-${timestamp}.png`)}`);
    }
    console.log('');
    
    // MISSING OR BROKEN SUMMARY
    const failures = results.filter(r => r.status === 'FAIL');
    const warnings = results.filter(r => r.status === 'WARNING');
    
    console.log('🔴 MISSING OR BROKEN COMPONENTS:');
    console.log('═══════════════════════════════════════════════════════════════');
    if (failures.length === 0 && warnings.length === 0) {
      console.log('✅ ALL CHECKS PASSED - No missing or broken components detected!');
    } else {
      if (failures.length > 0) {
        console.log('\n❌ CRITICAL FAILURES:');
        failures.forEach(f => {
          console.log(`   • ${f.section}`);
          console.log(`     ${f.details}`);
        });
      }
      
      if (warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:');
        warnings.forEach(w => {
          console.log(`   • ${w.section}`);
          console.log(`     ${w.details}`);
        });
      }
    }
    console.log('═══════════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('❌ FATAL ERROR during forensic audit:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

performForensicAudit().catch(console.error);
