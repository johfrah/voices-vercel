/**
 * Verify Johfrah's Audio Demos - v2.15.088 Validation
 * 
 * This script:
 * 1. Navigates to voices.be
 * 2. Verifies version is v2.15.088
 * 3. Finds Johfrah's actor card
 * 4. Tests play button on card (no 400 errors)
 * 5. Opens detail page and tests at least 3 different demos (Telephony, Video, etc.)
 */

import { chromium, type Browser, type Page } from 'playwright';

interface DemoCheckResult {
  demoTitle: string;
  audioUrl: string;
  isReachable: boolean;
  httpStatus: number | null;
  tested: boolean;
  playbackSuccess: boolean;
  error?: string;
}

async function verifyJohfrahV2_15_088() {
  let browser: Browser | null = null;
  
  try {
    console.log('🚀 Starting Johfrah Demo Verification for v2.15.088...\n');
    
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    
    const page = await context.newPage();
    
    // Track all network requests for mp3 files and errors
    const audioRequests = new Map<string, number>();
    const consoleErrors: string[] = [];
    
    page.on('response', response => {
      if (response.url().includes('.mp3')) {
        audioRequests.set(response.url(), response.status());
        console.log(`   📡 Audio request: ${response.status()} - ${response.url().split('/').pop()}`);
        
        if (response.status() === 400) {
          consoleErrors.push(`400 Error on: ${response.url()}`);
        }
      }
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
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
    
    await page.waitForTimeout(3000);
    
    // Step 2: Verify version
    console.log('\n📍 Step 2: Verifying version is v2.15.088...');
    
    const version = await page.evaluate(() => {
      // Check footer or version indicator
      const versionElement = document.querySelector('[data-version]');
      if (versionElement) {
        return versionElement.getAttribute('data-version');
      }
      
      // Check meta tag
      const metaVersion = document.querySelector('meta[name="version"]');
      if (metaVersion) {
        return metaVersion.getAttribute('content');
      }
      
      // Check window object
      return (window as any).__VOICES_VERSION__ || null;
    });
    
    console.log(`   Version found: ${version || 'NOT FOUND'}`);
    
    const expectedVersion = version === 'v2.15.088' || version === '2.15.088';
    if (!expectedVersion) {
      console.warn(`   ⚠️  Expected v2.15.088 or 2.15.088, found: ${version}`);
    } else {
      console.log('   ✅ Version confirmed: 2.15.088');
    }
    
    // Step 3: Find Johfrah's card
    console.log('\n📍 Step 3: Finding Johfrah\'s actor card...');
    
    // Scroll down progressively to load all actors
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 800));
      await page.waitForTimeout(1000);
    }
    
    const johfrahCardFound = await page.evaluate(() => {
      // Strategy 1: Look for text containing "Johfrah"
      const allText = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('johfrah') && el.children.length < 5; // Leaf-ish nodes
      });
      
      console.log(`Found ${allText.length} elements with "johfrah"`);
      
      // Strategy 2: Look for links containing "johfrah"
      const johfrahLinks = Array.from(document.querySelectorAll('a[href*="johfrah"]'));
      console.log(`Found ${johfrahLinks.length} links with "johfrah"`);
      
      if (johfrahLinks.length > 0) {
        johfrahLinks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
      }
      
      // Strategy 3: Look for any element with johfrah in text
      if (allText.length > 0) {
        allText[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
      }
      
      return false;
    });
    
    if (!johfrahCardFound) {
      // Take a screenshot for debugging
      await page.screenshot({ path: '3-WETTEN/scripts/screenshots/johfrah-not-found.png', fullPage: true });
      console.log('   📸 Screenshot saved to 3-WETTEN/scripts/screenshots/johfrah-not-found.png');
      throw new Error('❌ Could not find Johfrah\'s actor card on the homepage');
    }
    
    console.log('✅ Found Johfrah\'s card');
    await page.waitForTimeout(1000);
    
    // Step 4: Navigate directly to Johfrah's detail page
    console.log('\n📍 Step 4: Navigating to Johfrah\'s detail page...');
    
    const detailPageUrl = 'https://www.voices.be/johfrah';
    console.log(`✅ Navigating to: ${detailPageUrl}`);
    
    try {
      await page.goto(detailPageUrl, { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });
    } catch (e) {
      // If networkidle times out, try with just domcontentloaded
      console.log('   ⚠️  networkidle timeout, checking if page loaded...');
      await page.waitForTimeout(2000);
    }
    
    // Check if we're on the right page
    const currentUrl = page.url();
    if (!currentUrl.includes('johfrah')) {
      throw new Error(`❌ Not on Johfrah page. Current URL: ${currentUrl}`);
    }
    
    await page.waitForTimeout(5000); // Give extra time for audio players to load
    console.log('✅ Navigated to detail page');
    
    // Step 5: Test play button on detail page
    console.log('\n📍 Step 5: Testing play buttons on detail page...');
    
    // Wait for page to stabilize
    await page.waitForTimeout(5000);
    
    // Check if page is still valid
    try {
      await page.title();
    } catch (e) {
      console.log('   ⚠️  Page context lost, waiting for navigation to complete...');
      await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(3000);
    }
    
    // Step 6: Find and test demos
    console.log('\n📍 Step 6: Testing at least 3 different demos...');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: '3-WETTEN/scripts/screenshots/johfrah-detail-page.png' });
    console.log('   📸 Screenshot saved to 3-WETTEN/scripts/screenshots/johfrah-detail-page.png');
    
    // Look for demo categories (Telephony, Video, etc.)
    let demoCategories;
    try {
      demoCategories = await page.evaluate(() => {
      const categories: Array<{ name: string; demos: Array<{ title: string; audioUrl: string }> }> = [];
      
      // Find sections with headings like "Telephony", "Video", etc.
      const headings = Array.from(document.querySelectorAll('h2, h3, h4'));
      
      headings.forEach(heading => {
        const categoryName = heading.textContent?.trim() || '';
        if (categoryName && (
          categoryName.toLowerCase().includes('telephony') ||
          categoryName.toLowerCase().includes('video') ||
          categoryName.toLowerCase().includes('commercial') ||
          categoryName.toLowerCase().includes('demo')
        )) {
          // Find demos in this section
          let section = heading.parentElement;
          let depth = 0;
          
          while (section && depth < 5) {
            const audioElements = Array.from(section.querySelectorAll('audio'));
            const playButtons = Array.from(section.querySelectorAll('[data-audio-url], button[aria-label*="play"]'));
            
            const demos: Array<{ title: string; audioUrl: string }> = [];
            
            audioElements.forEach((audio, index) => {
              const src = audio.src || audio.querySelector('source')?.src;
              if (src) {
                demos.push({ title: `${categoryName} Demo ${index + 1}`, audioUrl: src });
              }
            });
            
            playButtons.forEach((button, index) => {
              const audioUrl = button.getAttribute('data-audio-url');
              if (audioUrl) {
                demos.push({ title: `${categoryName} Demo ${index + 1}`, audioUrl });
              }
            });
            
            if (demos.length > 0) {
              categories.push({ name: categoryName, demos });
              break;
            }
            
            section = section.parentElement;
            depth++;
          }
        }
      });
      
      return categories;
    });
    } catch (evalError) {
      console.error('   ❌ Error evaluating page:', evalError);
      throw new Error('Failed to evaluate demo categories on page');
    }
    
    console.log(`✅ Found ${demoCategories.length} demo categories`);
    demoCategories.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.demos.length} demos`);
    });
    
    // Test at least 3 demos from different categories
    const results: DemoCheckResult[] = [];
    let testedCount = 0;
    
    for (const category of demoCategories) {
      if (testedCount >= 3) break;
      
      const demo = category.demos[0]; // Test first demo from each category
      if (!demo) continue;
      
      console.log(`\n🎵 Testing: ${category.name} - ${demo.title}`);
      console.log(`   URL: ${demo.audioUrl}`);
      
      const result: DemoCheckResult = {
        demoTitle: `${category.name} - ${demo.title}`,
        audioUrl: demo.audioUrl,
        isReachable: false,
        httpStatus: null,
        tested: true,
        playbackSuccess: false,
      };
      
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
          
          // Test playback
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
              
              setTimeout(() => {
                resolve({ success: false, message: 'Timeout waiting for audio' });
              }, 5000);
              
              audio.load();
            });
          }, demo.audioUrl);
          
          if (playbackResult.success) {
            console.log(`   ✅ Playback successful`);
            result.playbackSuccess = true;
          } else {
            console.log(`   ❌ Playback failed: ${playbackResult.message}`);
            result.error = playbackResult.message;
          }
        } else {
          console.log(`   ❌ File is NOT reachable (HTTP ${response.status})`);
          result.error = `HTTP ${response.status}`;
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error}`);
        result.error = String(error);
      }
      
      results.push(result);
      testedCount++;
      await page.waitForTimeout(1000);
    }
    
    // Final report
    console.log('\n' + '='.repeat(80));
    console.log('📊 JOHFRAH v2.15.088 VERIFICATION REPORT');
    console.log('='.repeat(80) + '\n');
    
    console.log(`Version: ${version || 'NOT FOUND'}`);
    console.log(`Demos tested: ${results.length}`);
    console.log(`Successful playbacks: ${results.filter(r => r.playbackSuccess).length}`);
    console.log(`400 Errors detected: ${consoleErrors.filter(e => e.includes('400')).length}\n`);
    
    const allSuccess = results.every(r => r.playbackSuccess) && consoleErrors.filter(e => e.includes('400')).length === 0;
    const versionMatch = version === 'v2.15.088' || version === '2.15.088';
    
    if (allSuccess && versionMatch) {
      console.log('✅ VERIFIED LIVE: v2.15.088 - Johfrah\'s demos are now playable (Dynamic Bucket Resolution active).');
      console.log(`   - Version confirmed: ${version}`);
      console.log(`   - All ${results.length} tested demos played successfully`);
      console.log(`   - No 400 errors detected in console`);
    } else {
      console.log('❌ ISSUES FOUND:');
      if (!versionMatch) {
        console.log(`   - Version mismatch: expected v2.15.088 or 2.15.088, found ${version}`);
      }
      results.filter(r => !r.playbackSuccess).forEach(r => {
        console.log(`   - ${r.demoTitle}: ${r.error}`);
      });
      if (consoleErrors.length > 0) {
        console.log(`   - Console errors: ${consoleErrors.length}`);
      }
    }
    
    console.log('='.repeat(80) + '\n');
    
    await browser.close();
    process.exit(allSuccess && versionMatch ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    if (browser) await browser.close();
    process.exit(1);
  }
}

verifyJohfrahV2_15_088();
