#!/usr/bin/env tsx
/**
 * 🔍 Logo Verification Script
 * Verifies logo implementation on live site
 */

async function verifyLogo() {
  console.log('🔍 LOGO VERIFICATION AUDIT\n');
  
  const urls = [
    'https://www.voices.be/',
    'https://www.voices.be/admin/'
  ];
  
  for (const url of urls) {
    console.log(`\n📍 Checking: ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        console.log(`❌ Failed to fetch: ${response.status}`);
        continue;
      }
      
      const html = await response.text();
      
      // Check for version
      const versionMatch = html.match(/Nuclear Version: v([\d.]+)/);
      if (versionMatch) {
        console.log(`✅ Version: v${versionMatch[1]}`);
      } else {
        console.log(`⚠️  Version not found in HTML`);
      }
      
      // Check for logo src patterns
      const logoMatches = html.match(/src="([^"]*logo[^"]*)"/gi);
      if (logoMatches) {
        console.log(`\n📸 Logo sources found:`);
        logoMatches.forEach((match, idx) => {
          const src = match.match(/src="([^"]*)"/)?.[1];
          if (src) {
            const isRelative = !src.startsWith('http') && !src.startsWith('//');
            const status = isRelative ? '✅ RELATIVE' : '⚠️  ABSOLUTE';
            console.log(`  ${idx + 1}. ${status}: ${src}`);
          }
        });
      } else {
        console.log(`⚠️  No logo sources found`);
      }
      
      // Check for ContainerInstrument wrapper
      const hasContainer = html.includes('va-container') || html.includes('ContainerInstrument');
      console.log(`\n🎁 Container wrapper: ${hasContainer ? '✅ Found' : '⚠️  Not detected'}`);
      
    } catch (error) {
      console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log('\n\n📊 VERIFICATION COMPLETE\n');
}

verifyLogo().catch(console.error);
