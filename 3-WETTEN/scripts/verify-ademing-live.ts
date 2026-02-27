/**
 * Forensic Browser Validation - Ademing.be Live Check
 * Verifies: Version, Font, Animation
 */

import { chromium } from 'playwright';

async function verifyAdemingLive() {
  console.log('🔍 Starting Ademing.be Live Verification...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    extraHTTPHeaders: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  
  const page = await context.newPage();
  
  try {
    // Hard refresh naar ademing.be (met cache bypass)
    console.log('📍 Navigating to https://www.ademing.be (cache bypass)...');
    await page.goto('https://www.ademing.be', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wacht op hydration
    await page.waitForTimeout(3000);
    
    console.log('✅ Page loaded\n');
    
    // 1. Check Version
    console.log('🔢 Checking version...');
    const version = await page.evaluate(() => {
      return (window as any).__VOICES_VERSION__;
    });
    
    console.log(`   Version: ${version}`);
    const isCorrectVersion = version === 'v2.15.087' || version === '2.15.087';
    console.log(`   Expected: v2.15.087 (or 2.15.087)`);
    console.log(`   Match: ${isCorrectVersion ? '✅' : '❌'}\n`);
    
    // 2. Check Logo Font
    console.log('🔤 Checking Ademing logo font...');
    
    // Screenshot voor debugging
    await page.screenshot({ path: '/tmp/ademing-screenshot.png', fullPage: false });
    console.log('   Screenshot saved to /tmp/ademing-screenshot.png');
    
    // Inspecteer de HTML structuur en CSS variabelen
    const htmlStructure = await page.evaluate(() => {
      const html = document.documentElement;
      const body = document.body;
      const computedHtml = window.getComputedStyle(html);
      
      return {
        htmlClasses: html.className,
        bodyClasses: body.className,
        cssVariables: {
          fontCormorant: computedHtml.getPropertyValue('--font-cormorant'),
          fontRaleway: computedHtml.getPropertyValue('--font-raleway')
        },
        hasHeader: !!document.querySelector('header'),
        hasNav: !!document.querySelector('nav')
      };
    });
    
    console.log('   HTML Classes:', htmlStructure.htmlClasses);
    console.log('   CSS Variables:', htmlStructure.cssVariables);
    
    // Inspecteer de computed style van het logo
    const fontInfo = await page.evaluate(() => {
      // Zoek naar het logo element in nav (niet header!)
      const possibleSelectors = [
        '[data-logo="ademing"]',
        'nav svg text',
        'nav [class*="logo"]',
        'nav [class*="Logo"]',
        'nav a[href="/"] span',
        'nav a[href="/"] div',
        'nav a[href="/"]'
      ];
      
      let logoElement: Element | null = null;
      for (const selector of possibleSelectors) {
        logoElement = document.querySelector(selector);
        if (logoElement) {
          console.log('Found logo with selector:', selector);
          break;
        }
      }
      
      if (!logoElement) {
        // Fallback: zoek naar eerste text element in nav
        const nav = document.querySelector('nav');
        if (nav) {
          // Zoek naar alle mogelijke logo containers
          const logoContainer = nav.querySelector('a[href="/"], [class*="logo"]');
          if (logoContainer) {
            // Zoek naar spans binnen het logo (de letters)
            const spans = logoContainer.querySelectorAll('span');
            if (spans.length > 0) {
              logoElement = spans[0]; // Pak de eerste letter
            } else {
              logoElement = logoContainer;
            }
          }
        }
      }
      
      if (!logoElement) {
        return { 
          error: 'Logo element not found',
          navHTML: document.querySelector('nav')?.innerHTML.substring(0, 500)
        };
      }
      
      const computed = window.getComputedStyle(logoElement);
      const fontFamily = computed.fontFamily;
      const fontWeight = computed.fontWeight;
      const fontSize = computed.fontSize;
      
      // Check of het verwijst naar CSS variabele
      const cssVarCheck = computed.getPropertyValue('font-family');
      
      return {
        fontFamily,
        fontWeight,
        fontSize,
        cssVarCheck,
        innerHTML: logoElement.innerHTML.substring(0, 100)
      };
    });
    
    console.log('   Font Family:', fontInfo.fontFamily);
    console.log('   Font Weight:', fontInfo.fontWeight);
    console.log('   Font Size:', fontInfo.fontSize);
    
    const usesCormorant = fontInfo.fontFamily?.includes('Cormorant') || 
                          fontInfo.fontFamily?.includes('cormorant');
    console.log(`   Uses Cormorant: ${usesCormorant ? '✅' : '❌'}\n`);
    
    // 3. Check Animation
    console.log('🎬 Checking breathing animation...');
    
    const animationInfo = await page.evaluate(() => {
      // Zoek naar geanimeerde elementen in het logo (in nav, niet header!)
      const nav = document.querySelector('nav');
      if (!nav) return { error: 'Nav not found' };
      
      // Zoek het logo element
      const logoContainer = nav.querySelector('a[href="/"], [class*="logo"]');
      if (!logoContainer) return { error: 'Logo container not found' };
      
      // Zoek naar alle spans of letters in het logo
      const animatedElements = Array.from(logoContainer.querySelectorAll('span[style*="animation"], [class*="animate"], [data-animate]'));
      
      if (animatedElements.length === 0) {
        // Check computed styles voor animatie op alle spans
        const allSpans = Array.from(logoContainer.querySelectorAll('span'));
        const animatedSpans = allSpans.filter(span => {
          const computed = window.getComputedStyle(span);
          return computed.animationName !== 'none' || computed.transform !== 'none';
        });
        
        return {
          animatedCount: animatedSpans.length,
          hasAnimation: animatedSpans.length > 0,
          totalSpans: allSpans.length,
          details: animatedSpans.slice(0, 3).map(span => ({
            text: span.textContent,
            animationName: window.getComputedStyle(span).animationName,
            animationDuration: window.getComputedStyle(span).animationDuration,
            transform: window.getComputedStyle(span).transform
          }))
        };
      }
      
      return {
        animatedCount: animatedElements.length,
        hasAnimation: true,
        totalSpans: animatedElements.length,
        details: animatedElements.slice(0, 3).map(el => ({
          text: el.textContent,
          animationName: window.getComputedStyle(el).animationName,
          animationDuration: window.getComputedStyle(el).animationDuration
        }))
      };
    });
    
    if (animationInfo.error) {
      console.log('   ❌ Error:', animationInfo.error);
    } else {
      console.log('   Total spans in logo:', animationInfo.totalSpans);
      console.log('   Animated elements found:', animationInfo.animatedCount);
      console.log('   Has animation:', animationInfo.hasAnimation ? '✅' : '❌');
      if (animationInfo.details && animationInfo.details.length > 0) {
        console.log('   Animation details:', JSON.stringify(animationInfo.details, null, 2));
      }
    }
    
    // Final Report
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL REPORT');
    console.log('='.repeat(60));
    console.log(`Version v2.15.087: ${isCorrectVersion ? '✅ LIVE' : '❌ NOT LIVE'}`);
    console.log(`Cormorant Font: ${usesCormorant ? '✅ ACTIVE' : '❌ NOT ACTIVE'}`);
    console.log(`Breathing Animation: ${animationInfo.hasAnimation ? '✅ ACTIVE' : '❌ NOT ACTIVE'}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

verifyAdemingLive().catch(console.error);
