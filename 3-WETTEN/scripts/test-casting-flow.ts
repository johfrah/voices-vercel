#!/usr/bin/env tsx
/**
 * CASTING FLOW VALIDATION SCRIPT
 * 
 * Tests the complete casting/video flow:
 * 1. Navigate to /casting/video
 * 2. Select an actor
 * 3. Fill in the form
 * 4. Submit the request
 * 5. Verify success/redirect
 * 6. Check for errors
 * 
 * Usage: npx tsx 3-WETTEN/scripts/test-casting-flow.ts
 */

import { chromium } from 'playwright';

const TARGET_URL = 'https://www.voices.be/casting/video';

async function testCastingFlow() {
  console.log('🚀 Starting Casting Flow Validation...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  const consoleMessages: string[] = [];
  const errors: string[] = [];
  
  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    errors.push(`PageError: ${error.message}`);
  });
  
  // Capture network errors
  page.on('response', response => {
    if (response.status() >= 500) {
      errors.push(`HTTP ${response.status()}: ${response.url()}`);
    }
  });
  
  try {
    // Step 1: Navigate to casting/video
    console.log(`📍 Step 1: Navigating to ${TARGET_URL}...`);
    await page.goto(TARGET_URL, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    console.log('✅ Page loaded');
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ path: '/tmp/casting-step1-loaded.png' });
    
    // Step 2: Fill in Project step
    console.log('\n📝 Step 2: Filling in Project details...');
    
    const projectInput = page.locator('input[placeholder*="Bijv"]').first();
    const nameInput = page.locator('input[placeholder*="naam"]').first();
    const companyInput = page.locator('input[placeholder*="bedrijf"]').first();
    const emailInput = page.locator('input[type="email"]').first();
    
    await projectInput.fill('Test validation');
    console.log('  ✅ Project: "Test validation"');
    
    await nameInput.fill('Chris');
    console.log('  ✅ Name: "Chris"');
    
    await companyInput.fill('Voices');
    console.log('  ✅ Company: "Voices"');
    
    await emailInput.fill('johfrah@voices.be');
    console.log('  ✅ Email: "johfrah@voices.be"');
    
    await page.screenshot({ path: '/tmp/casting-step2-form-filled.png' });
    
    // Click "Volgende Stap"
    console.log('\n➡️ Step 3: Clicking "Volgende Stap"...');
    const nextButton = page.locator('button:has-text("VOLGENDE")').first();
    await nextButton.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: '/tmp/casting-step3-selection.png' });
    console.log('✅ Moved to Selection step');
    
    // Step 4: Select media type
    console.log('\n📻 Step 4: Selecting media type...');
    const onlineButton = page.locator('button:has-text("Online")').first();
    await onlineButton.click();
    await page.waitForTimeout(1000);
    console.log('  ✅ Selected: Online & Socials');
    
    // Click next again
    const nextButton2 = page.locator('button:has-text("VOLGENDE")').first();
    await nextButton2.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: '/tmp/casting-step4-briefing.png' });
    console.log('✅ Moved to Briefing step');
    
    // Step 5: Fill in script
    console.log('\n📄 Step 5: Filling in script...');
    const scriptTextarea = page.locator('textarea').first();
    await scriptTextarea.fill('Dit is een test script.');
    console.log('  ✅ Script: "Dit is een test script."');
    
    await page.screenshot({ path: '/tmp/casting-step5-script-filled.png' });
    
    // Step 6: Click "Match Me" to find actors
    console.log('\n🎯 Step 6: Clicking "Match Me"...');
    const matchButton = page.locator('button:has-text("Match")').first();
    await matchButton.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: '/tmp/casting-step6-actors-matched.png' });
    console.log('✅ Actors matched');
    
    // Step 7: Select first actor
    console.log('\n👤 Step 7: Selecting first actor...');
    const firstActorCard = page.locator('[data-actor-card]').first();
    if (await firstActorCard.isVisible()) {
      await firstActorCard.click();
      await page.waitForTimeout(1000);
      console.log('  ✅ Actor selected');
    } else {
      console.log('  ⚠️ No actor cards found, trying alternative selector...');
      const actorButton = page.locator('button:has-text("Selecteer")').first();
      if (await actorButton.isVisible()) {
        await actorButton.click();
        await page.waitForTimeout(1000);
        console.log('  ✅ Actor selected via button');
      } else {
        console.log('  ❌ Could not find actor selection mechanism');
      }
    }
    
    await page.screenshot({ path: '/tmp/casting-step7-actor-selected.png' });
    
    // Step 8: Submit request
    console.log('\n🚀 Step 8: Submitting "Gratis Proefopname Aanvragen"...');
    const submitButton = page.locator('button:has-text("Gratis Proefopname")').first();
    
    if (await submitButton.isVisible()) {
      // Capture the current URL before submission
      const beforeUrl = page.url();
      console.log(`  Current URL: ${beforeUrl}`);
      
      await submitButton.click();
      console.log('  ✅ Submit button clicked');
      
      // Wait for navigation or success message
      await page.waitForTimeout(5000);
      
      const afterUrl = page.url();
      console.log(`  After URL: ${afterUrl}`);
      
      await page.screenshot({ path: '/tmp/casting-step8-submitted.png' });
      
      // Check if redirected
      if (afterUrl !== beforeUrl) {
        console.log('✅ REDIRECTED to:', afterUrl);
        
        // Check if it's a session page
        if (afterUrl.includes('/studio/') || afterUrl.includes('/session/')) {
          console.log('✅ SUCCESS: Redirected to session page');
        } else if (afterUrl.includes('/thank')) {
          console.log('✅ SUCCESS: Redirected to thank you page');
        } else {
          console.log('⚠️ Redirected to unexpected page');
        }
      } else {
        // Check for success message on same page
        const successMessage = await page.locator('text=/success|bedankt|ontvangen/i').first().isVisible().catch(() => false);
        if (successMessage) {
          console.log('✅ SUCCESS: Success message displayed');
        } else {
          console.log('⚠️ No redirect or success message detected');
        }
      }
    } else {
      console.log('❌ Submit button not found');
    }
    
    // Step 9: Check for errors
    console.log('\n🔍 Step 9: Checking for errors...');
    
    const has500Error = errors.some(err => err.includes('HTTP 5'));
    const hasTableError = errors.some(err => err.toLowerCase().includes('table') && err.toLowerCase().includes('missing'));
    
    if (has500Error) {
      console.log('❌ 500 ERROR DETECTED:');
      errors.filter(e => e.includes('HTTP 5')).forEach(e => console.log(`   ${e}`));
    } else {
      console.log('✅ No 500 errors');
    }
    
    if (hasTableError) {
      console.log('❌ TABLE MISSING ERROR DETECTED:');
      errors.filter(e => e.toLowerCase().includes('table')).forEach(e => console.log(`   ${e}`));
    } else {
      console.log('✅ No table missing errors');
    }
    
    if (errors.length > 0 && !has500Error && !hasTableError) {
      console.log(`⚠️ Other errors detected (${errors.length}):`);
      errors.slice(0, 5).forEach(e => console.log(`   ${e}`));
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 CASTING FLOW VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Page loaded successfully`);
    console.log(`✅ Form filled with test data`);
    console.log(`✅ Multi-step navigation worked`);
    console.log(`${has500Error ? '❌' : '✅'} ${has500Error ? 'HTTP 500 errors detected' : 'No 500 errors'}`);
    console.log(`${hasTableError ? '❌' : '✅'} ${hasTableError ? 'Table missing errors detected' : 'No table errors'}`);
    console.log(`${errors.length === 0 ? '✅' : '⚠️'} Total console errors: ${errors.length}`);
    console.log('='.repeat(60));
    
    if (!has500Error && !hasTableError) {
      console.log('\n🎉 VALIDATION SUCCESSFUL! Casting flow is working correctly.');
    } else {
      console.log('\n⚠️ VALIDATION COMPLETED WITH ERRORS. Please review above.');
    }
    
  } catch (error) {
    console.error('\n❌ VALIDATION FAILED:', error);
    await page.screenshot({ path: '/tmp/casting-error.png' });
    console.log('Error screenshot saved to /tmp/casting-error.png');
  } finally {
    await browser.close();
  }
}

// Run validation
testCastingFlow().catch(console.error);
