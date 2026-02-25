#!/usr/bin/env tsx
/**
 * 🧪 END-TO-END MAGIC LINK TEST
 */

import { chromium } from 'playwright';
import postgres from 'postgres';

async function e2eTest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Step 1-3: Request magic link
    console.log('Step 1-3: Requesting magic link...');
    await page.goto('https://www.voices.be/account/');
    await page.waitForTimeout(3000);
    
    await page.locator('input[type="email"]').fill('johfrah@voices.be');
    await page.locator('button[type="submit"]').click();
    
    // Step 4: Wait for success OR error
    console.log('Step 4: Waiting for response...');
    
    let successVisible = false;
    let errorVisible = false;
    
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(1000);
      successVisible = await page.locator('text=/Check je inbox/i').isVisible().catch(() => false);
      errorVisible = await page.locator('.bg-red-50').isVisible().catch(() => false);
      
      if (successVisible || errorVisible) break;
    }
    
    if (errorVisible) {
      const errorText = await page.locator('.bg-red-50').textContent();
      console.log(`\n❌ GEFAALD: Foutmelding verschenen: ${errorText}`);
      await browser.close();
      return;
    }
    
    if (!successVisible) {
      console.log('\n❌ GEFAALD: Geen succesmelding verschenen na 20 seconden');
      await browser.close();
      return;
    }
    
    console.log('✅ Success message appeared');
    
    // Step 5: Get link from database
    console.log('Step 5: Fetching link from Watchdog...');
    
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.log('\n❌ GEFAALD: DATABASE_URL niet gevonden in environment');
      await browser.close();
      return;
    }
    
    const sql = postgres(connectionString);
    
    // Wait a bit for the database to be updated
    await page.waitForTimeout(2000);
    
    const events = await sql`
      SELECT * FROM system_events 
      WHERE event_type = 'magic_link_sent'
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    await sql.end();
    
    if (events.length === 0) {
      console.log('\n❌ GEFAALD: Geen magic_link_sent event gevonden in system_events');
      await browser.close();
      return;
    }
    
    const event = events[0];
    const metadata = event.metadata as any;
    const magicLink = metadata?.link || metadata?.magic_link || metadata?.url;
    
    if (!magicLink) {
      console.log('\n❌ GEFAALD: Geen link gevonden in event metadata');
      console.log('Metadata:', metadata);
      await browser.close();
      return;
    }
    
    console.log('✅ Link found:', magicLink);
    
    // Step 6: Visit the link
    console.log('Step 6: Visiting magic link...');
    await page.goto(magicLink);
    await page.waitForTimeout(5000);
    
    // Step 7: Verify login
    console.log('Step 7: Verifying login...');
    
    const currentUrl = page.url();
    const isOnAccount = currentUrl.includes('/account');
    
    // Check for auth indicators
    const hasAuthIndicators = await page.locator('text=/johfrah|admin|uitloggen/i').count() > 0;
    
    if (isOnAccount && hasAuthIndicators) {
      console.log('\n✅ GELUKT');
      await page.screenshot({ path: '/tmp/e2e-success.png' });
    } else {
      console.log(`\n❌ GEFAALD: Niet ingelogd (URL: ${currentUrl}, Auth indicators: ${hasAuthIndicators})`);
      await page.screenshot({ path: '/tmp/e2e-failed.png' });
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error: any) {
    console.log(`\n❌ GEFAALD: ${error.message}`);
  } finally {
    await browser.close();
  }
}

e2eTest().catch(console.error);
