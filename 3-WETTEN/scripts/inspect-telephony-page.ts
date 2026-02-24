#!/usr/bin/env tsx
/**
 * 🔍 INSPECT TELEPHONY PAGE
 */

import { chromium } from 'playwright';

async function inspectTelephonyPage() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const consoleLogs: string[] = [];
  const consoleErrors: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    
    consoleLogs.push(`[${type}] ${text}`);
    
    if (type === 'error' || text.toLowerCase().includes('error')) {
      consoleErrors.push(text);
      console.log(`[ERROR] ${text}`);
    }
  });
  
  try {
    console.log('Step 1: Navigating to https://www.voices.be/johfrah/telephony\n');
    
    await page.goto('https://www.voices.be/johfrah/telephony', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log('Step 2: Waiting for page to load...\n');
    await page.waitForTimeout(5000);
    
    console.log('Step 3: Taking screenshot...\n');
    await page.screenshot({ path: '/tmp/telephony-inspect.png', fullPage: true });
    console.log('✅ Screenshot saved: /tmp/telephony-inspect.png\n');
    
    console.log('Step 4: Looking for specific elements...\n');
    
    // Check for va-agency-hero
    const heroElements = await page.locator('.va-agency-hero').count();
    console.log(`va-agency-hero elements: ${heroElements}`);
    
    // Check for va-container
    const containerElements = await page.locator('.va-container').count();
    console.log(`va-container elements: ${containerElements}`);
    
    console.log('\nStep 5: Looking for textarea...\n');
    
    const textareas = await page.locator('textarea').count();
    console.log(`Total textareas found: ${textareas}`);
    
    if (textareas > 0) {
      for (let i = 0; i < textareas; i++) {
        const textarea = page.locator('textarea').nth(i);
        const isVisible = await textarea.isVisible().catch(() => false);
        const placeholder = await textarea.getAttribute('placeholder').catch(() => null);
        const name = await textarea.getAttribute('name').catch(() => null);
        
        console.log(`  Textarea ${i + 1}:`);
        console.log(`    Visible: ${isVisible}`);
        console.log(`    Placeholder: ${placeholder || 'none'}`);
        console.log(`    Name: ${name || 'none'}`);
      }
    }
    
    // Also check for any input fields
    const inputs = await page.locator('input').count();
    console.log(`\nTotal input fields found: ${inputs}`);
    
    console.log('\nStep 6: Looking for headings...\n');
    
    // Get all h1 elements
    const h1Elements = await page.locator('h1').count();
    console.log(`H1 headings found: ${h1Elements}`);
    
    for (let i = 0; i < h1Elements; i++) {
      const h1Text = await page.locator('h1').nth(i).textContent();
      console.log(`  H1 ${i + 1}: ${h1Text?.trim()}`);
    }
    
    // Get all h2 elements
    const h2Elements = await page.locator('h2').count();
    console.log(`\nH2 headings found: ${h2Elements}`);
    
    for (let i = 0; i < Math.min(h2Elements, 5); i++) {
      const h2Text = await page.locator('h2').nth(i).textContent();
      console.log(`  H2 ${i + 1}: ${h2Text?.trim()}`);
    }
    
    console.log('\nStep 7: Console errors report...\n');
    
    if (consoleErrors.length === 0) {
      console.log('✅ No console errors detected');
    } else {
      console.log(`❌ Found ${consoleErrors.length} console errors:`);
      consoleErrors.forEach((err, idx) => {
        console.log(`\n  Error ${idx + 1}:`);
        console.log(`  ${err}`);
      });
    }
    
    // Additional info
    console.log('\n='.repeat(80));
    console.log('ADDITIONAL PAGE INFO:\n');
    
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);
    
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Check for forms
    const forms = await page.locator('form').count();
    console.log(`Forms found: ${forms}`);
    
    // Check for buttons
    const buttons = await page.locator('button').count();
    console.log(`Buttons found: ${buttons}`);
    
    if (buttons > 0) {
      console.log('\nFirst 5 buttons:');
      for (let i = 0; i < Math.min(buttons, 5); i++) {
        const buttonText = await page.locator('button').nth(i).textContent();
        const isVisible = await page.locator('button').nth(i).isVisible().catch(() => false);
        console.log(`  Button ${i + 1}: "${buttonText?.trim()}" (visible: ${isVisible})`);
      }
    }
    
    console.log('\n='.repeat(80));
    
    console.log('\n✅ Inspection complete. Browser will stay open for 15 seconds...');
    await page.waitForTimeout(15000);
    
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

inspectTelephonyPage().catch(console.error);
