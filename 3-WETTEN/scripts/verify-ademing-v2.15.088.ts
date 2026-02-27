import { chromium } from 'playwright';

async function verifyAdeming() {
  console.log('🔍 Starting verification of ademing.be...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📍 Navigating to https://www.ademing.be...');
    await page.goto('https://www.ademing.be', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Hard refresh to bypass cache
    console.log('🔄 Performing hard refresh...');
    await page.reload({ waitUntil: 'networkidle' });
    
    // Wait for page to be fully loaded
    await page.waitForTimeout(2000);
    
    // 1. Check version
    console.log('\n1️⃣ Checking version...');
    const version = await page.evaluate(() => {
      return (window as any).__VOICES_VERSION__;
    });
    console.log(`   ✅ Version: ${version}`);
    
    if (version === 'v2.15.088') {
      console.log('   ✅ CORRECT: Version v2.15.088 is live!');
    } else {
      console.log(`   ❌ MISMATCH: Expected v2.15.088, got ${version}`);
    }
    
    // 2. Check logo font
    console.log('\n2️⃣ Inspecting "ademing" logo font...');
    
    // Find the logo element - try multiple selectors
    const logoSelectors = [
      'h1.text-\\[80px\\]',
      'h1[class*="text-"]',
      'h1',
      '[class*="logo"]',
      'header h1'
    ];
    
    let logoElement = null;
    let usedSelector = '';
    
    for (const selector of logoSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.toLowerCase().includes('ademing')) {
            logoElement = element;
            usedSelector = selector;
            console.log(`   📍 Found logo using selector: ${selector}`);
            break;
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!logoElement) {
      console.log('   ⚠️  Could not find logo element. Trying to find any element with "ademing" text...');
      logoElement = await page.$('text=ademing');
      usedSelector = 'text=ademing';
    }
    
    if (logoElement) {
      // Get computed styles for the logo
      const fontInfo = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        
        const computed = window.getComputedStyle(element);
        return {
          fontFamily: computed.fontFamily,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          letterSpacing: computed.letterSpacing,
          textContent: element.textContent
        };
      }, usedSelector);
      
      console.log(`   📝 Logo text: "${fontInfo?.textContent}"`);
      console.log(`   🔤 Font Family: ${fontInfo?.fontFamily}`);
      console.log(`   📏 Font Size: ${fontInfo?.fontSize}`);
      console.log(`   💪 Font Weight: ${fontInfo?.fontWeight}`);
      console.log(`   📐 Letter Spacing: ${fontInfo?.letterSpacing}`);
      
      if (fontInfo?.fontFamily && fontInfo.fontFamily.toLowerCase().includes('cormorant')) {
        console.log('   ✅ CORRECT: Cormorant Garamond font is being used!');
      } else {
        console.log('   ❌ ISSUE: Cormorant Garamond NOT detected in font-family');
        console.log('   💡 Current font stack:', fontInfo?.fontFamily);
      }
      
      // 3. Check for animation
      console.log('\n3️⃣ Checking for breathing animation...');
      
      // Check if letters have animation classes or styles
      const animationInfo = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        
        const children = Array.from(element.children);
        const hasChildren = children.length > 0;
        
        if (hasChildren) {
          const firstChild = children[0] as HTMLElement;
          const computed = window.getComputedStyle(firstChild);
          const classes = firstChild.className;
          
          return {
            hasChildren,
            childCount: children.length,
            firstChildClasses: classes,
            animationName: computed.animationName,
            animationDuration: computed.animationDuration,
            transform: computed.transform
          };
        }
        
        return { hasChildren: false };
      }, usedSelector);
      
      if (animationInfo?.hasChildren) {
        console.log(`   📊 Logo has ${animationInfo.childCount} child elements (likely individual letters)`);
        console.log(`   🎨 First letter classes: ${animationInfo.firstChildClasses}`);
        console.log(`   🎬 Animation name: ${animationInfo.animationName}`);
        console.log(`   ⏱️  Animation duration: ${animationInfo.animationDuration}`);
        
        if (animationInfo.animationName !== 'none') {
          console.log('   ✅ CORRECT: Animation is active on the letters!');
        } else {
          console.log('   ⚠️  WARNING: No CSS animation detected');
        }
      } else {
        console.log('   ⚠️  Logo does not have child elements (letters might not be split)');
      }
      
      // Take a screenshot for visual verification
      await page.screenshot({ 
        path: '3-WETTEN/scripts/screenshots/ademing-v2.15.088-verification.png',
        fullPage: false 
      });
      console.log('\n📸 Screenshot saved to: 3-WETTEN/scripts/screenshots/ademing-v2.15.088-verification.png');
      
    } else {
      console.log('   ❌ ERROR: Could not find logo element on the page');
    }
    
    // Additional check: Look at the page source for font references
    console.log('\n4️⃣ Checking page source for Cormorant Garamond references...');
    const pageContent = await page.content();
    const hasCormorantInSource = pageContent.toLowerCase().includes('cormorant');
    console.log(`   ${hasCormorantInSource ? '✅' : '❌'} Cormorant found in page source: ${hasCormorantInSource}`);
    
    // Check for font loading
    const fontFaces = await page.evaluate(() => {
      const fonts = Array.from(document.fonts);
      return fonts.map(f => ({
        family: f.family,
        status: f.status,
        weight: f.weight,
        style: f.style
      }));
    });
    
    console.log('\n5️⃣ Loaded fonts:');
    fontFaces.forEach(font => {
      console.log(`   - ${font.family} (${font.weight}, ${font.style}): ${font.status}`);
    });
    
    const cormorantFont = fontFaces.find(f => f.family.toLowerCase().includes('cormorant'));
    if (cormorantFont) {
      console.log(`\n   ✅ Cormorant Garamond is loaded: ${cormorantFont.status}`);
    } else {
      console.log('\n   ❌ Cormorant Garamond NOT found in loaded fonts');
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await browser.close();
  }
}

verifyAdeming().catch(console.error);
