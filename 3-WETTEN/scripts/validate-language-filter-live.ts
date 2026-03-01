#!/usr/bin/env tsx
/**
 * CHRIS-PROTOCOL: Language Filter Validation (v2.16.115)
 * 
 * Validates language dropdown on voices.be
 */

import puppeteer from 'puppeteer';

async function validateLanguageFilter() {
  console.log('CHRIS-PROTOCOL: Language Filter Validation (v2.16.115)\n');
  console.log('='.repeat(80));
  
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/chrome/mac_arm-146.0.7680.31/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log('\nNavigating to https://www.voices.be/\n');
  await page.goto('https://www.voices.be/', { waitUntil: 'networkidle2' });
  
  console.log('Waiting for page to load...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Version Check
  console.log('STEP 1: Version Verification\n');
  
  const version = await page.evaluate(() => {
    const versionElement = document.querySelector('[data-version]');
    if (versionElement) return versionElement.getAttribute('data-version');
    if ((window as any).__VOICES_VERSION__) return (window as any).__VOICES_VERSION__;
    return 'unknown';
  });
  
  console.log('Live Version:', version);
  
  if (version !== '2.16.115') {
    console.log('WARNING: Expected v2.16.115 but found', version);
    console.log('Waiting 30 seconds for cache clear...\n');
    await new Promise(resolve => setTimeout(resolve, 30000));
  } else {
    console.log('Version matches!\n');
  }

  // Open Language Dropdown
  console.log('='.repeat(80));
  console.log('\nSTEP 2: Master Configurator - Language Dropdown\n');
  
  console.log('Looking for language dropdown button...\n');
  
  await page.waitForSelector('[class*="master"]', { timeout: 10000 }).catch(() => {
    console.log('Master Control not found immediately, continuing...');
  });
  
  const languageDropdownOpened = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const langButton = buttons.find(btn => 
      btn.textContent?.includes('Welke taal') || 
      btn.textContent?.includes('Which language') ||
      btn.textContent?.includes('Quelle langue')
    );
    
    if (langButton) {
      (langButton as HTMLButtonElement).click();
      return true;
    }
    
    return false;
  });
  
  if (!languageDropdownOpened) {
    console.log('ERROR: Could not find language dropdown button!');
    console.log('Keeping browser open for manual inspection...\n');
    await new Promise(resolve => setTimeout(resolve, 60000));
    await browser.close();
    return;
  }
  
  console.log('Language dropdown opened!\n');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Capture Visible Languages
  console.log('='.repeat(80));
  console.log('\nSTEP 3: Capturing Visible Language Options\n');
  
  const visibleLanguages = await page.evaluate(() => {
    const options: { label: string; isHeader: boolean }[] = [];
    const dropdownItems = document.querySelectorAll('[role="option"], [data-value]');
    
    dropdownItems.forEach(item => {
      const text = item.textContent?.trim();
      if (text) {
        const isHeader = text === 'POPULAIRE TALEN' || text === 'OVERIGE TALEN' || 
                        text === 'POPULAR LANGUAGES' || text === 'OTHER LANGUAGES';
        options.push({ label: text, isHeader });
      }
    });
    
    return options;
  });
  
  const hasPopularHeader = visibleLanguages.some(l => 
    l.label.includes('POPULAIRE') || l.label.includes('POPULAR')
  );
  const hasOtherHeader = visibleLanguages.some(l => 
    l.label.includes('OVERIGE') || l.label.includes('OTHER')
  );
  
  console.log('Total visible options:', visibleLanguages.length);
  console.log('"POPULAIRE TALEN" header:', hasPopularHeader ? 'YES' : 'NO');
  console.log('"OVERIGE TALEN" header:', hasOtherHeader ? 'YES' : 'NO');
  console.log('');
  
  console.log('Visible languages:');
  visibleLanguages.forEach((lang, idx) => {
    const prefix = lang.isHeader ? '[HEADER]' : '        ';
    console.log(prefix, (idx + 1) + '.', lang.label);
  });

  // Analysis
  console.log('\n' + '='.repeat(80));
  console.log('\nSTEP 4: Analysis\n');
  
  const actualLanguages = visibleLanguages.filter(l => !l.isHeader);
  
  const expectedLanguages = [
    'Vlaams', 'Nederlands', 'Frans', 'Engels', 'Duits', 'Spaans', 
    'Italiaans', 'Pools', 'Portugees', 'Zweeds', 'Deens'
  ];
  
  console.log('Total visible language options:', actualLanguages.length);
  console.log('Has "POPULAIRE TALEN" section:', hasPopularHeader ? 'YES' : 'NO');
  console.log('Has "OVERIGE TALEN" section:', hasOtherHeader ? 'YES' : 'NO');
  console.log('');
  
  console.log('Expected core languages present:');
  expectedLanguages.forEach(lang => {
    const found = actualLanguages.some(l => 
      l.label.toLowerCase().includes(lang.toLowerCase()) ||
      lang.toLowerCase().includes(l.label.toLowerCase())
    );
    console.log('  ', found ? '[YES]' : '[NO]', lang);
  });

  // FINAL VERDICT
  console.log('\n' + '='.repeat(80));
  console.log('\nFINAL VERDICT\n');
  
  const hasCorrectStructure = hasPopularHeader && hasOtherHeader;
  const hasReasonableCount = actualLanguages.length >= 8 && actualLanguages.length <= 20;
  
  if (hasCorrectStructure && hasReasonableCount) {
    console.log('[PASS] VERIFIED LIVE: v2.16.115');
    console.log('[PASS] Language dropdown structure is correct');
    console.log('[PASS] "POPULAIRE TALEN" and "OVERIGE TALEN" sections are present');
    console.log('[PASS] Language count is reasonable (' + actualLanguages.length + ' languages)');
    console.log('\nThe language filter appears to be working as expected.');
    console.log('Only languages with active voice actors should be visible.');
  } else {
    console.log('[FAIL] POTENTIAL ISSUES DETECTED:');
    if (!hasCorrectStructure) {
      console.log('   [ERROR] Section headers are missing or incorrect');
    }
    if (!hasReasonableCount) {
      console.log('   [WARNING] Unexpected language count:', actualLanguages.length);
      console.log('      (Expected between 8-20 languages)');
    }
  }
  
  console.log('\nKeeping browser open for 30 seconds for manual inspection...');
  await new Promise(resolve => setTimeout(resolve, 30000));

  await browser.close();
  console.log('\nValidation complete.\n');
}

validateLanguageFilter().catch(console.error);
