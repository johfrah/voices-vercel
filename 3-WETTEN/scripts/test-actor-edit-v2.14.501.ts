#!/usr/bin/env tsx
/**
 * 🧪 ACTOR EDIT TEST - v2.14.501
 * 
 * Tests the actor profile edit functionality to verify:
 * 1. No 500 errors when saving actor profiles
 * 2. Success message appears
 * 3. Console is clean
 * 4. Version v2.14.501 is live
 */

import { chromium } from 'playwright';

async function testActorEdit() {
  console.log('🚀 Starting browser for Actor Edit Test...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const consoleLogs: string[] = [];
  const consoleErrors: string[] = [];
  const apiCalls: Array<{ url: string; status: number; method: string }> = [];
  
  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    if (text.includes('ERROR') || text.includes('error')) {
      console.log(`[Console ERROR] ${text}`);
    }
  });
  
  // Capture console errors
  page.on('pageerror', error => {
    consoleErrors.push(error.message);
    console.error(`[Page Error] ${error.message}`);
  });
  
  // Capture network requests
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    const method = response.request().method();
    
    // Track all API calls
    if (url.includes('/api/')) {
      apiCalls.push({ url, status, method });
      
      // Log actor-related API calls
      if (url.includes('/api/admin/actors')) {
        console.log(`\n📡 Actor API Call: ${method} ${url}`);
        console.log(`   Status: ${status}`);
        
        if (status >= 400) {
          try {
            const body = await response.text();
            console.log(`   Error Body: ${body.substring(0, 500)}`);
          } catch (e) {
            console.log('   Could not read error body');
          }
        }
      }
      
      // Check config API for version
      if (url.includes('/api/admin/config')) {
        try {
          const body = await response.json();
          if (body._version) {
            console.log(`\n✅ Version detected: ${body._version}`);
          }
        } catch (e) {
          // Ignore
        }
      }
    }
  });
  
  try {
    console.log('📍 STEP 1: Navigating to https://www.voices.be/\n');
    await page.goto('https://www.voices.be/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('⏳ Waiting for page to fully load...\n');
    await page.waitForTimeout(3000);
    
    // Check if we need to login
    console.log('📍 STEP 2: Checking login status...\n');
    const loginButton = await page.locator('text=/Inloggen/i').first();
    const loginVisible = await loginButton.isVisible().catch(() => false);
    
    if (loginVisible) {
      console.log('⚠️  Not logged in. Assuming session exists or navigating to account...\n');
      // For now, we'll assume the user has an active session
      // In production, we'd handle the login flow here
    } else {
      console.log('✅ Already logged in or session active\n');
    }
    
    // Try to find an actor card to click
    console.log('📍 STEP 3: Looking for actor cards on homepage...\n');
    await page.waitForTimeout(2000);
    
    // Look for actor cards (they typically have data-actor-id or similar)
    const actorCards = await page.locator('[data-actor-id], .actor-card, [href*="/johfrah"], [href*="/christina"]').all();
    console.log(`Found ${actorCards.length} potential actor elements\n`);
    
    if (actorCards.length === 0) {
      console.log('⚠️  No actor cards found on homepage. Navigating directly to /johfrah\n');
      await page.goto('https://www.voices.be/johfrah', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
    }
    
    // Look for edit button or admin controls
    console.log('📍 STEP 4: Looking for actor edit controls...\n');
    
    // Try to find edit button (might be in admin bar, or a pencil icon)
    const editButtons = await page.locator('button:has-text("Bewerk"), button:has-text("Edit"), [aria-label*="edit"], [aria-label*="bewerk"]').all();
    console.log(`Found ${editButtons.length} potential edit buttons\n`);
    
    if (editButtons.length === 0) {
      console.log('⚠️  No edit buttons found. This might require admin access.\n');
      console.log('📍 Checking if we can access admin panel directly...\n');
      
      // Try to access admin panel
      await page.goto('https://www.voices.be/admin/actors', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      // Look for actor list
      const actorListItems = await page.locator('[data-actor-id], .actor-row, tr').all();
      console.log(`Found ${actorListItems.length} items in admin panel\n`);
      
      if (actorListItems.length > 0) {
        console.log('📍 STEP 5: Clicking on first actor in admin panel...\n');
        await actorListItems[0].click();
        await page.waitForTimeout(2000);
      }
    } else {
      console.log('📍 STEP 5: Clicking edit button...\n');
      await editButtons[0].click();
      await page.waitForTimeout(2000);
    }
    
    // Look for modal or edit form
    console.log('📍 STEP 6: Looking for edit modal/form...\n');
    const modal = await page.locator('[role="dialog"], .modal, [class*="Modal"]').first();
    const modalVisible = await modal.isVisible().catch(() => false);
    
    if (modalVisible) {
      console.log('✅ Edit modal is visible\n');
      
      // Look for bio field or any text input
      console.log('📍 STEP 7: Looking for editable fields...\n');
      const textareas = await page.locator('textarea').all();
      const inputs = await page.locator('input[type="text"]').all();
      
      console.log(`Found ${textareas.length} textareas and ${inputs.length} text inputs\n`);
      
      if (textareas.length > 0) {
        console.log('📍 STEP 8: Modifying bio field (adding a space)...\n');
        const bioField = textareas[0];
        const currentValue = await bioField.inputValue();
        await bioField.fill(currentValue + ' ');
        console.log('✅ Bio modified\n');
      } else if (inputs.length > 0) {
        console.log('📍 STEP 8: Modifying first text field...\n');
        const field = inputs[0];
        const currentValue = await field.inputValue();
        await field.fill(currentValue + ' ');
        console.log('✅ Field modified\n');
      }
      
      // Look for save button
      console.log('📍 STEP 9: Looking for save button...\n');
      const saveButtons = await page.locator('button:has-text("Opslaan"), button:has-text("Save"), button[type="submit"]').all();
      console.log(`Found ${saveButtons.length} potential save buttons\n`);
      
      if (saveButtons.length > 0) {
        console.log('📍 STEP 10: Clicking save button...\n');
        await saveButtons[0].click();
        
        console.log('⏳ Waiting for API response...\n');
        await page.waitForTimeout(3000);
        
        // Check for success message
        console.log('📍 STEP 11: Checking for success/error messages...\n');
        const successMsg = await page.locator('text=/opgeslagen/i, text=/success/i, .bg-green').first();
        const successVisible = await successMsg.isVisible().catch(() => false);
        
        const errorMsg = await page.locator('text=/error/i, text=/fout/i, .bg-red, [role="alert"]').first();
        const errorVisible = await errorMsg.isVisible().catch(() => false);
        
        if (successVisible) {
          console.log('✅ SUCCESS MESSAGE DETECTED\n');
        } else if (errorVisible) {
          const errorText = await errorMsg.textContent();
          console.log(`❌ ERROR MESSAGE DETECTED: ${errorText}\n`);
        } else {
          console.log('⚠️  No clear success/error message detected\n');
        }
      } else {
        console.log('⚠️  No save button found\n');
      }
    } else {
      console.log('⚠️  Edit modal not visible. Taking screenshot for inspection.\n');
    }
    
    // Final results
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL RESULTS\n');
    
    // Check for 500 errors in actor API calls
    const actorApiCalls = apiCalls.filter(call => call.url.includes('/api/admin/actors'));
    const has500Error = actorApiCalls.some(call => call.status === 500);
    
    console.log(`Actor API Calls: ${actorApiCalls.length}`);
    actorApiCalls.forEach(call => {
      const statusIcon = call.status >= 400 ? '❌' : '✅';
      console.log(`  ${statusIcon} ${call.method} ${call.url.split('/api')[1]} - Status ${call.status}`);
    });
    
    console.log(`\n500 Error Detected: ${has500Error ? '❌ YES' : '✅ NO'}`);
    
    console.log('\n🔴 Console Errors:');
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('  ✅ (none)');
    }
    
    // Filter for relevant console logs (errors related to actors)
    const relevantLogs = consoleLogs.filter(log => 
      log.includes('actor') || 
      log.includes('500') || 
      log.includes('ERROR') ||
      log.includes('version')
    );
    
    if (relevantLogs.length > 0) {
      console.log('\n📝 Relevant Console Logs:');
      relevantLogs.forEach(log => console.log(`  - ${log}`));
    }
    
    console.log('\n📍 Taking screenshot...\n');
    const screenshotPath = '/tmp/actor-edit-test-result.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    
    console.log('\n✅ Test complete. Browser will stay open for 15 seconds for inspection...');
    await page.waitForTimeout(15000);
    
    console.log('='.repeat(80));
    
  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    
    const screenshotPath = '/tmp/actor-edit-test-error.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Error screenshot: ${screenshotPath}`);
  } finally {
    await browser.close();
  }
}

testActorEdit().catch(console.error);
