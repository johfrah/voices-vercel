import { chromium, Browser, Page, ConsoleMessage } from 'playwright';
import chalk from 'chalk';

/**
 * 🌐 BROWSER CONSOLE AUDIT (CHRIS-PROTOCOL 2026)
 * 
 * Doel: Systematische detectie van client-side errors over alle kritieke routes.
 * Focus: useVoicesState, useEffect, Hydration Mismatch, ReferenceError, TypeError.
 */

interface ConsoleError {
  url: string;
  type: string;
  message: string;
  stack?: string;
  timestamp: Date;
}

interface PageAuditResult {
  url: string;
  status: 'success' | 'error';
  errors: ConsoleError[];
  globalNavVisible: boolean;
  loadTime: number;
}

const BASE_URL = 'https://www.voices.be';

const URLS_TO_TEST = [
  { path: '/', name: 'Home' },
  { path: '/agency/', name: 'Agency' },
  { path: '/studio/', name: 'Studio' },
  { path: '/academy/', name: 'Academy' },
  { path: '/account/', name: 'Account (Login/Signup UI)' },
  { path: '/portfolio/johfrah/', name: 'Portfolio - Johfrah' },
  { path: '/casting/launchpad/', name: 'Casting Launchpad' },
];

const CRITICAL_ERROR_PATTERNS = [
  /useVoicesState/i,
  /useEffect/i,
  /hydration/i,
  /ReferenceError/i,
  /TypeError/i,
  /is not defined/i,
  /Cannot read propert/i,
  /undefined is not/i,
];

async function auditPage(page: Page, url: string, name: string): Promise<PageAuditResult> {
  const errors: ConsoleError[] = [];
  const startTime = Date.now();

  // Capture console messages
  page.on('console', (msg: ConsoleMessage) => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error' || type === 'warning') {
      // Check if this is a critical error
      const isCritical = CRITICAL_ERROR_PATTERNS.some(pattern => pattern.test(text));
      
      if (isCritical || type === 'error') {
        errors.push({
          url,
          type,
          message: text,
          timestamp: new Date(),
        });
      }
    }
  });

  // Capture page errors
  page.on('pageerror', (error: Error) => {
    errors.push({
      url,
      type: 'pageerror',
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
    });
  });

  try {
    console.log(chalk.blue(`\n🔍 Testing: ${chalk.bold(name)} - ${url}`));
    
    // Navigate with timeout
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    if (!response || !response.ok()) {
      errors.push({
        url,
        type: 'navigation',
        message: `HTTP ${response?.status()} - Navigation failed`,
        timestamp: new Date(),
      });
    }

    // Wait a bit for any delayed errors
    await page.waitForTimeout(2000);

    // Check if GlobalNav is visible
    const globalNavVisible = await page.evaluate(() => {
      const nav = document.querySelector('nav[role="navigation"]') || 
                   document.querySelector('[data-component="GlobalNav"]') ||
                   document.querySelector('header nav');
      return nav !== null && window.getComputedStyle(nav).display !== 'none';
    });

    const loadTime = Date.now() - startTime;

    return {
      url,
      status: errors.length === 0 ? 'success' : 'error',
      errors,
      globalNavVisible,
      loadTime,
    };
  } catch (error) {
    errors.push({
      url,
      type: 'exception',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date(),
    });

    return {
      url,
      status: 'error',
      errors,
      globalNavVisible: false,
      loadTime: Date.now() - startTime,
    };
  }
}

