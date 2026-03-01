#!/usr/bin/env tsx
/**
 * 🎯 Verify v2.16.113: Rounded Play Buttons
 */

import { chromium } from 'playwright';

async function verify() {
  console.log('🎯 Verifying v2.16.113: Rounded Play Buttons\n');

  const browser = await chromium.launch({ headless: true });
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
    
    // Wait for React hydration
    await page.waitForTimeout(8000);

    // 1. Check version
    const version = await page.evaluate(() => (window as any).__VOICES_VERSION__);
    console.log(`\n🔍 Version: ${version || 'NOT FOUND'}`);
    
    if (version !== '2.16.113') {
      console.log(`   ⚠️  Expected v2.16.113, got ${version}`);
      console.log('   Waiting another 30s for deployment...');
      await page.waitForTimeout(30000);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);
      const retryVersion = await page.evaluate(() => (window as any).__VOICES_VERSION__);
      console.log(`   Retry version: ${retryVersion}`);
    } else {
      console.log('   ✅ Version match!');
    }

    // 2. Check play button styling
    console.log('\n🎨 Checking play button border-radius...');
    const playButtonStyle = await page.evaluate(() => {
      const btn = document.querySelector('button[class*="w-12"][class*="h-12"]');
      if (!btn) return null;
      const computed = window.getComputedStyle(btn);
      return {
        borderRadius: computed.borderRadius,
        classes: btn.className
      };
    });

    if (playButtonStyle) {
      console.log(`   Border-radius: ${playButtonStyle.borderRadius}`);
      console.log(`   Has !rounded-full in classes: ${playButtonStyle.classes.includes('!rounded-full')}`);
      
      // Check if border-radius is actually round (should be 9999px or 50%)
      const isRound = playButtonStyle.borderRadius.includes('9999px') || 
                      playButtonStyle.borderRadius.includes('50%') ||
                      playButtonStyle.borderRadius === '50%';
      
      if (isRound) {
        console.log('   ✅ Play button is ROUND!');
      } else {
        console.log(`   ❌ Play button is NOT round (border-radius: ${playButtonStyle.borderRadius})`);
      }
    } else {
      console.log('   ⚠️  Play button not found');
    }

    // 3. Check for proxy errors
    if (networkErrors.length > 0) {
      console.log('\n❌ PROXY ERRORS:');
      networkErrors.forEach(err => console.log(`   ${err}`));
    } else {
      console.log('\n✅ No /api/proxy/ errors');
    }

    // 4. Screenshot
    await page.screenshot({ path: '/tmp/voices-v2.16.113-verify.png', fullPage: false });
    console.log('\n📸 Screenshot: /tmp/voices-v2.16.113-verify.png');

  } catch (error) {
    console.error('\n❌ ERROR:', error);
  } finally {
    await browser.close();
  }

  console.log('\n✅ VERIFICATION COMPLETE\n');
}

verify();
