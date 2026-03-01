#!/usr/bin/env node
import puppeteer from 'puppeteer';

async function testStudioPage() {
  console.log('🎭 Testing Studio Page...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Enable console logging
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    });
    
    // Enable error tracking
    page.on('pageerror', error => {
      console.log(`❌ Page Error: ${error.message}`);
    });
    
    // Navigate to Studio page
    console.log('📍 Navigating to https://www.voices.be/studio...');
    const response = await page.goto('https://www.voices.be/studio', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log(`📡 Response Status: ${response?.status()}`);
    
    // Wait for page to fully load
    await page.waitForTimeout(2000);
    
    // Check for "Server Components render" error in page content
    const pageContent = await page.content();
    const hasServerError = pageContent.includes('Server Components render') || 
                          pageContent.includes('Error:');
    
    if (hasServerError) {
      console.log('❌ FOUND: Server Components render error in page content');
    } else {
      console.log('✅ NO Server Components render error detected');
    }
    
    // Check for workshops visibility
    const workshopsVisible = await page.evaluate(() => {
      // Look for workshop-related elements
      const workshopElements = document.querySelectorAll('[data-workshop], .workshop, [class*="workshop"]');
      return workshopElements.length > 0;
    });
    
    console.log(`🎓 Workshops visible: ${workshopsVisible ? '✅ YES' : '❌ NO'}`);
    
    // Check for any visible error messages
    const errorMessages = await page.evaluate(() => {
      const errors: string[] = [];
      const errorElements = document.querySelectorAll('[class*="error"], [role="alert"]');
      errorElements.forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.length > 0) {
          errors.push(text);
        }
      });
      return errors;
    });
    
    if (errorMessages.length > 0) {
      console.log('❌ Visible Error Messages:');
      errorMessages.forEach(msg => console.log(`   - ${msg}`));
    } else {
      console.log('✅ No visible error messages');
    }
    
    // Check page title
    const title = await page.title();
    console.log(`📄 Page Title: ${title}`);
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: '/tmp/studio-page-test.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved to /tmp/studio-page-test.png');
    
    // Final summary
    console.log('\n============================================================');
    console.log('📊 STUDIO PAGE TEST SUMMARY');
    console.log('============================================================');
    console.log(`Status Code:           ${response?.status()}`);
    console.log(`Server Error:          ${hasServerError ? '❌ FOUND' : '✅ CLEAN'}`);
    console.log(`Workshops Visible:     ${workshopsVisible ? '✅ YES' : '❌ NO'}`);
    console.log(`Error Messages:        ${errorMessages.length > 0 ? '❌ FOUND' : '✅ NONE'}`);
    console.log('============================================================\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testStudioPage().catch(console.error);
