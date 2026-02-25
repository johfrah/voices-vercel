#!/usr/bin/env tsx
/**
 * 🧪 CHECKOUT FLOW TEST
 */

import { chromium } from 'playwright';

async function testCheckout() {
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
    if (text.includes('error') || text.includes('Error') || text.includes('failed')) {
      consoleErrors.push(text);
      console.log(`[Console Error] ${text}`);
    }
  });
  
  try {
    // Step 1: Go to voices page
    console.log('Step 1: Navigating to https://www.voices.be/stemmen');
    await page.goto('https://www.voices.be/stemmen', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    }).catch(() => console.log('Page load timeout, continuing...'));
    await page.waitForTimeout(5000);
    
    // Step 2: Add voice actor to cart
    console.log('Step 2: Finding voice actors...');
    
    // Look for voice actor cards or demo buttons
    const voiceCards = await page.locator('[data-testid*="voice"], .voice-card, button:has-text("Demo")').count();
    
    if (voiceCards === 0) {
      console.log('\n❌ GEFAALD: Geen stemacteurs gevonden op /stemmen pagina');
      await browser.close();
      return;
    }
    
    console.log(`Found ${voiceCards} voice elements`);
    
    // Click first demo button or voice card
    const firstVoice = await page.locator('button:has-text("Demo"), [data-testid*="voice"]').first();
    await firstVoice.click();
    await page.waitForTimeout(3000);
    
    // Look for "Voeg toe" or "Bestel" button in modal/dock
    const addToCartButton = await page.locator('button:has-text("Voeg toe"), button:has-text("Toevoegen"), button:has-text("Bestel"), button:has-text("Bestellen")').first();
    const addButtonVisible = await addToCartButton.isVisible().catch(() => false);
    
    if (!addButtonVisible) {
      console.log('\n❌ GEFAALD: Geen "Voeg toe" knop gevonden in dock/modal');
      await page.screenshot({ path: '/tmp/no-add-button.png' });
      await browser.close();
      return;
    }
    
    await addToCartButton.click();
    await page.waitForTimeout(2000);
    
    console.log('✅ Voice actor added to cart');
    
    // Step 3: Go to checkout
    console.log('Step 3: Going to checkout...');
    
    // Look for cart icon or checkout button
    const checkoutButton = await page.locator('button:has-text("Checkout"), button:has-text("Afrekenen"), a:has-text("Winkelmandje"), [data-testid="cart"]').first();
    const checkoutVisible = await checkoutButton.isVisible().catch(() => false);
    
    if (!checkoutVisible) {
      // Try navigating directly
      await page.goto('https://www.voices.be/checkout');
    } else {
      await checkoutButton.click();
    }
    
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (!currentUrl.includes('checkout')) {
      console.log(`\n❌ GEFAALD: Niet op checkout pagina (URL: ${currentUrl})`);
      await browser.close();
      return;
    }
    
    console.log('✅ On checkout page');
    
    // Step 4: Fill in required fields
    console.log('Step 4: Filling in checkout form...');
    
    // Look for form fields
    const nameField = await page.locator('input[name="name"], input[placeholder*="Naam"], input[type="text"]').first();
    const emailField = await page.locator('input[name="email"], input[type="email"]').first();
    const companyField = await page.locator('input[name="company"], input[placeholder*="Bedrijf"]').first();
    
    await nameField.fill('Test User').catch(() => {});
    await emailField.fill('test@voices.be').catch(() => {});
    await companyField.fill('Test Company').catch(() => {});
    
    await page.waitForTimeout(1000);
    
    console.log('✅ Form filled');
    
    // Step 5: Click order button
    console.log('Step 5: Clicking order button...');
    
    const orderButton = await page.locator('button:has-text("Bestelling plaatsen"), button:has-text("Bestellen"), button:has-text("Betalen"), button[type="submit"]').first();
    const orderButtonVisible = await orderButton.isVisible().catch(() => false);
    
    if (!orderButtonVisible) {
      console.log('\n❌ GEFAALD: Geen bestelknop gevonden');
      await browser.close();
      return;
    }
    
    await orderButton.click();
    console.log('✅ Order button clicked');
    
    // Step 6: Wait for redirect or error
    console.log('Step 6: Waiting for redirect to Mollie or error message...');
    
    await page.waitForTimeout(5000);
    
    const finalUrl = page.url();
    
    // Check if redirected to Mollie
    if (finalUrl.includes('mollie.com') || finalUrl.includes('checkout.mollie')) {
      console.log('\n✅ GELUKT: Doorgestuurd naar Mollie');
      await page.screenshot({ path: '/tmp/checkout-mollie.png' });
      await page.waitForTimeout(5000);
      await browser.close();
      return;
    }
    
    // Check for error message
    const errorMessage = await page.locator('.bg-red-50, .text-red-500, [role="alert"]').first();
    const errorVisible = await errorMessage.isVisible().catch(() => false);
    
    if (errorVisible) {
      const errorText = await errorMessage.textContent();
      console.log(`\n❌ GEFAALD: Foutmelding verschenen: ${errorText}`);
      
      if (consoleErrors.length > 0) {
        console.log('\nConsole errors:');
        consoleErrors.forEach(err => console.log(`  - ${err}`));
      }
      
      await page.screenshot({ path: '/tmp/checkout-error.png' });
      await page.waitForTimeout(5000);
      await browser.close();
      return;
    }
    
    // No redirect and no error
    console.log(`\n❌ GEFAALD: Geen redirect naar Mollie en geen foutmelding (URL: ${finalUrl})`);
    await page.screenshot({ path: '/tmp/checkout-unknown.png' });
    await page.waitForTimeout(5000);
    
  } catch (error: any) {
    console.log(`\n❌ GEFAALD: ${error.message}`);
    await page.screenshot({ path: '/tmp/checkout-crash.png' });
  } finally {
    await browser.close();
  }
}

testCheckout().catch(console.error);
