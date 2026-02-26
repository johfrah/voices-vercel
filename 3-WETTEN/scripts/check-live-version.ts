#!/usr/bin/env tsx
/**
 * Quick Live Version Check
 * Extracts the version from console logs on voices.be
 */

import { chromium } from 'playwright';

async function checkLiveVersion() {
  console.log('🔍 Checking live version on https://www.voices.be...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  let versionFound = '';
  let lengthErrors = 0;
  let totalErrors = 0;

  page.on('console', (msg) => {
    const text = msg.text();
    
    // Capture version log
    if (text.includes('Nuclear Version:') || text.includes('Version:')) {
      versionFound = text;
      console.log(`✅ ${text}`);
    }
    
    // Count errors
    if (msg.type() === 'error') {
      totalErrors++;
      if (text.includes("Cannot read properties of undefined (reading 'length')")) {
        lengthErrors++;
        console.log(`❌ .length TypeError detected: ${text.substring(0, 100)}...`);
      }
    }
  });

  page.on('pageerror', (error) => {
    totalErrors++;
    if (error.message.includes("Cannot read properties of undefined (reading 'length')")) {
      lengthErrors++;
      console.log(`❌ .length TypeError detected: ${error.message.substring(0, 100)}...`);
    }
  });

  try {
    await page.goto('https://www.voices.be', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    // Wait for version log to appear
    await page.waitForTimeout(5000);

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Version Log:       ${versionFound || '❌ NOT FOUND'}`);
    console.log(`Total Errors:      ${totalErrors}`);
    console.log(`.length Errors:    ${lengthErrors}`);
    console.log(`Status:            ${lengthErrors === 0 ? '✅ CLEAN' : '❌ BROKEN'}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await browser.close();
  }
}

checkLiveVersion();
