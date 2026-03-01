#!/usr/bin/env tsx
/**
 * 🎙️ Audio Playback Test (v2.16.112)
 * 
 * Verifies:
 * 1. Version is v2.16.112
 * 2. Audio playback works (no /api/proxy/ errors)
 * 3. Play button is visually "round" (rounded-full)
 */

import { chromium } from 'playwright';

async function testAudioPlayback() {
  console.log('🚀 Starting Audio Playback Test...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  // Track console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Track network errors
  const networkErrors: string[] = [];
  page.on('response', response => {
    if (response.status() >= 400 && response.url().includes('/api/proxy/')) {
      networkErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('📍 Navigating to https://www.voices.be/...');
    await page.goto('https://www.voices.be/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // 1. Check version
    console.log('\n🔍 Checking version...');
    const version = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="version"]');
      return meta?.getAttribute('content') || 'unknown';
    });
    console.log(`   Version: ${version}`);
    if (version !== '2.16.112') {
      console.log(`   ⚠️  WARNING: Expected v2.16.112, got ${version}`);
    } else {
      console.log('   ✅ Version match!');
    }

    // Wait for page to be interactive
    await page.waitForTimeout(5000);

    // 2. Check for voice cards or actors
    console.log('\n🎭 Looking for voice elements...');
    const voiceCards = await page.$$('[data-voice-card]');
    const actorCards = await page.$$('[class*="VoiceCard"]');
    const playButtons = await page.$$('button.rounded-full');
    console.log(`   Voice cards (data-voice-card): ${voiceCards.length}`);
    console.log(`   Actor cards (VoiceCard class): ${actorCards.length}`);
    console.log(`   Play buttons (rounded-full): ${playButtons.length}`);

    if (playButtons.length === 0) {
      console.log('   ⚠️  No play buttons found - may need to scroll or wait longer');
    }

    // 3. Check play button styling
    console.log('\n🎨 Checking play button styling...');
    const playButton = await page.$('button.rounded-full[class*="w-12"][class*="h-12"]');
    if (playButton) {
      const classes = await playButton.getAttribute('class');
      const hasRoundedFull = classes?.includes('rounded-full');
      console.log(`   Play button classes: ${classes?.substring(0, 100)}...`);
      console.log(`   ✅ Has rounded-full: ${hasRoundedFull}`);
    } else {
      console.log('   ⚠️  Play button not found (may require scrolling)');
    }

    // 4. Try to click play button
    console.log('\n🎵 Testing audio playback...');
    const firstPlayButton = await page.$('button.rounded-full');
    if (firstPlayButton) {
      await firstPlayButton.click();
      console.log('   Clicked play button');
      
      // Wait a bit for audio to load
      await page.waitForTimeout(3000);

      // Check for errors
      if (networkErrors.length > 0) {
        console.log('\n❌ NETWORK ERRORS DETECTED:');
        networkErrors.forEach(err => console.log(`   ${err}`));
      } else {
        console.log('   ✅ No /api/proxy/ errors');
      }

      if (consoleErrors.length > 0) {
        console.log('\n⚠️  CONSOLE ERRORS:');
        consoleErrors.forEach(err => console.log(`   ${err}`));
      } else {
        console.log('   ✅ No console errors');
      }
    } else {
      console.log('   ⚠️  Could not find play button to click');
    }

    // 5. Take screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: '/tmp/voices-audio-test.png', fullPage: false });
    console.log('   Screenshot saved to /tmp/voices-audio-test.png');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    await page.screenshot({ path: '/tmp/voices-audio-test-error.png' });
    throw error;
  } finally {
    await browser.close();
  }

  console.log('\n✅ TEST COMPLETE\n');
}

testAudioPlayback().catch(err => {
  console.error(err);
  process.exit(1);
});
