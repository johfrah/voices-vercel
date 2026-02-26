#!/usr/bin/env node
/**
 * Youssef Artist Page Verification Script
 * Verifies all requirements for the Youssef artist page
 */

import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

interface VerificationResult {
  passed: boolean;
  message: string;
  details?: any;
}

async function verifyYoussefPage() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results: Record<string, VerificationResult> = {};
  const consoleLogs: any[] = [];
  const consoleErrors: any[] = [];

  try {
    const page = await browser.newPage();
    
    // Set viewport for consistent screenshots
    await page.setViewport({ width: 1920, height: 1080 });

    // Capture console logs and errors
    page.on('console', (msg) => {
      const log = {
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now()
      };
      consoleLogs.push(log);
      if (msg.type() === 'error') {
        consoleErrors.push(log);
      }
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      consoleErrors.push({
        type: 'pageerror',
        text: error.message,
        timestamp: Date.now()
      });
    });

    console.log('🌐 Navigating to https://www.voices.be/artist/youssef...');
    await page.goto('https://www.voices.be/artist/youssef', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('⏳ Waiting for page hydration...');
    await page.waitForTimeout(3000);

    // 1. Verify page title contains "Youssef Zaki"
    console.log('\n1️⃣ Checking page title...');
    const title = await page.title();
    results.pageTitle = {
      passed: title.includes('Youssef Zaki'),
      message: `Page title: "${title}"`,
      details: { expected: 'Contains "Youssef Zaki"', actual: title }
    };

    // 2. Verify donation goal of "10500" is visible
    console.log('2️⃣ Checking donation goal...');
    const donationGoalVisible = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return bodyText.includes('10500') || bodyText.includes('10.500');
    });
    
    const donationGoalElement = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      for (const el of elements) {
        const text = el.textContent || '';
        if (text.includes('10500') || text.includes('10.500')) {
          return {
            tag: el.tagName,
            text: text.trim().substring(0, 100),
            className: el.className
          };
        }
      }
      return null;
    });

    results.donationGoal = {
      passed: donationGoalVisible,
      message: donationGoalVisible ? 'Donation goal "10500" found' : 'Donation goal "10500" NOT found',
      details: donationGoalElement
    };

    // 3. Verify "Donate" button is present
    console.log('3️⃣ Checking Donate button...');
    const donateButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      for (const btn of buttons) {
        const text = btn.textContent?.toLowerCase() || '';
        if (text.includes('donate') || text.includes('doneer') || text.includes('steun')) {
          return {
            tag: btn.tagName,
            text: btn.textContent?.trim(),
            className: btn.className,
            href: (btn as HTMLAnchorElement).href || null
          };
        }
      }
      return null;
    });

    results.donateButton = {
      passed: donateButton !== null,
      message: donateButton ? `Donate button found: "${donateButton.text}"` : 'Donate button NOT found',
      details: donateButton
    };

    // 4. Test button functionality (if found)
    if (donateButton) {
      console.log('4️⃣ Testing Donate button functionality...');
      try {
        const buttonSelector = donateButton.tag === 'BUTTON' 
          ? `button:has-text("${donateButton.text}")`
          : `a:has-text("${donateButton.text}")`;
        
        // Try to click the button
        const clickable = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, a'));
          for (const btn of buttons) {
            const text = btn.textContent?.toLowerCase() || '';
            if (text.includes('donate') || text.includes('doneer') || text.includes('steun')) {
              return !btn.hasAttribute('disabled');
            }
          }
          return false;
        });

        results.buttonFunctional = {
          passed: clickable,
          message: clickable ? 'Button is clickable (not disabled)' : 'Button is disabled',
          details: { clickable }
        };
      } catch (error) {
        results.buttonFunctional = {
          passed: false,
          message: 'Could not test button functionality',
          details: { error: (error as Error).message }
        };
      }
    } else {
      results.buttonFunctional = {
        passed: false,
        message: 'Cannot test functionality - button not found'
      };
    }

    // 5. Check for console errors
    console.log('5️⃣ Checking console errors...');
    results.consoleErrors = {
      passed: consoleErrors.length === 0,
      message: consoleErrors.length === 0 
        ? 'No console errors detected' 
        : `${consoleErrors.length} console error(s) detected`,
      details: consoleErrors
    };

    // 6. Take screenshot
    console.log('6️⃣ Taking screenshot...');
    const screenshotPath = path.join(process.cwd(), '3-WETTEN', 'scripts', 'youssef-page-screenshot.png');
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    results.screenshot = {
      passed: true,
      message: `Screenshot saved to: ${screenshotPath}`,
      details: { path: screenshotPath }
    };

    // Generate report
    console.log('\n' + '='.repeat(80));
    console.log('📋 YOUSSEF ARTIST PAGE VERIFICATION REPORT');
    console.log('='.repeat(80));

    let allPassed = true;
    for (const [key, result] of Object.entries(results)) {
      const icon = result.passed ? '✅' : '❌';
      console.log(`\n${icon} ${key.toUpperCase()}`);
      console.log(`   ${result.message}`);
      if (result.details && !result.passed) {
        console.log(`   Details:`, JSON.stringify(result.details, null, 2));
      }
      if (!result.passed) allPassed = false;
    }

    console.log('\n' + '='.repeat(80));
    console.log(`\n📊 CONSOLE LOGS (${consoleLogs.length} total):`);
    consoleLogs.forEach(log => {
      const emoji = log.type === 'error' ? '❌' : log.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`  ${emoji} [${log.type}] ${log.text}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n🎯 FINAL RESULT: ${allPassed ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED'}`);
    console.log('='.repeat(80));

    await browser.close();
    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error('❌ Verification failed:', error);
    await browser.close();
    process.exit(1);
  }
}

verifyYoussefPage();
