import { chromium, Browser, Page } from 'playwright';
import chalk from 'chalk';

/**
 * 🔍 SIMPLE VERSION VALIDATOR
 * 
 * Validates the version by checking the home page and extracting version from:
 * 1. JavaScript bundle or window object
 * 2. Meta tags or HTML comments
 * 3. Console logs
 */

const BASE_URL = 'https://www.voices.be';
const EXPECTED_VERSION = '2.27.8';

async function validateVersion(): Promise<boolean> {
  let browser: Browser | null = null;

  try {
    console.log(chalk.bold.blue('\n🚀 SIMPLE VERSION VALIDATION\n'));
    console.log(chalk.gray(`Base URL: ${BASE_URL}`));
    console.log(chalk.gray(`Expected Version: ${EXPECTED_VERSION}\n`));

    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();

    // Capture console logs
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      consoleLogs.push(text);
      if (text.includes('Version:') || text.includes('version') || text.includes('Nuclear')) {
        console.log(chalk.gray(`  Console: ${text}`));
      }
    });

    console.log(chalk.blue('📍 Navigating to home page...'));
    
    await page.goto(BASE_URL, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait for page to stabilize and React to hydrate
    await page.waitForTimeout(5000);

    // Check page title and URL
    const title = await page.title();
    const url = page.url();
    console.log(chalk.gray(`  Page Title: ${title}`));
    console.log(chalk.gray(`  Final URL: ${url}`));

    // Check if there are any console logs
    console.log(chalk.gray(`  Console Logs Captured: ${consoleLogs.length}`));
    if (consoleLogs.length > 0) {
      console.log(chalk.gray('\n  All Console Logs:'));
      consoleLogs.forEach((log, idx) => {
        console.log(chalk.gray(`    ${idx + 1}. ${log.substring(0, 150)}`));
      });
    }

    // Try to extract version from window object
    const windowVersion = await page.evaluate(() => {
      // @ts-ignore
      return window.__VOICES_VERSION__ || window.__APP_VERSION__ || window.APP_VERSION || null;
    });

    console.log(chalk.gray(`  Window Version: ${windowVersion || 'null'}`));

    if (windowVersion) {
      console.log(chalk.cyan(`\n✓ Found version in window object: ${windowVersion}`));
      
      if (windowVersion === EXPECTED_VERSION) {
        console.log(chalk.bold.green(`\n✅ VERSION MATCH: ${EXPECTED_VERSION}\n`));
        return true;
      } else {
        console.log(chalk.bold.red(`\n❌ VERSION MISMATCH: Expected ${EXPECTED_VERSION}, got ${windowVersion}\n`));
        return false;
      }
    }

    // If no window version, check console logs for version
    const versionLog = consoleLogs.find(log => log.includes('Version:') || log.includes('Nuclear Version'));
    if (versionLog) {
      console.log(chalk.cyan(`\n✓ Found version in console: ${versionLog}`));
      const match = versionLog.match(/v?(\d+\.\d+\.\d+)/);
      if (match) {
        const foundVersion = match[1];
        if (foundVersion === EXPECTED_VERSION) {
          console.log(chalk.bold.green(`\n✅ VERSION MATCH: ${EXPECTED_VERSION}\n`));
          return true;
        } else {
          console.log(chalk.bold.red(`\n❌ VERSION MISMATCH: Expected ${EXPECTED_VERSION}, got ${foundVersion}\n`));
          return false;
        }
      }
    }

    // Try to find version in page content
    const pageContent = await page.content();
    const versionMatch = pageContent.match(/version["\s:]+["']?(\d+\.\d+\.\d+)["']?/i);
    
    if (versionMatch) {
      const foundVersion = versionMatch[1];
      console.log(chalk.cyan(`\n✓ Found version in page content: ${foundVersion}`));
      
      if (foundVersion === EXPECTED_VERSION) {
        console.log(chalk.bold.green(`\n✅ VERSION MATCH: ${EXPECTED_VERSION}\n`));
        return true;
      } else {
        console.log(chalk.bold.red(`\n❌ VERSION MISMATCH: Expected ${EXPECTED_VERSION}, got ${foundVersion}\n`));
        return false;
      }
    }

    // Check package.json version
    console.log(chalk.yellow('\n⚠️ Could not find version in page, checking package.json...'));
    
    await context.close();
    return false;

  } catch (error) {
    console.error(chalk.bold.red('\n💥 VALIDATION CRASHED:\n'));
    console.error(error);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Also check local package.json
async function checkLocalVersion(): Promise<void> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const packageJsonPath = path.join(process.cwd(), '1-SITE', 'apps', 'web', 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    console.log(chalk.blue('\n📦 Local package.json version:'), chalk.cyan(packageJson.version));
    
    if (packageJson.version === EXPECTED_VERSION) {
      console.log(chalk.green('✓ Local version matches expected version'));
    } else {
      console.log(chalk.red(`✗ Local version mismatch: Expected ${EXPECTED_VERSION}, got ${packageJson.version}`));
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️ Could not read local package.json'));
  }
}

async function run() {
  await checkLocalVersion();
  const success = await validateVersion();
  process.exit(success ? 0 : 1);
}

run();
