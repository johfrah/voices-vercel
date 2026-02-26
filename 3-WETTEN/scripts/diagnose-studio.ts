#!/usr/bin/env tsx
/**
 * 🔍 Studio Diagnostic Script
 * Quick check to see what's actually being served
 */

import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🔍 Diagnosing /studio/quiz...\n');
  
  // Capture all network requests
  const responses: any[] = [];
  page.on('response', async (response) => {
    if (response.url().includes('studio/quiz')) {
      responses.push({
        url: response.url(),
        status: response.status(),
        headers: Object.fromEntries(
          Object.entries(await response.allHeaders()).filter(([k]) => 
            k.startsWith('x-voices') || k === 'content-type'
          )
        )
      });
    }
  });
  
  // Capture console
  const logs: string[] = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  
  try {
    await page.goto('https://www.voices.be/studio/quiz', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    await page.waitForTimeout(3000);
    
    // Get page title and body text
    const title = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    const html = await page.content();
    
    console.log('📄 Page Title:', title);
    console.log('\n📝 Body Text (first 500 chars):');
    console.log(bodyText);
    console.log('\n🌐 Network Responses:');
    console.log(JSON.stringify(responses, null, 2));
    console.log('\n📋 Console Logs:');
    logs.forEach(log => console.log(log));
    
    // Check for specific elements
    console.log('\n🔎 Element Check:');
    console.log('- Video element:', await page.locator('video').count());
    console.log('- Buttons:', await page.locator('button').count());
    console.log('- H1:', await page.locator('h1').count());
    
    // Check if it's an error page
    const hasError = html.includes('Error') || html.includes('error') || html.includes('404');
    console.log('- Has error keywords:', hasError);
    
    // Save HTML for inspection
    const fs = await import('fs');
    fs.writeFileSync('/tmp/studio-quiz-debug.html', html);
    console.log('\n💾 Full HTML saved to /tmp/studio-quiz-debug.html');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

diagnose();
