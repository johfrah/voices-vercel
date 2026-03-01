#!/usr/bin/env tsx
/**
 * 🛡️ CHRIS-PROTOCOL: Audio Playback Browser Forensic Test
 * 
 * Dit script gebruikt Puppeteer om de live site te inspecteren en audio-playback te testen.
 */

import puppeteer from 'puppeteer';

async function testAudioInBrowser() {
  console.log('🎯 AUDIO PLAYBACK BROWSER FORENSIC TEST\n');

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/chrome/mac_arm-146.0.7680.31/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || text.includes('MediaMaster') || text.includes('audio') || text.includes('Proxy')) {
      console.log(`[Browser ${type.toUpperCase()}] ${text}`);
    }
  });

  // Enable network logging
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/proxy/') || url.includes('/api/admin/actors/demos/') || url.endsWith('.mp3') || url.endsWith('.wav')) {
      console.log(`[Network] ${response.status()} ${url}`);
    }
  });

  console.log('📍 Navigating to https://www.voices.be/\n');
  await page.goto('https://www.voices.be/', { waitUntil: 'networkidle2' });

  console.log('⏳ Waiting for voice cards to load...\n');
  await page.waitForSelector('[data-testid="voice-card"], .voice-card, [class*="VoiceCard"]', { timeout: 10000 }).catch(() => {
    console.log('⚠️ No voice cards found with standard selectors, trying alternative...');
  });

  // Wait a bit for the page to fully load
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('🔍 Looking for play buttons...\n');
  
  // Try to find and click a play button
  const playButtons = await page.$$('button[aria-label*="play"], button[title*="play"], button:has(svg)');
  console.log(`Found ${playButtons.length} potential play buttons\n`);

  if (playButtons.length > 0) {
    console.log('🎵 Clicking first play button...\n');
    await playButtons[0].click();
    
    // Wait for audio to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
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
    
    console.log('\n📊 Audio Elements Found:', audioInfo.length);
    audioInfo.forEach((info, idx) => {
      console.log(`\nAudio Element #${idx + 1}:`);
      console.log(`  src: ${info.src}`);
      console.log(`  currentSrc: ${info.currentSrc}`);
      console.log(`  readyState: ${info.readyState} (4 = HAVE_ENOUGH_DATA)`);
      console.log(`  networkState: ${info.networkState} (2 = NETWORK_LOADING, 3 = NETWORK_NO_SOURCE)`);
      console.log(`  paused: ${info.paused}`);
      console.log(`  duration: ${info.duration}`);
      console.log(`  currentTime: ${info.currentTime}`);
      if (info.error) {
        console.log(`  ❌ ERROR: Code ${info.error.code} - ${info.error.message}`);
      }
    });
  } else {
    console.log('❌ No play buttons found!');
  }

  console.log('\n\n⏳ Keeping browser open for 10 seconds for manual inspection...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  await browser.close();
  console.log('\n✅ Browser forensic test complete.\n');
}

testAudioInBrowser().catch(console.error);
