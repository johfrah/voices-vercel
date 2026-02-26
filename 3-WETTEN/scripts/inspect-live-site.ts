/**
 * Live Site Inspector
 * Navigates to voices.be and captures console logs, errors, and page state
 */

import puppeteer from 'puppeteer';

async function inspectLiveSite() {
  console.log('🔍 Starting live site inspection...\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Show browser for visibility
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Capture console logs
    const consoleLogs: Array<{ type: string; text: string }> = [];
    
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      consoleLogs.push({ type, text });
      console.log(`[CONSOLE ${type.toUpperCase()}]:`, text);
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      console.log('[PAGE ERROR]:', error.message);
      consoleLogs.push({ type: 'error', text: `PAGE ERROR: ${error.message}` });
    });

    // Navigate to the site
    console.log('📍 Navigating to https://www.voices.be...\n');
    await page.goto('https://www.voices.be', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait a bit for any delayed console logs
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check for voice actor grid
    const hasVoiceActorGrid = await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="voice-actor-grid"]') || 
                   document.querySelector('.voice-actor-grid') ||
                   document.querySelector('[class*="ActorGrid"]');
      return !!grid;
    });

    // Check for actors on the page
    const actorCount = await page.evaluate(() => {
      const actors = document.querySelectorAll('[data-testid="actor-card"]') ||
                     document.querySelectorAll('[class*="ActorCard"]');
      return actors.length;
    });

    // Take screenshots
    await page.screenshot({ 
      path: '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/scripts/screenshots/live-site-full.png',
      fullPage: true 
    });

    console.log('\n📊 INSPECTION RESULTS:\n');
    console.log('='.repeat(60));
    console.log(`Voice Actor Grid Present: ${hasVoiceActorGrid ? '✅' : '❌'}`);
    console.log(`Actor Cards Found: ${actorCount}`);
    console.log('\n📝 Console Logs Summary:');
    console.log('='.repeat(60));
    
    // Check for specific logs
    const versionLog = consoleLogs.find(log => log.text.includes('Version:') || log.text.includes('Nuclear Version:'));
    const lengthError = consoleLogs.find(log => 
      log.text.includes("Cannot read properties of undefined (reading 'length')")
    );

    if (versionLog) {
      console.log(`✅ Version Log Found: ${versionLog.text}`);
    } else {
      console.log('❌ Version log NOT found');
    }

    if (lengthError) {
      console.log(`⚠️  Length Error Found: ${lengthError.text}`);
    } else {
      console.log('✅ No length errors detected');
    }

    console.log('\n📋 All Console Logs:');
    console.log('='.repeat(60));
    consoleLogs.forEach((log, index) => {
      console.log(`${index + 1}. [${log.type.toUpperCase()}] ${log.text}`);
    });

    console.log('\n✅ Inspection complete. Browser will remain open for 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (error) {
    console.error('❌ Inspection failed:', error);
  } finally {
    await browser.close();
  }
}

inspectLiveSite();
