#!/usr/bin/env tsx
/**
 * 🛡️ CHRIS-PROTOCOL: Live Audio Test (v2.16.114)
 * 
 * Tests audio playback on the live site by:
 * 1. Opening voices.be
 * 2. Finding a voice card
 * 3. Clicking play
 * 4. Monitoring console and network for errors
 */

import puppeteer from 'puppeteer';

async function testAudioLive() {
  console.log('🎯 LIVE AUDIO TEST (v2.16.114)\n');

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/chrome/mac_arm-146.0.7680.31/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();
  
  // Track console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      consoleErrors.push(text);
      console.log(`[Console ERROR] ${text}`);
    } else if (text.includes('MediaMaster') || text.includes('audio') || text.includes('Proxy')) {
      console.log(`[Console ${type.toUpperCase()}] ${text}`);
    }
  });

  // Track network requests
  const audioRequests: { url: string, status: number }[] = [];
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/proxy/') || url.includes('/api/admin/actors/demos/') || url.endsWith('.mp3') || url.endsWith('.wav')) {
      const status = response.status();
      audioRequests.push({ url, status });
      console.log(`[Network] ${status} ${url.substring(0, 100)}...`);
    }
  });

  console.log('📍 Navigating to https://www.voices.be/\n');
  await page.goto('https://www.voices.be/', { waitUntil: 'networkidle2' });

  console.log('⏳ Waiting 3 seconds for page to fully load...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('🔍 Looking for play buttons...\n');
  
  // Find all buttons that might be play buttons
  const playButton = await page.$('button[aria-label*="Afspelen"], button[aria-label*="Play"]');
  
  if (!playButton) {
    console.log('⚠️ No play button found with aria-label. Trying alternative selectors...\n');
    
    // Try to find any button with a Play icon (SVG)
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons total\n`);
    
    // Click the first button we find (likely a play button on a voice card)
    if (buttons.length > 5) {
      console.log('🎵 Clicking a button (likely play)...\n');
      await buttons[5].click();
    } else {
      console.log('❌ Not enough buttons found!\n');
      await browser.close();
      return;
    }
  } else {
    console.log('🎵 Clicking play button...\n');
    await playButton.click();
  }
  
  // Wait for audio to start
  console.log('⏳ Waiting 5 seconds for audio to load...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Check for audio element
  const audioInfo = await page.evaluate(() => {
    const audioElements = document.querySelectorAll('audio');
    return Array.from(audioElements).map(audio => ({
      src: audio.src,
      currentSrc: audio.currentSrc,
      readyState: audio.readyState,
      networkState: audio.networkState,
      error: audio.error ? {
        code: audio.error.code,
        message: audio.error.message
      } : null,
      paused: audio.paused,
      duration: audio.duration,
      currentTime: audio.currentTime
    }));
  });
  
  console.log('\n📊 AUDIO ELEMENTS FOUND:', audioInfo.length);
  audioInfo.forEach((info, idx) => {
    console.log(`\n🎵 Audio Element #${idx + 1}:`);
    console.log(`  src: ${info.src}`);
    console.log(`  currentSrc: ${info.currentSrc}`);
    console.log(`  readyState: ${info.readyState} (4 = HAVE_ENOUGH_DATA)`);
    console.log(`  networkState: ${info.networkState} (2 = NETWORK_LOADING, 3 = NETWORK_NO_SOURCE)`);
    console.log(`  paused: ${info.paused}`);
    console.log(`  duration: ${info.duration}s`);
    console.log(`  currentTime: ${info.currentTime}s`);
    if (info.error) {
      console.log(`  ❌ ERROR: Code ${info.error.code} - ${info.error.message}`);
    } else {
      console.log(`  ✅ No errors`);
    }
  });

  console.log('\n\n📡 AUDIO NETWORK REQUESTS:', audioRequests.length);
  audioRequests.forEach((req, idx) => {
    console.log(`\n${idx + 1}. ${req.status} ${req.url}`);
  });

  console.log('\n\n🚨 CONSOLE ERRORS:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach((err, idx) => {
      console.log(`\n${idx + 1}. ${err}`);
    });
  } else {
    console.log('  ✅ No console errors!');
  }

  console.log('\n\n⏳ Keeping browser open for 30 seconds for manual inspection...');
  await new Promise(resolve => setTimeout(resolve, 30000));

  await browser.close();
  console.log('\n✅ Live audio test complete.\n');
}

testAudioLive().catch(console.error);
