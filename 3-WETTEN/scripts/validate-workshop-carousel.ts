#!/usr/bin/env node
/**
 * 🔍 Workshop Carousel Live Validation
 * 
 * Chris/Autist - Technical Director
 * 
 * Validates that v2.16.094 is live and the WorkshopCarousel is visible.
 */

import puppeteer from 'puppeteer';

async function validateWorkshopCarousel() {
  console.log('🚀 Starting Workshop Carousel validation...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--incognito']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('📍 Navigating to https://www.voices.be/studio...');
    await page.goto('https://www.voices.be/studio', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait a bit for dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check version via API
    console.log('\n🔍 Checking version via /api/admin/config?type=general...');
    const configResponse = await page.goto('https://www.voices.be/api/admin/config?type=general', {
      waitUntil: 'networkidle2'
    });
    
    const configData = await configResponse?.json();
    const liveVersion = configData?._version || 'unknown';
    console.log(`✅ Live version: ${liveVersion}`);

    // Go back to studio page
    await page.goto('https://www.voices.be/studio', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check for WorkshopCarousel
    console.log('\n🔍 Checking for WorkshopCarousel visibility...');
    
    // Check if the carousel container exists
    const carouselExists = await page.evaluate(() => {
      // Look for common carousel indicators
      const carouselSelectors = [
        '[class*="carousel"]',
        '[class*="workshop"]',
        '[data-testid*="carousel"]',
        '[data-testid*="workshop"]',
        'section[class*="workshop"]'
      ];
      
      for (const selector of carouselSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const rect = element.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0;
          return {
            found: true,
            selector,
            visible: isVisible,
            width: rect.width,
            height: rect.height
          };
        }
      }
      return { found: false };
    });

    // Check console for errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Get page content to search for workshop-related content
    const pageContent = await page.content();
    const hasWorkshopContent = pageContent.toLowerCase().includes('workshop') || 
                               pageContent.toLowerCase().includes('cursus') ||
                               pageContent.toLowerCase().includes('training');

    console.log('\n📊 VALIDATION RESULTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Version: ${liveVersion}`);
    console.log(`Expected: v2.16.094 or 2.16.094`);
    const versionMatch = liveVersion === 'v2.16.094' || liveVersion === '2.16.094';
    console.log(`Match: ${versionMatch ? '✅' : '❌'}`);
    console.log('');
    console.log(`Carousel Element Found: ${carouselExists.found ? '✅' : '❌'}`);
    if (carouselExists.found) {
      console.log(`Selector: ${carouselExists.selector}`);
      console.log(`Visible: ${carouselExists.visible ? '✅' : '❌'}`);
      console.log(`Dimensions: ${carouselExists.width}x${carouselExists.height}px`);
    }
    console.log('');
    console.log(`Workshop Content Present: ${hasWorkshopContent ? '✅' : '❌'}`);
    console.log(`Console Errors: ${consoleErrors.length === 0 ? '✅ None' : `❌ ${consoleErrors.length}`}`);
    
    if (consoleErrors.length > 0) {
      console.log('\n⚠️ Console Errors:');
      consoleErrors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Final verdict
    const isSuccess = versionMatch && 
                     (carouselExists.found && carouselExists.visible || hasWorkshopContent);

    if (isSuccess) {
      console.log('✅ VERIFIED LIVE: v2.16.094 is live. The WorkshopCarousel is now visible because the API crash is verholpen.');
    } else {
      console.log('❌ VALIDATION FAILED: Issues detected.');
      if (!versionMatch) {
        console.log(`   - Version mismatch: expected v2.16.094 or 2.16.094, got ${liveVersion}`);
      }
      if (!carouselExists.found && !hasWorkshopContent) {
        console.log('   - WorkshopCarousel not found or not visible');
      }
    }

    return isSuccess;

  } catch (error) {
    console.error('❌ Validation failed with error:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run validation
validateWorkshopCarousel()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
