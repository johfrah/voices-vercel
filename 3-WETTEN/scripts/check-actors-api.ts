import { chromium } from 'playwright';
import chalk from 'chalk';

/**
 * 🎯 ACTORS API NETWORK AUDIT
 * 
 * Specifically checks the /api/actors endpoint for status, payload, and timing.
 */

async function checkActorsAPI() {
  console.log(chalk.bold.blue('\n🎯 CHECKING /api/actors NETWORK REQUEST...\n'));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  const actorsRequests: any[] = [];
  const consoleErrors: string[] = [];

  // Capture network requests
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/actors')) {
      let payload = null;
      try {
        payload = await response.json();
      } catch (e) {
        try {
          payload = await response.text();
        } catch (e2) {
          payload = 'Could not parse response';
        }
      }

      actorsRequests.push({
        url,
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        payload,
      });
    }
  });

  // Capture console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('MarketManager') || text.includes('handshakeLanguages')) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('pageerror', (error) => {
    const msg = error.message;
    if (msg.includes('MarketManager') || msg.includes('handshakeLanguages')) {
      consoleErrors.push(msg);
    }
  });

  try {
    console.log(chalk.blue('Navigating to https://www.voices.be...'));
    await page.goto('https://www.voices.be', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // Wait for potential API calls
    await page.waitForTimeout(5000);

    console.log(chalk.bold.green('\n✅ PAGE LOADED\n'));

    // Report /api/actors requests
    if (actorsRequests.length === 0) {
      console.log(chalk.yellow('⚠️ No /api/actors requests detected'));
    } else {
      console.log(chalk.bold.cyan(`📡 Found ${actorsRequests.length} /api/actors request(s):\n`));
      actorsRequests.forEach((req, idx) => {
        console.log(chalk.bold(`Request ${idx + 1}:`));
        console.log(chalk.cyan(`  URL: ${req.url}`));
        console.log(chalk.cyan(`  Status: ${req.status} ${req.statusText}`));
        console.log(chalk.cyan(`  Payload structure:`));
        if (typeof req.payload === 'object' && req.payload !== null) {
          console.log(chalk.gray(`    - count: ${req.payload.count}`));
          console.log(chalk.gray(`    - results length: ${req.payload.results?.length || 0}`));
          if (req.payload.results && req.payload.results.length > 0) {
            console.log(chalk.gray(`    - First actor: ${JSON.stringify(req.payload.results[0], null, 2).substring(0, 800)}`));
          }
        } else {
          const payloadStr = typeof req.payload === 'string' 
            ? req.payload 
            : JSON.stringify(req.payload, null, 2);
          console.log(chalk.gray(`    ${payloadStr.substring(0, 1000)}`));
        }
        console.log('');
      });
    }

    // Report MarketManager/handshakeLanguages errors
    if (consoleErrors.length > 0) {
      console.log(chalk.bold.red(`\n🚨 CRITICAL ERRORS RELATED TO MarketManager/handshakeLanguages:\n`));
      consoleErrors.forEach((err, idx) => {
        console.log(chalk.red(`  ${idx + 1}. ${err}`));
      });
    } else {
      console.log(chalk.green('\n✅ No MarketManager or handshakeLanguages errors detected'));
    }

  } catch (error) {
    console.error(chalk.red('\n❌ ERROR:'), error);
  } finally {
    await browser.close();
  }
}

checkActorsAPI();
