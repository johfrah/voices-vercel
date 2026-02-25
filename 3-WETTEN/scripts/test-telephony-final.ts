#!/usr/bin/env tsx
/**
 * 🧪 FINAL TELEPHONY ORDER TEST
 */

import { chromium } from 'playwright';

async function testTelephonyFinal() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 400
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Step 1 & 2: Navigate and handle errors
    console.log('Step 1-2: Navigating and checking...');
    
    let pageLoaded = false;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (!pageLoaded && attempts < maxAttempts) {
      attempts++;
      console.log(`Attempt ${attempts}/${maxAttempts}...`);
      
      await page.goto('https://www.voices.be/johfrah/telephony', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      }).catch(() => console.log('Navigation timeout, continuing...'));
      
      await page.waitForTimeout(5000);
      
      // Check for errors
      const errorHeading = await page.locator('h1:has-text("Oeps")').isVisible().catch(() => false);
      const versionGuard = await page.locator('text=/version|reload|refresh/i').isVisible().catch(() => false);
      
      if (errorHeading || versionGuard) {
        console.log('Error detected, refreshing...');
        await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
        await page.waitForTimeout(5000);
        continue;
      }
      
      // Check if form loaded
      const textarea = await page.locator('textarea').isVisible().catch(() => false);
      if (textarea) {
        pageLoaded = true;
        console.log('✅ Page loaded successfully');
      } else {
        console.log('Form not visible, retrying...');
      }
    }
    
    if (!pageLoaded) {
      console.log('\n❌ GEFAALD: Pagina laadt niet correct na 3 pogingen');
      await browser.close();
      return;
    }
    
    // Step 3: Fill script
    console.log('Step 3: Filling script...');
    const textarea = await page.locator('textarea').first();
    const textareaVisible = await textarea.isVisible().catch(() => false);
    
    if (!textareaVisible) {
      console.log('\n❌ GEFAALD: Geen textarea gevonden - formulier niet geladen');
      await page.screenshot({ path: '/tmp/telephony-no-form.png' });
      await browser.close();
      return;
    }
    
    await textarea.fill('welkom bij voices.be');
    console.log('✅ Script filled');
    await page.waitForTimeout(1000);
    
    // Step 4: Click checkout button
    console.log('Step 4: Going to checkout...');
    const checkoutBtn = await page.locator('button:has-text("Bestellen"), button:has-text("Naar gegevens"), button:has-text("Doorgaan")').first();
    await checkoutBtn.click();
    await page.waitForTimeout(3000);
    
    // Step 5: Fill checkout form
    console.log('Step 5: Filling checkout form...');
    
    await page.locator('input[name="firstName"], input[placeholder*="Voornaam"]').fill('Johfrah').catch(() => {});
    await page.locator('input[name="lastName"], input[placeholder*="Achternaam"]').fill('Lefebvre').catch(() => {});
    await page.locator('input[type="email"]').fill('info@johfrah.be').catch(() => {});
    await page.locator('input[name="company"], input[placeholder*="Bedrijf"]').fill('Johfrah').catch(() => {});
    await page.locator('input[name="street"], input[placeholder*="Straat"]').fill('Deurnestraat 54').catch(() => {});
    await page.locator('input[name="postalCode"], input[name="zip"]').fill('2640').catch(() => {});
    await page.locator('input[name="city"], input[placeholder*="Stad"]').fill('Mortsel').catch(() => {});
    
    const countryField = await page.locator('select[name="country"]').first();
    if (await countryField.isVisible().catch(() => false)) {
      await countryField.selectOption({ label: 'België' }).catch(() => {});
    }
    
    console.log('✅ Form filled');
    await page.waitForTimeout(2000);
    
    // Step 6: Select bank transfer
    console.log('Step 6: Selecting payment method...');
    const bankTransfer = await page.locator('input[value*="transfer"], label:has-text("Overschrijving"), label:has-text("Factuur")').first();
    if (await bankTransfer.isVisible().catch(() => false)) {
      await bankTransfer.click();
      console.log('✅ Bank transfer selected');
    }
    await page.waitForTimeout(1000);
    
    // Step 7: Place order
    console.log('Step 7: Placing order...');
    const orderBtn = await page.locator('button:has-text("Bestelling plaatsen"), button:has-text("Bevestigen")').last();
    await orderBtn.click();
    await page.waitForTimeout(5000);
    
    // Step 8: Check result
    console.log('Step 8: Checking result...');
    
    const finalUrl = page.url();
    const successMsg = await page.locator('text=/bedankt|succes|bevestiging|bestelling ontvangen/i').isVisible().catch(() => false);
    const errorMsg = await page.locator('.bg-red-50, [role="alert"]').isVisible().catch(() => false);
    
    if (errorMsg) {
      const errorText = await page.locator('.bg-red-50, [role="alert"]').textContent();
      console.log(`\n❌ GEFAALD: ${errorText}`);
    } else if (successMsg || finalUrl.includes('bedankt') || finalUrl.includes('success')) {
      console.log('\n✅ GELUKT');
    } else {
      console.log(`\n❌ GEFAALD: Geen duidelijke bevestiging (URL: ${finalUrl})`);
    }
    
    await page.screenshot({ path: '/tmp/telephony-final.png' });
    await page.waitForTimeout(5000);
    
  } catch (error: any) {
    console.log(`\n❌ GEFAALD: ${error.message}`);
  } finally {
    await browser.close();
  }
}

testTelephonyFinal().catch(console.error);
