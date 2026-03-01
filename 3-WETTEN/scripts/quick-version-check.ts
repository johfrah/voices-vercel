#!/usr/bin/env tsx
/**
 * 🔍 Quick Version & Audio Check (v2.16.112)
 */

import { chromium } from 'playwright';

async function quickCheck() {
  console.log('🚀 Quick Version & Audio Check\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const logs: string[] = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));

  const networkErrors: string[] = [];
  page.on('response', response => {
    if (response.status() >= 400 && response.url().includes('/api/proxy/')) {
      networkErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('📍 Loading https://www.voices.be/...');
    await page.goto('https://www.voices.be/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Wait for React to hydrate
    await page.waitForTimeout(8000);

    // Check version from window object
    const version = await page.evaluate(() => (window as any).__VOICES_VERSION__);
    console.log(`\n🔍 Version: ${version || 'NOT FOUND'}`);
    
    // Check for version in console logs
    const versionLog = logs.find(l => l.includes('Nuclear Version'));
    if (versionLog) {
      console.log(`   Console: ${versionLog}`);
    }

    // Count play buttons
    const playButtonsCount = await page.$$eval('button.rounded-full', btns => btns.length);
    console.log(`\n🎨 Play buttons with rounded-full: ${playButtonsCount}`);

    // Check if any play button is visible
    const visiblePlayButton = await page.$('button.rounded-full:visible');
    console.log(`   Visible play button: ${visiblePlayButton ? 'YES' : 'NO'}`);

    // Try to find a specific audio play button
    const audioPlayButton = await page.$('button[class*="w-12"][class*="h-12"].rounded-full');
    if (audioPlayButton) {
      const classes = await audioPlayButton.getAttribute('class');
      const hasRoundedFull = classes?.includes('rounded-full');
      console.log(`\n✅ Audio play button found!`);
      console.log(`   Has rounded-full: ${hasRoundedFull}`);
      console.log(`   Classes: ${classes?.substring(0, 150)}...`);
    }

    // Check for proxy errors
    if (networkErrors.length > 0) {
      console.log('\n❌ PROXY ERRORS:');
      networkErrors.forEach(err => console.log(`   ${err}`));
    } else {
      console.log('\n✅ No /api/proxy/ errors detected');
    }

    console.log('\n⏸️  Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ ERROR:', error);
  } finally {
    await browser.close();
  }
}

quickCheck();
