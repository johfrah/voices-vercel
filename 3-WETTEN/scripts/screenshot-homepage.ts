import { chromium } from 'playwright';
import path from 'path';

async function takeScreenshot() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const logs: string[] = [];
  const errors: string[] = [];

  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    logs.push(`[${type}] ${text}`);
    if (type === 'error') {
      errors.push(text);
    }
  });

  page.on('pageerror', (error) => {
    errors.push(`PAGE ERROR: ${error.message}`);
  });

  try {
    console.log('Opening https://www.voices.be...');
    await page.goto('https://www.voices.be', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    await page.waitForTimeout(3000);

    const screenshotPath = path.join(process.cwd(), '4-KELDER', 'homepage-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    console.log('\n=== VERSION LOG ===');
    const versionLog = logs.find(log => log.includes('Nuclear Version'));
    console.log(versionLog || 'Version log not found');

    console.log('\n=== ERRORS ===');
    if (errors.length > 0) {
      errors.forEach(err => console.log(err));
    } else {
      console.log('No errors detected');
    }

    const actorsVisible = await page.evaluate(() => {
      const grid = document.querySelector('[data-component="VoiceActorGrid"]');
      const actors = document.querySelectorAll('[data-actor-card]');
      return {
        gridExists: grid !== null,
        actorCount: actors.length,
        bodyText: document.body.innerText.substring(0, 500)
      };
    });

    console.log('\n=== PAGE STATE ===');
    console.log(`Voice Actor Grid Exists: ${actorsVisible.gridExists}`);
    console.log(`Actor Cards Found: ${actorsVisible.actorCount}`);
    console.log(`\nFirst 500 chars of body:\n${actorsVisible.bodyText}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshot();
