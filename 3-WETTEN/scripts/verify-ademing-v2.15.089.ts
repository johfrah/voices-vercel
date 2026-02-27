/**
 * Verificatie Script voor Ademing v2.15.089
 * 
 * Controleert:
 * 1. Versie v2.15.089 live
 * 2. Font 'Cormorant Garamond' op logo
 * 3. Ademhaling animatie actief
 */

import { chromium } from 'playwright';

async function verifyAdeming() {
  console.log('🔍 Starting Ademing v2.15.089 verification...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();

  try {
    // Hard refresh: disable cache
    await page.goto('https://www.ademing.be', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    // Wait a bit for initial render
    await page.waitForTimeout(2000);

    // Force hard refresh
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // Wait for page to stabilize
    await page.waitForTimeout(3000);

    console.log('✅ Page loaded\n');

    // 1. Check version
    const version = await page.evaluate(() => {
      return (window as any).__VOICES_VERSION__;
    });

    console.log('📦 VERSION CHECK:');
    console.log(`   Current version: ${version}`);
    console.log(`   Expected: v2.15.089`);
    console.log(`   Match: ${version === 'v2.15.089' ? '✅ YES' : '❌ NO'}\n`);

    // 2. Check logo font
    console.log('🔤 FONT CHECK (Ademing Logo):');
    
    // Find the logo element - it should have the breathing animation
    const logoSelector = '[class*="breathing"], .font-serif, [class*="logo"]';
    
    const fontInfo = await page.evaluate((selector) => {
      // Try multiple selectors to find the logo
      const possibleSelectors = [
        '[class*="breathing"]',
        '.font-serif',
        'h1.font-serif',
        '[class*="logo"]',
        'header h1',
        'header [class*="text"]'
      ];

      let element: Element | null = null;
      let usedSelector = '';

      for (const sel of possibleSelectors) {
        element = document.querySelector(sel);
        if (element) {
          usedSelector = sel;
          break;
        }
      }

      if (!element) {
        return { 
          found: false, 
          error: 'Logo element not found with any selector',
          triedSelectors: possibleSelectors 
        };
      }

      const computed = window.getComputedStyle(element);
      const fontFamily = computed.fontFamily;
      const classes = element.className;
      const text = element.textContent?.trim();

      // Check if letters have individual spans with font-serif
      const letters = element.querySelectorAll('.font-serif');
      const letterCount = letters.length;
      const letterFonts = Array.from(letters).slice(0, 3).map(letter => {
        const letterComputed = window.getComputedStyle(letter);
        return {
          text: letter.textContent,
          fontFamily: letterComputed.fontFamily,
          classes: letter.className
        };
      });

      return {
        found: true,
        selector: usedSelector,
        text,
        classes,
        fontFamily,
        hasCormorant: fontFamily.toLowerCase().includes('cormorant'),
        letterCount,
        letterFonts
      };
    }, logoSelector);

    if (fontInfo.found) {
      console.log(`   Element: ${fontInfo.selector}`);
      console.log(`   Text: "${fontInfo.text}"`);
      console.log(`   Classes: ${fontInfo.classes}`);
      console.log(`   Font Family: ${fontInfo.fontFamily}`);
      console.log(`   Cormorant Garamond: ${fontInfo.hasCormorant ? '✅ YES' : '❌ NO'}`);
      
      if (fontInfo.letterCount > 0) {
        console.log(`   Individual letters found: ${fontInfo.letterCount}`);
        console.log(`   Sample letter fonts:`);
        fontInfo.letterFonts.forEach((letter: any) => {
          console.log(`      "${letter.text}": ${letter.fontFamily} (${letter.classes})`);
        });
      }
    } else {
      console.log(`   ❌ ${fontInfo.error}`);
      console.log(`   Tried selectors: ${fontInfo.triedSelectors?.join(', ')}`);
    }
    console.log('');

    // 3. Check animation
    console.log('🌊 ANIMATION CHECK (Breathing):');
    
    const animationInfo = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="breathing"], .font-serif');
      
      if (elements.length === 0) {
        return { found: false, error: 'No elements with breathing class found' };
      }

      const results = Array.from(elements).slice(0, 5).map(el => {
        const computed = window.getComputedStyle(el);
        const animation = computed.animation || computed.webkitAnimation;
        const animationName = computed.animationName || computed.webkitAnimationName;
        const transform = computed.transform;
        
        return {
          classes: el.className,
          text: el.textContent?.trim().substring(0, 1),
          animation,
          animationName,
          transform,
          hasAnimation: animation !== 'none' && animation !== ''
        };
      });

      return {
        found: true,
        count: elements.length,
        results
      };
    });

    if (animationInfo.found) {
      console.log(`   Elements with breathing class: ${animationInfo.count}`);
      console.log(`   Sample animations:`);
      animationInfo.results.forEach((item: any, index: number) => {
        console.log(`      [${index + 1}] "${item.text}"`);
        console.log(`          Classes: ${item.classes}`);
        console.log(`          Animation: ${item.animation}`);
        console.log(`          Animation Name: ${item.animationName}`);
        console.log(`          Has Animation: ${item.hasAnimation ? '✅ YES' : '❌ NO'}`);
      });
    } else {
      console.log(`   ❌ ${animationInfo.error}`);
    }
    console.log('');

    // Take screenshot for visual verification
    const screenshotPath = '3-WETTEN/scripts/screenshots/ademing-v2.15.089-verification.png';
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: false 
    });
    console.log(`📸 Screenshot saved: ${screenshotPath}\n`);

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('SUMMARY:');
    console.log(`✓ Version: ${version === 'v2.15.089' ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`✓ Font: ${fontInfo.found && fontInfo.hasCormorant ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`✓ Animation: ${animationInfo.found && animationInfo.results.some((r: any) => r.hasAnimation) ? '✅ PASS' : '❌ FAIL'}`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

verifyAdeming().catch(console.error);
