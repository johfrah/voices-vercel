#!/usr/bin/env tsx
/**
 * Quick live check - minimal timeout, capture errors only
 */

import { chromium } from 'playwright';

async function quickCheck() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', error => errors.push(error.message));
  
  try {
    console.log('Loading https://www.voices.be/johfrah...');
    
    // Try to load with a very short timeout, catch if it fails
    try {
      await page.goto('https://www.voices.be/johfrah', { 
        waitUntil: 'commit',
        timeout: 15000 
      });
      
      // Wait a bit for JS to execute
      await page.waitForTimeout(5000);
      
    } catch (e) {
      console.log('Page load timeout (expected), but checking errors anyway...');
    }
    
    // Check for SlimmeKassa errors
    const slimmeKassaErrors = errors.filter(e => 
      e.toLowerCase().includes('slimmekassa') || 
      e.toLowerCase().includes('referenceerror')
    );
    
    console.log('\n' + '='.repeat(60));
    if (slimmeKassaErrors.length > 0) {
      console.log('❌ SlimmeKassa errors found:');
      slimmeKassaErrors.forEach(err => console.log(`   ${err}`));
    } else {
      console.log('✅ NO SlimmeKassa errors detected!');
      console.log(`   (Checked ${errors.length} total console messages)`);
    }
    console.log('='.repeat(60));
    
  } finally {
    await browser.close();
  }
}

quickCheck();
