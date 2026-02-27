/**
 * Final Johfrah Live Verification
 * 
 * Navigate to voices.be, find Johfrah, and test his demos on the actual live site
 */

import { chromium } from 'playwright';

async function verifyJohfrahLive() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  
  console.log('🚀 Starting Final Johfrah Live Verification...\n');
  
  // Track audio requests
  const audioRequests = new Map<string, number>();
  page.on('response', response => {
    if (response.url().includes('.mp3')) {
      audioRequests.set(response.url(), response.status());
      const status = response.status();
      const icon = status === 200 ? '✅' : '❌';
      console.log(`   ${icon} Audio request: ${status} - ${response.url().split('/').pop()}`);
    }
  });
  
  try {
    // Step 1: Navigate to voices.be
    console.log('📍 Step 1: Navigating to https://www.voices.be...');
    await page.goto('https://www.voices.be', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Handle cookie consent
    try {
      const acceptButton = await page.waitForSelector('button:has-text("Accepteer")', { timeout: 3000 });
      if (acceptButton) {
        await acceptButton.click();
        await page.waitForTimeout(1000);
      }
    } catch {}
    
    await page.waitForTimeout(2000);
    
    // Step 2: Check version
    console.log('\n📍 Step 2: Checking version...');
    const version = await page.evaluate(() => (window as any).__VOICES_VERSION__ || 'unknown');
    console.log(`✅ Version: ${version}`);
    
    // Step 3: Navigate to Johfrah's page
    console.log('\n📍 Step 3: Navigating to Johfrah\'s page...');
    await page.goto('https://www.voices.be/johfrah', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(5000);
    console.log('✅ On Johfrah\'s page');
    
    // Step 4: Find and click play buttons
    console.log('\n📍 Step 4: Testing audio demos...');
    
    // Clear previous audio requests
    audioRequests.clear();
    
    // Find all play buttons
    const playButtons = await page.locator('button[aria-label*="Play"], button[data-action="play"]').all();
    console.log(`Found ${playButtons.length} play buttons`);
    
    if (playButtons.length === 0) {
      console.log('⚠️  No play buttons found, trying alternative selectors...');
      
      // Try to find audio elements
      const audioElements = await page.locator('audio').all();
      console.log(`Found ${audioElements.length} audio elements`);
      
      if (audioElements.length > 0) {
        // Try to play the first 3 audio elements
        for (let i = 0; i < Math.min(3, audioElements.length); i++) {
          console.log(`\n🎵 Testing audio element ${i + 1}...`);
          await page.evaluate((index) => {
            const audio = document.querySelectorAll('audio')[index] as HTMLAudioElement;
            if (audio) {
              audio.play();
            }
          }, i);
          await page.waitForTimeout(2000);
        }
      }
    } else {
      // Click the first 3 play buttons
      const buttonsToTest = Math.min(3, playButtons.length);
      for (let i = 0; i < buttonsToTest; i++) {
        console.log(`\n🎵 Testing demo ${i + 1}/${buttonsToTest}...`);
        try {
          await playButtons[i].click();
          await page.waitForTimeout(3000); // Wait for audio to load and play
        } catch (e) {
          console.log(`   ⚠️  Could not click button ${i + 1}: ${e}`);
        }
      }
    }
    
    // Step 5: Check results
    console.log('\n' + '='.repeat(80));
    console.log('📊 JOHFRAH LIVE VERIFICATION REPORT');
    console.log('='.repeat(80) + '\n');
    
    console.log(`Version: ${version}`);
    console.log(`Audio requests captured: ${audioRequests.size}`);
    
    const successfulRequests = Array.from(audioRequests.values()).filter(status => status === 200).length;
    const failedRequests = Array.from(audioRequests.values()).filter(status => status !== 200).length;
    const has400Errors = Array.from(audioRequests.values()).some(status => status === 400);
    
    console.log(`Successful (200): ${successfulRequests}`);
    console.log(`Failed (non-200): ${failedRequests}`);
    console.log(`400 Errors: ${has400Errors ? 'YES ❌' : 'NO ✅'}\n`);
    
    if (audioRequests.size > 0) {
      console.log('Audio files tested:');
      audioRequests.forEach((status, url) => {
        const icon = status === 200 ? '✅' : '❌';
        const filename = url.split('/').pop();
        console.log(`   ${icon} ${filename} (HTTP ${status})`);
      });
      console.log('');
    }
    
    const allSuccess = successfulRequests > 0 && !has400Errors;
    
    if (allSuccess) {
      console.log(`✅ VERIFIED LIVE: ${version} - Johfrah's demos are now playable (Dynamic Bucket Resolution active).`);
      console.log(`   - ${successfulRequests} demo(s) played successfully`);
      console.log(`   - No 400 errors detected`);
    } else if (audioRequests.size === 0) {
      console.log('⚠️  WARNING: No audio requests were captured.');
      console.log('   This might mean:');
      console.log('   - The page structure has changed');
      console.log('   - Audio players are not loading');
      console.log('   - Play buttons are not triggering audio');
    } else {
      console.log('❌ ISSUES FOUND:');
      if (has400Errors) {
        console.log('   - 400 errors detected (files not found in storage)');
      }
      if (failedRequests > 0) {
        console.log(`   - ${failedRequests} failed audio requests`);
      }
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    await browser.close();
    process.exit(allSuccess ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    await browser.close();
    process.exit(1);
  }
}

verifyJohfrahLive();
