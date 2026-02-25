import puppeteer from 'puppeteer';

async function verifyLogo() {
  console.log('🔍 Starting verification of https://www.voices.be/');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capture console messages
  const consoleMessages: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    if (text.includes('[VoiceglotImage]')) {
      console.log('⚠️  Console:', text);
    }
  });
  
  // Navigate to the page
  await page.goto('https://www.voices.be/', { waitUntil: 'networkidle2' });
  
  console.log('\n📊 Verification Results:\n');
  
  // 1. Check version
  try {
    const configResponse = await page.goto('https://www.voices.be/api/admin/config');
    const configData = await configResponse?.json();
    const version = configData?.version || 'NOT FOUND';
    console.log(`✅ Version: ${version}`);
    
    const versionParts = version.replace('v', '').split('.');
    const major = parseInt(versionParts[0] || '0');
    const minor = parseInt(versionParts[1] || '0');
    const patch = parseInt(versionParts[2] || '0');
    
    if (major > 2 || (major === 2 && minor > 14) || (major === 2 && minor === 14 && patch >= 645)) {
      console.log('✅ Version is v2.14.645 or higher');
    } else {
      console.log('❌ Version is BELOW v2.14.645');
    }
  } catch (error) {
    console.log('❌ Could not fetch version:', error);
  }
  
  // Navigate back to main page
  await page.goto('https://www.voices.be/', { waitUntil: 'networkidle2' });
  
  // 2. Check logo in GlobalNav
  const logoData = await page.evaluate(() => {
    // Find the logo in GlobalNav
    const nav = document.querySelector('nav');
    const logoImg = nav?.querySelector('img[alt*="Voices"], img[alt*="Logo"], a[href="/"] img');
    
    if (!logoImg) {
      return { found: false, src: null, alt: null };
    }
    
    return {
      found: true,
      src: (logoImg as HTMLImageElement).src,
      currentSrc: (logoImg as HTMLImageElement).currentSrc,
      alt: (logoImg as HTMLImageElement).alt,
      naturalWidth: (logoImg as HTMLImageElement).naturalWidth,
      naturalHeight: (logoImg as HTMLImageElement).naturalHeight,
      complete: (logoImg as HTMLImageElement).complete,
      outerHTML: logoImg.outerHTML
    };
  });
  
  console.log('\n🖼️  Logo Status:');
  if (logoData.found) {
    console.log('✅ Logo element found in GlobalNav');
    console.log(`   Alt text: ${logoData.alt}`);
    console.log(`   Src: ${logoData.src}`);
    console.log(`   Complete: ${logoData.complete}`);
    console.log(`   Natural dimensions: ${logoData.naturalWidth}x${logoData.naturalHeight}`);
    
    // Check if src is relative path
    if (logoData.outerHTML?.includes('src="/assets/') || logoData.outerHTML?.includes("src='/assets/")) {
      console.log('✅ Logo uses relative path starting with /assets/');
    } else if (logoData.src?.startsWith('http')) {
      console.log('❌ Logo uses FULL URL instead of relative path');
    } else {
      console.log('⚠️  Logo src format unclear');
    }
    
    console.log(`\n   Full img tag: ${logoData.outerHTML}`);
  } else {
    console.log('❌ Logo NOT found in GlobalNav');
  }
  
  // 3. Check for VoiceglotImage errors
  console.log('\n🔍 Console Messages Check:');
  const voiceglotErrors = consoleMessages.filter(msg => msg.includes('[VoiceglotImage]'));
  if (voiceglotErrors.length > 0) {
    console.log(`❌ Found ${voiceglotErrors.length} [VoiceglotImage] messages:`);
    voiceglotErrors.forEach(err => console.log(`   - ${err}`));
  } else {
    console.log('✅ No [VoiceglotImage] errors found in console');
  }
  
  // Show all console messages for reference
  if (consoleMessages.length > 0) {
    console.log('\n📝 All Console Messages:');
    consoleMessages.forEach(msg => console.log(`   ${msg}`));
  }
  
  await browser.close();
  console.log('\n✅ Verification complete');
}

verifyLogo().catch(console.error);
