#!/usr/bin/env tsx
/**
 * 🧪 TEST MAGIC LINK CONFIRMATION
 * 
 * Tests the magic link confirmation and redirect flow
 */

import { chromium } from 'playwright';

async function testMagicLinkConfirm() {
  console.log('🚀 Starting magic link confirmation test\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const consoleLogs: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    if (text.includes('Auth') || text.includes('login') || text.includes('session')) {
      console.log(`[Console] ${text}`);
    }
  });
  
  try {
    const magicLinkUrl = 'https://www.voices.be/account/confirm?token=c551f55a3523f80ab750cde63b2bfae2b24a59a01f420efa45058a83&type=magiclink&redirect=/account';
    
    console.log('📍 Step 1: Navigating to magic link URL\n');
    console.log(`URL: ${magicLinkUrl}\n`);
    
    await page.goto(magicLinkUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('📍 Step 2: Waiting for redirect to /account...\n');
    
    // Wait for navigation to complete
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}\n`);
    
    console.log('📍 Step 3: Checking for login confirmation\n');
    
    // Check for email address
    const emailVisible = await page.locator('text=/johfrah@voices.be/i').isVisible().catch(() => false);
    
    // Check for "Admin" text
    const adminVisible = await page.locator('text=/admin/i').isVisible().catch(() => false);
    
    // Check for account/dashboard elements
    const accountElements = await page.locator('text=/account|dashboard|profiel|uitloggen/i').count();
    
    console.log('📍 Step 4: Login verification results\n');
    console.log('='.repeat(80));
    
    let loginSuccess = false;
    
    if (emailVisible) {
      console.log('✅ Email "johfrah@voices.be" found on page');
      loginSuccess = true;
    } else {
      console.log('❌ Email "johfrah@voices.be" NOT found');
    }
    
    if (adminVisible) {
      console.log('✅ "Admin" text found on page');
      loginSuccess = true;
    } else {
      console.log('⚠️  "Admin" text NOT found');
    }
    
    if (accountElements > 0) {
      console.log(`✅ Found ${accountElements} account-related elements`);
      loginSuccess = true;
    }
    
    // Check URL
    if (currentUrl.includes('/account') || currentUrl.includes('/admin')) {
      console.log(`✅ Redirected to account area: ${currentUrl}`);
      loginSuccess = true;
    } else {
      console.log(`⚠️  Unexpected URL: ${currentUrl}`);
    }
    
    console.log('\n📊 FINAL RESULT:');
    if (loginSuccess) {
      console.log('✅ LOGIN SUCCESSFUL - User is authenticated');
    } else {
      console.log('❌ LOGIN FAILED - User is not authenticated');
    }
    
    console.log('='.repeat(80));
    
    console.log('\n📍 Step 5: Taking screenshot of dashboard\n');
    const screenshotPath = '/tmp/magic-link-dashboard.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    
    // Get page title and visible text
    const pageTitle = await page.title();
    console.log(`\nPage Title: ${pageTitle}`);
    
    // Look for key elements
    const bodyText = await page.locator('body').textContent();
    if (bodyText?.includes('johfrah')) {
      console.log('✅ Found "johfrah" in page content');
    }
    if (bodyText?.includes('Admin')) {
      console.log('✅ Found "Admin" in page content');
    }
    
    console.log('\n✅ Test complete. Browser will stay open for 15 seconds for inspection...');
    await page.waitForTimeout(15000);
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    
    const screenshotPath = '/tmp/magic-link-error.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Error screenshot: ${screenshotPath}`);
  } finally {
    await browser.close();
  }
}

testMagicLinkConfirm().catch(console.error);