async function runAudit() {
  console.log(chalk.bold.blue('\n🚀 STARTING BROWSER CONSOLE AUDIT...\n'));
  console.log(chalk.gray(`Base URL: ${BASE_URL}`));
  console.log(chalk.gray(`Testing ${URLS_TO_TEST.length} routes\n`));

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    const results: PageAuditResult[] = [];

    for (const route of URLS_TO_TEST) {
      const fullUrl = `${BASE_URL}${route.path}`;
      const result = await auditPage(page, fullUrl, route.name);
      results.push(result);

      // Report immediately
      if (result.status === 'success' && result.errors.length === 0) {
        console.log(chalk.green(`  ✅ Clean - GlobalNav: ${result.globalNavVisible ? '✓' : '✗'} - ${result.loadTime}ms`));
      } else {
        console.log(chalk.red(`  ❌ ${result.errors.length} error(s) - GlobalNav: ${result.globalNavVisible ? '✓' : '✗'} - ${result.loadTime}ms`));
        result.errors.forEach((err, idx) => {
          console.log(chalk.yellow(`     ${idx + 1}. [${err.type}] ${err.message}`));
          if (err.stack) {
            const stackLines = err.stack.split('\n').slice(0, 3);
            stackLines.forEach(line => console.log(chalk.gray(`        ${line.trim()}`)));
          }
        });
      }
    }

    await context.close();

    // Summary
    console.log(chalk.bold.blue('\n📊 AUDIT SUMMARY\n'));

    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
    const pagesWithErrors = results.filter(r => r.errors.length > 0).length;
    const pagesWithoutNav = results.filter(r => !r.globalNavVisible).length;

    console.log(chalk.cyan(`Total Pages Tested: ${results.length}`));
    console.log(chalk.cyan(`Pages with Errors: ${pagesWithErrors}`));
    console.log(chalk.cyan(`Total Console Errors: ${totalErrors}`));
    console.log(chalk.cyan(`Pages Missing GlobalNav: ${pagesWithoutNav}`));

    // Group errors by type
    const errorsByType = new Map<string, ConsoleError[]>();
    results.forEach(result => {
      result.errors.forEach(err => {
        const key = err.message.split('\n')[0].substring(0, 100);
        if (!errorsByType.has(key)) {
          errorsByType.set(key, []);
        }
        errorsByType.get(key)!.push(err);
      });
    });

    if (errorsByType.size > 0) {
      console.log(chalk.bold.yellow('\n🔥 UNIQUE ERROR PATTERNS:\n'));
      let patternIndex = 1;
      errorsByType.forEach((errors, pattern) => {
        console.log(chalk.yellow(`${patternIndex}. ${pattern}`));
        console.log(chalk.gray(`   Occurrences: ${errors.length}`));
        console.log(chalk.gray(`   URLs: ${[...new Set(errors.map(e => e.url))].join(', ')}`));
        console.log('');
        patternIndex++;
      });
    }

    // Check for specific issues
    const useVoicesStateErrors = results.flatMap(r => 
      r.errors.filter(e => /useVoicesState/i.test(e.message))
    );
    const useEffectErrors = results.flatMap(r => 
      r.errors.filter(e => /useEffect/i.test(e.message))
    );
    const hydrationErrors = results.flatMap(r => 
      r.errors.filter(e => /hydration/i.test(e.message))
    );

    if (useVoicesStateErrors.length > 0) {
      console.log(chalk.bold.red(`⚠️ useVoicesState errors detected: ${useVoicesStateErrors.length}`));
    }
    if (useEffectErrors.length > 0) {
      console.log(chalk.bold.red(`⚠️ useEffect errors detected: ${useEffectErrors.length}`));
    }
    if (hydrationErrors.length > 0) {
      console.log(chalk.bold.red(`⚠️ Hydration errors detected: ${hydrationErrors.length}`));
    }

    if (totalErrors === 0) {
      console.log(chalk.bold.green('\n✅ ALL PAGES CLEAN - No console errors detected!\n'));
      process.exit(0);
    } else {
      console.log(chalk.bold.red('\n❌ AUDIT FAILED - Console errors detected!\n'));
      process.exit(1);
    }

  } catch (error) {
    console.error(chalk.bold.red('\n💥 AUDIT CRASHED:\n'));
    console.error(error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runAudit();
