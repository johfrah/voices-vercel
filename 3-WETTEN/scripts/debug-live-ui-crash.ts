/**
 * Debug Live UI Crash - Forensic Browser Investigation
 * Captures console logs, network errors, and stack traces from live sites
 */

import { chromium, type ConsoleMessage, type Request, type Response } from 'playwright';

interface ConsoleLog {
  type: string;
  text: string;
  location?: string;
  args?: string[];
}

interface NetworkError {
  url: string;
  status: number;
  method: string;
  resourceType: string;
}

interface SiteReport {
  url: string;
  consoleLogs: ConsoleLog[];
  errors: ConsoleLog[];
  networkErrors: NetworkError[];
  criticalJsChunks: NetworkError[];
  initialStateAvailable: boolean;
  stackTraces: string[];
}

async function investigateSite(url: string): Promise<SiteReport> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  const report: SiteReport = {
    url,
    consoleLogs: [],
    errors: [],
    networkErrors: [],
    criticalJsChunks: [],
    initialStateAvailable: false,
    stackTraces: []
  };

  // Capture console messages
  page.on('console', (msg: ConsoleMessage) => {
    const log: ConsoleLog = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location().url
    };
    
    report.consoleLogs.push(log);
    
    if (msg.type() === 'error') {
      report.errors.push(log);
      
      // Extract stack trace if available
      const text = msg.text();
      if (text.includes('ReferenceError') || text.includes('useVoicesState')) {
        report.stackTraces.push(text);
      }
    }
  });

  // Capture page errors
  page.on('pageerror', (error) => {
    const errorLog: ConsoleLog = {
      type: 'pageerror',
      text: error.message,
      location: error.stack
    };
    report.errors.push(errorLog);
    report.stackTraces.push(error.stack || error.message);
  });

  // Capture network requests
  page.on('response', async (response: Response) => {
    const request = response.request();
    const status = response.status();
    
    // Track failed requests
    if (status >= 400) {
      const networkError: NetworkError = {
        url: request.url(),
        status,
        method: request.method(),
        resourceType: request.resourceType()
      };
      
      report.networkErrors.push(networkError);
      
      // Track critical JS chunk failures
      if (request.resourceType() === 'script' && (status === 404 || status === 405)) {
        report.criticalJsChunks.push(networkError);
      }
    }
  });

  try {
    console.log(`\n🔍 Investigating: ${url}`);
    
    // Navigate with extended timeout
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait a bit for any delayed errors
    await page.waitForTimeout(3000);

    // Check if initialState is available in browser context
    report.initialStateAvailable = await page.evaluate(() => {
      return typeof (window as any).__INITIAL_STATE__ !== 'undefined';
    });

    // Try to capture the actual error if it exists
    const runtimeErrors = await page.evaluate(() => {
      const errors: string[] = [];
      
      // Check for global error handlers
      if ((window as any).__RUNTIME_ERRORS__) {
        errors.push(...(window as any).__RUNTIME_ERRORS__);
      }
      
      // Check for React error boundary errors
      const errorBoundaries = document.querySelectorAll('[data-error-boundary]');
      errorBoundaries.forEach(el => {
        const errorText = el.textContent;
        if (errorText) errors.push(errorText);
      });
      
      return errors;
    });
    
    if (runtimeErrors.length > 0) {
      report.stackTraces.push(...runtimeErrors);
    }

    // Capture screenshot for visual confirmation
    await page.screenshot({ 
      path: `/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/scripts/debug-screenshot-${url.replace(/https?:\/\//, '').replace(/\./g, '-')}.png`,
      fullPage: true 
    });

  } catch (error) {
    report.errors.push({
      type: 'navigation-error',
      text: error instanceof Error ? error.message : String(error)
    });
  } finally {
    await browser.close();
  }

  return report;
}

function printReport(report: SiteReport) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 FORENSIC REPORT: ${report.url}`);
  console.log('='.repeat(80));
  
  console.log(`\n✅ Initial State Available: ${report.initialStateAvailable ? 'YES' : 'NO'}`);
  
  if (report.stackTraces.length > 0) {
    console.log(`\n🔥 STACK TRACES (${report.stackTraces.length}):`);
    report.stackTraces.forEach((trace, idx) => {
      console.log(`\n--- Stack Trace ${idx + 1} ---`);
      console.log(trace);
    });
  }
  
  if (report.errors.length > 0) {
    console.log(`\n❌ CONSOLE ERRORS (${report.errors.length}):`);
    report.errors.forEach((error, idx) => {
      console.log(`\n${idx + 1}. [${error.type}] ${error.text}`);
      if (error.location) {
        console.log(`   Location: ${error.location}`);
      }
    });
  }
  
  if (report.criticalJsChunks.length > 0) {
    console.log(`\n🚨 CRITICAL JS CHUNK FAILURES (${report.criticalJsChunks.length}):`);
    report.criticalJsChunks.forEach((chunk, idx) => {
      console.log(`\n${idx + 1}. [${chunk.status}] ${chunk.method} ${chunk.url}`);
    });
  }
  
  if (report.networkErrors.length > 0) {
    console.log(`\n⚠️  NETWORK ERRORS (${report.networkErrors.length}):`);
    report.networkErrors.forEach((error, idx) => {
      console.log(`${idx + 1}. [${error.status}] ${error.method} ${error.url} (${error.resourceType})`);
    });
  }
  
  console.log(`\n📝 ALL CONSOLE LOGS (${report.consoleLogs.length}):`);
  const relevantLogs = report.consoleLogs.filter(log => 
    log.text.toLowerCase().includes('voices') || 
    log.text.toLowerCase().includes('state') ||
    log.text.toLowerCase().includes('error') ||
    log.text.toLowerCase().includes('warning')
  );
  
  if (relevantLogs.length > 0) {
    relevantLogs.slice(0, 20).forEach((log, idx) => {
      console.log(`${idx + 1}. [${log.type}] ${log.text.substring(0, 200)}`);
    });
    if (relevantLogs.length > 20) {
      console.log(`... and ${relevantLogs.length - 20} more relevant logs`);
    }
  } else {
    console.log('No relevant logs found (filtered for "voices", "state", "error", "warning")');
  }
}

async function main() {
  console.log('🚀 Starting Forensic Browser Investigation...\n');
  
  const sites = [
    'https://www.voices.be',
    'https://www.johfrah.be'
  ];
  
  for (const site of sites) {
    const report = await investigateSite(site);
    printReport(report);
  }
  
  console.log('\n✅ Investigation complete. Screenshots saved to 3-WETTEN/scripts/');
}

main().catch(console.error);
