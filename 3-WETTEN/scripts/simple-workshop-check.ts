#!/usr/bin/env tsx
/**
 * 🔍 Simple Workshop Page Check
 * 
 * Minimal diagnostic to see what's happening
 */

import { chromium } from 'playwright';

const URLS = [
  'https://www.voices.be/studio/perfect-spreken',
  'https://www.voices.be/studio/audioboeken-inspreken'
];

async function checkPage(url: string) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📍 Checking: ${url}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // Navigate with minimal waiting
    const response = await page.goto(url, { 
      waitUntil: 'commit',
      timeout: 15000 
    });

    console.log(`✅ Response Status: ${response?.status()}`);
    console.log(`📍 Final URL: ${page.url()}`);

    // Wait a bit for content
    await page.waitForTimeout(5000);

    // Try to get basic info
    try {
      const title = await page.title();
      console.log(`📄 Title: ${title}`);
    } catch (e) {
      console.log(`❌ Could not get title: ${e instanceof Error ? e.message : 'Unknown'}`);
    }

    try {
      const bodyText = await page.evaluate(() => document.body?.innerText || '');
      console.log(`📝 Body length: ${bodyText.length} chars`);
      
      if (bodyText.length > 0) {
        console.log(`📝 First 200 chars: ${bodyText.substring(0, 200).replace(/\s+/g, ' ').trim()}...`);
        
        // Check for key content
        const hasTitle = bodyText.toLowerCase().includes('perfect spreken') || bodyText.toLowerCase().includes('audioboeken');
        const hasPrice = bodyText.includes('€');
        const hasCTA = bodyText.toLowerCase().includes('reserveer') || bodyText.toLowerCase().includes('meld je aan');
        
        console.log(`\n🔍 Content Check:`);
        console.log(`   Workshop title: ${hasTitle ? '✅' : '❌'}`);
        console.log(`   Price (€): ${hasPrice ? '✅' : '❌'}`);
        console.log(`   CTA button: ${hasCTA ? '✅' : '❌'}`);
      } else {
        console.log(`❌ Body is empty!`);
      }
    } catch (e) {
      console.log(`❌ Could not get body: ${e instanceof Error ? e.message : 'Unknown'}`);
    }

    // Check for console errors
    if (consoleErrors.length > 0) {
      console.log(`\n⚠️  Console Errors (${consoleErrors.length}):`);
      consoleErrors.slice(0, 3).forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.substring(0, 100)}...`);
      });
    } else {
      console.log(`\n✅ No console errors`);
    }

    // Take screenshot
    const screenshotPath = `/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/reports/simple-check-${url.split('/').pop()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`\n📸 Screenshot: ${screenshotPath}`);

  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('\n🔍 SIMPLE WORKSHOP PAGE CHECK');
  
  for (const url of URLS) {
    await checkPage(url);
  }
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log('✅ CHECK COMPLETE\n');
}

main();
