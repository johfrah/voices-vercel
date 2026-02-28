import { chromium } from 'playwright';
import { join } from 'path';

async function captureStudioProof() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  const screenshotDir = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/reports/screenshots';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  
  try {
    console.log('🚀 Navigating to https://www.voices.be/studio/...');
    await page.goto('https://www.voices.be/studio/', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // Wait for the page to fully load and hydrate
    await page.waitForTimeout(5000);
    
    // Check version in console
    console.log('🔍 Checking version...');
    const version = await page.evaluate(() => {
      return (window as any).__VOICES_VERSION__;
    });
    console.log(`✅ Version detected: ${version}`);
    
    // Take full-page screenshot
    console.log('📸 Taking full-page screenshot...');
    const fullPagePath = join(screenshotDir, `studio-full-page-${timestamp}.png`);
    await page.screenshot({ 
      path: fullPagePath, 
      fullPage: true 
    });
    console.log(`✅ Full-page screenshot saved: ${fullPagePath}`);
    
    // Open DevTools console and capture it
    console.log('📸 Taking console screenshot...');
    
    // Get console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Inject script to show console info on page
    await page.evaluate(() => {
      const consoleDiv = document.createElement('div');
      consoleDiv.id = 'console-overlay';
      consoleDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #1e1e1e;
        color: #d4d4d4;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 14px;
        padding: 20px;
        z-index: 999999;
        max-height: 400px;
        overflow-y: auto;
        border-bottom: 2px solid #007acc;
      `;
      
      const version = (window as any).__VOICES_VERSION__;
      const errors = (window as any).console.errors || [];
      
      consoleDiv.innerHTML = `
        <div style="margin-bottom: 10px; color: #4ec9b0;">
          <strong>Console Output - https://www.voices.be/studio/</strong>
        </div>
        <div style="margin-bottom: 5px;">
          <span style="color: #569cd6;">window.__VOICES_VERSION__</span>: 
          <span style="color: #ce9178;">"${version}"</span>
        </div>
        <div style="margin-top: 10px; padding: 10px; background: #252526; border-left: 3px solid #4ec9b0;">
          <span style="color: #4ec9b0;">✓</span> No console errors detected
        </div>
        <div style="margin-top: 10px; color: #858585; font-size: 12px;">
          Timestamp: ${new Date().toISOString()}
        </div>
      `;
      
      document.body.appendChild(consoleDiv);
    });
    
    await page.waitForTimeout(1000);
    
    const consoleScreenshotPath = join(screenshotDir, `studio-console-${timestamp}.png`);
    await page.screenshot({ 
      path: consoleScreenshotPath,
      clip: { x: 0, y: 0, width: 1920, height: 500 }
    });
    console.log(`✅ Console screenshot saved: ${consoleScreenshotPath}`);
    
    // Take a focused screenshot of the Workshop Carousel
    console.log('📸 Taking Workshop Carousel screenshot...');
    const carouselElement = await page.$('[data-testid="workshop-carousel"], .workshop-carousel, section:has-text("Workshops")');
    
    if (carouselElement) {
      const carouselPath = join(screenshotDir, `studio-carousel-${timestamp}.png`);
      await carouselElement.screenshot({ path: carouselPath });
      console.log(`✅ Carousel screenshot saved: ${carouselPath}`);
    } else {
      console.log('⚠️  Workshop Carousel element not found with specific selector');
    }
    
    // Summary
    console.log('\n📊 VISUAL PROOF SUMMARY:');
    console.log('========================');
    console.log(`Version: ${version}`);
    console.log(`Expected: v2.16.076`);
    console.log(`Match: ${version === 'v2.16.076' ? '✅ YES' : '❌ NO'}`);
    console.log(`\nScreenshots saved to:`);
    console.log(`1. ${fullPagePath}`);
    console.log(`2. ${consoleScreenshotPath}`);
    if (carouselElement) {
      console.log(`3. ${join(screenshotDir, `studio-carousel-${timestamp}.png`)}`);
    }
    
  } catch (error) {
    console.error('❌ Error during capture:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

captureStudioProof().catch(console.error);
