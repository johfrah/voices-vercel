/**
 * Verify Johfrah's Audio Demos - Complete Validation
 * 
 * This script:
 * 1. Navigates to voices.be
 * 2. Finds Johfrah's actor card
 * 3. Opens his detail page
 * 4. Identifies ALL assigned demos
 * 5. Verifies each demo file is reachable and playable
 * 6. Tests at least 5 different demos
 */

import { chromium, type Browser, type Page } from 'playwright';

interface DemoCheckResult {
  demoTitle: string;
  audioUrl: string;
  isReachable: boolean;
  httpStatus: number | null;
  tested: boolean;
  error?: string;
}

async function verifyJohfrahDemos() {
  let browser: Browser | null = null;
  
  try {
    console.log('🚀 Starting Johfrah Demo Verification...\n');
    
    browser = await chromium.launch({ headless: false }); // visible for debugging
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    
    const page = await context.newPage();
    
    // Track all network requests for mp3 files
    const audioRequests = new Map<string, number>();
    page.on('response', response => {
      if (response.url().includes('.mp3')) {
        audioRequests.set(response.url(), response.status());
        console.log(`   📡 Audio request: ${response.status()} - ${response.url().split('/').pop()}`);
      }
    });
    
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
        console.log('🍪 Accepting cookies...');
        await acceptButton.click();
        await page.waitForTimeout(1000);
      }
    } catch {
      // No cookie popup
    }
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Step 2: Find Johfrah's card
    console.log('\n📍 Step 2: Finding Johfrah\'s actor card...');
    
    // Scroll down to ensure actor grid is loaded
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(2000);
    
    // Find Johfrah's card by looking for his name
    const johfrahCardFound = await page.evaluate(() => {
      const allHeadings = Array.from(document.querySelectorAll('h2, h3, h4'));
      const johfrahHeading = allHeadings.find(h => 
        h.textContent?.toLowerCase().includes('johfrah')
      );
      
      if (johfrahHeading) {
        // Find the clickable card container
        let card = johfrahHeading.parentElement;
        let depth = 0;
        while (card && depth < 10) {
          // Look for a clickable element (link or button)
          const link = card.querySelector('a[href*="johfrah"]');
          if (link) {
            (link as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
            return true;
          }
          card = card.parentElement;
          depth++;
        }
      }
      return false;
    });
    
    if (!johfrahCardFound) {
      throw new Error('❌ Could not find Johfrah\'s actor card on the homepage');
    }
    
    console.log('✅ Found Johfrah\'s card');
    await page.waitForTimeout(1000);
    
    // Step 3: Click on Johfrah's card to go to detail page
    console.log('\n📍 Step 3: Clicking on Johfrah\'s card...');
    
    const detailPageUrl = await page.evaluate(() => {
      const allHeadings = Array.from(document.querySelectorAll('h2, h3, h4'));
      const johfrahHeading = allHeadings.find(h => 
        h.textContent?.toLowerCase().includes('johfrah')
      );
      
      if (johfrahHeading) {
        let card = johfrahHeading.parentElement;
        let depth = 0;
        while (card && depth < 10) {
          const link = card.querySelector('a[href*="johfrah"]') as HTMLAnchorElement;
          if (link) {
            link.click();
            return link.href;
          }
          card = card.parentElement;
          depth++;
        }
      }
      return null;
    });
    
    if (!detailPageUrl) {
      throw new Error('❌ Could not click on Johfrah\'s card');
    }
    
    console.log(`✅ Navigating to: ${detailPageUrl}`);
    
    // Wait for navigation to complete
    await page.waitForURL(url => url.toString().includes('johfrah'), { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Step 4: Identify ALL assigned demos
    console.log('\n📍 Step 4: Identifying all assigned demos for Johfrah...');
    
    const demos = await page.evaluate(() => {
      const demoElements: Array<{ title: string; audioUrl: string }> = [];
      
      // Look for demo buttons or audio players
      // Strategy 1: Find all audio elements
      const audioElements = Array.from(document.querySelectorAll('audio'));
      audioElements.forEach((audio, index) => {
        const src = audio.src || audio.querySelector('source')?.src;
        if (src) {
          // Try to find a title near this audio element
          let parent = audio.parentElement;
          let title = `Demo ${index + 1}`;
          let depth = 0;
          
          while (parent && depth < 5) {
            const heading = parent.querySelector('h3, h4, h5, p, span');
            if (heading && heading.textContent && heading.textContent.trim().length > 0) {
              title = heading.textContent.trim();
              break;
            }
            parent = parent.parentElement;
            depth++;
          }
          
          demoElements.push({ title, audioUrl: src });
        }
      });
      
      // Strategy 2: Look for play buttons with data attributes
      const playButtons = Array.from(document.querySelectorAll('[data-audio-url], [data-demo-url]'));
      playButtons.forEach((button, index) => {
        const audioUrl = button.getAttribute('data-audio-url') || button.getAttribute('data-demo-url');
        if (audioUrl) {
          const title = button.getAttribute('data-title') || 
                       button.getAttribute('aria-label') || 
                       button.textContent?.trim() || 
                       `Demo ${demoElements.length + index + 1}`;
          demoElements.push({ title, audioUrl });
        }
      });
      
      // Strategy 3: Look for links to mp3 files
      const mp3Links = Array.from(document.querySelectorAll('a[href*=".mp3"]'));
      mp3Links.forEach((link, index) => {
        const audioUrl = (link as HTMLAnchorElement).href;
        const title = link.textContent?.trim() || `Demo ${demoElements.length + index + 1}`;
        demoElements.push({ title, audioUrl });
      });
      
      return demoElements;
    });
    
    console.log(`✅ Found ${demos.length} demos for Johfrah\n`);
    
    if (demos.length === 0) {
      throw new Error('❌ No demos found for Johfrah on the detail page');
    }
    
    // Display all found demos
    console.log('📋 All demos found:');
    demos.forEach((demo, index) => {
      console.log(`   ${index + 1}. ${demo.title}`);
      console.log(`      URL: ${demo.audioUrl}`);
    });
    
    // Step 5: Verify each demo file
    console.log('\n📍 Step 5: Verifying demo files...\n');
    
    const results: DemoCheckResult[] = [];
    const demosToTest = Math.min(demos.length, 5); // Test at least 5 or all if less
    
    for (let i = 0; i < demos.length; i++) {
      const demo = demos[i];
      const shouldTest = i < demosToTest;
      
      console.log(`\n🎵 Demo ${i + 1}/${demos.length}: ${demo.title}`);
      console.log(`   URL: ${demo.audioUrl}`);
      
      const result: DemoCheckResult = {
        demoTitle: demo.title,
        audioUrl: demo.audioUrl,
        isReachable: false,
        httpStatus: null,
        tested: shouldTest,
      };
      
      // Check if file is reachable via HEAD request
      try {
        const response = await page.evaluate(async (url) => {
          try {
            const res = await fetch(url, { method: 'HEAD' });
            return { status: res.status, ok: res.ok };
          } catch (error) {
            return { status: 0, ok: false, error: String(error) };
          }
        }, demo.audioUrl);
        
        result.httpStatus = response.status;
        result.isReachable = response.ok;
        
        if (response.ok) {
          console.log(`   ✅ File is reachable (HTTP ${response.status})`);
        } else {
          console.log(`   ❌ File is NOT reachable (HTTP ${response.status})`);
          result.error = `HTTP ${response.status}`;
        }
      } catch (error) {
        console.log(`   ❌ Error checking file: ${error}`);
        result.error = String(error);
      }
      
      // Test playback for first 5 demos
      if (shouldTest && result.isReachable) {
        console.log(`   🎧 Testing playback...`);
        
        try {
          // Try to play the audio
          const playbackResult = await page.evaluate(async (url) => {
            return new Promise((resolve) => {
              const audio = new Audio(url);
              
              audio.addEventListener('canplay', () => {
                audio.play().then(() => {
                  setTimeout(() => {
                    audio.pause();
                    resolve({ success: true, message: 'Audio played successfully' });
                  }, 1000);
                }).catch(err => {
                  resolve({ success: false, message: `Play failed: ${err}` });
                });
              });
              
              audio.addEventListener('error', (e) => {
                resolve({ success: false, message: `Audio error: ${audio.error?.message}` });
              });
              
              // Timeout after 5 seconds
              setTimeout(() => {
                resolve({ success: false, message: 'Timeout waiting for audio' });
              }, 5000);
              
              audio.load();
            });
          }, demo.audioUrl);
          
          if (playbackResult.success) {
            console.log(`   ✅ Playback successful`);
          } else {
            console.log(`   ❌ Playback failed: ${playbackResult.message}`);
            result.error = playbackResult.message;
          }
        } catch (error) {
          console.log(`   ❌ Playback test error: ${error}`);
          result.error = String(error);
        }
        
        await page.waitForTimeout(500);
      }
      
      results.push(result);
    }
    
    // Step 6: Generate final report
    console.log('\n' + '='.repeat(80));
    console.log('📊 JOHFRAH DEMO VERIFICATION REPORT');
    console.log('='.repeat(80) + '\n');
    
    console.log(`Total demos found: ${results.length}`);
    console.log(`Demos tested for playback: ${results.filter(r => r.tested).length}\n`);
    
    const allReachable = results.every(r => r.isReachable);
    const allTested = results.filter(r => r.tested).every(r => r.isReachable && !r.error);
    const brokenDemos = results.filter(r => !r.isReachable || r.error);
    
    console.log(`✅ All demos reachable: ${allReachable ? 'YES' : 'NO'}`);
    console.log(`✅ All tested demos playable: ${allTested ? 'YES' : 'NO'}\n`);
    
    if (brokenDemos.length > 0) {
      console.log('⚠️  BROKEN DEMO LINKS:\n');
      brokenDemos.forEach(demo => {
        console.log(`   ❌ ${demo.demoTitle}`);
        console.log(`      URL: ${demo.audioUrl}`);
        console.log(`      Status: HTTP ${demo.httpStatus || 'N/A'}`);
        if (demo.error) console.log(`      Error: ${demo.error}`);
        console.log('');
      });
    }
    
    // Final verdict
    console.log('='.repeat(80));
    if (allReachable && allTested && brokenDemos.length === 0) {
      console.log('✅ VERIFIED LIVE: All of Johfrah\'s demos have valid, reachable audio files.');
      console.log(`   Total demos: ${results.length}`);
      console.log(`   Tested: ${results.filter(r => r.tested).length}`);
      console.log(`   All files: HTTP 200 OK`);
    } else {
      console.log('❌ ISSUES FOUND: Some demos are broken or unreachable.');
      console.log(`   Broken demos: ${brokenDemos.length}/${results.length}`);
    }
    console.log('='.repeat(80) + '\n');
    
    await browser.close();
    
    process.exit(brokenDemos.length > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    if (browser) await browser.close();
    process.exit(1);
  }
}

verifyJohfrahDemos();
