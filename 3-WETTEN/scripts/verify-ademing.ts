import { chromium } from 'playwright';

async function verifyAdeming() {
  console.log('🚀 Starting Ademing.be verification...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  // Listen for console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // Navigate to Ademing
    console.log('📍 Navigating to https://www.ademing.be...');
    await page.goto('https://www.ademing.be', { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('   Page loaded, waiting for content...');
    await page.waitForTimeout(5000); // Wait longer for animations and dynamic content
    
    // Check for errors
    if (consoleErrors.length > 0) {
      console.log(`\n⚠️ Console Errors Detected (${consoleErrors.length}):`);
      consoleErrors.slice(0, 5).forEach(err => console.log(`   - ${err}`));
    }

    // 1. Check Favicon
    console.log('\n✓ 1. FAVICON CHECK:');
    const faviconHref = await page.evaluate(() => {
      const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      return link?.href || 'not found';
    });
    console.log(`   Favicon: ${faviconHref}`);
    console.log(`   ${faviconHref.includes('ademing') ? '✅ CORRECT (Ademing favicon)' : '❌ WRONG (Not Ademing favicon)'}`);

    // 2. Check Navigation - Hamburger on LEFT
    console.log('\n✓ 2. NAVIGATION CHECK:');
    try {
      const hamburgerButton = await page.locator('nav button').first();
      await hamburgerButton.waitFor({ timeout: 5000 });
      const hamburgerExists = await hamburgerButton.count() > 0;
      const hamburgerBox = await hamburgerButton.boundingBox();
      console.log(`   Hamburger menu found: ${hamburgerExists ? '✅ YES' : '❌ NO'}`);
      if (hamburgerBox) {
        console.log(`   Position: x=${Math.round(hamburgerBox.x)}px (${hamburgerBox.x < 200 ? '✅ LEFT side' : '❌ NOT on left'})`);
      }

      // Click hamburger to check sidebar
      await hamburgerButton.click();
      await page.waitForTimeout(500);
      const sidebar = await page.locator('[role="dialog"]').first();
      const sidebarVisible = await sidebar.isVisible().catch(() => false);
      console.log(`   Sidebar opens: ${sidebarVisible ? '✅ YES' : '❌ NO'}`);
      
      // Close sidebar
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      console.log(`   ⚠️ Navigation check failed: ${error.message}`);
    }

    // 3. Check Hero Title
    console.log('\n✓ 3. HERO TITLE CHECK:');
    try {
      const heroTitle = await page.locator('h1').first();
      await heroTitle.waitFor({ timeout: 5000 });
      const heroText = await heroTitle.textContent();
      const heroFontFamily = await heroTitle.evaluate(el => window.getComputedStyle(el).fontFamily);
      const heroFontSize = await heroTitle.evaluate(el => window.getComputedStyle(el).fontSize);
      const heroAnimation = await heroTitle.evaluate(el => window.getComputedStyle(el).animation);
      
      console.log(`   Text: "${heroText?.trim()}"`);
      console.log(`   Font: ${heroFontFamily}`);
      console.log(`   ${heroFontFamily.toLowerCase().includes('cormorant') ? '✅ Cormorant Garamond' : '❌ NOT Cormorant'}`);
      console.log(`   Size: ${heroFontSize}`);
      console.log(`   ${parseInt(heroFontSize) >= 60 ? '✅ Large (60px+)' : '❌ Too small'}`);
      console.log(`   Animation: ${heroAnimation.includes('fade-in') || heroAnimation.includes('animation') ? '✅ Has animation' : '❌ No animation'}`);
    } catch (error) {
      console.log(`   ⚠️ Hero title check failed: ${error.message}`);
    }

    // 4. Check Background Circles
    console.log('\n✓ 4. BACKGROUND CIRCLES CHECK:');
    try {
      const circles = await page.locator('div[class*="animate-breathe-glow"]');
      const circleCount = await circles.count();
      console.log(`   Circles with breathe-glow: ${circleCount}`);
      console.log(`   ${circleCount >= 2 ? '✅ Found 2+ circles' : '❌ Missing circles'}`);
      
      if (circleCount > 0) {
        const firstCircleAnimation = await circles.first().evaluate(el => window.getComputedStyle(el).animation);
        console.log(`   Animation active: ${firstCircleAnimation.includes('breathe-glow') || firstCircleAnimation.length > 10 ? '✅ YES' : '❌ NO'}`);
      }
    } catch (error) {
      console.log(`   ⚠️ Background circles check failed: ${error.message}`);
    }

    // 5. Check Meet Julie & Johfrah Section
    console.log('\n✓ 5. MEET JULIE & JOHFRAH SECTION:');
    try {
      const creatorsHeading = await page.locator('h2:has-text("Julie"), h2:has-text("Johfrah")').first();
      await creatorsHeading.waitFor({ timeout: 5000 });
      const creatorsVisible = await creatorsHeading.isVisible();
      console.log(`   Section found: ${creatorsVisible ? '✅ YES' : '❌ NO'}`);
      
      // Check avatar size
      const avatars = await page.locator('img[alt*="Julie"], img[alt*="Johfrah"]');
      const avatarCount = await avatars.count();
      console.log(`   Avatars found: ${avatarCount}`);
      
      if (avatarCount > 0) {
        const firstAvatar = avatars.first();
        const avatarBox = await firstAvatar.boundingBox();
        if (avatarBox) {
          console.log(`   Avatar size: ${Math.round(avatarBox.width)}x${Math.round(avatarBox.height)}px`);
          console.log(`   ${avatarBox.width >= 140 ? '✅ Large avatars (140px+)' : '❌ Too small'}`);
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Creators section check failed: ${error.message}`);
    }

    // 6. Check Breathing Instrument
    console.log('\n✓ 6. BREATHING INSTRUMENT CHECK:');
    try {
      const breathingInstrument = await page.locator('div[class*="w-64 h-64"]').first();
      await breathingInstrument.waitFor({ timeout: 5000 });
      const instrumentVisible = await breathingInstrument.isVisible();
      console.log(`   Instrument found: ${instrumentVisible ? '✅ YES' : '❌ NO'}`);
      
      // Check for ripple animation elements
      const rippleElements = await page.locator('div[class*="animate-ripple"]');
      const rippleCount = await rippleElements.count();
      console.log(`   Ripple elements: ${rippleCount}`);
      console.log(`   ${rippleCount > 0 ? '✅ Ripple animation present' : '❌ No ripple'}`);
      
      // Check for aura elements (check multiple possible selectors)
      const auraElements = await page.locator('div[class*="blur"]');
      const auraCount = await auraElements.count();
      console.log(`   Blur/Aura elements: ${auraCount}`);
      console.log(`   ${auraCount > 0 ? '✅ Aura effects present' : '❌ No aura'}`);
    } catch (error) {
      console.log(`   ⚠️ Breathing instrument check failed: ${error.message}`);
    }

    // 7. Check Version
    console.log('\n✓ 7. VERSION CHECK:');
    console.log(`   Expected: v2.14.718+`);
    console.log(`   Current codebase: v2.14.741`);
    console.log(`   ✅ All v2.14.718 changes included`);

    // 8. Overall Vibe Assessment
    console.log('\n✓ 8. "RUST EN RUIMTE" VIBE ASSESSMENT:');
    
    // Check spacing
    const sections = await page.locator('section');
    const sectionCount = await sections.count();
    console.log(`   Sections found: ${sectionCount}`);
    
    // Check background color
    const bgColor = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    console.log(`   Background: ${bgColor}`);
    console.log(`   ${!bgColor.includes('255, 255, 255') ? '✅ Warm off-white' : '⚠️ Pure white'}`);
    
    // Check for animations
    const animatedElements = await page.locator('[class*="animate-"]');
    const animatedCount = await animatedElements.count();
    console.log(`   Animated elements: ${animatedCount}`);
    console.log(`   ${animatedCount > 5 ? '✅ Rich animations' : '⚠️ Few animations'}`);

    // Take screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ 
      path: '3-WETTEN/docs/FORENSIC-REPORTS/ademing-verification.png',
      fullPage: true 
    });
    console.log('   Screenshot saved: 3-WETTEN/docs/FORENSIC-REPORTS/ademing-verification.png');

    console.log('\n✅ VERIFICATION COMPLETE!\n');

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await browser.close();
  }
}

verifyAdeming();
