import { chromium } from 'playwright';

async function checkVersion() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const logs: string[] = [];

  // Capture all console messages
  page.on('console', (msg) => {
    const text = msg.text();
    logs.push(`[${msg.type()}] ${text}`);
    console.log(`[${msg.type()}] ${text}`);
  });

  try {
    console.log('Opening https://www.voices.be...');
    await page.goto('https://www.voices.be', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    // Wait a bit for console logs
    await page.waitForTimeout(3000);

    console.log('\n=== ALL CONSOLE LOGS ===');
    logs.forEach(log => console.log(log));

    // Check if voice actors are visible
    const actorsVisible = await page.evaluate(() => {
      const grid = document.querySelector('[data-component="VoiceActorGrid"]');
      return grid !== null;
    });

    console.log(`\nVoice Actor Grid Visible: ${actorsVisible}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkVersion();
