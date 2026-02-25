#!/usr/bin/env tsx
/**
 * 🧪 TELEPHONY ORDER TEST
 */

import { chromium } from 'playwright';

async function testTelephonyOrder() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const consoleErrors: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.toLowerCase().includes('error') || text.toLowerCase().includes('failed')) {
      consoleErrors.push(text);
    }
  });
  
  try {
    // Step 1: Navigate to telephony page
    console.log('Step 1: Navigating to https://www.voices.be/johfrah/telephony');
    await page.goto('https://www.voices.be/johfrah/telephony', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await page.waitForTimeout(4000);
    
    // Step 2: Fill in briefing/script
    console.log('Step 2: Looking for script field...');
    
    // Try multiple selectors
    let scriptField = await page.locator('textarea').first();
    let scriptVisible = await scriptField.isVisible().catch(() => false);
    
    if (!scriptVisible) {
      scriptField = await page.locator('input[type="text"]').first();
      scriptVisible = await scriptField.isVisible().catch(() => false);
    }
    
    if (!scriptVisible) {
      scriptField = await page.locator('[contenteditable="true"]').first();
      scriptVisible = await scriptField.isVisible().catch(() => false);
    }
    
    if (!scriptVisible) {
      // Try any input field
      scriptField = await page.locator('input').first();
      scriptVisible = await scriptField.isVisible().catch(() => false);
    }
    
    if (!scriptVisible) {
      console.log('\n❌ GEFAALD: Geen script/briefing veld gevonden op de pagina');
      await page.screenshot({ path: '/tmp/telephony-no-field.png', fullPage: true });
      
      // Log what we can see
      const pageText = await page.textContent('body');
      console.log('Page content preview:', pageText?.substring(0, 200));
      
      await browser.close();
      return;
    }
    
    await scriptField.fill('welkom bij voices.be');
    console.log('✅ Script filled');
    await page.waitForTimeout(1000);
    
    // Step 3: Click order/checkout button
    console.log('Step 3: Looking for order button...');
    
    const orderButton = await page.locator('button:has-text("Bestellen"), button:has-text("Naar gegevens"), button:has-text("Doorgaan"), button:has-text("Checkout"), button[type="submit"]').first();
    const orderButtonVisible = await orderButton.isVisible().catch(() => false);
    
    if (!orderButtonVisible) {
      console.log('\n❌ GEFAALD: Geen bestelknop gevonden');
      await page.screenshot({ path: '/tmp/telephony-no-button.png' });
      await browser.close();
      return;
    }
    
    await orderButton.click();
    console.log('✅ Order button clicked');
    await page.waitForTimeout(3000);
    
    // Step 4: Fill in checkout form
    console.log('Step 4: Filling in checkout form...');
    
    const currentUrl = page.url();
    if (!currentUrl.includes('checkout') && !currentUrl.includes('gegevens')) {
      console.log(`⚠️  Not on checkout page yet (URL: ${currentUrl}), looking for form...`);
    }
    
    // Fill in all fields
    await page.locator('input[name="firstName"], input[placeholder*="Voornaam"], input[id*="firstName"]').fill('Johfrah').catch(() => {});
    await page.locator('input[name="lastName"], input[placeholder*="Achternaam"], input[id*="lastName"]').fill('Lefebvre').catch(() => {});
    await page.locator('input[name="email"], input[type="email"]').fill('info@johfrah.be').catch(() => {});
    await page.locator('input[name="company"], input[placeholder*="Bedrijf"]').fill('Johfrah').catch(() => {});
    await page.locator('input[name="street"], input[placeholder*="Straat"]').fill('Deurnestraat 54').catch(() => {});
    await page.locator('input[name="postalCode"], input[name="zip"], input[placeholder*="Postcode"]').fill('2640').catch(() => {});
    await page.locator('input[name="city"], input[placeholder*="Stad"]').fill('Mortsel').catch(() => {});
    
    // Select country
    const countryField = await page.locator('select[name="country"], input[name="country"]').first();
    const countryVisible = await countryField.isVisible().catch(() => false);
    if (countryVisible) {
      await countryField.selectOption({ label: 'België' }).catch(() => 
        countryField.selectOption({ value: 'BE' }).catch(() => 
          countryField.fill('België')
        )
      );
    }
    
    console.log('✅ Form filled');
    await page.waitForTimeout(2000);
    
    // Step 5: Select payment method "Overschrijving"
    console.log('Step 5: Selecting payment method "Overschrijving"...');
    
    const bankTransferOption = await page.locator('input[value*="transfer"], input[value*="banktransfer"], label:has-text("Overschrijving"), label:has-text("Factuur")').first();
    const bankTransferVisible = await bankTransferOption.isVisible().catch(() => false);
    
    if (bankTransferVisible) {
      await bankTransferOption.click();
      console.log('✅ Bank transfer selected');
    } else {
      console.log('⚠️  Bank transfer option not found, continuing...');
    }
    
    await page.waitForTimeout(1000);
    
    // Step 6: Click final order button
    console.log('Step 6: Clicking "Bestelling plaatsen"...');
    
    const finalOrderButton = await page.locator('button:has-text("Bestelling plaatsen"), button:has-text("Bevestigen"), button:has-text("Bestellen"), button[type="submit"]').last();
    const finalButtonVisible = await finalOrderButton.isVisible().catch(() => false);
    
    if (!finalButtonVisible) {
      console.log('\n❌ GEFAALD: Geen "Bestelling plaatsen" knop gevonden');
      await page.screenshot({ path: '/tmp/telephony-no-final-button.png' });
      await browser.close();
      return;
    }
    
    await finalOrderButton.click();
    console.log('✅ Final order button clicked');
    
    // Step 7: Wait for success message or redirect
    console.log('Step 7: Waiting for confirmation...');
    await page.waitForTimeout(5000);
    
    const finalUrl = page.url();
    
    // Check for success indicators
    const successMessage = await page.locator('text=/bedankt|succes|bevestiging|bestelling ontvangen/i').isVisible().catch(() => false);
    const isOnThankYouPage = finalUrl.includes('bedankt') || finalUrl.includes('success') || finalUrl.includes('bevestiging');
    
    // Check for error message
    const errorMessage = await page.locator('.bg-red-50, .text-red-500, [role="alert"]').first();
    const errorVisible = await errorMessage.isVisible().catch(() => false);
    
    if (errorVisible) {
      const errorText = await errorMessage.textContent();
      console.log(`\n❌ GEFAALD: Foutmelding: ${errorText}`);
      
      if (consoleErrors.length > 0) {
        console.log('\nConsole errors:');
        consoleErrors.forEach(err => console.log(`  - ${err}`));
      }
      
      await page.screenshot({ path: '/tmp/telephony-error.png' });
      await browser.close();
      return;
    }
    
    if (successMessage || isOnThankYouPage) {
      console.log('\n✅ GELUKT: Bestelling succesvol aangemaakt');
      await page.screenshot({ path: '/tmp/telephony-success.png' });
      await page.waitForTimeout(5000);
      await browser.close();
      return;
    }
    
    // Check if still on checkout (might indicate validation error)
    if (finalUrl.includes('checkout') || finalUrl.includes('telephony')) {
      console.log(`\n❌ GEFAALD: Nog steeds op checkout pagina, mogelijk validatiefout (URL: ${finalUrl})`);
      await page.screenshot({ path: '/tmp/telephony-stuck.png' });
      await browser.close();
      return;
    }
    
    // Unknown state
    console.log(`\n⚠️  ONDUIDELIJK: Geen duidelijke succes of fout (URL: ${finalUrl})`);
    await page.screenshot({ path: '/tmp/telephony-unknown.png' });
    await page.waitForTimeout(5000);
    
  } catch (error: any) {
    console.log(`\n❌ GEFAALD: ${error.message}`);
    await page.screenshot({ path: '/tmp/telephony-crash.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
}

testTelephonyOrder().catch(console.error);
